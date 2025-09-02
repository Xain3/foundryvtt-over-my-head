#!/usr/bin/env bash
set -euo pipefail

## Wrapper for the component installation patch (systems/modules/worlds)
##
## This wrapper derives the `PATCH_NAME` from its filename and delegates to
## the Node script at `docker/patches/common/<patch-name>.mjs`. The Node script
## receives `--procedural-number` and `--patch-name` for logging and identification.
##
## Environment and flags:
## - `NODE_BIN` overrides the node executable (default: `node`).
## - `PATCH_DRY_RUN` or `DRY_RUN` can be set to perform a dry-run.
## - The wrapper accepts `--dry-run` / `-n` as well.

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/common"
# shellcheck disable=SC1090
source "${LIB_DIR}/wrapper-bin.sh"

export WRAPPER_RUN_MODE="default"
export WRAPPER_NODE_BIN="${NODE_BIN:-node}"
wrapper_main "$@"
