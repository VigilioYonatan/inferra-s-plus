import { ResourceCreatePage } from "../../common/resource-pages";
export function CreateDeploymentPage() {
  return (
    <ResourceCreatePage
      title="Nuevo perfil de despliegue"
      collection="deployments"
      successPath={location.pathname.replace("/new", "")}
      fields={[
        {
          name: "model_id",
          label: "Model Id",
          type: "select",
          required: true,
          from: "models",
          optionLabel: "public_name",
        },
        {
          name: "runtime_profile",
          label: "Runtime Profile",
          type: "select",
          required: true,
          choices: [
            { value: "gpu-small", label: "GPU small" },
            { value: "gpu-medium", label: "GPU medium" },
            { value: "gpu-large", label: "GPU large" },
          ],
        },
      ]}
    />
  );
}
