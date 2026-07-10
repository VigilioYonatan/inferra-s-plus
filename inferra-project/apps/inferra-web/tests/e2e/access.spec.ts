import { expect, test } from "@playwright/test";

test("anonymous request to dashboard requires login", async ({ page }) => {
  await page.goto("/app/example/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
