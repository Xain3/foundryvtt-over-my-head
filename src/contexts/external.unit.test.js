/**
 * @file external.unit.test.js
 * @description Unit tests for the ExternalContextManager class.
 * @path /src/contexts/external.unit.test.js
 */

import ExternalContextManager from './external.js';
import Context from './context.js';
import StorageAdapter from './storageAdapter.js';

// Mock dependencies
jest.mock('./context.js');
jest.mock('./storageAdapter.js');

describe('ExternalContextManager', () => {
  let mockContext;
  let mockStorageAdapter;
  let mockConstants;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock constants
    mockConstants = {
      context: {
        external: {
          defaults: {
            rootIdentifier: 'localStorage',
            pathFromRoot: 'test.context'
          },
          rootMap: {
            localStorage: 'window.localStorage'
          }
        }
      }
    };

    // Setup mock context
    mockContext = {
      constants: {
        value: mockConstants
      },
      data: { setItem: jest.fn(), getItem: jest.fn() },
      settings: { setItem: jest.fn(), getItem: jest.fn() },
      flags: { setItem: jest.fn(), getItem: jest.fn() },
      state: { setItem: jest.fn(), getItem: jest.fn() },
      schema: { value: {} },
      manifest: { value: {} }
    };

    // Setup mock storage adapter
    mockStorageAdapter = {
      store: jest.fn().mockReturnValue(mockContext),
      retrieve: jest.fn().mockReturnValue(mockContext),
      remove: jest.fn().mockReturnValue(true),
      exists: jest.fn().mockReturnValue(true),
      getInfo: jest.fn().mockReturnValue({
        source: 'localStorage',
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context',
        mergeStrategy: 'mergeOlderWins'
      })
    };

    // Mock constructors
    Context.mockImplementation(() => mockContext);
    StorageAdapter.mockImplementation(() => mockStorageAdapter);
  });

  describe('Constructor', () => {
    it('should create an ExternalContextManager with default options', () => {
      const manager = new ExternalContextManager();

      expect(Context).toHaveBeenCalledWith({
        initializationParams: {
          mergeStrategy: 'mergeOlderWins'
        }
      });

      expect(StorageAdapter).toHaveBeenCalledWith({
        source: 'external',
        configuration: mockConstants.context.external,
        rootIdentifier: undefined,
        rootMap: undefined,
        pathFromRoot: undefined,
        mergeStrategy: 'mergeOlderWins'
      });

      expect(mockStorageAdapter.store).toHaveBeenCalledWith(mockContext);
      expect(manager).toBeInstanceOf(ExternalContextManager);
    });

    it('should create an ExternalContextManager with custom options', () => {
      const customParams = {
        source: 'localStorage',
        rootIdentifier: 'custom.root',
        pathFromRoot: 'custom.path',
        rootMap: { custom: 'map' },
        initializationParams: {
          mergeStrategy: 'mergeNewerWins',
          data: { test: 'value' }
        }
      };

      const manager = new ExternalContextManager(customParams);

      expect(Context).toHaveBeenCalledWith({
        initializationParams: {
          mergeStrategy: 'mergeNewerWins',
          data: { test: 'value' }
        }
      });

      expect(StorageAdapter).toHaveBeenCalledWith({
        source: 'localStorage',
        configuration: mockConstants.context.external,
        rootIdentifier: 'custom.root',
        rootMap: { custom: 'map' },
        pathFromRoot: 'custom.path',
        mergeStrategy: 'mergeNewerWins'
      });

      expect(manager).toBeInstanceOf(ExternalContextManager);
    });

    it('should throw error when external context configuration is missing', () => {
      // Mock context without external configuration
      const mockContextWithoutConfig = {
        constants: {
          value: {
            context: {} // Missing external config
          }
        }
      };

      Context.mockImplementation(() => mockContextWithoutConfig);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('External context configuration not found in constants');
    });

    it('should throw error when StorageAdapter creation fails', () => {
      StorageAdapter.mockImplementation(() => {
        throw new Error('Storage adapter creation failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Storage adapter creation failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize ExternalContextManager:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Getters', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager({
        source: 'localStorage',
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context'
      });
    });

    it('should expose the underlying context', () => {
      expect(manager.context).toBe(mockContext);
    });

    it('should expose the data container', () => {
      expect(manager.data).toBe(mockContext.data);
    });

    it('should expose the settings container', () => {
      expect(manager.settings).toBe(mockContext.settings);
    });

    it('should expose the flags container', () => {
      expect(manager.flags).toBe(mockContext.flags);
    });

    it('should expose the state container', () => {
      expect(manager.state).toBe(mockContext.state);
    });

    it('should expose the constants', () => {
      expect(manager.constants).toBe(mockContext.constants);
    });

    it('should expose the manifest', () => {
      expect(manager.manifest).toBe(mockContext.manifest);
    });

    it('should expose the schema', () => {
      expect(manager.schema).toBe(mockContext.schema);
    });
  });

  describe('Storage Operations', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager({
        source: 'localStorage',
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context'
      });
    });

    describe('getStorageInfo()', () => {
      it('should return storage adapter information', () => {
        const info = manager.getStorageInfo();

        expect(mockStorageAdapter.getInfo).toHaveBeenCalled();
        expect(info).toEqual({
          source: 'localStorage',
          rootIdentifier: 'localStorage',
          pathFromRoot: 'test.context',
          mergeStrategy: 'mergeOlderWins'
        });
      });
    });

    describe('retrieveFromStorage()', () => {
      it('should retrieve context from storage', () => {
        const result = manager.retrieveFromStorage();

        expect(mockStorageAdapter.retrieve).toHaveBeenCalled();
        expect(result).toBe(mockContext);
      });
    });

    describe('removeFromStorage()', () => {
      it('should remove context from storage', () => {
        const result = manager.removeFromStorage();

        expect(mockStorageAdapter.remove).toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });

    describe('existsInStorage()', () => {
      it('should check if context exists in storage', () => {
        const result = manager.existsInStorage();

        expect(mockStorageAdapter.exists).toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });
  });

  describe('Integration with Context', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager({
        source: 'localStorage',
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context',
        initializationParams: {
          data: { user: 'testUser' },
          settings: { theme: 'dark' }
        }
      });
    });

    it('should pass initialization parameters to context', () => {
      expect(Context).toHaveBeenCalledWith({
        initializationParams: {
          mergeStrategy: 'mergeOlderWins',
          data: { user: 'testUser' },
          settings: { theme: 'dark' }
        }
      });
    });

    it('should provide access to context data through getters', () => {
      // Simulate calling methods on the exposed containers
      manager.data.setItem('newKey', 'newValue');
      manager.settings.setItem('newSetting', 'value');
      manager.flags.setItem('initialized', true);
      manager.state.setItem('currentState', 'active');

      expect(mockContext.data.setItem).toHaveBeenCalledWith('newKey', 'newValue');
      expect(mockContext.settings.setItem).toHaveBeenCalledWith('newSetting', 'value');
      expect(mockContext.flags.setItem).toHaveBeenCalledWith('initialized', true);
      expect(mockContext.state.setItem).toHaveBeenCalledWith('currentState', 'active');
    });
  });

  describe('Storage Adapter Integration', () => {
    it('should pass correct configuration to StorageAdapter', () => {
      const customConfig = {
        source: 'sessionStorage',
        rootIdentifier: 'sessionStorage',
        pathFromRoot: 'my.custom.path',
        rootMap: { sessionStorage: 'window.sessionStorage' },
        initializationParams: {
          mergeStrategy: 'mergeNewerWins'
        }
      };

      new ExternalContextManager(customConfig);

      expect(StorageAdapter).toHaveBeenCalledWith({
        source: 'sessionStorage',
        configuration: mockConstants.context.external,
        rootIdentifier: 'sessionStorage',
        rootMap: { sessionStorage: 'window.sessionStorage' },
        pathFromRoot: 'my.custom.path',
        mergeStrategy: 'mergeNewerWins'
      });
    });

    it('should store the context in the storage adapter upon creation', () => {
      new ExternalContextManager();

      expect(mockStorageAdapter.store).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle context creation errors gracefully', () => {
      Context.mockImplementation(() => {
        throw new Error('Context creation failed');
      });

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Context creation failed');
    });

    it('should handle missing context.external configuration', () => {
      const mockContextMissingConfig = {
        constants: {
          value: {
            // Missing context.external
          }
        }
      };

      Context.mockImplementation(() => mockContextMissingConfig);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('External context configuration not found in constants');
    });

    it('should handle storage adapter store method failure', () => {
      mockStorageAdapter.store.mockImplementation(() => {
        throw new Error('Store operation failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Store operation failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize ExternalContextManager:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
