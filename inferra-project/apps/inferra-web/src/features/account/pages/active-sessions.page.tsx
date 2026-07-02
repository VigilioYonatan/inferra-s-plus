import { useState } from "preact/hooks";
import {
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
import { SessionItemRow } from "../components/session-item-row";

type Session = { id: string; created_at: string; expires_at: string };
export function SessionsPage() {
  const { data, error, loading, reload } = useResource<Session[]>(
    "/api/v1/auth/sessions",
  );
  const [issue, setIssue] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function revoke(id: string) {
    setBusyId(id);
    setIssue("");
    try {
      await postJson(`/api/v1/auth/sessions/${id}/revoke`, {});
      reload();
    } catch (e) {
      setIssue(e instanceof Error ? e.message : "No se pudo revocar la sesión");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Heading
        title="Sesiones activas"
        desc="Revisa y administra los dispositivos con sesiones abiertas en tu cuenta."
      />
      <Section
        title="Dispositivos y tokens de sesión"
        sub={`${data?.length ?? 0} sesiones activas registradas`}
      >
        {issue && <Notice kind="danger">{issue}</Notice>}
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data?.length ? (
          <ul class="row-list">
            {data.map((s, index) => (
              <SessionItemRow
                key={s.id}
                session={s}
                isCurrentSession={index === 0}
                onRevoke={revoke}
              />
            ))}
          </ul>
        ) : (
          <Empty label="No hay sesiones activas registradas" />
        )}
      </Section>
    </>
  );
}
