import {
  Badge,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
  StatusDot,
} from "../../../libs/ui/components";
import { CheckIcon } from "../../../libs/ui/icons";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";
import { LatencySloLegend } from "../components/latency-slo-legend";

type LatencyData = {
  window: string;
  requests: number;
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
};

export function LatencyPage() {
  const org = activeOrg.value;
  const path = org
    ? `/api/v1/organizations/${org.id}/observability/latency`
    : null;
  const { data, loading, error } = useResource<LatencyData>(path);

  const formatMs = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return `${Math.round(val)} ms`;
  };

  return (
    <>
      <Heading
        title="Telemetría de Latencia (TTFT & TPOT)"
        desc="Distribución percentil p50, p95 y p99 de tiempos de respuesta de inferencia calculados en la ventana de las últimas 24 horas."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <div class="stat-grid">
        <MetricCard
          label="Percentil P50 (Mediana)"
          value={formatMs(data?.p50_ms ?? null)}
          sub="Tiempo de respuesta típico"
        />
        <MetricCard
          label="Percentil P95"
          value={formatMs(data?.p95_ms ?? null)}
          sub="95% de solicitudes por debajo"
        />
        <MetricCard
          label="Percentil P99 (Cola)"
          value={formatMs(data?.p99_ms ?? null)}
          sub="Latencia en el percentil crítico"
        />
        <MetricCard
          label="Muestras Analizadas"
          value={data?.requests ?? 0}
          sub="Solicitudes en ventana de 24h"
        />
      </div>

      <Section title="Espectro Visual de Latencia y Rangos de Rendimiento">
        <div
          style={{
            padding: "16px",
            background: "var(--surface)",
            borderRadius: "10px",
            border: "1px solid var(--border)",
          }}
        >
          <LatencySloLegend />

          {/* Visual gradient bar */}
          <div
            style={{
              height: "12px",
              borderRadius: "9999px",
              background:
                "linear-gradient(90deg, #10b981 0%, #06b6d4 35%, #6366f1 60%, #f59e0b 85%, #ef4444 100%)",
              position: "relative",
              marginBottom: "12px",
              boxShadow: "0 0 12px rgba(99, 102, 241, 0.2)",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            <div>
              <strong style={{ color: "var(--text)" }}>Prefill inicial:</strong>{" "}
              Procesamiento de prompt en tensor cores
            </div>
            <div>
              <strong style={{ color: "var(--text)" }}>Generación SSE:</strong>{" "}
              Latencia inter-token (TPOT sostenido)
            </div>
            <div>
              <strong style={{ color: "var(--text)" }}>SLO Garantizado:</strong>{" "}
              P95 por debajo del umbral de 500 ms
            </div>
          </div>
        </div>
      </Section>

      <Section title="Evaluación del SLO de rendimiento">
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
                padding: "12px 16px",
                background: "var(--surface)",
                borderRadius: "8px",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  SLO TTFT Interactivo (P95 &lt; 500 ms)
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Tiempo al primer token generado por el clúster vLLM
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <StatusDot
                  status={
                    data?.p95_ms && data.p95_ms < 500 ? "online" : "warning"
                  }
                  pulse
                />
                <Badge
                  kind={
                    data?.p95_ms && data.p95_ms < 500 ? "success" : "warning"
                  }
                >
                  {data?.p95_ms && data.p95_ms < 500 ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckIcon size={12} />
                      Cumplido
                    </span>
                  ) : (
                    "En observación"
                  )}
                </Badge>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--surface)",
                borderRadius: "8px",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  SLO Estabilidad de Cola (P99 &lt; 2,000 ms)
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                  Comportamiento ante ráfagas de concurrencia y prefill largo
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <StatusDot
                  status={
                    data?.p99_ms && data.p99_ms < 2000 ? "online" : "warning"
                  }
                  pulse
                />
                <Badge
                  kind={
                    data?.p99_ms && data.p99_ms < 2000 ? "success" : "warning"
                  }
                >
                  {data?.p99_ms && data.p99_ms < 2000 ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckIcon size={12} />
                      Cumplido
                    </span>
                  ) : (
                    "En observación"
                  )}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
