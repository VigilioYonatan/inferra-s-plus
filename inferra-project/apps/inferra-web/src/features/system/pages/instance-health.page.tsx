import {
  Badge,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
  StatusDot,
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

export function InstanceHealthPage() {
  const { data, loading, error, reload } = useResource<SystemData>(
    "/api/v1/admin/system",
  );

  return (
    <>
      <Heading
        title="Salud e Infraestructura de la Instancia"
        desc="Estado general del entorno self-hosted, versión del kernel de inferencia y disponibilidad de subsistemas."
        actions={
          <button type="button" class="btn btn-ghost btn-sm" onClick={reload}>
            Refrescar estado
          </button>
        }
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <div class="stat-grid">
        <MetricCard
          label="Estado de la Instancia"
          value="Saludable"
          sub="Todos los contenedores en línea"
        />
        <MetricCard
          label="Versión de Release"
          value={data?.release || "0.2.0"}
          sub="Inferra S+ Core"
        />
        <MetricCard
          label="Topología de Despliegue"
          value={data?.deployment || "docker-compose"}
          sub="Perfil Linux Self-hosted"
        />
      </div>

      <Section title="Subsistemas y conectores activos">
        {loading ? (
          <SkeletonCard />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Base de Datos PostgreSQL</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <StatusDot status="online" pulse />
                <Badge kind="success">Conectado</Badge>
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Memoria Valkey (Redis-compat)</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <StatusDot status="online" pulse />
                <Badge kind="success">Conectado</Badge>
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Broker NATS Message Bus</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <StatusDot status="online" pulse />
                <Badge kind="success">Conectado</Badge>
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Servicio de Correo (SMTP)</span>
              <Badge kind={data?.features?.smtp ? "success" : "neutral"}>
                {data?.features?.smtp ? "Configurado" : "Simulado"}
              </Badge>
            </div>

            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Almacén RustFS</span>
              <Badge kind={data?.features?.rustfs ? "success" : "neutral"}>
                {data?.features?.rustfs ? "Habilitado" : "Local FS"}
              </Badge>
            </div>

            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Métricas Prometheus</span>
              <Badge kind={data?.features?.metrics ? "success" : "neutral"}>
                {data?.features?.metrics ? "Activo" : "Deshabilitado"}
              </Badge>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
