import { describe, expect, it } from "vitest";
import { registerOrganizationRequestDto } from "../../../src/modules/organizations/presentation/http/dto/register-organization.request.dto";

describe("organization ownership contract", () => {
  it("rejects invalid slugs", () => {
    expect(
      registerOrganizationRequestDto.safeParse({
        slug: "../admin",
        name: "Example",
      }).success,
    ).toBe(false);
  });
  it("accepts normalized names", () => {
    expect(
      registerOrganizationRequestDto.safeParse({
        slug: "my-team",
        name: "My Team",
      }).success,
    ).toBe(true);
  });
});
