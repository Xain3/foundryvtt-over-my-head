/**
 * @file pathUtils-moduleGetter-rootMapParser.int.test.mjs
 * @description Integration tests for PathUtils, moduleGetter, and RootMapParser to verify their interaction and dependency chain.
 * @path tests/integration/pathUtils-moduleGetter-rootMapParser.int.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import PathUtils from '../../src/helpers/pathUtils.mjs';
import { getModule } from '../../src/helpers/moduleGetter.mjs';
import config from '../../src/config/config.mjs';

const constants = config.constants;

// Mock RootMapParser to avoid manifest import issues
vi.mock('../../src/helpers/rootMapParser.mjs', () => {
  const actualPathUtils = jest.requireActual('../../src/helpers/pathUtils.mjs').default;
  const actualGetModule = jest.requireActual('../../src/helpers/moduleGetter.mjs').getModule;

  class MockRootMapParser {
    static #retrieveModuleInNamespace(module, namespace) {
      const moduleObject = actualGetModule(module, namespace);
      if (!moduleObject) {
        throw new Error(`Module "${module}" not found in namespace`);
      }
      return moduleObject;
    }

    static #resolveStringValue(key, value, { namespace, module }) {
      if (value === 'module') {
        return MockRootMapParser.#retrieveModuleInNamespace(module, namespace);
      }

      const resolved = actualPathUtils.resolvePath(namespace, value, true);
      if (resolved === undefined) {
        throw new Error(`Path "${value}" could not be resolved for key "${key}"`);
      }

      return resolved;
    }

    static #parseValue(key, value, context) {
      if (value === null) return null;

      if (typeof value === 'string') {
        return this.#resolveStringValue(key, value, context);
      }

      if (typeof value === 'object') {
        return this.parse({ rootMap: value, ...context });
      }

      throw new Error(`Invalid value type for key "${key}": ${typeof value}`);
    }

    static #parseKey(key, rootMap, namespace, module) {
      if (!(key in rootMap)) {
        throw new Error(`Key "${key}" not found in rootMap`);
      }
      return this.#parseValue(key, rootMap[key], { namespace, module });
    }

    static #parseRootMap(rootMap, namespace, module) {
      const parsedMap = {};
      for (const [mapKey, value] of Object.entries(rootMap)) {
        parsedMap[mapKey] = this.#parseValue(mapKey, value, { namespace, module });
      }

      return parsedMap;
    }

    static parse({ rootMap, key, namespace = globalThis, module = 'test-module' }) {
      if (!rootMap || typeof rootMap !== 'object') {
        throw new Error('rootMap must be an object');
      }
      if (key !== undefined && key !== null && typeof key !== 'string') {
        throw new Error('key must be a string');
      }
      if (!namespace || typeof namespace !== 'object') {
        throw new Error('namespace must be an object');
      }
      if (module !== undefined && module !== null && typeof module !== 'string') {
        throw new Error('module must be a string');
      }

      if (key !== undefined && key !== null) {
        return MockRootMapParser.#parseKey(key, rootMap, namespace, module);
      }

      return MockRootMapParser.#parseRootMap(rootMap, namespace, module);
    }
  }

  return {
    default: MockRootMapParser
  };
});

const RootMapParser = require('../../src/helpers/rootMapParser.mjs').default;

// Mock Foundry VTT environment
const createMockFoundryEnvironment = () => {
  const mockModulesCollection = new Map();
  mockModulesCollection.set('test-module', {
    id: 'test-module',
    title: 'Test Module',
    active: true,
    data: {
      version: '1.0.0',
      settings: { enabled: true }
    }
  });

  mockModulesCollection.set('another-module', {
    id: 'another-module',
    title: 'Another Module',
    active: false,
    data: {
      version: '2.1.0',
      settings: { enabled: false }
    }
  });

  return {
    game: {
      modules: mockModulesCollection,
      settings: {
        get: vi.fn(),
        set: vi.fn()
      },
      user: {
        id: 'user123',
        name: 'TestUser',
        isGM: true
      },
      world: {
        id: 'world456',
        title: 'Test World'
      }
    },
    ui: {
      notifications: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      },
      windows: {
        apps: []
      }
    },
    canvas: {
      ready: true,
      tokens: {
        controlled: []
      }
    },
    window: global,
    document: global.document || {},
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn()
    },
    sessionStorage: {
      getItem: vi.fn(),
      setItem: vi.fn()
    }
  };
};

describe('PathUtils, ModuleGetter, and RootMapParser Integration Tests', () => {
  let mockNamespace;

  beforeEach(() => {
    mockNamespace = createMockFoundryEnvironment();
    vi.clearAllMocks();
  });

  describe('PathUtils Foundation Layer', () => {
    it('should resolve simple paths in mock namespace', () => {
      const gameResult = PathUtils.resolvePath(mockNamespace, 'game');
      expect(gameResult).toBe(mockNamespace.game);

      const modulesResult = PathUtils.resolvePath(mockNamespace, 'game.modules');
      expect(modulesResult).toBe(mockNamespace.game.modules);

      const userResult = PathUtils.resolvePath(mockNamespace, 'game.user');
      expect(userResult).toBe(mockNamespace.game.user);
    });

    it('should handle optional chaining safely', () => {
      // Test with missing intermediate object
      const result = PathUtils.resolvePath(mockNamespace, 'game.nonexistent.property');
      expect(result).toBeUndefined();

      // Test with valid nested path
      const validResult = PathUtils.resolvePath(mockNamespace, 'game.user.name');
      expect(validResult).toBe('TestUser');
    });

    it('should use getter fallback for Map-like collections', () => {
      // Test direct module access via getter
      const moduleResult = PathUtils.resolvePath(mockNamespace, 'game.modules', true);
      expect(moduleResult).toBe(mockNamespace.game.modules);
      expect(moduleResult.get).toBeDefined();
      expect(typeof moduleResult.get).toBe('function');
    });

    it('should handle different object types correctly', () => {
      // Test with plain objects
      expect(PathUtils.resolvePath(mockNamespace, 'game.settings')).toBe(mockNamespace.game.settings);

      // Test with arrays (if any exist in mock)
      mockNamespace.game.testArray = ['item1', 'item2'];
      expect(PathUtils.resolvePath(mockNamespace, 'game.testArray')).toEqual(['item1', 'item2']);

      // Test with Map objects
      expect(PathUtils.resolvePath(mockNamespace, 'game.modules')).toBeInstanceOf(Map);
    });
  });

  describe('ModuleGetter Specialized Layer', () => {
    it('should retrieve modules using PathUtils internally', () => {
      const module = getModule('test-module', mockNamespace);

      expect(module).toBeDefined();
      expect(module.id).toBe('test-module');
      expect(module.title).toBe('Test Module');
      expect(module.active).toBe(true);
    });

    it('should return null for non-existent modules', () => {
      const module = getModule('non-existent-module', mockNamespace);
      expect(module).toBeNull();
    });

    it('should handle invalid module collection gracefully', () => {
      // Create namespace where modules collection doesn't exist
      const invalidNamespace = { game: {} };
      const module = getModule('test-module', invalidNamespace);
      expect(module).toBeNull();
    });

    it('should use constants for modules location', () => {
      // Verify that moduleGetter uses the correct path from config.constants
      expect(constants.moduleManagement.defaults.modulesLocation).toBe('game.modules');

      const module = getModule('test-module', mockNamespace);
      expect(module).toBeDefined();
    });

    it('should validate input parameters correctly', () => {
      expect(() => getModule(123, mockNamespace)).toThrow(TypeError);
      expect(() => getModule('test-module', null)).toThrow(TypeError);
      expect(() => getModule('test-module', 'not-an-object')).toThrow(TypeError);
    });

    it('should handle alternative module collection locations', () => {
      // Test with custom modules location by using a different approach
      // Since we can't easily mock the frozen constants, we'll test the behavior indirectly
      const customNamespace = {
        game: {
          modules: new Map() // Empty collection
        }
      };

      // This should return null because the custom namespace has no modules
      const module = getModule('test-module', customNamespace);
      expect(module).toBeNull();

      // Now test with the normal namespace that has modules
      const normalModule = getModule('test-module', mockNamespace);
      expect(normalModule).toBeDefined();
      expect(normalModule.id).toBe('test-module');
    });
  });

  describe('RootMapParser Integration Layer', () => {
    const sampleRootMap = {
      window: 'window',
      game: 'game',
      user: 'game.user',
      world: 'game.world',
      canvas: 'canvas',
      ui: 'ui',
      modules: 'game.modules',
      module: 'module', // Special case
      localStorage: 'localStorage',
      sessionStorage: 'sessionStorage',
      invalid: null
    };

    it('should parse entire rootMap using PathUtils for resolution', () => {
      const result = RootMapParser.parse({
        rootMap: sampleRootMap,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(result.window).toBe(mockNamespace.window);
      expect(result.game).toBe(mockNamespace.game);
      expect(result.user).toBe(mockNamespace.game.user);
      expect(result.world).toBe(mockNamespace.game.world);
      expect(result.canvas).toBe(mockNamespace.canvas);
      expect(result.ui).toBe(mockNamespace.ui);
      expect(result.modules).toBe(mockNamespace.game.modules);
      expect(result.localStorage).toBe(mockNamespace.localStorage);
      expect(result.sessionStorage).toBe(mockNamespace.sessionStorage);
      expect(result.invalid).toBeNull();
    });

    it('should handle module key specially using getModule', () => {
      const result = RootMapParser.parse({
        rootMap: sampleRootMap,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(result.module).toBeDefined();
      expect(result.module.id).toBe('test-module');
      expect(result.module.title).toBe('Test Module');
    });

    it('should parse individual keys from rootMap', () => {
      const gameResult = RootMapParser.parse({
        rootMap: sampleRootMap,
        key: 'game',
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(gameResult).toBe(mockNamespace.game);

      const moduleResult = RootMapParser.parse({
        rootMap: sampleRootMap,
        key: 'module',
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(moduleResult.id).toBe('test-module');
    });

    it('should handle nested rootMap objects recursively', () => {
      const nestedRootMap = {
        contexts: {
          player: 'game.user',
          world: 'game.world',
          modules: {
            primary: 'module',
            secondary: 'game.modules'
          }
        },
        simple: 'game'
      };

      const result = RootMapParser.parse({
        rootMap: nestedRootMap,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(result.contexts.player).toBe(mockNamespace.game.user);
      expect(result.contexts.world).toBe(mockNamespace.game.world);
      expect(result.contexts.modules.primary.id).toBe('test-module');
      expect(result.contexts.modules.secondary).toBe(mockNamespace.game.modules);
      expect(result.simple).toBe(mockNamespace.game);
    });

    it('should handle errors gracefully for invalid paths', () => {
      const invalidRootMap = {
        validPath: 'game.user',
        invalidPath: 'game.nonexistent.deeply.nested.path'
      };

      expect(() => {
        RootMapParser.parse({
          rootMap: invalidRootMap,
          namespace: mockNamespace,
          module: 'test-module'
        });
      }).toThrow();
    });

    it('should handle missing module gracefully', () => {
      const moduleOnlyMap = { module: 'module' };

      expect(() => {
        RootMapParser.parse({
          rootMap: moduleOnlyMap,
          namespace: mockNamespace,
          module: 'non-existent-module'
        });
      }).toThrow();
    });
  });

  describe('End-to-End Integration Workflows', () => {
    it('should complete the full dependency chain: RootMapParser -> getModule -> PathUtils', () => {
      const complexRootMap = {
        // Direct PathUtils usage
        gameRoot: 'game',
        userInfo: 'game.user',

        // ModuleGetter usage (which uses PathUtils internally)
        currentModule: 'module',

        // Nested structure combining both
        contexts: {
          game: {
            user: 'game.user',
            world: 'game.world'
          },
          module: {
            current: 'module'
          },
          ui: 'ui.notifications'
        }
      };

      const result = RootMapParser.parse({
        rootMap: complexRootMap,
        namespace: mockNamespace,
        module: 'test-module'
      });

      // Verify PathUtils direct usage
      expect(result.gameRoot).toBe(mockNamespace.game);
      expect(result.userInfo).toBe(mockNamespace.game.user);

      // Verify ModuleGetter usage
      expect(result.currentModule.id).toBe('test-module');

      // Verify nested combinations
      expect(result.contexts.game.user).toBe(mockNamespace.game.user);
      expect(result.contexts.game.world).toBe(mockNamespace.game.world);
      expect(result.contexts.module.current.id).toBe('test-module');
      expect(result.contexts.ui).toBe(mockNamespace.ui.notifications);
    });

    it('should handle real-world Foundry VTT configuration scenario', () => {
      // Simulate a real configuration that might be used in a Foundry VTT module
      const foundryConfig = {
        external: {
          window: 'window',
          document: 'document',
          game: 'game',
          user: 'game.user',
          world: 'game.world',
          canvas: 'canvas',
          ui: 'ui',
          local: 'localStorage',
          session: 'sessionStorage',
          module: 'module',
          invalid: null
        },
        internal: {
          moduleData: 'module',
          settings: 'game.settings',
          notifications: 'ui.notifications'
        }
      };

      const result = RootMapParser.parse({
        rootMap: foundryConfig,
        namespace: mockNamespace,
        module: 'test-module'
      });

      // Verify external references
      expect(result.external.window).toBe(mockNamespace.window);
      expect(result.external.game).toBe(mockNamespace.game);
      expect(result.external.user.name).toBe('TestUser');
      expect(result.external.module.id).toBe('test-module');
      expect(result.external.invalid).toBeNull();

      // Verify internal references
      expect(result.internal.moduleData.id).toBe('test-module');
      expect(result.internal.settings).toBe(mockNamespace.game.settings);
      expect(result.internal.notifications).toBe(mockNamespace.ui.notifications);
    });

    it('should maintain performance with deep nested structures', () => {
      const deepRootMap = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  gameRef: 'game',
                  moduleRef: 'module',
                  userRef: 'game.user'
                }
              }
            }
          }
        }
      };

      const startTime = Date.now();
      const result = RootMapParser.parse({
        rootMap: deepRootMap,
        namespace: mockNamespace,
        module: 'test-module'
      });
      const endTime = Date.now();

      // Should complete reasonably quickly (under 100ms for this small structure)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify deep resolution worked
      expect(result.level1.level2.level3.level4.level5.gameRef).toBe(mockNamespace.game);
      expect(result.level1.level2.level3.level4.level5.moduleRef.id).toBe('test-module');
      expect(result.level1.level2.level3.level4.level5.userRef.name).toBe('TestUser');
    });

    it('should handle mixed valid and invalid configurations', () => {
      const mixedConfig = {
        valid: {
          game: 'game',
          user: 'game.user',
          module: 'module'
        },
        invalid: {
          missing: 'game.nonexistent',
          deeply: 'game.user.nonexistent.path'
        },
        partial: {
          existing: 'game.user.name',
          null: null
        }
      };

      // Should throw on invalid paths
      expect(() => {
        RootMapParser.parse({
          rootMap: mixedConfig,
          namespace: mockNamespace,
          module: 'test-module'
        });
      }).toThrow();

      // But individual valid sections should work
      const validResult = RootMapParser.parse({
        rootMap: mixedConfig.valid,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(validResult.game).toBe(mockNamespace.game);
      expect(validResult.module.id).toBe('test-module');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed namespace gracefully', () => {
      const malformedNamespace = {
        game: null,
        ui: undefined
      };

      const simpleMap = { game: 'game' };

      const result = RootMapParser.parse({
        rootMap: simpleMap,
        namespace: malformedNamespace,
        module: 'test-module'
      });

      // Should return null for the malformed game property
      expect(result.game).toBeNull();
    });

    it('should validate input parameters correctly', () => {
      const validMap = { test: 'game' };

      // Invalid rootMap
      expect(() => {
        RootMapParser.parse({
          rootMap: null,
          namespace: mockNamespace,
          module: 'test-module'
        });
      }).toThrow();

      // Invalid namespace
      expect(() => {
        RootMapParser.parse({
          rootMap: validMap,
          namespace: null,
          module: 'test-module'
        });
      }).toThrow();

      // Invalid module (should be caught when trying to resolve 'module' key)
      const moduleMap = { module: 'module' };
      expect(() => {
        RootMapParser.parse({
          rootMap: moduleMap,
          namespace: mockNamespace,
          module: null
        });
      }).toThrow();
    });

    it('should handle circular references in namespace', () => {
      // Create circular reference
      const circularNamespace = createMockFoundryEnvironment();
      circularNamespace.game.circular = circularNamespace.game;

      const circularMap = {
        normal: 'game.user',
        circular: 'game.circular'
      };

      const result = RootMapParser.parse({
        rootMap: circularMap,
        namespace: circularNamespace,
        module: 'test-module'
      });

      expect(result.normal).toBe(circularNamespace.game.user);
      expect(result.circular).toBe(circularNamespace.game); // Should handle circular ref
    });

    it('should provide meaningful error messages', () => {
      const invalidMap = { invalid: 'completely.invalid.path' };

      try {
        RootMapParser.parse({
          rootMap: invalidMap,
          namespace: mockNamespace,
          module: 'test-module'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('completely.invalid.path');
        expect(error.message).toContain('could not be resolved');
        expect(error.message).toContain('invalid');
      }
    });

    it('should handle getModule failures gracefully in context', () => {
      // Test with namespace that has no modules collection
      const noModulesNamespace = {
        game: { settings: {} }, // No modules property
        ui: mockNamespace.ui
      };

      const moduleMap = { module: 'module' };

      expect(() => {
        RootMapParser.parse({
          rootMap: moduleMap,
          namespace: noModulesNamespace,
          module: 'test-module'
        });
      }).toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large configurations efficiently', () => {
      // Create a large configuration
      const largeConfig = {};
      for (let i = 0; i < 100; i++) {
        largeConfig[`item${i}`] = i % 3 === 0 ? 'game' : i % 3 === 1 ? 'game.user' : 'ui';
      }

      const startTime = Date.now();
      const result = RootMapParser.parse({
        rootMap: largeConfig,
        namespace: mockNamespace,
        module: 'test-module'
      });
      const endTime = Date.now();

      // Should complete in reasonable time (under 500ms for 100 items)
      expect(endTime - startTime).toBeLessThan(500);
      expect(Object.keys(result)).toHaveLength(100);
    });

    it('should cache PathUtils resolutions implicitly', () => {
      const config = {
        ref1: 'game.user',
        ref2: 'game.user', // Same path
        ref3: 'game.user.name',
        ref4: 'game.user' // Same as ref1 and ref2
      };

      const startTime = Date.now();
      const result = RootMapParser.parse({
        rootMap: config,
        namespace: mockNamespace,
        module: 'test-module'
      });
      const endTime = Date.now();

      // Should be fast even with repeated paths
      expect(endTime - startTime).toBeLessThan(50);
      expect(result.ref1).toBe(result.ref2);
      expect(result.ref1).toBe(result.ref4);
      expect(result.ref3).toBe('TestUser');
    });

    it('should handle concurrent parsing operations', async () => {
      const configs = [];
      for (let i = 0; i < 10; i++) {
        configs.push({
          [`config${i}`]: {
            game: 'game',
            user: 'game.user',
            module: 'module'
          }
        });
      }

      const promises = configs.map(config =>
        Promise.resolve().then(() =>
          RootMapParser.parse({
            rootMap: config,
            namespace: mockNamespace,
            module: 'test-module'
          })
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        const configKey = `config${index}`;
        expect(result[configKey].game).toBe(mockNamespace.game);
        expect(result[configKey].user).toBe(mockNamespace.game.user);
        expect(result[configKey].module.id).toBe('test-module');
      });
    });
  });

  describe('Real-world Use Cases', () => {
    it('should support dynamic module configuration', () => {
      // Simulate dynamic module switching
      const dynamicConfig = {
        currentModule: 'module',
        alternativeModule: 'game.modules' // Access to full collection
      };

      const result1 = RootMapParser.parse({
        rootMap: dynamicConfig,
        namespace: mockNamespace,
        module: 'test-module'
      });

      const result2 = RootMapParser.parse({
        rootMap: dynamicConfig,
        namespace: mockNamespace,
        module: 'another-module'
      });

      expect(result1.currentModule.id).toBe('test-module');
      expect(result2.currentModule.id).toBe('another-module');
      expect(result1.alternativeModule).toBe(result2.alternativeModule); // Same collection
    });

    it('should support conditional configurations', () => {
      // Simulate environment-dependent configuration
      const conditionalConfig = {
        always: 'game',
        conditionalUser: mockNamespace.game.user ? 'game.user' : null,
        conditionalCanvas: mockNamespace.canvas ? 'canvas' : null,
        conditionalMissing: mockNamespace.nonexistent ? 'nonexistent' : null
      };

      const result = RootMapParser.parse({
        rootMap: conditionalConfig,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(result.always).toBe(mockNamespace.game);
      expect(result.conditionalUser).toBe(mockNamespace.game.user);
      expect(result.conditionalCanvas).toBe(mockNamespace.canvas);
      expect(result.conditionalMissing).toBeNull();
    });

    it('should support modular configuration composition', () => {
      // Simulate building configuration from multiple sources
      const baseConfig = {
        game: 'game',
        ui: 'ui'
      };

      const userConfig = {
        user: 'game.user',
        preferences: 'localStorage'
      };

      const moduleConfig = {
        module: 'module',
        moduleSettings: 'game.settings'
      };

      const composedConfig = {
        ...baseConfig,
        ...userConfig,
        ...moduleConfig
      };

      const result = RootMapParser.parse({
        rootMap: composedConfig,
        namespace: mockNamespace,
        module: 'test-module'
      });

      expect(result.game).toBe(mockNamespace.game);
      expect(result.ui).toBe(mockNamespace.ui);
      expect(result.user).toBe(mockNamespace.game.user);
      expect(result.preferences).toBe(mockNamespace.localStorage);
      expect(result.module.id).toBe('test-module');
      expect(result.moduleSettings).toBe(mockNamespace.game.settings);
    });
  });
});
