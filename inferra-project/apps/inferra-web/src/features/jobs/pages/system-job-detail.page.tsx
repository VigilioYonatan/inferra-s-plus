import { ResourceDetailPage } from "../../common/resource-pages";
export function SystemJobDetailPage() {
  return (
    <ResourceDetailPage
      title="Estado del trabajo"
      collection="jobs"
      fields={[
        { key: "id", label: "Id" },
        { key: "status", label: "Status" },
        { key: "results", label: "Results" },
        { key: "created_at", label: "Created At" },
      ]}
      admin={true}
    />
  );
}
