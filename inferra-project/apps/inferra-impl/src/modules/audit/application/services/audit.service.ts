import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { auditEvents } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
@Injectable()
export class AuditService {
  constructor(private readonly query: QueryService) {}
  async record(
    action: string,
    resource_type: string,
    actor_id: string | null,
    organization_id: string | null,
    resource_id?: string,
  ) {
    await this.query.db.insert(auditEvents).values({
      action,
      resource_type,
      actor_id,
      organization_id,
      resource_id,
    });
  }
  list(organization_id: string) {
    return this.query.db
      .select({
        id: auditEvents.id,
        actor_id: auditEvents.actor_id,
        action: auditEvents.action,
        resource_type: auditEvents.resource_type,
        resource_id: auditEvents.resource_id,
        created_at: auditEvents.created_at,
      })
      .from(auditEvents)
      .where(eq(auditEvents.organization_id, organization_id))
      .orderBy(desc(auditEvents.created_at))
      .limit(100);
  }
  async get(organization_id: string, id: string) {
    const [row] = await this.query.db
      .select()
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.organization_id, organization_id),
          eq(auditEvents.id, id),
        ),
      );
    if (!row) throw new NotFoundException("Audit event not found");
    return row;
  }
}
