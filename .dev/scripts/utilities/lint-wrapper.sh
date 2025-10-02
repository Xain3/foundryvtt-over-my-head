#!/bin/bash
set -euo pipefail

# Check if --dry-run is passed and set the flag accordingly
dry_run_flag=""
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    dry_run_flag="--dry-run"
    break
  fi
done
npx eslint src/ tests/ --ext .js,.mjs,.cjs "$dry_run_flag"
