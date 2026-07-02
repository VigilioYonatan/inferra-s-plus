import {
  AlertTriangleIcon,
  FlameIcon,
  TargetIcon,
  ZapIcon,
} from "../../../libs/ui/icons";

export function LatencySloLegend() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        fontSize: "12px",
        fontWeight: 600,
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <span style={{ color: "var(--good)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <ZapIcon size={14} color="var(--good)" />
        Óptimo (&lt; 200 ms)
      </span>
      <span style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <TargetIcon size={14} color="var(--accent)" />
        P50 Interactivo (Mediana)
      </span>
      <span style={{ color: "var(--warning)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <AlertTriangleIcon size={14} color="var(--warning)" />
        P95 Límite SLO (500 ms)
      </span>
      <span style={{ color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <FlameIcon size={14} color="var(--danger)" />
        P99 Cola Crítica (&gt; 1000 ms)
      </span>
    </div>
  );
}
