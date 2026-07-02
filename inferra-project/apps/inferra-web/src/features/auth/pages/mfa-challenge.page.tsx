import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  BrandLogo,
  Button,
  Field,
  Notice,
} from "../../../libs/ui/components";
import { refreshSession } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
export function MfaChallengePage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    const body = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    setBusy(true);
    setError("");
    try {
      await postJson("/api/v1/auth/mfa/challenge/verify", body);
      await refreshSession();
      navigate("/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo verificar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main class="auth-page simple">
      <section class="auth-card">
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>
        <h1>Verificación adicional</h1>
        <p>Introduce tu código de autenticador o uno de recuperación.</p>
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={submit}>
          <Field
            label="Código MFA"
            name="code"
            required
            autoComplete="one-time-code"
          />
          <Button disabled={busy} type="submit">
            Verificar
          </Button>
        </form>
      </section>
    </main>
  );
}
