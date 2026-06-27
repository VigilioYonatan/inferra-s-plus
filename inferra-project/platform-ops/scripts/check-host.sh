#!/usr/bin/env bash
set -Eeuo pipefail
command -v docker >/dev/null || exit 1
docker compose version
[[ "$(id -u)" -ne 0 ]] || { echo 'Run as a dedicated operations account, not root' >&2; exit 1; }
command -v nvidia-smi >/dev/null && nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || echo 'NVIDIA GPU profile not available'
if command -v ss >/dev/null;then ss -tulpn | grep -E ':(80|443|5432|6379|8000)\b' || :;fi
