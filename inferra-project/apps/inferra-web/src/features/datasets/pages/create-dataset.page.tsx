import { ResourceCreatePage } from "../../common/resource-pages";
export function CreateDatasetPage() {
  return (
    <ResourceCreatePage
      title="Crear dataset"
      collection="datasets"
      successPath={location.pathname.replace("/new", "")}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
        {
          name: "artifact_id",
          label: "Artifact Id",
          type: "select",
          required: false,
          from: "artifacts",
          optionLabel: "original_name",
          nullable: true,
        },
      ]}
    />
  );
}
