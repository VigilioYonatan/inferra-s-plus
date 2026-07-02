import { useRef, useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Heading,
  Notice,
  Section,
  Tabs,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";
import { streamChat } from "../../../services/inference/sse";

type Model = { public_name: string; enabled: boolean };
export function CompareCompletionsPage() {
  const org = activeOrg.value;
  const models = useResource<Model[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );
  const [prompt, setPrompt] = useState(""),
    [first, setFirst] = useState(""),
    [second, setSecond] = useState(""),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

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

  async function run(e: Event) {
    e.preventDefault();
    if (!org || !first || !second || first === second || !prompt.trim()) return;
    setBusy(true);
    setA("");
    setB("");
    setError("");
    const ac = new AbortController();
    ctrl.current = ac;
    try {
      await Promise.all(
        [
          [first, setA],
          [second, setB],
        ].map(async ([model, set]) => {
          await streamChat(
            `/api/v1/organizations/${org.id}/playground/chat`,
            {
              model: model as string,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 512,
              temperature: 0,
            },
            (t) => (set as typeof setA)((v) => v + t),
            ac.signal,
          );
        }),
      );
    } catch (err) {
      if (!ac.signal.aborted)
        setError(err instanceof Error ? err.message : "Comparación fallida");
    } finally {
      setBusy(false);
      ctrl.current = null;
    }
  }
  const options = models.data?.filter((x) => x.enabled) ?? [];
  return (
    <>
      <Heading
        title="Playground de Inferencia"
        desc="Prueba generación, comparación en paralelo de modelos y generación de embeddings en vivo."
      />
      <div style={{ marginBottom: "20px" }}>
        <Tabs items={tabItems} active="compare" onChange={handleTabChange} />
      </div>
      <Section title="Comparación interactiva de modelos">
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={run}>
          <label class="field">
            Prompt de entrada
            <textarea
              required
              rows={3}
              value={prompt}
              placeholder="Introduce la consulta o instrucción que ejecutarán ambos modelos en simultáneo..."
              onInput={(e) => setPrompt(e.currentTarget.value)}
            />
          </label>
          <div class="cards-2" style={{ margin: "16px 0" }}>
            {[first, second].map((model, i) => (
              <label class="field" key={i}>
                Modelo {i === 0 ? "A" : "B"}
                <select
                  required
                  value={model}
                  onChange={(e) =>
                    (i === 0 ? setFirst : setSecond)(e.currentTarget.value)
                  }
                >
                  <option value="">Seleccionar modelo…</option>
                  {options.map((m) => (
                    <option value={m.public_name} key={m.public_name}>
                      {m.public_name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              disabled={busy || !first || !second || first === second}
              type="submit"
            >
              {busy ? "Generando respuestas…" : "Comparar en paralelo"}
            </Button>
            {busy && (
              <Button
                type="button"
                kind="danger"
                onClick={() => ctrl.current?.abort()}
              >
                Cancelar ejecución
              </Button>
            )}
          </div>
        </form>
      </Section>
      <div class="cards-2" style={{ marginTop: "24px" }}>
        <Section title={`Modelo A: ${first || "No seleccionado"}`}>
          <div
            style={{
              minHeight: "180px",
              padding: "14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              fontSize: "13px",
              lineHeight: 1.5,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {a || (
              <span style={{ color: "var(--muted)" }}>
                Esperando ejecución…
              </span>
            )}
          </div>
        </Section>
        <Section title={`Modelo B: ${second || "No seleccionado"}`}>
          <div
            style={{
              minHeight: "180px",
              padding: "14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              fontSize: "13px",
              lineHeight: 1.5,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {b || (
              <span style={{ color: "var(--muted)" }}>
                Esperando ejecución…
              </span>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
