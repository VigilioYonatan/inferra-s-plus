import {
  Badge,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { useResource } from "../../../services/http/use-resource";

type SystemData = {
  product: string;
  release: string;
  deployment: string;
  features: {
    registration: boolean;
    google: boolean;
    facebook: boolean;
    smtp: boolean;
    rustfs: boolean;
    metrics: boolean;
  };
  auth_cookie_secure: boolean;
};

export function InstanceSettingsPage() {
  const { data, loading, error } = useResource<SystemData>(
    "/api/v1/admin/system",
  );

  return (
    <>
      <Heading
        title="Configuración de la Plataforma"
        desc="Parámetros operativos del host. Los cambios de infraestructura y variables de entorno se orquestan mediante Docker Compose."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Políticas de seguridad e inicio de sesión">
        {loading ? (
          <SkeletonCard />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  Registro abierto de usuarios
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Permite que nuevos usuarios se registren sin invitación previa
                </div>
              </div>
              <Badge
                kind={data?.features?.registration ? "success" : "neutral"}
              >
                {data?.features?.registration
                  ? "Habilitado"
                  : "Restringido (Solo invitación)"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  Cookies de sesión HttpOnly con flag Secure
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Requiere HTTPS en el dominio publicado por Caddy
                </div>
              </div>
              <Badge kind={data?.auth_cookie_secure ? "success" : "warning"}>
                {data?.auth_cookie_secure
                  ? "Secure (HTTPS)"
                  : "Development (HTTP)"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  Autenticación OAuth Google
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Permite iniciar sesión con cuentas de Google Workspace
                </div>
              </div>
              <Badge kind={data?.features?.google ? "success" : "neutral"}>
                {data?.features?.google ? "Configurado" : "No configurado"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  Almacenamiento de artefactos S3 / RustFS
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Persistencia de pesos de modelos y datasets
                </div>
              </div>
              <Badge kind={data?.features?.rustfs ? "info" : "neutral"}>
                {data?.features?.rustfs
                  ? "RustFS S3 API"
                  : "Local Disk Storage"}
              </Badge>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
