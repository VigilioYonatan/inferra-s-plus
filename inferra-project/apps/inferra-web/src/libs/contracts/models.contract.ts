export interface ModelResponseDto {
  id: string;
  name: string;
  family: string;
  format: "gguf" | "safetensors" | "onnx" | "vllm";
  parameter_count: string;
  context_length: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RegisterModelRequestDto {
  name: string;
  family: string;
  format: "gguf" | "safetensors" | "onnx" | "vllm";
  parameter_count: string;
  context_length: number;
  description?: string;
}

export interface UpdateModelRequestDto {
  name?: string;
  is_active?: boolean;
  description?: string;
}

export interface ModelVersionResponseDto {
  id: string;
  model_id: string;
  version: string;
  artifact_id: string;
  quantization?: string;
  created_at: string;
}

export interface CreateModelVersionRequestDto {
  version: string;
  artifact_id: string;
  quantization?: string;
}
