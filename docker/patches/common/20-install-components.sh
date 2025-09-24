#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="${NODE_BIN:-node}"

PATCH_NAME="20-install-components"
SCRIPT="$PATCH_NAME.mjs"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "[patch][error] node not found in PATH" >&2
  exit 1
fi

echo "[patch] $PATCH_NAME: Installing systems, modules, and worlds"
echo "[patch] $PATCH_NAME: Delegating to Node.js script"
"$NODE_BIN" "$SCRIPT_DIR/$SCRIPT"
echo "[patch] $PATCH_NAME: Installation complete"