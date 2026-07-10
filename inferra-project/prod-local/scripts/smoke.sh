#!/usr/bin/env bash
set -Eeuo pipefail
BASE="${BASE_URL:-http://localhost}"
curl -fsS "$BASE/api/v1/system/capabilities" | grep -q 'version'
[[ "$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/api/v1/organizations")" == '404' || "$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/api/v1/organizations")" == '401' ]] || { echo 'Unauthorized org listing unexpectedly allowed' >&2; exit 1; }
echo 'Basic smoke checks passed'
