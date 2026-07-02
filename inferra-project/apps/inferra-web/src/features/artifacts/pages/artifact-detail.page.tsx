import { useState } from "preact/hooks";
import { pathname } from "../../../app/router";
import {
  Badge,
  Button,
  Empty,
  Heading,
  Link,
  Modal,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { deleteJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Artifact = {
  id: string;
  original_name: string;
  content_type: string;
  file_size: number;
  sha256: string;
  created_at: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function ArtifactDetailPage() {
  const org = activeOrg.value;
  const pathParts = pathname.value.split("/").filter(Boolean);
  const artifactId = decodeURIComponent(pathParts[pathParts.length - 1] ?? "");
  const endpoint =
    org && artifactId
      ? `/api/v1/organizations/${org.id}/artifacts/${artifactId}`
      : null;

  const {
    data: item,
    error,
    loading,
    reload,
  } = useResource<Artifact>(endpoint);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function executeDelete() {
    if (!org || !item) return;
    setBusy(true);
    setMessage("");
    try {
      await deleteJson(`/api/v1/organizations/${org.id}/artifacts/${item.id}`);
      setMessage("Artefacto eliminado con éxito.");
      setConfirmOpen(false);
      reload();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Error al eliminar artefacto",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!org || !item) return;
    const downloadUrl = `/api/v1/organizations/${org.id}/artifacts/${item.id}/download`;
    window.open(downloadUrl, "_blank");
  }

  return (
    <>
      <Heading
        title="Detalle de Artefacto"
        desc="Metadatos, suma de verificación e integridad criptográfica"
        actions={
          <Link href={`/app/${org?.slug || ""}/artifacts`}>
            <Button kind="ghost" size="sm">
              Volver a artefactos
            </Button>
          </Link>
        }
      />

      {message && <Notice kind="info">{message}</Notice>}

      {loading ? (
        <SkeletonCard />
      ) : error ? (
        <Notice kind="danger">
          <p>{error}</p>
          <Button
            kind="ghost"
            size="sm"
            onClick={reload}
            style={{ marginTop: "8px" }}
          >
            Reintentar
          </Button>
        </Notice>
      ) : item ? (
        <Section
          title={item.original_name}
          sub={`Identificador: ${item.id}`}
          actions={
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                kind="primary"
                size="sm"
                type="button"
                onClick={handleDownload}
              >
                Descargar archivo
              </Button>
              <Button
                kind="danger"
                size="sm"
                type="button"
                disabled={busy}
                onClick={() => setConfirmOpen(true)}
              >
                Eliminar
              </Button>
            </div>
          }
        >
          <dl class="details-list">
            <div>
              <dt>Nombre original</dt>
              <dd>
                <strong>{item.original_name}</strong>
              </dd>
            </div>
            <div>
              <dt>Tipo MIME</dt>
              <dd>
                <Badge kind="info">{item.content_type}</Badge>
              </dd>
            </div>
            <div>
              <dt>Tamaño</dt>
              <dd>
                {formatBytes(item.file_size)} ({item.file_size.toLocaleString()}{" "}
                bytes)
              </dd>
            </div>
            <div>
              <dt>Checksum SHA-256</dt>
              <dd>
                <code
                  style={{
                    fontSize: "12px",
                    wordBreak: "break-all",
                    background: "#0c1526",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {item.sha256}
                </code>
              </dd>
            </div>
            <div>
              <dt>Fecha de subida</dt>
              <dd>{new Date(item.created_at).toLocaleString()}</dd>
            </div>
          </dl>
        </Section>
      ) : (
        <Empty
          label="Artefacto no encontrado"
          description="El recurso solicitado no existe o fue eliminado."
        />
      )}

      <Modal
        open={confirmOpen}
        title="Eliminar artefacto"
        onClose={() => setConfirmOpen(false)}
      >
        <p>
          ¿Confirma que desea eliminar definitivamente el artefacto{" "}
          <strong>{item?.original_name}</strong>? Los pesos o modelos que
          dependan de este archivo dejarán de estar disponibles.
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
            onClick={() => setConfirmOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            kind="danger"
            type="button"
            disabled={busy}
            onClick={executeDelete}
          >
            {busy ? "Eliminando…" : "Eliminar definitivamente"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
