#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="${NODE_BIN:-node}"

# Derive procedural number and patch name from wrapper filename
SELF_NAME="$(basename "${BASH_SOURCE[0]}")"
PROCEDURAL_NUMBER="${SELF_NAME%%-*}"
PATCH_NAME="${SELF_NAME#*-}"
PATCH_NAME="${PATCH_NAME%.sh}"
SCRIPT="${PROCEDURAL_NUMBER}-${PATCH_NAME}.mjs"
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
  echo "[patch][dry-run] Would run initial sync: $NODE_BIN ${NODE_DIR}/${SCRIPT} --initial-only --procedural-number ${PROCEDURAL_NUMBER} --patch-name ${PATCH_NAME}"
  echo "[patch][dry-run] Would start loop in background: $NODE_BIN ${NODE_DIR}/${SCRIPT} --loop-only --procedural-number ${PROCEDURAL_NUMBER} --patch-name ${PATCH_NAME} &"
else
  "$NODE_BIN" "${NODE_DIR}/${SCRIPT}" --initial-only --procedural-number "${PROCEDURAL_NUMBER}" --patch-name "${PATCH_NAME}"
  "$NODE_BIN" "${NODE_DIR}/${SCRIPT}" --loop-only --procedural-number "${PROCEDURAL_NUMBER}" --patch-name "${PATCH_NAME}" &
  disown || true
  echo "[patch] $PATCH_NAME: Background sync loop started"
fi
