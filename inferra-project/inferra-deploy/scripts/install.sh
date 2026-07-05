#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose --env-file "$HERE/.env" -f "$HERE/compose/compose.yaml")
"$HERE/scripts/preflight.sh" "$@"
set -a; source "$HERE/.env"; set +a
if [[ "${NODE_ENV:-development}" == production ]]; then
  # Never build mutable local sources for production: only signed immutable published digests.
  "$HERE/scripts/verify-images.sh"
  "${COMPOSE[@]}" pull api web postgres valkey caddy
else
  "${COMPOSE[@]}" build api web
fi
"${COMPOSE[@]}" up -d postgres valkey
"${COMPOSE[@]}" --profile tools run --rm migrate
if [[ -f "$HERE/.secrets/admin-email" && -f "$HERE/.secrets/admin-password" ]]; then
  "${COMPOSE[@]}" --profile tools run --rm platform-setup
  rm -f "$HERE/.secrets/admin-email" "$HERE/.secrets/admin-password"
fi
"${COMPOSE[@]}" up -d web api worker caddy
if [[ " ${*} " == *" --gpu "* ]]; then "${COMPOSE[@]}" --profile gpu up -d vllm; fi
"$HERE/scripts/verify.sh"
