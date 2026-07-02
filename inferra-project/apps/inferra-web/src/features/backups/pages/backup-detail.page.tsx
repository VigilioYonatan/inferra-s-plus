import { ResourceDetailPage } from "../../common/resource-pages";
export function BackupDetailPage() {
  return (
    <ResourceDetailPage
      title="Respaldo de instancia"
      collection="backups"
      fields={[
        { key: "status", label: "Status" },
        { key: "method", label: "Method" },
        { key: "started_at", label: "Started At" },
        { key: "completed_at", label: "Completed At" },
        { key: "size_bytes", label: "Size Bytes" },
        { key: "detail", label: "Detail" },
      ]}
      admin={true}
    />
  );
}
