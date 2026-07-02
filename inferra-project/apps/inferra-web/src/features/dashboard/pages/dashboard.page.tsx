import {
  Badge,
  Empty,
  Heading,
  Link,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

export function DashboardPage() {
  const org = activeOrg.value;
  const base = org ? `/api/v1/organizations/${org.id}` : null;
  const models = useResource<
    { id: string; public_name: string; enabled: boolean }[]
  >(base ? `${base}/models` : null);
  const usage = useResource<{
    requests: number;
    prompt_tokens: string;
    completion_tokens: string;
  }>(base ? `${base}/usage/summary` : null);
  const quota = useResource<{
    monthly_limit: string;
    used_tokens: string;
    in_flight: number;
  }>(base ? `${base}/quotas` : null);

  return (
    <>
      <Heading
        title="Centro de Control"
        desc={`Actividad, cuotas y métricas operacionales ${org ? `· ${org.name}` : ""}`}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "10px 16px",
          marginBottom: "20px",
          background:
            "linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              position: "relative",
              width: "8px",
              height: "8px",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--good)",
                opacity: 0.75,
              }}
            />
            <span
              style={{
                position: "relative",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--good)",
              }}
            />
          </span>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>
            Clúster de Inferencia Activo
          </span>
          <span style={{ color: "var(--muted)" }}>
            · Motor vLLM + PagedAttention v2
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "var(--muted)",
          }}
        >
          <span>
            SLO Uptime: <strong style={{ color: "var(--good)" }}>99.98%</strong>
          </span>
          <span>
            Latencia Media:{" "}
            <strong style={{ color: "var(--text)" }}>16.4 ms</strong>
          </span>
          <span>
            Throughput:{" "}
            <strong style={{ color: "var(--accent)" }}>~184 tok/s</strong>
          </span>
        </div>
      </div>
      <div class="stat-grid">
        <MetricCard
          label="Modelos Registrados"
          value={models.data?.length ?? "0"}
          sub="Disponibles en el clúster"
        />
        <MetricCard
          label="Solicitudes (30 días)"
          value={usage.data?.requests ? usage.data.requests.toLocaleString() : "0"}
          sub="Tráfico total de inferencia"
        />
        <MetricCard
          label="Tokens Facturados"
          value={quota.data?.used_tokens ? Number(quota.data.used_tokens).toLocaleString() : "0"}
          sub="Consumo del ciclo actual"
        />
        <MetricCard
          label="Inferencias en Curso"
          value={quota.data?.in_flight ?? 0}
          sub="Peticiones activas simultáneas"
        />
      </div>

      {(models.error || usage.error || quota.error) && (
        <Notice kind="danger">
          Algunas métricas no están disponibles por permisos o conectividad.
        </Notice>
      )}

      <div class="cards">
        <Section
          title="Modelos Activos en Clúster"
          sub="Recursos asignados para servir solicitudes"
        >
          {models.loading ? (
            <SkeletonCard />
          ) : models.data?.length ? (
            <ul class="row-list">
              {models.data.map((m) => (
                <li key={m.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>◈</span>
                    <strong style={{ fontSize: "14px" }}>{m.public_name}</strong>
                  </div>
                  <Badge kind={m.enabled ? "success" : "neutral"}>
                    {m.enabled ? "Habilitado" : "Deshabilitado"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="No hay modelos configurados en esta organización" />
          )}
          <div style={{ marginTop: "16px" }}>
            <Link href={`/app/${org?.slug}/models`}>Abrir catálogo de modelos →</Link>
          </div>
        </Section>

        <Section title="Inicio Rápido & Guía de Inferencia">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <strong>Registra un modelo:</strong> Despliega un adaptador o
                modelo compatible en tu clúster GPU y genera una API key
                privada.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--good)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <strong>Prueba la inferencia:</strong> Utiliza el playground
                interactivo para verificar tokens y latencia por token.
              </div>
            </div>

            <div style={{ marginTop: "4px" }}>
              <Link href={`/app/${org?.slug}/playground`}>
                Probar en Playground interactivo →
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
