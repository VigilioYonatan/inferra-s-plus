import { pathname } from "../../../app/router";
import {
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type Benchmark = {
  id: string;
  status: string;
  configuration: Record<string, unknown>;
  results: Record<string, unknown> | null;
  created_at: string;
};
export function BenchmarkDetailPage() {
  const org = activeOrg.value;
  const id = pathname.value.split("/").filter(Boolean).at(-1);
  const { data, error, loading } = useResource<Benchmark>(
    org && id
      ? `/api/v1/organizations/${org.id}/benchmarks/${encodeURIComponent(id)}`
      : null,
  );
  return (
    <>
      <Heading
        title="Detalle de benchmark"
        desc="Datos registrados por el worker y parámetros usados durante la prueba."
      />
      <Section title="Resultado">
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data ? (
          <>
            <p>
              Estado: <strong>{data.status}</strong>
            </p>
            <h3>Configuración</h3>
            <pre>{JSON.stringify(data.configuration, null, 2)}</pre>
            <h3>Resultados</h3>
            <pre>{JSON.stringify(data.results, null, 2)}</pre>
          </>
        ) : (
          <Empty label="Benchmark no encontrado" />
        )}
      </Section>
    </>
  );
}
