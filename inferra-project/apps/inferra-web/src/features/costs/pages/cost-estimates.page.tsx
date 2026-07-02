import {
  Badge,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type CostData = {
  window: string;
  requests: number;
  tokens: number;
  sum_request_hours: number;
  gpu_hourly_rate_usd?: number;
  rough_compute_cost_usd?: number;
  note?: string;
};

export function CostEstimatesPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/costs/estimates` : null;
  const { data, loading, error } = useResource<CostData>(path);

  const formatCost = (val?: number) => {
    if (val === undefined || val === null) return "$0.00";
    return `$${val.toFixed(2)}`;
  };

  return (
    <>
      <Heading
        title="Estimaciones de Costos de Cómputo"
        desc="Cálculo aproximado de horas de GPU y volumen de tokens procesados en los últimos 30 días para imputación contable interna."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <div class="stat-grid">
        <MetricCard
          label="Costo Estimado Acumulado"
          value={formatCost(data?.rough_compute_cost_usd)}
          sub="Basado en horas de GPU activas"
        />
        <MetricCard
          label="Horas de Cómputo (GPU)"
          value={
            data?.sum_request_hours ? data.sum_request_hours.toFixed(2) : "0.00"
          }
          sub="Suma de duraciones de inferencia"
        />
        <MetricCard
          label="Tokens Totales Billed"
          value={data?.tokens ? data.tokens.toLocaleString() : "0"}
          sub="Prompt + Completion acumulados"
        />
      </div>

      {data?.note && (
        <Notice kind="info">
          <strong>Aviso de imputación: </strong>
          {data.note.startsWith("Sum of request durations")
            ? "Suma de duraciones de inferencia acumuladas, no horas de reloj de GPU en reposo. Estimación interna para control de costos, no constituye factura comercial."
            : data.note}
        </Notice>
      )}

      <Section title="Parámetros de tarificación asignados">
        {loading ? (
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                Tarifa horaria por GPU (A100/H100):
              </span>
              <span class="tabular" style={{ fontWeight: 600 }}>
                {data?.gpu_hourly_rate_usd
                  ? `$${data.gpu_hourly_rate_usd.toFixed(2)}/hora`
                  : "$2.50/hora"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                Ventana de consolidación:
              </span>
              <Badge kind="neutral">Últimos 30 días</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                Total de llamadas de inferencia:
              </span>
              <span class="tabular">
                {data?.requests?.toLocaleString() || 0} requests
              </span>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
