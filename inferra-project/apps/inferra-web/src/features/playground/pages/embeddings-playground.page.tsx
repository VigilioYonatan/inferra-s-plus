import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Badge,
  Button,
  CopyButton,
  Heading,
  Notice,
  Section,
  Tabs,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

export function EmbeddingsPlaygroundPage() {
  const org = activeOrg.value;
  const models = useResource<{ id: string; public_name: string }[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );

  const [textA, setTextA] = useState(
    "Arquitectura de micro frontends moderna y escalable.",
  );
  const [textB, setTextB] = useState(
    "Diseño modular de frontend con componentes reutilizables.",
  );
  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultA, setResultA] = useState<number[] | null>(null);
  const [_resultB, setResultB] = useState<number[] | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  function cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += (a[i] ?? 0) * (b[i] ?? 0);
      normA += (a[i] ?? 0) * (a[i] ?? 0);
      normB += (b[i] ?? 0) * (b[i] ?? 0);
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const resA = await postJson<{ data: { embedding: number[] }[] }>(
        "/v1/embeddings",
        {
          input: textA,
          model:
            selectedModel ||
            models.data?.[0]?.public_name ||
            "text-embedding-3-small",
        },
      );
      const vecA = resA.data?.[0]?.embedding || [];
      setResultA(vecA);

      if (textB.trim()) {
        const resB = await postJson<{ data: { embedding: number[] }[] }>(
          "/v1/embeddings",
          {
            input: textB,
            model:
              selectedModel ||
              models.data?.[0]?.public_name ||
              "text-embedding-3-small",
          },
        );
        const vecB = resB.data?.[0]?.embedding || [];
        setResultB(vecB);
        setSimilarity(cosineSimilarity(vecA, vecB));
      } else {
        setResultB(null);
        setSimilarity(null);
      }
      setElapsed(Math.round(performance.now() - start));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando embeddings");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    { id: "chat", label: "Chat interactivo" },
    { id: "compare", label: "Comparar modelos" },
    { id: "embeddings", label: "Embeddings" },
  ];

  function handleTabChange(id: string) {
    if (!org) return;
    if (id === "chat") navigate(`/app/${org.slug}/playground`);
    if (id === "compare") navigate(`/app/${org.slug}/playground/compare`);
    if (id === "embeddings") navigate(`/app/${org.slug}/playground/embeddings`);
  }

  return (
    <>
      <Heading
        title="Playground de Inferencia"
        desc="Prueba modelos de representación vectorial compatibles con la API OpenAI (/v1/embeddings) y calcula similitud coseno entre textos."
      />

      <div style={{ marginBottom: "20px" }}>
        <Tabs items={tabItems} active="embeddings" onChange={handleTabChange} />
      </div>

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Entrada de textos y modelo">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              for="emb-text-a"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Texto A (Consulta / Referencia)
            </label>
            <textarea
              id="emb-text-a"
              rows={4}
              value={textA}
              onInput={(e: any) => setTextA(e.target.value)}
              placeholder="Ingresa el primer texto…"
            />
          </div>
          <div>
            <label
              for="emb-text-b"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Texto B (Documento / Candidato para similitud)
            </label>
            <textarea
              id="emb-text-b"
              rows={4}
              value={textB}
              onInput={(e: any) => setTextB(e.target.value)}
              placeholder="Ingresa el segundo texto para comparar…"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: "220px" }}>
            <label
              for="emb-model-select"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Modelo de embedding
            </label>
            <select
              id="emb-model-select"
              value={selectedModel}
              onChange={(e: any) => setSelectedModel(e.target.value)}
            >
              <option value="">(Por defecto del sistema)</option>
              {models.data?.map((m) => (
                <option value={m.public_name} key={m.id}>
                  {m.public_name}
                </option>
              ))}
            </select>
          </div>

          <Button kind="primary" loading={loading} onClick={handleGenerate}>
            Generar vectores y comparar
          </Button>
        </div>
      </Section>

      {resultA && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          <Section title="Métricas del Vector A">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Dimensiones:</span>
                <Badge kind="info">{resultA.length} dims</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  Tiempo de cálculo:
                </span>
                <span class="tabular">{elapsed} ms</span>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>
                  Primeros 5 coeficientes:
                </span>
                <pre
                  style={{
                    background: "var(--surface)",
                    padding: "8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  {JSON.stringify(resultA.slice(0, 5), null, 2)}
                </pre>
              </div>
              <CopyButton
                text={JSON.stringify(resultA)}
                label="Copiar vector completo"
              />
            </div>
          </Section>

          {similarity !== null && (
            <Section title="Similitud Coseno (Texto A ↔ Texto B)">
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div
                  class="metric-value"
                  style={{
                    fontSize: "44px",
                    color:
                      similarity > 0.8
                        ? "var(--good)"
                        : similarity > 0.5
                          ? "var(--accent)"
                          : "var(--muted)",
                  }}
                >
                  {(similarity * 100).toFixed(1)}%
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  {similarity > 0.85
                    ? "Alta afinidad semántica"
                    : similarity > 0.6
                      ? "Afinidad semántica moderada"
                      : "Poca relación semántica"}
                </div>
              </div>
            </Section>
          )}
        </div>
      )}
    </>
  );
}
