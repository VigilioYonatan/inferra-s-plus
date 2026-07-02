import { useEffect, useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Field,
  Heading,
  Link,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { patchJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Dataset = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export function DatasetEditPage() {
  const org = activeOrg.value;
  const pathParts = window.location.pathname.split("/");
  // /app/:slug/datasets/:id/edit
  const datasetId = pathParts[pathParts.length - 2];

  const base = org
    ? `/api/v1/organizations/${org.id}/datasets/${datasetId}`
    : null;
  const { data: dataset, loading, error } = useResource<Dataset>(base);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dataset) {
      setName(dataset.name || "");
      setDescription(dataset.description || "");
    }
  }, [dataset]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!base) return;
    setSaving(true);
    setSaveError(null);
    try {
      await patchJson(base, { name, description });
      navigate(`/app/${org?.slug}/datasets/${datasetId}`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Error al actualizar dataset",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/datasets/${datasetId}`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver al dataset
        </Link>
      </div>

      <Heading
        title="Editar Metadatos de Dataset"
        desc="Actualiza el nombre y descripción del corpus de evaluación."
      />

      {(error || saveError) && (
        <Notice kind="danger">{error || saveError}</Notice>
      )}

      {loading ? (
        <SkeletonCard />
      ) : (
        <Section title="Formulario de edición">
          <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
            <Field
              label="Nombre del Dataset"
              type="text"
              value={name}
              required
              onInput={(e: any) => setName(e.target.value)}
            />

            <div style={{ marginBottom: "16px" }}>
              <label
                for="ds-edit-desc"
                class="field-label"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Descripción o especificaciones
              </label>
              <textarea
                id="ds-edit-desc"
                rows={4}
                value={description}
                onInput={(e: any) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button kind="primary" type="submit" loading={saving}>
                Guardar cambios
              </Button>
              <Button
                kind="ghost"
                type="button"
                onClick={() =>
                  navigate(`/app/${org?.slug}/datasets/${datasetId}`)
                }
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Section>
      )}
    </>
  );
}
