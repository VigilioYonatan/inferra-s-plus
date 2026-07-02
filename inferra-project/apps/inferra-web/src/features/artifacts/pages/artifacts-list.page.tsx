import { useState } from "preact/hooks";
import {
  Button,
  Empty,
  Heading,
  Modal,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { deleteJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Artifact = {
  id: string;
  original_name: string;
  file_size: number;
  sha256: string;
  created_at: string;
};
export function ArtifactsPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/artifacts` : null;
  const { data, error, loading, reload } = useResource<Artifact[]>(path);
  const [issue, setIssue] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  async function upload(e: Event) {
    e.preventDefault();
    if (!path) return;
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    setBusy(true);
    setIssue("");
    try {
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload HTTP ${res.status}`);
      form.reset();
      setSuccess("Archivo cargado en almacenamiento privado");
      reload();
    } catch (e) {
      setIssue(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }
  async function executeRemove() {
    if (!path || !confirmDeleteId) return;
    try {
      await deleteJson(`${path}/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      reload();
    } catch (e) {
      setIssue(e instanceof Error ? e.message : "Error al eliminar");
    }
  }
  return (
    <>
      <Heading
        title="Artefactos"
        desc="Archivos privados de tu organización, almacenados en RustFS."
      />
      {issue && <Notice kind="danger">{issue}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <Section title="Subir archivo">
        <p>
          Tipos permitidos: PDF, PNG, JPEG, JSON, texto y CSV. Hasta 20 MB. El
          almacenamiento debe estar habilitado en Docker Compose.
        </p>
        <form onSubmit={upload} class="field-grid">
          <label class="field">
            Archivo
            <input
              type="file"
              name="file"
              accept=".pdf,.png,.jpeg,.jpg,.json,.txt,.csv"
              required
            />
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Subiendo…" : "Subir a RustFS"}
          </Button>
        </form>
      </Section>
      <Section title="Archivos guardados">
        {loading ? (
          <SkeletonTable rows={4} cols={3} />
        ) : error ? (
          <Notice kind="danger">{error}</Notice>
        ) : data?.length ? (
          <ul class="row-list">
            {data.map((f) => (
              <li key={f.id}>
                <span class="stack">
                  <strong>{f.original_name}</strong>
                  <small>
                    {(f.file_size / 1024).toFixed(1)} KB · SHA256{" "}
                    {f.sha256.slice(0, 12)}…
                  </small>
                </span>
                <a class="btn btn-ghost" href={`${path}/${f.id}/download`}>
                  Descargar
                </a>
                <Button
                  kind="danger"
                  type="button"
                  onClick={() => setConfirmDeleteId(f.id)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty label="No hay artefactos" />
        )}
      </Section>

      <Modal
        open={confirmDeleteId !== null}
        title="Eliminar archivo"
        onClose={() => setConfirmDeleteId(null)}
      >
        <p>
          ¿Desea eliminar definitivamente el acceso a este archivo? La acción
          eliminará la referencia en la organización.
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
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancelar
          </Button>
          <Button kind="danger" type="button" onClick={executeRemove}>
            Eliminar archivo
          </Button>
        </div>
      </Modal>
    </>
  );
}
