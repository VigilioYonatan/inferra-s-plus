import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "jsdom",
    include: [
      "tests/unit/**/*.spec.ts",
      "tests/unit/**/*.spec.tsx",
      "tests/components/**/*.spec.tsx",
    ],
    exclude: ["tests/e2e/**", "node_modules/**"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
