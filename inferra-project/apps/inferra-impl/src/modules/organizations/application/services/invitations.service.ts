import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import nodemailer from "nodemailer";
import { env } from "../../../../config/env.schema";
import {
  auditEvents,
  invitations,
  memberships,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { digest, secureToken } from "../../../../shared/security/crypto";
import type { InviteMemberRequestDto } from "../../presentation/http/dto/invite-member.request.dto";
import { OrganizationsService } from "./organizations.service";
@Injectable()
export class InvitationsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    return this.query.db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        expires_at: invitations.expires_at,
        accepted_at: invitations.accepted_at,
        revoked_at: invitations.revoked_at,
        created_at: invitations.created_at,
      })
      .from(invitations)
      .where(eq(invitations.organization_id, org))
      .orderBy(desc(invitations.created_at))
      .limit(100);
  }
  async invite(actor: string, org: string, input: InviteMemberRequestDto) {
    await this.orgs.requireMembership(actor, org, "admin");
    if (!env.SMTP_URL || !env.SMTP_FROM)
      throw new ServiceUnavailableException("SMTP required");
    const token = secureToken(40);
    const hash = digest(token, "invite");
    const [row] = await this.query.db
      .insert(invitations)
      .values({
        organization_id: org,
        email: input.email,
        role: input.role,
        token_hash: hash,
        invited_by: actor,
        expires_at: new Date(Date.now() + 48 * 3600_000),
      })
      .returning({ id: invitations.id });
    if (!row) throw new Error("Invite insert failed");
    try {
      await nodemailer.createTransport(env.SMTP_URL).sendMail({
        from: env.SMTP_FROM,
        to: input.email,
        subject: "Invitación a Inferra",
        text: `Se te invitó a una organización de Inferra. Inicia sesión con ${input.email} y abre ${env.APP_ORIGIN}/invite/accept?token=${encodeURIComponent(token)}. La invitación caduca en 48 horas.`,
      });
    } catch {
      await this.query.db
        .update(invitations)
        .set({ revoked_at: new Date() })
        .where(eq(invitations.id, row.id));
      throw new ServiceUnavailableException("Could not deliver invitation");
    }
    await this.query.db.insert(auditEvents).values({
      organization_id: org,
      actor_id: actor,
      action: "invitation.sent",
      resource_type: "invitation",
      resource_id: row.id,
    });
    return { id: row.id, ok: true };
  }
  async accept(actor: string, email: string, token: string) {
    const token_hash = digest(token, "invite");
    return this.query.db.transaction(async (tx) => {
      const [invite] = await tx
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.token_hash, token_hash),
            gt(invitations.expires_at, new Date()),
            isNull(invitations.revoked_at),
            isNull(invitations.accepted_at),
          ),
        )
        .for("update");
      if (!invite || invite.email !== email.toLowerCase())
        throw new NotFoundException("Invitation invalid or expired");
      const [existing] = await tx
        .select({ id: memberships.id })
        .from(memberships)
        .where(
          and(
            eq(memberships.organization_id, invite.organization_id),
            eq(memberships.user_id, actor),
          ),
        );
      if (existing) throw new ConflictException("Already a member");
      await tx.insert(memberships).values({
        user_id: actor,
        organization_id: invite.organization_id,
        role: invite.role,
      });
      await tx
        .update(invitations)
        .set({ accepted_at: new Date() })
        .where(eq(invitations.id, invite.id));
      await tx.insert(auditEvents).values({
        organization_id: invite.organization_id,
        actor_id: actor,
        action: "invitation.accepted",
        resource_type: "invitation",
        resource_id: invite.id,
      });
      return { ok: true, organization_id: invite.organization_id };
    });
  }
  async revoke(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    const [row] = await this.query.db
      .update(invitations)
      .set({ revoked_at: new Date() })
      .where(
        and(
          eq(invitations.id, id),
          eq(invitations.organization_id, org),
          isNull(invitations.accepted_at),
          isNull(invitations.revoked_at),
        ),
      )
      .returning({ id: invitations.id });
    if (!row) throw new NotFoundException("Invitation not found");
    return { ok: true };
  }
}
