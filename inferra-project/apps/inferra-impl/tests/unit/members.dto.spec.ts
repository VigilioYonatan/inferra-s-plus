import { describe, expect, it } from "vitest";
import {
  addMemberRequestDto,
  setMemberRoleRequestDto,
} from "../../src/modules/organizations/presentation/http/dto/members.request.dto";

describe("membership validation", () => {
  it("accepts lowercase, bounded role and normalized email", () => {
    expect(
      addMemberRequestDto.parse({ email: "ABC@Example.COM", role: "developer" })
        .email,
    ).toBe("abc@example.com");
  });
  it("rejects owner elevation and arbitrary roles", () => {
    expect(setMemberRoleRequestDto.safeParse({ role: "owner" }).success).toBe(
      false,
    );
    expect(
      setMemberRoleRequestDto.safeParse({ role: "superuser" }).success,
    ).toBe(false);
  });
  it("rejects malformed email", () => {
    expect(
      addMemberRequestDto.safeParse({ email: "not email", role: "viewer" })
        .success,
    ).toBe(false);
  });
});
