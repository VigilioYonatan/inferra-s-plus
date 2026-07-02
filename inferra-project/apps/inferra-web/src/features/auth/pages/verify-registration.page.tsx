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
export function VerifyRegistrationPage() {
  const [email, setEmail] = useState(
    new URLSearchParams(location.search).get("email") || "",
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function verify(e: Event) {
    e.preventDefault();
    const code = String(
      new FormData(e.currentTarget as HTMLFormElement).get("code"),
    );
    setError("");
    setBusy(true);
    try {
      await postJson("/api/v1/auth/email/verification/complete", {
        email,
        code,
      });
      await refreshSession();
      navigate("/onboarding/organization");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo verificar");
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    try {
      await postJson("/api/v1/auth/email/verification/request", { email });
      setMessage(
        "Si la cuenta necesita verificación, se enviará un nuevo código.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }
  return (
    <main class="auth-page simple">
      <section class="auth-card">
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>
        <h1>Verificar correo</h1>
        <p>
          Introduce el código de seis dígitos enviado a {email || "tu email"}{" "}
          para activar la cuenta.
        </p>
        {error && <Notice kind="danger">{error}</Notice>}
        {message && <Notice kind="success">{message}</Notice>}
        <form onSubmit={verify}>
          <label class="field">
            Correo
            <input
              type="email"
              required
              value={email}
              onInput={(e) =>
                setEmail((e.currentTarget as HTMLInputElement).value)
              }
              autoComplete="email"
            />
          </label>
          <Field
            name="code"
            label="Código temporal"
            autoComplete="one-time-code"
            required
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Verificando…" : "Verificar y entrar"}
          </Button>
        </form>
        <Button kind="ghost" type="button" onClick={resend}>
          Reenviar código
        </Button>
        <Link href="/login">Volver al login</Link>
      </section>
    </main>
  );
}
