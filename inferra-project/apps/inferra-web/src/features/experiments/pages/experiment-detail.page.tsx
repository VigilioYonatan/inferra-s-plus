import { ResourceDetailPage } from "../../common/resource-pages";
export function ExperimentDetailPage() {
  return (
    <ResourceDetailPage
      title="Experimento A/B"
      collection="experiments"
      fields={[
        { key: "name", label: "Name" },
        { key: "status", label: "Status" },
        { key: "baseline_benchmark_id", label: "Baseline Benchmark Id" },
        { key: "candidate_benchmark_id", label: "Candidate Benchmark Id" },
        { key: "comparison", label: "Comparison" },
      ]}
    />
  );
}
