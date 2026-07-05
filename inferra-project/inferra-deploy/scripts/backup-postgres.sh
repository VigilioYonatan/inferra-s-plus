#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[[ -d "${BACKUP_DIR:-}" ]] || { echo 'BACKUP_DIR must be a prepared external backup directory' >&2; exit 1; }
umask 077
name="inferra-$(date -u +%Y%m%dT%H%M%SZ).dump"
# Database dump uses pg_dump from the private PostgreSQL container. The output is a plaintext dump; encrypt when copying offsite.
docker compose --env-file "$HERE/.env" -f "$HERE/compose/compose.yaml" exec -T postgres sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d inferra --format=custom --no-owner' > "$BACKUP_DIR/$name.tmp"
mv "$BACKUP_DIR/$name.tmp" "$BACKUP_DIR/$name"
sha256sum "$BACKUP_DIR/$name" > "$BACKUP_DIR/$name.sha256"
[[ -n "${RESTIC_REPOSITORY:-}" && -n "${RESTIC_PASSWORD_FILE:-}" ]] || { echo 'Backup created locally but no encrypted offsite restic configured: BLOCKED for production' >&2; exit 2; }
restic backup "$BACKUP_DIR/$name" "$BACKUP_DIR/$name.sha256"
echo "Encrypted backup uploaded. Restore drill is still required."
