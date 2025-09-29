/**
 * @file settingsParser.unit.test.mjs
 * @description Merged unit tests for SettingsParser, including enhanced onChange hook functionality.
 * @path src/handlers/settingsHelpers/settingsParser.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import SettingsParser from './settingsParser.mjs';
import SettingsChecker from './settingsChecker.mjs';
import FlagEvaluator from './flagEvaluator.mjs';

// Vitest Mocks
vi.mock('./settingsChecker.mjs');
vi.mock('./flagEvaluator.mjs');
vi.mock('@/baseClasses/handler', () => ({
  default: class MockHandler {
    constructor(config, utils, context) {
      this.config = config;
      this.context = context;
      this.utils = utils;
    }
  }
}));

// Mock global Hooks early for all tests
global.Hooks = {
  call: vi.fn(),
  callAll: vi.fn()
};

// --- Type Normalization Tests (merged) ---
describe('SettingsParser type normalization', () => {
  let parser;
  const baseConfig = { constants: { settings: { requiredKeys: ['key', 'config.name', 'config.type'] } } };
  const smallUtils = { formatError: (e) => String(e), logWarning: vi.fn(), logDebug: vi.fn(), formatHookName: (x) => x };
  const smallContext = {};

  beforeEach(() => {
    parser = new SettingsParser(baseConfig, smallUtils, smallContext);
    delete globalThis.foundry;
  // Ensure validation passes in this suite
  SettingsChecker.check.mockReturnValue(true);
  // Ensure flag evaluation passes in this suite
  FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);
  });

  const makeSetting = (typeVal) => ({
    key: 't',
    config: { name: 'T', type: typeVal }
  });

  it('normalizes case-insensitive primitives', () => {
    const cases = [
      { in: 'boolean', out: Boolean },
      { in: 'BOOLEAN', out: Boolean },
      { in: 'number', out: Number },
      { in: 'INTEGER', out: Number },
      { in: 'float', out: Number },
      { in: 'string', out: String },
      { in: 'object', out: Object },
      { in: 'array', out: Array }
    ];

    for (const c of cases) {
      const s = makeSetting(c.in);
      const res = parser.parse([s]);
      expect(res.successful).toBe(1);
      expect(s.config.type).toBe(c.out);
    }
  });

  it('resolves DataField by dotted path', () => {
    globalThis.foundry = { data: { fields: { BooleanField: function BooleanField() {} } } };
    const s = makeSetting('foundry.data.fields.BooleanField');
    parser.parse([s]);
    expect(typeof s.config.type).toBe('function');
    expect(s.config.type.name).toBe('BooleanField');
  });

  it('resolves DataField by class name', () => {
    globalThis.foundry = { data: { fields: { NumberField: function NumberField() {} } } };
    const s = makeSetting('NumberField');
    parser.parse([s]);
    expect(typeof s.config.type).toBe('function');
    expect(s.config.type.name).toBe('NumberField');
  });

  it('resolves DataField by prefix form datafield:boolean', () => {
    globalThis.foundry = { data: { fields: { BooleanField: function BooleanField() {} } } };
    const s = makeSetting('datafield:boolean');
    parser.parse([s]);
    expect(typeof s.config.type).toBe('function');
    expect(s.config.type.name).toBe('BooleanField');
  });

  it('resolves DataModel via datamodel: prefix and falls back when no path given', () => {
    function DummyModel() {}
    globalThis.foundry = { abstract: { DataModel: DummyModel } };

    const s1 = makeSetting('datamodel:');
    parser.parse([s1]);
    expect(s1.config.type).toBe(DummyModel);

    globalThis.Some = { Deep: { Model: function Model() {} } };
    const s2 = makeSetting('datamodel:Some.Deep.Model');
    parser.parse([s2]);
    expect(s2.config.type.name).toBe('Model');

    delete globalThis.Some;
  });

  it('does not throw when unknown type strings are provided', () => {
    const s = makeSetting('unknownThing');
    expect(() => parser.parse([s])).not.toThrow();
    expect(typeof s.config.type).toBe('string');
  });
});

// --- Original Unit Tests ---
const makeUtils = () => ({
  formatError: (msg) => msg,
  logWarning: vi.fn(),
  logDebug: vi.fn(),
  formatHookName: vi.fn((hookName) => `FORMATTED_${hookName}`),
});

const makeConfig = (requiredKeys = ['key', 'name', 'scope']) => ({
  constants: {
    settings: { requiredKeys },
  },
});

const context = {};

describe('SettingsParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure flag evaluation passes by default for existing tests
    FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);
  });

  it('parses an array of valid settings successfully', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    // All valid
    SettingsChecker.check.mockReturnValue(true);
    const input = [
      { key: 'a', name: 'A', scope: 'client' },
      { key: 'b', name: 'B', scope: 'world' },
    ];

    const result = parser.parse(input);

    expect(result.processed).toBe(2);
    expect(result.successful).toBe(2);
    expect(result.parsed).toEqual(['a', 'b']);
    expect(result.failed).toEqual([]);
    expect(utils.logWarning).not.toHaveBeenCalled();
  });

  it('parses an object map of valid settings successfully', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    SettingsChecker.check.mockReturnValue(true);
    const input = {
      A: { key: 'a', name: 'A', scope: 'client' },
      B: { key: 'b', name: 'B', scope: 'world' },
    };

    const result = parser.parse(input);

    expect(result.processed).toBe(2);
    expect(result.successful).toBe(2);
    expect(result.parsed).toEqual(['a', 'b']);
    expect(result.failed).toEqual([]);
    expect(utils.logWarning).not.toHaveBeenCalled();
  });

  it('logs a warning when only a subset of settings are valid (array input)', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    // First valid, second invalid
    SettingsChecker.check
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const input = [
      { key: 'a', name: 'A', scope: 'client' },
      { name: 'B' },
    ];

    const result = parser.parse(input);

    expect(result.processed).toBe(2);
    expect(result.successful).toBe(1);
    expect(result.parsed).toEqual(['a']);
    expect(result.failed).toEqual(['Unknown']);
    expect(utils.logWarning).toHaveBeenCalledTimes(1);
    expect(utils.logWarning.mock.calls[0][0]).toMatch('SettingsParser: 1 out of 2 settings were successfully parsed');
  });

  it('throws for invalid input types', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    expect(() => parser.parse(null)).toThrow('Settings cannot be parsed: invalid format');
    expect(() => parser.parse(undefined)).toThrow('Settings cannot be parsed: invalid format');
    expect(() => parser.parse('str')).toThrow('Settings cannot be parsed: invalid format');
    expect(() => parser.parse(42)).toThrow('Settings cannot be parsed: invalid format');
  });

  it('throws when no valid settings are found (empty array/object)', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    SettingsChecker.check.mockReturnValue(false);

    expect(() => parser.parse([])).toThrow('Settings cannot be parsed: no valid settings found');
    expect(() => parser.parse({})).toThrow('Settings cannot be parsed: no valid settings found');
  });

  it('throws when all processed settings are invalid', () => {
    const config = makeConfig();
    const utils = makeUtils();
    const parser = new SettingsParser(config, utils, context);

    SettingsChecker.check.mockReturnValue(false);

    const input = [
      { key: 'a' },
      { key: 'b' },
    ];

    expect(() => parser.parse(input)).toThrow('Settings cannot be parsed: all settings are invalid');
  });
});

// --- Enhanced onChange Hook Tests ---
describe('SettingsParser - Enhanced onChange Hook Tests', () => {
  let settingsParser;
  let mockConfig;
  let mockContext;
  let mockUtils;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    global.Hooks.call.mockClear();
    global.Hooks.callAll.mockClear();

    mockConfig = {
      constants: {
        settings: {
          requiredKeys: ['key', 'config.name', 'config.hint', 'config.scope', 'config.type']
        },
        hooks: {
          setting: '.setting'
        }
      }
    };

    mockContext = {};

    mockUtils = {
      formatError: vi.fn((message) => `ERROR: ${message}`),
      logWarning: vi.fn(),
      logDebug: vi.fn(),
      formatHookName: vi.fn((hookName) => `OMH${hookName}`)
    };

    settingsParser = new SettingsParser(mockConfig, mockUtils, mockContext);

    // Mock SettingsChecker to return true by default
    SettingsChecker.check.mockReturnValue(true);
    // Mock FlagEvaluator to return true by default for existing tests
    FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);
  });

  describe('onChange hook functionality', () => {
    it('should create onChange callback that calls Hooks.callAll for client scope', () => {
      const setting = {
        key: 'clientSetting',
        config: {
          name: 'Client Setting',
          hint: 'A client setting',
          scope: 'client',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: 'testHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      expect(mockUtils.formatHookName).toHaveBeenCalledWith('.settingtestHook');
      expect(typeof setting.config.onChange).toBe('function');

      // Test the onChange callback - now always uses Hooks.callAll
      const onChangeCallback = setting.config.onChange;
      onChangeCallback(true);

      expect(global.Hooks.callAll).toHaveBeenCalledWith('OMH.settingtestHook', true);
      expect(global.Hooks.call).not.toHaveBeenCalled();
    });

    it('should create onChange callback that calls Hooks.callAll for world scope', () => {
      const setting = {
        key: 'worldSetting',
        config: {
          name: 'World Setting',
          hint: 'A world setting',
          scope: 'world',
          type: String,
          onChange: {
            sendHook: true,
            hookName: 'worldHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      // Test the onChange callback
      const onChangeCallback = setting.config.onChange;
      onChangeCallback('newValue');

      expect(global.Hooks.callAll).toHaveBeenCalledWith('OMH.settingworldHook', 'newValue');
      expect(global.Hooks.call).not.toHaveBeenCalled();
    });

    it('should use setting key as hook name when hookName is empty', () => {
      const setting = {
        key: 'autoNamedSetting',
        config: {
          name: 'Auto Named Setting',
          hint: 'Setting with auto-generated hook name',
          scope: 'user',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: ''
          }
        }
      };

      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      expect(mockUtils.formatHookName).toHaveBeenCalledWith('.settingautoNamedSetting');
    });

    it('should handle formatHookName failure gracefully', () => {
      mockUtils.formatHookName.mockImplementation(() => {
        throw new Error('Hook formatting failed');
      });

      const setting = {
        key: 'failingSetting',
        config: {
          name: 'Failing Setting',
          hint: 'Setting that fails hook formatting',
          scope: 'world',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: 'failingHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      expect(mockUtils.logWarning).toHaveBeenCalledWith(
        expect.stringContaining('Failed to format hook name for setting failingSetting')
      );
      expect(mockUtils.logWarning).toHaveBeenCalledWith(
        expect.stringContaining('Skipping hook setup for setting failingSetting')
      );
      // onChange should not be modified when hook formatting fails
      expect(setting.config.onChange).toEqual({
        sendHook: true,
        hookName: 'failingHook'
      });
    });

    it('should handle missing hookName and setting key gracefully', () => {
      const setting = {
        config: {
          name: 'Unnamed Setting',
          hint: 'Setting without key or hook name',
          scope: 'world',
          type: Boolean,
          onChange: {
            sendHook: true
          }
        }
      };

      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      expect(mockUtils.logWarning).toHaveBeenCalledWith(
        expect.stringContaining('Unknown hook name for setting')
      );
    });

    it('should handle onChange callback errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      global.Hooks.callAll.mockImplementation(() => {
        throw new Error('Hook call failed');
      });

      const setting = {
        key: 'errorSetting',
        config: {
          name: 'Error Setting',
          hint: 'Setting that causes hook errors',
          scope: 'client',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: 'errorHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);
      expect(result.successful).toBe(1);

      // Test the onChange callback with error
      const onChangeCallback = setting.config.onChange;
      onChangeCallback(true);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to trigger hook'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle user scope correctly', () => {
      const setting = {
        key: 'userSetting',
        config: {
          name: 'User Setting',
          hint: 'A user-scoped setting',
          scope: 'user',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: 'userHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);
      expect(result.successful).toBe(1);

      // Test the onChange callback for user scope (now also uses Hooks.callAll)
      const onChangeCallback = setting.config.onChange;
      onChangeCallback(false);

      expect(global.Hooks.callAll).toHaveBeenCalledWith('OMH.settinguserHook', false);
      expect(global.Hooks.call).not.toHaveBeenCalled();
    });

    it('should default to world scope when scope is not specified', () => {
      const setting = {
        key: 'defaultScopeSetting',
        config: {
          name: 'Default Scope Setting',
          hint: 'Setting without explicit scope',
          type: Boolean,
          onChange: {
            sendHook: true,
            hookName: 'defaultHook'
          }
        }
      };

      const result = settingsParser.parse([setting]);
      expect(result.successful).toBe(1);

      // Test the onChange callback (should default to world scope)
      const onChangeCallback = setting.config.onChange;
      onChangeCallback('test');

      expect(global.Hooks.callAll).toHaveBeenCalledWith('OMH.settingdefaultHook', 'test');
      expect(global.Hooks.call).not.toHaveBeenCalled();
    });

    it('should not modify settings without sendHook flag', () => {
      const setting = {
        key: 'normalSetting',
        config: {
          name: 'Normal Setting',
          hint: 'Setting without hook functionality',
          scope: 'world',
          type: Boolean,
          onChange: {
            hookName: 'normalHook'
            // Note: no sendHook flag
          }
        }
      };

      const originalOnChange = { ...setting.config.onChange };
      const result = settingsParser.parse([setting]);

      expect(result.successful).toBe(1);
      expect(setting.config.onChange).toBeUndefined(); // onChange is removed when sendHook is false/missing
      expect(mockUtils.formatHookName).not.toHaveBeenCalled();
    });
  });

  describe('Flag conditional parsing', () => {
    let parser;
    const mockConfig = {
      constants: { settings: { requiredKeys: ['key', 'config.name', 'config.type'] } },
      manifest: { debugMode: true, dev: false }
    };
    const mockUtils = {
      formatError: (e) => String(e),
      logWarning: vi.fn(),
      logDebug: vi.fn()
    };
    const mockContext = {};

    beforeEach(() => {
      parser = new SettingsParser(mockConfig, mockUtils, mockContext);
      SettingsChecker.check.mockReturnValue(true);
      FlagEvaluator.shouldShow = vi.fn();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should parse settings when flags allow showing', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'testSetting',
        showOnlyIfFlag: 'manifest.debugMode',
        dontShowIfFlag: null,
        config: { name: 'Test', type: Boolean }
      };

      const result = parser.parse([setting]);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        'manifest.debugMode',
        null,
        mockConfig,
        undefined
      );
      expect(result.successful).toBe(1);
      expect(result.parsed).toContain('testSetting');
    });

    it('should skip settings when flags prevent showing', () => {
      FlagEvaluator.shouldShow.mockReturnValue(false);

      const setting = {
        key: 'hiddenSetting',
        showOnlyIfFlag: 'manifest.dev',
        dontShowIfFlag: null,
        config: { name: 'Hidden', type: Boolean }
      };

      expect(() => parser.parse([setting])).toThrow('all settings are invalid');

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        'manifest.dev',
        null,
        mockConfig,
        undefined
      );
    });

    it('should handle complex flag conditions', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'complexSetting',
        showOnlyIfFlag: { or: ['manifest.debugMode', 'manifest.dev'] },
        dontShowIfFlag: { and: ['someFlag', 'anotherFlag'] },
        config: { name: 'Complex', type: Boolean }
      };

      const result = parser.parse([setting]);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        { or: ['manifest.debugMode', 'manifest.dev'] },
        { and: ['someFlag', 'anotherFlag'] },
        mockConfig,
        undefined
      );
      expect(result.successful).toBe(1);
    });

    it('should parse settings without flags normally', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'normalSetting',
        showOnlyIfFlag: null,
        dontShowIfFlag: null,
        config: { name: 'Normal', type: Boolean }
      };

      const result = parser.parse([setting]);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        null,
        null,
        mockConfig,
        undefined
      );
      expect(result.successful).toBe(1);
    });

    it('should handle mixed settings with different flag results', () => {
      FlagEvaluator.shouldShow
        .mockReturnValueOnce(true)  // First setting should show
        .mockReturnValueOnce(false) // Second setting should hide
        .mockReturnValueOnce(true); // Third setting should show

      const settings = [
        {
          key: 'visibleSetting',
          showOnlyIfFlag: 'manifest.debugMode',
          config: { name: 'Visible', type: Boolean }
        },
        {
          key: 'hiddenSetting',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Hidden', type: Boolean }
        },
        {
          key: 'anotherVisibleSetting',
          showOnlyIfFlag: null,
          config: { name: 'Another Visible', type: Boolean }
        }
      ];

      const result = parser.parse(settings);

      expect(result.processed).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.parsed).toEqual(['visibleSetting', 'anotherVisibleSetting']);
      expect(result.failed).toEqual(['hiddenSetting']);
    });
  });

  describe('Planned vs Unplanned failure reporting', () => {
    let parser;
    const mockConfig = {
      constants: { settings: { requiredKeys: ['key', 'config.name', 'config.type'] } },
      manifest: { debugMode: true, dev: false }
    };
    const mockUtils = {
      formatError: (e) => String(e),
      logWarning: vi.fn(),
      logDebug: vi.fn()
    };
    const mockContext = {};

    beforeEach(() => {
      parser = new SettingsParser(mockConfig, mockUtils, mockContext);
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should differentiate mixed planned and unplanned failures', () => {
      // First setting: valid and should show
      SettingsChecker.check.mockReturnValueOnce(true);
      FlagEvaluator.shouldShow.mockReturnValueOnce(true);

      // Second setting: valid but flag-hidden (planned exclusion)
      SettingsChecker.check.mockReturnValueOnce(true);
      FlagEvaluator.shouldShow.mockReturnValueOnce(false);

      // Third setting: invalid format (unplanned failure)
      SettingsChecker.check.mockReturnValueOnce(false);
      FlagEvaluator.shouldShow.mockReturnValueOnce(true);

      const settings = [
        {
          key: 'validSetting',
          showOnlyIfFlag: 'manifest.debugMode',
          config: { name: 'Valid', type: Boolean }
        },
        {
          key: 'plannedExcluded',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Planned', type: Boolean }
        },
        {
          key: 'unplannedFailed',
          config: { name: 'Invalid' } // Missing type - invalid
        }
      ];

      const result = parser.parse(settings);

      expect(result.processed).toBe(3);
      expect(result.successful).toBe(1);
      expect(result.parsed).toEqual(['validSetting']);
      expect(result.failed).toEqual(['plannedExcluded', 'unplannedFailed']);
      expect(result.plannedExcluded).toEqual(['plannedExcluded']);
      expect(result.unplannedFailed).toEqual(['unplannedFailed']);

      // Should log warning for mixed failures
      expect(mockUtils.logWarning).toHaveBeenCalledTimes(1);
      expect(mockUtils.logDebug).not.toHaveBeenCalled();
    });

    it('should handle planned-only exclusions with debug logging', () => {
      // First setting: valid and should show
      SettingsChecker.check.mockReturnValueOnce(true);
      FlagEvaluator.shouldShow.mockReturnValueOnce(true);

      // Second setting: valid but flag-hidden (planned exclusion)
      SettingsChecker.check.mockReturnValueOnce(true);
      FlagEvaluator.shouldShow.mockReturnValueOnce(false);

      const settings = [
        {
          key: 'validSetting',
          showOnlyIfFlag: 'manifest.debugMode',
          config: { name: 'Valid', type: Boolean }
        },
        {
          key: 'plannedExcluded',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Planned', type: Boolean }
        }
      ];

      const result = parser.parse(settings);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.parsed).toEqual(['validSetting']);
      expect(result.failed).toEqual(['plannedExcluded']);
      expect(result.plannedExcluded).toEqual(['plannedExcluded']);
      expect(result.unplannedFailed).toEqual([]);

      // Should log debug for planned-only exclusions
      expect(mockUtils.logDebug).toHaveBeenCalledTimes(1);
      expect(mockUtils.logWarning).not.toHaveBeenCalled();
    });

    it('should handle all-success scenarios without logging', () => {
      SettingsChecker.check.mockReturnValue(true);
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const settings = [
        {
          key: 'validSetting1',
          config: { name: 'Valid1', type: Boolean }
        },
        {
          key: 'validSetting2',
          config: { name: 'Valid2', type: String }
        }
      ];

      const result = parser.parse(settings);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.parsed).toEqual(['validSetting1', 'validSetting2']);
      expect(result.failed).toEqual([]);
      expect(result.plannedExcluded).toEqual([]);
      expect(result.unplannedFailed).toEqual([]);

      // No logging for all-success scenarios
      expect(mockUtils.logDebug).not.toHaveBeenCalled();
      expect(mockUtils.logWarning).not.toHaveBeenCalled();
    });

    it('should handle unplanned-only failures with warning logging', () => {
      // First setting: valid and should show
      SettingsChecker.check.mockReturnValueOnce(true);
      FlagEvaluator.shouldShow.mockReturnValueOnce(true);

      // Second setting: invalid format (unplanned failure)
      SettingsChecker.check.mockReturnValueOnce(false);
      FlagEvaluator.shouldShow.mockReturnValueOnce(true);

      const settings = [
        {
          key: 'validSetting',
          config: { name: 'Valid', type: Boolean }
        },
        {
          key: 'unplannedFailed',
          config: { name: 'Invalid' } // Missing type - invalid
        }
      ];

      const result = parser.parse(settings);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.parsed).toEqual(['validSetting']);
      expect(result.failed).toEqual(['unplannedFailed']);
      expect(result.plannedExcluded).toEqual([]);
      expect(result.unplannedFailed).toEqual(['unplannedFailed']);

      // Should warn about unplanned failures
      expect(mockUtils.logWarning).toHaveBeenCalledTimes(1);
      expect(mockUtils.logDebug).not.toHaveBeenCalled();
    });

    it('should ensure return object always includes planned and unplanned arrays', () => {
      SettingsChecker.check.mockReturnValue(true);
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const settings = [
        {
          key: 'validSetting',
          config: { name: 'Valid', type: Boolean }
        }
      ];

      const result = parser.parse(settings);

      // Ensure arrays are always present even when empty
      expect(result).toHaveProperty('plannedExcluded');
      expect(result).toHaveProperty('unplannedFailed');
      expect(Array.isArray(result.plannedExcluded)).toBe(true);
      expect(Array.isArray(result.unplannedFailed)).toBe(true);
    });
  });
});
