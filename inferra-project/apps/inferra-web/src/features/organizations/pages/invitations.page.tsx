import { useState } from "preact/hooks";
import {
  Button,
  Empty,
  Heading,
  Modal,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Invitation = {
  id: string;
  email: string;
  role: string;
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
};
export function InvitationsPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/invitations` : null;
  const invites = useResource<Invitation[]>(path);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  async function send(e: Event) {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await postJson(path, {
        email: String(f.get("email")),
        role: String(f.get("role")),
      });
      setSuccess("Invitación enviada por SMTP");
      invites.reload();
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  async function executeRevoke() {
    if (!path || !confirmRevokeId) return;
    try {
      await postJson(`${path}/${confirmRevokeId}/revoke`, {});
      setConfirmRevokeId(null);
      invites.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <>
      <Heading
        title="Invitaciones"
        desc="Invita por correo a cuentas registradas o nuevas; enlaces de uso único y expiración de 48 horas."
      />
      {error && <Notice kind="danger">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <Section title="Enviadas">
        {invites.loading ? (
          <SkeletonCard />
        ) : invites.error ? (
          <Notice kind="danger">{invites.error}</Notice>
        ) : invites.data?.length ? (
          <ul class="row-list">
            {invites.data.map((x) => (
              <li key={x.id}>
                <span>
                  {x.email} · {x.role} ·{" "}
                  {x.accepted_at
                    ? "Aceptada"
                    : x.revoked_at
                      ? "Revocada"
                      : "Pendiente"}
                </span>
                {!x.accepted_at && !x.revoked_at && (
                  <Button
                    kind="danger"
                    type="button"
                    onClick={() => setConfirmRevokeId(x.id)}
                  >
                    Revocar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty label="No hay invitaciones" />
        )}
      </Section>
      <Section title="Invitar miembro">
        <form onSubmit={send}>
          <label class="field">
            Correo
            <input type="email" required name="email" />
          </label>
          <label class="field">
            Rol
            <select name="role">
              {["admin", "operator", "developer", "analyst", "viewer"].map(
                (x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ),
              )}
            </select>
          </label>
          <Button disabled={busy} type="submit">
            Enviar invitación
          </Button>
        </form>
      </Section>

      <Modal
        open={confirmRevokeId !== null}
        title="Revocar invitación"
        onClose={() => setConfirmRevokeId(null)}
      >
        <p>
          ¿Desea revocar esta invitación? El enlace de acceso expirará y el
          usuario no podrá utilizarlo.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <Button
            kind="ghost"
            type="button"
            onClick={() => setConfirmRevokeId(null)}
          >
            Cancelar
          </Button>
          <Button kind="danger" type="button" onClick={executeRevoke}>
            Revocar invitación
          </Button>
        </div>
      </Modal>
    </>
  );
}
