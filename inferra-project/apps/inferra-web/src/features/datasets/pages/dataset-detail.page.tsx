import { ResourceDetailPage } from "../../common/resource-pages";
export function DatasetDetailPage() {
  return (
    <ResourceDetailPage
      title="Detalle del dataset"
      collection="datasets"
      fields={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "artifact_id", label: "Artifact Id" },
        { key: "created_at", label: "Created At" },
      ]}
    />
  );
}
