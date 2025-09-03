#!/usr/bin/env node
/**
 * Generate docker compose YAML from a JSON config.
 *
 * Supports two input shapes:
 * 1) Container config (recommended): `docker/container-config.json` — the single source of truth used by runtime patches
 * 2) Advanced compose config: `docker/compose.config.json` — direct control over services with explicit fields
 *
 * CLI usage (zsh):
 *  node docker/scripts/generate-compose.js -c docker/container-config.json -o docker/compose.dev.yml
 *  node docker/scripts/generate-compose.js --print               # print to stdout
 *
 * Environment overrides (container-config mode):
 *  - COMPOSE_BASE_IMAGE: Base image for Foundry services (default: felddy/foundryvtt)
 *  - COMPOSE_USER: User string for services (default: 0:0)
 *  - COMPOSE_BUILDER_ENABLED: When not '0', include builder service (default: enabled)
 *  - COMPOSE_BUILDER_IMAGE: Builder image (default: node:20-alpine)
 *
 * Defaults (container-config mode):
 *  - Service name: foundry-v<NN>, dir: v<NN>, port: 30000+<NN>
 *  - Image tag: >= v13 -> :release; v12 -> :12; v11 -> :11 (subject to image availability)
 *  - FETCH_STAGGER_SECONDS: v13=4, v12=2, else 0
 *  - Binds mirror static compose: config file, dist, patches, shared, resources, and cache
 *
 * @file docker/scripts/generate-compose.js
 * @module docker/scripts/generate-compose
 */

/**
 * @typedef {Object} ComposeVersionEntry
 * @property {string} name Service name (e.g., "foundry-v13")
 * @property {string} tag Docker image tag (e.g., "release")
 * @property {number} port Host port to map to container 30000
 * @property {string} versionDir Directory suffix like "v13"
 * @property {string} [envSuffix] Suffix for env file selection (default: `versionDir`)
 * @property {number} [fetchStaggerSeconds] Delay before network fetch to avoid 429s
 */

/**
 * @typedef {Object} ComposeBuilder
 * @property {string} [image] Builder image (default: node:20-alpine)
 * @property {boolean} [enabled] Whether builder service is included (default: true)
 */

/**
 * @typedef {Object} ComposeConfig
 * @property {string} [baseImage] Base image repo (default: felddy/foundryvtt)
 * @property {string} [user] Service user (default: 0:0)
 * @property {Array<ComposeVersionEntry>} versions List of services to generate
 * @property {ComposeBuilder} [builder] Optional builder service configuration
 */

/**
 * @typedef {Object} Item
 * @property {string} name Display name
 * @property {string} [manifest] Manifest URL (non-empty) or empty string
 * @property {string} [path] Local path or URL (non-empty) or empty string
 * @property {boolean} [install_at_startup]
 * @property {boolean|Object} [continuous_sync]
 * @property {boolean} [check_presence]
 */

/**
 * @typedef {Object.<string, Item>} ItemMap
 */

/**
 * @typedef {Object} VersionInstall
 * @property {Object.<string, Partial<Item>>} [systems]
 * @property {Object.<string, Partial<Item>>} [modules]
 * @property {Object.<string, Partial<Item>>} [worlds]
 */

/**
 * @typedef {Object} VersionConfig
 * @property {boolean} [supported] Whether this Foundry version should run (default: true)
 * @property {VersionInstall} install What to install for this version
 */

/**
 * @typedef {Object} ContainerConfig
 * @property {ItemMap} systems
 * @property {ItemMap} modules
 * @property {ItemMap} [worlds]
 * @property {Object.<string, VersionConfig>} versions
 */

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

function parseArgs(argv) {
  const args = { config: 'docker/container-config.json', out: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '-c' || a === '--config') && argv[i + 1]) {
      args.config = argv[++i];
    } else if ((a === '-o' || a === '--out') && argv[i + 1]) {
      args.out = argv[++i];
    } else if (a === '--print') {
      args.out = '';
    }
  }
  return args;
}

/**
 * Convert an env object to Docker Compose `environment` array entries.
 *
 * @param {Record<string,string|number|boolean>|undefined} envObjOrNumber Key-value map
 * @returns {string[]} List like ["KEY=value", ...]
 */
function toEnvList(envObjOrNumber) {
  if (envObjOrNumber && typeof envObjOrNumber === 'object' && !Array.isArray(envObjOrNumber)) {
    return Object.entries(envObjOrNumber).map(([k, v]) => `${k}=${v}`);
  }
  return [];
}

