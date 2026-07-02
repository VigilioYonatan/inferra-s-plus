import { useState } from "preact/hooks";
import { Button, Heading, Notice, Section } from "../../../libs/ui/components";
import { activeOrg, refreshSession } from "../../../services/auth/auth.state";
import { requestJson } from "../../../services/http/api-client";
export function OrganizationSettingsPage() {
  const org = activeOrg.value;
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e: Event) {
    e.preventDefault();
    if (!org) return;
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await requestJson(`/api/v1/organizations/${org.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: String(fd.get("name")) }),
      });
      await refreshSession();
      setMessage("Organización actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Configuración de organización"
        desc="Solo propietario de organización"
      />
      <Section title="Datos públicos">
        {error && <Notice kind="danger">{error}</Notice>}
        {message && <Notice kind="success">{message}</Notice>}
        <form onSubmit={save}>
          <label class="field">
            Nombre
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={org?.name ?? ""}
            />
          </label>
          <label class="field">
            Slug
            <input disabled value={org?.slug ?? ""} />
          </label>
          <Button disabled={busy} type="submit">
            Guardar
          </Button>
        </form>
      </Section>
    </>
  );
}
