import { expect, test } from "@playwright/test";

// This is an anonymous boundary test. Authenticated two-tenant IDOR requires seeded fixture identities.
test("all sensitive multi-tenant surfaces deny anonymous access", async ({
  request,
}) => {
  const org = "00000000-0000-4000-8000-000000000000";
  for (const part of [
    "models",
    "deployments",
    "api-keys",
    "datasets",
    "experiments",
    "webhooks",
    "invitations",
    "routing",
    "playground/sessions",
  ]) {
    const response = await request.get(`/api/v1/organizations/${org}/${part}`);
    expect(response.status(), part).toBe(401);
  }
});
