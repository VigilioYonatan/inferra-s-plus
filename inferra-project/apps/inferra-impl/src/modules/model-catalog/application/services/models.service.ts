import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  auditEvents,
  models,
  modelVersions,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { RegisterModelRequestDto } from "../../presentation/http/dto/register-model.request.dto";
@Injectable()
export class ModelsService {
  constructor(
    private readonly query: QueryService,
    private readonly organizationsService: OrganizationsService,
  ) {}
  async listModels(organization_id: string) {
    return this.query.db
      .select({
        id: models.id,
        public_name: models.public_name,
        context_window: models.context_window,
        enabled: models.enabled,
        created_at: models.created_at,
      })
      .from(models)
      .where(eq(models.organization_id, organization_id))
      .orderBy(desc(models.created_at));
  }
  async listModelsAuthorized(user_id: string, organization_id: string) {
    await this.organizationsService.requireMembership(user_id, organization_id);
    return this.listModels(organization_id);
  }
  async registerModel(
    user_id: string,
    organization_id: string,
    input: RegisterModelRequestDto,
  ) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "operator",
    );
    try {
      return await this.query.db.transaction(async (tx) => {
        const [row] = await tx
          .insert(models)
          .values({ organization_id, ...input })
          .returning();
        if (!row) throw new Error("Model insert failed");
        await tx.insert(auditEvents).values({
          organization_id,
          actor_id: user_id,
          action: "model.registered",
          resource_type: "model",
          resource_id: row.id,
        });
        // Durable business event: only IDs and public alias, never prompts, keys or user emails.
        await tx.execute(sql`INSERT INTO webhook_outbox(organization_id,subscription_id,event_type,payload)
    SELECT ${organization_id}::uuid,s.id,'model.registered',jsonb_build_object('id',${row.id}::uuid,'public_name',${row.public_name}::text)
    FROM webhook_subscriptions s WHERE s.organization_id=${organization_id}::uuid AND s.enabled AND s.revoked_at IS NULL`);
        return row;
      });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new ConflictException("Model name in use");
      throw err;
    }
  }

  async getModel(user_id: string, organization_id: string, model_id: string) {
    await this.organizationsService.requireMembership(user_id, organization_id);
    const [row] = await this.query.db
      .select()
      .from(models)
      .where(
        and(
          eq(models.organization_id, organization_id),
          eq(models.id, model_id),
        ),
      );
    if (!row) throw new NotFoundException("Model not found");
    return row;
  }
  async findPublicName(organization_id: string, name: string) {
    const [row] = await this.query.db
      .select()
      .from(models)
      .where(
        and(
          eq(models.organization_id, organization_id),
          eq(models.public_name, name),
          eq(models.enabled, true),
        ),
      );
    if (!row) throw new NotFoundException("Model unavailable");
    return row;
  }
  async updateModel(
    actor: string,
    org: string,
    id: string,
    input: import("../../presentation/http/dto/update-model.request.dto").UpdateModelRequestDto,
  ) {
    await this.organizationsService.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(models)
        .set(input)
        .where(and(eq(models.organization_id, org), eq(models.id, id)))
        .returning();
      if (!row) throw new NotFoundException("Model not found");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "model.updated",
        resource_type: "model",
        resource_id: id,
      });
      return row;
    });
  }
  async listVersions(actor: string, org: string, id: string) {
    await this.getModel(actor, org, id);
    return this.query.db
      .select()
      .from(modelVersions)
      .where(
        and(
          eq(modelVersions.organization_id, org),
          eq(modelVersions.model_id, id),
        ),
      )
      .orderBy(desc(modelVersions.created_at));
  }
  async createVersion(
    actor: string,
    org: string,
    id: string,
    input: import("../../presentation/http/dto/update-model.request.dto").CreateModelVersionRequestDto,
  ) {
    await this.organizationsService.requireMembership(actor, org, "operator");
    await this.getModel(actor, org, id);
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(modelVersions)
        .values({ organization_id: org, model_id: id, ...input })
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "model.version.registered",
        resource_type: "model_version",
        resource_id: row?.id,
      });
      return row;
    });
  }
}
