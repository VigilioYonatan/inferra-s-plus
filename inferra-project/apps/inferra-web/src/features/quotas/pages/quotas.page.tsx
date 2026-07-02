import {
  Empty,
  Heading,
  MetricCard,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";
import { QuotaMeterBar } from "../components/quota-meter-bar";

type Quota = {
  monthly_limit: number;
  concurrent_limit: number;
  used_tokens: number;
  reserved_tokens: number;
  in_flight: number;
};

export function QuotasPage() {
  const org = activeOrg.value;
  const { data, error, loading } = useResource<Quota>(
    org ? `/api/v1/organizations/${org.id}/quotas` : null,
  );
  const limit = Math.max(1, Number(data?.monthly_limit || 1));
  const used = Number(data?.used_tokens || 0);
  const pending = Number(data?.reserved_tokens || 0);
  const pct = Math.min(100, Math.round(((used + pending) / limit) * 100));

  return (
    <>
      <Heading
        title="Cuotas y Concurrencia"
        desc="Presupuesto real de tokens por organización con control de concurrencia y reservas atómicas."
      />
      <Section title="Presupuesto y Consumo Mensual">
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data ? (
          <>
            <div class="stat-grid">
              <MetricCard
                label="Tokens Consumidos"
                value={used.toLocaleString()}
                sub="Total acumulado en el ciclo actual"
              />
              <MetricCard
                label="Reservados Temporalmente"
                value={pending.toLocaleString()}
                sub="Inferencia activa en curso"
              />
              <MetricCard
                label="Presupuesto Asignado"
                value={limit.toLocaleString()}
                sub="Límite máximo mensual de tokens"
              />
              <MetricCard
                label="Concurrencia Activa"
                value={`${data.in_flight} / ${data.concurrent_limit}`}
                sub="Slots de inferencia simultáneos"
              />
            </div>

            <QuotaMeterBar
              used={used}
              pending={pending}
              limit={limit}
              pct={pct}
            />
          </>
        ) : (
          <Empty label="Esta organización aún no tiene cuota configurada" />
        )}
      </Section>
    </>
  );
}
