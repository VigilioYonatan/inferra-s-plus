import { useState } from "preact/hooks";
import {
  Badge,
  CopyButton,
  Heading,
  Section,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";
import { DeveloperCodeSnippet } from "../components/developer-code-snippet";

export function DeveloperPortalPage() {
  const org = activeOrg.value;
  const apiKeys = useResource<
    { id: string; name: string; token_prefix: string }[]
  >(org ? `/api/v1/organizations/${org.id}/api-keys` : null);
  const models = useResource<{ id: string; public_name: string }[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );

  const [activeTab, setActiveTab] = useState("curl");
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const host =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://inferra.internal";
  const modelName =
    selectedModel ||
    models.data?.[0]?.public_name ||
    "meta-llama/Llama-3-8B-Instruct";
  const keyDisplay = selectedKey ? `inf_${selectedKey}...` : "inf_YOUR_API_KEY";

  const curlSnippet = `curl -X POST "${host}/v1/chat/completions" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelName}",
    "messages": [
      { "role": "system", "content": "Eres un asistente de IA ejecutándose en infraestructura Inferra." },
      { "role": "user", "content": "¿Cómo optimizar la inferencia con vLLM?" }
    ],
    "temperature": 0.7,
    "max_tokens": 512
  }'`;

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="${host}/v1",
    api_key="${keyDisplay}"
)

response = client.chat.completions.create(
    model="${modelName}",
    messages=[
        {"role": "system", "content": "Eres un asistente de IA ejecutándose en infraestructura Inferra."},
        {"role": "user", "content": "¿Cómo optimizar la inferencia con vLLM?"}
    ],
    temperature=0.7,
    max_tokens=512,
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)
`;

  const tsSnippet = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${host}/v1",
  apiKey: "${keyDisplay}",
});

async function main() {
  const stream = await client.chat.completions.create({
    model: "${modelName}",
    messages: [
      { role: "system", content: "Eres un asistente de IA ejecutándose en infraestructura Inferra." },
      { role: "user", content: "¿Cómo optimizar la inferencia con vLLM?" },
    ],
    temperature: 0.7,
    max_tokens: 512,
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main().catch(console.error);
`;

  const currentSnippet =
    activeTab === "curl"
      ? curlSnippet
      : activeTab === "python"
        ? pythonSnippet
        : tsSnippet;

  return (
    <>
      <Heading
        title="Developer Portal & SDK Quickstart"
        desc="Integra tus aplicaciones con la API compatible con OpenAI (/v1) utilizando las librerías oficiales de Python, TypeScript o cURL."
        actions={
          <a
            href="/reference"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm"
          >
            Abrir Scalar API Docs ↗
          </a>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <Section title="1. Parámetros de llamada">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div>
              <label
                for="dev-model-select"
                class="field-label"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Modelo a invocar
              </label>
              <select
                id="dev-model-select"
                value={selectedModel}
                onChange={(e: any) => setSelectedModel(e.target.value)}
              >
                {models.data?.map((m) => (
                  <option key={m.id} value={m.public_name}>
                    {m.public_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                for="dev-key-select"
                class="field-label"
                style={{ display: "block", marginBottom: "4px" }}
              >
                API Key para autenticación
              </label>
              <select
                id="dev-key-select"
                value={selectedKey}
                onChange={(e: any) => setSelectedKey(e.target.value)}
              >
                <option value="">
                  (Usar marcador de posición YOUR_API_KEY)
                </option>
                {apiKeys.data?.map((k) => (
                  <option key={k.id} value={k.token_prefix}>
                    {k.name} ({k.token_prefix}...)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <Section title="2. Endpoint base compatible">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <div>
              <span style={{ color: "var(--muted)" }}>Base URL:</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <code
                  style={{
                    background: "var(--surface)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {host}/v1
                </code>
                <CopyButton text={`${host}/v1`} />
              </div>
            </div>
            <div>
              <span style={{ color: "var(--muted)" }}>
                Endpoints disponibles:
              </span>
              <ul
                style={{
                  margin: "6px 0",
                  paddingLeft: "18px",
                  color: "var(--muted)",
                }}
              >
                <li>
                  <code>POST /v1/chat/completions</code> (Streaming SSE)
                </li>
                <li>
                  <code>POST /v1/completions</code> (Texto plano)
                </li>
                <li>
                  <code>POST /v1/embeddings</code> (Vectores)
                </li>
                <li>
                  <code>GET /v1/models</code> (Listado activo)
                </li>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <Section title="3. Fragmento de código listo para ejecutar">
        <DeveloperCodeSnippet
          activeTab={activeTab}
          onTabChange={setActiveTab}
          snippetText={currentSnippet}
        />
      </Section>
    </>
  );
}
