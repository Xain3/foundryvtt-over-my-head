# Dev containers (felddy/foundryvtt)

Run multiple Foundry versions side‑by‑side and develop OverMyHead with instant updates via bind mounts.

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

## Start containers

```zsh
# From repo root → docker folder
cd docker

docker compose -f compose.dev.yml up -d

# Open Foundry
# v13 → http://localhost:30013
# v12 → http://localhost:30012
# v11 → http://localhost:30011
```

## Build the module (watch mode)

You can build on host or use the `builder` service.

- Host (fastest):

```zsh
npm ci
npx vite build --watch
```

- Builder service (no Node on host): already defined in compose; it runs `npm ci && npx vite build --watch` inside a Node container.

## How it works

- The built module directory (`dist/`) is bind‑mounted into each Foundry container at `/data/Data/modules/foundryvtt-over-my-head` (read‑only).
- Rebuilds update `dist/main.js`; Foundry sees changes immediately. Refresh the browser or use a hot‑reload module for auto‑reload.
- Each service reads credentials from the Docker secret mounted as `/run/secrets/config.json`.
- Foundry data persists in Docker volumes created by Compose. To wipe them for a fresh start, stop with `down -v` (see below).

## Stopping & cleanup

```zsh
docker compose -f compose.dev.yml down
# To also remove persistent worlds/configs (volumes) created by Compose:
docker compose -f compose.dev.yml down -v
```
