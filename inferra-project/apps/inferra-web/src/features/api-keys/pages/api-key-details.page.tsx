import { useState } from "preact/hooks";
import { pathname } from "../../../app/router";
import {
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  Link,
  Modal,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { deleteJson, postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type KeyDetail = {
  id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  created_at: string;
  revoked_at: string | null;
};

export function ApiKeyDetailsPage() {
  const org = activeOrg.value;
  const pathParts = pathname.value.split("/").filter(Boolean);
  const keyId = decodeURIComponent(pathParts[pathParts.length - 1] ?? "");
  const endpoint =
    org && keyId ? `/api/v1/organizations/${org.id}/api-keys/${keyId}` : null;

  const {
    data: key,
    error,
    loading,
    reload,
  } = useResource<KeyDetail>(endpoint);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revealedToken, setRevealedToken] = useState("");
  const [stepUpCode, setStepUpCode] = useState("");
  const [stepUpMode, setStepUpMode] = useState<"password" | "totp">("password");

  async function handleRotate(e: Event) {
    e.preventDefault();
    if (!org || !key) return;
    setBusy(true);
    setMessage("");
    try {
      // Step-up verification first
      await postJson(
        stepUpMode === "password"
          ? "/api/v1/auth/step-up"
          : "/api/v1/auth/mfa/step-up",
        stepUpMode === "password"
          ? { password: stepUpCode }
          : { code: stepUpCode },
      );
      const res = await postJson<{ token: string }>(
        `/api/v1/organizations/${org.id}/api-keys/${key.id}/rotate`,
        {},
      );
      setRevealedToken(res.token);
      setShowRotateModal(false);
      setStepUpCode("");
      setMessage(
        "Clave rotada con éxito. Asegúrese de copiar el nuevo token ahora.",
      );
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al rotar clave");
    } finally {
      setBusy(false);
    }
  }

  async function executeRevoke() {
    if (!org || !key) return;
    setBusy(true);
    setMessage("");
    try {
      await deleteJson(`/api/v1/organizations/${org.id}/api-keys/${key.id}`);
      setMessage("API key revocada exitosamente.");
      setShowRevokeModal(false);
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al revocar clave");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading
        title="Detalle de API Key"
        desc="Metadatos, permisos y ciclo de vida de la credencial de inferencia"
        actions={
          <Link href={`/app/${org?.slug || ""}/api-keys`}>
            <Button kind="ghost" size="sm">
              Volver al listado
            </Button>
          </Link>
        }
      />

      {message && <Notice kind="info">{message}</Notice>}

      {revealedToken && (
        <Notice kind="success">
          <strong>Nuevo token generado:</strong>
          <code
            style={{
              display: "block",
              marginTop: "8px",
              wordBreak: "break-all",
              padding: "8px",
              background: "#0c1526",
            }}
          >
            {revealedToken}
          </code>
          <p style={{ marginTop: "6px", fontSize: "12px" }}>
            Guarde este secreto en un lugar seguro. No se volverá a mostrar.
          </p>
        </Notice>
      )}

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
      ) : key ? (
        <Section
          title={key.name}
          sub={`Identificador: ${key.id}`}
          actions={
            !key.revoked_at ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  kind="secondary"
                  size="sm"
                  type="button"
                  disabled={busy}
                  onClick={() => setShowRotateModal(true)}
                >
                  Rotar clave
                </Button>
                <Button
                  kind="danger"
                  size="sm"
                  type="button"
                  disabled={busy}
                  onClick={() => setShowRevokeModal(true)}
                >
                  Revocar
                </Button>
              </div>
            ) : undefined
          }
        >
          <dl class="details-list">
            <div>
              <dt>Estado</dt>
              <dd>
                {key.revoked_at ? (
                  <Badge kind="danger">Revocada</Badge>
                ) : (
                  <Badge kind="success">Activa</Badge>
                )}
              </dd>
            </div>
            <div>
              <dt>Prefijo público</dt>
              <dd>
                <code>{key.token_prefix}••••••••</code>
              </dd>
            </div>
            <div>
              <dt>Alcances (Scopes)</dt>
              <dd>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {key.scopes?.length ? (
                    key.scopes.map((s) => (
                      <Badge key={s} kind="neutral">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span class="text-muted">Ninguno asignado</span>
                  )}
                </div>
              </dd>
            </div>
            <div>
              <dt>Creada el</dt>
              <dd>{new Date(key.created_at).toLocaleString()}</dd>
            </div>
            {key.revoked_at && (
              <div>
                <dt>Revocada el</dt>
                <dd>{new Date(key.revoked_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </Section>
      ) : (
        <Empty
          label="API key no encontrada"
          description="La credencial solicitada no existe o fue eliminada."
        />
      )}

      <Modal
        open={showRotateModal}
        title="Confirmar rotación de credencial"
        onClose={() => setShowRotateModal(false)}
        actions={
          <>
            <Button
              kind="ghost"
              type="button"
              onClick={() => setShowRotateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              kind="primary"
              type="button"
              loading={busy}
              onClick={handleRotate}
            >
              Confirmar y rotar
            </Button>
          </>
        }
      >
        <p
          style={{
            marginBottom: "16px",
            color: "var(--muted)",
            fontSize: "14px",
          }}
        >
          La rotación generará un nuevo secreto y revocará el anterior
          inmediatamente. Por seguridad, ingrese su confirmación de identidad
          (Step-Up).
        </p>
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="stepUpMode"
              checked={stepUpMode === "password"}
              onChange={() => setStepUpMode("password")}
            />
            Contraseña
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="stepUpMode"
              checked={stepUpMode === "totp"}
              onChange={() => setStepUpMode("totp")}
            />
            Código TOTP / MFA
          </label>
        </div>
        <Field
          label={
            stepUpMode === "password"
              ? "Contraseña actual"
              : "Código de 6 dígitos"
          }
          type={stepUpMode === "password" ? "password" : "text"}
          required
          value={stepUpCode}
          onInput={(e: any) => setStepUpCode(e.currentTarget.value)}
          placeholder={stepUpMode === "password" ? "••••••••" : "123456"}
        />
      </Modal>

      <Modal
        open={showRevokeModal}
        title="Revocar API Key"
        onClose={() => setShowRevokeModal(false)}
      >
        <p>
          ¿Confirma que desea revocar definitivamente la clave{" "}
          <strong>{key?.name}</strong>? Esta acción no se puede deshacer y
          cualquier aplicación cliente que use esta clave será rechazada.
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
            onClick={() => setShowRevokeModal(false)}
          >
            Cancelar
          </Button>
          <Button
            kind="danger"
            type="button"
            disabled={busy}
            onClick={executeRevoke}
          >
            {busy ? "Revocando…" : "Revocar definitivamente"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
