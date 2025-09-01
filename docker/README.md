# Dev containers (felddy/foundryvtt)

Run multiple Foundry versions side‑by‑side and develop OverMyHead with instant updates via bind mounts.

## Overview

This folder contains configuration and scripts used to drive the Foundry container setup in this repo. It includes:

- `container-config.json` — Primary runtime configuration for the container orchestration.
- `container-config.example.json` — Example entries and inline overrides for reference.
- `container-config.schema.json` — JSON Schema (draft-07) describing the shape of `container-config.json`.
- `scripts/validate-container-config.js` — A Node script to validate the config and perform cross-reference checks.

Use the schema to enable editor tooltips and to validate the config in CI. The example file demonstrates inline overrides and version-specific configuration.

## Prereqs

- Docker and Docker Compose
- Create a `secrets.json` with your credentials (used by all services):

```zsh
cd docker
cat > secrets.json <<'JSON'
{
  "FOUNDRY_LICENSE_KEY": "XXXX-XXXX-XXXX-XXXX"
}
JSON
```

- The compose file mounts this into each Foundry container at `/run/secrets/config.json`.

## Start containers (development)

Run from the `docker/` directory:

```zsh
docker compose -f compose.dev.yml up -d

# Open Foundry
# v13 → http://localhost:30013
# v12 → http://localhost:30012
# v11 → http://localhost:30011
```

### Build the module (watch mode)

You can build on host or use the `builder` service.

- Host (fastest):

```zsh
npm ci
npx vite build --watch
```

- Builder service (no Node on host): already defined in compose; it runs `npm ci && npx vite build --watch` inside a Node container.

How it works

- The built module directory (`dist/`) is bind‑mounted into each Foundry container at `/host/dist` (read‑only).
- On startup, `10-sync-host-content` mirrors `/host/dist` into `/data/Data/modules/foundryvtt-over-my-head` inside the container so Foundry writes don't change host ownership.
- Rebuilds update `dist/main.js`; the sync loop applies changes within ~1s. Refresh the browser or use a hot‑reload module for auto‑reload.
- Each service reads credentials from the Docker secret mounted as `/run/secrets/config.json`.
- Foundry data persists in Docker volumes created by Compose. To wipe them for a fresh start, stop with `down -v` (see below).

- Worlds: Development worlds are now provided via the shared mount inside each container at `/host/shared/worlds/<world-id>`. Compose defines per-version host mounts `./shared/v13`, `./shared/v12`, and `./shared/v11` which are mounted into each container at `/host/shared` (read/write). The `10-sync-host-content` patch defaults `WORLD_SRC` to `/host/shared/worlds/test-world` and syncs that path bidirectionally with `/data/Data/worlds/test-world` in the container.

Prepare host folders for shared content

Create the per-version shared and resources folders (and the world path) before starting Compose:

```zsh
mkdir -p docker/shared/v13/worlds/test-world docker/shared/v12/worlds/test-world docker/shared/v11/worlds/test-world
mkdir -p docker/resources/v13 docker/resources/v12 docker/resources/v11
```

If you already have test-world fixtures under `tests/test-world/v##` you can seed the shared folders like this:

```zsh
# example: seed v13 test-world into the shared mount
cp -a tests/test-world/v13/. docker/shared/v13/worlds/test-world/
```

## Stopping & cleanup

```zsh
docker compose -f compose.dev.yml down
# To also remove persistent worlds/configs (volumes) created by Compose:
docker compose -f compose.dev.yml down -v
```

## Dev patches

- **Purpose**: The `felddy/foundryvtt` image supports running container startup "patch" scripts from a directory pointed to by the `CONTAINER_PATCHES` environment variable. This repository uses patches to safely mirror and sync host development content into the container so Foundry can write runtime files without modifying host ownership.
- **Node-based patches**: Shell wrappers (`*.sh`) now delegate to Node implementations (`*.mjs`) for richer logic and portability. You can run them locally with `node` if needed.
- **Key scripts**:
  - `docker/patches/common/00-use-cache-or-stagger.{sh,mjs}`
    - Uses cached Foundry archive from `/data/container_cache` when present; otherwise staggers network fetch using `FETCH_STAGGER_SECONDS` plus small jitter to avoid 429s when multiple services start.
  - `docker/patches/common/10-sync-host-content.{sh,mjs}`
    - Module sync (`MODULE_SRC` -> `MODULE_DST`): host build mirrored into container (delete extras) for hot-reload.
    - World sync (`WORLD_SRC` <-> `WORLD_DST`): conservative bidirectional sync; preserves data and, when supported, uses `rsync --chown` on container→host.
    - Prefers `rsync`; falls back to `cp` with a safe prune.
