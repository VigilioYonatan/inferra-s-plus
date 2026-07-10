import { expect, test } from "@playwright/test";

test("health live and capabilities", async ({ request }) => {
  const response = await request.get("/health/live");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).status).toBe("ok");
  const capabilities = await request.get("/api/v1/system/capabilities");
  expect(capabilities.ok()).toBeTruthy();
});
test("anonymous session data cannot be read", async ({ request }) => {
  const response = await request.get("/api/v1/auth/me");
  expect(response.status()).toBe(401);
});
test("anonymous inference cannot enumerate models", async ({ request }) => {
  const response = await request.get("/v1/models");
  expect(response.status()).toBe(401);
});
