import {
  Badge,
  Heading,
  MetricCard,
  Section,
  SkeletonCard,
  StatusDot,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

export function AdmissionMetricsPage() {
  const org = activeOrg.value;
  const quotas = useResource<any>(
    org ? `/api/v1/organizations/${org.id}/quotas` : null,
  );
  const routing = useResource<any[]>(
    org ? `/api/v1/organizations/${org.id}/routing` : null,
  );

  const activePolicies = routing.data?.filter((p) => p.enabled) || [];
  const maxConcurrency = activePolicies.reduce(
    (acc, curr) => acc + (curr.concurrency_cap || 16),
    0,
  );

  return (
    <>
      <Heading
        title="Control de Admisión & Telemetría de Colas"
        desc="Monitorea la saturación del runtime vLLM, política de encolamiento y rechazos HTTP 429 para mantener los SLOs de inferencia."
      />

      <div class="stat-grid">
        <MetricCard
          label="Capacidad Concurrente Global"
          value={maxConcurrency || 64}
          sub="Slots de inferencia simultáneos"
        />
        <MetricCard
          label="Tasa de Rechazo (429)"
          value="0.0%"
          sub="Solicitudes descartadas por saturación"
        />
        <MetricCard
          label="Políticas Activas"
          value={activePolicies.length}
          sub="Reglas de routing vigentes"
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <Section title="Estado de la cola del scheduler (vLLM)">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
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
              <span style={{ color: "var(--muted)" }}>
                Límite de colas en Valkey:
              </span>
              <Badge kind="info">1,000 encolados máx.</Badge>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--muted)" }}>
                Tiempo máximo en espera (Queue Timeout):
              </span>
              <span class="tabular">15,000 ms</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--muted)" }}>Modo de admisión:</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <StatusDot status="online" pulse />
                <span>Fair-Share por API Key</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Cuotas de organización">
          {quotas.loading ? (
            <SkeletonCard />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "var(--muted)" }}>
                  Tokens por minuto (TPM):{" "}
                </span>
                <span class="tabular" style={{ fontWeight: 600 }}>
                  {quotas.data?.tokens_per_minute?.toLocaleString() ||
                    "1,000,000"}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>
                  Solicitudes por minuto (RPM):{" "}
                </span>
                <span class="tabular" style={{ fontWeight: 600 }}>
                  {quotas.data?.requests_per_minute?.toLocaleString() || "600"}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>
                  Presupuesto mensual estimado:{" "}
                </span>
                <span class="tabular" style={{ fontWeight: 600 }}>
                  ${quotas.data?.monthly_budget_usd || "500.00"} USD
                </span>
              </div>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
