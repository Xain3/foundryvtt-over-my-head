#!/usr/bin/env bash
set -euo pipefail

# 00-use-cache-or-stagger.sh
# - If a cached Foundry zip exists under CONTAINER_CACHE, point the entrypoint
#   at it via FOUNDRY_RELEASE_URL to avoid network fetch and rate-limits.
# - If no cache is present, optionally sleep a short, configurable delay to
#   stagger concurrent presigned URL requests across multiple containers.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="${NODE_BIN:-node}"

PATCH_NAME="00-use-cache-or-stagger"
SCRIPT="$PATCH_NAME.mjs"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "[patch][error] node not found in PATH" >&2
  exit 1
fi

echo "[patch] $PATCH_NAME: Checking for cached Foundry release or applying stagger"
echo "[patch] $PATCH_NAME: Delegating to Node.js script"
"$NODE_BIN" "$SCRIPT_DIR/$SCRIPT"
echo "[patch] $PATCH_NAME: Checks complete"