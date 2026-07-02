import { ResourceCreatePage } from "../../common/resource-pages";
export function CreateRoutingPolicyPage() {
  return (
    <ResourceCreatePage
      title="Crear política de admisión"
      collection="routing"
      successPath={location.pathname.replace("/new", "")}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        {
          name: "model_id",
          label: "Model Id",
          type: "select",
          required: true,
          from: "models",
          optionLabel: "public_name",
        },
        {
          name: "enabled",
          label: "Enabled",
          type: "checkbox",
          required: false,
        },
        {
          name: "concurrency_cap",
          label: "Concurrency Cap",
          type: "number",
          required: true,
          min: 1,
          max: 128,
        },
      ]}
    />
  );
}
