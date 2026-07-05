import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  auditEvents,
  webhookOutbox,
  webhookSubscriptions,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { secureToken } from "../../../../shared/security/crypto";
import { sealSecret } from "../../../../shared/security/sealed-secret";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import { validateWebhookUrl } from "../../domain/services/destination.policy";
import type { CreateWebhookRequestDto } from "../../presentation/http/dto/webhook.request.dto";
@Injectable()
export class WebhooksService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    return this.query.db
      .select({
        id: webhookSubscriptions.id,
        name: webhookSubscriptions.name,
        url: webhookSubscriptions.url,
        enabled: webhookSubscriptions.enabled,
        created_at: webhookSubscriptions.created_at,
      })
      .from(webhookSubscriptions)
      .where(
        and(
          eq(webhookSubscriptions.organization_id, org),
          isNull(webhookSubscriptions.revoked_at),
        ),
      )
      .orderBy(desc(webhookSubscriptions.created_at));
  }
  async create(actor: string, org: string, input: CreateWebhookRequestDto) {
    await this.orgs.requireMembership(actor, org, "admin");
    const url = validateWebhookUrl(input.url),
      secret = secureToken(32);
    const [row] = await this.query.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(webhookSubscriptions)
        .values({
          organization_id: org,
          name: input.name,
          url,
          secret_encrypted: sealSecret(secret),
        })
        .returning({
          id: webhookSubscriptions.id,
          name: webhookSubscriptions.name,
          url: webhookSubscriptions.url,
          enabled: webhookSubscriptions.enabled,
        });
      if (!created) throw new BadRequestException("Failed to create webhook");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "webhook.created",
        resource_type: "webhook",
        resource_id: created.id,
      });
      return [created];
    });
    return { ...row, signing_secret: secret };
  }
  async get(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    const [row] = await this.query.db
      .select({
        id: webhookSubscriptions.id,
        name: webhookSubscriptions.name,
        url: webhookSubscriptions.url,
        enabled: webhookSubscriptions.enabled,
        created_at: webhookSubscriptions.created_at,
      })
      .from(webhookSubscriptions)
      .where(
        and(
          eq(webhookSubscriptions.organization_id, org),
          eq(webhookSubscriptions.id, id),
          isNull(webhookSubscriptions.revoked_at),
        ),
      );
    if (!row) throw new NotFoundException("Webhook not found");
    return row;
  }
  async update(actor: string, org: string, id: string, enabled: boolean) {
    await this.orgs.requireMembership(actor, org, "admin");
    const [row] = await this.query.db
      .update(webhookSubscriptions)
      .set({ enabled })
      .where(
        and(
          eq(webhookSubscriptions.organization_id, org),
          eq(webhookSubscriptions.id, id),
          isNull(webhookSubscriptions.revoked_at),
        ),
      )
      .returning({
        id: webhookSubscriptions.id,
        enabled: webhookSubscriptions.enabled,
      });
    if (!row) throw new NotFoundException("Webhook not found");
    return row;
  }
  async revoke(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    const [row] = await this.query.db
      .update(webhookSubscriptions)
      .set({ revoked_at: new Date(), enabled: false })
      .where(
        and(
          eq(webhookSubscriptions.organization_id, org),
          eq(webhookSubscriptions.id, id),
          isNull(webhookSubscriptions.revoked_at),
        ),
      )
      .returning({ id: webhookSubscriptions.id });
    if (!row) throw new NotFoundException("Webhook not found");
    return { ok: true };
  }
  async test(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "admin");
    const item = await this.get(actor, org, id);
    if (!item.enabled) throw new NotFoundException("Webhook not enabled");
    await this.query.db.insert(webhookOutbox).values({
      organization_id: org,
      subscription_id: id,
      event_type: "webhook.test",
      payload: { message: "Test event from Inferra", issued_by: actor },
    });
    return { queued: true };
  }
  async deliveries(actor: string, org: string, id: string) {
    await this.get(actor, org, id);
    return this.query.db
      .select({
        id: webhookOutbox.id,
        event_type: webhookOutbox.event_type,
        attempts: webhookOutbox.attempts,
        delivered_at: webhookOutbox.delivered_at,
        dead_at: webhookOutbox.dead_at,
        last_error: webhookOutbox.last_error,
        created_at: webhookOutbox.created_at,
      })
      .from(webhookOutbox)
      .where(
        and(
          eq(webhookOutbox.organization_id, org),
          eq(webhookOutbox.subscription_id, id),
        ),
      )
      .orderBy(desc(webhookOutbox.created_at))
      .limit(50);
  }
}
