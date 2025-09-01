#!/usr/bin/env sh
set -eu

# 10-sync-host-content.mjs
# Thin wrapper that delegates to the Node.js implementation.
# - Mirrors module build (host -> container) with delete policy
# - Syncs world bidirectionally (host <-> container)
# - Prefers rsync with safe flags; falls back to cp when needed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)"
NODE_BIN="${NODE_BIN:-node}"

PATCH_NAME="10-sync-host-content"
SCRIPT="$PATCH_NAME.mjs"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "[patch][error] node not found in PATH" >&2
  exit 1
fi

echo "[patch] $PATCH_NAME: Starting sync (delegating to Node.js script)"
"$NODE_BIN" "$SCRIPT_DIR/$SCRIPT"
echo "[patch] $PATCH_NAME: Node launch initiated"