/**
 * Resolve a templated string replacing `{version}` with the numeric version.
 * @param {string|undefined} template
 * @param {number} version
 * @returns {string|undefined}
 */
function resolveTemplatedString(template, version) {
  if (typeof template !== 'string') return undefined;
  return template.replaceAll('{version}', String(version));
}

/**
 * Resolve a templated number. Accepts a number or a string containing `{version}`.
 * @param {number|string|undefined} value
 * @param {number} version
 * @returns {number|undefined}
 */
function resolveTemplatedNumber(value, version) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const s = value.replaceAll('{version}', String(version));
    const n = Number(s);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

/**
 * Build a docker compose object from the advanced compose config shape.
 *
 * @param {ComposeConfig} config Advanced compose config
 * @returns {{secrets:Object, volumes:Object, services:Object}} Compose data
 */
function buildComposeFromComposeConfig(config) {
  const secrets = {
    config_json: { file: './secrets.json' },
  };

  const volumes = {};
  const services = {};

  for (const v of config.versions || []) {
    const name = v.name; // e.g. foundry-v13
    const dir = v.versionDir; // e.g. v13
    if (!name || !dir) throw new Error(`Version entries must include name and versionDir: ${JSON.stringify(v)}`);

    const image = `${config.baseImage || 'felddy/foundryvtt'}:${v.tag || 'release'}`;
    const user = v.user || config.user || '0:0';
    const port = v.port || 30000;
    const envSuffix = v.envSuffix || dir;
    const fetchStagger = v.fetchStaggerSeconds ?? 0;

    volumes[`${name}-data`] = null;

    services[name] = {
      image,
      container_name: name,
      hostname: name,
      user: `${user}`,
      ports: [ `${port}:30000` ],
      volumes: [
        `${name}-data:/data`,
        { type: 'bind', source: './container-config.json', target: '/config/container-config.json', read_only: true },
        { type: 'bind', source: '../dist', target: '/host/dist', read_only: true },
        { type: 'bind', source: './patches', target: '/container_patches' },
        { type: 'bind', source: `./shared/${dir}`, target: '/host/shared', read_only: false },
        { type: 'bind', source: `./resources/${dir}`, target: '/host/resources', read_only: true },
        { type: 'bind', source: `./foundry-cache/${dir}`, target: '/data/container_cache' },
      ],
      secrets: [ { source: 'config_json', target: 'config.json' } ],
      env_file: [ './env/.env', `./env/.${envSuffix}.env` ],
      environment: [ `FETCH_STAGGER_SECONDS=${fetchStagger}` ],
    };
  }

  if (config.builder?.enabled !== false) {
    services['builder'] = {
      image: (config.builder && config.builder.image) || 'node:20-alpine',
      container_name: 'module-builder',
      working_dir: '/work',
      command: 'sh -c "npm ci && npx vite build --watch"',
      volumes: [ '../:/work' ],
      restart: 'unless-stopped',
    };
  }

  return { secrets, volumes, services };
}

/**
 * Build a docker compose object from the canonical container-config.json.
 *
 * @param {ContainerConfig} containerCfg Validated container config
 * @param {{baseImage?:string, user?:string, builderEnabled?:boolean, builderImage?:string}} [opts]
 * @returns {{secrets:Object, volumes:Object, services:Object}} Compose data
 */
