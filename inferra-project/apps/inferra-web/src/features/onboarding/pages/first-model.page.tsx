import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import { Button, Heading, Notice, Section } from "../../../libs/ui/components";
import { activeOrg, organizations } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";

const presetModels = [
  {
    name: "meta-llama/Llama-3-8B-Instruct",
    upstream: "llama-3-8b-instruct",
    context: 8192,
    desc: "Modelo generalista optimizado por Meta para chat, razonamiento y código.",
  },
  {
    name: "mistralai/Mistral-7B-Instruct-v0.3",
    upstream: "mistral-7b-instruct",
    context: 32768,
    desc: "Excelente rendimiento y soporte nativo de llamadas a funciones y contexto extendido.",
  },
  {
    name: "Qwen/Qwen2.5-7B-Instruct",
    upstream: "qwen-2.5-7b-instruct",
    context: 32768,
    desc: "Capacidad sobresaliente en matemáticas, programación y soporte multilingüe.",
  },
];

export function FirstModelPage() {
  const org = activeOrg.value || organizations.value[0];
  const [selected, setSelected] = useState(presetModels[0]?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!org) return;
    setLoading(true);
    setError(null);
    try {
      const preset =
        presetModels.find((p) => p.name === selected) || presetModels[0]!;
      await postJson(`/api/v1/organizations/${org.id}/models`, {
        public_name: preset.name,
        upstream_name: preset.upstream,
        context_window: preset.context,
      });
      navigate(`/app/${org.slug}/dashboard`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error registrando el modelo inicial",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "640px", margin: "40px auto", padding: "0 16px" }}>
      <Heading
        title="Paso 2: Selecciona tu primer modelo"
        desc="Elige uno de los modelos estándar recomendados para inicializar el catálogo de tu organización."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Modelos recomendados">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {presetModels.map((m) => (
            <label
              key={m.name}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background:
                  selected === m.name ? "var(--surface)" : "var(--panel)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="preset"
                value={m.name}
                checked={selected === m.name}
                onChange={() => setSelected(m.name)}
                style={{ marginTop: "4px", width: "auto" }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {m.name}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  {m.desc} · Contexto: {m.context.toLocaleString()} tokens
                </div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button kind="primary" loading={loading} onClick={handleStart}>
            Registrar y comenzar
          </Button>
          <Button
            kind="ghost"
            onClick={() => navigate(org ? `/app/${org.slug}/dashboard` : "/")}
          >
            Omitir por ahora
          </Button>
        </div>
      </Section>
    </div>
  );
}
