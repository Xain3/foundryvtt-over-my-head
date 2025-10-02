#!/bin/bash
set -euo pipefail

<<<<<<< HEAD
write_or_check="--write"
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    write_or_check="--check"
    break
  fi
done

npx prettier $write_or_check "**/*.{js,mjs,cjs,json,md}" --ignore-path .prettierignore
=======
echo "Format-wrapper is not implemented yet."
>>>>>>> 22b2c9fb4cf111e7e2c4ab8000ed344556b332b7
