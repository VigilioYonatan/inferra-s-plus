export type QuotaMeterBarProps = {
  used: number;
  pending: number;
  limit: number;
  pct: number;
};

export function QuotaMeterBar({ used, pending, limit, pct }: QuotaMeterBarProps) {
  const isHighUtilization = pct > 85;

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "18px 20px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontSize: "13px",
        }}
      >
        <label
          htmlFor="quota-progress"
          style={{ fontWeight: 600, color: "var(--text)" }}
        >
          Utilización global de cuota
        </label>
        <span
          class="tabular"
          style={{
            fontWeight: 700,
            color: isHighUtilization ? "var(--danger)" : "var(--accent)",
          }}
        >
          {pct}% ({((used + pending) / 1000).toFixed(1)}k / {(limit / 1000).toFixed(1)}k tokens)
        </span>
      </div>
      <progress id="quota-progress" max={limit} value={used + pending} />
    </div>
  );
}
