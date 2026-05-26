ALTER TABLE quota_leases ADD COLUMN IF NOT EXISTS model_id uuid REFERENCES models(id);
CREATE INDEX IF NOT EXISTS quota_leases_model_idx ON quota_leases(organization_id,model_id);
