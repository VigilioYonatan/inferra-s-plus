import { Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
@Injectable()
export class ObservabilityService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async latency(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const r = await this.query.db.execute(
      sql`SELECT count(*)::integer as requests,percentile_cont(0.50) within group(order by elapsed_ms) as p50_ms,percentile_cont(0.95) within group(order by elapsed_ms) as p95_ms,percentile_cont(0.99) within group(order by elapsed_ms) as p99_ms FROM inference_requests WHERE organization_id=${org}::uuid AND created_at>now()-interval '24 hours'`,
    );
    return { window: "24h", ...r.rows[0] };
  }
  async errors(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const r = await this.query.db.execute(
      sql`SELECT status,count(*)::integer as requests FROM inference_requests WHERE organization_id=${org}::uuid AND created_at>now()-interval '24 hours' GROUP BY status ORDER BY requests DESC`,
    );
    return { window: "24h", results: r.rows };
  }
}
