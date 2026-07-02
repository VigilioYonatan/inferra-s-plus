import { useState } from "preact/hooks";
import {
  Button,
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
import { currentRecordId } from "../../common/resource-pages";

type Version = {
  id: string;
  tag: string;
  upstream_name: string;
  sha256: string | null;
  created_at: string;
};
export function ModelVersionsPage() {
  const org = activeOrg.value;
  const id = currentRecordId(1);
  const path = org
    ? `/api/v1/organizations/${org.id}/models/${id}/versions`
    : null;
  const data = useResource<Version[]>(path);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: Event) {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await postJson(path, {
        tag: String(form.get("tag")),
        upstream_name: String(form.get("upstream_name")),
        sha256: form.get("sha256") ? String(form.get("sha256")) : null,
      });
      data.reload();
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Versiones del modelo"
        desc="Manifiestos inmutables; registrar una versión no cambia el runtime GPU en ejecución."
      />
      <Section title="Versiones registradas">
        {data.loading ? (
          <SkeletonCard />
        ) : data.error ? (
          <Notice kind="danger">{data.error}</Notice>
        ) : data.data?.length ? (
          <ul class="row-list">
            {data.data.map((x) => (
              <li key={x.id}>
                <strong>{x.tag}</strong>
                <span>{x.upstream_name}</span>
                <small>{x.sha256 ?? "Sin checksum declarado"}</small>
              </li>
            ))}
          </ul>
        ) : (
          <Empty label="Ninguna versión registrada" />
        )}
      </Section>
      <Section title="Registrar versión">
        {error && <Notice kind="danger">{error}</Notice>}
        <form onSubmit={save}>
          <label class="field">
            Etiqueta
            <input name="tag" required maxLength={80} />
          </label>
          <label class="field">
            Repositorio/modelo upstream
            <input name="upstream_name" required maxLength={200} />
          </label>
          <label class="field">
            SHA256 verificado (opcional)
            <input name="sha256" pattern="[a-f0-9]{64}" />
          </label>
          <Button disabled={busy} type="submit">
            Guardar
          </Button>
        </form>
      </Section>
    </>
  );
}
