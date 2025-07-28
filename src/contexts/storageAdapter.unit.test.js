/**
 * @file storageAdapter.unit.test.js
 * @description Unit tests for the StorageAdapter class.
 * @path /src/contexts/storageAdapter.unit.test.js
 */

import StorageAdapter from './storageAdapter.js';
import RootMapParser from '../helpers/rootMapParser.js';
import Context from './context.js';

// Mock dependencies
jest.mock('../helpers/rootMapParser.js');

describe('StorageAdapter', () => {
  let mockConfiguration;
  let mockRootMap;
  let mockContextRoot;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock configuration
    mockConfiguration = {
      defaults: {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context'
      },
      rootMap: {
        localStorage: 'window.localStorage',
        sessionStorage: 'window.sessionStorage'
      }
    };

    // Setup mock root map
    mockRootMap = {
      localStorage: 'window.localStorage',
      sessionStorage: 'window.sessionStorage'
    };

    // Setup mock context root
    mockContextRoot = {};

    // Mock RootMapParser.parse
    RootMapParser.parse = jest.fn().mockReturnValue(mockContextRoot);
  });

  describe('Constructor', () => {
    it('should create a StorageAdapter with valid configuration', () => {
      const adapter = new StorageAdapter({
        source: 'localStorage',
        configuration: mockConfiguration,
        rootIdentifier: 'localStorage',
        rootMap: mockRootMap,
        pathFromRoot: 'test.context'
      });

      expect(adapter).toBeInstanceOf(StorageAdapter);
      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: mockRootMap,
        key: 'localStorage'
      });
    });

    it('should use configuration defaults when options not provided', () => {
      const adapter = new StorageAdapter({
        configuration: mockConfiguration,
        rootMap: mockRootMap
      });

      expect(adapter).toBeInstanceOf(StorageAdapter);
      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: mockRootMap,
        key: 'localStorage'
      });
    });

    it('should throw error when configuration is missing', () => {
      expect(() => {
        new StorageAdapter({
          source: 'localStorage'
        });
      }).toThrow('Storage configuration is required');
    });

    it('should throw error when rootIdentifier is invalid', () => {
      // Test with configuration that has no defaults
      const configWithoutDefaults = {
        rootMap: mockRootMap
      };

      expect(() => {
        new StorageAdapter({
          configuration: configWithoutDefaults,
          rootIdentifier: '', // Empty string should fail
          rootMap: mockRootMap,
          pathFromRoot: 'test.context'
        });
      }).toThrow('Invalid configuration: rootIdentifier must be a non-empty string');

      expect(() => {
        new StorageAdapter({
          configuration: configWithoutDefaults,
          rootIdentifier: null, // Null should fail
          rootMap: mockRootMap,
          pathFromRoot: 'test.context'
        });
      }).toThrow('Invalid configuration: rootIdentifier must be a non-empty string');
    });

    it('should throw error when pathFromRoot is invalid', () => {
      // Test with configuration that has no defaults
      const configWithoutDefaults = {
        rootMap: mockRootMap
      };

      expect(() => {
        new StorageAdapter({
          configuration: configWithoutDefaults,
          rootIdentifier: 'localStorage',
          rootMap: mockRootMap,
          pathFromRoot: '' // Empty string should fail
        });
      }).toThrow('Invalid configuration: pathFromRoot must be a non-empty string');

      expect(() => {
        new StorageAdapter({
          configuration: configWithoutDefaults,
          rootIdentifier: 'localStorage',
          rootMap: mockRootMap,
          pathFromRoot: null // Null should fail
        });
      }).toThrow('Invalid configuration: pathFromRoot must be a non-empty string');
    });

    it('should throw error when rootMap is invalid', () => {
      expect(() => {
        new StorageAdapter({
          configuration: mockConfiguration,
          rootIdentifier: 'localStorage',
          rootMap: null, // Null should fail (explicitly provided)
          pathFromRoot: 'test.context'
        });
      }).toThrow('Invalid configuration: rootMap must be an object');

      expect(() => {
        new StorageAdapter({
          configuration: mockConfiguration,
          rootIdentifier: 'localStorage',
          rootMap: 'invalid', // String should fail
          pathFromRoot: 'test.context'
        });
      }).toThrow('Invalid configuration: rootMap must be an object');
    });

    it('should throw error when root identifier cannot be resolved', () => {
      RootMapParser.parse = jest.fn().mockImplementation(() => {
        throw new Error('Invalid root identifier');
      });

      expect(() => {
        new StorageAdapter({
          configuration: mockConfiguration,
          rootIdentifier: 'invalid',
          rootMap: mockRootMap,
          pathFromRoot: 'test.context'
        });
      }).toThrow('Invalid root identifier: invalid');
    });
  });

  describe('Storage Operations', () => {
    let adapter;
    let mockContext;

    beforeEach(() => {
      adapter = new StorageAdapter({
        source: 'localStorage',
        configuration: mockConfiguration,
        rootIdentifier: 'localStorage',
        rootMap: mockRootMap,
        pathFromRoot: 'test.context',
        mergeStrategy: 'mergeNewerWins'
      });

      mockContext = {
        isContextObject: true,
        schema: { value: {} },
        constants: { value: {} },
        manifest: { value: {} },
        flags: {},
        state: {},
        data: {},
        settings: {},
        merge: jest.fn().mockReturnValue({ success: true })
      };
    });

    describe('store()', () => {
      it('should store a context instance successfully', () => {
        const result = adapter.store(mockContext);

        expect(result).toBe(mockContext);
        expect(mockContextRoot['test.context']).toBe(mockContext);
      });

      it('should throw error when context is null', () => {
        expect(() => {
          adapter.store(null);
        }).toThrow('Context instance is required for storage');
      });

      it('should merge with existing context when one exists', () => {
        // Setup existing context
        const existingContext = {
          isContextObject: true,
          schema: { value: {} },
          constants: { value: {} },
          manifest: { value: {} },
          flags: {},
          state: {},
          data: {},
          settings: {},
          merge: jest.fn().mockReturnValue({ success: true })
        };

        mockContextRoot['test.context'] = existingContext;

        const result = adapter.store(mockContext);

        expect(existingContext.merge).toHaveBeenCalledWith(mockContext, 'mergeNewerWins');
        expect(result).toBe(existingContext);
      });

      it('should warn and replace when non-context object exists at path', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockContextRoot['test.context'] = { someData: 'not a context' };

        const result = adapter.store(mockContext);

        expect(consoleSpy).toHaveBeenCalledWith('Overwriting existing property at path: test.context');
        expect(result).toBe(mockContext);
        expect(mockContextRoot['test.context']).toBe(mockContext);

        consoleSpy.mockRestore();
      });

      it('should handle merge failure gracefully', () => {
        const existingContext = {
          isContextObject: true,
          schema: { value: {} },
          constants: { value: {} },
          manifest: { value: {} },
          flags: {},
          state: {},
          data: {},
          settings: {},
          merge: jest.fn().mockReturnValue({ success: false, error: 'Merge failed' })
        };

        mockContextRoot['test.context'] = existingContext;

        expect(() => {
          adapter.store(mockContext);
        }).toThrow('Context merge operation failed: Context merge failed: Merge failed');
      });
    });

    describe('retrieve()', () => {
      it('should retrieve an existing context', () => {
        mockContextRoot['test.context'] = mockContext;

        const result = adapter.retrieve();

        expect(result).toBe(mockContext);
      });

      it('should return null when no context exists', () => {
        const result = adapter.retrieve();

        expect(result).toBeNull();
      });

      it('should handle retrieval errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock a property access that throws
        Object.defineProperty(mockContextRoot, 'test.context', {
          get() {
            throw new Error('Access denied');
          }
        });

        const result = adapter.retrieve();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to retrieve context:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });

    describe('remove()', () => {
      it('should remove an existing context', () => {
        mockContextRoot['test.context'] = mockContext;

        const result = adapter.remove();

        expect(result).toBe(true);
        expect(mockContextRoot['test.context']).toBeUndefined();
      });

      it('should return false when no context exists to remove', () => {
        const result = adapter.remove();

        expect(result).toBe(false);
      });

      it('should handle removal errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock a property that can't be deleted
        Object.defineProperty(mockContextRoot, 'test.context', {
          value: mockContext,
          configurable: false
        });

        const result = adapter.remove();

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to remove context:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });

    describe('exists()', () => {
      it('should return true when context exists', () => {
        mockContextRoot['test.context'] = mockContext;

        const result = adapter.exists();

        expect(result).toBe(true);
      });

      it('should return false when context does not exist', () => {
        const result = adapter.exists();

        expect(result).toBe(false);
      });

      it('should handle existence check errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock a property access that throws
        Object.defineProperty(mockContextRoot, 'test.context', {
          get() {
            throw new Error('Access denied');
          }
        });

        const result = adapter.exists();

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to check context existence:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });

    describe('getInfo()', () => {
      it('should return storage adapter information', () => {
        const info = adapter.getInfo();

        expect(info).toEqual({
          source: 'localStorage',
          rootIdentifier: 'localStorage',
          pathFromRoot: 'test.context',
          mergeStrategy: 'mergeNewerWins'
        });
      });
    });
  });

  describe('Context Detection', () => {
    let adapter;

    beforeEach(() => {
      adapter = new StorageAdapter({
        source: 'localStorage',
        configuration: mockConfiguration,
        rootIdentifier: 'localStorage',
        rootMap: mockRootMap,
        pathFromRoot: 'test.context'
      });
    });

    it('should detect context objects with isContextObject property', () => {
      const contextLikeObject = {
        isContextObject: true,
        merge: jest.fn().mockReturnValue({ success: true })
      };

      mockContextRoot['test.context'] = contextLikeObject;

      const newContext = {
        isContextObject: true,
        merge: jest.fn()
      };

      adapter.store(newContext);

      expect(contextLikeObject.merge).toHaveBeenCalled();
    });

    it('should detect context objects with all required properties', () => {
      const contextLikeObject = {
        schema: { value: {} },
        constants: { value: {} },
        manifest: { value: {} },
        flags: {},
        state: {},
        data: {},
        settings: {},
        merge: jest.fn().mockReturnValue({ success: true })
      };

      mockContextRoot['test.context'] = contextLikeObject;

      const newContext = {
        isContextObject: true,
        merge: jest.fn()
      };

      adapter.store(newContext);

      expect(contextLikeObject.merge).toHaveBeenCalled();
    });

    it('should not detect non-context objects as contexts', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const nonContextObject = {
        someProperty: 'value',
        anotherProperty: 123
      };

      mockContextRoot['test.context'] = nonContextObject;

      const newContext = {
        isContextObject: true,
        merge: jest.fn()
      };

      adapter.store(newContext);

      expect(consoleSpy).toHaveBeenCalledWith('Overwriting existing property at path: test.context');
      expect(mockContextRoot['test.context']).toBe(newContext);

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid context root in buildContextInstance', () => {
      // Create an adapter with a mock context root that will be null/invalid
      RootMapParser.parse = jest.fn().mockReturnValue(null);

      expect(() => {
        const adapter = new StorageAdapter({
          source: 'localStorage',
          configuration: mockConfiguration,
          rootIdentifier: 'localStorage',
          rootMap: mockRootMap,
          pathFromRoot: 'test.context'
        });

        const mockContext = { isContextObject: true };
        adapter.store(mockContext);
      }).toThrow('Invalid context root');
    });
  });
});
