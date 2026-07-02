import { ResourceListPage } from "../../common/resource-pages";
export function OrganizationAlertsPage() {
  return (
    <ResourceListPage
      title="Incidentes"
      desc="Incidentes operacionales y confirmaciones"
      collection="alerts"
      fields={[
        { key: "title", label: "Title" },
        { key: "severity", label: "Severity" },
        { key: "source", label: "Source" },
        { key: "acknowledged_at", label: "Acknowledged At" },
        { key: "occurred_at", label: "Occurred At" },
      ]}
    />
  );
}
