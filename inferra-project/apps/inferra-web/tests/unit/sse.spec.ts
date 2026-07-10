import { describe, expect, it } from "vitest";
import { SseDecoder } from "../../src/services/inference/sse";

describe("SSE framing", () => {
  it("decodes split frames and preserves payloads", () => {
    const decoder = new SseDecoder();
    expect(decoder.push('data: {"choices":')).toEqual([]);
    expect(decoder.push("[]}\n\n")).toEqual([
      { event: "message", data: '{"choices":[]}' },
    ]);
  });
  it("recognizes event names", () => {
    const decoder = new SseDecoder();
    expect(decoder.push("event: error\ndata: boom\n\n")).toEqual([
      { event: "error", data: "boom" },
    ]);
  });
});
