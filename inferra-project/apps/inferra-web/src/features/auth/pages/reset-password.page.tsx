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
export function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  async function submit(e: Event) {
    e.preventDefault();
    try {
      await postJson(
        "/api/v1/auth/password/recovery/complete",
        Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)),
      );
      navigate("/login");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo recuperar");
    }
  }
  return (
    <main class="auth-page simple">
      <section class="auth-card">
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>
        <h1>Nueva contraseña</h1>
        <p>Introduce el código recibido por correo y tu nueva clave segura.</p>
        {message && <Notice kind="danger">{message}</Notice>}
        <form onSubmit={submit}>
          <Field label="Email" name="email" type="email" required />
          <Field label="Código temporal" name="code" required />
          <Field
            label="Nueva contraseña (12+ caracteres)"
            name="new_password"
            type="password"
            required
          />
          <Button type="submit">Restablecer contraseña</Button>
        </form>
        <div class="auth-footer" style={{ justifyContent: "center" }}>
          <Link href="/login">Volver a iniciar sesión</Link>
        </div>
      </section>
    </main>
  );
}
