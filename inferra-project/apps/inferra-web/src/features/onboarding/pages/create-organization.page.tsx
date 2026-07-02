import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Field,
  Heading,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { refreshSession } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
export function CreateOrganizationPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    const body = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    setBusy(true);
    setError("");
    try {
      const org = await postJson<{ slug: string }>(
        "/api/v1/organizations",
        body,
      );
      await refreshSession();
      navigate(`/app/${org.slug}/dashboard`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Nueva organización"
        desc="Cada organización mantiene recursos y cuotas separados."
      />
      <Section title="Datos de la organización">
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={submit}>
          <Field label="Nombre" name="name" required />
          <Field label="Slug (ej. mi-empresa)" name="slug" required />
          <Button disabled={busy} type="submit">
            Crear organización
          </Button>
        </form>
      </Section>
    </>
  );
}
