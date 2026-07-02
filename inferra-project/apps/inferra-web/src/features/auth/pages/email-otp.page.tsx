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
export function EmailOtpPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    const data = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    setBusy(true);
    setError("");
    try {
      if (step === "request") {
        const address = String(data.email || "");
        await postJson("/api/v1/auth/otp/request", { email: address });
        setEmail(address);
        setStep("verify");
      } else {
        const result = await postJson<{ requires_mfa: boolean }>(
          "/api/v1/auth/otp/verify",
          { email, code: data.code },
        );
        if (result.requires_mfa) {
          navigate("/mfa/challenge");
        } else {
          await refreshSession();
          navigate("/onboarding");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
        <h1>Acceso con código</h1>
        <p>
          {step === "request"
            ? "Recibirás un código de un solo uso de seis dígitos."
            : "Introduce el código enviado a tu correo. Caduca en cinco minutos."}
        </p>
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={submit}>
          {step === "request" ? (
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          ) : (
            <Field
              label="Código de 6 dígitos"
              name="code"
              required
              autoComplete="one-time-code"
            />
          )}
          <Button disabled={busy} type="submit">
            {busy
              ? "Procesando…"
              : step === "request"
                ? "Enviar código"
                : "Verificar e ingresar"}
          </Button>
        </form>
        <div class="auth-footer" style={{ justifyContent: "center" }}>
          <Link href="/login">Regresar</Link>
        </div>
      </section>
    </main>
  );
}
