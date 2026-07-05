#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v promtool >/dev/null || { echo 'promtool required' >&2; exit 1; }
(cd "$HERE/observability" && promtool check rules alerts.yml && promtool test rules alerts.test.yml)
echo 'Prometheus alerts syntax and test rules validated.'
