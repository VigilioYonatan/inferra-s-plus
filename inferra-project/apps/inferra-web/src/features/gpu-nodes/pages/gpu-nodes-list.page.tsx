import { ResourceListPage } from "../../common/resource-pages";
export function GpuNodesListPage() {
  return (
    <ResourceListPage
      title="Nodos GPU"
      desc="Datos de NVIDIA DCGM Exporter; requiere perfil gpu-observability"
      collection="gpu-nodes"
      fields={[
        { key: "gpu", label: "Gpu" },
        { key: "name", label: "Name" },
        { key: "utilization_percent", label: "Utilization Percent" },
        { key: "vram_bytes", label: "Vram Bytes" },
      ]}
    />
  );
}
