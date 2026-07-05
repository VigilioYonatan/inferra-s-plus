#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ORIGIN=$(sed -n 's/^API_ORIGIN=//p' "$HERE/.env" | tail -n 1)
[[ "$API_ORIGIN" == http://localhost* || "$API_ORIGIN" == https://* ]] || { echo 'Invalid API_ORIGIN' >&2; exit 1; }
docker compose --env-file "$HERE/.env" -f "$HERE/compose/compose.yaml" ps
curl --fail --silent --show-error --max-time 10 "${API_ORIGIN}/api/v1/system/capabilities" >/dev/null
printf 'HTTP smoke: PASS for capabilities endpoint. Run authenticated E2E before production.\n'
