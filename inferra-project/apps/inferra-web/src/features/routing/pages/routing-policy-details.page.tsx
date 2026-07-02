import { ResourceDetailPage } from "../../common/resource-pages";
export function RoutingPolicyDetailsPage() {
  return (
    <ResourceDetailPage
      title="Detalle de política"
      collection="routing"
      fields={[
        { key: "name", label: "Name" },
        { key: "model_id", label: "Model Id" },
        { key: "enabled", label: "Enabled" },
        { key: "concurrency_cap", label: "Concurrency Cap" },
        { key: "created_at", label: "Created At" },
      ]}
    />
  );
}
