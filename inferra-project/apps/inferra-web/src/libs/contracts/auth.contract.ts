export interface IdentityPublicResponseDto {
  id: string;
  email: string;
  status: "pending_verification" | "active" | "suspended";
  created_at: string;
}

export interface SessionResponseDto {
  id: string;
  user_id: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  expires_at: string;
  is_current?: boolean;
}

export interface RegisterAccountRequestDto {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthenticatePasswordRequestDto {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RequestEmailOtpRequestDto {
  email: string;
  purpose: "login" | "verification" | "recovery";
}

export interface VerifyEmailOtpRequestDto {
  email: string;
  code: string;
}

export interface MfaEnrollResponseDto {
  secret: string;
  qr_code_uri: string;
  recovery_codes: string[];
}

export interface SocialAccountDto {
  provider: "google" | "facebook" | "github";
  account_id: string;
  connected_at: string;
}
