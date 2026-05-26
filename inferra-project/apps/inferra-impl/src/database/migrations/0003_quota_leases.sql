CREATE TABLE IF NOT EXISTS quota_leases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES organizations(id),period text NOT NULL,reserved_tokens bigint NOT NULL CHECK(reserved_tokens>0),expires_at timestamptz NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS quota_leases_expires ON quota_leases(expires_at);
