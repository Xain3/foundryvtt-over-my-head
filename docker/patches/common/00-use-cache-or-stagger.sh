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

# capture env values (preserve original env even if we later use DRY_RUN variable)
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

# If either env var is set to a truthy value (non-empty and not "0"), enable dry-run
if [ -n "$ENV_PATCH_DRY_RUN" ] && [ "$ENV_PATCH_DRY_RUN" != "0" ]; then
  DRY_RUN=1
fi
if [ -n "$ENV_DRY_RUN" ] && [ "$ENV_DRY_RUN" != "0" ]; then
  DRY_RUN=1
fi

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "[patch][error] node not found in PATH" >&2
  exit 1
fi

echo "[patch] $PATCH_NAME: Checking for cached Foundry release or applying stagger"
echo "[patch] $PATCH_NAME: Delegating to Node.js script"
CMD=("$NODE_BIN" "${SCRIPT_DIR}/${SCRIPT}")
if [ "$DRY_RUN" -ne 0 ]; then
  echo "[patch][dry-run] Would run: ${CMD[*]}"
else
  "${CMD[@]}"
  echo "[patch] $PATCH_NAME: Checks complete"
fi