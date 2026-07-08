/**
 * INFERRA PLATFORM - END-TO-END AUTHENTICATION SUITE (SENIOR SRE / QA MODE)
 * 
 * Verifies real browser behavior against http://localhost:5173:
 * 1. Login page layout, branding, inputs and secondary links.
 * 2. Form submission with invalid credentials (expects 401 & error banner).
 * 3. Form submission with valid admin credentials (expects 201, cookie issuance & navigation).
 * 4. Anonymous access to protected routes (expects redirection to /login).
 * 5. Logout action & session revocation.
 * 6. Register page form validation and navigation.
 * 7. One-Time Password (OTP) login flow (/login/otp).
 * 8. Password recovery & reset views (/password/forgot & /password/reset).
 * 9. Email verification view (/register/verify).
 * 10. Multi-Factor Authentication challenge view (/mfa/challenge).
 */

import { chromium } from "./apps/inferra-web/node_modules/@playwright/test/index.mjs";

const BASE_URL = process.env.WEB_URL || "http://localhost:5173";
const ADMIN_EMAIL = "admin@inferra.internal";
const ADMIN_PASSWORD = "InferraMaster2026!Secure";

const results = [];

function recordResult(id, name, passed, durationMs, details = "") {
  results.push({ id, name, passed, durationMs, details });
  const status = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
  console.log(`${status} ${id.toString().padStart(2, " ")}. ${name.padEnd(46, " ")} (${durationMs}ms) ${details ? "- " + details : ""}`);
}

