# Dev containers (felddy/foundryvtt)

Run multiple Foundry versions side‑by‑side and develop OverMyHead with instant updates via bind mounts.

## Overview

This folder contains configuration and scripts used to drive the Foundry container setup in this repo. It includes:

- `container-config.json` — Primary runtime configuration for the container orchestration.
- `container-config.example.json` — Example entries and inline overrides for reference.
- `container-config.schema.json` — JSON Schema (draft-07) describing the shape of `container-config.json`.
- `scripts/validate-container-config.js` — A Node script to validate the config and perform cross-reference checks.
- `scripts/generate-compose.js` — Generates `compose.dev.yml` from `container-config.json` or an advanced config.

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
- On startup, `sync-host-content` mirrors `/host/dist` into `/data/Data/modules/foundryvtt-over-my-head` inside the container so Foundry writes don't change host ownership.
- Rebuilds update `dist/main.js`; the sync loop applies changes within ~1s. Refresh the browser or use a hot‑reload module for auto‑reload.
- Each service reads credentials from the Docker secret mounted as `/run/secrets/config.json`.
- Foundry data persists in Docker volumes created by Compose. To wipe them for a fresh start, stop with `down -v` (see below).

- Worlds: Development worlds are now provided via the shared mount inside each container at `/host/shared/worlds/<world-id>`. Compose defines per-version host mounts `./shared/v13`, `./shared/v12`, and `./shared/v11` which are mounted into each container at `/host/shared` (read/write). The `sync-host-content` patch defaults `WORLD_SRC` to `/host/shared/worlds/test-world` and syncs that path bidirectionally with `/data/Data/worlds/test-world` in the container.

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
  - `docker/patches/common/use-cache-or-stagger.{sh,mjs}`
    - Uses cached Foundry archive from `/data/container_cache` when present; otherwise staggers network fetch using `FETCH_STAGGER_SECONDS` plus small jitter to avoid 429s when multiple services start.
  - `docker/patches/common/sync-host-content.{sh,mjs}`
    - Module sync (`MODULE_SRC` -> `MODULE_DST`): host build mirrored into container (delete extras) for hot-reload.
    - World sync (`WORLD_SRC` <-> `WORLD_DST`): conservative bidirectional sync; preserves data and, when supported, uses `rsync --chown` on container→host.
    - Flags:
      - `WORLD_SYNC_ENABLED` (default `1`): set to `0` to disable world syncing entirely (useful when the world is installer-managed via container-config).
      - `WORLD_INITIAL_SYNC` (default `1`): set to `0` to skip the initial sync at startup while keeping the background loop.
    - Prefers `rsync`; falls back to `cp` with a safe prune.
- **Environment variables**:
  - Cache/stagger: `CONTAINER_CACHE`, `FETCH_STAGGER_SECONDS`
  - Sync paths: `MODULE_SRC`, `MODULE_DST`, `WORLD_SRC`, `WORLD_DST`, `SYNC_INTERVAL`
  - Sync controls (worlds): `WORLD_SYNC_ENABLED` (default `1`), `WORLD_INITIAL_SYNC` (default `1`)
  - Config-driven sync: `SYNC_USE_CONFIG` (default `1`) to enable reading `continuous_sync` from container-config; `MODULE_MIRROR_ENABLED` (default `1`) to keep the dist mirror.
  - Ownership: `HOST_UID`, `HOST_GID`
  - Debug/dry-run: `PATCH_DEBUG=1` (extra logs), `PATCH_DRY_RUN=1` (no side-effects; logs intended actions)
  - Component purging: `PATCH_DISABLE_PURGE=1` (disables automatic purging of unlisted components), `PATCH_DISABLE_TEST_WORLD_EXCEPTION=1` (allows purging of "test-world")
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

### Component purging behavior

After installing configured components, the ComponentInstaller automatically purges any unlisted systems, modules, and worlds from their respective directories. This helps maintain a clean development environment by removing outdated or unwanted components.

**Purge behavior:**
- **Automatic cleanup**: After successful installation, scans each component directory (systems, modules, worlds) and removes any directories not specified in the version-specific install configuration
- **Test-world exception**: By default, preserves "test-world" even when not configured to ensure testing environments remain intact
- **Respects dry-run**: Uses the existing `PATCH_DRY_RUN` environment variable to preview what would be purged without actually removing anything
- **Error handling**: Continues operation even when directories are missing or inaccessible

