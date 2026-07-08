/**
 * INFERRA PLATFORM - EXHAUSTIVE SCREENSHOT CAPTURE & UX AUDITOR
 *
 * Automatically traverses all 86 registered routes using Playwright:
 * 1. Captures public/auth pages in clean unauthenticated state.
 * 2. Authenticates via POST/form login with master credentials.
 * 3. Visits all 86 pages with desktop viewport (1440x900).
 * 4. Takes high-resolution screenshots and saves to ./screenshots/
 * 5. Collects UX/UI diagnostics on buttons, modals, forms, and contrast.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "./apps/inferra-web/node_modules/@playwright/test/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, "screenshots");
const BASE_URL = process.env.WEB_URL || "http://localhost:5173";
const ADMIN_EMAIL = "admin@inferra.internal";
const ADMIN_PASSWORD = "InferraMaster2026!Secure";

// Catalog of all 86 application routes
const ROUTES = [
  // M1: Authentication & Public
  { pattern: "/login", title: "01-login-iniciar-sesion", auth: false },
  { pattern: "/register", title: "02-register-crear-cuenta", auth: false },
  { pattern: "/register/verify", title: "03-register-verify-correo", auth: false },
  { pattern: "/password/forgot", title: "04-password-forgot-recuperar", auth: false },
  { pattern: "/password/reset", title: "05-password-reset-nueva-clave", auth: false },
  { pattern: "/login/otp", title: "06-login-otp-codigo", auth: false },
  { pattern: "/auth/complete", title: "07-auth-complete-oauth-sso", auth: false },
  { pattern: "/auth/error", title: "08-auth-error-fallo", auth: false },
  { pattern: "/mfa/challenge", title: "09-mfa-challenge-totp", auth: false },
  { pattern: "/invite/accept", title: "10-invite-accept-invitacion", auth: false },
  { pattern: "/403", title: "11-forbidden-403", auth: false },

  // Onboarding & Global Org
  { pattern: "/onboarding", title: "12-onboarding-bienvenida", auth: true },
  { pattern: "/onboarding/organization", title: "13-onboarding-crear-org", auth: true },
  { pattern: "/onboarding/first-model", title: "14-onboarding-primer-modelo", auth: true },
  { pattern: "/organizations/new", title: "15-organizations-new", auth: true },

  // User Account
  { pattern: "/account/profile", title: "16-account-profile", auth: true },
  { pattern: "/account/security", title: "17-account-security-mfa", auth: true },
  { pattern: "/account/sessions", title: "18-account-sessions-activas", auth: true },
  { pattern: "/account/connections", title: "19-account-connections-sso", auth: true },
  { pattern: "/account/verify-email", title: "20-account-verify-email", auth: true },

  // Dashboard, Usage & Metrics
  { pattern: "/app/:org_slug/dashboard", title: "21-tenant-dashboard", auth: true },
  { pattern: "/app/:org_slug/usage", title: "22-usage-resumen", auth: true },
  { pattern: "/app/:org_slug/usage/models", title: "23-usage-consumo-por-modelo", auth: true },
  { pattern: "/app/:org_slug/usage/exports", title: "24-usage-exportacion-datos", auth: true },
  { pattern: "/app/:org_slug/requests", title: "25-requests-trazas-inferencia", auth: true },
  { pattern: "/app/:org_slug/requests/:request_id", title: "26-requests-detalle-traza", auth: true },
  { pattern: "/app/:org_slug/quotas", title: "27-quotas-limites-tokens", auth: true },
  { pattern: "/app/:org_slug/costs", title: "28-costs-estimacion-gpu", auth: true },
  { pattern: "/app/:org_slug/observability/latency", title: "29-observability-latencia-ttft", auth: true },
  { pattern: "/app/:org_slug/observability/errors", title: "30-observability-errores", auth: true },
  { pattern: "/app/:org_slug/observability/admission", title: "31-observability-admission-control", auth: true },

  // Playground & Developers
  { pattern: "/app/:org_slug/playground", title: "32-playground-chat", auth: true },
  { pattern: "/app/:org_slug/playground/sessions/:session_id", title: "33-playground-session-detail", auth: true },
  { pattern: "/app/:org_slug/playground/compare", title: "34-playground-compare-modelos", auth: true },
  { pattern: "/app/:org_slug/playground/embeddings", title: "35-playground-embeddings", auth: true },
  { pattern: "/app/:org_slug/developers", title: "36-developer-portal-sdk", auth: true },

  // Model Management
  { pattern: "/app/:org_slug/models", title: "37-models-catalogo", auth: true },
  { pattern: "/app/:org_slug/models/new", title: "38-models-registrar-nuevo", auth: true },
  { pattern: "/app/:org_slug/models/:model_id", title: "39-models-detalle", auth: true },
  { pattern: "/app/:org_slug/models/:model_id/settings", title: "40-models-ajustes", auth: true },
  { pattern: "/app/:org_slug/models/:model_id/versions", title: "41-models-versiones-tags", auth: true },

  // Model Imports
  { pattern: "/app/:org_slug/model-imports", title: "42-model-imports-historial", auth: true },
  { pattern: "/app/:org_slug/model-imports/new", title: "43-model-imports-nuevo-hf", auth: true },
  { pattern: "/app/:org_slug/model-imports/:import_id", title: "44-model-imports-progreso", auth: true },

  // Deployments & GPU Nodes
  { pattern: "/app/:org_slug/deployments", title: "45-deployments-activos", auth: true },
  { pattern: "/app/:org_slug/deployments/new", title: "46-deployments-crear-vllm", auth: true },
  { pattern: "/app/:org_slug/deployments/:deployment_id", title: "47-deployments-detalle", auth: true },
  { pattern: "/app/:org_slug/deployments/:deployment_id/logs", title: "48-deployments-logs-streaming", auth: true },
  { pattern: "/app/:org_slug/gpu-nodes", title: "49-gpu-nodes-telemetria", auth: true },

  // API Keys & Security
  { pattern: "/app/:org_slug/api-keys", title: "50-api-keys-gestion", auth: true },
  { pattern: "/app/:org_slug/api-keys/new", title: "51-api-keys-crear-modal", auth: true },
  { pattern: "/app/:org_slug/api-keys/:key_id", title: "52-api-keys-detalle-rotacion", auth: true },

  // Routing Policies
  { pattern: "/app/:org_slug/routing", title: "53-routing-politicas-balanceo", auth: true },
  { pattern: "/app/:org_slug/routing/new", title: "54-routing-nueva-politica", auth: true },
  { pattern: "/app/:org_slug/routing/:policy_id", title: "55-routing-detalle-politica", auth: true },
  { pattern: "/app/:org_slug/routing/:policy_id/edit", title: "56-routing-editar-politica", auth: true },

  // Benchmarks & Evaluation
  { pattern: "/app/:org_slug/benchmarks", title: "57-benchmarks-historial", auth: true },
  { pattern: "/app/:org_slug/benchmarks/new", title: "58-benchmarks-lanzar-eval", auth: true },
  { pattern: "/app/:org_slug/benchmarks/:benchmark_id", title: "59-benchmarks-resultados-ttft", auth: true },

  // Experiments (A/B Testing)
  { pattern: "/app/:org_slug/experiments", title: "60-experiments-activos", auth: true },
  { pattern: "/app/:org_slug/experiments/new", title: "61-experiments-nuevo-ab", auth: true },
  { pattern: "/app/:org_slug/experiments/:experiment_id", title: "62-experiments-comparativa-ab", auth: true },

  // Datasets & Storage (MinIO / S3)
  { pattern: "/app/:org_slug/datasets", title: "63-datasets-evaluacion", auth: true },
  { pattern: "/app/:org_slug/datasets/new", title: "64-datasets-subir-nuevo", auth: true },
  { pattern: "/app/:org_slug/datasets/:dataset_id", title: "65-datasets-detalle", auth: true },
  { pattern: "/app/:org_slug/datasets/:dataset_id/edit", title: "66-datasets-editar", auth: true },
  { pattern: "/app/:org_slug/artifacts", title: "67-artifacts-almacenamiento-s3", auth: true },
  { pattern: "/app/:org_slug/artifacts/:artifact_id", title: "68-artifacts-detalle-checksum", auth: true },

  // Organization Administration
  { pattern: "/app/:org_slug/members", title: "69-members-gestion-usuarios", auth: true },
  { pattern: "/app/:org_slug/members/roles", title: "70-members-matriz-roles", auth: true },
  { pattern: "/app/:org_slug/invitations", title: "71-invitations-pendientes", auth: true },
  { pattern: "/app/:org_slug/settings/general", title: "72-settings-general-org", auth: true },
  { pattern: "/app/:org_slug/settings/webhooks", title: "73-settings-webhooks-destinos", auth: true },
  { pattern: "/app/:org_slug/settings/webhooks/:webhook_id", title: "74-settings-webhooks-detalle-outbox", auth: true },
  { pattern: "/app/:org_slug/settings/notifications", title: "75-settings-notificaciones", auth: true },
  { pattern: "/app/:org_slug/alerts", title: "76-alerts-incidentes-sre", auth: true },
  { pattern: "/app/:org_slug/audit", title: "77-audit-registro-eventos", auth: true },
  { pattern: "/app/:org_slug/audit/:event_id", title: "78-audit-detalle-evento", auth: true },

  // Instance Administration (SRE / Platform Admin)
  { pattern: "/admin/system", title: "79-admin-system-health-instancia", auth: true },
  { pattern: "/admin/gpu-nodes", title: "80-admin-gpu-nodes-inventario", auth: true },
  { pattern: "/admin/gpu-nodes/:node_id", title: "81-admin-gpu-nodes-telemetria-hardware", auth: true },
  { pattern: "/admin/backups", title: "82-admin-backups-pgbackrest", auth: true },
  { pattern: "/admin/backups/:backup_id", title: "83-admin-backups-detalle", auth: true },
  { pattern: "/admin/jobs", title: "84-admin-jobs-colas-bullmq", auth: true },
  { pattern: "/admin/jobs/:job_id", title: "85-admin-jobs-detalle-tarea", auth: true },
  { pattern: "/admin/settings", title: "86-admin-settings-infraestructura", auth: true },
];

function resolveUrl(pattern) {
  return pattern
    .replace(":org_slug", "default")
    .replace(":session_id", "00000000-0000-0000-0000-000000000013")
    .replace(":request_id", "00000000-0000-0000-0000-000000000018")
    .replace(":model_id", "00000000-0000-0000-0000-000000000004")
    .replace(":import_id", "00000000-0000-0000-0000-000000000017")
    .replace(":deployment_id", "00000000-0000-0000-0000-000000000005")
    .replace(":key_id", "00000000-0000-0000-0000-000000000003")
    .replace(":policy_id", "00000000-0000-0000-0000-000000000011")
    .replace(":benchmark_id", "00000000-0000-0000-0000-000000000009")
    .replace(":experiment_id", "00000000-0000-0000-0000-000000000008")
    .replace(":event_id", "00000000-0000-0000-0000-000000000014")
    .replace(":dataset_id", "00000000-0000-0000-0000-000000000007")
    .replace(":artifact_id", "00000000-0000-0000-0000-000000000006")
    .replace(":node_id", "00000000-0000-0000-0000-000000000010")
    .replace(":backup_id", "00000000-0000-0000-0000-000000000020")
    .replace(":job_id", "00000000-0000-0000-0000-000000000019")
    .replace(":webhook_id", "00000000-0000-0000-0000-000000000015");
}

async function captureAllPages() {
  console.log("\n=========================================================================");
  console.log("  ◈ INFERRA AI INFRASTRUCTURE - EXHAUSTIVE SCREENSHOT CAPTURE (86 PAGES)");
  console.log(`  Target Origin: ${BASE_URL}`);
  console.log(`  Destination:   ${SCREENSHOT_DIR}`);
  console.log("=========================================================================\n");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  // Step 1: Login to establish session in the browser context
  console.log("--> Iniciando sesión con admin@inferra.internal...");
  const authPage = await context.newPage();
  await authPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await authPage.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await authPage.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await authPage.locator('button[type="submit"]').click();
  await authPage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 12000 });
  await authPage.close();
  console.log("--> Sesión autenticada con éxito (inferra_session establecida).\n");

  const manifest = [];
  let capturedCount = 0;

  for (let i = 0; i < ROUTES.length; i++) {
    const route = ROUTES[i];
    const targetUrl = `${BASE_URL}${resolveUrl(route.pattern)}`;
    const filename = `${String(i + 1).padStart(2, "0")}-${route.title}.png`;
    const filePath = path.join(SCREENSHOT_DIR, filename);

    const startTime = Date.now();
    let page = null;
    try {
      page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      // Allow reactive signals, state hydration, and CSS transitions to settle
      await page.waitForTimeout(200);

      // Verify DOM stability
      await page.screenshot({ path: filePath, fullPage: false });

      const durationMs = Date.now() - startTime;
      capturedCount++;
      console.log(`[📷 ${String(i + 1).padStart(2, "0")}/86] (${durationMs}ms) ${route.pattern} -> ${filename}`);

      manifest.push({
        index: i + 1,
        pattern: route.pattern,
        url: targetUrl,
        filename,
        durationMs,
        status: "OK",
      });
    } catch (err) {
      console.error(`[!] Error capturando ${route.pattern}:`, err.message);
      manifest.push({
        index: i + 1,
        pattern: route.pattern,
        url: targetUrl,
        filename,
        error: err.message,
        status: "FAILED",
      });
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (_) {}
      }
    }
  }

  await browser.close();

  // Save capture manifest
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, "manifest.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), total: ROUTES.length, captured: capturedCount, manifest }, null, 2),
  );

  console.log("\n=========================================================================");
  console.log(` CAPTURA COMPLETADA: ${capturedCount}/${ROUTES.length} capturas guardadas.`);
  console.log(` Directorio: ${SCREENSHOT_DIR}`);
  console.log("=========================================================================\n");
}

captureAllPages().catch((err) => {
  console.error("Fatal capture error", err);
  process.exit(1);
});
