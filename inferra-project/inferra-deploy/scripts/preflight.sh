#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v docker >/dev/null || { echo 'Docker Engine required' >&2; exit 1; }
docker compose version >/dev/null || { echo 'Docker Compose plugin required' >&2; exit 1; }
[[ -f "$HERE/.env" ]] || { echo 'Copy inferra-deploy/.env.example to .env' >&2; exit 1; }
if grep -q 'CHANGE_ME_' "$HERE/.env"; then echo 'Unchanged placeholder secret found' >&2; exit 1; fi
if stat -c '%a' "$HERE/.env" | grep -Eq '^[0-6][0-0][0-0]$'; then :; else echo 'Set chmod 600 on .env' >&2; exit 1; fi
docker compose --env-file "$HERE/.env" -f "$HERE/compose/compose.yaml" config --quiet
if grep -qE '^NODE_ENV=production$' "$HERE/.env"; then
  grep -qE '^COOKIE_SECURE=true$' "$HERE/.env" || { echo 'Production requires secure cookies' >&2; exit 1; }
  grep -qE '^APP_ORIGIN=https://' "$HERE/.env" || { echo 'Production requires HTTPS APP_ORIGIN' >&2; exit 1; }
  grep -qE '^API_ORIGIN=https://' "$HERE/.env" || { echo 'Production requires HTTPS API_ORIGIN' >&2; exit 1; }
  command -v cosign >/dev/null || { echo 'Cosign required in production' >&2; exit 1; }
  [[ -n "${RESTIC_REPOSITORY:-}" ]] || echo 'Warning: encrypted offsite backup repository must be configured separately' >&2
fi
if [[ "${1:-}" == '--gpu' ]]; then command -v nvidia-smi >/dev/null || { echo 'NVIDIA driver required' >&2; exit 1; };nvidia-smi --query-gpu=name,memory.total --format=csv,noheader;fi
echo 'Host preflight: PASS (configuration only, not runtime integration)'
