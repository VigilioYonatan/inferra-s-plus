import { ResourceListPage } from "../../common/resource-pages";
export function SystemJobsPage() {
  return (
    <ResourceListPage
      title="Jobs de instancia"
      desc="Trabajos de benchmarking observables por administradores"
      collection="jobs"
      fields={[
        { key: "id", label: "Id" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Created At" },
      ]}
      admin={true}
    />
  );
}
