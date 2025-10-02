#!/bin/bash
set -euo pipefail

<<<<<<< HEAD
# Check if --dry-run is passed and set the flag accordingly
dry_run_flag=""
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    dry_run_flag="--dry-run"
    break
  fi
done
npx eslint src/ tests/ --ext .js,.mjs,.cjs $dry_run_flag
=======
echo "Lint-wrapper is not implemented yet."
>>>>>>> 22b2c9fb4cf111e7e2c4ab8000ed344556b332b7
