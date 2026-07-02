import { useState } from "preact/hooks";
import {
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  Modal,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { ShieldCheckIcon } from "../../../libs/ui/icons";
import { activeOrg } from "../../../services/auth/auth.state";
import { deleteJson, postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
import { ApiKeyItemRow } from "../components/api-key-item-row";

type Key = {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  revoked_at: string | null;
};
export function ApiKeysPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/api-keys` : null;
  const { data, error, loading, reload } = useResource<Key[]>(path);
  const [revealed, setRevealed] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState("");
  const [proofMode, setProofMode] = useState<"password" | "totp">("password");
  const [recent, setRecent] = useState(false);
  async function stepUp(e: Event) {
    e.preventDefault();
    setMessage("");
    try {
      await postJson(
        proofMode === "password"
          ? "/api/v1/auth/step-up"
          : "/api/v1/auth/mfa/step-up",
        proofMode === "password" ? { password: proof } : { code: proof },
      );
      setProof("");
      setRecent(true);
      setMessage(
        "Identidad confirmada. Operaciones sensibles autorizadas durante diez minutos.",
      );
    } catch (e) {
      setRecent(false);
      setMessage(e instanceof Error ? e.message : "Error");
    }
  }
  async function create(e: Event) {
    e.preventDefault();
    if (!path || !recent) {
      setMessage("Confirma tu identidad primero");
      return;
    }
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setBusy(true);
    setMessage("");
    try {
      const result = await postJson<{ token: string }>(path, {
        name: String(fd.get("name")),
        scopes: ["inference:invoke"],
      });
      setRevealed(result.token);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  const [confirmAction, setConfirmAction] = useState<{
    type: "rotate" | "revoke";
    id: string;
  } | null>(null);

  function requestAction(type: "rotate" | "revoke", id: string) {
    if (!recent) {
      setMessage("Confirma tu identidad primero");
      return;
    }
    setConfirmAction({ type, id });
  }

  async function executeAction() {
    if (!confirmAction || !path) return;
    setBusy(true);
    setMessage("");
    try {
      if (confirmAction.type === "rotate") {
        const result = await postJson<{ token: string }>(
          `${path}/${confirmAction.id}/rotate`,
          {},
        );
        setRevealed(result.token);
      } else {
        await deleteJson(`${path}/${confirmAction.id}`);
      }
      setConfirmAction(null);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="API Keys"
        desc="Credenciales de acceso por organización, con principio de mínimo privilegio."
      />
      {message && <Notice kind="danger">{message}</Notice>}
      {revealed && (
        <Notice kind="success">
          Clave creada. Cópiala ahora: <code class="secret">{revealed}</code>
          <Button
            kind="ghost"
            onClick={() => navigator.clipboard.writeText(revealed)}
          >
            Copiar
          </Button>
          <Button kind="ghost" onClick={() => setRevealed("")}>
            Ocultar
          </Button>
        </Notice>
      )}
      <Section
        title="Verificación de Privilegios"
        sub={
          recent
            ? "Sesión elevada activa (10 min)"
            : "Requerido para generar, rotar o revocar claves"
        }
      >
        {recent ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "var(--good-bg)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              color: "var(--good)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheckIcon size={18} color="var(--good)" />
              Identidad verificada con éxito. Operaciones sensibles habilitadas.
            </span>
            <Badge kind="success">Privilegio Activo</Badge>
          </div>
        ) : (
          <form
            onSubmit={stepUp}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr auto",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <label style={{ fontSize: "13px" }}>
              Factor
              <select
                value={proofMode}
                onChange={(e) => {
                  setProofMode(
                    (e.currentTarget as HTMLSelectElement).value as
                      | "password"
                      | "totp",
                  );
                  setRecent(false);
                }}
              >
                <option value="password">Contraseña</option>
                <option value="totp">Código TOTP</option>
              </select>
            </label>
            <Field
              label={proofMode === "password" ? "Contraseña" : "Código TOTP"}
              type={proofMode === "password" ? "password" : "text"}
              value={proof}
              onInput={(e: any) =>
                setProof((e.currentTarget as HTMLInputElement).value)
              }
              required
            />
            <Button type="submit">Confirmar</Button>
          </form>
        )}
      </Section>
      <div class="cards">
        <Section title="Credenciales existentes">
          {loading ? (
            <SkeletonCard />
          ) : error ? (
            <Notice kind="danger">{error}</Notice>
          ) : data?.length ? (
            <ul class="row-list">
              {data.map((k) => (
                <ApiKeyItemRow
                  key={k.id}
                  apiKey={k}
                  onRequestAction={requestAction}
                />
              ))}
            </ul>
          ) : (
            <Empty label="Sin claves de API" />
          )}
        </Section>
        <Section title="Nueva credencial">
          <form onSubmit={create}>
            <Field
              label="Descripción"
              name="name"
              placeholder="producción-chatbot"
              required
            />
            <Button disabled={busy} type="submit">
              Generar clave
            </Button>
          </form>
          <p>El secreto solo se muestra una vez.</p>
        </Section>
      </div>

      <Modal
        open={confirmAction !== null}
        title={
          confirmAction?.type === "rotate"
            ? "Rotar clave API"
            : "Revocar clave API"
        }
        onClose={() => setConfirmAction(null)}
      >
        <p>
          {confirmAction?.type === "rotate"
            ? "¿Desea rotar esta clave? La clave anterior dejará de funcionar inmediatamente y se generará una nueva credencial."
            : "¿Desea revocar definitivamente esta clave? Cualquier servicio que dependa de ella perderá el acceso de inmediato."}
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
            onClick={() => setConfirmAction(null)}
          >
            Cancelar
          </Button>
          <Button
            kind={confirmAction?.type === "rotate" ? "primary" : "danger"}
            type="button"
            disabled={busy}
            onClick={executeAction}
          >
            {busy
              ? "Procesando…"
              : confirmAction?.type === "rotate"
                ? "Rotar clave"
                : "Revocar clave"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