function buildComposeFromContainerConfig(containerCfg, opts = {}) {
  const secrets = { config_json: { file: './secrets.json' } };
  const volumes = {};
  const services = {};

  const comp = containerCfg.composition || {};
  const baseImage = opts.baseImage || comp.baseImage || 'felddy/foundryvtt';
  const user = opts.user || comp.user || '0:0';
  const vp = comp.version_params || {};

  const versions = containerCfg.versions || {};
  for (const [ver, conf] of Object.entries(versions)) {
    const supported = conf?.supported !== false; // default true
    if (!supported) continue;
    const intVer = parseInt(ver, 10);
    if (Number.isNaN(intVer)) continue;
    const cp = conf.composition_params || {};

    // Defaults from top-level version_params (templated), then hard-coded fallbacks
    const defName = resolveTemplatedString(vp.name, intVer) || `foundry-v${intVer}`;
    const defDir = resolveTemplatedString(vp.versionDir, intVer) || `v${intVer}`;
    const defTag = resolveTemplatedString(vp.tag, intVer) || (intVer >= 13 ? 'release' : `${intVer}`);
    const defPort = resolveTemplatedNumber(vp.port, intVer) ?? (30000 + intVer);
    const defEnvSuffix = resolveTemplatedString(vp.envSuffix, intVer) || defDir;

    // Apply optional per-version overrides only if present
    const name = typeof cp.name === 'string' && cp.name ? cp.name : defName;
    const dir = typeof cp.versionDir === 'string' && cp.versionDir ? cp.versionDir : defDir;
    const tag = typeof cp.tag === 'string' && cp.tag ? cp.tag : defTag;
    const port = typeof cp.port === 'number' ? cp.port : defPort;
  const envSuffix = typeof cp.envSuffix === 'string' && cp.envSuffix ? cp.envSuffix : dir;
    const stagger = typeof cp.fetchStaggerSeconds === 'number' ? cp.fetchStaggerSeconds : (intVer >= 13 ? 4 : intVer === 12 ? 2 : 0);

    volumes[`${name}-data`] = null;
    const baseService = {
      image: `${baseImage}:${tag}`,
      container_name: name,
      hostname: name,
      user: `${user}`,
      ports: [ `${port}:30000` ],
      volumes: [
        `${name}-data:/data`,
        { type: 'bind', source: './container-config.json', target: '/config/container-config.json', read_only: true },
        { type: 'bind', source: '../dist', target: '/host/dist', read_only: true },
        { type: 'bind', source: './patches', target: '/container_patches' },
        { type: 'bind', source: `./shared/${dir}`, target: '/host/shared', read_only: false },
        { type: 'bind', source: `./resources/${dir}`, target: '/host/resources', read_only: true },
        { type: 'bind', source: `./foundry-cache/${dir}`, target: '/data/container_cache' }
      ],
      secrets: [ { source: 'config_json', target: 'config.json' } ],
      env_file: [ './env/.env', `./env/.${envSuffix}.env` ],
      environment: [ `FETCH_STAGGER_SECONDS=${stagger}` ],
    };

    // Apply additions from composition_params
    if (Array.isArray(cp.env_files) && cp.env_files.length) {
      baseService.env_file = [...baseService.env_file, ...cp.env_files];
    }
    if (cp.environment) {
      if (Array.isArray(cp.environment)) {
        baseService.environment = [...baseService.environment, ...cp.environment];
      } else if (typeof cp.environment === 'object') {
        baseService.environment = [...baseService.environment, ...toEnvList(cp.environment)];
      }
    }
    if (Array.isArray(cp.volumes_extra) && cp.volumes_extra.length) {
      baseService.volumes = [...baseService.volumes, ...cp.volumes_extra];
    }

    services[name] = baseService;
  }

  const builderEnabledDefault = comp.builder?.enabled !== false;
  const builderImageDefault = comp.builder?.image || 'node:20-alpine';
  if (opts.builderEnabled !== false && builderEnabledDefault !== false) {
    services['builder'] = {
      image: opts.builderImage || builderImageDefault,
      container_name: 'module-builder',
      working_dir: '/work',
      command: 'sh -c "npm ci && npx vite build --watch"',
      volumes: [ '../:/work' ],
      restart: 'unless-stopped',
    };
  }

  return { secrets, volumes, services };
}

function main() {
  const { config: confPath, out } = parseArgs(process.argv);
  const absConf = path.resolve(confPath);
  if (!fs.existsSync(absConf)) {
    console.error(`Config file not found: ${absConf}`);
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(absConf, 'utf8'));
  let compose;
  const looksLikeContainerConfig = cfg && typeof cfg === 'object' && cfg.systems && cfg.modules && cfg.versions && !Array.isArray(cfg.versions);
  if (looksLikeContainerConfig) {
    compose = buildComposeFromContainerConfig(cfg, {
      baseImage: process.env.COMPOSE_BASE_IMAGE,
      user: process.env.COMPOSE_USER,
      builderEnabled: process.env.COMPOSE_BUILDER_ENABLED !== '0',
      builderImage: process.env.COMPOSE_BUILDER_IMAGE,
    });
  } else {
    compose = buildComposeFromComposeConfig(cfg);
  }
  const yml = yaml.dump(compose, { noRefs: true, lineWidth: 120 });

  if (out) {
    const absOut = path.resolve(out);
    fs.writeFileSync(absOut, yml, 'utf8');
    console.log(`Wrote ${absOut}`);
  } else {
    process.stdout.write(yml);
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(e?.stack || String(e)); process.exit(1); }
}
