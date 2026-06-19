import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import {
  auditEvents,
  models,
  routingPolicies,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type {
  CreateRoutingPolicyRequestDto,
  UpdateRoutingPolicyRequestDto,
} from "../../presentation/http/dto/create-routing-policy.request.dto";
@Injectable()
export class RoutingPoliciesService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    return this.query.db
      .select()
      .from(routingPolicies)
      .where(eq(routingPolicies.organization_id, org))
      .orderBy(desc(routingPolicies.created_at));
  }
  async get(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const [row] = await this.query.db
      .select()
      .from(routingPolicies)
      .where(
        and(
          eq(routingPolicies.organization_id, org),
          eq(routingPolicies.id, id),
        ),
      );
    if (!row) throw new NotFoundException("Policy not found");
    return row;
  }
  async create(
    actor: string,
    org: string,
    input: CreateRoutingPolicyRequestDto,
  ) {
    await this.orgs.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [owned] = await tx
        .select({ id: models.id })
        .from(models)
        .where(
          and(eq(models.id, input.model_id), eq(models.organization_id, org)),
        );
      if (!owned) throw new NotFoundException("Model not found");
      const [prior] = await tx
        .select()
        .from(routingPolicies)
        .where(
          and(
            eq(routingPolicies.model_id, input.model_id),
            eq(routingPolicies.organization_id, org),
          ),
        );
      if (prior)
        throw new ConflictException("Model already has an admission policy");
      const [row] = await tx
        .insert(routingPolicies)
        .values({ organization_id: org, ...input })
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "routing.policy.created",
        resource_type: "routing_policy",
        resource_id: row?.id,
      });
      return row;
    });
  }
  async update(
    actor: string,
    org: string,
    id: string,
    input: UpdateRoutingPolicyRequestDto,
  ) {
    await this.orgs.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(routingPolicies)
        .set(input)
        .where(
          and(
            eq(routingPolicies.id, id),
            eq(routingPolicies.organization_id, org),
          ),
        )
        .returning();
      if (!row) throw new NotFoundException("Policy not found");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "routing.policy.updated",
        resource_type: "routing_policy",
        resource_id: id,
      });
      return row;
    });
  }
}
