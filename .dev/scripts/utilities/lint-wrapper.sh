#!/bin/bash
set -euo pipefail

# Check if --dry-run is passed and set the flag accordingly
args=(src/ tests/ --ext .js,.mjs,.cjs)
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    args+=(--dry-run)
    break
  fi
done
npx eslint "${args[@]}"
