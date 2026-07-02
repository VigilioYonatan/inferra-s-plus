import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  BrandLogo,
  Button,
  CommandPalette,
  Link,
  SkipLink,
  StatusDot,
  ThemeToggle,
} from "../libs/ui/components";
import { MenuIcon } from "../libs/ui/icons";
import {
  activeOrg,
  logout,
  organizations,
  viewer,
} from "../services/auth/auth.state";
import { navigate, pathname } from "./router";

const menuItems = [
  // Overview
  { group: "Overview", path: "dashboard", label: "Dashboard" },
  { group: "Overview", path: "usage", label: "Uso y consumo" },
  { group: "Overview", path: "requests", label: "Trazas de solicitudes" },
  { group: "Overview", path: "quotas", label: "Cuotas y límites" },
  {
    group: "Overview",
    path: "observability/latency",
    label: "Latencia TTFT/TPOT",
  },
  {
    group: "Overview",
    path: "observability/errors",
    label: "Errores de inferencia",
  },
  { group: "Overview", path: "costs", label: "Costos estimados" },

  // Inference
  { group: "Inference", path: "playground", label: "Playground" },
  { group: "Inference", path: "models", label: "Catálogo de modelos" },
  { group: "Inference", path: "model-imports", label: "Importar Hugging Face" },
  { group: "Inference", path: "deployments", label: "Despliegues" },
  { group: "Inference", path: "routing", label: "Políticas de routing" },
  { group: "Inference", path: "developers", label: "Developer Portal & SDK" },

  // Evaluation
  { group: "Evaluation", path: "benchmarks", label: "Benchmarks" },
  { group: "Evaluation", path: "experiments", label: "Experimentos A/B" },
  { group: "Evaluation", path: "datasets", label: "Datasets" },
  { group: "Evaluation", path: "artifacts", label: "Artefactos RustFS" },

  // Management
  { group: "Management", path: "api-keys", label: "API Keys" },
  { group: "Management", path: "members", label: "Miembros del equipo" },
  { group: "Management", path: "invitations", label: "Invitaciones" },
  { group: "Management", path: "settings/webhooks", label: "Webhooks" },
  { group: "Management", path: "alerts", label: "Alertas operacionales" },
  { group: "Management", path: "audit", label: "Auditoría de eventos" },

  // Settings
  { group: "Settings", path: "settings/general", label: "Ajustes de org" },
  {
    group: "Settings",
    path: "settings/notifications",
    label: "Notificaciones",
  },
];

const adminItems = [
  { path: "/admin/system", label: "Salud de instancia" },
  { path: "/admin/gpu-nodes", label: "Nodos GPU" },
  { path: "/admin/jobs", label: "Trabajos asíncronos" },
  { path: "/admin/backups", label: "Copias de seguridad" },
  { path: "/admin/settings", label: "Ajustes de instancia" },
];

const accountItems = [
  { path: "/account/profile", label: "Perfil" },
  { path: "/account/security", label: "Seguridad y MFA" },
  { path: "/account/sessions", label: "Sesiones activas" },
  { path: "/account/connections", label: "Conexiones OAuth" },
];

