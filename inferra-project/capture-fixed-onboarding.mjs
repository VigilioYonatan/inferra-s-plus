import { chromium } from "./apps/inferra-web/node_modules/@playwright/test/index.mjs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto("http://localhost:5173/login");
  await page.locator('input[type="email"]').fill("admin@inferra.internal");
  await page.locator('input[type="password"]').fill("InferraMaster2026!Secure");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForTimeout(2000);

  // Navigate to onboarding
  await page.goto("http://localhost:5173/onboarding", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: "inferra-project/screenshots/onboarding-fixed-svg.png", fullPage: false });
  console.log("Screenshot captured successfully to inferra-project/screenshots/onboarding-fixed-svg.png");
  await browser.close();
}

main().catch(console.error);
