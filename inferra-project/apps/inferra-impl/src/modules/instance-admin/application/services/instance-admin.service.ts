import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { env } from "../../../../config/env.schema";
import {
  backupRuns,
  benchmarks,
  instanceAdministrators,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";

const power: Record<string, number> = { auditor: 10, admin: 50, owner: 100 };
@Injectable()
export class InstanceAdminService {
  constructor(private readonly query: QueryService) {}
  async requireRole(
    actor_id: string,
    minimum: "auditor" | "admin" | "owner" = "auditor",
  ) {
    const [row] = await this.query.db
      .select()
      .from(instanceAdministrators)
      .where(eq(instanceAdministrators.user_id, actor_id));
    if (!row || (power[row.role] ?? 0) < (power[minimum] ?? 0))
      throw new ForbiddenException("Instance-level authorization required");
    return row;
  }
  async system(actor_id: string) {
    await this.requireRole(actor_id, "auditor");
    return {
      product: "Inferra",
      release: "0.2.0",
      deployment: "docker-compose",
      features: {
        registration: env.REGISTRATION_ENABLED === "true",
        google: Boolean(env.GOOGLE_CLIENT_ID),
        facebook: Boolean(env.FACEBOOK_CLIENT_ID),
        smtp: Boolean(env.SMTP_URL),
        rustfs: Boolean(env.RUSTFS_ENDPOINT),
        metrics: env.METRICS_ENABLED === "true",
      },
      auth_cookie_secure: env.COOKIE_SECURE === "true",
    };
  }
  async backups(actor_id: string) {
    await this.requireRole(actor_id, "auditor");
    return this.query.db
      .select()
      .from(backupRuns)
      .orderBy(desc(backupRuns.started_at))
      .limit(50);
  }
  async backup(actor_id: string, id: string) {
    await this.requireRole(actor_id, "auditor");
    const [row] = await this.query.db
      .select()
      .from(backupRuns)
      .where(eq(backupRuns.id, id));
    if (!row) throw new NotFoundException("Backup record not found");
    return row;
  }
  async jobs(actor_id: string) {
    await this.requireRole(actor_id, "auditor");
    return this.query.db
      .select()
      .from(benchmarks)
      .orderBy(desc(benchmarks.created_at))
      .limit(100);
  }
  async job(actor_id: string, id: string) {
    await this.requireRole(actor_id, "auditor");
    const [row] = await this.query.db
      .select()
      .from(benchmarks)
      .where(eq(benchmarks.id, id));
    if (!row) throw new NotFoundException("Job not found");
    return row;
  }
}
