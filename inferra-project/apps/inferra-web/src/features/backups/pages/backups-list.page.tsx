import { ResourceListPage } from "../../common/resource-pages";
export function BackupsListPage() {
  return (
    <ResourceListPage
      title="Backups de instancia"
      desc="Solo el administrador de instancia puede consultar los respaldos"
      collection="backups"
      fields={[
        { key: "status", label: "Status" },
        { key: "method", label: "Method" },
        { key: "size_bytes", label: "Size Bytes" },
        { key: "started_at", label: "Started At" },
      ]}
      admin={true}
    />
  );
}
