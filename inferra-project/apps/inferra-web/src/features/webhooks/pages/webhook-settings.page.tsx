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
import { deleteJson, postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Subscription = { id: string; name: string; url: string; enabled: boolean };
export function WebhookSettingsPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/webhooks` : null;
  const hooks = useResource<Subscription[]>(path);
  const [secret, setSecret] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  async function create(e: Event) {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const created = await postJson<{ signing_secret: string }>(path, {
        name: String(f.get("name")),
        url: String(f.get("url")),
      });
      setSecret(created.signing_secret);
      hooks.reload();
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  async function test(id: string) {
    if (!path) return;
    try {
      await postJson(`${path}/${id}/test`, {});
      setNotice(
        "Evento firmado encolado, consulta los deliveries para ver el resultado",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }
  async function executeRevoke() {
    if (!path || !confirmRevokeId) return;
    try {
      await deleteJson(`${path}/${confirmRevokeId}`);
      setConfirmRevokeId(null);
      hooks.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <>
      <Heading
        title="Webhooks"
        desc="Entrega HTTPS firmada, solo a destinos permitidos explícitamente en el host. Sin acceso a IP privadas."
      />
      {error && <Notice kind="danger">{error}</Notice>}
      {notice && <Notice kind="success">{notice}</Notice>}
      {secret && (
        <Notice kind="success">
          <p>
            Secreto de firma, visible solo una vez. Guárdalo en el receptor.
          </p>
          <code class="secret">{secret}</code>
          <Button
            type="button"
            kind="ghost"
            onClick={() => void navigator.clipboard.writeText(secret)}
          >
            Copiar
          </Button>
          <Button type="button" kind="ghost" onClick={() => setSecret("")}>
            Ocultar
          </Button>
        </Notice>
      )}
      <Section title="Destinos">
        {hooks.loading ? (
          <SkeletonCard />
        ) : hooks.error ? (
          <Notice kind="danger">{hooks.error}</Notice>
        ) : hooks.data?.length ? (
          <ul class="row-list">
            {hooks.data.map((h) => (
              <li key={h.id}>
                <span>
                  <strong>{h.name}</strong>
                  <small>
                    {" "}
                    · {h.url} · {h.enabled ? "Activo" : "Pausado"}
                  </small>
                </span>
                <Button kind="ghost" onClick={() => test(h.id)}>
                  Enviar test
                </Button>
                <Button
                  kind="danger"
                  type="button"
                  onClick={() => setConfirmRevokeId(h.id)}
                >
                  Revocar
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty label="Sin suscripciones" />
        )}
      </Section>
      <Section title="Nuevo destino HTTPS">
        <p>
          El administrador debe definir WEBHOOK_ALLOWED_HOSTS en Compose antes
          de registrar destinos.
        </p>
        <form onSubmit={create}>
          <label class="field">
            Nombre
            <input name="name" minLength={2} maxLength={120} required />
          </label>
          <label class="field">
            URL HTTPS
            <input
              type="url"
              name="url"
              required
              placeholder="https://events.empresa.com/inferra"
            />
          </label>
          <Button disabled={busy} type="submit">
            Registrar webhook
          </Button>
        </form>
      </Section>

      <Modal
        open={confirmRevokeId !== null}
        title="Revocar webhook"
        onClose={() => setConfirmRevokeId(null)}
      >
        <p>
          ¿Desea revocar este destino de webhook? El sistema dejará de enviar
          eventos a esta URL de forma inmediata.
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
            Revocar webhook
          </Button>
        </div>
      </Modal>
    </>
  );
}
