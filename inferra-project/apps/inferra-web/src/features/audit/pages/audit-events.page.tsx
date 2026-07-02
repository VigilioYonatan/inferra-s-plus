import {
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type AuditEvent = {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
};
export function AuditEventsPage() {
  const org = activeOrg.value;
  const { data, error, loading } = useResource<AuditEvent[]>(
    org ? `/api/v1/organizations/${org.id}/audit` : null,
  );
  return (
    <>
      <Heading
        title="Auditoría"
        desc="Trazas de seguridad y administración de recursos, sin exponer credenciales ni mensajes de usuarios."
      />
      <Section title="Últimos 100 eventos">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data?.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {data.map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.created_at).toLocaleString()}</td>
                    <td>
                      <strong>{x.action}</strong>
                    </td>
                    <td>
                      {x.resource_type} {x.resource_id || ""}
                    </td>
                    <td>{x.actor_id || "sistema"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty label="Sin eventos auditados" />
        )}
      </Section>
    </>
  );
}
