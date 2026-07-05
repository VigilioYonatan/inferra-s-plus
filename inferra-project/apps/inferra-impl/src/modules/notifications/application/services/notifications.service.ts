import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  auditEvents,
  notificationPreferences,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { NotificationSettingsRequestDto } from "../../presentation/http/dto/notification-settings.request.dto";
@Injectable()
export class NotificationsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async get(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "viewer");
    const [row] = await this.query.db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.organization_id, org));
    return row ?? { organization_id: org, email_enabled: true };
  }
  async update(
    actor: string,
    org: string,
    input: NotificationSettingsRequestDto,
  ) {
    await this.orgs.requireMembership(actor, org, "admin");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(notificationPreferences)
        .values({ organization_id: org, ...input, updated_at: new Date() })
        .onConflictDoUpdate({
          target: notificationPreferences.organization_id,
          set: { ...input, updated_at: new Date() },
        })
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "notifications.settings.updated",
        resource_type: "notification_settings",
        resource_id: org,
      });
      return row;
    });
  }
}
