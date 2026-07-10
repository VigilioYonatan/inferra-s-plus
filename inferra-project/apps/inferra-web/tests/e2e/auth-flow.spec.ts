import { expect, test } from "@playwright/test";

test.describe("Authentication & Security E2E Suite (Senior Mode)", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to guarantee isolated state
    await context.clearCookies();
  });

  test("1. Login Page UI & Form Controls Verification", async ({ page }) => {
    await page.goto("/login");

    // Brand and headers
    await expect(page.locator(".brand")).toContainText("INFERЯA");
    await expect(
      page.getByRole("heading", { name: "Bienvenido de nuevo" }),
    ).toBeVisible();

    // Input fields & submit button
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitBtn = page.getByRole("button", { name: "Iniciar sesión" });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Secondary navigation links
    await expect(page.getByRole("link", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Entrar con código OTP" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Recuperar cuenta" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Crear cuenta" }),
    ).toBeVisible();
  });

  test("2. Login Validation & Error Feedback on Bad Credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    // Attempt login with invalid credentials
    await page.fill('input[name="email"]', "admin@inferra.internal");
    await page.fill('input[name="password"]', "WrongPassword2026!Wrong");
    await page.click('button[type="submit"]');

    // Verify error notice appears with alert role
    const notice = page.locator(".notice.notice-danger, [role='alert']");
    await expect(notice).toBeVisible({ timeout: 5000 });
    await expect(notice).toContainText(/Invalid credentials|error/i);
  });

  test("3. Successful Admin Login, Cookie Issuance & Protected Redirection", async ({
    page,
    context,
  }) => {
    page.on("console", (msg) =>
      console.log("PW CONSOLE:", msg.type(), msg.text()),
    );
    page.on("requestfailed", (req) =>
      console.log("PW REQ FAILED:", req.url(), req.failure()?.errorText),
    );
    page.on("response", (res) => {
      if (res.url().includes("/api/"))
        console.log("PW RES:", res.url(), res.status());
    });

    await page.goto("/login");

    // Fill valid credentials
    await page.fill('input[name="email"]', "admin@inferra.internal");
    await page.fill('input[name="password"]', "InferraMaster2026!Secure");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirection to authenticated view (/onboarding or /app/...)
    await expect(page).toHaveURL(/\/(onboarding|app)/, { timeout: 10000 });

    // Verify session cookie was set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "inferra_session");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value.length).toBeGreaterThan(10);
  });

  test("4. Protected Route Guard (Unauthenticated Access Redirects to /login)", async ({
    page,
  }) => {
    // Navigate directly to protected route while anonymous
    await page.goto("/app/default/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    await page.goto("/settings/general");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    await page.goto("/models");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test("5. Logout Flow & Session Revocation", async ({ page, context }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@inferra.internal");
    await page.fill('input[name="password"]', "InferraMaster2026!Secure");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(onboarding|app)/, { timeout: 10000 });

    // Click 'Salir' in AppLayout header
    const logoutBtn = page.getByRole("button", { name: "Salir" });
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // Verify redirected back to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    // Verify session cookie cleared
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "inferra_session");
    expect(sessionCookie?.value || "").toBe("");
  });

  test("6. Register Page Form & Return to Login", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeVisible();
    await expect(page.locator('input[name="display_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear cuenta" }),
    ).toBeVisible();

    // Verify return to login link
    const loginLink = page.getByRole("link", { name: "Ya tengo cuenta" });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("7. Email OTP Flow Page (/login/otp)", async ({ page }) => {
    await page.goto("/login/otp");

    await expect(
      page.getByRole("heading", { name: "Acceso con código" }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enviar código" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Regresar" })).toBeVisible();
  });

  test("8. Password Recovery & Reset Flow (/password/forgot & /password/reset)", async ({
    page,
  }) => {
    // Forgot Password
    await page.goto("/password/forgot");
    await expect(
      page.getByRole("heading", { name: "Recuperar cuenta" }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Solicitar código" }),
    ).toBeVisible();

    // Navigate to Reset Password
    await page.getByRole("link", { name: "Ya tengo un código" }).click();
    await expect(page).toHaveURL(/\/password\/reset/);

    await expect(
      page.getByRole("heading", { name: "Nueva contraseña" }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="code"]')).toBeVisible();
    await expect(page.locator('input[name="new_password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Restablecer" }),
    ).toBeVisible();
  });

  test("9. Verify Registration Page (/register/verify)", async ({ page }) => {
    await page.goto("/register/verify?email=test%40inferra.internal");

    await expect(
      page.getByRole("heading", { name: "Verificar correo" }),
    ).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveValue(
      "test@inferra.internal",
    );
    await expect(page.locator('input[name="code"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Verificar y entrar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reenviar código" }),
    ).toBeVisible();
  });

  test("10. MFA Challenge Page (/mfa/challenge)", async ({ page }) => {
    await page.goto("/mfa/challenge");

    await expect(
      page.getByRole("heading", { name: "Verificación adicional" }),
    ).toBeVisible();
    await expect(page.locator('input[name="code"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Verificar" })).toBeVisible();
  });
});