**Environment variables for purge control:**
- `PATCH_DISABLE_PURGE=1`: Completely disables purging of unlisted components
- `PATCH_DISABLE_TEST_WORLD_EXCEPTION=1`: Allows purging of "test-world" when not configured

**Example purge behavior:**
Given a configuration that only specifies `worldbuilding` system and `my-module`:

Before purging:
```
systems/
  ├── worldbuilding/     # ✓ Listed in config
  ├── old-system/        # ✗ Not in config
  └── unused-system/     # ✗ Not in config

worlds/
  ├── my-world/          # ✓ Listed in config
  ├── test-world/        # ✓ Special exception (unless PATCH_DISABLE_TEST_WORLD_EXCEPTION=1)
  └── old-world/         # ✗ Not in config
```

After purging:
```
systems/
  └── worldbuilding/     # ✓ Kept

worlds/
  ├── my-world/          # ✓ Kept
  └── test-world/        # ✓ Preserved (unless exception disabled)
```

### Cache-or-stagger behavior

- Cache location: The compose mounts `../foundry-cache/vXX` to `/data/container_cache`. If a file like `foundryvtt-13.347.zip` exists there, the `use-cache-or-stagger.sh` patch points `FOUNDRY_RELEASE_URL` to that file so installation uses the cache.
- No cache present: Containers will wait for a small, configurable delay before requesting a presigned URL to avoid 429s when multiple versions start at once. Tune with `FETCH_STAGGER_SECONDS` per service in `compose.dev.yml`.
- Automatic updates: Since we don't pin `FOUNDRY_RELEASE_URL` in compose, future container restarts can fetch fresh releases as needed. To force cache usage, drop a correctly named zip into `../foundry-cache/vXX`.

### Recommended patterns

- Dev world via sync:
  - Keep your development world under `docker/shared/vXX/worlds/<world-id>` (mounted at `/host/shared/worlds/<world-id>` inside the container).
  - Do not install this world via `container-config.json` (or set `install_at_startup:false`).
  - Leave `WORLD_SYNC_ENABLED=1` (default) for bidirectional sync.

- Installer-managed worlds (no continuous sync):
  - Define worlds in `container-config.json` with `install_at_startup:true` and a `manifest` or `path`.
  - Set `WORLD_SYNC_ENABLED=0` to avoid conflicts with installer writes.
  - If you only want to avoid the very first copy, set `WORLD_INITIAL_SYNC=0` instead.

- Presence warnings:
  - If a world has `install_at_startup:false` and is absent at `/data/Data/worlds/<id>`, a non-blocking warning is logged at startup.
  - If a world has `install_at_startup:true` and remains absent after install, a warning is also logged.

### Config-driven continuous sync

Enable continuous sync on specific items in `container-config.json` using `continuous_sync`:

Defaults:

- Worlds: host→container with keep (no delete), source `/host/shared/worlds/<id>`
- Modules/systems: bidirectional, source `/host/resources/{modules|systems}/<id>`

Examples:

```json
{
  "worlds": {
    "test-world": { "name": "Dev World" }
  },
  "modules": {
    "my_module": { "name": "My Module" }
  },
  "versions": {
    "13": {
      "install": {
        "worlds": {
          "test-world": { "continuous_sync": true, "install_at_startup": false, "check_presence": true }
        },
        "modules": {
          "my_module": { "continuous_sync": { "enabled": true, "direction": "host-to-container", "source": "/host/dist", "delete": true } }
        }
      }
    }
  }
}
```

Override direction/source per item:

```json
"modules": {
  "my_module": {
    "continuous_sync": {
      "enabled": true,
      "direction": "bidirectional",
      "source": "/host/resources/modules/my_module",
      "interval": 2
    }
  }
}
```

Env overrides:

- `SYNC_USE_CONFIG=0` disables reading `continuous_sync` from config.
- `MODULE_MIRROR_ENABLED=0` turns off the default `/host/dist` → module mirror.

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

### Generate compose.dev.yml from config

You can generate `compose.dev.yml` dynamically. Two options:

- Single source of truth (recommended): use `container-config.json`
  - Pros: one config drives both startup patch behavior and which services/versions to run
  - Command: `npm run compose:gen`
  - Uses sensible defaults per version:
    - v13 → tag `release`, port 30013, env `.v13.env`, stagger 4s
    - v12 → tag `12`, port 30012, env `.v12.env`, stagger 2s
    - v11 → tag `11`, port 30011, env `.v11.env`, stagger 0s

