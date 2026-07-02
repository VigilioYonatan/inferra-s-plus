import {
  BrandLogo,
  Heading,
  Link,
  Notice,
  Section,
} from "../../../libs/ui/components";

export function AuthErrorPage() {
  const params = new URLSearchParams(window.location.search);
  const errorReason =
    params.get("error_description") ||
    params.get("error") ||
    params.get("message") ||
    "No se pudo completar el flujo de autenticación o el proveedor de identidad rechazó la solicitud.";

  return (
    <div class="auth-page simple">
      <div class="auth-card" style={{ maxWidth: "480px" }}>
        <div class="brand" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <BrandLogo size="lg" variant="full" />
        </div>

        <Heading
          title="Error de Autenticación"
          desc="Ocurrió un inconveniente al validar tus credenciales de inicio de sesión o vincular la cuenta social."
        />

        <Notice kind="danger">{errorReason}</Notice>

        <Section title="¿Qué puedes hacer?">
          <ul
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              paddingLeft: "20px",
              margin: "10px 0 20px",
            }}
          >
            <li>
              Verifica que tu cuenta tenga un correo electrónico validado.
            </li>
            <li>
              Asegúrate de permitir las cookies y almacenamiento en el
              navegador.
            </li>
            <li>
              Si usas Google o GitHub, comprueba que autorizaste los permisos de
              perfil.
            </li>
          </ul>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/login"
              class="btn btn-primary"
              style={{ width: "100%", textAlign: "center" }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
