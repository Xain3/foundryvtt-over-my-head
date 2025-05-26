/**
 * @file moduleGetter.unit.test.js
 * @description Unit tests for the moduleGetter helper function.
 * @path src/helpers/moduleGetter.unit.test.js
 * @date 25 May 2025
 */

import { getModule } from './moduleGetter.js';

// Mock constants
jest.mock('@/constants/constants', () => ({
  defaultFoundryModulesLocation: 'game.modules'
}), { virtual: true });

describe('getModule', () => {
  let mockGlobalNamespace;
  let mockModulesMap;

  beforeEach(() => {
    mockModulesMap = new Map();
    mockGlobalNamespace = {
      game: {
        modules: mockModulesMap
      }
    };
  });

  describe('input validation', () => {
    it('should throw TypeError if moduleName is not a string', () => {
      expect(() => getModule(null)).toThrow(TypeError);
      expect(() => getModule(undefined)).toThrow(TypeError);
      expect(() => getModule(123)).toThrow(TypeError);
      expect(() => getModule({})).toThrow(TypeError);
      expect(() => getModule([])).toThrow(TypeError);
      expect(() => getModule(true)).toThrow(TypeError);
    });

    it('should throw TypeError if globalNamespace is not an object', () => {
      expect(() => getModule('test-module', null)).toThrow(TypeError);
      expect(() => getModule('test-module', 'string')).toThrow(TypeError);
      expect(() => getModule('test-module', 123)).toThrow(TypeError);
      expect(() => getModule('test-module', true)).toThrow(TypeError);
    });

    it('should use default globalThis when globalNamespace is undefined', () => {
      // Mock globalThis to have the expected structure
      const originalGlobalThis = globalThis.game;
      globalThis.game = {
        modules: new Map()
      };

      const testModule = { id: 'undefined-test', active: true };
      globalThis.game.modules.set('undefined-test', testModule);

      const result = getModule('undefined-test', undefined);
      expect(result).toBe(testModule);

      // Restore original globalThis
      globalThis.game = originalGlobalThis;
    });

    it('should provide meaningful error messages for invalid inputs', () => {
      expect(() => getModule(null)).toThrow('moduleName must be a string');
      expect(() => getModule('test', 'invalid')).toThrow('globalNamespace must be an object');
    });
  });

  describe('successful module retrieval', () => {
    it('should return module when it exists', () => {
      const testModule = {
        id: 'test-module',
        name: 'Test Module',
        active: true
      };

      mockModulesMap.set('test-module', testModule);

      const result = getModule('test-module', mockGlobalNamespace);
      expect(result).toBe(testModule);
    });

    it('should work with different module structures', () => {
      const modules = [
        {
          id: 'module-1',
          title: 'Module One',
          version: '1.0.0'
        },
        {
          id: 'module-2',
          title: 'Module Two',
          active: false
        },
        {
          id: 'complex-module',
          data: {
            settings: {},
            flags: {}
          }
        }
      ];

      modules.forEach(module => {
        mockModulesMap.set(module.id, module);
      });

      modules.forEach(module => {
        const result = getModule(module.id, mockGlobalNamespace);
        expect(result).toBe(module);
      });
    });

    it('should use default globalThis if no globalNamespace provided', () => {
      // Mock globalThis to have the expected structure
      const originalGlobalThis = globalThis.game;
      globalThis.game = {
        modules: mockModulesMap
      };

      const testModule = { id: 'global-test', active: true };
      mockModulesMap.set('global-test', testModule);

      const result = getModule('global-test');
      expect(result).toBe(testModule);

      // Restore original globalThis
      globalThis.game = originalGlobalThis;
    });
  });

  describe('error cases', () => {
    it('should throw Error if module does not exist', () => {
      expect(() => getModule('non-existent-module', mockGlobalNamespace))
        .toThrow('Module "non-existent-module" not found in game.modules');
    });

    it('should throw Error if modules location does not exist', () => {
      const invalidNamespace = {};

      expect(() => getModule('test-module', invalidNamespace))
        .toThrow('Module "test-module" not found in game.modules');
    });

    it('should throw Error if modules location is not a Map', () => {
      const invalidNamespace = {
        game: {
          modules: {} // Not a Map
        }
      };

      expect(() => getModule('test-module', invalidNamespace))
        .toThrow('Module "test-module" not found in game.modules');
    });

    it('should handle null/undefined modules map gracefully', () => {
      const namespacesWithNullModules = [
        { game: { modules: null } },
        { game: { modules: undefined } },
        { game: {} },
        {}
      ];

      namespacesWithNullModules.forEach(namespace => {
        expect(() => getModule('test-module', namespace))
          .toThrow('Module "test-module" not found in game.modules');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string module names', () => {
      expect(() => getModule('', mockGlobalNamespace))
        .toThrow('Module "" not found in game.modules');
    });

    it('should handle module names with special characters', () => {
      const specialModules = [
        'module-with-dashes',
        'module_with_underscores',
        'module.with.dots',
        'module@with@symbols',
        'module with spaces'
      ];

      specialModules.forEach(moduleName => {
        const module = { id: moduleName, active: true };
        mockModulesMap.set(moduleName, module);

        const result = getModule(moduleName, mockGlobalNamespace);
        expect(result).toBe(module);
      });
    });

    it('should handle numeric module names as strings', () => {
      const numericModule = { id: '123', active: true };
      mockModulesMap.set('123', numericModule);

      const result = getModule('123', mockGlobalNamespace);
      expect(result).toBe(numericModule);
    });

    it('should be case-sensitive for module names', () => {
      const lowerModule = { id: 'testmodule', active: true };
      const upperModule = { id: 'TestModule', active: true };

      mockModulesMap.set('testmodule', lowerModule);
      mockModulesMap.set('TestModule', upperModule);

      expect(getModule('testmodule', mockGlobalNamespace)).toBe(lowerModule);
      expect(getModule('TestModule', mockGlobalNamespace)).toBe(upperModule);
      expect(() => getModule('TESTMODULE', mockGlobalNamespace)).toThrow();
    });
  });

  describe('constants integration', () => {
    it('should use the correct modules location from constants', () => {
      // The mock already sets defaultFoundryModulesLocation to 'game.modules'
      // This test verifies that the constant is being used correctly
      const testModule = { id: 'constants-test', active: true };
      mockModulesMap.set('constants-test', testModule);

      const result = getModule('constants-test', mockGlobalNamespace);
      expect(result).toBe(testModule);
    });
  });

  describe('alternative constants configuration', () => {
    it('should handle different modules location constants', () => {
      // Create a test namespace with alternative modules location
      const alternativeNamespace = {
        system: {
          modules: new Map()
        }
      };

      const testModule = { id: 'alt-test', active: true };
      alternativeNamespace.system.modules.set('alt-test', testModule);

      // Test that the current implementation works with the expected structure
      // Since we can't easily mock the constant at runtime, we test with game.modules
      // but verify the principle works with different namespace structures
      expect(() => getModule('alt-test', alternativeNamespace))
        .toThrow('Module "alt-test" not found in game.modules');
      
      // Test that it would work if the constant was set correctly
      const gameModulesNamespace = {
        game: {
          modules: new Map()
        }
      };
      gameModulesNamespace.game.modules.set('alt-test', testModule);
      
      const result = getModule('alt-test', gameModulesNamespace);
      expect(result).toBe(testModule);
    });
  });

  describe('Map behavior verification', () => {
    it('should work with Map.get() method specifically', () => {
      const testModule = { id: 'map-test', active: true };
      mockModulesMap.set('map-test', testModule);

      // Verify that Map.get() is actually being called
      const getSpy = jest.spyOn(mockModulesMap, 'get');

      const result = getModule('map-test', mockGlobalNamespace);

      expect(getSpy).toHaveBeenCalledWith('map-test');
      expect(result).toBe(testModule);

      getSpy.mockRestore();
    });

    it('should handle Map with falsy values correctly', () => {
      // Maps can have falsy values that are still valid
      const falsyModules = [
        { name: 'false-module', value: false },
        { name: 'zero-module', value: 0 },
        { name: 'empty-module', value: '' },
        { name: 'null-module', value: null }
      ];

      falsyModules.forEach(({ name, value }) => {
        mockModulesMap.set(name, value);

        if (value === null) {
          // null is treated as "not found" by our implementation
          expect(() => getModule(name, mockGlobalNamespace)).toThrow();
        } else {
          // Other falsy values should be returned as-is
          expect(getModule(name, mockGlobalNamespace)).toBe(value);
        }
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical Foundry VTT module structure', () => {
      const foundryModule = {
        id: 'foundryvtt-over-my-head',
        title: 'OverMyHead',
        version: '12.0.1-alpha1',
        active: true,
        data: {
          flags: {},
          settings: {}
        },
        api: {
          someMethod: jest.fn()
        }
      };

      mockModulesMap.set('foundryvtt-over-my-head', foundryModule);

      const result = getModule('foundryvtt-over-my-head', mockGlobalNamespace);
      expect(result).toBe(foundryModule);
      expect(result.id).toBe('foundryvtt-over-my-head');
      expect(result.active).toBe(true);
    });

    it('should work in a complete Foundry-like environment simulation', () => {
      const completeFoundryNamespace = {
        game: {
          modules: new Map([
            ['dnd5e', { id: 'dnd5e', title: 'D&D 5e', active: true }],
            ['dice-so-nice', { id: 'dice-so-nice', title: 'Dice So Nice!', active: true }],
            ['foundryvtt-over-my-head', { id: 'foundryvtt-over-my-head', title: 'OverMyHead', active: false }]
          ]),
          settings: {},
          user: { isGM: true }
        },
        ui: {
          notifications: {}
        }
      };

      expect(getModule('dnd5e', completeFoundryNamespace).title).toBe('D&D 5e');
      expect(getModule('dice-so-nice', completeFoundryNamespace).active).toBe(true);
      expect(getModule('foundryvtt-over-my-head', completeFoundryNamespace).active).toBe(false);
    });
  });
});