- **Environment variables**:
  - Cache/stagger: `CONTAINER_CACHE`, `FETCH_STAGGER_SECONDS`
  - Sync paths: `MODULE_SRC`, `MODULE_DST`, `WORLD_SRC`, `WORLD_DST`, `SYNC_INTERVAL`
  - Ownership: `HOST_UID`, `HOST_GID`
  - Debug/dry-run: `PATCH_DEBUG=1` (extra logs), `PATCH_DRY_RUN=1` (no side-effects; logs intended actions)
  - Cache behavior:
    - `PATCH_CACHE_MODE`: `revalidate` (default) sends `If-None-Match`/`If-Modified-Since`; `bust` forces fresh downloads
    - `PATCH_CACHE_BUST=1`: shorthand to force cache busting (equivalent to `PATCH_CACHE_MODE=bust`)
  - Local change detection:
    - `PATCH_CHECKSUM_MODE`: `auto` (default), `force`, or `off`
      - `auto`: checksum files only when basic size/mtime changed and file ≤ threshold
      - `force`: always checksum
      - `off`: never checksum (size/mtime only)
    - `PATCH_CHECKSUM_THRESHOLD_BYTES`: default `209715200` (200 MiB)
    - `PATCH_DIR_MAX_FILES`: directory listing cap for signatures (default `10000`)
  - Advanced helpers live in `docker/patches/common/helpers/common.mjs` and `docker/patches/common/helpers/cache.mjs` and include retry/fetch cache, ETag/Last-Modified revalidation, atomic copies, and local change detection.

  - Extraction:
    - Uses system tools when available: `unzip` for `.zip`, `tar` for `.tar`, `.tar.gz/.tgz`, `.tar.bz2/.tbz2`, `.tar.xz/.txz`.
    - `PATCH_FORCE_NODE_EXTRACT=1` forces pure-Node extraction when possible.
      - Supported in Node fallback: `.tar`, `.tar.gz/.tgz`
      - Not supported in Node fallback: `.zip`, `.tar.bz2/.tbz2`, `.tar.xz/.txz`
      - For unsupported formats, install system tools or avoid forcing Node fallback.
  
The numeric prefixes (`00-`, `10-`, `20-`) ensure deterministic ordering during startup.

### Cache-or-stagger behavior

- Cache location: The compose mounts `../foundry-cache/vXX` to `/data/container_cache`. If a file like `foundryvtt-13.347.zip` exists there, the `00-use-cache-or-stagger.sh` patch points `FOUNDRY_RELEASE_URL` to that file so installation uses the cache.
- No cache present: Containers will wait for a small, configurable delay before requesting a presigned URL to avoid 429s when multiple versions start at once. Tune with `FETCH_STAGGER_SECONDS` per service in `compose.dev.yml`.
- Automatic updates: Since we don't pin `FOUNDRY_RELEASE_URL` in compose, future container restarts can fetch fresh releases as needed. To force cache usage, drop a correctly named zip into `../foundry-cache/vXX`.

## Non-root option

By default the compose file runs containers as root for simplicity in dev. You can run them unprivileged using an override file that sets `FOUNDRY_UID/FOUNDRY_GID` and mounts a host-owned `/data` per version.

1. Prepare host data folders (owned by your user):

```zsh
# from repo root
mkdir -p docker/foundry-data/v13 docker/foundry-data/v12 docker/foundry-data/v11
chown -R $(id -u):$(id -g) docker/foundry-data
```

1. Start with non-root override:

```zsh
# use your shell's UID/GID automatically
docker compose -f compose.dev.yml -f compose.dev.nonroot.yml up -d
```

Notes:

- The override sets `user: "${UID}:${GID}"` and passes `FOUNDRY_UID/GID` to the felddy entrypoint.
- Ensure your shell exports `UID`/`GID` (zsh/bash typically do). If not, replace with numbers: `UID=1000 GID=1000 docker compose ...`.
- The override adds `/data` bind mounts under `../foundry-data/*` and does not remove your existing mounts for cache, patches, module host sync, or world host sync.

## Configuration and validation

Files in this folder:

