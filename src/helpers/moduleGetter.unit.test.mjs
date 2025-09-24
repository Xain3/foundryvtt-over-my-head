/**
 * @file moduleGetter.test.js
 * @description This file contains unit tests for the getModule function.
 * @path src/helpers/moduleGetter.test.js
 */

// Mock config before any imports
jest.mock('@config', () => ({
  constants: {
    moduleManagement: {
      defaults: {
        modulesLocation: 'game.modules'
      }
    }
  }
}));

jest.mock('./pathUtils.mjs');

import { getModule } from './moduleGetter.mjs';
import PathUtils from './pathUtils.mjs';
import config from '@config';

// Get constants from the mocked config
const constants = config.constants;

describe('getModule', () => {
  let mockGlobalNamespace;
  let mockModulesCollection;

  beforeEach(() => {
    mockModulesCollection = {
      get: jest.fn()
    };
    mockGlobalNamespace = {
      game: {
        modules: mockModulesCollection
      }
    };

    // Set up PathUtils mock
    PathUtils.resolvePath = jest.fn();

    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should throw TypeError when moduleName is not a string', () => {
      expect(() => getModule(123)).toThrow(TypeError);
      expect(() => getModule(123)).toThrow('moduleName must be a string');
    });

    it('should throw TypeError when moduleName is null', () => {
      expect(() => getModule(null)).toThrow(TypeError);
      expect(() => getModule(null)).toThrow('moduleName must be a string');
    });

    it('should throw TypeError when moduleName is undefined', () => {
      expect(() => getModule(undefined)).toThrow(TypeError);
      expect(() => getModule(undefined)).toThrow('moduleName must be a string');
    });

    it('should throw TypeError when globalNamespace is null', () => {
      expect(() => getModule('test-module', null)).toThrow(TypeError);
      expect(() => getModule('test-module', null)).toThrow('globalNamespace must be an object');
    });

    it('should throw TypeError when globalNamespace is not an object', () => {
      expect(() => getModule('test-module', 'not-object')).toThrow(TypeError);
      expect(() => getModule('test-module', 123)).toThrow(TypeError);
      expect(() => getModule('test-module', true)).toThrow(TypeError);
    });
  });

  describe('Successful Cases', () => {
    it('should return module when found in collection', () => {
      const mockModule = { id: 'test-module', active: true };
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(mockModule);

      const result = getModule('test-module', mockGlobalNamespace);

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.modules', true);
      expect(mockModulesCollection.get).toHaveBeenCalledWith('test-module');
      expect(result).toBe(mockModule);
    });

    it('should accept empty string as moduleName', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      const result = getModule('', mockGlobalNamespace);

      expect(mockModulesCollection.get).toHaveBeenCalledWith('');
      expect(result).toBeNull();
    });

    it('should use globalThis as default namespace', () => {
      const originalGlobalThis = globalThis;
      globalThis.game = { modules: mockModulesCollection };
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      getModule('test-module');

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(globalThis, 'game.modules', true);

      globalThis.game = originalGlobalThis.game;
    });
  });

  describe('Error Cases', () => {
    it('should return null when modules collection is not found', () => {
      PathUtils.resolvePath.mockReturnValue(null);

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });

    it('should return null when modules collection does not have get method', () => {
      PathUtils.resolvePath.mockReturnValue({});

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });

    it('should return null when modules collection get method is not a function', () => {
      PathUtils.resolvePath.mockReturnValue({ get: 'not-a-function' });

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });

    it('should return null when module is not found in collection', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(undefined);

      const result = getModule('non-existent-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle module names with special characters', () => {
      const specialModuleName = 'my-module_v2.0@test';
      const mockModule = { id: specialModuleName };
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(mockModule);

      const result = getModule(specialModuleName, mockGlobalNamespace);

      expect(mockModulesCollection.get).toHaveBeenCalledWith(specialModuleName);
      expect(result).toBe(mockModule);
    });

    it('should handle very long module names', () => {
      const longModuleName = 'a'.repeat(1000);
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      const result = getModule(longModuleName, mockGlobalNamespace);

      expect(mockModulesCollection.get).toHaveBeenCalledWith(longModuleName);
      expect(result).toBeNull();
    });

    it('should handle modules collection that throws on get', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockImplementation(() => {
        throw new Error('Collection error');
      });

      expect(() => getModule('test-module', mockGlobalNamespace)).toThrow('Collection error');
    });
  });

  describe('Constants Integration', () => {
    it('should use moduleManagement.defaults.modulesLocation from constants', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      getModule('test-module', mockGlobalNamespace);

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, constants.moduleManagement.defaults.modulesLocation, true);
    });

    it('should fallback to game.modules when constants.moduleManagement.defaults.modulesLocation is undefined', () => {
      const originalConstant = constants.moduleManagement.defaults.modulesLocation;
      constants.moduleManagement.defaults.modulesLocation = undefined;

      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      getModule('test-module', mockGlobalNamespace);

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.modules', true);

      constants.moduleManagement.defaults.modulesLocation = originalConstant;
    });
  });

  describe('Alternative Constants Configuration', () => {
    it('should work with different modules location from constants', () => {
      const originalConstant = constants.moduleManagement.defaults.modulesLocation;
      constants.moduleManagement.defaults.modulesLocation = 'custom.modules.location';

      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(null);

      getModule('test-module', mockGlobalNamespace);

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'custom.modules.location', true);

      constants.moduleManagement.defaults.modulesLocation = originalConstant;
    });
  });

  describe('Map Behaviour Modification', () => {
    it('should handle Map-like collection with custom get behavior', () => {
      const mapLikeCollection = new Map();
      mapLikeCollection.set('test-module', { id: 'test-module', data: 'test' });

      PathUtils.resolvePath.mockReturnValue(mapLikeCollection);

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toEqual({ id: 'test-module', data: 'test' });
    });

    it('should handle collection with get method that returns falsy values', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(false);

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });

    it('should handle collection with get method that returns 0', () => {
      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(0);

      const result = getModule('test-module', mockGlobalNamespace);

      expect(result).toBeNull();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should retrieve active Foundry VTT module', () => {
      const foundryModule = {
        id: 'dice-so-nice',
        title: 'Dice So Nice!',
        active: true,
        version: '4.2.6'
      };

      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(foundryModule);

      const result = getModule('dice-so-nice', mockGlobalNamespace);

      expect(result).toEqual(foundryModule);
      expect(result.active).toBe(true);
    });

    it('should handle inactive module retrieval', () => {
      const inactiveModule = {
        id: 'some-module',
        title: 'Some Module',
        active: false
      };

      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue(inactiveModule);

      const result = getModule('some-module', mockGlobalNamespace);

      expect(result).toEqual(inactiveModule);
      expect(result.active).toBe(false);
    });

    it('should handle module lookup in different game systems', () => {
      const customNamespace = {
        foundry: {
          modules: mockModulesCollection
        }
      };

      const originalConstant = constants.moduleManagement.defaults.modulesLocation;
      constants.moduleManagement.defaults.modulesLocation = 'foundry.modules';

      PathUtils.resolvePath.mockReturnValue(mockModulesCollection);
      mockModulesCollection.get.mockReturnValue({ id: 'system-module' });

      const result = getModule('system-module', customNamespace);

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(customNamespace, 'foundry.modules', true);
      expect(result).toEqual({ id: 'system-module' });

      constants.moduleManagement.defaults.modulesLocation = originalConstant;
    });

    it('should handle case where resolvePath throws an error', () => {
      PathUtils.resolvePath.mockImplementation(() => {
        throw new Error('Path resolution failed');
      });

      expect(() => getModule('test-module', mockGlobalNamespace)).toThrow('Path resolution failed');
    });
  });
});