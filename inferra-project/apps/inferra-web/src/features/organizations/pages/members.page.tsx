import { useState } from "preact/hooks";
import {
  Badge,
  Button,
  Empty,
  Heading,
  Modal,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import {
  deleteJson,
  postJson,
  requestJson,
} from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Member = { id: string; user_id: string; role: string; created_at: string };
const roles = ["admin", "operator", "developer", "analyst", "viewer"];
export function MembersPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/members` : null;
  const { data, error, loading, reload } = useResource<Member[]>(path);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  async function add(e: Event) {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setMessage("");
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await postJson(path, {
        email: String(fd.get("email")),
        role: String(fd.get("role")),
      });
      setSuccess("Miembro agregado");
      reload();
      (e.currentTarget as HTMLFormElement).reset();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo agregar");
    } finally {
      setBusy(false);
    }
  }
  async function setRole(user_id: string, role: string) {
    if (!path) return;
    try {
      await requestJson(`${path}/${user_id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cambiar");
    }
  }
  async function executeRemove() {
    if (!path || !confirmRemoveId) return;
    try {
      await deleteJson(`${path}/${confirmRemoveId}`);
      setConfirmRemoveId(null);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }
  return (
    <>
      <Heading
        title="Miembros"
        desc="Controla los permisos y el acceso de tu organización."
      />
      {message && <Notice kind="danger">{message}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <Section title="Usuarios con acceso">
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data?.length ? (
          <ul class="row-list">
            {data.map((m) => (
              <li key={m.user_id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    {m.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div class="stack">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "14px",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {m.user_id}
                      </strong>
                      <Badge kind={m.role === "owner" ? "info" : "neutral"}>
                        {m.role.toUpperCase()}
                      </Badge>
                    </div>
                    <small>
                      Rol asignado: {m.role}{" "}
                      {m.created_at
                        ? `· Desde ${new Date(m.created_at).toLocaleDateString()}`
                        : ""}
                    </small>
                  </div>
                </div>
                {m.role === "owner" ? (
                  <Badge kind="info">Propietario</Badge>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <label style={{ margin: 0 }}>
                      <span class="sr-only">Rol</span>
                      <select
                        value={m.role}
                        onChange={(e) =>
                          setRole(
                            m.user_id,
                            (e.currentTarget as HTMLSelectElement).value,
                          )
                        }
                        style={{
                          width: "auto",
                          padding: "6px 12px",
                          fontSize: "13px",
                        }}
                      >
                        {roles.map((r) => (
                          <option value={r} key={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      kind="danger"
                      size="sm"
                      type="button"
                      onClick={() => setConfirmRemoveId(m.user_id)}
                    >
                      Quitar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty label="No hay miembros" />
        )}
      </Section>
      <Section title="Agregar cuenta existente">
        <form onSubmit={add} class="field-grid">
          <label class="field">
            Correo electrónico
            <input
              type="email"
              name="email"
              required
              placeholder="persona@empresa.com"
            />
          </label>
          <label class="field">
            Rol
            <select name="role">
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <Button disabled={busy} type="submit">
            Agregar miembro
          </Button>
        </form>
        <p>
          La cuenta debe estar registrada previamente; no se envían invitaciones
          automáticas.
        </p>
      </Section>

      <Modal
        open={confirmRemoveId !== null}
        title="Quitar miembro"
        onClose={() => setConfirmRemoveId(null)}
      >
        <p>
          ¿Desea quitar a este miembro de la organización? Perderá acceso
          inmediato a todos los recursos asociados.
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
            onClick={() => setConfirmRemoveId(null)}
          >
            Cancelar
          </Button>
          <Button kind="danger" type="button" onClick={executeRemove}>
            Quitar miembro
          </Button>
        </div>
      </Modal>
    </>
  );
}
