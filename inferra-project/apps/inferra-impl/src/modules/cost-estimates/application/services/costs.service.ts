import { Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { env } from "../../../../config/env.schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
@Injectable()
export class CostsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async estimates(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const r = await this.query.db.execute(
      sql`SELECT count(*)::integer as requests,COALESCE(sum(prompt_tokens+completion_tokens),0)::bigint as tokens,COALESCE(sum(elapsed_ms),0)::bigint as billed_elapsed_ms FROM inference_requests WHERE organization_id=${org}::uuid AND created_at>now()-interval '30 days'`,
    );
    const row = r.rows[0] as {
      tokens: string;
      requests: number;
      billed_elapsed_ms: string;
    };
    const gpuHours = Number(row.billed_elapsed_ms) / 3600000;
    const rate = env.GPU_HOURLY_RATE_USD;
    return {
      window: "30d",
      requests: row.requests,
      tokens: Number(row.tokens),
      sum_request_hours: gpuHours,
      gpu_hourly_rate_usd: rate,
      rough_compute_cost_usd:
        rate === undefined ? null : Number((gpuHours * rate).toFixed(4)),
      note: "Sum of request durations, NOT wall-clock GPU hours. Not an invoice. Overlapping requests double count GPU time; excludes idle, capital expenditure, electricity and cooling.",
    };
  }
}
