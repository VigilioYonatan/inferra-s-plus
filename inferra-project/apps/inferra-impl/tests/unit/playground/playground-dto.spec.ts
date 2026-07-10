import { describe, expect, it } from "vitest";
import {
  createPlaygroundSessionRequestDto,
  savePlaygroundSessionRequestDto,
} from "../../../src/modules/playground/presentation/http/dto/playground-session.request.dto";

describe("playground privacy and validation", () => {
  it("saves bounded conversation context on explicit request", () =>
    expect(
      savePlaygroundSessionRequestDto.safeParse({
        messages: [{ role: "user", content: "Hello" }],
      }).success,
    ).toBe(true));
  it("does not accept role escalation", () =>
    expect(
      savePlaygroundSessionRequestDto.safeParse({
        messages: [{ role: "system", content: "unsafe" }],
      }).success,
    ).toBe(false));
  it("enforces session title and message length", () => {
    expect(
      createPlaygroundSessionRequestDto.safeParse({ title: "" }).success,
    ).toBe(false);
    expect(
      savePlaygroundSessionRequestDto.safeParse({
        messages: [{ role: "assistant", content: "x".repeat(70000) }],
      }).success,
    ).toBe(false);
  });
});
