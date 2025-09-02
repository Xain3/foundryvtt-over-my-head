# Copilot Instructions for foundryvtt-over-my-head

Purpose: Enable AI coding agents to be productive quickly by capturing this repo’s actual architecture, workflows, and conventions.

## Big Picture
- Entry: `src/main.js` instantiates `OverMyHead` and calls `enableDevFeatures()` + `init()`.
- Core: `src/overMyHead.js` centralizes startup. Uses the config singleton, exports constants globally, and after `i18nInit` initializes context and handlers via `utils.initializer`.
- Config hub: `@config` (`src/config/config.js`) exposes:
  - `constants` (parsed from YAML, frozen), `manifest` (validated)
  - `buildManifestWithShortName()` → adds `shortName` (e.g., OMH)
  - `exportConstants()` → `globalThis.{shortName}Constants` (e.g., `OMHConstants`)
- Utils: `src/utils/*` with `utils.js` facade (logger, initializer, hook formatting, static proxies like validator/unpacker/localizer/error formatter/game manager).
- Contexts: `src/contexts/*` composition-based state/sync (dot-path access, merge/sync/filter, factory creation).
- Handlers: Extend `src/baseClasses/handler.js`; concrete handlers under `src/handlers/*` (e.g., settings).
- Build: Vite bundles ES module to `dist/main.js` consumed by `module.json` → `esmodules`.

## Conventions & Patterns
- Import config via `import config from '@config'`; avoid importing constants/manifest directly unless necessary.
- Export constants only with `config.exportConstants()`; don’t re-export from `OverMyHead`.
- Prefer `Utils` facade for logging, initialization, hook names, and static helpers.
- Use context helpers for data ops (merge/sync/compare/filter) instead of ad‑hoc mutations.
- Hook timing: initialize context/settings on Foundry hooks (`i18nInit` then `init`) using `Initializer` or `OverMyHead` flow.
- Aliases (Babel/Vite): `@`, `@docker`, `@config`, `@constants`, `@manifest`, `@configFolder`, `@contexts`, `@data`, `@handlers`, `@utils`, `@listeners`, `@maps`, `@helpers`, `@configHelpers`, `@validator`, `@module`.

## Developer Workflows
- Build (prod): `npm run build` → `dist/main.js`.
- Dev watch + deploy: `npm run dev` (scripts/dev/buildAndDeploy.js locates Foundry data dir, watches build, deploys via ModuleDeployer; removes root artifacts between builds).
- Tests: `npm test` (coverage, Babel transform). Subsets: `npm run test:unit`, `npm run test:integration`.
- Release: `npm run prerelease` then `npm run release` (commits `dist/`).
- Dev containers: see `docker/README.md`. Start with `docker compose -f docker/compose.dev.yml up -d`. `dist/` mirrored by `sync-host-content.{sh,mjs}`; shared worlds under `docker/shared/v*/worlds/*`.

## Integration Points
- Foundry hooks (`Hooks.once/on`) drive lifecycle. Heavy init runs after `i18nInit`. Dev-only features gated by `manifest.flags.dev`.
- `config.manifest` is the source of truth for id/title/version. `shortName` comes from constants or is derived.
- Docker patches provide rsync/copy mirroring and optional world sync; see env flags (e.g., `WORLD_SYNC_ENABLED`, `MODULE_MIRROR_ENABLED`).

## File Landmarks
- Entry: `src/main.js`, `src/overMyHead.js`
- Config: `src/config/config.js`, `src/config/constants.js`, `constants.yaml`, `src/config/helpers/constantsBuilder.js`
- Utils: `src/utils/` (see `src/utils/README.md`)
- Contexts: `src/contexts/` (see `src/contexts/README.md`)
- Build/dev: `scripts/dev/*`, `scripts/build/runViteWIthAction.js`
- Docker: `docker/README.md`, `docker/compose.dev*.yml`, `docker/patches/common/*`

## Gotchas
- Output is ES module; keep imports ESM-friendly and rely on configured aliases.
- Jest runs under Node with Babel; mock Foundry globals where needed. Coverage thresholds are enforced in `jest.config.js`.
- Constants are deeply frozen; change via YAML/config, not at runtime.
- `config.exportConstants()` should be called once; repeated calls warn and no‑op.

## Examples
- Init pattern:
```js
import config from '@config';
import Utilities from '@utils/utils.js';

const utils = new Utilities(config.constants, config.manifest);
config.exportConstants();
Hooks.once('i18nInit', () => {
  utils.initializer.initializeContext();
  const settingsHandler = utils.initializer.initializeHandlers?.(config, utils)?.settings;
  utils.initializer.initializeSettings(settingsHandler, utils);
});
```

- Handler skeleton:
```js
import Handler from '@/baseClasses/handler.js';
export default class MyHandler extends Handler {
  register() { /* settings registration, etc. */ }
}
```

## Style Appendix (actively enforced)
- Syntax: ES modules, `const/let`, arrow functions, template literals.
- Indentation: 2 spaces; avoid tabs.
- File header: JSDoc header with `@file`, `@description`, `@path` at top of source files.
- JSDoc: Document exported classes/functions with `@param`, `@returns`, and `@export` where applicable.
- Naming: camelCase for functions/vars, PascalCase for classes, UPPER_SNAKE_CASE for constants.
- Tests: name with `.unit.test.js` (co-located) and `.int.test.js` under `tests/integration/`; use Jest with Babel.
