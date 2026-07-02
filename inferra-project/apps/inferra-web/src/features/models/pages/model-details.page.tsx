import { ResourceDetailPage } from "../../common/resource-pages";
export function ModelDetailsPage() {
  return (
    <ResourceDetailPage
      title="Detalle del modelo"
      collection="models"
      fields={[
        { key: "id", label: "Id" },
        { key: "public_name", label: "Public Name" },
        { key: "upstream_name", label: "Upstream Name" },
        { key: "context_window", label: "Context Window" },
        { key: "enabled", label: "Enabled" },
        { key: "created_at", label: "Created At" },
      ]}
    />
  );
}
