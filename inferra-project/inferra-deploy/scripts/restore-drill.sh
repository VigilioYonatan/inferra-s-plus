#!/usr/bin/env bash
set -Eeuo pipefail
[[ "${1:-}" == '--isolated-only' ]] || { echo 'Always run restore in an isolated staging VM. Supply --isolated-only.' >&2; exit 1; }
[[ -n "${DUMP_FILE:-}" && -r "${DUMP_FILE:-}" ]] || { echo 'DUMP_FILE required' >&2; exit 1; }
[[ "${RESTORE_TARGET_HOST:-}" == '127.0.0.1' ]] || { echo 'Restore target must be isolated localhost via tunnel' >&2; exit 1; }
pg_restore --verbose --exit-on-error --clean --if-exists --no-owner --host=127.0.0.1 --dbname="${RESTORE_TARGET_DATABASE:?}" --username="${RESTORE_TARGET_USER:?}" "$DUMP_FILE"
echo 'Restore completed; now perform integrity and application smoke checks.'
