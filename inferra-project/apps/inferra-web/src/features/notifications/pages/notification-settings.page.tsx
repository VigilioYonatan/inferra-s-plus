import { useState } from "preact/hooks";
import {
  Button,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { requestJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
export function NotificationSettingsPage() {
  const org = activeOrg.value;
  const path = org
    ? `/api/v1/organizations/${org.id}/notifications/settings`
    : null;
  const settings = useResource<{ email_enabled: boolean }>(path);
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e: Event) {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await requestJson(path, {
        method: "PUT",
        body: JSON.stringify({ email_enabled: f.has("email_enabled") }),
      });
      setSuccess("Preferencia guardada");
      settings.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Notificaciones"
        desc="Preferencias de correo de la organización"
      />
      <Section title="Canales">
        {settings.loading ? (
          <SkeletonCard />
        ) : settings.error ? (
          <Notice kind="danger">{settings.error}</Notice>
        ) : (
          <form key={String(settings.data?.email_enabled)} onSubmit={save}>
            <label class="field check">
              <span>Habilitar notificaciones por correo</span>
              <input
                type="checkbox"
                name="email_enabled"
                defaultChecked={settings.data?.email_enabled}
              />
            </label>
            {error && <Notice kind="danger">{error}</Notice>}
            {success && <Notice kind="success">{success}</Notice>}
            <Button disabled={busy} type="submit">
              Guardar
            </Button>
          </form>
        )}
      </Section>
    </>
  );
}
