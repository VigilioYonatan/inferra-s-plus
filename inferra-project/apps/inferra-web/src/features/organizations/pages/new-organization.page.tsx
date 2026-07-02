import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  Field,
  Heading,
  Link,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { refreshSession } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";

export function NewOrganizationPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    );
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<{ id: string; slug: string; name: string }>(
        "/api/v1/organizations",
        { name, slug },
      );
      await refreshSession();
      navigate(`/app/${res.slug}/dashboard`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la organización",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link href="/" style={{ fontSize: "13px", color: "var(--muted)" }}>
          ← Cancelar y volver
        </Link>
      </div>

      <Heading
        title="Crear Nueva Organización"
        desc="Configura un nuevo espacio de trabajo aislado para tu equipo, despliegues y cuotas."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Detalles del Workspace">
        <form onSubmit={handleSubmit}>
          <Field
            label="Nombre de la organización"
            type="text"
            value={name}
            required
            placeholder="Ej. IA Labs Producción"
            onInput={(e: any) => handleNameChange(e.target.value)}
          />

          <Field
            label="Slug para URL (identificador único)"
            type="text"
            value={slug}
            required
            placeholder="ia-labs-produccion"
            onInput={(e: any) => setSlug(e.target.value)}
            hint="Se usará en la ruta: /app/:slug/..."
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <Button kind="primary" type="submit" loading={loading}>
              Crear Workspace
            </Button>
            <Button kind="ghost" type="button" onClick={() => navigate("/")}>
              Cancelar
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
