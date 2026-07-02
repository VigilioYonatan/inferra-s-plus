export interface UsageSummaryResponseDto {
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  period_start: string;
  period_end: string;
}

export interface InferenceRequestDetailResponseDto {
  id: string;
  organization_id: string;
  api_key_id?: string;
  model: string;
  status: "success" | "error" | "cancelled";
  duration_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: string;
}

export interface UsageTimeSeriesPointResponseDto {
  timestamp: string;
  requests_count: number;
  tokens_count: number;
}
