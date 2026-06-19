import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import { inferenceRequests } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
@Injectable()
export class UsageService {
  constructor(private readonly query: QueryService) {}
  listRequests(organization_id: string) {
    return this.query.db
      .select({
        id: inferenceRequests.id,
        status: inferenceRequests.status,
        prompt_tokens: inferenceRequests.prompt_tokens,
        completion_tokens: inferenceRequests.completion_tokens,
        elapsed_ms: inferenceRequests.elapsed_ms,
        created_at: inferenceRequests.created_at,
      })
      .from(inferenceRequests)
      .where(eq(inferenceRequests.organization_id, organization_id))
      .orderBy(desc(inferenceRequests.created_at))
      .limit(100);
  }
  async getSummary(organization_id: string) {
    const r = await this.query.db.execute(
      sql`SELECT count(*)::integer requests,COALESCE(sum(prompt_tokens),0)::bigint prompt_tokens,COALESCE(sum(completion_tokens),0)::bigint completion_tokens,COALESCE(avg(elapsed_ms),0)::integer avg_latency_ms FROM inference_requests WHERE organization_id=${organization_id}::uuid AND created_at>now()-interval '30 days'`,
    );
    return r.rows[0];
  }
  async getRequest(organization_id: string, request_id: string) {
    const [row] = await this.query.db
      .select()
      .from(inferenceRequests)
      .where(
        and(
          eq(inferenceRequests.organization_id, organization_id),
          eq(inferenceRequests.id, request_id),
        ),
      );
    if (!row) throw new NotFoundException("Request not found");
    return row;
  }
  async byModel(organization_id: string) {
    const result = await this.query.db.execute(
      sql`SELECT model_id::text as model_id,count(*)::integer as requests,COALESCE(sum(prompt_tokens),0)::bigint as prompt_tokens,COALESCE(sum(completion_tokens),0)::bigint as completion_tokens FROM inference_requests WHERE organization_id=${organization_id}::uuid AND created_at>now()-interval '30 days' GROUP BY model_id ORDER BY requests DESC LIMIT 100`,
    );
    return result.rows;
  }
  async timeSeries(organization_id: string) {
    const result = await this.query.db.execute(
      sql`SELECT date_trunc('day',created_at)::date AS day,count(*)::integer AS requests,COALESCE(sum(prompt_tokens+completion_tokens),0)::bigint AS tokens FROM inference_requests WHERE organization_id=${organization_id}::uuid AND created_at>now()-interval '30 days' GROUP BY day ORDER BY day`,
    );
    return result.rows;
  }
}
