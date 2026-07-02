import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Field,
  Heading,
  Link,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

export function CreateBenchmarkPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/benchmarks` : null;
  const models = useResource<{ id: string; public_name: string }[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );

  const [modelId, setModelId] = useState("");
  const [prompt, setPrompt] = useState(
    "Explain the concept of quantum computing in 3 paragraphs.",
  );
  const [requests, setRequests] = useState(20);
  const [concurrency, setConcurrency] = useState(4);
  const [maxTokens, setMaxTokens] = useState(128);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError(null);
    try {
      const selected = modelId || models.data?.[0]?.id;
      if (!selected) throw new Error("Debes seleccionar un modelo");

      await postJson(path, {
        model_id: selected,
        prompt,
        requests: Number(requests),
        concurrency: Number(concurrency),
        max_tokens: Number(maxTokens),
      });
      navigate(`/app/${org?.slug}/benchmarks`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error creando el benchmark",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/benchmarks`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a Benchmarks
        </Link>
      </div>

      <Heading
        title="Configurar Nuevo Benchmark"
        desc="Lanza una prueba de estrés controlada para medir la latencia TTFT, TPOT y rendimiento en tokens/segundo de un modelo."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Parámetros de ejecución">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              for="bm-model-select"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Modelo objetivo
            </label>
            <select
              id="bm-model-select"
              value={modelId}
              onChange={(e: any) => setModelId(e.target.value)}
            >
              {models.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.public_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              for="bm-prompt-input"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Prompt de prueba sintético
            </label>
            <textarea
              id="bm-prompt-input"
              rows={3}
              value={prompt}
              required
              onInput={(e: any) => setPrompt(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Field
              label="Número de solicitudes"
              type="number"
              value={requests}
              required
              min={1}
              max={500}
              onInput={(e: any) => setRequests(Number(e.target.value))}
            />

            <Field
              label="Concurrencia (hilos paralelos)"
              type="number"
              value={concurrency}
              required
              min={1}
              max={32}
              onInput={(e: any) => setConcurrency(Number(e.target.value))}
            />
          </div>

          <Field
            label="Máximo de tokens por respuesta"
            type="number"
            value={maxTokens}
            required
            min={16}
            max={2048}
            onInput={(e: any) => setMaxTokens(Number(e.target.value))}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <Button kind="primary" type="submit" loading={busy}>
              Encolar Benchmark
            </Button>
            <Button
              kind="ghost"
              type="button"
              onClick={() => navigate(`/app/${org?.slug}/benchmarks`)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
