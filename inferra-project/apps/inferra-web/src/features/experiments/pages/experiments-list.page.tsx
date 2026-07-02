import { ResourceListPage } from "../../common/resource-pages";
export function ExperimentsListPage() {
  return (
    <ResourceListPage
      title="Experimentos"
      desc="Comparación reproducible de dos ejecuciones benchmark"
      collection="experiments"
      fields={[
        { key: "name", label: "Name" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Created At" },
      ]}
      newPath={`${location.pathname}/new`}
    />
  );
}
