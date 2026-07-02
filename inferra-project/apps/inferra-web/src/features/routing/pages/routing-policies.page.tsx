import { ResourceListPage } from "../../common/resource-pages";
export function RoutingPoliciesPage() {
  return (
    <ResourceListPage
      title="Políticas de admisión"
      desc="Control de concurrencia real por modelo y organización"
      collection="routing"
      fields={[
        { key: "name", label: "Name" },
        { key: "model_id", label: "Model Id" },
        { key: "enabled", label: "Enabled" },
        { key: "concurrency_cap", label: "Concurrency Cap" },
      ]}
      newPath={`${location.pathname}/new`}
    />
  );
}
