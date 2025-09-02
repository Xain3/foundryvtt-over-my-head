#!/usr/bin/env bash
set -euo pipefail

# Thin wrapper: set mode if needed and delegate to wrapper-bin
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/common"
# shellcheck disable=SC1090
source "${LIB_DIR}/wrapper-bin.sh"

export WRAPPER_RUN_MODE="default"
export WRAPPER_NODE_BIN="${NODE_BIN:-node}"
wrapper_main "$@"
