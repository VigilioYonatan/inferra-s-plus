import { ResourceEditPage } from "../../common/resource-pages";
export function ModelSettingsPage() {
  return (
    <ResourceEditPage
      title="Ajustes del modelo"
      collection="models"
      idPosition={1}
      fields={[
        {
          name: "context_window",
          label: "Context Window",
          type: "number",
          required: false,
          min: 256,
          max: 131072,
        },
        {
          name: "enabled",
          label: "Enabled",
          type: "checkbox",
          required: false,
        },
      ]}
    />
  );
}
