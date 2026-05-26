CREATE TABLE IF NOT EXISTS instance_administrators(user_id uuid PRIMARY KEY REFERENCES users(id),role text NOT NULL CHECK(role IN ('owner','admin','auditor')),created_at timestamptz NOT NULL DEFAULT now());
-- Existing installations require controlled, audited manual owner migration using platform tools.
-- Never elevate an ordinary organization owner implicitly to an instance administrator.
