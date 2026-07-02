import { ResourceCreatePage } from "../../common/resource-pages";
export function StartModelImportPage() {
  return (
    <ResourceCreatePage
      title="Solicitar modelo"
      collection="model-imports"
      successPath={location.pathname.replace("/new", "")}
      fields={[
        {
          name: "repository_id",
          label: "ID de modelo Hugging Face (organización/modelo)",
          required: true,
        },
      ]}
    />
  );
}
