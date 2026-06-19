import { randomUUID } from "node:crypto";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { QueryService } from "../../../../shared/data/query";
import { TooManyRequestsException } from "../../../../shared/http/exceptions";
export type QuotaLease = {
  id: string;
  organization_id: string;
  period: string;
  reserved_tokens: number;
};
@Injectable()
export class QuotaService {
  constructor(private readonly query: QueryService) {}
  async reserve(
    organization_id: string,
    reserved_tokens: number,
    model_id?: string,
  ): Promise<QuotaLease> {
    if (
      !Number.isSafeInteger(reserved_tokens) ||
      reserved_tokens <= 0 ||
      reserved_tokens > 1_000_000
    )
      throw new TooManyRequestsException("Invalid token reservation");
    const period = new Date().toISOString().slice(0, 7);
    const lease: QuotaLease = {
      id: randomUUID(),
      organization_id,
      period,
      reserved_tokens,
    };
    try {
      await this.query.db.transaction(async (tx) => {
        await tx.execute(
          sql`INSERT INTO quota_buckets(organization_id,period,used_tokens,reserved_tokens,in_flight) VALUES(${organization_id}::uuid,${period},0,0,0) ON CONFLICT(organization_id,period) DO NOTHING`,
        );
        const result = await tx.execute(
          sql`SELECT b.used_tokens,b.reserved_tokens,b.in_flight,q.monthly_limit,q.concurrent_limit FROM quota_buckets b JOIN quotas q ON q.organization_id=b.organization_id WHERE b.organization_id=${organization_id}::uuid AND b.period=${period} FOR UPDATE OF b`,
        );
        const row = result.rows[0] as
          | {
              used_tokens: string;
              reserved_tokens: string;
              in_flight: number;
              monthly_limit: string;
              concurrent_limit: number;
            }
          | undefined;
        if (!row) throw new TooManyRequestsException("Quota not assigned");
        if (
          Number(row.used_tokens) +
            Number(row.reserved_tokens) +
            reserved_tokens >
          Number(row.monthly_limit)
        )
          throw new TooManyRequestsException("Monthly token quota exceeded");
        if (row.in_flight >= row.concurrent_limit)
          throw new TooManyRequestsException(
            "Concurrent request limit exceeded",
          );
        if (model_id) {
          const policyResult = await tx.execute(
            sql`SELECT enabled,concurrency_cap FROM routing_policies WHERE organization_id=${organization_id}::uuid AND model_id=${model_id}::uuid`,
          );
          const policy = policyResult.rows[0] as
            | { enabled: boolean; concurrency_cap: number }
            | undefined;
          if (policy) {
            if (!policy.enabled)
              throw new TooManyRequestsException(
                "Model admission disabled by policy",
              );
            const countResult = await tx.execute(
              sql`SELECT count(*)::integer AS in_flight FROM quota_leases WHERE organization_id=${organization_id}::uuid AND model_id=${model_id}::uuid`,
            );
            if (
              Number(countResult.rows[0]?.in_flight) >= policy.concurrency_cap
            )
              throw new TooManyRequestsException(
                "Model concurrency policy exceeded",
              );
          }
        }
        await tx.execute(
          sql`INSERT INTO quota_leases(id,organization_id,period,reserved_tokens,model_id,expires_at) VALUES(${lease.id}::uuid,${organization_id}::uuid,${period},${reserved_tokens},${model_id ?? null}::uuid,now()+interval '5 minutes')`,
        );
        await tx.execute(
          sql`UPDATE quota_buckets SET reserved_tokens=reserved_tokens+${reserved_tokens},in_flight=in_flight+1 WHERE organization_id=${organization_id}::uuid AND period=${period}`,
        );
      });
    } catch (err) {
      if (err instanceof TooManyRequestsException) throw err;
      throw new ServiceUnavailableException("Quota reservation unavailable");
    }
    return lease;
  }
  async settle(lease: QuotaLease, usage: number) {
    const charged = Math.max(0, Math.ceil(usage));
    return this.query.db.transaction(async (tx) => {
      const result = await tx.execute(
        sql`DELETE FROM quota_leases WHERE id=${lease.id}::uuid AND organization_id=${lease.organization_id}::uuid RETURNING reserved_tokens,period`,
      );
      const row = result.rows[0] as
        | { reserved_tokens: string; period: string }
        | undefined;
      if (!row) return false; // already settled; idempotent even under duplicate events
      await tx.execute(
        sql`UPDATE quota_buckets SET used_tokens=used_tokens+${charged},reserved_tokens=reserved_tokens-${Number(row.reserved_tokens)},in_flight=in_flight-1 WHERE organization_id=${lease.organization_id}::uuid AND period=${row.period}`,
      );
      return true;
    });
  }
  async reconcileExpired(max_rows = 100) {
    return this.query.db.transaction(async (tx) => {
      // Consume stranded leases after process death; fail-closed charging the reserved amount.
      const result = await tx.execute(
        sql`SELECT id,organization_id,period,reserved_tokens FROM quota_leases WHERE expires_at<now() ORDER BY expires_at LIMIT ${max_rows} FOR UPDATE SKIP LOCKED`,
      );
      for (const row of result.rows as {
        id: string;
        organization_id: string;
        period: string;
        reserved_tokens: string;
      }[]) {
        await tx.execute(
          sql`DELETE FROM quota_leases WHERE id=${row.id}::uuid`,
        );
        await tx.execute(
          sql`UPDATE quota_buckets SET used_tokens=used_tokens+${Number(row.reserved_tokens)},reserved_tokens=reserved_tokens-${Number(row.reserved_tokens)},in_flight=in_flight-1 WHERE organization_id=${row.organization_id}::uuid AND period=${row.period}`,
        );
      }
      return result.rows.length;
    });
  }
  async summary(organization_id: string) {
    const period = new Date().toISOString().slice(0, 7);
    const result = await this.query.db.execute(
      sql`SELECT q.monthly_limit,q.concurrent_limit,COALESCE(b.used_tokens,0) used_tokens,COALESCE(b.reserved_tokens,0) reserved_tokens,COALESCE(b.in_flight,0) in_flight FROM quotas q LEFT JOIN quota_buckets b ON b.organization_id=q.organization_id AND b.period=${period} WHERE q.organization_id=${organization_id}::uuid`,
    );
    return result.rows[0] ?? null;
  }
}
