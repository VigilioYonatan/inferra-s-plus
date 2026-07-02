import { useState } from "preact/hooks";
import {
  Button,
  Empty,
  Field,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Benchmark = {
  id: string;
  status: string;
  created_at: string;
  results?: { latency_p95_ms: number; throughput_tokens_per_second: number };
};
export function BenchmarksPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/benchmarks` : null;
  const { data, error, loading, reload } = useResource<Benchmark[]>(path);
  const models = useResource<{ id: string; public_name: string }[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    if (!path) return;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    setBusy(true);
    setMessage("");
    try {
      await postJson(path, {
        model_id: String(f.get("model_id")),
        prompt: String(f.get("prompt")),
        requests: Number(f.get("requests")),
        concurrency: Number(f.get("concurrency")),
        max_tokens: Number(f.get("max_tokens")),
      });
      reload();
      setMessage("Benchmark agregado a la cola de workers.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Benchmark Lab"
        desc="Mide throughput y p95 bajo condiciones controladas; los resultados no son equivalentes a una auditoría estadística sin replicaciones."
      />
      {message && <Notice>{message}</Notice>}
      <div class="cards">
        <Section title="Experimentos anteriores">
          {loading ? (
            <SkeletonCard />
          ) : error ? (
            <Notice kind="danger">{error}</Notice>
          ) : data?.length ? (
            <ul class="row-list">
              {data.map((b) => (
                <li key={b.id}>
                  <span>
                    {new Date(b.created_at).toLocaleString()}{" "}
                    <strong>{b.status}</strong>
                  </span>
                  <span>
                    {b.results
                      ? `${b.results.latency_p95_ms}ms p95 · ${b.results.throughput_tokens_per_second.toFixed(1)} tok/s`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="No hay benchmarks" />
          )}
          <Button kind="ghost" onClick={reload}>
            Actualizar resultados
          </Button>
        </Section>
        <Section title="Ejecutar prueba controlada">
          <form onSubmit={submit}>
            <label class="field">
              <span>Modelo</span>
              <select name="model_id" required>
                {models.data?.map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.public_name}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Prompt de prueba" name="prompt" required />
            <Field
              label="Solicitudes (1–100)"
              name="requests"
              type="number"
              required
            />
            <Field
              label="Concurrencia (1–8)"
              name="concurrency"
              type="number"
              required
            />
            <Field
              label="Máximo tokens (1–256)"
              name="max_tokens"
              type="number"
              required
            />
            <Button disabled={busy} type="submit">
              Crear benchmark
            </Button>
          </form>
        </Section>
      </div>
    </>
  );
}
