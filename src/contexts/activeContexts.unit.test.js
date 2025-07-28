/**
 * @file activeContexts.unit.test.js
 * @description Unit tests for the ActiveContexts class.
 * @path /src/contexts/activeContexts.unit.test.js
 */

import { jest } from '@jest/globals';

// Mock all the dependency modules early to avoid import issues
jest.mock('../constants/constants.js', () => ({
  context: {
    enabledSettings: {
      inMemoryFlag: true,
      moduleFlag: true,
      userFlag: true,
      worldFlag: true,
      localStorageFlag: true,
      sessionStorageFlag: true
    },
    operationsParams: {
      defaults: {
        alwaysPullBeforeGetting: false,
        alwaysPullBeforeSetting: false,
        pullFrom: 'source',
        alwaysPushAfterSetting: false,
        pushTo: 'target'
      }
    }
  },
  contextHelpers: {
    comparisonResults: {
      EQUAL: 'equal',
      DIFFERENT: 'different',
      MISSING: 'missing'
    },
    mergeStrategies: {
      UPDATE_SOURCE_TO_TARGET: 'update_source_to_target',
      UPDATE_TARGET_TO_SOURCE: 'update_target_to_source',
      MERGE_NEWER_WINS: 'merge_newer_wins',
      MERGE_SOURCE_PRIORITY: 'merge_source_priority',
      MERGE_TARGET_PRIORITY: 'merge_target_priority',
      MERGE_BOTH: 'merge_both',
      MERGE_NONE: 'merge_none'
    }
  }
}));

jest.mock('./context.js', () => {
  return jest.fn().mockImplementation(() => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }));
});

jest.mock('./external.js', () => {
  return jest.fn().mockImplementation(() => ({
    data: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn()
    },
    getStorageInfo: jest.fn(() => ({ source: 'mock', hasStorage: true }))
  }));
});

jest.mock('./contextFactory.js', () => ({
  create: jest.fn()
}));

// Now import the classes to test
import { ActiveContexts } from './activeContexts.js';
import ContextFactory from './contextFactory.js';

