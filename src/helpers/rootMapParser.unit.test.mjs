import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock config before importing anything else
vi.mock('#config', () => ({
  default: {
    constants: {
      moduleManagement: {
        defaults: {
          modulesLocation: 'game.modules'
        }
      }
    },
    manifest: {
      id: 'test-module-id'
    }
  }
}));

vi.mock('#utils/static/validator.mjs', () => ({
  default: {
    validateObject: vi.fn(),
    validateString: vi.fn()
  },
  validateObject: vi.fn(),
  validateString: vi.fn()
}));

vi.mock('./pathUtils.mjs', () => ({
  default: {
    resolvePath: vi.fn()
  }
}));

vi.mock('./moduleGetter.mjs', () => ({
  getModule: vi.fn()
}));

import RootMapParser from './rootMapParser.mjs';
import PathUtils from './pathUtils.mjs';
import { getModule } from './moduleGetter.mjs';
import Validator from '#utils/static/validator.mjs';

// Create a local config object for test assertions
const config = {
  manifest: {
    id: 'test-module-id'
  }
};

const manifest = config.manifest;


describe('RootMapParser', () => {
  let mockNamespace;
  let mockRootMap;

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockNamespace = {
      game: {
        modules: new Map()
      }
    };
    mockRootMap = {
      element: 'game.ui.notifications',
      module: 'test-module',
      data: { nested: 'game.data.nested' }
    };

    // Set up PathUtils mock
    PathUtils.resolvePath = vi.fn();

    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate rootMap parameter', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'test-module', active: true });

      RootMapParser.parse({ rootMap: mockRootMap });
      expect(Validator.validateObject).toHaveBeenCalledWith(mockRootMap, 'rootMap');
    });

    it('should validate key parameter when provided', () => {
      PathUtils.resolvePath.mockReturnValue({ notify: vi.fn() });

      RootMapParser.parse({ rootMap: mockRootMap, key: 'element' });
      expect(Validator.validateString).toHaveBeenCalledWith('element', 'key');
    });

    it('should validate namespace parameter', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'test-module', active: true });

      RootMapParser.parse({ rootMap: mockRootMap, namespace: mockNamespace });
      expect(Validator.validateObject).toHaveBeenCalledWith(mockNamespace, 'namespace');
    });

    it('should validate module parameter', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'custom-module', active: true });

      RootMapParser.parse({ rootMap: mockRootMap, module: 'custom-module' });
      expect(Validator.validateString).toHaveBeenCalledWith('custom-module', 'module');
    });

    it('should use default namespace when not provided', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'test-module', active: true });

      RootMapParser.parse({ rootMap: mockRootMap });
      expect(Validator.validateObject).toHaveBeenCalledWith(globalThis, 'namespace');
    });

    it('should use manifest ID as default module', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'test-module', active: true });

      RootMapParser.parse({ rootMap: mockRootMap });
      expect(Validator.validateString).toHaveBeenCalledWith(config.manifest.id, 'module');
    });
  });

  describe('Successful Cases', () => {
    it('should parse entire root map with string values', () => {
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui.notifications') return { notify: vi.fn() };
        if (path === 'game.data.nested') return { value: 'test' };
        return null;
      });
      getModule.mockReturnValue({ id: 'test-module', active: true });

      const result = RootMapParser.parse({ rootMap: mockRootMap, namespace: mockNamespace });

      expect(result).toEqual({
        element: { notify: expect.any(Function) },
        module: { id: 'test-module', active: true },
        data: { nested: { value: 'test' } }
      });
    });

    it('should parse specific key from root map', () => {
      PathUtils.resolvePath.mockReturnValue({ notify: vi.fn() });

      const result = RootMapParser.parse({
        rootMap: mockRootMap,
        key: 'element',
        namespace: mockNamespace
      });

      expect(result).toEqual({ notify: expect.any(Function) });
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, 'game.ui.notifications', true);
    });

    it('should handle null values in root map', () => {
      const rootMapWithNull = { element: null, other: 'game.ui' };
      PathUtils.resolvePath.mockReturnValue({ ui: true });

      const result = RootMapParser.parse({
        rootMap: rootMapWithNull,
        namespace: mockNamespace
      });

      expect(result).toEqual({
        element: null,
        other: { ui: true }
      });
    });

    it('should parse nested objects recursively', () => {
      const nestedRootMap = {
        level1: {
          level2: {
            element: 'game.nested.element'
          }
        }
      };
      PathUtils.resolvePath.mockReturnValue({ nested: true });

      const result = RootMapParser.parse({
        rootMap: nestedRootMap,
        namespace: mockNamespace
      });

      expect(result).toEqual({
        level1: {
          level2: {
            element: { nested: true }
          }
        }
      });
    });

    it('should handle module key specially', () => {
      const moduleMap = { module: 'special-module' };
      getModule.mockReturnValue({ id: 'special-module', data: 'test' });

      const result = RootMapParser.parse({
        rootMap: moduleMap,
        namespace: mockNamespace,
        module: 'special-module'
      });

      expect(result).toEqual({
        module: { id: 'special-module', data: 'test' }
      });
      expect(getModule).toHaveBeenCalledWith('special-module', mockNamespace);
    });
  });

  describe('Error Cases', () => {
    it('should throw error when key not found in root map', () => {
      expect(() => {
        RootMapParser.parse({
          rootMap: mockRootMap,
          key: 'nonexistent',
          namespace: mockNamespace
        });
      }).toThrow('Key "nonexistent" not found in rootMap');
    });

    it('should throw error when module not found', () => {
      getModule.mockReturnValue(null);

      expect(() => {
        RootMapParser.parse({
          rootMap: { module: 'missing-module' },
          namespace: mockNamespace
        });
      }).toThrow('Module "test-module-id" not found in namespace');
    });

    it('should throw error when path cannot be resolved', () => {
      PathUtils.resolvePath.mockReturnValue(undefined);

      expect(() => {
        RootMapParser.parse({
          rootMap: { element: 'invalid.path' },
          namespace: mockNamespace
        });
      }).toThrow('Path "invalid.path" could not be resolved for key "element"');
    });

    it('should throw error for invalid value types', () => {
      const invalidRootMap = { number: 123, boolean: true, func: () => {} };

      expect(() => {
        RootMapParser.parse({
          rootMap: invalidRootMap,
          namespace: mockNamespace
        });
      }).toThrow('Invalid value type for key "number": number');
    });

    it('should propagate resolvePath errors', () => {
      PathUtils.resolvePath.mockImplementation(() => {
        throw new Error('Resolution failed');
      });

      expect(() => {
        RootMapParser.parse({
          rootMap: { element: 'game.path' },
          namespace: mockNamespace
        });
      }).toThrow('Resolution failed');
    });

    it('should propagate getModule errors', () => {
      getModule.mockImplementation(() => {
        throw new Error('Module retrieval failed');
      });

      expect(() => {
        RootMapParser.parse({
          rootMap: { module: 'failing-module' },
          namespace: mockNamespace
        });
      }).toThrow('Module retrieval failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty root map', () => {
      const result = RootMapParser.parse({
        rootMap: {},
        namespace: mockNamespace
      });

      expect(result).toEqual({});
    });

    it('should handle root map with only null values', () => {
      const nullRootMap = { a: null, b: null, c: null };

      const result = RootMapParser.parse({
        rootMap: nullRootMap,
        namespace: mockNamespace
      });

      expect(result).toEqual({ a: null, b: null, c: null });
    });

    it('should handle deeply nested objects', () => {
      const deepMap = {
        level1: {
          level2: {
            level3: {
              level4: 'game.deep.path'
            }
          }
        }
      };
      PathUtils.resolvePath.mockReturnValue({ deep: 'value' });

      const result = RootMapParser.parse({
        rootMap: deepMap,
        namespace: mockNamespace
      });

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              level4: { deep: 'value' }
            }
          }
        }
      });
    });

    it('should handle mixed value types in nested objects', () => {
      const mixedMap = {
        config: {
          element: 'game.ui',
          enabled: null,
          nested: {
            path: 'game.nested'
          }
        }
      };
      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.ui') return { ui: true };
        if (path === 'game.nested') return { nested: true };
        return null;
      });

      const result = RootMapParser.parse({
        rootMap: mixedMap,
        namespace: mockNamespace
      });

      expect(result).toEqual({
        config: {
          element: { ui: true },
          enabled: null,
          nested: {
            path: { nested: true }
          }
        }
      });
    });

    it('should handle empty string paths', () => {
      PathUtils.resolvePath.mockReturnValue(mockNamespace);

      const result = RootMapParser.parse({
        rootMap: { root: '' },
        namespace: mockNamespace
      });

      expect(result).toEqual({ root: mockNamespace });
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, '', true);
    });

    it('should handle special characters in keys', () => {
      const specialMap = {
        'key-with-dashes': 'game.path',
        'key_with_underscores': 'game.other',
        'key.with.dots': null
      };
      PathUtils.resolvePath.mockImplementation((namespace, path) => ({ resolved: path }));

      const result = RootMapParser.parse({
        rootMap: specialMap,
        namespace: mockNamespace
      });

      expect(result).toEqual({
        'key-with-dashes': { resolved: 'game.path' },
        'key_with_underscores': { resolved: 'game.other' },
        'key.with.dots': null
      });
    });
  });

  describe('Constants Integration', () => {
    it('should use manifest ID as default module', () => {
      PathUtils.resolvePath.mockReturnValue({ test: true });

      RootMapParser.parse({
        rootMap: { element: 'game.test' },
        namespace: mockNamespace
      });

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, 'game.test', true);
    });

    it('should handle undefined manifest ID', () => {
      const originalId = config.manifest.id;
      config.manifest.id = undefined;

      PathUtils.resolvePath.mockReturnValue({ test: true });

      RootMapParser.parse({
        rootMap: { element: 'game.test' },
        namespace: mockNamespace
      });

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, 'game.test', true);

      config.manifest.id = originalId;
    });
  });

  describe('Alternative Constants Configuration', () => {
    it('should work with different manifest configurations', () => {
      const originalId = manifest.id;
      manifest.id = 'alternative-module';

      PathUtils.resolvePath.mockReturnValue({ alternative: true });

      RootMapParser.parse({
        rootMap: { element: 'game.alternative' },
        namespace: mockNamespace
      });

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, 'game.alternative', true);

      manifest.id = originalId;
    });

    it('should override default module with provided module parameter', () => {
      PathUtils.resolvePath.mockReturnValue({ custom: true });

      RootMapParser.parse({
        rootMap: { element: 'game.custom' },
        namespace: mockNamespace,
        module: 'custom-module-override'
      });

      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockNamespace, 'game.custom', true);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should parse Foundry VTT UI configuration', () => {
      const foundryConfig = {
        notifications: 'game.ui.notifications',
        module: 'dice-so-nice',
        settings: 'game.settings',
        hooks: 'game.hooks'
      };

      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        const mockObjects = {
          'game.ui.notifications': { notify: vi.fn(), warn: vi.fn() },
          'game.settings': { get: vi.fn(), set: vi.fn() },
          'game.hooks': { on: vi.fn(), off: vi.fn() }
        };
        return mockObjects[path];
      });

      getModule.mockReturnValue({
        id: 'dice-so-nice',
        active: true,
        api: { showForRoll: vi.fn() }
      });

      const result = RootMapParser.parse({
        rootMap: foundryConfig,
        namespace: mockNamespace
      });

      expect(result.notifications).toHaveProperty('notify');
      expect(result.notifications).toHaveProperty('warn');
      expect(result.module).toHaveProperty('id', 'dice-so-nice');
      expect(result.module).toHaveProperty('active', true);
      expect(result.settings).toHaveProperty('get');
      expect(result.hooks).toHaveProperty('on');
    });

    it('should handle module dependency resolution', () => {
      const dependencyConfig = {
        primaryModule: 'main-module',
        dependentElement: 'game.modules.get("dependency").api'
      };

      getModule.mockReturnValue({
        id: 'main-module',
        dependencies: ['dependency']
      });

      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'main-module') {
          return { id: 'main-module', dependencies: ['dependency'] };
        }
        return { someMethod: vi.fn() };
      });

      const result = RootMapParser.parse({
        rootMap: dependencyConfig,
        namespace: mockNamespace,
        module: 'main-module'
      });

      expect(result.primaryModule).toHaveProperty('id', 'main-module');
      expect(result.dependentElement).toHaveProperty('someMethod');
    });

    it('should parse complex nested configuration', () => {
      const complexConfig = {
        ui: {
          dialogs: 'game.ui.dialogs',
          windows: 'game.ui.windows',
          notifications: {
            info: 'game.ui.notifications.info',
            error: 'game.ui.notifications.error'
          }
        },
        data: {
          actors: 'game.actors',
          items: null,
          scenes: 'game.scenes'
        }
      };

      PathUtils.resolvePath.mockImplementation((namespace, path) => ({ mocked: path }));

      const result = RootMapParser.parse({
        rootMap: complexConfig,
        namespace: mockNamespace
      });

      expect(result.ui.dialogs).toEqual({ mocked: 'game.ui.dialogs' });
      expect(result.ui.notifications.info).toEqual({ mocked: 'game.ui.notifications.info' });
      expect(result.ui.notifications.error).toEqual({ mocked: 'game.ui.notifications.error' });
      expect(result.data.actors).toEqual({ mocked: 'game.actors' });
      expect(result.data.items).toBeNull();
      expect(result.data.scenes).toEqual({ mocked: 'game.scenes' });
    });

    it('should handle error recovery in complex parsing', () => {
      const partialConfig = {
        validPath: 'game.valid',
        invalidPath: 'game.invalid',
        anotherValid: 'game.another'
      };

      PathUtils.resolvePath.mockImplementation((namespace, path) => {
        if (path === 'game.invalid') return undefined;
        return { valid: true };
      });

      expect(() => {
        RootMapParser.parse({
          rootMap: partialConfig,
          namespace: mockNamespace
        });
      }).toThrow('Path "game.invalid" could not be resolved for key "invalidPath"');
    });

    it('should handle circular reference detection', () => {
      const circularConfig = {
        level1: {
          level2: {
            element: 'game.circular'
          }
        }
      };

      PathUtils.resolvePath.mockReturnValue({ circular: true });

      const result = RootMapParser.parse({
        rootMap: circularConfig,
        namespace: mockNamespace
      });

      expect(result.level1.level2.element).toEqual({ circular: true });
    });
  });
});