export interface WebhookResponseDto {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_preview?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateWebhookRequestDto {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookRequestDto {
  url?: string;
  events?: string[];
  is_active?: boolean;
}

export interface WebhookDeliveryResponseDto {
  id: string;
  webhook_id: string;
  event: string;
  status_code: number;
  duration_ms: number;
  success: boolean;
  attempted_at: string;
}
