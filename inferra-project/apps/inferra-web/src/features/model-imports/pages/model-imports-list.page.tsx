import { ResourceListPage } from "../../common/resource-pages";
export function ModelImportsListPage() {
  return (
    <ResourceListPage
      title="Solicitudes de modelos"
      desc="La solicitud se revisa desde el host: no ejecuta Docker ni descarga pesos automáticamente."
      collection="model-imports"
      fields={[
        { key: "repository_id", label: "Repositorio" },
        { key: "status", label: "Estado" },
        { key: "created_at", label: "Fecha" },
      ]}
      newPath={`${location.pathname}/new`}
    />
  );
}
