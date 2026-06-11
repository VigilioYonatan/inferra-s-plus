import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { auditEvents, modelImportRequests } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
// Requests are operator-reviewed manifests. Untrusted model IDs never become shell commands.
@Injectable()
export class ModelImportsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    return this.query.db
      .select()
      .from(modelImportRequests)
      .where(eq(modelImportRequests.organization_id, org))
      .orderBy(desc(modelImportRequests.created_at))
      .limit(100);
  }
  async get(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const [row] = await this.query.db
      .select()
      .from(modelImportRequests)
      .where(
        and(
          eq(modelImportRequests.id, id),
          eq(modelImportRequests.organization_id, org),
        ),
      );
    if (!row) throw new NotFoundException("Request not found");
    return row;
  }
  async request(actor: string, org: string, repository_id: string) {
    await this.orgs.requireMembership(actor, org, "operator");
    const [row] = await this.query.db
      .insert(modelImportRequests)
      .values({
        organization_id: org,
        requested_by: actor,
        repository_id,
        status: "operator_review",
      })
      .returning();
    await this.query.db.insert(auditEvents).values({
      organization_id: org,
      actor_id: actor,
      action: "model_import.requested",
      resource_type: "model_import",
      resource_id: row?.id,
    });
    return row;
  }
  async cancel(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "operator");
    const [row] = await this.query.db
      .update(modelImportRequests)
      .set({ status: "cancelled", cancelled_at: new Date() })
      .where(
        and(
          eq(modelImportRequests.id, id),
          eq(modelImportRequests.organization_id, org),
          eq(modelImportRequests.status, "operator_review"),
        ),
      )
      .returning();
    if (!row) throw new NotFoundException("Open import request not found");
    return row;
  }
}
