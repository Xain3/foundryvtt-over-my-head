#!/usr/bin/env bash
set -euo pipefail

## Wrapper for the host content synchronisation patch
## See the `docker/patches/entrypoint/` README or other wrappers for
## the naming convention and environment variables. Key notes:
## - Wrapper filename: optional numeric prefix + '-' + patch name + '.sh'
## - The patch name maps to `docker/patches/common/<patch-name>.mjs`
## - `--procedural-number` and `--patch-name` are passed to the Node script
##   so the Node-side code can construct consistent log prefixes.
## - Supports dry-run via `PATCH_DRY_RUN` or `DRY_RUN` env vars or `--dry-run` flag.

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/common"
# shellcheck disable=SC1090
source "${LIB_DIR}/wrapper-bin.sh"

export WRAPPER_RUN_MODE="sync-loop"
export WRAPPER_NODE_BIN="${NODE_BIN:-node}"
wrapper_main "$@"