function renderNavIcon(path: string) {
  const p = {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (path) {
    case "dashboard":
      return (
        <svg {...p}>
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      );
    case "usage":
      return (
        <svg {...p}>
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
      );
    case "requests":
      return (
        <svg {...p}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "quotas":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
        </svg>
      );
    case "observability/latency":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "observability/errors":
      return (
        <svg {...p}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "costs":
      return (
        <svg {...p}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "playground":
      return (
        <svg {...p}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "models":
      return (
        <svg {...p}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
        </svg>
      );
    case "model-imports":
      return (
        <svg {...p}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "deployments":
      return (
        <svg {...p}>
          <rect width="20" height="8" x="2" y="2" rx="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );
    case "routing":
      return (
        <svg {...p}>
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M6 15V9a3 3 0 0 1 3-3h6" />
        </svg>
      );
    case "developers":
      return (
        <svg {...p}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "benchmarks":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
        </svg>
      );
    case "experiments":
      return (
        <svg {...p}>
          <path d="M10 2v7.31L4.47 18.2a2 2 0 0 0 1.69 2.8h11.68a2 2 0 0 0 1.69-2.8L14 9.31V2" />
        </svg>
      );
    case "datasets":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "artifacts":
      return (
        <svg {...p}>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    case "api-keys":
      return (
        <svg {...p}>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      );
    case "members":
      return (
        <svg {...p}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "invitations":
      return (
        <svg {...p}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "settings/webhooks":
      return (
        <svg {...p}>
          <path d="M18 16.98h4v5h-4zM2 16.98h4v5H2zM10 2.02h4v5h-4z" />
          <path d="M12 7.02v5.96M4 16.98v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...p}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "audit":
      return (
        <svg {...p}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "settings/general":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "settings/notifications":
      return (
        <svg {...p}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "/admin/system":
      return (
        <svg {...p}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "/admin/gpu-nodes":
      return (
        <svg {...p}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 7h10v10H7z" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        </svg>
      );
    case "/admin/jobs":
      return (
        <svg {...p}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
        </svg>
      );
    case "/admin/backups":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "/admin/settings":
      return (
        <svg {...p}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "/account/profile":
      return (
        <svg {...p}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "/account/security":
      return (
        <svg {...p}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "/account/sessions":
      return (
        <svg {...p}>
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    case "/account/connections":
      return (
        <svg {...p}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}

export function AppLayout({ children }: { children: ComponentChildren }) {
  const org = activeOrg.value;
  const currentPath = pathname.value;
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global shortcut for Command Palette ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOrgChange = (slug: string) => {
    if (slug === "__new__") {
      navigate("/organizations/new");
    } else {
      navigate(`/app/${slug}/dashboard`);
    }
    setOpen(false);
  };

  return (
    <div class="app-shell">
      <SkipLink targetId="main-content" />

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        orgSlug={org?.slug}
      />

      <aside class={`sidebar ${open ? "opened" : ""}`}>
        <div class="sidebar-header">
          <Link
            href={`/app/${org?.slug || ""}/dashboard`}
            class="brand-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              padding: "2px 0",
            }}
          >
            <BrandLogo size="lg" variant="full" />
          </Link>
        </div>

        <div style={{ padding: "12px 14px 4px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--muted)",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            ORGANIZACIÓN
          </div>
          <select
            aria-label="Cambiar organización"
            value={org?.slug || ""}
            onChange={(e) => handleOrgChange(e.currentTarget.value)}
            style={{ fontSize: "13px" }}
          >
            {organizations.value.map((o) => (
              <option value={o.slug} key={o.id}>
                {o.name}
              </option>
            ))}
            <option value="__new__">+ Crear Organización…</option>
          </select>
        </div>

        <nav class="sidebar-nav" aria-label="Navegación principal">
          {menuItems.map((item, i) => {
            const isFirstInGroup =
              i === 0 || item.group !== menuItems[i - 1]?.group;
            const href = `/app/${org?.slug || ""}/${item.path}`;
            const isSelected =
              currentPath === href ||
              (item.path !== "dashboard" && currentPath.startsWith(href));

            return (
              <div key={item.path}>
                {isFirstInGroup && (
                  <div class="nav-group-title">{item.group}</div>
                )}
                <Link
                  class={`nav-link ${isSelected ? "selected" : ""}`}
                  href={href}
                  onClick={() => setOpen(false)}
                >
                  {renderNavIcon(item.path)}
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}

          <div class="nav-group-title">ADMINISTRACIÓN DE INSTANCIA</div>
          {adminItems.map((item) => {
            const isSelected = currentPath.startsWith(item.path);
            return (
              <Link
                key={item.path}
                class={`nav-link ${isSelected ? "selected" : ""}`}
                href={item.path}
                onClick={() => setOpen(false)}
              >
                {renderNavIcon(item.path)}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div class="nav-group-title">CUENTA</div>
          {accountItems.map((item) => {
            const isSelected = currentPath === item.path;
            return (
              <Link
                key={item.path}
                class={`nav-link ${isSelected ? "selected" : ""}`}
                href={item.path}
                onClick={() => setOpen(false)}
              >
                {renderNavIcon(item.path)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div class="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusDot status="online" pulse />
            <span>Self-hosted Linux</span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            v2.4.0
          </span>
        </div>
      </aside>

      <div class="shell-content">
        <header class="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              class="mobile-menu"
              type="button"
              aria-label="Abrir menú"
              onClick={() => setOpen((v) => !v)}
            >
              <MenuIcon size={18} />
            </button>
            <div class="breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BrandLogo size="xs" variant="icon" />
              <span style={{ color: "var(--muted)", fontWeight: 600, letterSpacing: "0.02em" }}>INFERЯA</span>
              <span class="breadcrumb-sep">/</span>
              <span style={{ fontWeight: 600 }}>{org?.name || "Workspace"}</span>
            </div>
          </div>

          <div class="top-actions">
            {/* Quick search button ⌘K */}
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              onClick={() => setPaletteOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--muted)",
                fontSize: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "4px 10px",
              }}
              title="Buscar en la plataforma (⌘K)"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>Buscar…</span>
              <kbd class="command-kbd">⌘K</kbd>
            </button>

            {/* Theme switcher */}
            <ThemeToggle />

            {/* User details */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span class="avatar">
                {viewer.value?.email.slice(0, 1).toUpperCase() || "U"}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {viewer.value?.email}
              </span>
            </div>

            <Button kind="ghost" size="sm" onClick={logout}>
              Salir
            </Button>
          </div>
        </header>

        <main id="main-content" class="page-content">
          {children}
        </main>
      </div>

      {open && (
        <button
          type="button"
          class="sidebar-backdrop"
          aria-label="Cerrar menú lateral"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
