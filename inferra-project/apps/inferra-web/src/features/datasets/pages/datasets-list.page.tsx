import { ResourceListPage } from "../../common/resource-pages";
export function DatasetsListPage() {
  return (
    <ResourceListPage
      title="Datasets"
      desc="Referencias a artefactos bajo control de la organización"
      collection="datasets"
      fields={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "created_at", label: "Created At" },
      ]}
      newPath={`${location.pathname}/new`}
    />
  );
}
