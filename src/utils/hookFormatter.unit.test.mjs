/**
 * @file hookFormatter.unit.test.js
 * @description Unit tests for the HookFormatter utility class.
 * @path src/utils/hookFormatter.unit.test.js
 */

import HookFormatter from './hookFormatter.mjs';

describe('HookFormatter', () => {
  let validConstants;
  let validManifest;
  let mockFormatError;

  beforeEach(() => {
    validConstants = {
      hooks: {
        'ready': '.ready',
        'init': '.init',
        'render': '.render',
        'close': '.close',
        'update': '.update',
        'hook_with_underscores': '.hook_with_underscores',
        'hook123': '.hook123'
      }
    };

    validManifest = {
      shortName: 'OMH',
      title: 'Over My Head',
      version: '1.0.0'
    };

    mockFormatError = jest.fn().mockImplementation((message, options) => {
      if (options && options.includeCaller && options.caller) {
        return `OMH ${options.caller}: ${message}`;
      }
      return `OMH: ${message}`;
    });
  });

  describe('Constructor', () => {
    describe('Input validation', () => {
      it('should throw error when constants is null', () => {
        expect(() => new HookFormatter(null, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid arguments provided');
      });

      it('should throw error when constants is undefined', () => {
        expect(() => new HookFormatter(undefined, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid arguments provided');
      });

      it('should throw error when manifest is null', () => {
        expect(() => new HookFormatter(validConstants, null, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid arguments provided');
      });

      it('should throw error when manifest is undefined', () => {
        expect(() => new HookFormatter(validConstants, undefined, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid arguments provided');
      });

      it('should throw error when both constants and manifest are null', () => {
        expect(() => new HookFormatter(null, null, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid arguments provided');
      });
    });

    describe('Manifest validation', () => {
      it('should throw error when manifest has no shortName property', () => {
        const invalidManifest = { title: 'Test', version: '1.0.0' };
        expect(() => new HookFormatter(validConstants, invalidManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid manifest provided. It must have a shortName property of type string');
      });

      it('should throw error when manifest shortName is null', () => {
        const invalidManifest = { shortName: null, title: 'Test' };
        expect(() => new HookFormatter(validConstants, invalidManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid manifest provided. It must have a shortName property of type string');
      });

      it('should throw error when manifest shortName is not a string', () => {
        const invalidManifest = { shortName: 123, title: 'Test' };
        expect(() => new HookFormatter(validConstants, invalidManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid manifest provided. It must have a shortName property of type string');
      });

      it('should throw error when manifest shortName is an empty string', () => {
        const invalidManifest = { shortName: '', title: 'Test' };
        expect(() => new HookFormatter(validConstants, invalidManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Invalid manifest provided. It must have a shortName property of type string');
      });
    });

    describe('Constants validation', () => {
      it('should throw error when constants has no hooks property', () => {
        const invalidConstants = { other: 'value' };
        expect(() => new HookFormatter(invalidConstants, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Constants must have a hooks property of type object');
      });

      it('should throw error when constants hooks is null', () => {
        const invalidConstants = { hooks: null };
        expect(() => new HookFormatter(invalidConstants, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Constants must have a hooks property of type object');
      });

      it('should throw error when constants hooks is not an object', () => {
        const invalidConstants = { hooks: 'string' };
        expect(() => new HookFormatter(invalidConstants, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Constants must have a hooks property of type object');
      });

      it('should throw error when constants hooks is an array', () => {
        const invalidConstants = { hooks: ['hook1', 'hook2'] };
        expect(() => new HookFormatter(invalidConstants, validManifest, mockFormatError))
          .toThrow('OMH HookFormatter: Constants must have a hooks property of type object');
      });
    });

    describe('Successful cases', () => {
      it('should create instance with valid arguments', () => {
        const formatter = new HookFormatter(validConstants, validManifest, mockFormatError);
        expect(formatter).toBeInstanceOf(HookFormatter);
        expect(formatter.constants).toBe(validConstants);
        expect(formatter.manifest).toBe(validManifest);
        expect(formatter.formatError).toBe(mockFormatError);
      });

      it('should create instance with empty hooks object', () => {
        const constantsWithEmptyHooks = { hooks: {} };
        const formatter = new HookFormatter(constantsWithEmptyHooks, validManifest, mockFormatError);
        expect(formatter).toBeInstanceOf(HookFormatter);
        expect(formatter.constants).toBe(constantsWithEmptyHooks);
      });

      it('should create instance with manifest containing extra properties', () => {
        const extendedManifest = {
          ...validManifest,
          extraProperty: 'value',
          anotherProperty: 123
        };
        const formatter = new HookFormatter(validConstants, extendedManifest, mockFormatError);
        expect(formatter).toBeInstanceOf(HookFormatter);
        expect(formatter.manifest).toBe(extendedManifest);
      });
    });
  });

  describe('formatHookName', () => {
    let formatter;

    beforeEach(() => {
      formatter = new HookFormatter(validConstants, validManifest, mockFormatError);
    });

    describe('Input validation', () => {
      it('should throw error when hookName is null', () => {
        expect(() => formatter.formatHookName(null))
          .toThrow('OMH HookFormatter: Invalid hookName provided');
      });

      it('should throw error when hookName is undefined', () => {
        expect(() => formatter.formatHookName(undefined))
          .toThrow('OMH HookFormatter: Invalid hookName provided');
      });

      it('should throw error when hookName is not a string', () => {
        expect(() => formatter.formatHookName(123))
          .toThrow('OMH HookFormatter: Invalid hookName provided');
      });

      it('should throw error when hookName is an empty string', () => {
        expect(() => formatter.formatHookName(''))
          .toThrow('OMH HookFormatter: Hook name cannot be empty or whitespace only');
      });

      it('should throw error when hookName is whitespace only', () => {
        expect(() => formatter.formatHookName('   '))
          .toThrow('OMH HookFormatter: Hook name cannot be empty or whitespace only');
      });

      it('should throw error when hookName contains invalid characters', () => {
        expect(() => formatter.formatHookName('hook-name'))
          .toThrow('OMH HookFormatter: Hook name must contain only alphanumeric characters and underscores');
      });

      it('should throw error when hookName contains spaces', () => {
        expect(() => formatter.formatHookName('hook name'))
          .toThrow('OMH HookFormatter: Hook name must contain only alphanumeric characters and underscores');
      });

      it('should throw error when hookName contains special characters', () => {
        expect(() => formatter.formatHookName('hook.name'))
          .toThrow('OMH HookFormatter: Hook name must contain only alphanumeric characters and underscores');

        expect(() => formatter.formatHookName('hook:name'))
          .toThrow('OMH HookFormatter: Hook name must contain only alphanumeric characters and underscores');

        expect(() => formatter.formatHookName('hook@name'))
          .toThrow('OMH HookFormatter: Hook name must contain only alphanumeric characters and underscores');
      });

      it('should throw error when hookName is not found in constants', () => {
        expect(() => formatter.formatHookName('nonexistent'))
          .toThrow('OMH HookFormatter: Hook "nonexistent" is not defined in constants');
      });

      it('should throw error when hookName with whitespace is not found in constants', () => {
        expect(() => formatter.formatHookName('  nonexistent  '))
          .toThrow('OMH HookFormatter: Hook "nonexistent" is not defined in constants');
      });
    });

    describe('Successful cases', () => {
      it('should format hook name correctly', () => {
        const result = formatter.formatHookName('ready');
        expect(result).toBe('OMH.ready');
      });

      it('should format different hook names correctly', () => {
        expect(formatter.formatHookName('init')).toBe('OMH.init');
        expect(formatter.formatHookName('render')).toBe('OMH.render');
        expect(formatter.formatHookName('close')).toBe('OMH.close');
        expect(formatter.formatHookName('update')).toBe('OMH.update');
      });

      it('should handle hook names with underscores and numbers', () => {
        expect(formatter.formatHookName('hook_with_underscores')).toBe('OMH.hook_with_underscores');
        expect(formatter.formatHookName('hook123')).toBe('OMH.hook123');
      });

      it('should handle mixed case hook names', () => {
        const mixedCaseConstants = {
          hooks: {
            'CamelCase': '.CamelCase',
            'mixedCase123': '.mixedCase123',
            'UPPER_CASE': '.UPPER_CASE'
          }
        };
        const mixedCaseFormatter = new HookFormatter(mixedCaseConstants, validManifest, mockFormatError);
        expect(mixedCaseFormatter.formatHookName('CamelCase')).toBe('OMH.CamelCase');
        expect(mixedCaseFormatter.formatHookName('mixedCase123')).toBe('OMH.mixedCase123');
        expect(mixedCaseFormatter.formatHookName('UPPER_CASE')).toBe('OMH.UPPER_CASE');
      });

      it('should handle hook names with whitespace', () => {
        const result = formatter.formatHookName('  ready  ');
        expect(result).toBe('OMH.ready');
      });

      it('should work with different manifest shortName', () => {
        const customManifest = { shortName: 'TEST' };
        const customFormatter = new HookFormatter(validConstants, customManifest, mockFormatError);
        const result = customFormatter.formatHookName('ready');
        expect(result).toBe('TEST.ready');
      });

      it('should work with different hook values', () => {
        const customConstants = {
          hooks: {
            'customHook': ':custom:hook',
            'anotherHook': '-another-hook'
          }
        };
        const customFormatter = new HookFormatter(customConstants, validManifest, mockFormatError);
        expect(customFormatter.formatHookName('customHook')).toBe('OMH:custom:hook');
        expect(customFormatter.formatHookName('anotherHook')).toBe('OMH-another-hook');
      });
    });

    describe('Edge cases', () => {
      it('should handle hook values that are empty strings', () => {
        const constantsWithEmptyHookValue = {
          hooks: { 'emptyHook': '' }
        };
        const customFormatter = new HookFormatter(constantsWithEmptyHookValue, validManifest, mockFormatError);
        const result = customFormatter.formatHookName('emptyHook');
        expect(result).toBe('OMH');
      });

      it('should handle special characters in hook values', () => {
        const constantsWithSpecialChars = {
          hooks: { 'specialHook': '.special:hook-with_chars' }
        };
        const customFormatter = new HookFormatter(constantsWithSpecialChars, validManifest, mockFormatError);
        const result = customFormatter.formatHookName('specialHook');
        expect(result).toBe('OMH.special:hook-with_chars');
      });

      it('should handle numeric hook values', () => {
        const constantsWithNumericValues = {
          hooks: { 'numericHook': '123' }
        };
        const customFormatter = new HookFormatter(constantsWithNumericValues, validManifest, mockFormatError);
        const result = customFormatter.formatHookName('numericHook');
        expect(result).toBe('OMH123');
      });
    });
  });

  describe('Constants integration', () => {
    it('should work with alternative constants configuration', () => {
      const alternativeConstants = {
        hooks: {
          'moduleReady': '.module.ready',
          'moduleInit': '.module.init',
          'dataUpdate': '.data.update'
        },
        otherProperty: 'value'
      };

      const formatter = new HookFormatter(alternativeConstants, validManifest, mockFormatError);
      expect(formatter.formatHookName('moduleReady')).toBe('OMH.module.ready');
      expect(formatter.formatHookName('moduleInit')).toBe('OMH.module.init');
      expect(formatter.formatHookName('dataUpdate')).toBe('OMH.data.update');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical FoundryVTT hook naming patterns', () => {
      const foundryConstants = {
        hooks: {
          'ready': '.ready',
          'init': '.init',
          'canvasReady': '.canvas.ready',
          'preCreateActor': '.preCreateActor',
          'createActor': '.createActor',
          'updateActor': '.updateActor',
          'deleteActor': '.deleteActor'
        }
      };

  const foundryManifest = { shortName: 'FVTT' };
  const formatter = new HookFormatter(foundryConstants, foundryManifest, mockFormatError);

      expect(formatter.formatHookName('ready')).toBe('FVTT.ready');
      expect(formatter.formatHookName('canvasReady')).toBe('FVTT.canvas.ready');
      expect(formatter.formatHookName('preCreateActor')).toBe('FVTT.preCreateActor');
    });

    it('should handle module-specific hook patterns', () => {
      const moduleConstants = {
        hooks: {
          'settingsChanged': '.settings.changed',
          'configOpened': '.config.opened',
          'dataLoaded': '.data.loaded',
          'errorOccurred': '.error.occurred'
        }
      };

      const moduleManifest = { shortName: 'MOD' };
  const formatter = new HookFormatter(moduleConstants, moduleManifest, mockFormatError);

      expect(formatter.formatHookName('settingsChanged')).toBe('MOD.settings.changed');
      expect(formatter.formatHookName('configOpened')).toBe('MOD.config.opened');
      expect(formatter.formatHookName('dataLoaded')).toBe('MOD.data.loaded');
      expect(formatter.formatHookName('errorOccurred')).toBe('MOD.error.occurred');
    });
  });
});
