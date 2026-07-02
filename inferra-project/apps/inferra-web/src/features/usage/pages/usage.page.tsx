import {
  Empty,
  Heading,
  Link,
  MetricCard,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type UsageSummary = {
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  avg_latency_ms?: number;
};

type RequestRecord = {
  id: string;
  status: string;
  prompt_tokens: number;
  completion_tokens: number;
  elapsed_ms: number;
  created_at: string;
};

export function UsagePage() {
  const org = activeOrg.value;
  const base = org ? `/api/v1/organizations/${org.id}/usage` : null;

  const { data: summary, error: errorSummary } = useResource<UsageSummary>(
    base ? `${base}/summary` : null,
  );

  const {
    data: requests,
    loading: loadingRequests,
    error: errorRequests,
  } = useResource<RequestRecord[]>(base ? `${base}/requests` : null);

  const totalTokens =
    summary?.total_tokens ??
    (requests?.reduce(
      (acc, curr) => acc + curr.prompt_tokens + curr.completion_tokens,
      0,
    ) ||
      0);

  const totalRequests = summary?.total_requests ?? (requests?.length || 0);

  return (
    <>
      <Heading
        title="Uso y Consumo de Tokens"
        desc="Monitoreo consolidado de tokens de entrada (prompt), salida (completion), tasa de solicitudes y latencia acumulada."
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href={`/app/${org?.slug}/usage/models`}
              class="btn btn-ghost btn-sm"
            >
              Ver desglose por modelo →
            </Link>
            <Link
              href={`/app/${org?.slug}/usage/exports`}
              class="btn btn-ghost btn-sm"
            >
              Exportar datos CSV/JSON
            </Link>
          </div>
        }
      />

      {(errorSummary || errorRequests) && (
        <Notice kind="danger">{errorSummary || errorRequests}</Notice>
      )}

      <div class="stat-grid">
        <MetricCard
          label="Total de Tokens"
          value={totalTokens.toLocaleString()}
          sub="Prompt + Completion acumulados"
        />
        <MetricCard
          label="Total Solicitudes"
          value={totalRequests.toLocaleString()}
          sub="Llamadas de inferencia cursadas"
        />
        <MetricCard
          label="Prompt Tokens"
          value={(summary?.total_prompt_tokens || 0).toLocaleString()}
          sub="Contexto y mensajes de entrada"
        />
        <MetricCard
          label="Completion Tokens"
          value={(summary?.total_completion_tokens || 0).toLocaleString()}
          sub="Generaciones producidas por LLM"
        />
      </div>

      <Section
        title="Solicitudes recientes"
        actions={
          <Link
            href={`/app/${org?.slug}/requests`}
            style={{ fontSize: "12px", color: "var(--muted)" }}
          >
            Ver todas las trazas →
          </Link>
        }
      >
        {loadingRequests ? (
          <SkeletonTable rows={5} cols={4} />
        ) : requests?.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Tokens (Total)</th>
                  <th>Latencia</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 10).map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.created_at).toLocaleString()}</td>
                    <td>
                      <span
                        class={`badge badge-${x.status === "completed" || x.status === "200" ? "success" : "danger"}`}
                      >
                        {x.status}
                      </span>
                    </td>
                    <td class="tabular">
                      {x.prompt_tokens + x.completion_tokens}
                    </td>
                    <td class="tabular">{x.elapsed_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            label="Aún no hay solicitudes de inferencia"
            description="Ejecuta una consulta en el Playground o a través de la API OpenAI para visualizar el consumo."
          />
        )}
      </Section>
    </>
  );
}
