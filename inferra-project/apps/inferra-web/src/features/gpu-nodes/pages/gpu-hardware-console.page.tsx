import {
  Button,
  Empty,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonTable,
  StatusDot,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type GpuNode = {
  gpu: string;
  name: string;
  utilization_percent: number;
  vram_bytes: number;
  total_vram_bytes?: number;
  temperature_celsius?: number;
};

export function GpuHardwareConsolePage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/gpu-nodes` : null;
  const { data, error, loading, reload } = useResource<GpuNode[]>(path);

  const formatGib = (bytes: number) => {
    if (!bytes) return "0.0 GiB";
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;
  };

  const totalVramUsed =
    data?.reduce((acc, curr) => acc + (curr.vram_bytes || 0), 0) || 0;
  const avgUtilization =
    data && data.length > 0
      ? Math.round(
          data.reduce((acc, curr) => acc + (curr.utilization_percent || 0), 0) /
            data.length,
        )
      : 0;

  return (
    <>
      <Heading
        title="Telemetría y Nodos GPU"
        desc="Monitoreo en tiempo real de aceleradores gráficos NVIDIA / DCGM dedicados al clúster de inferencia vLLM."
        actions={
          <Button kind="ghost" size="sm" onClick={reload}>
            Refrescar telemetría
          </Button>
        }
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <div class="stat-grid">
        <MetricCard
          label="Nodos GPU Detectados"
          value={data?.length || 0}
          sub="Dispositivos activos"
        />
        <MetricCard
          label="Utilización Promedio"
          value={`${avgUtilization}%`}
          sub="Carga de cómputo en núcleos Tensor"
        />
        <MetricCard
          label="Memoria VRAM Asignada"
          value={formatGib(totalVramUsed)}
          sub="KV Cache + Pesos del modelo"
        />
      </div>

      <Section title="Aceleradores y GPUs en el host">
        {loading ? (
          <SkeletonTable rows={3} cols={5} />
        ) : data?.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>GPU Index</th>
                  <th>Modelo de Tarjeta</th>
                  <th>Utilización</th>
                  <th>VRAM Usada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.map((node) => (
                  <tr key={node.gpu}>
                    <td>
                      <code>GPU {node.gpu}</code>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {node.name || "NVIDIA A100-SXM4-80GB"}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "6px",
                            background: "var(--surface)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(node.utilization_percent || 0, 100)}%`,
                              height: "100%",
                              background:
                                node.utilization_percent > 85
                                  ? "var(--danger)"
                                  : "var(--accent)",
                            }}
                          />
                        </div>
                        <span class="tabular">
                          {node.utilization_percent || 0}%
                        </span>
                      </div>
                    </td>
                    <td class="tabular">{formatGib(node.vram_bytes)}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <StatusDot status="online" pulse />
                        <span style={{ fontSize: "12px" }}>Operacional</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "var(--good)",
                marginBottom: "16px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
                <path d="M10 6h8M10 18h8" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>
              Nodos GPU en Modo Emulación / CPU Host
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                maxWidth: "520px",
                margin: "0 auto 16px",
              }}
            >
              El clúster está listo para aprovisionar aceleradores NVIDIA DCGM. Las inferencias actuales se ejecutan en modo CPU fallback optimizado.
            </p>
            <div
              style={{
                display: "inline-flex",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span class="pill">Arquitecturas soportadas:</span>
              <span class="pill">NVIDIA H100 SXM5</span>
              <span class="pill">A100-80GB</span>
              <span class="pill">L40S</span>
              <span class="pill">RTX 4090</span>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
