/**
 * @file contextFactory.unit.test.js
 * @description Unit tests for the ContextFactory class.
 * @path /src/contexts/contextFactory.unit.test.js
 */

import ContextFactory from './contextFactory.js';
import Context from './context.js';
import ExternalContextManager from './external.js';

// Mock dependencies
jest.mock('./context.js');
jest.mock('./external.js');

describe('ContextFactory', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    Context.mockImplementation((options) => ({
      type: 'Context',
      options,
      data: { setItem: jest.fn() },
      settings: { setItem: jest.fn() }
    }));

    ExternalContextManager.mockImplementation((options) => ({
      type: 'ExternalContextManager',
      options,
      context: {
        data: { setItem: jest.fn() },
        settings: { setItem: jest.fn() }
      }
    }));
  });

  describe('Static Properties', () => {
    it('should have correct context type mappings', () => {
      const supportedTypes = ContextFactory.getSupportedTypes();

      expect(supportedTypes).toContain('inMemory');
      expect(supportedTypes).toContain('external');
      expect(supportedTypes).toContain('localStorage');
      expect(supportedTypes).toContain('sessionStorage');
      expect(supportedTypes).toContain('module');
      expect(supportedTypes).toContain('user');
      expect(supportedTypes).toContain('world');
    });
  });

  describe('create()', () => {
    describe('In-Memory Context Creation', () => {
      it('should create an in-memory context with default options', () => {
        const result = ContextFactory.create('inMemory');

        expect(Context).toHaveBeenCalledWith({
          initializationParams: {}
        });
        expect(result.type).toBe('Context');
      });

      it('should create an in-memory context with custom options', () => {
        const options = {
          data: { user: 'test' },
          settings: { theme: 'dark' }
        };

        const result = ContextFactory.create('inMemory', options);

        expect(Context).toHaveBeenCalledWith({
          initializationParams: options
        });
        expect(result.type).toBe('Context');
        expect(result.options.initializationParams).toEqual(options);
      });
    });

    describe('External Context Creation', () => {
      it('should create an external context with default source', () => {
        const result = ContextFactory.create('external');

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'external'
        });
        expect(result.type).toBe('ExternalContextManager');
      });

      it('should create an external context with custom source', () => {
        const options = {
          source: 'customStorage',
          rootIdentifier: 'custom.root',
          pathFromRoot: 'custom.path'
        };

        const result = ContextFactory.create('external', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'customStorage',
          rootIdentifier: 'custom.root',
          pathFromRoot: 'custom.path'
        });
      });

      it('should use default external source when none provided', () => {
        const options = {
          rootIdentifier: 'test.root',
          pathFromRoot: 'test.path'
        };

        ContextFactory.create('external', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'external',
          rootIdentifier: 'test.root',
          pathFromRoot: 'test.path'
        });
      });
    });

    describe('Storage-Specific Context Creation', () => {
      it('should create localStorage context with correct source', () => {
        const options = {
          rootIdentifier: 'localStorage',
          pathFromRoot: 'myApp.context'
        };

        const result = ContextFactory.create('localStorage', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'localStorage',
          rootIdentifier: 'localStorage',
          pathFromRoot: 'myApp.context'
        });
        expect(result.type).toBe('ExternalContextManager');
      });

      it('should create sessionStorage context with correct source', () => {
        const options = {
          rootIdentifier: 'sessionStorage',
          pathFromRoot: 'myApp.session'
        };

        const result = ContextFactory.create('sessionStorage', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'sessionStorage',
          rootIdentifier: 'sessionStorage',
          pathFromRoot: 'myApp.session'
        });
      });

      it('should create module context with correct source', () => {
        const options = {
          rootIdentifier: 'game.modules',
          pathFromRoot: 'myModule.context'
        };

        const result = ContextFactory.create('module', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'module',
          rootIdentifier: 'game.modules',
          pathFromRoot: 'myModule.context'
        });
      });

      it('should create user context with correct source', () => {
        const options = {
          rootIdentifier: 'game.user',
          pathFromRoot: 'preferences'
        };

        const result = ContextFactory.create('user', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'user',
          rootIdentifier: 'game.user',
          pathFromRoot: 'preferences'
        });
      });

      it('should create world context with correct source', () => {
        const options = {
          rootIdentifier: 'game.world',
          pathFromRoot: 'settings'
        };

        const result = ContextFactory.create('world', options);

        expect(ExternalContextManager).toHaveBeenCalledWith({
          source: 'world',
          rootIdentifier: 'game.world',
          pathFromRoot: 'settings'
        });
      });
    });

    describe('Error Handling', () => {
      it('should return null for unknown context type', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = ContextFactory.create('unknownType');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Unknown context type: unknownType');

        consoleSpy.mockRestore();
      });

      it('should throw error when context creation fails', () => {
        Context.mockImplementation(() => {
          throw new Error('Context creation failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
          ContextFactory.create('inMemory');
        }).toThrow('Context creation failed');

        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to create inMemory context manager:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });

      it('should throw error when external context creation fails', () => {
        ExternalContextManager.mockImplementation(() => {
          throw new Error('External context creation failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
          ContextFactory.create('localStorage');
        }).toThrow('External context creation failed');

        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to create localStorage context manager:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe('getSupportedTypes()', () => {
    it('should return all supported context types', () => {
      const supportedTypes = ContextFactory.getSupportedTypes();

      expect(Array.isArray(supportedTypes)).toBe(true);
      expect(supportedTypes).toEqual([
        'inMemory',
        'external',
        'localStorage',
        'sessionStorage',
        'module',
        'user',
        'world'
      ]);
    });
  });

  describe('isTypeSupported()', () => {
    it('should return true for supported types', () => {
      expect(ContextFactory.isTypeSupported('inMemory')).toBe(true);
      expect(ContextFactory.isTypeSupported('external')).toBe(true);
      expect(ContextFactory.isTypeSupported('localStorage')).toBe(true);
      expect(ContextFactory.isTypeSupported('sessionStorage')).toBe(true);
      expect(ContextFactory.isTypeSupported('module')).toBe(true);
      expect(ContextFactory.isTypeSupported('user')).toBe(true);
      expect(ContextFactory.isTypeSupported('world')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(ContextFactory.isTypeSupported('unknownType')).toBe(false);
      expect(ContextFactory.isTypeSupported('redis')).toBe(false);
      expect(ContextFactory.isTypeSupported('')).toBe(false);
      expect(ContextFactory.isTypeSupported(null)).toBe(false);
      expect(ContextFactory.isTypeSupported(undefined)).toBe(false);
    });
  });

  describe('createMultiple()', () => {
    it('should create multiple contexts from configuration', () => {
      const config = {
        inMemory: { data: { temp: true } },
        localStorage: {
          rootIdentifier: 'localStorage',
          pathFromRoot: 'myApp.context'
        },
        module: {
          rootIdentifier: 'game.modules',
          pathFromRoot: 'myModule.context'
        }
      };

      const result = ContextFactory.createMultiple(config);

      expect(result).toHaveProperty('inMemory');
      expect(result).toHaveProperty('localStorage');
      expect(result).toHaveProperty('module');

      expect(Context).toHaveBeenCalledWith({
        initializationParams: { data: { temp: true } }
      });

      expect(ExternalContextManager).toHaveBeenCalledWith({
        source: 'localStorage',
        rootIdentifier: 'localStorage',
        pathFromRoot: 'myApp.context'
      });

      expect(ExternalContextManager).toHaveBeenCalledWith({
        source: 'module',
        rootIdentifier: 'game.modules',
        pathFromRoot: 'myModule.context'
      });
    });

    it('should handle empty configuration gracefully', () => {
      const result = ContextFactory.createMultiple({});

      expect(result).toEqual({});
    });

    it('should throw error when configuration is invalid', () => {
      expect(() => {
        ContextFactory.createMultiple(null);
      }).toThrow('Configuration object is required');

      expect(() => {
        ContextFactory.createMultiple('invalid');
      }).toThrow('Configuration object is required');

      expect(() => {
        ContextFactory.createMultiple(undefined);
      }).toThrow('Configuration object is required');
    });

    it('should throw error when any context creation fails', () => {
      Context.mockImplementation((options) => {
        if (options.initializationParams?.data?.temp) {
          throw new Error('Failed to create temp context');
        }
        return { type: 'Context', options };
      });

      const config = {
        inMemory: { data: { temp: true } },
        localStorage: {
          rootIdentifier: 'localStorage',
          pathFromRoot: 'myApp.context'
        }
      };

      expect(() => {
        ContextFactory.createMultiple(config);
      }).toThrow('Failed to create contexts: inMemory: Failed to create temp context');
    });

    it('should handle multiple creation failures', () => {
      Context.mockImplementation(() => {
        throw new Error('Context creation failed');
      });

      ExternalContextManager.mockImplementation(() => {
        throw new Error('External context creation failed');
      });

      const config = {
        inMemory: {},
        localStorage: {}
      };

      expect(() => {
        ContextFactory.createMultiple(config);
      }).toThrow('Failed to create contexts: inMemory: Context creation failed, localStorage: External context creation failed');
    });

    it('should handle null/undefined options in configuration', () => {
      const config = {
        inMemory: null,
        localStorage: undefined,
        sessionStorage: {}
      };

      const result = ContextFactory.createMultiple(config);

      expect(result).toHaveProperty('inMemory');
      expect(result).toHaveProperty('localStorage');
      expect(result).toHaveProperty('sessionStorage');

      expect(Context).toHaveBeenCalledWith({ initializationParams: {} });
      expect(ExternalContextManager).toHaveBeenCalledWith({ source: 'localStorage' });
      expect(ExternalContextManager).toHaveBeenCalledWith({ source: 'sessionStorage' });
    });
  });

  describe('Integration Scenarios', () => {
    it('should support chaining factory methods', () => {
      const supportedTypes = ContextFactory.getSupportedTypes();
      const isInMemorySupported = ContextFactory.isTypeSupported('inMemory');
      const context = ContextFactory.create('inMemory', { data: { test: true } });

      expect(supportedTypes).toContain('inMemory');
      expect(isInMemorySupported).toBe(true);
      expect(context.type).toBe('Context');
    });

    it('should maintain consistency across multiple calls', () => {
      const types1 = ContextFactory.getSupportedTypes();
      const types2 = ContextFactory.getSupportedTypes();

      expect(types1).toEqual(types2);

      const isSupported1 = ContextFactory.isTypeSupported('localStorage');
      const isSupported2 = ContextFactory.isTypeSupported('localStorage');

      expect(isSupported1).toBe(isSupported2);
    });
  });
});
