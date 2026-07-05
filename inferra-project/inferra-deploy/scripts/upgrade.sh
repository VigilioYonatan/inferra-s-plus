#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[[ -r "$ROOT/.env" ]] || { echo 'Missing .env' >&2; exit 1; }
set -a; source "$ROOT/.env"; set +a
: "${API_IMAGE:?Specify immutable API_IMAGE@sha256 digest}"
: "${WEB_IMAGE:?Specify immutable WEB_IMAGE@sha256 digest}"
[[ "$API_IMAGE" == *@sha256:* && "$WEB_IMAGE" == *@sha256:* ]] || { echo 'Immutable OCI digest required' >&2; exit 1; }
[[ "${ACK_BACKUP_VERIFIED:-}" == yes ]] || { echo 'Successful external backup and restore drill acknowledgement required' >&2; exit 1; }
"$ROOT/scripts/verify-images.sh"
COMPOSE=(docker compose --env-file "$ROOT/.env" -f "$ROOT/compose/compose.yaml")
"${COMPOSE[@]}" pull api web
"${COMPOSE[@]}" --profile tools run --rm migrate
"${COMPOSE[@]}" up -d --no-build --force-recreate api worker web
"$ROOT/scripts/verify.sh"
echo 'New digests active. Retain previous signed images for manual rollback; DB schema rollback requires forward-compatible migration.'
