#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# wrapper-bin.sh / wrapper-lib.sh - Entrypoint wrapper library and launcher
#
# Purpose
#   These two scripts provide a small, conservative shell library (wrapper-lib.sh)
#   and a reusable wrapper entrypoint (wrapper-bin.sh) to delegate patch
#   orchestration to Node.js scripts in a consistent, testable way.
#
#   The design goals:
#     - Work reliably when sourced from other scripts (helpers echo/printf values).
#     - Provide a uniform CLI surface for running patches (one-shot or background
#       sync-loop) with overridable targets and extensions.
#     - Support a dry-run mode that prints commands instead of executing them.
#     - Keep logic shell-only (POSIX-ish bash) so the wrapper can be embedded in
#       container entrypoints or development scripts.
#
# Files / Roles
#   wrapper-lib.sh
#     - A set of small helper functions used by wrapper-bin.sh and other wrappers.
#     - Everything is careful to return values via echo/printf to support being
#       sourced by other scripts.
#
#   wrapper-bin.sh
#     - A generic wrapper "main" that:
#         * derives metadata from the wrapper filename (procedural number + name),
#         * resolves the Node script to run (default under ../common),
#         * collects argument-based overrides (--wrapper-target, --wrapper-ext),
#         * supports two run modes: "default" (one-shot) and "sync-loop" (background),
#         * honors environment dry-run flags and a CLI dry-run flag.
#       It delegates actual work to node by invoking the resolved .mjs/.cjs script(s).
#
# API / Publicly relevant functions (what they do and what they return)
#   get_script_dir
#     - Returns: absolute directory path of the calling script (echo).
#     - Usage: get script directory for locating sibling resources.
#
#   get_basename
#     - Returns: basename of the calling script (echo).
#
#   args_has_dry_run "$@"
#     - Scans given args for "--dry-run" or "-n".
#     - Returns: "1" (echo) if present, otherwise "0".
#
#   args_has_help "$@"
#     - Scans given args for "-h" or "--help".
#     - Returns: "1" if present, otherwise "0".
#
#   filter_out_dry_run "$@"
#     - Returns: all args except the dry-run flags (--dry-run or -n),
#       one per line (printf).
#     - Useful for producing a forwarded arg list without dry-run markers.
#
#   derive_patch_metadata "$self_name"
#     - Input: wrapper filename (e.g. "01-some-patch.sh" or "some-patch.sh").
#     - Parses:
#         * procedural_number (numeric prefix before dash) or empty string
#         * patch_name (basename without .sh and without numeric prefix)
#         * script: patch_name with a default extension (.mjs appended later)
#         * node_dir: resolved absolute path to "../common" relative to the
#           directory of wrapper-lib.sh (so shared Node scripts are under common/)
#     - Returns: a pipe-separated string: procedural_number|patch_name|script|node_dir
#       (printf '%s|%s|%s|%s\n').
#
#   detect_dry_run "$PATCH_DRY_RUN" "$DRY_RUN" "$@"
#     - Inputs:
#         * env_patch_dry_run (first arg) - typically PATCH_DRY_RUN env var
#         * env_dry_run (second arg) - typically DRY_RUN env var
#         * remaining args - to check for --dry-run / -n flags
#     - Precedence:
#         1) If env_patch_dry_run is set and not "0" -> dry-run
#         2) Else if env_dry_run is set and not "0" -> dry-run
#         3) Else if CLI includes --dry-run/-n -> dry-run
#     - Returns: "1" for dry-run, "0" otherwise.
#
#   execute_or_dry_run "$dry_run" command [args...]
#     - If dry_run != "0" prints a standardized "[patch][dry-run] Would run: ..."
#       line with the full command and returns success.
#     - Otherwise executes the command (executes "$@").
#
#   normalize_script_ref "$node_dir" "$ext" "$ref"
#     - Purpose: normalize a script reference relative to node_dir and ensure it
#       has the expected extension.
#     - Behavior:
#         * If ref is absolute (starts with /) it is used as-is.
#         * Otherwise ref is treated relative to node_dir (node_dir/ref).
#         * If the result does not end with .${ext}, that extension is appended.
#         * Collapses path components by using cd/dirname/pwd and basename to
#           produce an absolute path.
#     - Returns: absolute path to the resolved script (echo).
#
#   collect_wrapper_targets "$node_dir" "$ext" "$@"
#     - Collects override target(s) supplied via repeated flags:
#         * --wrapper-target value
#         * --wrapper-target=value
#       Each value may contain comma-separated multiple references (together).
#     - For each part:
#         * trims leading/trailing whitespace,
#         * uses normalize_script_ref to resolve against node_dir and ext,
#         * accumulates targets.
#     - Returns: one normalized absolute path per line for each collected target.
#     - Notes: This supports both explicit extension or none; normalize_script_ref
#       will append the extension if missing.
#
#   filter_out_wrapper_target_flags "$@"
#     - Returns the argument list with any --wrapper-target/--wrapper-target=*
#       and --wrapper-ext/--wrapper-ext=* flags and their values removed.
#     - Useful to produce forwarded_args that are safe to hand to the Node script.
#
#   collect_wrapper_ext "$@"
#     - Scans args for --wrapper-ext or --wrapper-ext=VALUE.
#     - Normalizes by stripping a leading dot and returns the extension (e.g. "mjs").
#     - Returns empty string if not specified.
#
# wrapper-bin.sh specific functions / behavior
#   wrapper_get_self_name
#     - Scans the BASH_SOURCE stack to find the first source element that is not
#       wrapper-bin.sh or wrapper-lib.sh and returns that basename. This supports
#       being sourced or executed from other wrapper files so metadata derivation
#       uses the original wrapper filename.
#     - Falls back to basename of $0 if no suitable element is found.
#
#   wrapper_main "$@"
#     - The main orchestrator with the following behavior:
#         1) Derives metadata from the wrapper filename (procedural number,
#            patch_name, default script name, node_dir).
#         2) Builds a usage string and supports early help printing (if -h/--help).
#         3) Resolves node executable via:
#              WRAPPER_NODE_BIN -> NODE_BIN -> "node"
#         4) Resolves script extension via:
#              WRAPPER_SCRIPT_EXT (env) or "mjs", with optional override via
#              --wrapper-ext on the command line.
#         5) Determines dry-run via detect_dry_run(PATCH_DRY_RUN, DRY_RUN, "$@").
#         6) Validates node exists in PATH unless dry-run is active.
#         7) Collects forwarded_args (original args minus dry-run flags).
#         8) Collects override_targets via collect_wrapper_targets(node_dir, ext).
#         9) Removes wrapper-target/--wrapper-ext flags from forwarded_args.
#        10) Chooses behavior based on WRAPPER_RUN_MODE env var:
#             - "default" (one-shot):
#                 * If override targets present: run each target once:
#                     node <target> --procedural-number <num> --patch-name <name> <forwarded_args...>
#                 * Else: run the default node script under node_dir/<patch_name>.<ext>
#                 * Uses execute_or_dry_run so dry-run prints commands and does not execute.
#                 * On non-dry-run failure, emits [patch][error] and returns the rc.
#                 * On success prints "[patch] <display_name>: Complete".
#
#             - "sync-loop":
#                 * Two-step behavior per target (or default script if none):
#                     a) Run with --initial-only to perform one-time sync.
#                     b) Start an ongoing background loop with --loop-only (backgrounded
#                        with & and disown).
#                 * Dry-run prints both the initial run and the background start commands.
#                 * Non-dry-run executes the initial run synchronously, then starts the
#                   background loop and disowns it. Prints a "[patch] <patch_name>: Background sync loop started".
#
# Environment variables of importance
#   WRAPPER_SELF_NAME
#     - Optional. When set, wrapper_main uses this string as the wrapper filename
#       to derive metadata instead of scanning BASH_SOURCE. Useful when wrapper
#       is invoked in non-standard ways.
#
#   WRAPPER_RUN_MODE
#     - 'default' (one-shot) or 'sync-loop' (start background loop). Default: 'default'.
#
#   WRAPPER_NODE_BIN
#     - Path/name of the Node.js executable to use. Falls back to NODE_BIN then "node".
#
#   NODE_BIN
#     - Secondary fallback for Node executable if WRAPPER_NODE_BIN not set.
#
#   WRAPPER_SCRIPT_EXT
#     - Default extension for scripts (e.g. mjs or cjs). Leading dot optional.
#     - Default: "mjs" if unset.
#
#   PATCH_DRY_RUN
#     - If set and not "0", forces dry-run mode for the patch wrapper.
#     - Takes precedence over DRY_RUN and CLI flags.
#
#   DRY_RUN
#     - If set and not "0", enables dry-run globally (lower precedence than PATCH_DRY_RUN).
#
# Command-line flags (public surface)
#   -h, --help
#       Print usage and return.
#
#   -n, --dry-run
#       Enable dry-run mode for this invocation (prints commands instead of running).
#       Also honored via PATCH_DRY_RUN/DRY_RUN env vars as described above.
#
#   --wrapper-target <t[,t]>  or  --wrapper-target=<t[,t]>
#       Override the target Node script(s) to run. Values are relative to common/
#       by default (or absolute if given) and may be comma-separated. Extension is
#       optional; the wrapper will append the configured extension if not present.
#       Multiple --wrapper-target flags may be used; each may contain multiple comma
#       separated items.
#
#   --wrapper-ext <ext>  or  --wrapper-ext=<ext>
#       Override the script extension for the default script and for targets that
#       do not explicitly include an extension. Leading dot is optional (e.g. ".mjs"
#       and "mjs" are equivalent).
#
# Additional flags passed through to Node scripts
#   - The wrapper always injects two flags to the actual Node script(s):
#       --procedural-number <procedural_number>
#       --patch-name <patch_name>
#     These reflect the parsed metadata from the wrapper filename and help the
#     Node script know which patch invocation it is serving.
#
#   - Any remaining forwarded_args (after removing wrapper-target/--wrapper-ext and
#     dry-run flags) are appended to the Node invocation unchanged.
#
# Output conventions & logging
#   - The wrapper prints standardized prefix tags to stderr/stdout:
#       [patch]          general informational messages (stdout)
#       [patch][dry-run] messages shown when dry-run would run something (stdout)
#       [patch][error]   error messages (stderr)
#
# Failures & exit codes
#   - In non-dry-run mode, if node is not found the wrapper exits with code 1.
#   - When invoking Node, a non-zero exit code from the Node process is propagated:
#       * In default mode, wrapper_main prints an error and returns/exit with that code.
#       * In sync-loop mode, the initial-only invocation failure will propagate similarly.
#   - Dry-run never executes commands and always returns success (0).
#
# Notes, caveats, and expectations
#   - All helper functions return scalar data via echo/printf to make them safe when
#     sourced by other scripts. Callers should capture output via command substitution
#     or mapfile/read loops as demonstrated in wrapper-bin.sh.
#   - normalize_script_ref ensures an absolute path is produced; this depends on
#     `cd` and `pwd` behavior. The node_dir argument should be an existing directory
#     (the default is derived relative to wrapper-lib.sh).
#   - collect_wrapper_targets trims whitespace around commas and values; empty
#     values are ignored.
#   - The wrapper is conservative with side-effects: it only backgrounds processes
#     in the explicit sync-loop mode and disowns them so they don't tie to the
#     invoking shell's lifecycle.
# -----------------------------------------------------------------------------

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

  # Usage printer
  local usage
  usage="Usage: ${self_name} [options] [-- ...]

Options:
  -h, --help                 Show this help and exit
  -n, --dry-run              Print commands that would run
  --wrapper-target <t[,t]>   Override target script(s). Relative values resolve under common/. Extension optional
  --wrapper-ext <ext>        Override script extension for default/targets (e.g. mjs, cjs). Leading dot optional

Environment:
  WRAPPER_RUN_MODE           'default' (one-shot) or 'sync-loop'
  WRAPPER_NODE_BIN           Node executable (default: node)
  WRAPPER_SCRIPT_EXT         Default script extension (default: mjs)
  PATCH_DRY_RUN, DRY_RUN     If set and not '0', enable dry-run
"

  # Early help handling (before any other work)
  if [ "$(args_has_help "$@")" != "0" ]; then
    printf '%s\n' "$usage"
    return 0
  fi

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
