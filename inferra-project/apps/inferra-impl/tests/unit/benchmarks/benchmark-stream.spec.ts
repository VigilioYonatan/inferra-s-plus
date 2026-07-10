import { describe, expect, it } from "vitest";
import {
  measureVllmStream,
  parseBenchmarkFrame,
} from "../../../src/modules/benchmarks/domain/services/benchmark-stream";

describe("benchmark streaming measurement", () => {
  it("identifies first generated tokens without counting meta events", () => {
    expect(
      parseBenchmarkFrame('data: {"choices":[{"delta":{"role":"assistant"}}]}')
        .has_first_token,
    ).toBe(false);
    expect(
      parseBenchmarkFrame('data: {"choices":[{"delta":{"content":"Hello"}}]}')
        .has_first_token,
    ).toBe(true);
  });
  it("extracts usage and terminal sentinel", () => {
    expect(
      parseBenchmarkFrame(
        'data: {"choices":[],"usage":{"completion_tokens":12}}',
      ).tokens,
    ).toBe(12);
    expect(parseBenchmarkFrame("data: [DONE]").done).toBe(true);
  });
  it("measures completed SSE response, including split chunk frames", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[],"usage":{"completion_tokens":',
      "2}}\n\ndata: [DONE]\n\n",
    ];
    const body = new ReadableStream<Uint8Array>({
      start(ctrl) {
        for (const chunk of chunks) ctrl.enqueue(encoder.encode(chunk));
        ctrl.close();
      },
    });
    const result = await measureVllmStream(
      new Response(body, { status: 200 }),
      performance.now() - 1,
    );
    expect(result.completion_tokens).toBe(2);
    expect(result.ttft_ms).toBeGreaterThanOrEqual(0);
    expect(result.latency_ms).toBeGreaterThanOrEqual(result.ttft_ms);
  });
  it("rejects streams lacking canonical usage or finish", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(
          new TextEncoder().encode(
            'data: {"choices":[{"delta":{"content":"x"}}]}\n\n',
          ),
        );
        ctrl.close();
      },
    });
    await expect(
      measureVllmStream(new Response(body), performance.now()),
    ).rejects.toThrow(/missing/);
  });
});
