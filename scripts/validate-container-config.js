#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in ${filePath}:`, e.message);
    process.exit(2);
  }
}

function main() {
  const root = path.resolve(__dirname, '..');
  const configPath = path.join(root, 'docker', 'container-config.json');
  const schemaPath = path.join(root, 'docker', 'container-config.schema.json');

  const config = readJSON(configPath);
  const schema = readJSON(schemaPath);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  if (process.env.DEBUG_VALIDATOR === '1') {
    try {
      for (const [ver, vCfg] of Object.entries(config.versions || {})) {
        const inst = vCfg.install || {};
        console.error(`[debug] v${ver} types: systems=${typeof inst.systems}, modules=${typeof inst.modules}, worlds=${typeof inst.worlds}`);
      }
    } catch (e) { /* ignore */ }
  }
  const valid = validate(config);

  if (!valid) {
    console.error('container-config.json failed validation:');
    for (const err of validate.errors) {
      console.error(`- ${err.instancePath || '(root)'} ${err.message}`);
    }
    process.exit(1);
  }

  // Cross-references: ensure ids used in versions.install exist in top-level systems/modules/worlds
  const systems = config.systems || {};
  const modules = config.modules || {};
  const worlds = config.worlds || {};
  const versions = config.versions || {};

  const missing = [];
  for (const [ver, vCfg] of Object.entries(versions)) {
    const sysMap = (vCfg.install && vCfg.install.systems) || {};
    const modMap = (vCfg.install && vCfg.install.modules) || {};
    const worldMap = (vCfg.install && vCfg.install.worlds) || {};

    for (const s of Object.keys(sysMap)) {
      if (!systems[s]) missing.push(`version ${ver}: system '${s}' not defined in top-level systems`);
    }
    for (const m of Object.keys(modMap)) {
      if (!modules[m]) missing.push(`version ${ver}: module '${m}' not defined in top-level modules`);
    }
    for (const w of Object.keys(worldMap)) {
      if (!worlds[w]) missing.push(`version ${ver}: world '${w}' not defined in top-level worlds`);
    }
  }

  if (missing.length) {
    console.error('Cross-reference errors:');
    for (const line of missing) console.error(`- ${line}`);
    process.exit(1);
  }

  console.log('container-config.json is valid.');
}

if (require.main === module) {
  main();
}
