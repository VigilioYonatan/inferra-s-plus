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
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";

export function RegisterModelPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/models` : null;

  const [publicName, setPublicName] = useState("");
  const [upstreamName, setUpstreamName] = useState("");
  const [contextWindow, setContextWindow] = useState(8192);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!path) return;
    setBusy(true);
    setError(null);
    try {
      await postJson(path, {
        public_name: publicName,
        upstream_name: upstreamName || publicName,
        context_window: Number(contextWindow),
      });
      navigate(`/app/${org?.slug}/models`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error registrando el modelo",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/models`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a Modelos
        </Link>
      </div>

      <Heading
        title="Registrar Nuevo Modelo"
        desc="Añade un identificador de modelo al catálogo para su posterior despliegue o enrutamiento."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section title="Definición del modelo">
        <form onSubmit={handleSubmit}>
          <Field
            label="Nombre público (identificador API)"
            type="text"
            value={publicName}
            required
            placeholder="meta-llama/Llama-3-8B-Instruct"
            onInput={(e: any) => setPublicName(e.target.value)}
            hint="Nombre con el que tus aplicaciones invocarán el modelo en /v1/chat/completions."
          />

          <Field
            label="Nombre upstream / checkpoint en disco"
            type="text"
            value={upstreamName}
            placeholder="llama-3-8b-instruct (opcional)"
            onInput={(e: any) => setUpstreamName(e.target.value)}
            hint="Ruta local en /models o ID del repositorio vLLM."
          />

          <Field
            label="Ventana de contexto máxima (tokens)"
            type="number"
            value={contextWindow}
            required
            min={512}
            max={131072}
            onInput={(e: any) => setContextWindow(Number(e.target.value))}
            hint="Límite superior de tokens para la reserva de KV Cache."
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <Button kind="primary" type="submit" loading={busy}>
              Guardar y registrar
            </Button>
            <Button
              kind="ghost"
              type="button"
              onClick={() => navigate(`/app/${org?.slug}/models`)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
