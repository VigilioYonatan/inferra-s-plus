import fs from "fs";
import path from "path";
import { chromium } from "../inferra-project/apps/inferra-web/node_modules/@playwright/test/index.mjs";

const FRAMES_DIR = "temp_frames";
const VIDEO_DIR = "docs/assets/videos";

async function main() {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // Helper for UI cursor & caption injection
  await page.addInitScript(() => {
    window.addEventListener("DOMContentLoaded", () => {
      const cursor = document.createElement("div");
      cursor.id = "showcase-demo-cursor";
      cursor.style.cssText = `
        position: fixed;
        width: 18px;
        height: 18px;
        background: rgba(16, 185, 129, 0.85);
        border: 2px solid #ffffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transition: transform 0.15s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.7);
        transform: translate(-50%, -50%);
        left: 200px;
        top: 200px;
      `;
      document.body.appendChild(cursor);

      const caption = document.createElement("div");
      caption.id = "showcase-demo-caption";
      caption.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(9, 9, 11, 0.92);
        color: #fafafa;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 9999px;
        padding: 8px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        z-index: 999999;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(caption);
    });
  });

  async function setCaption(text, badge = "INFERЯA S+") {
    await page.evaluate(({ text, badge }) => {
      const cap = document.getElementById("showcase-demo-caption");
      if (cap) {
        cap.innerHTML = `<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 9999px; padding: 2px 8px; font-size: 11px;">${badge}</span> ${text}`;
        cap.style.opacity = "1";
      }
    }, { text, badge });
  }

  async function moveCursorTo(selector, click = false) {
    const box = await page.locator(selector).first().boundingBox().catch(() => null);
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.evaluate(({ x, y }) => {
        const c = document.getElementById("showcase-demo-cursor");
        if (c) {
          c.style.left = `${x}px`;
          c.style.top = `${y}px`;
        }
      }, { x, y });
      await page.waitForTimeout(400);

      if (click) {
        await page.evaluate(() => {
          const c = document.getElementById("showcase-demo-cursor");
          if (c) {
            c.style.transform = "translate(-50%, -50%) scale(0.75)";
            c.style.background = "#3b82f6";
          }
        });
        await page.waitForTimeout(150);
        await page.locator(selector).first().click().catch(() => {});
        await page.evaluate(() => {
          const c = document.getElementById("showcase-demo-cursor");
          if (c) {
            c.style.transform = "translate(-50%, -50%) scale(1)";
            c.style.background = "rgba(16, 185, 129, 0.85)";
          }
        });
        await page.waitForTimeout(300);
      }
    }
  }

  let frameIdx = 0;
  async function snap(durationMs = 800) {
    frameIdx++;
    const num = String(frameIdx).padStart(3, "0");
    const p = path.join(FRAMES_DIR, `frame_${num}.png`);
    await page.screenshot({ path: p });
    console.log(`Captured ${p} (hold ${durationMs}ms)`);
    return { path: p, duration: durationMs };
  }

  const manifest = [];

  // 1. Initial Login
  console.log("1. Starting login flow...");
  await page.goto("http://localhost:5173/login");
  await page.waitForTimeout(1000);
  await setCaption("Autenticación Segura · Consola Soberana LLMOps", "ZERO-TRUST");
  manifest.push(await snap(1200));

  await page.locator('input[type="email"]').fill("admin@inferra.internal");
  await page.locator('input[type="password"]').fill("InferraMaster2026!Secure");
  manifest.push(await snap(800));

  await moveCursorTo('button[type="submit"]', true);
  await page.waitForTimeout(1800);

  // 2. Dashboard in Dark Mode
  console.log("2. Navigating to Dashboard (Dark Mode)...");
  await page.goto("http://localhost:5173/app/test-org-1794214109520/dashboard");
  await page.waitForTimeout(1200);
  await setCaption("Panel de Control: 5 Modelos vLLM · 4.8M Tokens · SLO 99.98%", "DARK MODE");
  manifest.push(await snap(1800));

  await moveCursorTo('.dashboard-kpi, .card', false);
  manifest.push(await snap(1000));

  // 3. Switch to Light Mode
  console.log("3. Switching to Light Mode...");
  await setCaption("Conmutación a Modo Claro Instantáneo vía ThemeToggle", "THEME TOGGLE");
  await moveCursorTo('button[aria-label="Modo Claro"]', true);
  await page.waitForTimeout(800);
  await setCaption("Modo Claro Activo: Contraste Puro & BrandLogo Adaptable", "LIGHT MODE");
  manifest.push(await snap(1800));

  // 4. Navigate to Playground
  console.log("4. Navigating to Playground...");
  await setCaption("Playground de Inferencia: Modelos Llama 3.3, DeepSeek & Mistral", "INFERENCE");
  await moveCursorTo('a[href*="/playground"]', true);
  await page.waitForTimeout(1200);
  manifest.push(await snap(1200));

  // Click preset
  const presetBtn = page.locator('button:has-text("Explicar PagedAttention"), button:has-text("Prompt"), button').nth(4);
  if (await presetBtn.isVisible()) {
    await presetBtn.click().catch(() => {});
  } else {
    await page.locator('textarea, input[type="text"]').first().fill("Explicar arquitectura vLLM con PagedAttention en 2 líneas.").catch(() => {});
  }
  await setCaption("Generación SSE en Tiempo Real · Monitoreo de TTFT", "STREAMING");
  manifest.push(await snap(1500));

  // 5. Navigate to Model Catalog
  console.log("5. Navigating to Models Catalog...");
  await setCaption("Catálogo de Modelos: Ventanas de Contexto hasta 131k Tokens", "CATALOG");
  await moveCursorTo('a[href*="/models"]', true);
  await page.waitForTimeout(1200);
  manifest.push(await snap(1600));

  // 6. Navigate to Quotas
  console.log("6. Navigating to Quotas...");
  await setCaption("Presupuesto de Tokens y Reserva Atómica vía Valkey 8", "QUOTAS & LEASES");
  await moveCursorTo('a[href*="/quotas"]', true);
  await page.waitForTimeout(1200);
  manifest.push(await snap(1600));

  // 7. Navigate to Latency SLO
  console.log("7. Navigating to Latency SLO...");
  await setCaption("Telemetría en Vivo: P50 (19ms) · P95 (27ms) · Cumplimiento de SLO", "SLO METRICS");
  await moveCursorTo('a[href*="/observability/latency"]', true);
  await page.waitForTimeout(1200);
  manifest.push(await snap(1800));

  // 8. Return to Dark Mode
  console.log("8. Returning to Dark Mode...");
  await setCaption("Regreso a Modo Oscuro · Máxima Ergonomía & Productividad", "DARK MODE");
  await moveCursorTo('button[aria-label="Modo Oscuro"]', true);
  await page.waitForTimeout(800);
  manifest.push(await snap(1800));

  fs.writeFileSync("temp_frames/manifest.json", JSON.stringify(manifest, null, 2));

  // Close context to finish video
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalVideoPath = path.join(VIDEO_DIR, "inferra-walkthrough.webm");
    fs.copyFileSync(videoPath, finalVideoPath);
    console.log(`Video saved cleanly to ${finalVideoPath}`);
  }

  console.log(`\nCaptured ${manifest.length} frames ready for GIF compilation!`);
}

main().catch(console.error);
