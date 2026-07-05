# Recover PostgreSQL
- Daily `pg_dump` to external filesystem and encrypted offsite restic is implemented in scripts. Continuous WAL/PITR via pgBackRest is **not configured**.
- Schedule backup systemd timer on host and test backups weekly in isolated staging; fail if restic backup or checksum fails.
- Estimated RPO: up to 24 hours if daily backups actually run and succeed. RTO must be measured, not assumed.
- Rotate compromised credentials before exposing restored instance; use `restore-drill.sh --isolated-only` and verify database invariants.
