import { useState } from "preact/hooks";
import {
  Button,
  Field,
  Heading,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { postJson } from "../../../services/http/api-client";
export function SecurityPage() {
  const [secret, setSecret] = useState<{
    secret: string;
    otpauth_url: string;
  } | null>(null);
  const [recovery, setRecovery] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function enroll() {
    setError("");
    try {
      setSecret(
        await postJson<{ secret: string; otpauth_url: string }>(
          "/api/v1/auth/mfa/enroll",
          {},
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }
  async function verify(e: Event) {
    e.preventDefault();
    const code = String(
      new FormData(e.currentTarget as HTMLFormElement).get("code"),
    );
    try {
      const result = await postJson<{ recovery_codes: string[] }>(
        "/api/v1/auth/mfa/enroll/verify",
        { code },
      );
      setRecovery(result.recovery_codes);
      setSecret(null);
      setSuccess(
        "MFA activado. Guarda los códigos de recuperación en un lugar seguro.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }
  return (
    <>
      <Heading
        title="Seguridad de cuenta"
        desc="Añade un factor TOTP y conserva tus códigos de recuperación."
      />
      {error && <Notice kind="danger">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <Section title="Autenticación de dos factores">
        {!secret && !recovery.length && (
          <Button onClick={enroll}>Configurar autenticador</Button>
        )}
        {secret && (
          <>
            <p>
              Usa la URL otpauth en tu aplicación de autenticación. El secreto
              se muestra solo durante configuración.
            </p>
            <code class="secret">{secret.otpauth_url}</code>
            <form onSubmit={verify}>
              <Field
                label="Código del autenticador"
                name="code"
                autoComplete="one-time-code"
                required
              />
              <Button type="submit">Confirmar y activar</Button>
            </form>
          </>
        )}
        {recovery.length > 0 && (
          <>
            <p>Los códigos se mostrarán una sola vez:</p>
            <ul>
              {recovery.map((code) => (
                <li>
                  <code>{code}</code>
                </li>
              ))}
            </ul>
            <Button
              kind="ghost"
              onClick={() => navigator.clipboard.writeText(recovery.join("\n"))}
            >
              Copiar códigos
            </Button>
            <Button kind="ghost" onClick={() => setRecovery([])}>
              He guardado los códigos
            </Button>
          </>
        )}
      </Section>
    </>
  );
}
