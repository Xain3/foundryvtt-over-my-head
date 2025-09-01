#!/usr/bin/env node
/**
 * Dev smoke installer
 *
 * Runs the ComponentInstaller against a provided config (manifest or local path)
 * without needing the full container startup. Useful for verifying caching,
 * extraction, and directory installs.
 *
 * Usage examples:
 *   node docker/patches/common/dev-smoke-install.mjs --type module --id foundryvtt_over_my_head --manifest https://example.com/module.json
 *   node docker/patches/common/dev-smoke-install.mjs --type system --id simple_worldbuilding_system --url https://example.com/system.zip
 *   node docker/patches/common/dev-smoke-install.mjs --type world --id example_world --path ../tests/test-world
 *
 * Environment:
 *   FOUNDRY_DATA_DIR=/data/Data (default) — change to any temp dir
 *   CONTAINER_CONFIG_PATH ignored; this script constructs an ephemeral config
 *   COMPONENT_CACHE=/tmp/omh-cache (default) or override
 *   PATCH_DEBUG=1 for verbose logs, PATCH_DRY_RUN=1 for no side effects
 */
import process from 'process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ComponentInstaller } from './helpers/componentInstaller.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.type || !args.id || (!args.manifest && !args.path && !args.url)) {
  console.error('Usage: dev-smoke-install.mjs --type <system|module|world> --id <id> (--manifest <url> | --path <path> | --url <archiveUrl>)');
  process.exit(2);
}

const ENV = { ...process.env };
ENV.FOUNDRY_DATA_DIR = ENV.FOUNDRY_DATA_DIR || path.join(os.tmpdir(), 'omh-smoke-Data');
ENV.CONTAINER_CONFIG_PATH = path.join(os.tmpdir(), `omh-smoke-config-${Date.now()}.json`);
ENV.COMPONENT_CACHE = ENV.COMPONENT_CACHE || path.join(os.tmpdir(), 'omh-smoke-cache');

const FALLBACKS = {
  VERSION: ENV.FOUNDRY_FALLBACK_MAJOR_VERSION || '13',
  DATA_DIR: ENV.FOUNDRY_DATA_DIR,
  CONTAINER_CONFIG_PATH: ENV.CONTAINER_CONFIG_PATH
};

const DIRS = { SYSTEMS: 'systems', MODULES: 'modules', WORLDS: 'worlds' };

// Build a minimal config for the requested type/id
const topLevel = { name: args.id };
if (args.manifest) topLevel.manifest = String(args.manifest);
if (args.path) topLevel.path = String(args.path);
if (args.url) topLevel.path = String(args.url);

const config = {
  systems: args.type === 'system' ? { [args.id]: topLevel } : {},
  modules: args.type === 'module' ? { [args.id]: topLevel } : {},
  worlds:  args.type === 'world'  ? { [args.id]: topLevel } : {},
  versions: {
    [FALLBACKS.VERSION]: {
      supported: true,
      install: {
        systems: args.type === 'system' ? { [args.id]: {} } : undefined,
        modules: args.type === 'module' ? { [args.id]: {} } : undefined,
        worlds:  args.type === 'world'  ? { [args.id]: {} } : undefined
      }
    }
  }
};

fs.mkdirSync(path.dirname(ENV.CONTAINER_CONFIG_PATH), { recursive: true });
fs.writeFileSync(ENV.CONTAINER_CONFIG_PATH, JSON.stringify(config, null, 2));

console.log(`[smoke] Using Data dir: ${ENV.FOUNDRY_DATA_DIR}`);
console.log(`[smoke] Using cache dir: ${ENV.COMPONENT_CACHE}`);
console.log(`[smoke] Temp config: ${ENV.CONTAINER_CONFIG_PATH}`);

const installer = new ComponentInstaller(ENV, FALLBACKS, DIRS);
await installer.install();

console.log('[smoke] Done.');
