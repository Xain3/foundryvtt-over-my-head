#!/bin/bash
set -euo pipefail

write_or_check="--write"
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    write_or_check="--check"
    break
  fi
done

npx prettier "$write_or_check" "**/*.{js,mjs,cjs,json,md}" --ignore-path .prettierignore
