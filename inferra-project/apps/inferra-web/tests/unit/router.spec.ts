import { describe, expect, it } from "vitest";
import { matches } from "../../src/app/router";

describe("route matching", () => {
  it("extracts org and model parameters", () => {
    expect(
      matches("/app/:org_slug/models/:model_id", "/app/acme/models/123"),
    ).toEqual({ org_slug: "acme", model_id: "123" });
  });
  it("rejects unmatched", () => {
    expect(matches("/register", "/logout")).toBeNull();
  });
});
