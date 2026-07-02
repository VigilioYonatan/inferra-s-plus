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
import { PromptPresets } from "../components/prompt-presets";

type Message = { role: "user" | "assistant"; content: string };
export function PlaygroundPage() {
  const org = activeOrg.value;
  const { data: models } = useResource<
    { id: string; public_name: string; enabled: boolean }[]
  >(org ? `/api/v1/organizations/${org.id}/models` : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const selected = model || (models?.find((m) => m.enabled)?.public_name ?? "");
  async function send(e: Event) {
    e.preventDefault();
    if (!selected || !prompt.trim() || !org || loading) return;
    const question = prompt.trim();
    const updated: Message[] = [
      ...messages,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ];
    setMessages(updated);
    setPrompt("");
    setLoading(true);
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      await streamChat(
        `/api/v1/organizations/${org.id}/playground/chat`,
        {
          model: selected,
          messages: updated
            .filter((m) => m.content)
            .map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 512,
          temperature: 0.6,
        },
        (token) =>
          setMessages((current) =>
            current.map((m, i) =>
              i === current.length - 1
                ? { ...m, content: m.content + token }
                : m,
            ),
          ),
        abort.signal,
      );
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Error");
    } finally {
      controller.current = null;
      setLoading(false);
    }
  }

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
        desc="Prueba generación con streaming SSE, comparación multi-modelo y embeddings."
      />
      <div style={{ marginBottom: "20px" }}>
        <Tabs items={tabItems} active="chat" onChange={handleTabChange} />
      </div>
      <Section title="Chat interactivo">
        <div
          class="playground-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                fontSize: "13px",
              }}
            >
              <span style={{ fontWeight: 600 }}>Modelo:</span>
              <select
                value={selected}
                onChange={(e) => setModel(e.currentTarget.value)}
                style={{ width: "auto", minWidth: "220px" }}
              >
                {models
                  ?.filter((m) => m.enabled)
                  .map((m) => (
                    <option value={m.public_name} key={m.id}>
                      {m.public_name}
                    </option>
                  ))}
              </select>
            </label>
            <span
              class="pill"
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                color: "var(--good)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              ● SSE en tiempo real
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            <span
              style={{
                padding: "3px 8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
              }}
            >
              Temp: 0.6
            </span>
            <span
              style={{
                padding: "3px 8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
              }}
            >
              Max: 512 tok
            </span>
            <span
              style={{
                padding: "3px 8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
              }}
            >
              Top-P: 0.95
            </span>
          </div>
        </div>
        <div class="chat-log" aria-live="polite">
          {messages.length ? (
            messages.map((m, i) => (
              <div key={i} class={`chat-bubble ${m.role}`}>
                <span>{m.role === "user" ? "Tú" : "Inferra LLM"}</span>
                <p>{m.content || "Generando…"}</p>
              </div>
            ))
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  color: "var(--accent)",
                  marginBottom: "12px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>
                Playground de Inferencia Interactiva
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  maxWidth: "480px",
                  margin: "0 auto 20px",
                }}
              >
                Envía un prompt para verificar latencia al primer token (TTFT) y
                streaming inter-token con el motor vLLM.
              </p>
              <PromptPresets onSelectPrompt={(selected) => setPrompt(selected)} />
            </div>
          )}
        </div>
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={send} class="chat-form">
          <label class="sr-only" for="prompt">
            Mensaje
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onInput={(e) => setPrompt(e.currentTarget.value)}
            placeholder="Escribe una pregunta para el modelo…"
          />
          <div>
            <Button
              type="submit"
              disabled={loading || !selected || !prompt.trim()}
            >
              Enviar mensaje
            </Button>
            {loading && (
              <Button
                kind="danger"
                type="button"
                onClick={() => controller.current?.abort()}
              >
                Detener generación
              </Button>
            )}
          </div>
        </form>
      </Section>
    </>
  );
}
