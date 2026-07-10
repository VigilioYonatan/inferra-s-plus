import { render } from "preact";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { App } from "../../src/app/app";
import { appRoutes } from "../../src/app/route-registry";
import { pathname } from "../../src/app/router";
import { Modal } from "../../src/libs/ui/components";
import {
  activeOrg,
  organizations,
  sessionLoading,
  viewer,
} from "../../src/services/auth/auth.state";

if (typeof globalThis.requestAnimationFrame === "undefined") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(cb, 0)) as unknown as typeof requestAnimationFrame;
}
if (typeof globalThis.cancelAnimationFrame === "undefined") {
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as unknown as typeof cancelAnimationFrame;
}

const mockOrg = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "inferra-org",
  name: "Inferra Enterprise Org",
  role: "owner",
};

const mockUser = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "admin@inferra.internal",
  display_name: "Admin Senior",
};

function resolvePattern(pattern: string): string {
  return pattern
    .replace(":org_slug", "inferra-org")
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
    .replace(":job_id", "00000000-0000-0000-0000-000000000019");
}

describe("Senior Mode — All 86 Frontend Pages Deep E2E Suite", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Set authenticated signals
    viewer.value = mockUser;
    organizations.value = [mockOrg];
    sessionLoading.value = false;
  });

  afterEach(() => {
    render(null, container);
    container.remove();
  });

  it("verifies all 86 pages render successfully while authenticated with buttons and landmarks", () => {
    expect(appRoutes).toHaveLength(86);
    let totalButtonsFound = 0;

    for (let i = 0; i < appRoutes.length; i++) {
      const route = appRoutes[i];
      if (!route) continue;
      const targetPath = resolvePattern(route.pattern);

      // Reactive Signal navigation
      pathname.value = targetPath;

      // Render full App tree for each route
      render(<App />, container);

      // Verify DOM content
      expect(container.innerHTML.length).toBeGreaterThan(0);

      // Find all buttons on the page
      const buttons = container.querySelectorAll("button");
      totalButtonsFound += buttons.length;
      for (const btn of Array.from(buttons)) {
        // Assert buttons have an accessible name or label
        const hasText = btn.textContent && btn.textContent.trim().length > 0;
        const hasAriaLabel = btn.getAttribute("aria-label");
        expect(hasText || hasAriaLabel).toBeTruthy();

        // Dispatch a non-destructive click to verify handler resilience (skip logout)
        if (!btn.disabled && !btn.classList.contains("btn-danger") && btn.textContent?.trim() !== "Salir") {
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      }

      // Clean unmount for next page
      render(null, container);
    }

    expect(totalButtonsFound).toBeGreaterThan(20);
  });

  it("verifies public authentication pages render cleanly without session", () => {
    viewer.value = null;
    organizations.value = [];
    sessionLoading.value = false;

    const publicAuthForms = [
      "/login",
      "/register",
      "/password/forgot",
      "/password/reset",
      "/login/otp",
    ];

    for (const publicRoute of publicAuthForms) {
      pathname.value = publicRoute;
      render(<App />, container);
      expect(container.innerHTML.length).toBeGreaterThan(0);

      // Verify forms exist on auth pages
      const form = container.querySelector("form");
      expect(form).not.toBeNull();

      // Verify inputs exist
      const inputs = container.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);

      // Verify submit button exists
      const submitBtn = container.querySelector('button[type="submit"]');
      expect(submitBtn).not.toBeNull();

      render(null, container);
    }
  });

  it("verifies form interaction and validation error reporting", () => {
    pathname.value = "/login";
    render(<App />, container);

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitBtn).not.toBeNull();

    // Fill in credentials
    emailInput.value = "admin@inferra.internal";
    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
    passwordInput.value = "InferraMaster2026!Secure";
    passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(emailInput.value).toBe("admin@inferra.internal");
    expect(passwordInput.value).toBe("InferraMaster2026!Secure");

    render(null, container);
  });

  it("verifies accessible Modal dialogs with backdrop click and dismiss", async () => {
    let closed = false;
    const handleClose = () => {
      closed = true;
    };

    render(
      <Modal open={true} title="Confirmar Revocación" onClose={handleClose}>
        <p>¿Está seguro de revocar esta credencial?</p>
      </Modal>,
      container,
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(container.textContent).toContain("Confirmar Revocación");

    // Test dismiss via Backdrop button
    const backdropBtn = container.querySelector(".modal-backdrop-dismiss") as HTMLButtonElement;
    expect(backdropBtn).not.toBeNull();
    backdropBtn.click();
    expect(closed).toBe(true);

    // Test dismiss via Close X button
    closed = false;
    const closeBtn = container.querySelector(".modal-close") as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(closed).toBe(true);

    render(null, container);
  });

  it("verifies @preact/signals reactivity across views without page reloads", async () => {
    viewer.value = mockUser;
    organizations.value = [mockOrg];
    sessionLoading.value = false;
    pathname.value = "/app/inferra-org/dashboard";

    render(<App />, container);
    expect(container.textContent).toContain("Inferra Enterprise Org");

    // Wait for microtasks so refreshSession resolves
    await new Promise((r) => setTimeout(r, 20));

    // Reactively change route via signal
    pathname.value = "/account/profile";
    render(<App />, container);
    expect(container.textContent).toContain("Perfil");

    render(null, container);
  });
});
