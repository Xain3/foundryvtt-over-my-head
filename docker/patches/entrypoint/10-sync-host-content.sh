#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="${NODE_BIN:-node}"

PATCH_NAME="10-sync-host-content"
SCRIPT="$PATCH_NAME.mjs"
NODE_DIR="${SCRIPT_DIR}/../common"

ENV_PATCH_DRY_RUN="${PATCH_DRY_RUN:-}"
ENV_DRY_RUN="${DRY_RUN:-}"

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run|-n)
      DRY_RUN=1
      ;;
  esac
done

if [ -n "$ENV_PATCH_DRY_RUN" ] && [ "$ENV_PATCH_DRY_RUN" != "0" ]; then DRY_RUN=1; fi
if [ -n "$ENV_DRY_RUN" ] && [ "$ENV_DRY_RUN" != "0" ]; then DRY_RUN=1; fi

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "[patch][error] node not found in PATH" >&2
  exit 1
fi

echo "[patch] $PATCH_NAME: Delegating to Node.js script"
CMD=("$NODE_BIN" "${NODE_DIR}/${SCRIPT}")
if [ "$DRY_RUN" -ne 0 ]; then
  echo "[patch][dry-run] Would run: ${CMD[*]}"
else
  "${CMD[@]}"
  echo "[patch] $PATCH_NAME: Started"
fi
