import { useState } from "preact/hooks";
import {
  Badge,
  Button,
  CopyButton,
  Drawer,
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { useResource } from "../../../services/http/use-resource";

type RequestRecord = {
  id: string;
  status: string;
  prompt_tokens: number;
  completion_tokens: number;
  elapsed_ms: number;
  created_at: string;
  model_id?: string;
};

export function InferenceRequestsPage() {
  const org = activeOrg.value;
  const base = org ? `/api/v1/organizations/${org.id}/usage/requests` : null;
  const { data, error, loading, reload } = useResource<RequestRecord[]>(base);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(
    null,
  );

  const filtered = (data || []).filter((r) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "success")
      return r.status === "completed" || r.status === "200";
    if (filterStatus === "error")
      return r.status === "failed" || r.status === "500" || r.status === "400";
    return true;
  });

  return (
    <>
      <Heading
        title="Trazas de Inferencia Operacionales"
        desc="Auditoría de ejecuciones en tiempo real, latencias y consumo de tokens sin persistir contenido confidencial de prompts."
        actions={
          <Button kind="ghost" size="sm" onClick={reload}>
            Refrescar trazas
          </Button>
        }
      />

      {error && <Notice kind="danger">{error}</Notice>}

      <Section
        title="Registro de solicitudes"
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              style={{ padding: "6px 10px", fontSize: "12px", width: "auto" }}
            >
              <option value="all">Todos los estados</option>
              <option value="success">Completados con éxito</option>
              <option value="error">Errores y fallas</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : filtered.length ? (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>ID de Solicitud</th>
                  <th>Estado</th>
                  <th>Tokens (Prompt / Comp)</th>
                  <th>Latencia</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>
                      <code>{r.id.slice(0, 8)}…</code>
                    </td>
                    <td>
                      <Badge
                        kind={
                          r.status === "completed" || r.status === "200"
                            ? "success"
                            : "danger"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td class="tabular">
                      {r.prompt_tokens} / {r.completion_tokens} (
                      <strong>{r.prompt_tokens + r.completion_tokens}</strong>)
                    </td>
                    <td class="tabular">{r.elapsed_ms} ms</td>
                    <td>
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(r)}
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
            label="No hay trazas coincidentes"
            description="Las solicitudes cursadas a través de la API OpenAI-compatible se reflejarán automáticamente aquí."
          />
        )}
      </Section>

      {/* Request Inspection Drawer */}
      <Drawer
        open={Boolean(selectedRequest)}
        title="Detalle de la traza de inferencia"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
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
                Trace ID Único
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <code>{selectedRequest.id}</code>
                <CopyButton text={selectedRequest.id} />
              </div>
            </div>

            <div>
              <div style={{ color: "var(--muted)", marginBottom: "4px" }}>
                Estado de ejecución
              </div>
              <Badge
                kind={
                  selectedRequest.status === "completed" ||
                  selectedRequest.status === "200"
                    ? "success"
                    : "danger"
                }
              >
                {selectedRequest.status}
              </Badge>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                  Prompt Tokens
                </div>
                <div class="metric-value" style={{ fontSize: "18px" }}>
                  {selectedRequest.prompt_tokens}
                </div>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                  Completion Tokens
                </div>
                <div class="metric-value" style={{ fontSize: "18px" }}>
                  {selectedRequest.completion_tokens}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface)",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                Latencia de respuesta total
              </div>
              <div class="metric-value" style={{ fontSize: "22px" }}>
                {selectedRequest.elapsed_ms} ms
              </div>
            </div>

            <div>
              <div style={{ color: "var(--muted)", marginBottom: "4px" }}>
                Timestamp de registro
              </div>
              <div>{new Date(selectedRequest.created_at).toUTCString()}</div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
