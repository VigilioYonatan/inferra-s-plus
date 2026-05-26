ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_pending text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mfa_verified boolean NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS recovery_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id),code_hash text NOT NULL,used_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS recovery_codes_user_idx ON recovery_codes(user_id);
