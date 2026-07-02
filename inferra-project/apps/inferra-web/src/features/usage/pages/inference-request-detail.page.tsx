import { ResourceDetailPage } from "../../common/resource-pages";
export function InferenceRequestDetailPage() {
  return (
    <ResourceDetailPage
      title="Solicitud de inferencia"
      collection="usage/requests"
      fields={[
        { key: "id", label: "Id" },
        { key: "model_id", label: "Model Id" },
        { key: "status", label: "Status" },
        { key: "prompt_tokens", label: "Prompt Tokens" },
        { key: "completion_tokens", label: "Completion Tokens" },
        { key: "elapsed_ms", label: "Elapsed Ms" },
        { key: "created_at", label: "Created At" },
      ]}
    />
  );
}