describe('ActiveContexts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default initialization params', () => {
      const activeContexts = new ActiveContexts();
      
      expect(activeContexts.initializationParams).toEqual({});
    });

    it('should create instance with custom initialization params', () => {
      const initParams = { data: { test: 'value' } };
      const activeContexts = new ActiveContexts(initParams);
      
      expect(activeContexts.initializationParams).toEqual(initParams);
    });
  });

  describe('Individual Context Initialization', () => {
    let activeContexts;

    beforeEach(() => {
      activeContexts = new ActiveContexts();
    });

    describe('initializeInMemoryContext', () => {
      it('should create in-memory context when flag is enabled', () => {
        const mockContext = { type: 'inMemory' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { data: { test: 'value' } };
        const result = activeContexts.initializeInMemoryContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('inMemory', initParams);
        expect(result).toBe(mockContext);
      });

      it('should use nested params when provided', () => {
        const mockContext = { type: 'inMemory' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { 
          inMemory: { data: { nested: 'value' } },
          other: { data: 'ignored' }
        };
        const result = activeContexts.initializeInMemoryContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('inMemory', { data: { nested: 'value' } });
        expect(result).toBe(mockContext);
      });
    });

    describe('initializeModuleContext', () => {
      it('should create module context when flag is enabled', () => {
        const mockContext = { type: 'module' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { rootIdentifier: 'game.modules' };
        const result = activeContexts.initializeModuleContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('module', {
          ...initParams,
          source: 'module'
        });
        expect(result).toBe(mockContext);
      });

      it('should use nested module params when provided', () => {
        const mockContext = { type: 'module' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { 
          module: { rootIdentifier: 'game.modules', pathFromRoot: 'test.context' },
          other: 'ignored'
        };
        const result = activeContexts.initializeModuleContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('module', {
          rootIdentifier: 'game.modules',
          pathFromRoot: 'test.context',
          source: 'module'
        });
        expect(result).toBe(mockContext);
      });
    });

    describe('initializeUserContext', () => {
      it('should create user context when flag is enabled', () => {
        const mockContext = { type: 'user' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { rootIdentifier: 'game.user' };
        const result = activeContexts.initializeUserContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('user', {
          ...initParams,
          source: 'user'
        });
        expect(result).toBe(mockContext);
      });
    });

    describe('initializeWorldContext', () => {
      it('should create world context when flag is enabled', () => {
        const mockContext = { type: 'world' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { rootIdentifier: 'game.world' };
        const result = activeContexts.initializeWorldContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('world', {
          ...initParams,
          source: 'world'
        });
        expect(result).toBe(mockContext);
      });
    });

    describe('initializeLocalStorageContext', () => {
      it('should create localStorage context when flag is enabled', () => {
        const mockContext = { type: 'localStorage' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { rootIdentifier: 'localStorage' };
        const result = activeContexts.initializeLocalStorageContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('localStorage', {
          ...initParams,
          source: 'localStorage'
        });
        expect(result).toBe(mockContext);
      });
    });

    describe('initializeSessionStorageContext', () => {
      it('should create sessionStorage context when flag is enabled', () => {
        const mockContext = { type: 'sessionStorage' };
        ContextFactory.create.mockReturnValue(mockContext);
        
        const initParams = { rootIdentifier: 'sessionStorage' };
        const result = activeContexts.initializeSessionStorageContext(initParams);
        
        expect(ContextFactory.create).toHaveBeenCalledWith('sessionStorage', {
          ...initParams,
          source: 'sessionStorage'
        });
        expect(result).toBe(mockContext);
      });
    });
  });

  describe('initializeAllContexts', () => {
    it('should initialize all enabled contexts', () => {
      const activeContexts = new ActiveContexts();
      
      const mockContexts = {
        inMemory: { type: 'inMemory' },
        module: { type: 'module' },
        user: { type: 'user' },
        world: { type: 'world' },
        localStorage: { type: 'localStorage' },
        sessionStorage: { type: 'sessionStorage' }
      };

      // Mock each context creation
      ContextFactory.create
        .mockReturnValueOnce(mockContexts.inMemory)
        .mockReturnValueOnce(mockContexts.module)
        .mockReturnValueOnce(mockContexts.user)
        .mockReturnValueOnce(mockContexts.world)
        .mockReturnValueOnce(mockContexts.localStorage)
        .mockReturnValueOnce(mockContexts.sessionStorage);

      const initParams = { test: 'params' };
      const result = activeContexts.initializeAllContexts(initParams);

      expect(result).toEqual({
        inMemory: mockContexts.inMemory,
        module: mockContexts.module,
        user: mockContexts.user,
        world: mockContexts.world,
        localStorage: mockContexts.localStorage,
        sessionStorage: mockContexts.sessionStorage
      });

      expect(ContextFactory.create).toHaveBeenCalledTimes(6);
    });
  });

  describe('Parameter Handling', () => {
    let activeContexts;

    beforeEach(() => {
      activeContexts = new ActiveContexts();
    });

    it('should handle nested parameter objects correctly', () => {
      const mockContext = { type: 'test' };
      ContextFactory.create.mockReturnValue(mockContext);

      const complexParams = {
        inMemory: { data: { user: 'test1' } },
        module: { rootIdentifier: 'game.modules', pathFromRoot: 'test.context' },
      };

      activeContexts.initializeInMemoryContext(complexParams);
      activeContexts.initializeModuleContext(complexParams);
      
      expect(ContextFactory.create).toHaveBeenCalledWith('inMemory', { data: { user: 'test1' } });
      expect(ContextFactory.create).toHaveBeenCalledWith('module', {
        rootIdentifier: 'game.modules',
        pathFromRoot: 'test.context',
        source: 'module'
      });
    });

    it('should handle non-object nested parameters gracefully', () => {
      const mockContext = { type: 'test' };
      ContextFactory.create.mockReturnValue(mockContext);

      const invalidParams = {
        inMemory: 'not an object',
        module: null,
        user: undefined
      };

      activeContexts.initializeInMemoryContext(invalidParams);
      activeContexts.initializeModuleContext(invalidParams);
      activeContexts.initializeUserContext(invalidParams);
      
      // Should use the original params when nested is not an object
      expect(ContextFactory.create).toHaveBeenCalledWith('inMemory', invalidParams);
      expect(ContextFactory.create).toHaveBeenCalledWith('module', {
        ...invalidParams,
        source: 'module'
      });
      expect(ContextFactory.create).toHaveBeenCalledWith('user', {
        ...invalidParams,
        source: 'user'
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate ContextFactory errors', () => {
      const activeContexts = new ActiveContexts();
      const error = new Error('Context creation failed');
      
      ContextFactory.create.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        activeContexts.initializeInMemoryContext();
      }).toThrow('Context creation failed');
    });
  });
});