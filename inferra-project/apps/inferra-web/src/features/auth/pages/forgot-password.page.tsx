import { useState } from "preact/hooks";
import {
  BrandLogo,
  Button,
  Field,
  Link,
  Notice,
} from "../../../libs/ui/components";
import { postJson } from "../../../services/http/api-client";
export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  async function submit(e: Event) {
    e.preventDefault();
    const email = String(
      new FormData(e.currentTarget as HTMLFormElement).get("email"),
    );
    try {
      await postJson("/api/v1/auth/password/recovery/request", { email });
      setMessage(
        "Si existe una cuenta con ese correo, recibirás instrucciones.",
      );
    } catch {
      setMessage("No se pudo procesar la solicitud. Intenta más tarde.");
    }
  }
  return (
    <main class="auth-page simple">
      <section class="auth-card">
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>
        <h1>Recuperar cuenta</h1>
        <p>Solicita un código temporal para crear otra contraseña.</p>
        {message && <Notice>{message}</Notice>}
        <form onSubmit={submit}>
          <Field label="Email" type="email" name="email" required />
          <Button type="submit">Solicitar código</Button>
        </form>
        <div class="auth-footer">
          <Link href="/password/reset">Ya tengo un código</Link>
          <Link href="/login">Volver a iniciar sesión</Link>
        </div>
      </section>
    </main>
  );
}
