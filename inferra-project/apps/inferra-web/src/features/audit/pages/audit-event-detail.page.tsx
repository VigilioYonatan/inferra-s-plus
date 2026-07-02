import { ResourceDetailPage } from "../../common/resource-pages";
export function AuditEventDetailPage() {
  return (
    <ResourceDetailPage
      title="Evento de auditoría"
      collection="audit"
      fields={[
        { key: "id", label: "ID" },
        { key: "action", label: "Acción" },
        { key: "actor_id", label: "Actor" },
        { key: "resource_type", label: "Recurso" },
        { key: "resource_id", label: "ID recurso" },
        { key: "created_at", label: "Fecha" },
      ]}
    />
  );
}
