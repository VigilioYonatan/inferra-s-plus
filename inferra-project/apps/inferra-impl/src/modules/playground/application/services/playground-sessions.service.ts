import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { auditEvents, playgroundSessions } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { SavePlaygroundSessionRequestDto } from "../../presentation/http/dto/playground-session.request.dto";
@Injectable()
export class PlaygroundSessionsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "developer");
    return this.query.db
      .select({
        id: playgroundSessions.id,
        title: playgroundSessions.title,
        updated_at: playgroundSessions.updated_at,
      })
      .from(playgroundSessions)
      .where(
        and(
          eq(playgroundSessions.organization_id, org),
          eq(playgroundSessions.owner_id, actor),
        ),
      )
      .orderBy(desc(playgroundSessions.updated_at))
      .limit(50);
  }
  async get(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "developer");
    const [row] = await this.query.db
      .select()
      .from(playgroundSessions)
      .where(
        and(
          eq(playgroundSessions.organization_id, org),
          eq(playgroundSessions.owner_id, actor),
          eq(playgroundSessions.id, id),
        ),
      );
    if (!row) throw new NotFoundException("Session not found");
    return row;
  }
  async create(actor: string, org: string, title: string) {
    await this.orgs.requireMembership(actor, org, "developer");
    const [row] = await this.query.db
      .insert(playgroundSessions)
      .values({ organization_id: org, owner_id: actor, title })
      .returning();
    return row;
  }
  async save(
    actor: string,
    org: string,
    id: string,
    input: SavePlaygroundSessionRequestDto,
  ) {
    await this.orgs.requireMembership(actor, org, "developer");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(playgroundSessions)
        .set({ messages: input.messages, updated_at: new Date() })
        .where(
          and(
            eq(playgroundSessions.organization_id, org),
            eq(playgroundSessions.owner_id, actor),
            eq(playgroundSessions.id, id),
          ),
        )
        .returning();
      if (!row) throw new NotFoundException("Session not found");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "playground.session.saved",
        resource_type: "playground_session",
        resource_id: id,
        metadata: { messages: input.messages.length },
      });
      return { id: row.id, updated_at: row.updated_at };
    });
  }
}
