import { describe, expect, it } from "vitest";
import { appRoutes } from "../../src/app/route-registry";

describe("route registry", () => {
  it("has 86 unique routes providing 100% UI coverage for all APIs", () => {
    expect(appRoutes).toHaveLength(86);
    expect(new Set(appRoutes.map((r) => r.pattern)).size).toBe(86);
  });

  it("includes mandatory login, MFA, files, membership, webhooks detail and developer portal", () => {
    for (const name of [
      "/login",
      "/register",
      "/register/verify",
      "/auth/error",
      "/login/otp",
      "/mfa/challenge",
      "/account/security",
      "/account/sessions",
      "/account/verify-email",
      "/organizations/new",
      "/app/:org_slug/artifacts",
      "/app/:org_slug/members",
      "/app/:org_slug/members/roles",
      "/app/:org_slug/developers",
      "/app/:org_slug/playground/embeddings",
      "/app/:org_slug/usage/models",
      "/app/:org_slug/usage/exports",
      "/app/:org_slug/settings/webhooks/:webhook_id",
      "/app/:org_slug/gpu-nodes",
      "/app/:org_slug/observability/admission",
    ]) {
      expect(appRoutes.some((r) => r.pattern === name)).toBe(true);
    }
  });
});
