import "reflect-metadata";
import { createHash } from "node:crypto";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { Pool } from "pg";
import { env } from "./config/env.schema";
import { measureVllmStream } from "./modules/benchmarks/domain/services/benchmark-stream";
import { parseDcgm } from "./modules/gpu-nodes/domain/services/dcgm.parser";
import { sendSignedWebhook } from "./modules/webhooks/infrastructure/https/webhook-delivery";
import { unsealSecret } from "./shared/security/sealed-secret";

async function main() {
  const redis = new Redis(env.VALKEY_URL, { maxRetriesPerRequest: null });
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const worker = new Worker(
    "inferra-benchmarks",
    async (job) => {
      const id = job.data.id as string;
      const { rows } = await pool.query(
        "SELECT b.configuration,m.upstream_name FROM benchmarks b JOIN models m ON m.id=b.model_id WHERE b.id=$1",
        [id],
      );
      const row = rows[0] as
        | {
            configuration: {
              concurrency: number;
              requests: number;
              prompt: string;
              max_tokens: number;
            };
            upstream_name: string;
          }
        | undefined;
      if (!row) throw new Error("Benchmark job not found");
      await pool.query("UPDATE benchmarks SET status=$2 WHERE id=$1", [
        id,
        "running",
      ]);
      const latencies: number[] = [];
      const ttfts: number[] = [];
      const tpots: number[] = [];
      let tokens = 0;
      let failures = 0;
      let cursor = 0;
      let max_vram_mb: number | null = null;
      const sampleGpu = async () => {
        try {
          const res = await fetch(env.DCGM_METRICS_URL, {
            signal: AbortSignal.timeout(1800),
          });
          if (!res.ok) return;
          for (const sample of parseDcgm(await res.text()))
            if (sample.vram_bytes !== null)
              max_vram_mb = Math.max(
                max_vram_mb ?? 0,
                sample.vram_bytes / (1024 * 1024),
              );
        } catch {
          /* GPU exporter optional: do not synthesize VRAM */
        }
      };
      const gpuTimer = setInterval(() => {
        void sampleGpu();
      }, 1000);
      await sampleGpu();
      const execute = async () => {
        while (cursor < row.configuration.requests) {
          cursor++;
          const started = performance.now();
          try {
            const response = await fetch(
              `${env.VLLM_URL.replace(/\/$/, "")}/v1/chat/completions`,
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  ...(env.VLLM_API_KEY
                    ? { authorization: `Bearer ${env.VLLM_API_KEY}` }
                    : {}),
                },
                body: JSON.stringify({
                  model: row.upstream_name,
                  messages: [
                    { role: "user", content: row.configuration.prompt },
                  ],
                  max_tokens: row.configuration.max_tokens,
                  stream: true,
                  stream_options: { include_usage: true },
                }),
                signal: AbortSignal.timeout(120000),
              },
            );
            const measured = await measureVllmStream(response, started);
            tokens += measured.completion_tokens;
            latencies.push(measured.latency_ms);
            ttfts.push(measured.ttft_ms);
            if (measured.tpot_ms !== null) tpots.push(measured.tpot_ms);
          } catch {
            failures++;
          }
        }
      };
      const started = performance.now();
      try {
        await Promise.all(
          Array.from({ length: row.configuration.concurrency }, () =>
            execute(),
          ),
        );
      } finally {
        clearInterval(gpuTimer);
        await sampleGpu();
      }
      const p = (values: number[], quantile: number) => {
        const sorted = values.slice().sort((a, b) => a - b);
        return sorted.length
          ? (sorted[Math.ceil(sorted.length * quantile) - 1] ?? null)
          : null;
      };
      const result = {
        latency_p50_ms: p(latencies, 0.5),
        latency_p95_ms: p(latencies, 0.95),
        latency_p99_ms: p(latencies, 0.99),
        ttft_p50_ms: p(ttfts, 0.5),
        ttft_p95_ms: p(ttfts, 0.95),
        tpot_p95_ms: p(tpots, 0.95),
        vram_peak_mb: max_vram_mb,
        completed: latencies.length,
        failed: failures,
        completion_tokens: tokens,
        throughput_tokens_per_second:
          tokens / Math.max(0.001, (performance.now() - started) / 1000),
        configuration_hash: createHash("sha256")
          .update(JSON.stringify(row.configuration))
          .digest("hex"),
      };
      await pool.query(
        "UPDATE benchmarks SET status=$2, results=$3 WHERE id=$1",
        [
          id,
          failures ? "completed_with_errors" : "completed",
          JSON.stringify(result),
        ],
      );
    },
    { connection: redis, concurrency: 1 },
  );
  worker.on("failed", async (job, err) => {
    if (job)
      await pool.query(
        "UPDATE benchmarks SET status=$2,results=$3 WHERE id=$1",
        [
          job.data.id,
          "failed",
          JSON.stringify({ error: "runtime unavailable" }),
        ],
      );
    console.error("benchmark failed", err.name);
  });
  // Durable at-least-once webhook dispatcher, scoped to operator-approved HTTPS hosts.
  const deliverWebhooks = async () => {
    const rows: {
      id: string;
      url: string;
      secret_encrypted: string;
      event_type: string;
      payload: Record<string, unknown>;
    }[] = [];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const r = await client.query(
        `WITH due AS (SELECT o.id FROM webhook_outbox o JOIN webhook_subscriptions s ON s.id=o.subscription_id WHERE o.delivered_at IS NULL AND o.dead_at IS NULL AND o.next_attempt_at<=now() AND s.enabled AND s.revoked_at IS NULL ORDER BY o.next_attempt_at LIMIT 10 FOR UPDATE OF o SKIP LOCKED) UPDATE webhook_outbox o SET attempts=o.attempts+1,next_attempt_at=now()+interval '2 minutes' FROM due WHERE due.id=o.id RETURNING o.id,o.subscription_id,o.event_type,o.payload`,
      );
      for (const item of r.rows) {
        const sub = await client.query(
          "SELECT url,secret_encrypted FROM webhook_subscriptions WHERE id=$1",
          [item.subscription_id],
        );
        if (sub.rows[0]) rows.push({ ...item, ...sub.rows[0] });
      }
      await client.query("COMMIT");
    } catch {
      await client.query("ROLLBACK");
      throw new Error("Webhook claim failed");
    } finally {
      client.release();
    }
    for (const row of rows) {
      try {
        await sendSignedWebhook(row.url, unsealSecret(row.secret_encrypted), {
          id: row.id,
          type: row.event_type,
          data: row.payload,
        });
        await pool.query(
          "UPDATE webhook_outbox SET delivered_at=now(),last_error=NULL WHERE id=$1",
          [row.id],
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message.slice(0, 160) : "Delivery failed";
        await pool.query(
          "UPDATE webhook_outbox SET last_error=$2,dead_at=CASE WHEN attempts>=5 THEN now() ELSE NULL END,next_attempt_at=now()+make_interval(secs=>LEAST(3600,30*power(2,LEAST(attempts,7))::integer)) WHERE id=$1",
          [row.id, msg],
        );
      }
    }
  };
  const webhookTimer = setInterval(() => {
    void deliverWebhooks().catch(() =>
      console.error("Webhook dispatcher unavailable"),
    );
  }, 15000);
  const reconciler = setInterval(async () => {
    try {
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        const rows = await c.query(
          "SELECT id,organization_id,period,reserved_tokens FROM quota_leases WHERE expires_at<now() ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED",
        );
        for (const row of rows.rows) {
          await c.query("DELETE FROM quota_leases WHERE id=$1", [row.id]);
          await c.query(
            "UPDATE quota_buckets SET reserved_tokens=reserved_tokens-$1,in_flight=in_flight-1,used_tokens=used_tokens+$1 WHERE organization_id=$2 AND period=$3",
            [row.reserved_tokens, row.organization_id, row.period],
          );
        }
        await c.query("COMMIT");
      } catch {
        await c.query("ROLLBACK");
      } finally {
        c.release();
      }
    } catch {
      console.error("quota reconciliation failed");
    }
  }, 60_000);
  process.once("SIGTERM", async () => {
    clearInterval(reconciler);
    clearInterval(webhookTimer);
    await worker.close();
    await redis.quit();
    await pool.end();
    process.exit(0);
  });
}
main().catch(() => {
  console.error("Benchmark worker init failed");
  process.exitCode = 1;
});
