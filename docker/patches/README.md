# Docker patches

This folder contains the patching system used by the container entrypoint.

- `entrypoint/`: very thin shims invoked by the entrypoint. Keep this folder tidy.
- `common/`: shared shell helpers and Node patch scripts.

## Wrapper design

Wrappers live in `entrypoint/` and are named using:

- Optional numeric prefix: ordering hint for entrypoint (e.g. `10-...`).
- Patch name: maps to the Node script of the same name in `common/`.
- Suffix: `.sh`.

Example: `10-sync-host-content.sh` delegates to `common/sync-host-content.mjs`.

Wrappers source `common/wrapper-bin.sh` and call `wrapper_main`. The generic
bin resolves metadata from the wrapper filename and handles dry-run, logging,
argument forwarding, and Node binary selection.

### Modes

- `default` (WRAPPER_RUN_MODE=default): one-shot invocation of the Node script with
  `--procedural-number` and `--patch-name`.
- `sync-loop` (WRAPPER_RUN_MODE=sync-loop): run an initial foreground pass, then
  start a background loop.

### Environment

- `NODE_BIN` or `WRAPPER_NODE_BIN`: Node executable to use (default: `node`).
- `PATCH_DRY_RUN` / `DRY_RUN`: non-empty and not "0" enables dry-run.
- CLI flags: `--dry-run` / `-n` also enable dry-run.

On dry-run, the wrapper prints the command(s) that would have run and does not
require `node` to be present.

### Overriding target script(s)

Wrappers normally infer the target script from their filename. You can override
this by passing one or more `--wrapper-target` flags:

- Single value: `--wrapper-target install-components`
- With extension: `--wrapper-target install-components.mjs`
- Relative path: `--wrapper-target other/utility`
- Absolute path: `--wrapper-target /abs/path/to/script.mjs`
- Multiple values: `--wrapper-target a,b --wrapper-target c`

Notes:

- Values without an explicit extension get the current wrapper extension appended (default `.mjs`).
- Relative values resolve against `docker/patches/common` (same dir as `.mjs`).
- When multiple override targets are provided, each one is invoked with the same
  arguments and flags.

### Script extension

By default, scripts use the `mjs` extension. You can override this using either
an environment variable or a CLI flag:

- Env: set `WRAPPER_SCRIPT_EXT=cjs` (or `.cjs`)
- Flag: pass `--wrapper-ext cjs` (or `--wrapper-ext .cjs`)

Examples:

- `--wrapper-ext cjs --wrapper-target install-components` runs `install-components.cjs`
- `--wrapper-ext .mjs --wrapper-target tools/setup` runs `tools/setup.mjs`
- `WRAPPER_SCRIPT_EXT=cjs ./entrypoint/20-install-components.sh --wrapper-target helpers/prepare`

### Adding a new wrapper

1. Create a file in `entrypoint/` named `[NN-]my-patch.sh`.
2. Contents:

   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/common"
   # shellcheck disable=SC1090
   source "${LIB_DIR}/wrapper-bin.sh"

   export WRAPPER_RUN_MODE="default" # or "sync-loop"
   export WRAPPER_NODE_BIN="${NODE_BIN:-node}"
   wrapper_main "$@"
   ```

3. Implement `common/my-patch.mjs` to receive `--procedural-number` and
   `--patch-name` plus any additional args.

## Common files

- `common/wrapper-lib.sh`: pure helper functions, safe to source.
- `common/wrapper-bin.sh`: generic executable logic used by wrappers.
- `common/*.mjs`: Node-based patch implementations.

## Dry-run examples

```bash
bash docker/patches/entrypoint/00-use-cache-or-stagger.sh -n --foo bar
bash docker/patches/entrypoint/10-sync-host-content.sh -n
```
