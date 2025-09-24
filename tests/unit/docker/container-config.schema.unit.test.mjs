const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('container-config schema', () => {
  let schema;
  let ajv;

  beforeAll(() => {
    const schemaPath = path.resolve(process.cwd(), 'docker/container-config.schema.json');
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
  });

  test('accepts continuous_sync boolean and presence check on worlds', () => {
    const validate = ajv.compile(schema);
    const cfg = {
      systems: { sys1: { name: 'Sys 1', manifest: '', path: '/data/container_cache/sys1.zip', install_at_startup: true } },
      modules: { mod1: { name: 'Mod 1', manifest: 'https://example.com/mod1.json', path: '', install_at_startup: true } },
      worlds: { w1: { name: 'World 1', manifest: '', path: '../docker/shared/v13/worlds/w1', install_at_startup: false, check_presence: true } },
      versions: {
        '13': {
          supported: true,
          install: {
            systems: { sys1: {} },
            modules: { mod1: {} },
            worlds: { w1: { continuous_sync: true } }
          }
        }
      }
    };
    const ok = validate(cfg);
    if (!ok) console.error(validate.errors);
    expect(ok).toBe(true);
  });

  test('accepts continuous_sync object overrides', () => {
    const validate = ajv.compile(schema);
    const cfg = {
      systems: { s: { name: 'S', manifest: '', path: '/data/container_cache/s.zip', install_at_startup: true } },
      modules: { m: { name: 'M', manifest: 'https://example.com/m.json', path: '', install_at_startup: true } },
      worlds: { w: { name: 'W', manifest: '', path: '../docker/shared/v13/worlds/w', install_at_startup: false } },
      versions: {
        '13': {
          install: {
            systems: { s: { continuous_sync: { enabled: true, direction: 'host-to-container', source: '/host/resources/systems/s', delete: true, interval: 2 } } },
            modules: { m: { continuous_sync: { enabled: true, direction: 'bidirectional', source: '/host/resources/modules/m' } } },
            worlds: { w: { continuous_sync: { enabled: true, direction: 'host-to-container' } } }
          }
        }
      }
    };
    const ok = validate(cfg);
    if (!ok) console.error(validate.errors);
    expect(ok).toBe(true);
  });

  test('rejects invalid direction', () => {
    const validate = ajv.compile(schema);
    const cfg = {
      systems: { s: { name: 'S', manifest: '', path: '/data/container_cache/s.zip', install_at_startup: true } },
      modules: { m: { name: 'M', manifest: 'https://example.com/m.json', path: '', install_at_startup: true } },
      versions: {
        '13': {
          install: {
            systems: { s: {} },
            modules: { m: { continuous_sync: { enabled: true, direction: 'both-ways' } } }
          }
        }
      }
    };
    const ok = validate(cfg);
    expect(ok).toBe(false);
    expect(validate.errors.some(e => String(e.message).includes('must be equal to one of the allowed values'))).toBe(true);
  });
});
