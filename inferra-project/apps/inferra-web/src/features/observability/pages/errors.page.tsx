import {
  Badge,
  Empty,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type ErrorsData = {
  window: string;
  results: { status: string; requests: number }[];
};

export function ErrorsPage() {
  const org = activeOrg.value;
  const path = org
    ? `/api/v1/organizations/${org.id}/observability/errors`
    : null;
  const { data, loading, error } = useResource<ErrorsData>(path);

  const totalRequests =
    data?.results.reduce((acc, curr) => acc + (curr.requests || 0), 0) || 0;
  const errorEntries =
    data?.results.filter(
      (r) =>
        r.status === "failed" ||
        r.status.startsWith("4") ||
        r.status.startsWith("5"),
    ) || [];
  const totalErrors = errorEntries.reduce(
    (acc, curr) => acc + (curr.requests || 0),
    0,
  );
  const errorRate =
    totalRequests > 0
      ? ((totalErrors / totalRequests) * 100).toFixed(2)
      : "0.00";

  return (
    <>
      <Heading
        title="Errores Operacionales de Inferencia"
        desc="Tasa de fallos, códigos de estado HTTP y anomalías operacionales registradas en las últimas 24 horas."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <div class="stat-grid">
        <MetricCard
          label="Tasa de Error Global"
          value={`${errorRate}%`}
          sub="Porcentaje de solicitudes no exitosas"
        />
        <MetricCard
          label="Total de Errores"
          value={totalErrors}
          sub="Fallos en ventana de 24h"
        />
        <MetricCard
          label="Total de Solicitudes"
          value={totalRequests}
          sub="Volumen procesado"
        />
      </div>

      <Section title="Distribución por estado de ejecución">
        {loading ? (
          <SkeletonTable rows={3} cols={3} />
        ) : data?.results.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Solicitudes</th>
                  <th>Proporción</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((row) => (
                  <tr key={row.status}>
                    <td>
                      <Badge
                        kind={
                          row.status === "completed" || row.status === "200"
                            ? "success"
                            : "danger"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td class="tabular">{row.requests.toLocaleString()}</td>
                    <td class="tabular">
                      {totalRequests > 0
                        ? `${((row.requests / totalRequests) * 100).toFixed(1)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            label="Sin errores registrados"
            description="El sistema no ha registrado solicitudes fallidas en la ventana actual."
          />
        )}
      </Section>
    </>
  );
}
