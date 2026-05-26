ALTER TABLE oauth_states ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