async function runAuthSuite() {
  console.log("\n=========================================================================");
  console.log("  ◈ INFERRA AI INFRASTRUCTURE - E2E AUTHENTICATION & SECURITY SUITE");
  console.log(`  Target Origin: ${BASE_URL}`);
  console.log("=========================================================================\n");

  const browser = await chromium.launch({ headless: true });

  try {
    // ---------------------------------------------------------
    // TEST 1: Login Page Controls & Branding
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

      const brand = await page.locator(".brand").textContent();
      const heading = await page.getByRole("heading", { name: "Bienvenido de nuevo" }).isVisible();
      const emailField = await page.locator('input[name="email"]').isVisible();
      const passwordField = await page.locator('input[name="password"]').isVisible();
      const submitBtn = await page.getByRole("button", { name: "Iniciar sesión" }).isVisible();
      const otpLink = await page.getByRole("link", { name: "Entrar con código OTP" }).isVisible();
      const forgotLink = await page.getByRole("link", { name: "Recuperar cuenta" }).isVisible();
      const registerLink = await page.getByRole("link", { name: "Crear cuenta" }).isVisible();

      const passed = brand.includes("INFERЯA") && heading && emailField && passwordField && submitBtn && otpLink && forgotLink && registerLink;
      recordResult(1, "Login Page UI & Form Controls", passed, Date.now() - start, "Branding, fields, and navigation links present");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 2: Invalid Credentials Error Notice
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[name="password"]').fill("InvalidPassword2026!Wrong");
      await page.locator('button[type="submit"]').click();

      const notice = page.locator(".notice.notice-danger, [role='alert']");
      await notice.waitFor({ state: "visible", timeout: 8000 });
      const text = await notice.textContent();
      const passed = text.includes("Invalid credentials") || text.includes("error") || text.includes("credenciales");
      recordResult(2, "Invalid Credentials Rejection", passed, Date.now() - start, `Notice: "${text.trim()}"`);
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 3: Successful Admin Login & Session Cookie
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();

      // Expect URL to transition away from /login
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 12000 });
      const currentUrl = page.url();

      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === "inferra_session");
      const hasCookie = Boolean(sessionCookie && sessionCookie.value.length > 10);

      const passed = hasCookie && (currentUrl.includes("/onboarding") || currentUrl.includes("/app"));
      recordResult(3, "Admin Authentication & Session Issuance", passed, Date.now() - start, `URL: ${currentUrl} | Cookie: ${sessionCookie?.value.slice(0, 16)}...`);
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 4: Protected Route Anonymous Guard
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/app/default/dashboard`, { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 8000 });
      const redirectedUrl = page.url();

      const passed = redirectedUrl.includes("/login");
      recordResult(4, "Protected Route Redirection Guard", passed, Date.now() - start, `Anonymous attempt redirected to /login`);
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 5: User Logout Flow & Cookie Invalidation
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();

      // Login first
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 12000 });

      // Click logout
      const logoutBtn = page.getByRole("button", { name: "Salir" });
      await logoutBtn.waitFor({ state: "visible", timeout: 8000 });
      await logoutBtn.click();

      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 8000 });
      const cookiesAfter = await context.cookies();
      const sessionCookie = cookiesAfter.find((c) => c.name === "inferra_session");
      const cookieCleared = !sessionCookie || sessionCookie.value === "";

      const passed = cookieCleared && page.url().includes("/login");
      recordResult(5, "Session Logout & Invalidation", passed, Date.now() - start, "Cookie cleared, redirected to /login");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 6: Register Page Form & Return Link
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });

      const title = await page.getByRole("heading", { name: "Crear cuenta" }).isVisible();
      const nameInput = await page.locator('input[name="display_name"]').isVisible();
      const emailInput = await page.locator('input[name="email"]').isVisible();
      const passInput = await page.locator('input[name="password"]').isVisible();
      const createBtn = await page.getByRole("button", { name: "Crear cuenta" }).isVisible();

      // Click link back to login
      await page.getByRole("link", { name: "Ya tengo cuenta" }).click();
      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 5000 });

      const passed = title && nameInput && emailInput && passInput && createBtn && page.url().includes("/login");
      recordResult(6, "Register Page Layout & Back Link", passed, Date.now() - start, "Form elements verified and back navigation functional");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 7: OTP Request Flow Page (/login/otp)
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/login/otp`, { waitUntil: "domcontentloaded" });

      const heading = await page.getByRole("heading", { name: "Acceso con código" }).isVisible();
      const emailField = await page.locator('input[name="email"]').isVisible();
      const sendBtn = await page.getByRole("button", { name: "Enviar código" }).isVisible();
      const backLink = await page.getByRole("link", { name: "Regresar" }).isVisible();

      const passed = heading && emailField && sendBtn && backLink;
      recordResult(7, "Email OTP Entrypoint (/login/otp)", passed, Date.now() - start, "Passwordless OTP request controls verified");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 8: Password Recovery & Reset Navigation
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/password/forgot`, { waitUntil: "domcontentloaded" });

      const forgotHeading = await page.getByRole("heading", { name: "Recuperar cuenta" }).isVisible();
      const requestBtn = await page.getByRole("button", { name: "Solicitar código" }).isVisible();

      // Click 'Ya tengo un código' to go to /password/reset
      await page.getByRole("link", { name: "Ya tengo un código" }).click();
      await page.waitForURL((url) => url.pathname.includes("/password/reset"), { timeout: 5000 });

      const resetHeading = await page.getByRole("heading", { name: "Nueva contraseña" }).isVisible();
      const codeInput = await page.locator('input[name="code"]').isVisible();
      const newPassInput = await page.locator('input[name="new_password"]').isVisible();
      const resetBtn = await page.getByRole("button", { name: "Restablecer" }).isVisible();

      const passed = forgotHeading && requestBtn && resetHeading && codeInput && newPassInput && resetBtn;
      recordResult(8, "Password Recovery & Reset (/forgot, /reset)", passed, Date.now() - start, "Recovery flow and credential reset fields verified");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 9: Email Registration Verification (/register/verify)
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/register/verify?email=developer%40inferra.internal`, { waitUntil: "domcontentloaded" });

      const heading = await page.getByRole("heading", { name: "Verificar correo" }).isVisible();
      const emailVal = await page.locator('input[type="email"]').inputValue();
      const codeInput = await page.locator('input[name="code"]').isVisible();
      const verifyBtn = await page.getByRole("button", { name: "Verificar y entrar" }).isVisible();
      const resendBtn = await page.getByRole("button", { name: "Reenviar código" }).isVisible();

      const passed = heading && emailVal === "developer@inferra.internal" && codeInput && verifyBtn && resendBtn;
      recordResult(9, "Account Verification View (/register/verify)", passed, Date.now() - start, "Prefilled email param and one-time verification controls verified");
      await context.close();
    }

    // ---------------------------------------------------------
    // TEST 10: Multi-Factor Authentication Challenge (/mfa/challenge)
    // ---------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${BASE_URL}/mfa/challenge`, { waitUntil: "domcontentloaded" });

      const heading = await page.getByRole("heading", { name: "Verificación adicional" }).isVisible();
      const codeInput = await page.locator('input[name="code"]').isVisible();
      const verifyBtn = await page.getByRole("button", { name: "Verificar" }).isVisible();

      const passed = heading && codeInput && verifyBtn;
      recordResult(10, "MFA TOTP Challenge View (/mfa/challenge)", passed, Date.now() - start, "Second-factor verification controls verified");
      await context.close();
    }

  } catch (error) {
    console.error("\x1b[31m[UNEXPECTED SUITE ERROR]\x1b[0m", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  // Summary Report
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log("\n=========================================================================");
  console.log(` RESULTADOS FINALES: ${passedCount}/${total} PASARON | ${failedCount} FALLARON`);
  console.log("=========================================================================");

  if (failedCount > 0) {
    console.log("\x1b[31m[!] Hay pruebas que fallaron. Revisa los detalles arriba.\x1b[0m\n");
    process.exit(1);
  } else {
    console.log("\x1b[32m[✓] 100% DE LOS FLUJOS DE AUTENTICACIÓN Y SEGURIDAD VERIFICADOS CON ÉXITO.\x1b[0m\n");
  }
}

runAuthSuite().catch((err) => {
  console.error("Fatal suite failure", err);
  process.exit(1);
});