- Custom compose config (advanced): pass `-c docker/compose.config.json`
  - For teams that prefer a standalone compose generator config, an advanced shape is supported when explicitly selected with `-c`.

Usage:

```zsh
## Generate compose from container-config.json (recommended)

# Edit your existing container-config.json as usual (which systems/modules to install per version)
$EDITOR docker/container-config.json

# Generate compose.dev.yml using the supported versions in container-config.json
npm run compose:gen

# Or preview from the same source to stdout
npm run compose:print

# Then start containers
docker compose -f docker/compose.dev.yml up -d
```

#### CLI flags and overrides

- `-c, --config <path>`: Input config file. Defaults to `docker/container-config.json`. You can also pass `docker/compose.config.json` to use the advanced shape.
- `-o, --out <path>`: Output file path. When omitted, YAML is printed to stdout (useful for preview or piping).
- `--print`: Shorthand to force printing to stdout even if `-o` was provided.

#### Environment variable overrides (with `container-config.json`)

- `COMPOSE_BASE_IMAGE`: Base image for Foundry services. Default `felddy/foundryvtt`.
- `COMPOSE_USER`: Container user for services. Default `0:0` (root).
- `COMPOSE_BUILDER_ENABLED`: Enable builder service when not `0`. Default enabled.
- `COMPOSE_BUILDER_IMAGE`: Image for builder service. Default `node:20-alpine`.

#### Defaults and generated structure

- Services: one per supported version in `container-config.json.versions`. Named `foundry-v<NN>`, e.g., `foundry-v13`.
- Ports: map `30000+<NN> -> 30000`, e.g., v13 → `30013:30000`.
- Image tags: v13+ → `:release`; v12 → `:12`; v11 → `:11` (subject to image availability).
- Stagger: `FETCH_STAGGER_SECONDS` defaults to a small delay for v13 (4s), v12 (2s), else 0.
- Volumes and mounts mirror the static compose: data volume per service (`<name>-data`), bind mounts for `container-config.json`, `dist/`, `patches/`, `shared/vNN/`, `resources/vNN/`, and `foundry-cache/vNN/`.
- Secrets: `docker/secrets.json` is mounted as `config.json` into each service.
- Env files: `docker/env/.env` and `docker/env/.vNN.env` are included automatically per service.

#### Examples

Preview YAML to stdout using `container-config.json` and a custom base image:

```zsh
COMPOSE_BASE_IMAGE=felddy/foundryvtt COMPOSE_USER=0:0 \
node docker/scripts/generate-compose.js --print
```

Write to a custom file using the advanced `compose.config.json` shape:

```zsh
node docker/scripts/generate-compose.js -c docker/compose.config.json -o docker/compose.dev.yml
```

#### container-config.json fields for composition

- Top-level `composition`: global compose defaults
  - `baseImage`: base image (default `felddy/foundryvtt`)
  - `user`: container user (default `0:0`)
  - `version_params`: templated defaults applied to each version unless overridden
    - `name`: string; may include `{version}` (e.g., `foundry-v{version}`)
    - `tag`: string; may include `{version}` (e.g., `release` or `{version}`)
    - `port`: number or string template containing `{version}` (e.g., `300{version}`)
    - `versionDir`: string; may include `{version}` (e.g., `v{version}`)
    - `envSuffix`: string; may include `{version}`; defaults to the final `versionDir` when omitted
  - `builder.enabled`: include builder service (default true)
  - `builder.image`: builder image (default `node:20-alpine`)

- Per-version `versions[NN].composition_params`: optional per-version overrides/additions
  - When present, only provided fields override the resolved top-level defaults for that version.
  - Supported fields: `name`, `tag`, `port` (number only), `versionDir`, `envSuffix`, `fetchStaggerSeconds`, `env_files`, `environment` (array of `KEY=VAL` or object map), `volumes_extra`.
  - If omitted entirely, the version uses top-level templated defaults.

These allow you to tweak service naming, image tags, ports, env sources, and bind additional mounts without forking the generator.

### Notes

- The generator mirrors the mount structure and per‑version env patterns used by the existing static compose file.
- You can commit the generated `compose.dev.yml` or keep it ephemeral and generate as part of your workflow.

Run the validator (also performs cross-reference checks):

```zsh
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
