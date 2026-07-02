import {
  Badge,
  Empty,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type ModelUsage = {
  model_id: string;
  model_name?: string;
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  avg_latency_ms?: number;
};

type TimeseriesPoint = {
  timestamp: string;
  tokens: number;
  requests: number;
};

export function UsageModelsPage() {
  const org = activeOrg.value;
  const base = org ? `/api/v1/organizations/${org.id}/usage` : null;

  const {
    data: byModel,
    loading: loadingModel,
    error: errorModel,
  } = useResource<ModelUsage[]>(base ? `${base}/by-model` : null);

  const {
    data: timeseries,
    loading: loadingTs,
    error: errorTs,
  } = useResource<TimeseriesPoint[]>(base ? `${base}/timeseries` : null);

  const totalTokens =
    byModel?.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0) || 0;
  const totalRequests =
    byModel?.reduce((acc, curr) => acc + (curr.total_requests || 0), 0) || 0;

  return (
    <>
      <Heading
        title="Consumo de Tokens por Modelo"
        desc="Desglose analítico de tokens de entrada (prompt), salida (completion) y series temporales por modelo de inferencia."
      />

      {(errorModel || errorTs) && (
        <Notice kind="danger">{errorModel || errorTs}</Notice>
      )}

      <div class="stat-grid">
        <MetricCard
          label="Total Tokens Invocados"
          value={totalTokens.toLocaleString()}
          sub="Prompt + Completion acumulados"
        />
        <MetricCard
          label="Total de Invocaciones"
          value={totalRequests.toLocaleString()}
          sub="Solicitudes exitosas registradas"
        />
        <MetricCard
          label="Modelos Activos"
          value={byModel?.length || 0}
          sub="Con consumo registrado"
        />
      </div>

      <Section title="Distribución por modelo">
        {loadingModel ? (
          <SkeletonTable rows={4} cols={5} />
        ) : byModel?.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Solicitudes</th>
                  <th>Prompt Tokens</th>
                  <th>Completion Tokens</th>
                  <th>Total Tokens</th>
                </tr>
              </thead>
              <tbody>
                {byModel.map((m) => (
                  <tr key={m.model_id}>
                    <td>
                      <code>{m.model_name || m.model_id}</code>
                    </td>
                    <td class="tabular">{m.total_requests.toLocaleString()}</td>
                    <td class="tabular">
                      {m.total_prompt_tokens.toLocaleString()}
                    </td>
                    <td class="tabular">
                      {m.total_completion_tokens.toLocaleString()}
                    </td>
                    <td class="tabular" style={{ fontWeight: "600" }}>
                      {m.total_tokens.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            label="Sin consumo por modelo registrado"
            description="Las solicitudes completadas en el Playground o vía API aparecerán aquí."
          />
        )}
      </Section>

      <Section title="Serie temporal de inferencia">
        {loadingTs ? (
          <SkeletonCard />
        ) : timeseries?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {timeseries.map((pt, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--surface)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <span>{new Date(pt.timestamp).toLocaleString()}</span>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Badge kind="neutral">{pt.requests} reqs</Badge>
                  <span class="tabular" style={{ fontWeight: "600" }}>
                    {pt.tokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No hay puntos temporales en este intervalo" />
        )}
      </Section>
    </>
  );
}
