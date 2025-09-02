#!/usr/bin/env bash
set -euo pipefail

# Source local wrapper-lib
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
source "${LIB_DIR}/wrapper-lib.sh"

# Determine the calling wrapper filename for metadata derivation.
wrapper_get_self_name() {
  local i name cur
  cur="${BASH_SOURCE[0]}"
  for (( i=1; i<${#BASH_SOURCE[@]}; i++ )); do
    name="${BASH_SOURCE[$i]}"
    case "$name" in
      *wrapper-bin.sh|*wrapper-lib.sh)
        continue
        ;;
      *)
        echo "$(basename "$name")"
        return 0
        ;;
    esac
  done
  echo "$(basename "${0}")"
}

wrapper_main() {
  local self_name procedural_number patch_name script node_dir
  self_name="${WRAPPER_SELF_NAME:-$(wrapper_get_self_name)}"
  IFS='|' read -r procedural_number patch_name script node_dir < <(derive_patch_metadata "$self_name")

  local node_bin
  node_bin="${WRAPPER_NODE_BIN:-${NODE_BIN:-node}}"

  # Extension default from env, drop leading dot if provided, default to mjs
  local script_ext
  script_ext="${WRAPPER_SCRIPT_EXT:-mjs}"
  script_ext="${script_ext#.}"

  local dry_run
  dry_run="$(detect_dry_run "${PATCH_DRY_RUN:-}" "${DRY_RUN:-}" "$@")"

  if ! command -v "$node_bin" >/dev/null 2>&1; then
    if [ "$dry_run" = "0" ]; then
      echo "[patch][error] node not found in PATH" >&2
      exit 1
    fi
  fi

  local -a forwarded_args
  mapfile -t forwarded_args < <(filter_out_dry_run "$@")
  # Determine extension override from args
  local arg_ext
  arg_ext="$(collect_wrapper_ext "$@")"
  if [ -n "$arg_ext" ]; then
    script_ext="$arg_ext"
  fi
  # Ensure the default script uses the chosen extension
  script="${patch_name}.${script_ext}"
  # Extract optional override targets and strip related flags from args
  local -a override_targets
  mapfile -t override_targets < <(collect_wrapper_targets "$node_dir" "$script_ext" "$@")
  mapfile -t forwarded_args < <(filter_out_wrapper_target_flags "${forwarded_args[@]}")

  local display_name
  if [ -n "$procedural_number" ]; then
    display_name="${procedural_number}-${patch_name}"
  else
    display_name="$patch_name"
  fi

  local mode
  mode="${WRAPPER_RUN_MODE:-default}"
  echo "[patch] ${display_name}: Delegating to Node.js script"

  case "$mode" in
    sync-loop)
      if [ "$dry_run" != "0" ]; then
        if [ "${#override_targets[@]}" -gt 0 ]; then
          for t in "${override_targets[@]}"; do
            echo "[patch][dry-run] Would run initial sync: ${node_bin} ${t} --initial-only --procedural-number ${procedural_number} --patch-name ${patch_name} ${forwarded_args[*]}"
            echo "[patch][dry-run] Would start loop in background: ${node_bin} ${t} --loop-only --procedural-number ${procedural_number} --patch-name ${patch_name} ${forwarded_args[*]} &"
          done
        else
          echo "[patch][dry-run] Would run initial sync: ${node_bin} ${node_dir}/${script} --initial-only --procedural-number ${procedural_number} --patch-name ${patch_name} ${forwarded_args[*]}"
          echo "[patch][dry-run] Would start loop in background: ${node_bin} ${node_dir}/${script} --loop-only --procedural-number ${procedural_number} --patch-name ${patch_name} ${forwarded_args[*]} &"
        fi
      else
        if [ "${#override_targets[@]}" -gt 0 ]; then
          for t in "${override_targets[@]}"; do
            "${node_bin}" "${t}" --initial-only --procedural-number "${procedural_number}" --patch-name "${patch_name}" "${forwarded_args[@]}"
            "${node_bin}" "${t}" --loop-only --procedural-number "${procedural_number}" --patch-name "${patch_name}" "${forwarded_args[@]}" &
            disown || true
          done
        else
          "${node_bin}" "${node_dir}/${script}" --initial-only --procedural-number "${procedural_number}" --patch-name "${patch_name}" "${forwarded_args[@]}"
          "${node_bin}" "${node_dir}/${script}" --loop-only --procedural-number "${procedural_number}" --patch-name "${patch_name}" "${forwarded_args[@]}" &
          disown || true
        fi
        echo "[patch] ${patch_name}: Background sync loop started"
      fi
      ;;
    default|*)
      if [ "${#override_targets[@]}" -gt 0 ]; then
        local t
        for t in "${override_targets[@]}"; do
          local -a cmd
          cmd=("${node_bin}" "${t}" "--procedural-number" "${procedural_number}" "--patch-name" "${patch_name}")
          if [ "${#forwarded_args[@]}" -gt 0 ]; then
            cmd+=("${forwarded_args[@]}")
          fi
          if ! execute_or_dry_run "$dry_run" "${cmd[@]}"; then
            local rc=$?
            echo "[patch][error] ${display_name}: Failed with exit code $rc" >&2
            return $rc
          fi
        done
        echo "[patch] ${display_name}: Complete"
        return 0
      else
  local -a cmd
  cmd=("${node_bin}" "${node_dir}/${script}" "--procedural-number" "${procedural_number}" "--patch-name" "${patch_name}")
        if [ "${#forwarded_args[@]}" -gt 0 ]; then
          cmd+=("${forwarded_args[@]}")
        fi
        if execute_or_dry_run "$dry_run" "${cmd[@]}"; then
          echo "[patch] ${display_name}: Complete"
          return 0
        else
          local rc=$?
          echo "[patch][error] ${display_name}: Failed with exit code $rc" >&2
          return $rc
        fi
      fi
      ;;
  esac
}
