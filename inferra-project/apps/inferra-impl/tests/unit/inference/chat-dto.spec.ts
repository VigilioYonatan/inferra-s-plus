import { describe, expect, it } from "vitest";
import { chatCompletionRequestDto } from "../../../src/modules/inference/presentation/http/dto/chat-completion.request.dto";

const base = { model: "qwen", messages: [{ role: "user", content: "hello" }] };
describe("chat inference contract", () => {
  it("defaults to nonstreaming with bounded output", () => {
    expect(chatCompletionRequestDto.parse(base)).toMatchObject({
      max_tokens: 512,
      stream: false,
    });
  });
  it("rejects unsupported fields, tool injection and excessive context", () => {
    expect(
      chatCompletionRequestDto.safeParse({
        ...base,
        stream_options: { include_usage: true },
      }).success,
    ).toBe(false);
    expect(
      chatCompletionRequestDto.safeParse({ ...base, max_tokens: 1e9 }).success,
    ).toBe(false);
  });
});
