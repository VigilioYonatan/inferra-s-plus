import fs from "fs";
import path from "path";
import { chromium } from "./inferra-project/apps/inferra-web/node_modules/@playwright/test/index.mjs";

const OUTPUT_DIR = "docs/assets/screenshots";
const INFERRA_DIR = "inferra-project/docs/assets/screenshots";

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(INFERRA_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI Retina for ultra-crisp showcase!
  });
  const page = await context.newPage();

  // Login
  await page.goto("http://localhost:5173/login");
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').fill("admin@inferra.internal");
  await page.locator('input[type="password"]').fill("InferraMaster2026!Secure");
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  const orgSlug = "test-org-1794214109520";
  const views = [
    { name: "dashboard.png", path: `/app/${orgSlug}/dashboard` },
    { name: "playground.png", path: `/app/${orgSlug}/playground` },
    { name: "models.png", path: `/app/${orgSlug}/models` },
    { name: "api-keys.png", path: `/app/${orgSlug}/api-keys` },
    { name: "quotas.png", path: `/app/${orgSlug}/quotas` },
    { name: "latency-slo.png", path: `/app/${orgSlug}/observability/latency` },
    { name: "benchmarks.png", path: `/app/${orgSlug}/benchmarks` },
    { name: "developer-portal.png", path: `/app/${orgSlug}/developers` },
    { name: "audit-trail.png", path: `/app/${orgSlug}/audit` },
  ];

  for (const v of views) {
    console.log(`Navigating to ${v.path}...`);
    await page.goto(`http://localhost:5173${v.path}`);
    await page.waitForTimeout(1500);

    const outPath1 = path.join(OUTPUT_DIR, v.name);
    const outPath2 = path.join(INFERRA_DIR, v.name);

    await page.screenshot({ path: outPath1 });
    fs.copyFileSync(outPath1, outPath2);
    console.log(`Saved ${v.name} (Retina 2x)`);
  }

  await browser.close();
  console.log("\nAll README gallery screenshots successfully captured at 2x Retina resolution!");
}

main().catch(console.error);
