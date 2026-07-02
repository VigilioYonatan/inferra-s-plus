import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  BrandLogo,
  Button,
  Field,
  Link,
  Notice,
} from "../../../libs/ui/components";
import { postJson } from "../../../services/http/api-client";
export function RegisterPage() {
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
      const result = await postJson<{
        email: string;
        verification_required: boolean;
      }>("/api/v1/auth/register", body);
      navigate(`/register/verify?email=${encodeURIComponent(result.email)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar");
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
        <h1>Crear cuenta</h1>
        <p>El registro depende de la política de la instancia.</p>
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={submit}>
          <Field label="Nombre" name="display_name" autoComplete="name" />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Contraseña (mínimo 12 caracteres)"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <Button disabled={busy} type="submit">
            Crear cuenta
          </Button>
        </form>
        <div class="auth-footer" style={{ justifyContent: "center" }}>
          <Link href="/login">Ya tengo cuenta</Link>
        </div>
      </section>
    </main>
  );
}
