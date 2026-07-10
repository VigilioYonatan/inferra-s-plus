import { describe, expect, it } from "vitest";
import {
  completionRequestDto,
  embeddingsRequestDto,
} from "../../../src/modules/inference/presentation/http/dto/completion.request.dto";

describe("text completion and embeddings contracts", () => {
  it("accepts bounded default text completions", () =>
    expect(
      completionRequestDto.parse({ model: "qwen", prompt: "Hello" }),
    ).toMatchObject({ stream: false, max_tokens: 512 }));
  it("rejects unspecified settings instead of forwarding untrusted runtime params", () =>
    expect(
      completionRequestDto.safeParse({
        model: "qwen",
        prompt: "Hello",
        guided_regex: ".*",
      }).success,
    ).toBe(false));
  it("rejects pathologically large prompts", () =>
    expect(
      completionRequestDto.safeParse({
        model: "qwen",
        prompt: "x".repeat(70000),
      }).success,
    ).toBe(false));
  it("rejects excessive completion length", () =>
    expect(
      completionRequestDto.safeParse({
        model: "qwen",
        prompt: "Hello",
        max_tokens: 1000000,
      }).success,
    ).toBe(false));
  it("allows embeddings with float encoding", () =>
    expect(
      embeddingsRequestDto.parse({ model: "embed", input: "hello" }),
    ).toMatchObject({ encoding_format: "float" }));
  it("rejects empty embeddings and unknown parameters", () => {
    expect(
      embeddingsRequestDto.safeParse({ model: "embed", input: [] }).success,
    ).toBe(false);
    expect(
      embeddingsRequestDto.safeParse({
        model: "embed",
        input: "hello",
        dimensions: 0,
      }).success,
    ).toBe(false);
  });
});
