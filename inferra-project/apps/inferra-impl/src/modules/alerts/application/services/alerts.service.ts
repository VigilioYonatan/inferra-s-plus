import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { alertIncidents, auditEvents } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
@Injectable()
export class AlertsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    return this.query.db
      .select()
      .from(alertIncidents)
      .where(eq(alertIncidents.organization_id, org))
      .orderBy(desc(alertIncidents.occurred_at))
      .limit(100);
  }
  async acknowledge(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(alertIncidents)
        .set({ acknowledged_by: actor, acknowledged_at: new Date() })
        .where(
          and(
            eq(alertIncidents.id, id),
            eq(alertIncidents.organization_id, org),
            isNull(alertIncidents.acknowledged_at),
          ),
        )
        .returning();
      if (!row)
        throw new NotFoundException("Unacknowledged incident not found");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "alert.acknowledged",
        resource_type: "alert",
        resource_id: id,
      });
      return row;
    });
  }
}
