#!/usr/bin/env bash
set -Eeuo pipefail
[[ -n "${COSIGN_PUBLIC_KEY_FILE:-}" ]] || { echo 'COSIGN_PUBLIC_KEY_FILE required' >&2; exit 1; }
command -v cosign >/dev/null || { echo 'cosign not installed' >&2; exit 1; }
for img in "${API_IMAGE:?API_IMAGE missing}" "${WEB_IMAGE:?WEB_IMAGE missing}"; do
 [[ "$img" == *@sha256:* ]] || { echo "Image must be digest-pinned: $img" >&2; exit 1; }
 cosign verify --key "$COSIGN_PUBLIC_KEY_FILE" "$img" >/dev/null
done
echo 'OCI signatures verified'
