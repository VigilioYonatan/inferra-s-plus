import { expect, test } from "@playwright/test";

test("login shows required controls and OTP", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Entrar con código OTP" }),
  ).toBeVisible();
});
