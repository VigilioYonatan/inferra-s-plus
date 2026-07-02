import tailwindcss from "@tailwindcss/vite";
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), preact()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: { target: "es2022", sourcemap: false },
});
