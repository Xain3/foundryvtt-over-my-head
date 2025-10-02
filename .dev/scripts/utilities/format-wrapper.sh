#!/bin/bash
set -euo pipefail

write_or_check="--write"
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    write_or_check="--check"
    break
  fi
done

prettier_args=("$write_or_check" "**/*.{js,mjs,cjs,json,md}" --ignore-path .prettierignore)
npx prettier "${prettier_args[@]}"
