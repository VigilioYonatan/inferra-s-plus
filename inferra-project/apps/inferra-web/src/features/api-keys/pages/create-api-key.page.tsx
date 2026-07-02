import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import {
  Button,
  CopyButton,
  Field,
  Heading,
  Link,
  Modal,
  Notice,
  Section,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";

export function CreateApiKeyPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/api-keys` : null;

  const [name, setName] = useState("");
  const [scopeInference, setScopeInference] = useState(true);
  const [scopeModels, setScopeModels] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);

  // Step-up authentication
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [stepUpRecent, setStepUpRecent] = useState(false);

  const handleStepUp = async (e: Event) => {
    e.preventDefault();
    setError(null);
    try {
      await postJson("/api/v1/auth/step-up", { password });
      setStepUpRecent(true);
      setStepUpOpen(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contraseña incorrecta");
    }
  };

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!path) return;
    if (!stepUpRecent) {
      setStepUpOpen(true);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const scopes: string[] = [];
      if (scopeInference) scopes.push("inference:invoke");
      if (scopeModels) scopes.push("models:read");

      const res = await postJson<{ token: string }>(path, {
        name,
        scopes,
      });
      setRevealedToken(res.token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar la API key",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/api-keys`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a API Keys
        </Link>
      </div>

      <Heading
        title="Crear Nueva API Key"
        desc="Genera una credencial de acceso para invocar modelos de inferencia a través de la API OpenAI-compatible (/v1)."
      />

      {error && <Notice kind="danger">{error}</Notice>}

      {revealedToken ? (
        <Section title="¡API Key generada con éxito!">
          <Notice kind="warning">
            Guarda esta clave en un lugar seguro ahora. Por motivos de
            seguridad, no se volverá a mostrar completa en el futuro.
          </Notice>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "16px 0",
              background: "var(--surface)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <code style={{ fontSize: "14px", flex: 1, wordBreak: "break-all" }}>
              {revealedToken}
            </code>
            <CopyButton text={revealedToken} label="Copiar clave" />
          </div>

          <div style={{ marginTop: "24px" }}>
            <Link href={`/app/${org?.slug}/api-keys`} class="btn btn-primary">
              Entendido, volver a la lista
            </Link>
          </div>
        </Section>
      ) : (
        <Section title="Configuración de la credencial">
          <form onSubmit={handleCreate}>
            <Field
              label="Nombre o propósito de la clave"
              type="text"
              value={name}
              required
              placeholder="Ej. Integración backend producción"
              onInput={(e: any) => setName(e.target.value)}
            />

            <div style={{ marginBottom: "20px" }}>
              <span
                class="field-label"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Permisos y scopes asignados
              </span>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={scopeInference}
                    onChange={(e: any) => setScopeInference(e.target.checked)}
                  />
                  <span>
                    <code>inference:invoke</code> — Permitir chat, completado y
                    embeddings
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={scopeModels}
                    onChange={(e: any) => setScopeModels(e.target.checked)}
                  />
                  <span>
                    <code>models:read</code> — Listar modelos activos en el
                    clúster
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <Button kind="primary" type="submit" loading={busy}>
                Generar API Key
              </Button>
              <Button
                kind="ghost"
                type="button"
                onClick={() => navigate(`/app/${org?.slug}/api-keys`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Section>
      )}

      {/* Step-up modal */}
      <Modal
        open={stepUpOpen}
        title="Confirmar identidad (Step-up MFA)"
        onClose={() => setStepUpOpen(false)}
        actions={
          <>
            <Button kind="ghost" onClick={() => setStepUpOpen(false)}>
              Cancelar
            </Button>
            <Button kind="primary" onClick={handleStepUp}>
              Confirmar
            </Button>
          </>
        }
      >
        <form onSubmit={handleStepUp}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "16px",
            }}
          >
            La creación de API keys de producción requiere reconfirmar tu
            contraseña por seguridad.
          </p>
          <Field
            label="Tu contraseña actual"
            type="password"
            value={password}
            required
            onInput={(e: any) => setPassword(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
