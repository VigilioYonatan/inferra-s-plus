CREATE TABLE IF NOT EXISTS artifacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 uploaded_by uuid NOT NULL REFERENCES users(id),
 original_name text NOT NULL,
 object_key text NOT NULL UNIQUE,
 content_type text NOT NULL,
 file_size bigint NOT NULL CHECK(file_size > 0 AND file_size <= 20971520),
 sha256 text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS artifacts_org_created_idx ON artifacts(organization_id,created_at DESC);
