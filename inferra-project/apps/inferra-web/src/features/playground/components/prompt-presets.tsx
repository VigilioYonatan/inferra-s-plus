import { CodeIcon, ShieldIcon, ZapIcon } from "../../../libs/ui/icons";

export type PromptPresetsProps = {
  onSelectPrompt: (promptText: string) => void;
};

export function PromptPresets({ onSelectPrompt }: PromptPresetsProps) {
  const presets = [
    {
      title: "Medir Latencia TTFT",
      desc: "Respuesta interactiva y KV-cache",
      color: "var(--accent)",
      icon: ZapIcon,
      prompt: "Explica brevemente la diferencia entre Time-to-First-Token (TTFT) e Inter-Token Latency (ITL) en el servicio de modelos de lenguaje.",
    },
    {
      title: "Script Async Python",
      desc: "Cliente oficial OpenAI SDK v1",
      color: "var(--good)",
      icon: CodeIcon,
      prompt: "Escribe un script en Python async utilizando httpx para invocar /v1/chat/completions con streaming SSE.",
    },
    {
      title: "Formato JSON Estructurado",
      desc: "Salida determinista con JSON Schema",
      color: "var(--warning)",
      icon: ShieldIcon,
      prompt: "Genera un esquema JSON válido para una política de enrutamiento con umbrales de latencia P95.",
    },
  ];

  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "10px",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.01)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        Plantillas de prueba rápida:
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => onSelectPrompt(p.prompt)}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon size={16} color={p.color} />
                <strong style={{ color: p.color }}>{p.title}</strong>
              </div>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                {p.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
