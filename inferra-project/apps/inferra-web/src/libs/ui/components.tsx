import type { ComponentChildren, ComponentProps } from "preact";
import { Component } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { navigate } from "../../app/router";
import {
  setTheme,
  type Theme,
  themeSignal,
} from "../../services/theme/theme.state";
import { CheckIcon, CloseIcon, SearchIcon } from "./icons";

export function Button({
  children,
  kind = "primary",
  size = "md",
  loading = false,
  ...props
}: {
  children: ComponentChildren;
  kind?: "primary" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
} & ComponentProps<"button">) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      class={`btn btn-${kind} btn-${size} ${loading ? "is-loading" : ""} ${props.class || ""}`}
    >
      {loading ? <span class="btn-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Link({
  href,
  children,
  ...props
}: {
  href: string;
  children: ComponentChildren;
} & ComponentProps<"a">) {
  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

export function Field({
  label,
  type = "text",
  error,
  hint,
  ...props
}: {
  label: string;
  type?: string;
  error?: string;
  hint?: string;
  name?: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  onInput?: (e: any) => void;
  class?: string;
  [key: string]: unknown;
}) {
  const id =
    typeof props.id === "string"
      ? props.id
      : typeof props.name === "string"
        ? `field-${props.name}`
        : undefined;
  return (
    <label class={`field ${error ? "has-error" : ""}`} for={id}>
      <span class="field-label">
        {label}{" "}
        {props.required ? (
          <span class="required-mark" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <input
        id={id}
        type={type as any}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-err` : undefined}
        {...(props as any)}
      />
      {hint && !error ? <small class="field-hint">{hint}</small> : null}
      {error && id ? (
        <small id={`${id}-err`} role="alert" class="field-error">
          {error}
        </small>
      ) : null}
    </label>
  );
}

export function Section({
  title,
  children,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ComponentChildren;
  children: ComponentChildren;
}) {
  return (
    <section class="panel" style={{ marginBottom: "20px" }}>
      <div class="section-head">
        <div>
          <h2>{title}</h2>
          {sub && <p class="section-sub">{sub}</p>}
        </div>
        {actions ? <div class="section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "danger" | "success" | "warning";
  children: ComponentChildren;
}) {
  return (
    <div
      class={`notice notice-${kind}`}
      role={kind === "danger" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function Empty({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: ComponentChildren;
}) {
  return (
    <div class="empty" role="status">
      <div class="empty-illustration" aria-hidden="true">
        <svg
          width="56"
          height="56"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="var(--accent)"
            fill-opacity="0.08"
          />
          <path
            d="M32 14L48 23V41L32 50L16 41V23L32 14Z"
            stroke="var(--border-hover)"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
          <path
            d="M32 23L42 28.5V39.5L32 45L22 39.5V28.5L32 23Z"
            fill="var(--accent)"
            fill-opacity="0.2"
            stroke="var(--accent)"
            stroke-width="1.5"
          />
          <path
            d="M32 23V34M42 28.5L32 34M22 28.5L32 34M32 34V45"
            stroke="var(--accent)"
            stroke-width="1.2"
          />
          <circle cx="32" cy="14" r="2.5" fill="var(--accent)" />
          <circle cx="48" cy="23" r="2.5" fill="var(--accent)" />
          <circle cx="48" cy="41" r="2.5" fill="var(--accent)" />
          <circle cx="32" cy="50" r="2.5" fill="var(--accent)" />
          <circle cx="16" cy="41" r="2.5" fill="var(--accent)" />
          <circle cx="16" cy="23" r="2.5" fill="var(--accent)" />
        </svg>
      </div>
      <p class="empty-label">{label}</p>
      {description ? <p class="empty-desc">{description}</p> : null}
      {action ? <div class="empty-action">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} class="spinner-container">
      <div class="spinner" />
      <span class="sr-only">{label}</span>
    </div>
  );
}

export function Heading({
  title,
  desc,
  actions,
}: {
  title: string;
  desc: string;
  actions?: ComponentChildren;
}) {
  return (
    <header class="page-heading">
      <div class="page-heading-main">
        <div
          class="eyebrow"
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--muted)",
            textTransform: "uppercase",
            fontWeight: "600",
            marginBottom: "4px",
          }}
        >
          INFERЯA S+ PLATFORM
        </div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {actions ? (
        <div class="page-heading-actions" style={{ marginTop: "14px" }}>
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function Badge({
  kind = "neutral",
  children,
}: {
  kind?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ComponentChildren;
}) {
  return <span class={`badge badge-${kind}`}>{children}</span>;
}

export function StatusDot({
  status = "online",
  pulse = false,
}: {
  status?: "online" | "warning" | "danger" | "offline";
  pulse?: boolean;
}) {
  const colorMap = {
    online: "var(--good)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    offline: "var(--muted)",
  };
  return (
    <span
      role="status"
      class={`status-dot ${pulse ? "pulsing" : ""}`}
      style={{ backgroundColor: colorMap[status] }}
      aria-label={`Estado: ${status}`}
    />
  );
}

function getMetricIcon(label: string) {
  const l = label.toLowerCase();
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

  if (l.includes("modelo") || l.includes("model")) {
    return (
      <svg {...p}>
        <path d="M12 2a4 4 0 0 0-4 4c0 1.6 1 3 2.4 3.7L9 14h6l-1.4-4.3c1.4-.7 2.4-2.1 2.4-3.7a4 4 0 0 0-4-4z" />
        <path d="M9 18h6M10 22h4M9 14v4M15 14v4" />
      </svg>
    );
  }
  if (l.includes("solicitud") || l.includes("tráfico") || l.includes("request") || l.includes("muestra")) {
    return (
      <svg {...p}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }
  if (l.includes("token") || l.includes("factura") || l.includes("consumo")) {
    return (
      <svg {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (l.includes("incurso") || l.includes("inferencia") || l.includes("activa") || l.includes("gpu") || l.includes("nodo") || l.includes("utilización") || l.includes("vram")) {
    return (
      <svg {...p}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    );
  }
  if (l.includes("latencia") || l.includes("ttft") || l.includes("tpot") || l.includes("tiempo") || l.includes("percentil") || l.includes("p50") || l.includes("p95") || l.includes("p99")) {
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (l.includes("error") || l.includes("fallo")) {
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (l.includes("costo") || l.includes("precio") || l.includes("ahorro") || l.includes("gasto")) {
    return (
      <svg {...p}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  change,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  change?: { value: string; positive: boolean };
  icon?: ComponentChildren;
}) {
  const iconNode = icon !== undefined ? icon : getMetricIcon(label);
  return (
    <div class="metric-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div class="metric-label" style={{ margin: 0 }}>
          {label}
        </div>
        {iconNode ? (
          <div
            class="metric-icon-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            {iconNode}
          </div>
        ) : null}
      </div>
      <div class="metric-value">{value}</div>
      {sub ? <div class="metric-sub">{sub}</div> : null}
      {change ? (
        <div
          class="metric-sub"
          style={{
            color: change.positive ? "var(--good)" : "var(--danger)",
            fontWeight: "600",
          }}
        >
          {change.positive ? "↑" : "↓"} {change.value}
        </div>
      ) : null}
    </div>
  );
}

export function CopyButton({
  text,
  label = "Copiar",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Button
      kind="ghost"
      size="sm"
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copiado al portapapeles" : label}
      style={{ whiteSpace: "nowrap", flexShrink: 0 }}
    >
      {copied ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <CheckIcon size={12} />
          Copiado
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: ComponentChildren }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div class="tabs-nav" role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={active === it.id}
          class={`tab-btn ${active === it.id ? "active" : ""}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const current = themeSignal.value;

  const handleSelect = (t: Theme) => {
    setTheme(t);
  };

  return (
    <fieldset
      class="theme-toggle"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "2px",
        margin: 0,
      }}
      aria-label="Cambiar tema visual"
    >
      <legend class="sr-only">Cambiar tema visual</legend>
      <button
        type="button"
        title="Modo Claro"
        aria-label="Modo Claro"
        aria-pressed={current === "light"}
        onClick={() => handleSelect("light")}
        style={{
          background: current === "light" ? "var(--panel)" : "transparent",
          border:
            current === "light"
              ? "1px solid var(--border)"
              : "1px solid transparent",
          color: current === "light" ? "var(--text)" : "var(--muted)",
          borderRadius: "6px",
          padding: "5px 7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
      <button
        type="button"
        title="Modo Oscuro"
        aria-label="Modo Oscuro"
        aria-pressed={current === "dark"}
        onClick={() => handleSelect("dark")}
        style={{
          background: current === "dark" ? "var(--panel)" : "transparent",
          border:
            current === "dark"
              ? "1px solid var(--border)"
              : "1px solid transparent",
          color: current === "dark" ? "var(--text)" : "var(--muted)",
          borderRadius: "6px",
          padding: "5px 7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
      <button
        type="button"
        title="Modo Sistema (Automático)"
        aria-label="Modo Sistema"
        aria-pressed={current === "system"}
        onClick={() => handleSelect("system")}
        style={{
          background: current === "system" ? "var(--panel)" : "transparent",
          border:
            current === "system"
              ? "1px solid var(--border)"
              : "1px solid transparent",
          color: current === "system" ? "var(--text)" : "var(--muted)",
          borderRadius: "6px",
          padding: "5px 7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </button>
    </fieldset>
  );
}

export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} class="skip-link sr-only focus:not-sr-only">
      Saltar al contenido principal
    </a>
  );
}

export function Skeleton({
  class: className = "",
  width,
  height,
  rounded = false,
  style,
}: {
  class?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  style?: Record<string, string | number>;
}) {
  const inlineStyle: Record<string, string | number> = { ...style };
  if (width)
    inlineStyle.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    inlineStyle.height = typeof height === "number" ? `${height}px` : height;
  if (rounded) inlineStyle.borderRadius = "9999px";

  return (
    <div
      class={`skeleton ${className}`}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 3,
  gap = 8,
}: {
  lines?: number;
  gap?: number;
}) {
  return (
    <div
      class="skeleton-text-group"
      style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      class="panel skeleton-card"
      aria-hidden="true"
      style={{ padding: "20px" }}
    >
      <Skeleton height={24} width="40%" style={{ marginBottom: "12px" }} />
      <Skeleton height={14} width="70%" style={{ marginBottom: "20px" }} />
      <SkeletonText lines={2} gap={10} />
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Skeleton height={36} width={100} />
        <Skeleton height={36} width={80} />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div class="table-scroll skeleton-table" aria-hidden="true">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton height={16} width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton height={16} width={c === 0 ? "50%" : "75%"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ComponentChildren;
  actions?: ComponentChildren;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div class="modal-backdrop">
      <button
        type="button"
        class="modal-backdrop-dismiss"
        aria-label="Cerrar modal"
        onClick={onClose}
      />
      <div
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
      >
        <div class="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            class="modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div class="modal-body">{children}</div>
        {actions ? <div class="modal-footer">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}) {
  if (!open) return null;

  return (
    <div
      class="drawer-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--modal-backdrop)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <button
        type="button"
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: "none",
          cursor: "default",
        }}
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <div
        class="drawer-panel"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          background: "var(--panel)",
          borderLeft: "1px solid var(--border)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.3)",
          overflowY: "auto",
        }}
      >
        <div
          class="drawer-header"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px" }}>{title}</h3>
          <button
            type="button"
            class="modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div class="drawer-body" style={{ padding: "20px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function CommandPalette({
  open,
  onClose,
  orgSlug,
}: {
  open: boolean;
  onClose: () => void;
  orgSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const base = orgSlug ? `/app/${orgSlug}` : "/app";

  const allItems = [
    {
      label: "Dashboard principal",
      path: `${base}/dashboard`,
      group: "Vistas",
    },
    {
      label: "Uso y consumo de tokens",
      path: `${base}/usage`,
      group: "Vistas",
    },
    {
      label: "Consola de Playground",
      path: `${base}/playground`,
      group: "Inferencia",
    },
    {
      label: "Catálogo de Modelos",
      path: `${base}/models`,
      group: "Inferencia",
    },
    {
      label: "Importar Modelo (Hugging Face)",
      path: `${base}/model-imports`,
      group: "Inferencia",
    },
    {
      label: "Despliegues activos",
      path: `${base}/deployments`,
      group: "Inferencia",
    },
    {
      label: "Políticas de Routing",
      path: `${base}/routing`,
      group: "Inferencia",
    },
    {
      label: "API Keys y credenciales",
      path: `${base}/api-keys`,
      group: "Gestión",
    },
    { label: "Miembros del equipo", path: `${base}/members`, group: "Gestión" },
    { label: "Webhooks", path: `${base}/settings/webhooks`, group: "Gestión" },
    { label: "Auditoría de eventos", path: `${base}/audit`, group: "Gestión" },
    {
      label: "Estimación de costos",
      path: `${base}/costs`,
      group: "Observabilidad",
    },
    {
      label: "Latencia TTFT / TPOT",
      path: `${base}/observability/latency`,
      group: "Observabilidad",
    },
    {
      label: "Errores operacionales",
      path: `${base}/observability/errors`,
      group: "Observabilidad",
    },
    { label: "Benchmarks", path: `${base}/benchmarks`, group: "Evaluación" },
    {
      label: "Experimentos A/B",
      path: `${base}/experiments`,
      group: "Evaluación",
    },
    { label: "Datasets", path: `${base}/datasets`, group: "Datos" },
    { label: "Artefactos RustFS", path: `${base}/artifacts`, group: "Datos" },
    { label: "Perfil de usuario", path: "/account/profile", group: "Cuenta" },
    { label: "Seguridad y MFA", path: "/account/security", group: "Cuenta" },
    { label: "Sesiones activas", path: "/account/sessions", group: "Cuenta" },
  ];

  const filtered = allItems.filter(
    (it) =>
      it.label.toLowerCase().includes(query.toLowerCase()) ||
      it.group.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div class="command-palette-backdrop">
      <button
        type="button"
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: "none",
        }}
        onClick={onClose}
        aria-label="Cerrar paleta"
      />
      <div class="command-palette-box">
        <div class="command-input-wrap">
          <SearchIcon size={16} color="var(--muted)" />
          <input
            ref={inputRef}
            type="text"
            class="command-input"
            placeholder="Escribe para buscar páginas o comandos…"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered[0]) {
                navigate(filtered[0].path);
                onClose();
              }
            }}
          />
          <span class="command-kbd">ESC</span>
        </div>
        <ul class="command-list">
          {filtered.length === 0 ? (
            <li
              style={{
                padding: "16px",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              No se encontraron resultados
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.path}>
                <button
                  type="button"
                  class="command-item"
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  <span>{item.label}</span>
                  <span class="command-kbd">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          class="panel error-boundary-fallback"
          role="alert"
          style={{ margin: "24px 0", padding: "24px" }}
        >
          <h2>Algo salió mal al cargar esta vista</h2>
          <p class="section-sub">
            {this.state.error?.message || "Ocurrió un error inesperado."}
          </p>
          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <Button
              kind="primary"
              type="button"
              onClick={() => this.setState({ hasError: false })}
            >
              Reintentar
            </Button>
            <Button
              kind="ghost"
              type="button"
              onClick={() => window.location.reload()}
            >
              Recargar página completa
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { BrandLogo } from "./brand-logo";

