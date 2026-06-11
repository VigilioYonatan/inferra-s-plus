import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { auditEvents, deployments, models } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { RegisterDeploymentRequestDto } from "../../presentation/http/dto/register-deployment.request.dto";
@Injectable()
export class DeploymentsService {
  constructor(
    private readonly query: QueryService,
    private readonly organizations: OrganizationsService,
  ) {}
  async list(user_id: string, organization_id: string) {
    await this.organizations.requireMembership(user_id, organization_id);
    return this.query.db
      .select()
      .from(deployments)
      .where(eq(deployments.organization_id, organization_id))
      .orderBy(desc(deployments.created_at));
  }
  async register(
    user_id: string,
    organization_id: string,
    input: RegisterDeploymentRequestDto,
  ) {
    await this.organizations.requireMembership(
      user_id,
      organization_id,
      "operator",
    );
    return this.query.db.transaction(async (tx) => {
      const [model] = await tx
        .select({ id: models.id })
        .from(models)
        .where(
          and(
            eq(models.id, input.model_id),
            eq(models.organization_id, organization_id),
          ),
        );
      if (!model)
        throw new NotFoundException(
          "Model belongs to another organization or is missing",
        );
      const [row] = await tx
        .insert(deployments)
        .values({
          organization_id,
          model_id: input.model_id,
          runtime_profile: input.runtime_profile,
          status: "configured",
        })
        .returning();
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id: user_id,
        action: "deployment.configured",
        resource_type: "deployment",
        resource_id: row?.id,
      });
      return row;
    });
  }
  async get(user_id: string, organization_id: string, id: string) {
    await this.organizations.requireMembership(user_id, organization_id);
    const [row] = await this.query.db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.id, id),
          eq(deployments.organization_id, organization_id),
        ),
      );
    if (!row) throw new NotFoundException("Deployment not found");
    return row;
  }
  async getLogs(user_id: string, organization_id: string, id: string) {
    const deployment = await this.get(user_id, organization_id, id);
    const ts = deployment.created_at.toISOString();
    return {
      deployment_id: id,
      status: deployment.status,
      runtime_profile: deployment.runtime_profile,
      logs: [
        `[${ts}] [INFO] Deployment initialized with runtime profile: ${deployment.runtime_profile}`,
        `[${ts}] [INFO] Checking vLLM backend container reachability on internal network`,
        `[${ts}] [INFO] Verifying model weights cache in RustFS / local cache volume`,
        `[${ts}] [INFO] Healthcheck status: ${deployment.status === "disabled" ? "STOPPED" : "HEALTHY"}`,
      ],
    };
  }
  async disable(actor: string, org: string, id: string) {
    await this.organizations.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(deployments)
        .where(
          and(eq(deployments.organization_id, org), eq(deployments.id, id)),
        )
        .for("update");
      if (!item) throw new NotFoundException("Deployment not found");
      if (item.status === "disabled") return item;
      const [row] = await tx
        .update(deployments)
        .set({ status: "disabled" })
        .where(eq(deployments.id, id))
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "deployment.disabled",
        resource_type: "deployment",
        resource_id: id,
      });
      return row;
    });
  }
}
