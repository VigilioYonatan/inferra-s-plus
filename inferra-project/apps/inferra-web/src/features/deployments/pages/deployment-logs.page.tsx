import { useState } from "preact/hooks";
import { pathname } from "../../../app/router";
import {
  Badge,
  Button,
  Empty,
  Heading,
  Link,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type DeploymentLogs = {
  deployment_id: string;
  status: string;
  runtime_profile: string;
  logs: string[];
};

export function DeploymentLogsPage() {
  const org = activeOrg.value;
  const pathParts = pathname.value.split("/").filter(Boolean);
  // URL pattern: /app/:org_slug/deployments/:id/logs
  const deploymentId = decodeURIComponent(
    pathParts[pathParts.length - 2] ?? "",
  );
  const endpoint =
    org && deploymentId
      ? `/api/v1/organizations/${org.id}/deployments/${deploymentId}/logs`
      : null;

  const { data, error, loading, reload } =
    useResource<DeploymentLogs>(endpoint);
  const [copied, setCopied] = useState(false);

  function copyLogs() {
    if (!data?.logs?.length) return;
    navigator.clipboard.writeText(data.logs.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <Heading
        title="Logs del Runtime de Despliegue"
        desc="Trazas operacionales, estado de salud y ciclo de vida del contenedor"
        actions={
          <Link href={`/app/${org?.slug || ""}/deployments`}>
            <Button kind="ghost" size="sm">
              Volver a despliegues
            </Button>
          </Link>
        }
      />

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
      ) : data ? (
        <Section
          title="Trazas de contenedor"
          sub={`Despliegue ID: ${data.deployment_id}`}
          actions={
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                kind="secondary"
                size="sm"
                type="button"
                onClick={copyLogs}
              >
                {copied ? "¡Copiado!" : "Copiar logs"}
              </Button>
              <Button kind="ghost" size="sm" type="button" onClick={reload}>
                Actualizar
              </Button>
            </div>
          }
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "16px",
              alignItems: "center",
            }}
          >
            <span>
              Perfil de runtime: <strong>{data.runtime_profile}</strong>
            </span>
            <span>
              Estado:{" "}
              <Badge
                kind={
                  data.status === "configured" || data.status === "active"
                    ? "success"
                    : data.status === "disabled"
                      ? "warning"
                      : "neutral"
                }
              >
                {data.status}
              </Badge>
            </span>
          </div>

          <div
            class="terminal-box"
            style={{
              background: "#070b14",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#a6e22e",
              maxHeight: "450px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {data.logs?.length ? (
              data.logs.map((line, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {line}
                </div>
              ))
            ) : (
              <span style={{ color: "var(--muted)" }}>
                No hay logs disponibles para este despliegue.
              </span>
            )}
          </div>
        </Section>
      ) : (
        <Empty
          label="Despliegue no encontrado"
          description="El identificador de despliegue no existe o no tiene permisos para inspeccionar sus logs."
        />
      )}
    </>
  );
}
