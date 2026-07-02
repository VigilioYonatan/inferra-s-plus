import { ResourceCreatePage } from "../../common/resource-pages";
export function CreateExperimentPage() {
  return (
    <ResourceCreatePage
      title="Nuevo experimento"
      collection="experiments"
      successPath={location.pathname.replace("/new", "")}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        {
          name: "baseline_benchmark_id",
          label: "Baseline Benchmark Id",
          type: "select",
          required: true,
          from: "benchmarks",
          optionLabel: "id",
        },
        {
          name: "candidate_benchmark_id",
          label: "Candidate Benchmark Id",
          type: "select",
          required: true,
          from: "benchmarks",
          optionLabel: "id",
        },
      ]}
    />
  );
}
