import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: process.env.WEB_E2E_URL || "http://localhost:5173",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
