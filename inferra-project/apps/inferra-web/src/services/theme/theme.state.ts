import { signal } from "@preact/signals";

export type Theme = "dark" | "light" | "system";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem("inferra_theme") as Theme | null;
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
  } catch {}
  return "dark";
}

export const themeSignal = signal<Theme>(getInitialTheme());

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined" || !document?.documentElement) return;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const resolved = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

export function setTheme(theme: Theme) {
  themeSignal.value = theme;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("inferra_theme", theme);
    } catch {}
    applyTheme(theme);
  }
}

// Initial application
if (typeof window !== "undefined") {
  applyTheme(themeSignal.value);

  // Listen to OS theme changes when in system mode
  if (typeof window.matchMedia === "function") {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    if (media.addEventListener) {
      media.addEventListener("change", () => {
        if (themeSignal.value === "system") {
          applyTheme("system");
        }
      });
    }
  }
}
