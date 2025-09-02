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
# Strategy:
# 1) Run an initial sync in the foreground to ensure content is ready.
# 2) Start the continuous loop in the background so the entrypoint can continue.
if [ "$DRY_RUN" -ne 0 ]; then
  echo "[patch][dry-run] Would run initial sync: $NODE_BIN ${NODE_DIR}/${SCRIPT} --initial-only"
  echo "[patch][dry-run] Would start loop in background: $NODE_BIN ${NODE_DIR}/${SCRIPT} --loop-only &"
else
  "$NODE_BIN" "${NODE_DIR}/${SCRIPT}" --initial-only
  "$NODE_BIN" "${NODE_DIR}/${SCRIPT}" --loop-only &
  disown || true
  echo "[patch] $PATCH_NAME: Background sync loop started"
fi
