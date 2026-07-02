import { ResourceDetailPage } from "../../common/resource-pages";
export function ModelImportDetailPage() {
  return (
    <ResourceDetailPage
      title="Solicitud de importación"
      collection="model-imports"
      fields={[
        { key: "repository_id", label: "Modelo" },
        { key: "status", label: "Estado" },
        { key: "requested_by", label: "Solicitante" },
        { key: "created_at", label: "Fecha" },
      ]}
    />
  );
}
