-- New users cannot log in without email ownership verification.
-- Bootstrap and OAuth identities provision already verified addresses.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
-- Accounts created before this migration must be reverified manually; do not silently mark them trusted.
