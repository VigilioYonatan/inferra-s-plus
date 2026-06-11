import { once } from "node:events";
import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { env } from "../../../../config/env.schema";
import { inferenceRequests } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import {
  inferenceActive,
  inferenceDuration,
  inferenceTotal,
  inferenceTtft,
} from "../../../../shared/observability/metrics";
import { ModelsService } from "../../../model-catalog/application/services/models.service";
import { QuotaService } from "../../../quotas/application/services/quota.service";
import type { ChatCompletionRequestDto } from "../../presentation/http/dto/chat-completion.request.dto";
import type {
  CompletionRequestDto,
  EmbeddingsRequestDto,
} from "../../presentation/http/dto/completion.request.dto";
@Injectable()
export class InferenceService {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly quotaService: QuotaService,
    private readonly query: QueryService,
  ) {}
  async listServingModels(organization_id: string) {
    const models = await this.modelsService.listModels(organization_id);
    return {
      object: "list",
      data: models
        .filter((m) => m.enabled)
        .map((m) => ({
          id: m.public_name,
          object: "model",
          created: Math.floor(m.created_at.getTime() / 1000),
          owned_by: "inferra",
        })),
    };
  }
  async createChatCompletion(
    organization_id: string,
    input: ChatCompletionRequestDto,
    req: Request,
    res: Response,
  ) {
    const model = await this.modelsService.findPublicName(
      organization_id,
      input.model,
    );
    const prompt_bytes = Buffer.byteLength(
      JSON.stringify(input.messages),
      "utf8",
    );
    const reservation = prompt_bytes + input.max_tokens; // conservative upper bound on BPE token count
    const lease = await this.quotaService.reserve(
      organization_id,
      reservation,
      model.id,
    );
    let status = "error";
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let usage_received = false;
    const started = performance.now();
    let first_token = false;
    const controller = new AbortController();
    let cancelled = false;
    const onAbort = () => {
      cancelled = true;
      controller.abort();
    };
    req.once("aborted", onAbort);
    res.once("close", onAbort);
    inferenceActive.inc();
    try {
      const upstream = await fetch(
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
            ...input,
            model: model.upstream_name,
            stream_options: input.stream ? { include_usage: true } : undefined,
          }),
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(180000),
          ]),
        },
      ).catch(() => {
        throw new ServiceUnavailableException("Model runtime unavailable");
      });
      if (!upstream.ok || !upstream.body)
        throw new BadGatewayException("Inference runtime rejected request");
      if (input.stream) {
        res.status(200).set({
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        });
        res.flushHeaders();
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          buffer += text;
          // SSE frames can be split across arbitrary TCP chunks; keep the last incomplete frame.
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() || "";
          for (const frame of frames) {
            const data = frame
              .split(/\r?\n/)
              .filter((s) => s.startsWith("data:"))
              .map((s) => s.slice(5).trim())
              .join("\n");
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data) as {
                  usage?: {
                    prompt_tokens?: number;
                    completion_tokens?: number;
                  };
                };
                if (parsed.usage) {
                  usage_received = true;
                  prompt_tokens = parsed.usage.prompt_tokens ?? 0;
                  completion_tokens = parsed.usage.completion_tokens ?? 0;
                }
                if (!first_token) {
                  const candidates = parsed as {
                    choices?: { delta?: { content?: string } }[];
                  };
                  if (
                    candidates.choices?.some((c) => Boolean(c.delta?.content))
                  ) {
                    first_token = true;
                    inferenceTtft.observe((performance.now() - started) / 1000);
                  }
                }
              } catch {
                /* malformed upstream chunk: forward, but bill reservation */
              }
            }
            if (!res.destroyed) {
              const publicFrame =
                data && data !== "[DONE]"
                  ? frame.replace(/^data: (\{.*\})$/m, (line, json) => {
                      try {
                        return (
                          "data: " +
                          JSON.stringify({
                            ...JSON.parse(json),
                            model: input.model,
                          })
                        );
                      } catch {
                        return line;
                      }
                    })
                  : frame;
              if (!res.write(`${publicFrame}\n\n`))
                await Promise.race([once(res, "drain"), once(res, "close")]);
            }
          }
        }
        // Never forward incomplete SSE frames: an upstream disconnect may truncate JSON.
        if (!res.destroyed) res.end();
      } else {
        const payload = (await upstream.json()) as {
          usage?: { prompt_tokens?: number; completion_tokens?: number };
          choices?: unknown;
        };
        if (payload.usage) {
          usage_received = true;
          prompt_tokens = payload.usage.prompt_tokens || 0;
          completion_tokens = payload.usage.completion_tokens || 0;
        }
        res.json({ ...payload, model: input.model });
      }
      status = "ok";
    } catch (err) {
      status = cancelled ? "cancelled" : "error";
      if (!res.headersSent) {
        if (err instanceof ServiceUnavailableException) throw err;
        throw new BadGatewayException("Inference gateway failed");
      }
      if (!res.destroyed) {
        res.write(
          'event: error\ndata: {"error":{"message":"Inference interrupted"}}\n\n',
        );
        res.end();
      }
    } finally {
      req.off("aborted", onAbort);
      res.off("close", onAbort);
      const elapsed_ms = Math.round(performance.now() - started);
      inferenceActive.dec();
      inferenceTotal.inc({ status });
      inferenceDuration.observe({ status }, elapsed_ms / 1000);
      try {
        await this.quotaService.settle(
          lease,
          status === "ok"
            ? usage_received
              ? prompt_tokens + completion_tokens
              : reservation
            : 0,
        );
      } catch {
        /* reconciliation must be monitored: fail closed via reserved quota until operator repair */
      }
      try {
        await this.query.db.insert(inferenceRequests).values({
          organization_id,
          model_id: model.id,
          status,
          prompt_tokens,
          completion_tokens,
          elapsed_ms,
        });
      } catch {
        /* telemetry data loss is an incident to alert on */
      }
    }
  }
  /** Proxy text completion while enforcing the same authorization and reservation as chat. */
  async createCompletion(
    org: string,
    input: CompletionRequestDto,
    req: Request,
    res: Response,
  ) {
    return this.proxyCompatible(org, input, req, res, "completions", true);
  }
  async createEmbeddings(
    org: string,
    input: EmbeddingsRequestDto,
    req: Request,
    res: Response,
  ) {
    return this.proxyCompatible(org, input, req, res, "embeddings", false);
  }
  private async proxyCompatible(
    org: string,
    input: CompletionRequestDto | EmbeddingsRequestDto,
    req: Request,
    res: Response,
    kind: "completions" | "embeddings",
    canStream: boolean,
  ) {
    const model = await this.modelsService.findPublicName(org, input.model);
    const raw =
      kind === "completions"
        ? (input as CompletionRequestDto).prompt
        : (input as EmbeddingsRequestDto).input;
    const bytes = Buffer.byteLength(JSON.stringify(raw), "utf8");
    const reserved = Math.min(
      1_000_000,
      bytes + ("max_tokens" in input ? input.max_tokens : 0),
    );
    const lease = await this.quotaService.reserve(org, reserved, model.id);
    const ctrl = new AbortController();
    const onClose = () => ctrl.abort();
    req.once("aborted", onClose);
    res.once("close", onClose);
    const start = performance.now();
    let status = "error";
    let counted = reserved;
    let promptTokens = 0;
    let completionTokens = 0;
    let usageReceived = false;
    inferenceActive.inc();
    try {
      const upstream = await fetch(
        `${env.VLLM_URL.replace(/\/$/, "")}/v1/${kind}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(env.VLLM_API_KEY
              ? { authorization: `Bearer ${env.VLLM_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            ...input,
            model: model.upstream_name,
            ...(kind === "completions" && "stream" in input && input.stream
              ? { stream_options: { include_usage: true } }
              : {}),
          }),
          signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(180000)]),
        },
      );
      if (!upstream.ok || !upstream.body)
        throw new BadGatewayException(
          "Selected model does not support requested capability, or runtime unavailable",
        );
      if (canStream && "stream" in input && input.stream) {
        res.status(200).set({
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        });
        res.flushHeaders();
        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        let buffer = "";
        while (!ctrl.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() || "";
          for (const frame of parts) {
            const data = frame
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("\n");
            let forwarded = frame;
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data) as {
                  usage?: {
                    prompt_tokens?: number;
                    completion_tokens?: number;
                  };
                };
                if (parsed.usage) {
                  usageReceived = true;
                  promptTokens = parsed.usage.prompt_tokens ?? 0;
                  completionTokens = parsed.usage.completion_tokens ?? 0;
                  counted = promptTokens + completionTokens;
                }
                forwarded = `data: ${JSON.stringify({ ...parsed, model: input.model })}`;
              } catch {
                throw new BadGatewayException(
                  "Malformed upstream stream event",
                );
              }
            }
            if (!res.destroyed && !res.write(`${forwarded}\n\n`))
              await Promise.race([once(res, "drain"), once(res, "close")]);
          }
        }
        if (!res.destroyed) res.end();
      } else {
        const result = (await upstream.json()) as {
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          };
        };
        if (result.usage) {
          usageReceived = true;
          promptTokens = result.usage.prompt_tokens ?? 0;
          completionTokens = result.usage.completion_tokens ?? 0;
          counted =
            result.usage.total_tokens ?? promptTokens + completionTokens;
        }
        res.status(200).json({ ...result, model: input.model });
      }
      status = "ok";
    } catch (err) {
      status = ctrl.signal.aborted ? "cancelled" : "error";
      if (!res.headersSent) {
        if (err instanceof BadGatewayException) throw err;
        throw new ServiceUnavailableException("Inference runtime unavailable");
      }
      if (!res.destroyed) {
        res.write(
          'event: error\ndata: {"error":{"message":"Inference interrupted"}}\n\n',
        );
        res.end();
      }
    } finally {
      res.off("close", onClose);
      req.off("aborted", onClose);
      inferenceActive.dec();
      inferenceTotal.inc({ status });
      const ms = Math.round(performance.now() - start);
      inferenceDuration.observe({ status }, ms / 1000);
      try {
        await this.quotaService.settle(
          lease,
          status === "ok"
            ? usageReceived
              ? Math.min(reserved, Math.max(0, counted))
              : reserved
            : 0,
        );
      } catch {
        console.error("Inference quota settlement failed");
      }
      try {
        await this.query.db.insert(inferenceRequests).values({
          organization_id: org,
          model_id: model.id,
          status,
          prompt_tokens: usageReceived ? promptTokens : 0,
          completion_tokens: usageReceived ? completionTokens : 0,
          elapsed_ms: ms,
        });
      } catch {
        console.error("Inference usage accounting write failed");
      }
    }
  }
}
