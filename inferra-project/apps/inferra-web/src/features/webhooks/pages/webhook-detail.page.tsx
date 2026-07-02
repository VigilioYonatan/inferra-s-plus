import { useEffect, useState } from "preact/hooks";

import {
  Badge,
  Button,
  CopyButton,
  Drawer,
  Empty,
  Field,
  Heading,
  Link,
  Modal,
  Notice,
  Section,
  SkeletonCard,
  SkeletonTable,
  StatusDot,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { patchJson, postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Webhook = {
  id: string;
  url: string;
  secret_masked?: string;
  events: string[];
  enabled: boolean;
  created_at: string;
};

type Delivery = {
  id: string;
  event: string;
  status_code: number;
  success: boolean;
  elapsed_ms: number;
  payload: Record<string, unknown>;
  response_body?: string;
  created_at: string;
};

export function WebhookDetailPage() {
  const org = activeOrg.value;
  const pathParts = window.location.pathname.split("/");
  const webhookId = pathParts[pathParts.length - 1];

  const base = org
    ? `/api/v1/organizations/${org.id}/webhooks/${webhookId}`
    : null;
  const { data: webhook, error, loading, reload } = useResource<Webhook>(base);
  const {
    data: deliveries,
    loading: loadingDeliveries,
    reload: reloadDeliveries,
  } = useResource<Delivery[]>(base ? `${base}/deliveries` : null);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (webhook) {
      setEditUrl(webhook.url);
    }
  }, [webhook]);

  const handleTest = async () => {
    if (!base) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await postJson<{ success: boolean; status_code?: number }>(
        `${base}/test`,
        {},
      );
      setTestResult(
        res.success
          ? `Prueba exitosa (HTTP ${res.status_code || 200})`
          : `Falló la prueba (HTTP ${res.status_code || 500})`,
      );
      reloadDeliveries();
    } catch (e) {
      setTestResult(e instanceof Error ? e.message : "Error enviando ping");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveEdit = async (e: Event) => {
    e.preventDefault();
    if (!base) return;
    setSaving(true);
    try {
      await patchJson(base, { url: editUrl });
      setEditOpen(false);
      reload();
    } catch (e) {
      setTestResult(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/settings/webhooks`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a Webhooks
        </Link>
      </div>

      <Heading
        title="Detalle y entregas de Webhook"
        desc="Monitorea el registro de eventos, historial de entregas HTTP y códigos de respuesta en tiempo real."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <Button kind="ghost" size="sm" onClick={() => setEditOpen(true)}>
              Editar URL
            </Button>
            <Button
              kind="primary"
              size="sm"
              loading={testing}
              onClick={handleTest}
            >
              Probar ping de entrega
            </Button>
          </div>
        }
      />

      {testResult && (
        <Notice kind={testResult.includes("exitosa") ? "success" : "danger"}>
          {testResult}
        </Notice>
      )}

      {loading ? (
        <SkeletonCard />
      ) : error ? (
        <Notice kind="danger">{error}</Notice>
      ) : webhook ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <Section title="Configuración del endpoint">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "var(--muted)" }}>Destino URL: </span>
                <code
                  style={{
                    background: "var(--surface)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {webhook.url}
                </code>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>
                  Secreto de firma HMAC:{" "}
                </span>
                <code
                  style={{
                    background: "var(--surface)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {webhook.secret_masked || "whsec_••••••••••••••••"}
                </code>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ color: "var(--muted)" }}>Estado: </span>
                <StatusDot status={webhook.enabled ? "online" : "offline"} />
                <span>{webhook.enabled ? "Activo" : "Pausado"}</span>
              </div>
            </div>
          </Section>

          <Section title="Eventos suscritos">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {webhook.events?.length ? (
                webhook.events.map((ev) => (
                  <Badge key={ev} kind="info">
                    {ev}
                  </Badge>
                ))
              ) : (
                <Badge kind="neutral">Todos los eventos (*)</Badge>
              )}
            </div>
            <div
              style={{
                marginTop: "16px",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              Creado el {new Date(webhook.created_at).toLocaleDateString()}
            </div>
          </Section>
        </div>
      ) : null}

      <Section title="Historial de entregas recientes (Deliveries)">
        {loadingDeliveries ? (
          <SkeletonTable rows={4} cols={5} />
        ) : deliveries?.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Evento</th>
                  <th>Estado</th>
                  <th>Latencia</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.created_at).toLocaleTimeString()}</td>
                    <td>
                      <code>{d.event}</code>
                    </td>
                    <td>
                      <Badge kind={d.success ? "success" : "danger"}>
                        HTTP {d.status_code || 500}
                      </Badge>
                    </td>
                    <td class="tabular">{d.elapsed_ms || 12} ms</td>
                    <td>
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => setSelectedDelivery(d)}
                      >
                        Inspeccionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            label="No hay intentos de entrega registrados"
            description="Haz clic en 'Probar ping de entrega' para enviar un evento de prueba."
          />
        )}
      </Section>

      {/* Delivery Inspect Drawer */}
      <Drawer
        open={Boolean(selectedDelivery)}
        title="Inspección de entrega webhook"
        onClose={() => setSelectedDelivery(null)}
      >
        {selectedDelivery && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              fontSize: "13px",
            }}
          >
            <div>
              <div style={{ color: "var(--muted)", marginBottom: "4px" }}>
                ID de Entrega
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <code>{selectedDelivery.id}</code>
                <CopyButton text={selectedDelivery.id} />
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", marginBottom: "4px" }}>
                Código de respuesta HTTP
              </div>
              <Badge kind={selectedDelivery.success ? "success" : "danger"}>
                HTTP {selectedDelivery.status_code}
              </Badge>
            </div>
            <div>
              <div style={{ color: "var(--muted)", marginBottom: "4px" }}>
                Cuerpo del Payload (JSON)
              </div>
              <pre
                style={{
                  background: "var(--surface)",
                  padding: "12px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(
                  selectedDelivery.payload || { event: selectedDelivery.event },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit URL Modal */}
      <Modal
        open={editOpen}
        title="Modificar URL del Webhook"
        onClose={() => setEditOpen(false)}
        actions={
          <>
            <Button kind="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button kind="primary" loading={saving} onClick={handleSaveEdit}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit}>
          <Field
            label="URL de destino (HTTPS)"
            type="url"
            value={editUrl}
            required
            onInput={(e: any) => setEditUrl(e.target.value)}
            hint="Asegúrate de que la URL acepte solicitudes POST con formato JSON."
          />
        </form>
      </Modal>
    </>
  );
}
