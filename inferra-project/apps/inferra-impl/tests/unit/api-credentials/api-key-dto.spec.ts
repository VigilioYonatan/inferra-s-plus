import { describe, expect, it } from "vitest";
import { createApiKeyRequestDto } from "../../../src/modules/api-credentials/presentation/http/dto/create-api-key.request.dto";

describe("API credentials input boundary", () => {
  it("rejects unrecognized privilege escalation attempts", () => {
    expect(
      createApiKeyRequestDto.safeParse({
        name: "service-bot",
        scopes: ["admin:*"],
      }).success,
    ).toBe(false);
  });
  it("assigns minimum inference scope by default", () => {
    expect(
      createApiKeyRequestDto.parse({ name: "service-bot" }).scopes,
    ).toEqual(["inference:invoke"]);
  });
  it("rejects empty scopes and excessively long labels", () => {
    expect(
      createApiKeyRequestDto.safeParse({ name: "service-bot", scopes: [] })
        .success,
    ).toBe(false);
    expect(
      createApiKeyRequestDto.safeParse({ name: "A".repeat(81) }).success,
    ).toBe(false);
  });
});
