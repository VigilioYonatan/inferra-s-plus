import { ResourceDetailPage } from "../../common/resource-pages";
export function DeploymentDetailPage() {
  return (
    <ResourceDetailPage
      title="Perfil de despliegue"
      collection="deployments"
      fields={[
        { key: "id", label: "Id" },
        { key: "model_id", label: "Model Id" },
        { key: "status", label: "Status" },
        { key: "runtime_profile", label: "Runtime Profile" },
        { key: "created_at", label: "Created At" },
      ]}
    />
  );
}
