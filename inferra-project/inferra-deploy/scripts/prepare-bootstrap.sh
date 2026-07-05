#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
umask 077
mkdir -p "$HERE/.secrets"
read -r -p 'Initial admin email: ' email
read -r -s -p 'Initial admin password (16+ characters): ' password
printf '\n'
[[ "$email" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ && ${#password} -ge 16 ]] || { echo 'Invalid input' >&2; exit 1; }
printf '%s' "$email" > "$HERE/.secrets/admin-email"
printf '%s' "$password" > "$HERE/.secrets/admin-password"
unset password
printf 'Bootstrap secrets written with restrictive permissions. After platform-setup succeeds, delete inferra-deploy/.secrets/ securely.\n'
