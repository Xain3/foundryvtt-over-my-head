/**
 * @file Config Unit Tests
 * @description Exhaustive unit tests for the Config singleton (src/config/config.ts)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const helperMocks = vi.hoisted(() => ({
  loadYamlFiles: vi.fn(),
  loadConfigFiles: vi.fn(),
  mergeConstants: vi.fn(),
  extractConfigPrefix: vi.fn(),
  loadSettings: vi.fn(),
  loadModuleManifest: vi.fn(),
  loadEnvironmentVariables: vi.fn(),
}));

const manifestFactory = vi.hoisted(() => () => ({
  id: 'vision-with-fade',
  title: 'Vision with Fade',
  version: '12.1.0',
  shortName: 'OMH',
  compatibility: { minimum: '12' },
}));

const constantsFactory = vi.hoisted(() => () => ({
  errors: { separator: ' || ' },
  foundry: { defaults: { something: true } },
  hooks: { ready: 'hook-ready' },
}));

const configsFactory = vi.hoisted(() => () => ({
  logging: { console: { defaultLevel: 'info' } },
  moduleManagement: { shortName: 'OMH' },
  occlusion: { occlusionHandler: { triggeringEvents: {} } },
  placeables: { placeables: { token: {} } },
}));

const envFactory = vi.hoisted(() => () => ({
  OMH_DEBUG_MODE: 'true',
  OMH_MAX_TOKENS: '42',
}));

const yamlFactory = vi.hoisted(() => constantsFactory);

vi.mock('#src/config/helpers/configHelpers.ts', () => helperMocks);

const importConfigModule = () => import('#src/config/config.ts');

const originalEnv = process.env;

let debugSpy;
let infoSpy;
let warnSpy;
let errorSpy;
let currentSettingsFixture;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  process.env = { ...originalEnv };

  helperMocks.loadModuleManifest.mockImplementation(() => manifestFactory());
  helperMocks.extractConfigPrefix.mockImplementation((manifest) => {
    if (manifest && typeof manifest === 'object' && 'shortName' in manifest) {
      return String(manifest.shortName ?? 'OMH').toUpperCase();
    }
    return 'OMH';
  });
  helperMocks.loadYamlFiles.mockImplementation(() => constantsFactory());
  helperMocks.loadConfigFiles.mockImplementation(() => configsFactory());
  helperMocks.mergeConstants.mockImplementation((value) => value);
  currentSettingsFixture = [
    { key: 'alpha', name: 'Alpha Setting' },
    { key: 'beta', name: 'Beta Setting' },
  ];
  helperMocks.loadSettings.mockImplementation(() => ({
    settingsList: currentSettingsFixture,
  }));
  helperMocks.loadEnvironmentVariables.mockImplementation(() => envFactory());
});

afterEach(() => {
  debugSpy.mockRestore();
  infoSpy.mockRestore();
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  process.env = originalEnv;
});

describe('Config Singleton', () => {
  it('initializes via helper pipeline once and caches the instance', async () => {
    const moduleA = await importConfigModule();
    const { config } = moduleA;

    expect(config.prefix).toBe('OMH');
    expect(helperMocks.loadModuleManifest).toHaveBeenCalledTimes(1);
    expect(helperMocks.extractConfigPrefix).toHaveBeenCalledTimes(1);
    expect(helperMocks.loadYamlFiles).toHaveBeenCalledTimes(1);
    expect(helperMocks.loadConfigFiles).toHaveBeenCalledTimes(1);
    expect(helperMocks.mergeConstants).toHaveBeenCalledTimes(2);
    expect(helperMocks.loadSettings).toHaveBeenCalledTimes(1);
    expect(helperMocks.loadEnvironmentVariables).toHaveBeenCalledTimes(1);

    const constantsMergeArg = helperMocks.mergeConstants.mock.calls[0][0];
    const yamlResult = helperMocks.loadYamlFiles.mock.results[0].value;
    expect(constantsMergeArg).toStrictEqual(yamlResult);

    const configsMergeArg = helperMocks.mergeConstants.mock.calls[1][0];
    const configsResult = helperMocks.loadConfigFiles.mock.results[0].value;
    expect(configsMergeArg).toStrictEqual(configsResult);

    const moduleB = await importConfigModule();
    expect(moduleB.config).toBe(config);
    expect(helperMocks.loadModuleManifest).toHaveBeenCalledTimes(1);
  });

  it('deep freezes constants and normalized settings', async () => {
    const { config } = await importConfigModule();

    expect(Object.isFrozen(config.constants)).toBe(true);
    expect(Object.isFrozen(config.constants.errors)).toBe(true);
    expect(Object.isFrozen(config.configs)).toBe(true);
    expect(Object.isFrozen(config.configs.logging)).toBe(true);

    const originalSeparator = config.constants.errors.separator;
    expect(() => {
      config.constants.errors.separator = 'updated';
    }).toThrow(TypeError);
    expect(config.constants.errors.separator).toBe(originalSeparator);

    const originalLogLevel = config.configs.logging.console.defaultLevel;
    expect(() => {
      config.configs.logging.console.defaultLevel = 'debug';
    }).toThrow(TypeError);
    expect(config.configs.logging.console.defaultLevel).toBe(originalLogLevel);

    expect(Array.isArray(config.settings)).toBe(true);
    expect(Object.isFrozen(config.settings)).toBe(true);
    expect(() => {
      config.settings.push({ key: 'gamma' });
    }).toThrow(TypeError);
    expect(config.settings).toHaveLength(currentSettingsFixture.length);
  });

  it('prevents mutations through proxies and logs warnings for ignored changes', async () => {
    const { config } = await importConfigModule();

    warnSpy.mockClear();

    const originalTitle = config.module.title;

    config.module = {};
    config.module.title = 'Mutated Title';
    config.module.compatibility.minimum = '99';
    config.module.newFlag = true;

    expect(config.module.title).toBe(originalTitle);
    expect(config.module.compatibility.minimum).toBe('12');
    expect(config.module.newFlag).toBeUndefined();

    const messages = warnSpy.mock.calls.map(([msg]) => msg);
    expect(
      messages.some((msg) => msg.includes('top-level property "module"'))
    ).toBe(true);
    expect(messages.some((msg) => msg.includes('module.title'))).toBe(true);
    expect(
      messages.some((msg) => msg.includes('module.compatibility.minimum'))
    ).toBe(true);
    expect(messages.some((msg) => msg.includes('module.newFlag'))).toBe(true);
  });

  it('normalizes settings when YAML payload is already an array', async () => {
    const directSettings = [{ key: 'direct', name: 'Direct Setting' }];
    helperMocks.loadSettings.mockImplementation(() => directSettings);

    const { config } = await importConfigModule();

    expect(Array.isArray(config.settings)).toBe(true);
    expect(config.settings).toHaveLength(1);
    expect(config.settings[0]).toStrictEqual(directSettings[0]);
    expect(config.settings).not.toBe(directSettings);
    expect(Object.isFrozen(config.settings)).toBe(true);
  });

  it('falls back to an empty frozen array when settings payload is unrecognized', async () => {
    helperMocks.loadSettings.mockImplementation(() => ({ unexpected: true }));

    const { config } = await importConfigModule();

    expect(Array.isArray(config.settings)).toBe(true);
    expect(config.settings).toHaveLength(0);
    expect(Object.isFrozen(config.settings)).toBe(true);
  });

  it('produces a descriptive summary via toString()', async () => {
    const { config } = await importConfigModule();

    const output = config.toString();
    expect(output).toContain('Config[OMH]');
    expect(output).toContain('constants:');
    expect(output).toContain('settings: [2]');
    expect(output).toContain('vision-with-fade');
    expect(output).toContain('env: [2]');
  });

  it('returns bound methods from the proxy so `this` is preserved', async () => {
    const { config } = await importConfigModule();

    const toString = config.toString;
    expect(toString()).toContain('Config[OMH]');
  });

  it('exposes prefix from helper and reflects it in string output', async () => {
    helperMocks.extractConfigPrefix.mockImplementation(() => 'VWF');

    const { config } = await importConfigModule();

    expect(config.prefix).toBe('VWF');
    expect(config.toString()).toContain('Config[VWF]');
  });

  it('derives prefix from manifest shortName and normalizes casing', async () => {
    const manifestFixture = {
      ...manifestFactory(),
      shortName: 'omh-beta',
    };
    helperMocks.loadModuleManifest.mockImplementation(() => manifestFixture);

    const { config } = await importConfigModule();

    expect(helperMocks.extractConfigPrefix).toHaveBeenCalledWith(
      manifestFixture
    );
    expect(config.prefix).toBe('OMH-BETA');
  });

  it('falls back to OMH prefix when manifest shortName is absent', async () => {
    const manifestFixture = { ...manifestFactory() };
    delete manifestFixture.shortName;
    helperMocks.loadModuleManifest.mockImplementation(() => manifestFixture);

    const { config } = await importConfigModule();

    expect(helperMocks.extractConfigPrefix).toHaveBeenCalledWith(
      manifestFixture
    );
    expect(config.prefix).toBe('OMH');
  });

  it('clones module manifest and keeps proxy view stable', async () => {
    const manifestFixture = {
      id: 'vision-with-fade',
      title: 'Vision with Fade',
      version: '12.1.0',
      shortName: 'OMH',
      compatibility: { minimum: '12' },
    };
    helperMocks.loadModuleManifest.mockImplementation(() => manifestFixture);

    const { config } = await importConfigModule();

    expect(config.module).not.toBe(manifestFixture);
    expect(config.module).toBe(config.module);

    manifestFixture.title = 'Tampered Title';
    manifestFixture.compatibility.minimum = '99';

    expect(config.module.title).toBe('Vision with Fade');
    expect(config.module.compatibility.minimum).toBe('12');
  });

  it('deep freezes environment variables to keep them read-only', async () => {
    const { config } = await importConfigModule();

    expect(Object.isFrozen(config.env)).toBe(true);
    expect(() => {
      config.env.OMH_DEBUG_MODE = 'false';
    }).toThrow(TypeError);
    expect(config.env.OMH_DEBUG_MODE).toBe('true');
  });

  it('deep freezes nested arrays returned by configuration namespaces', async () => {
    helperMocks.loadConfigFiles.mockImplementation(() => {
      const base = configsFactory();
      base.placeables = {
        ...base.placeables,
        placeables: {
          token: {
            allowedCorners: ['top-left', 'top-right'],
          },
        },
        sequences: [
          ['north', 'east'],
          ['south', 'west'],
        ],
      };
      return base;
    });

    const { config } = await importConfigModule();

    const allowedCorners =
      config.configs.placeables.placeables.token.allowedCorners;
    expect(Object.isFrozen(allowedCorners)).toBe(true);
    expect(() => {
      allowedCorners.push('center');
    }).toThrow(TypeError);
    expect(allowedCorners).toEqual(['top-left', 'top-right']);

    const sequences = config.configs.placeables.sequences;
    expect(Object.isFrozen(sequences)).toBe(true);
    expect(Object.isFrozen(sequences[0])).toBe(true);
    expect(() => {
      sequences[0].push('extra');
    }).toThrow(TypeError);
    expect(sequences[0]).toEqual(['north', 'east']);
  });

  it('preserves custom logging configuration values', async () => {
    helperMocks.loadConfigFiles.mockImplementation(() => ({
      logging: {
        console: { defaultLevel: 'debug', colorize: ['debug'] },
        json: { enabled: true, destination: './logs.json' },
      },
      moduleManagement: { shortName: 'OMH' },
      occlusion: { occlusionHandler: { triggeringEvents: {} } },
      placeables: { placeables: { token: {} } },
    }));

    const { config } = await importConfigModule();

    expect(config.configs.logging.console.defaultLevel).toBe('debug');
    expect(config.configs.logging.json.enabled).toBe(true);
    expect(Object.isFrozen(config.configs.logging)).toBe(true);
    expect(() => {
      config.configs.logging.console.defaultLevel = 'info';
    }).toThrow(TypeError);
  });

  it('maps null or undefined namespaces to empty frozen objects', async () => {
    helperMocks.mergeConstants.mockImplementation((namespaces) => {
      const merged = {};
      for (const [key, value] of Object.entries(namespaces)) {
        if (value === null || value === undefined) {
          merged[key] = {};
        } else if (typeof value === 'object') {
          merged[key] = value;
        } else {
          throw new Error('Invalid namespace payload');
        }
      }
      return merged;
    });

    helperMocks.loadYamlFiles.mockImplementation(() => ({
      errors: null,
      foundry: undefined,
      hooks: { ready: 'hook-ready' },
    }));

    helperMocks.loadConfigFiles.mockImplementation(() => ({
      logging: null,
      moduleManagement: undefined,
      occlusion: { occlusionHandler: { triggeringEvents: {} } },
      placeables: { placeables: { token: {} } },
    }));

    const { config } = await importConfigModule();

    expect(config.constants.errors).toEqual({});
    expect(config.constants.foundry).toEqual({});
    expect(Object.isFrozen(config.constants.errors)).toBe(true);
    expect(Object.isFrozen(config.constants.foundry)).toBe(true);

    expect(config.configs.logging).toEqual({});
    expect(config.configs.moduleManagement).toEqual({});
    expect(Object.isFrozen(config.configs.logging)).toBe(true);
    expect(Object.isFrozen(config.configs.moduleManagement)).toBe(true);
  });

  it('handles circular references during deep freeze without crashing', async () => {
    helperMocks.loadYamlFiles.mockImplementation(() => {
      const base = yamlFactory();
      const circular = {};
      circular.self = circular;
      return { ...base, circular };
    });

    const { config } = await importConfigModule();

    expect(Object.isFrozen(config.constants.circular)).toBe(true);
    expect(config.constants.circular.self).toBe(config.constants.circular);
  });

  it('wraps initialization failures with contextual messaging', async () => {
    helperMocks.loadModuleManifest.mockImplementation(() => {
      throw new Error('manifest failed');
    });

    await expect(importConfigModule()).rejects.toThrow(
      '[OMH] CONFIG INITIALIZATION FAILED: manifest failed'
    );

    expect(errorSpy).toHaveBeenCalledWith(
      '[OMH] CONFIG INITIALIZATION FAILED: manifest failed'
    );
  });
});
