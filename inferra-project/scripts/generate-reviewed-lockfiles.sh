#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v pnpm >/dev/null || { echo 'pnpm 10 required' >&2; exit 1; }
for p in "$ROOT/apps/inferra-impl" "$ROOT/apps/inferra-web"; do
  (cd "$p" && pnpm install --lockfile-only && pnpm install --frozen-lockfile && pnpm audit --audit-level high)
done
echo 'Review dependency diff and commit BOTH pnpm-lock.yaml files before CI/build.'
