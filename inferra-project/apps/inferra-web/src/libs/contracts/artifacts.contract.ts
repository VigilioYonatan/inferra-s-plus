export interface ArtifactResponseDto {
  id: string;
  name: string;
  kind: "weights" | "tokenizer" | "dataset" | "checkpoint";
  size_bytes: number;
  sha256?: string;
  created_at: string;
}

export interface CreateArtifactRequestDto {
  name: string;
  kind: "weights" | "tokenizer" | "dataset" | "checkpoint";
  size_bytes: number;
  sha256?: string;
}

export interface ArtifactPresignedResponseDto {
  artifact_id: string;
  upload_url: string;
  expires_in_seconds: number;
}
