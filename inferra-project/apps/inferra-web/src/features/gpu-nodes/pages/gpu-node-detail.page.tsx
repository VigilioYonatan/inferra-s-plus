import { ResourceDetailPage } from "../../common/resource-pages";
export function GpuNodeDetailPage() {
  return (
    <ResourceDetailPage
      title="Telemetría GPU"
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
