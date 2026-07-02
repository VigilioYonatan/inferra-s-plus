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

type Policy = {
  id: string;
  name: string;
  model_id: string;
  concurrency_cap: number;
  enabled: boolean;
};

export function RoutingPolicyEditPage() {
  const org = activeOrg.value;
  const pathParts = window.location.pathname.split("/");
  const policyId = pathParts[pathParts.length - 2];

  const base = org
    ? `/api/v1/organizations/${org.id}/routing/${policyId}`
    : null;
  const { data: policy, loading, error } = useResource<Policy>(base);

  const [name, setName] = useState("");
  const [concurrency, setConcurrency] = useState(16);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (policy) {
      setName(policy.name || "");
      setConcurrency(policy.concurrency_cap || 16);
      setEnabled(policy.enabled ?? true);
    }
  }, [policy]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!base) return;
    setSaving(true);
    setSaveError(null);
    try {
      await patchJson(base, {
        name,
        concurrency_cap: Number(concurrency),
        enabled,
      });
      navigate(`/app/${org?.slug}/routing/${policyId}`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Error al actualizar política",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/routing/${policyId}`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a la política
        </Link>
      </div>

      <Heading
        title="Editar Política de Routing"
        desc="Ajusta el límite de concurrencia y el estado de activación de la política de admisión."
      />

      {(error || saveError) && (
        <Notice kind="danger">{error || saveError}</Notice>
      )}

      {loading ? (
        <SkeletonCard />
      ) : (
        <Section title="Parámetros de routing">
          <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
            <Field
              label="Nombre de la Política"
              type="text"
              value={name}
              required
              onInput={(e: any) => setName(e.target.value)}
            />

            <Field
              label="Límite de concurrencia simultánea"
              type="number"
              value={concurrency}
              required
              min={1}
              max={256}
              onInput={(e: any) => setConcurrency(Number(e.target.value))}
              hint="Control de admisión: solicitudes adicionales se encolan o devuelven 429."
            />

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e: any) => setEnabled(e.target.checked)}
                />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  Política activa para el tráfico de inferencia
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button kind="primary" type="submit" loading={saving}>
                Guardar cambios
              </Button>
              <Button
                kind="ghost"
                type="button"
                onClick={() =>
                  navigate(`/app/${org?.slug}/routing/${policyId}`)
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
