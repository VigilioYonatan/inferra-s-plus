export interface DeploymentResponseDto {
  id: string;
  name: string;
  model_id: string;
  version_id?: string;
  engine: "vllm" | "tgi" | "ollama";
  status: "pending" | "running" | "failed" | "stopped";
  gpu_count: number;
  min_replicas: number;
  max_replicas: number;
  created_at: string;
  endpoint_url?: string;
}

export interface RegisterDeploymentRequestDto {
  name: string;
  model_id: string;
  version_id?: string;
  engine: "vllm" | "tgi" | "ollama";
  gpu_count?: number;
  min_replicas?: number;
  max_replicas?: number;
}

export interface DeploymentLogResponseDto {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}
