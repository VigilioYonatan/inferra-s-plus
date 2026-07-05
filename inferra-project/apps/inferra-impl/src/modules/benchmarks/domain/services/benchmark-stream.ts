/** Pure decoder for OpenAI-compatible data: SSE records. No prompts or responses are persisted. */
export type BenchmarkSseEvent = {
  tokens: number;
  has_first_token: boolean;
  done: boolean;
};
export function parseBenchmarkFrame(frame: string): BenchmarkSseEvent {
  const data = frame
    .split(/\r?\n/)
    .filter((x) => x.startsWith("data:"))
    .map((x) => x.slice(5).trim())
    .join("\n");
  if (!data) return { tokens: 0, has_first_token: false, done: false };
  if (data === "[DONE]")
    return { tokens: 0, has_first_token: false, done: true };
  const event = JSON.parse(data) as {
    choices?: Array<{ delta?: { content?: string } }>;
    usage?: { completion_tokens?: number };
  };
  return {
    tokens: event.usage?.completion_tokens ?? 0,
    has_first_token: Boolean(
      event.choices?.some((c) => Boolean(c.delta?.content)),
    ),
    done: false,
  };
}
export type StreamMeasurement = {
  ttft_ms: number;
  latency_ms: number;
  completion_tokens: number;
  tpot_ms: number | null;
};
export async function measureVllmStream(
  response: Response,
  start: number,
): Promise<StreamMeasurement> {
  if (!response.ok || !response.body)
    throw new Error("Inference runtime responded without a valid stream");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let ttft_ms: number | null = null;
  let tokens: number | null = null;
  let doneFrame = false;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const parsed = parseBenchmarkFrame(frame);
        if (parsed.has_first_token && ttft_ms === null)
          ttft_ms = performance.now() - start;
        if (parsed.tokens > 0) tokens = parsed.tokens;
        if (parsed.done) {
          doneFrame = true;
          break;
        }
      }
      if (doneFrame) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  if (!doneFrame || tokens === null || ttft_ms === null)
    throw new Error(
      "Benchmark stream missing first token, usage or completion marker",
    );
  const latency_ms = performance.now() - start;
  return {
    ttft_ms,
    latency_ms,
    completion_tokens: tokens,
    tpot_ms: tokens > 1 ? (latency_ms - ttft_ms) / (tokens - 1) : null,
  };
}
