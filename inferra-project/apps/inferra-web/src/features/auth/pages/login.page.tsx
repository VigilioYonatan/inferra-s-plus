import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  BrandLogo,
  Button,
  Field,
  Link,
  Notice,
} from "../../../libs/ui/components";
import { refreshSession } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
export function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const body = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    try {
      const result = await postJson<{ requires_mfa: boolean }>(
        "/api/v1/auth/password/login",
        body,
      );
      if (result.requires_mfa) {
        navigate("/mfa/challenge");
      } else {
        await refreshSession();
        navigate("/onboarding");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main class="auth-page">
      <div class="auth-decoration">
        <BrandLogo size="lg" variant="full" style={{ marginBottom: "28px" }} />
        <div class="eyebrow">SELF-HOSTED AI INFRASTRUCTURE</div>
        <h1>
          Potencia tus modelos.
          <br />
          <em>Controla cada token.</em>
        </h1>
        <p>
          Tu infraestructura de inferencia, diseñada para seguridad, rendimiento
          y observabilidad.
        </p>
        <div class="auth-details">
          <span>◉ GPU Monitoring</span>
          <span>◉ OpenAI Compatible API</span>
          <span>◉ Private by Design</span>
        </div>
        <div
          class="auth-preview-card"
          style={{
            marginTop: "36px",
            padding: "20px 24px",
            borderRadius: "12px",
            background: "rgba(18, 18, 20, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(12px)",
            maxWidth: "460px",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted)",
              }}
            >
              Clúster Operativo vLLM
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                color: "var(--good)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--good)",
                  boxShadow: "0 0 8px var(--good)",
                }}
              />
              v0.6.4 Engine Ready
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              fontSize: "12px",
            }}
          >
            <div>
              <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                Tiempo 1er Token (P50)
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text)",
                }}
              >
                14.2 ms
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                Velocidad Generación
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text)",
                }}
              >
                184 tok/s
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                Aislamiento Multi-Tenant
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text)",
                }}
              >
                Zero-Trust RBAC
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                Compatibilidad API
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text)",
                }}
              >
                OpenAI v1 SSE
              </div>
            </div>
          </div>
        </div>
      </div>
      <section class="auth-card">
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>
        <h2>Bienvenido de nuevo</h2>
        <p>Inicia sesión en tu consola privada.</p>
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={submit}>
          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button disabled={busy} type="submit">
            {busy ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </form>
        <div class="auth-divider">o continuar con</div>
        <div class="social-links">
          <a class="btn btn-ghost" href="/api/v1/auth/oauth/google/start">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            Google
          </a>
          <a class="btn btn-ghost" href="/api/v1/auth/oauth/facebook/start">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
        </div>
        <div class="auth-footer">
          <Link href="/login/otp">Entrar con código OTP</Link>
          <Link href="/password/forgot">Recuperar cuenta</Link>
          <Link href="/register">Crear cuenta</Link>
        </div>
      </section>
    </main>
  );
}
