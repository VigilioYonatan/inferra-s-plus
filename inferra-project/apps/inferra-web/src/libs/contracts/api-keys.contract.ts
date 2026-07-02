export interface ApiKeyResponseDto {
  id: string;
  name: string;
  prefix: string;
  role: "admin" | "inference" | "read_only";
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface CreateApiKeyRequestDto {
  name: string;
  role: "admin" | "inference" | "read_only";
  expires_in_days?: number;
}

export interface CreatedApiKeyResponseDto extends ApiKeyResponseDto {
  raw_token: string;
}

export interface RotateApiKeyResponseDto {
  id: string;
  raw_token: string;
  rotated_at: string;
}
