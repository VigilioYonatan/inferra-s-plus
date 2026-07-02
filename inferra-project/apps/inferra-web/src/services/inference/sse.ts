// Framing is defined by SSE: each event ends with a blank line, regardless of TCP boundaries.
export type StreamFrame = { event: string; data: string };
export class SseDecoder {
  private buffer = "";
  push(chunk: string): StreamFrame[] {
    this.buffer += chunk;
    const frames: StreamFrame[] = [];
    const chunks = this.buffer.split(/\r?\n\r?\n/);
    this.buffer = chunks.pop() || "";
    for (const raw of chunks) {
      let event = "message";
      const data: string[] = [];
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const payload = line.startsWith("data: ")
            ? line.slice(6)
            : line.slice(5);
          data.push(payload);
        }
      }
      if (data.length) frames.push({ event, data: data.join("\n") });
    }
    return frames;
  }
}
export async function streamChat(
  path: string,
  body: Record<string, unknown>,
  onToken: (token: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  });
  if (!response.ok || !response.body)
    throw new Error(`Inference error (${response.status})`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const event of parser.push(
        decoder.decode(value, { stream: true }),
      )) {
        if (event.data === "[DONE]") return;
        if (event.event === "error") throw new Error("Inference interrupted");
        try {
          const data = JSON.parse(event.data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const content = data.choices?.[0]?.delta?.content;
          if (content) onToken(content);
        } catch (err) {
          if (err instanceof SyntaxError) continue;
          throw err;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
