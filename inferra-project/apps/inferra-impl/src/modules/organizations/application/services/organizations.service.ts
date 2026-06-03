import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import {
  auditEvents,
  memberships,
  organizations,
  quotas,
  users,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import type { RegisterOrganizationRequestDto } from "../../presentation/http/dto/register-organization.request.dto";

const rolePower: Record<string, number> = {
  owner: 100,
  admin: 80,
  operator: 60,
  developer: 40,
  analyst: 20,
  viewer: 10,
};
@Injectable()
export class OrganizationsService {
  constructor(private readonly query: QueryService) {}
  async listMyOrganizations(user_id: string) {
    return this.query.db
      .select({
        id: organizations.id,
        slug: organizations.slug,
        name: organizations.name,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(
        organizations,
        eq(memberships.organization_id, organizations.id),
      )
      .where(eq(memberships.user_id, user_id));
  }
  async registerOrganization(
    user_id: string,
    input: RegisterOrganizationRequestDto,
  ) {
    try {
      return await this.query.db.transaction(async (tx) => {
        const [org] = await tx.insert(organizations).values(input).returning();
        if (!org) throw new Error("Creation failed");
        await tx
          .insert(memberships)
          .values({ user_id, organization_id: org.id, role: "owner" });
        await tx.insert(quotas).values({ organization_id: org.id });
        return org;
      });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new ConflictException("Slug taken");
      throw err;
    }
  }
  async requireMembership(
    user_id: string,
    organization_id: string,
    minRole:
      | "viewer"
      | "analyst"
      | "developer"
      | "operator"
      | "admin"
      | "owner" = "viewer",
  ) {
    const [membership] = await this.query.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.user_id, user_id),
          eq(memberships.organization_id, organization_id),
        ),
      )
      .limit(1);
    if (!membership) throw new NotFoundException("Organization not found");
    if ((rolePower[membership.role] || 0) < (rolePower[minRole] || 0))
      throw new ForbiddenException("Insufficient organization permission");
    return membership;
  }
  async getOrganization(user_id: string, id: string) {
    await this.requireMembership(user_id, id);
    const [org] = await this.query.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    if (!org) throw new NotFoundException();
    return org;
  }
  async listMembers(user_id: string, id: string) {
    await this.requireMembership(user_id, id, "admin");
    return this.query.db
      .select({
        user_id: memberships.user_id,
        role: memberships.role,
        created_at: memberships.created_at,
      })
      .from(memberships)
      .where(eq(memberships.organization_id, id))
      .orderBy(desc(memberships.created_at));
  }
  async addMember(
    actor_id: string,
    org_id: string,
    email: string,
    role: "admin" | "operator" | "developer" | "analyst" | "viewer",
  ) {
    await this.requireMembership(actor_id, org_id, "admin");
    const [target] = await this.query.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    if (!target)
      throw new NotFoundException(
        "Account not registered; user must register first",
      );
    try {
      return await this.query.db.transaction(async (tx) => {
        const [created] = await tx
          .insert(memberships)
          .values({ user_id: target.id, organization_id: org_id, role })
          .returning();
        if (!created)
          throw new BadRequestException("Failed to create membership");
        await tx.insert(auditEvents).values({
          organization_id: org_id,
          actor_id,
          action: "member.add",
          resource_type: "membership",
          resource_id: created.id,
          metadata: { role },
        });
        return created;
      });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new ConflictException("Already a member");
      throw err;
    }
  }
  async setMemberRole(
    actor_id: string,
    org_id: string,
    target_user_id: string,
    role: "admin" | "operator" | "developer" | "analyst" | "viewer",
  ) {
    await this.requireMembership(actor_id, org_id, "owner");
    return this.query.db.transaction(async (tx) => {
      const [target] = await tx
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.organization_id, org_id),
            eq(memberships.user_id, target_user_id),
          ),
        )
        .for("update")
        .limit(1);
      if (!target) throw new NotFoundException("Member not found");
      if (target.role === "owner")
        throw new ForbiddenException("Owner role cannot be changed here");
      const [changed] = await tx
        .update(memberships)
        .set({ role })
        .where(eq(memberships.id, target.id))
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org_id,
        actor_id,
        action: "member.role.change",
        resource_type: "membership",
        resource_id: target.id,
        metadata: { previous: target.role, next: role },
      });
      return changed;
    });
  }
  async removeMember(actor_id: string, org_id: string, target_user_id: string) {
    await this.requireMembership(actor_id, org_id, "admin");
    return this.query.db.transaction(async (tx) => {
      const [target] = await tx
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.organization_id, org_id),
            eq(memberships.user_id, target_user_id),
          ),
        )
        .for("update")
        .limit(1);
      if (!target) throw new NotFoundException("Member not found");
      if (target.role === "owner")
        throw new ForbiddenException(
          "Organization owner cannot be removed here",
        );
      if (target.role === "admin" && actor_id !== target_user_id) {
        const [actor] = await tx
          .select()
          .from(memberships)
          .where(
            and(
              eq(memberships.user_id, actor_id),
              eq(memberships.organization_id, org_id),
            ),
          );
        if (actor?.role !== "owner")
          throw new ForbiddenException("Only owner may remove other admins");
      }
      await tx.delete(memberships).where(eq(memberships.id, target.id));
      await tx.insert(auditEvents).values({
        organization_id: org_id,
        actor_id,
        action: "member.remove",
        resource_type: "membership",
        resource_id: target.id,
        metadata: { former_role: target.role },
      });
      return { ok: true };
    });
  }
  async updateOrganization(actor: string, org: string, name: string) {
    await this.requireMembership(actor, org, "owner");
    return this.query.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(organizations)
        .set({ name })
        .where(eq(organizations.id, org))
        .returning();
      if (!updated) throw new NotFoundException("Organization not found");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "organization.updated",
        resource_type: "organization",
        resource_id: org,
      });
      return updated;
    });
  }
}
