import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Field,
  Heading,
  Link,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { viewer } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";

export function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "danger";
    text: string;
  } | null>(null);

  const handleRequest = async () => {
    setResending(true);
    setNotice(null);
    try {
      await postJson("/api/v1/auth/email/verification/request", {
        email: viewer.value?.email,
      });
      setNotice({
        kind: "success",
        text: "Hemos enviado un código de verificación a tu correo.",
      });
    } catch (err) {
      setNotice({
        kind: "danger",
        text:
          err instanceof Error ? err.message : "Error solicitando verificación",
      });
    } finally {
      setResending(false);
    }
  };

  const handleComplete = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      await postJson("/api/v1/auth/email/verification/complete", { token });
      setNotice({
        kind: "success",
        text: "¡Tu correo ha sido verificado con éxito!",
      });
      setTimeout(() => navigate("/account/profile"), 1500);
    } catch (err) {
      setNotice({
        kind: "danger",
        text:
          err instanceof Error
            ? err.message
            : "Código de verificación inválido o expirado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "540px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href="/account/profile"
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a tu perfil
        </Link>
      </div>

      <Heading
        title="Verificación de Correo Electrónico"
        desc="Confirma tu dirección de email para habilitar todas las capacidades de tu cuenta."
      />

      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Section title="Confirmar código">
        <form onSubmit={handleComplete}>
          <div
            style={{
              marginBottom: "16px",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Usuario actual:{" "}
            <strong style={{ color: "var(--text)" }}>
              {viewer.value?.email}
            </strong>
          </div>

          <Field
            label="Código o Token de verificación"
            type="text"
            value={token}
            required
            placeholder="Ingresa el token de verificación recibido"
            onInput={(e: any) => setToken(e.target.value)}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button kind="primary" type="submit" loading={loading}>
              Verificar correo
            </Button>
            <Button
              kind="ghost"
              type="button"
              loading={resending}
              onClick={handleRequest}
            >
              Reenviar código
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