- `container-config.json` — Primary runtime configuration. Keys:
  - `systems`: mapping of system ids to configuration (`name`, `manifest`, `install_at_startup`).
  - `modules`: mapping of module ids to configuration.
  - `worlds`: mapping of world ids to configuration (optional). Provide either a `manifest` (URL) or a `path` (local path or URL).
  - `versions`: mapping of Foundry versions (e.g. `13`, `12`) to configuration with `supported` and `install`.
- `container-config.example.json` — Example entries and inline overrides for reference.
- `container-config.schema.json` — JSON Schema (draft-07) describing the shape of `container-config.json`.

Run the validator (also performs cross-reference checks):

```bash
npm run validate:container-config
```

Notes:

- The schema contains `description` fields for editor tooltips and generated docs. Add `examples` to the schema when helpful.
- Keep `container-config.example.json` in sync with the schema when you change validations.

### Manifest vs path

For systems, modules, and worlds you can specify either:

- `manifest`: a URL to a manifest JSON to install from, or
- `path`: a local path (archive or directory) or a URL to install from.

One must be non-empty; set the other to an empty string `""` or omit it.

Example mixing both styles:

```json
{
  "systems": {
  "example_system": { "name": "Example System", "manifest": "", "path": "/data/container_cache/example-system.zip" }
  },
  "modules": {
  "example_module": { "name": "Example Module", "manifest": "https://example.com/module.json", "path": "" }
  },
  "worlds": {
  "example_world": { "name": "Example World", "manifest": "", "path": "../tests/test-world" }
  }
}
```

The validator enforces that exactly one of these is provided as non-empty.

### Per-version install and inline overrides

For each Foundry version, `install` specifies what to install. Instead of a separate `overrides` section, use inline overrides by mapping ids to partial objects:

```json
{
  "versions": {
    "13": {
      "install": {
        "systems": { "simple_worldbuilding_system": {} },
        "modules": { "foundryvtt_over_my_head": {} },
        "worlds": { "example_world": { "install_at_startup": false } }
      }
    }
  }
}
```

- Empty object `{}` means install the referenced id "as-is" from the top-level maps.
- Provide any subset of fields from the item definition to override for that version (e.g., point `file` to a cache zip, tweak `install_at_startup`, or swap `manifest`).

Add worlds alongside systems and modules. Example:

```json
{
  "worlds": {
    "example_world": {
      "name": "Example World",
      "manifest": "https://example.com/world.json",
      "install_at_startup": true
    }
  },
  "versions": {
    "13": {
      "install": {
        "systems": { "simple_worldbuilding_system": {} },
        "modules": { "foundryvtt_over_my_head": {} },
        "worlds": { "example_world": { "install_at_startup": false } }
      }
    }
  }
}
```

Validator also cross-checks ids referenced in `versions.*.install.{systems,modules,worlds}` exist in the top-level maps.

---

### Dev smoke installer

Quickly test installs without a full container boot. Builds a minimal `container-config.json` on the fly and runs the same installer logic.

Examples:

```zsh
# Install module from manifest
node docker/patches/common/dev-smoke-install.mjs \
  --type module --id foundryvtt_over_my_head \
  --manifest https://example.com/module.json

# Install system from archive URL
node docker/patches/common/dev-smoke-install.mjs \
  --type system --id simple_worldbuilding_system \
  --url https://example.com/system.zip

# Install world from local directory
node docker/patches/common/dev-smoke-install.mjs \
  --type world --id example_world \
  --path ../tests/test-world

# Install world from a public manifest (examples)
node docker/patches/common/dev-smoke-install.mjs \
  --type world --id brancalonia_bigat \
  --manifest https://raw.githubusercontent.com/Carter7777/brancalonia-bigat/master/world.json

node docker/patches/common/dev-smoke-install.mjs \
  --type world --id trophy_dark_srd \
  --manifest https://raw.githubusercontent.com/WallaceMcGregor/trophy-dark-srd/main/world.json
```

Notes:

- Uses temp dirs under your OS tmp folder by default. Override with `FOUNDRY_DATA_DIR` and `COMPONENT_CACHE`.
- Honors the same cache/checksum env vars listed above.
- Manifest parsing expects Foundry-compatible fields for systems/modules (see Foundry docs) and common fields for worlds. If a package URL is present, it will be fetched and extracted.

If you want I can also add a CI job to run the validator automatically on pull requests.
