import ExternalContextManager from './external.js';
import Context from './context.js';
import RootMapParser from '../helpers/rootMapParser.js';
import ContextMerger from './helpers/contextMerger.js';

/**
 * @file external.unit.test.js
 * @description Unit tests for ExternalContextManager class
 * @path src/contexts/external.unit.test.js
 */


// Mock dependencies
jest.mock('./context.js');
jest.mock('../helpers/rootMapParser.js');
jest.mock('./helpers/contextMerger.js');
jest.mock('lodash', () => ({
  cloneDeep: jest.fn(obj => JSON.parse(JSON.stringify(obj)))
}));

describe('ExternalContextManager', () => {
  let mockContext;
  let mockConstants;
  let mockConfiguration;
  let mockRootMap;
  let mockContextRoot;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock ContextContainer-like objects
    const createMockContainer = (data = {}) => ({
      getItem: jest.fn(key => data[key]),
      setItem: jest.fn((key, value) => { data[key] = value; }),
      hasItem: jest.fn(key => key in data),
      keys: jest.fn(() => Object.keys(data)),
      values: jest.fn(() => Object.values(data)),
      entries: jest.fn(() => Object.entries(data)),
      clear: jest.fn(() => { Object.keys(data).forEach(key => delete data[key]); }),
      size: jest.fn(() => Object.keys(data).length),
      get: jest.fn(key => data[key]),
      set: jest.fn((key, value) => { data[key] = value; }),
      delete: jest.fn(key => delete data[key]),
      has: jest.fn(key => key in data)
    });

    // Setup mock configuration
    mockConfiguration = {
      defaults: {
        rootIdentifier: 'testRoot',
        pathFromRoot: 'testPath'
      },
      rootMap: {
        testRoot: 'rootValue'
      }
    };

    mockConstants = createMockContainer({
      context: {
        external: mockConfiguration
      }
    });

    // Add support for getItem('context').getItem('external') access pattern
    const contextContainer = createMockContainer({ external: mockConfiguration });
    mockConstants.getItem = jest.fn((key) => {
      if (key === 'context') return contextContainer;
      return mockConstants[key];
    });

    mockRootMap = { testRoot: 'rootValue' };
    mockContextRoot = {};

    // Mock Context instance
    mockContext = {
      constants: mockConstants,
      schema: createMockContainer({ userSchema: 'schemaValue' }),
      manifest: createMockContainer({ version: '1.0.0', name: 'test-app' }),
      flags: createMockContainer({ debugMode: true, featureFlag: false }),
      state: createMockContainer({ currentUser: null, isLoading: false }),
      data: createMockContainer({ users: [], settings: {} }),
      settings: createMockContainer({ theme: 'dark', language: 'en' }),
      compare: jest.fn(),
      merge: jest.fn()
    };

    Context.mockImplementation(() => mockContext);

    RootMapParser.parse.mockReturnValue(mockContextRoot);

    // Setup default ContextMerger.merge behavior for successful merging
    ContextMerger.merge.mockReturnValue({
      success: true,
      mergedContext: mockContext
    });
  });

  describe('Constructor', () => {
    it('should create instance with default parameters', () => {
      const manager = new ExternalContextManager();

      expect(manager).toBeInstanceOf(ExternalContextManager);
      expect(Context).toHaveBeenCalledWith({
        initializationParams: expect.objectContaining({
          mergeStrategy: 'mergeOlderWins'
        })
      });
    });

    it('should create instance with custom initialization parameters', () => {
      const customParams = {
        mergeStrategy: 'mergeNewerWins',
        data: { customKey: 'customValue' },
        flags: { customFlag: true }
      };

      const manager = new ExternalContextManager({
        initializationParams: customParams
      });

      expect(manager).toBeInstanceOf(ExternalContextManager);
      expect(Context).toHaveBeenCalledWith({
        initializationParams: expect.objectContaining(customParams)
      });
    });

    it('should create instance with custom root configuration', () => {
      const customRootId = 'customRoot';
      const customPath = 'customPath';
      const customRootMap = { customRoot: 'customValue' };

      const manager = new ExternalContextManager({
        rootIdentifier: customRootId,
        pathFromRoot: customPath,
        rootMap: customRootMap
      });

      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: customRootMap,
        key: customRootId
      });
    });

    it('should throw error when external configuration is not found', () => {
      const invalidConstants = {
        getItem: jest.fn(() => null)
      };

      const invalidContext = {
        ...mockContext,
        constants: invalidConstants
      };

      Context.mockImplementationOnce(() => invalidContext);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('External context configuration not found in constants');
    });

    it('should throw error when required configuration is missing', () => {
      const incompleteConfig = {
        defaults: {
          rootIdentifier: null,
          pathFromRoot: 'testPath'
        },
        rootMap: mockRootMap
      };

      const invalidConstants = {
        getItem: jest.fn(() => ({ getItem: jest.fn(() => incompleteConfig) }))
      };

      const invalidContext = {
        ...mockContext,
        constants: invalidConstants
      };

      Context.mockImplementationOnce(() => invalidContext);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Invalid configuration: rootIdentifier, pathFromRoot, and rootMap must be defined');
    });

    it('should throw error when RootMapParser fails', () => {
      RootMapParser.parse.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Invalid root identifier: testRoot');
    });

    it('should handle existing Context instance at path', () => {
      const existingContext = new Context();
      
      // Set up the mock to return a context root with an existing context at the path
      const contextRootWithExisting = { testPath: existingContext };
      RootMapParser.parse.mockReturnValueOnce(contextRootWithExisting);

      const mockMergeResult = {
        success: true,
        mergedContext: mockContext
      };

      ContextMerger.merge.mockReturnValue(mockMergeResult);

      const manager = new ExternalContextManager();

      expect(ContextMerger.merge).toHaveBeenCalledWith(
        existingContext,
        expect.any(Object),
        'mergeOlderWins'
      );
    });

    it('should warn and replace non-Context object at path', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockContextRoot.testPath = { someProperty: 'value' };

      const manager = new ExternalContextManager();

      expect(consoleSpy).toHaveBeenCalledWith('Overwriting existing property at path: testPath');

      consoleSpy.mockRestore();
    });

    it('should handle merge failure gracefully', () => {
      const existingContext = new Context();
      
      // Set up the mock to return a context root with an existing context at the path
      const contextRootWithExisting = { testPath: existingContext };
      RootMapParser.parse.mockReturnValueOnce(contextRootWithExisting);

      const mockMergeResult = {
        success: false,
        error: 'Merge failed'
      };

      ContextMerger.merge.mockReturnValue(mockMergeResult);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Context merge failed: Merge failed');
    });
  });

  describe('Property Getters', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager();
    });

    it('should provide access to context property', () => {
      expect(manager.context).toBe(mockContext);
    });

    it('should provide access to schema property', () => {
      expect(manager.schema).toBe(mockContext.schema);
    });

    it('should provide access to constants property', () => {
      expect(manager.constants).toBe(mockContext.constants);
    });

    it('should provide access to manifest property', () => {
      expect(manager.manifest).toBe(mockContext.manifest);
    });

    it('should provide access to flags property', () => {
      expect(manager.flags).toBe(mockContext.flags);
    });

    it('should provide access to state property', () => {
      expect(manager.state).toBe(mockContext.state);
    });

    it('should provide access to data property', () => {
      expect(manager.data).toBe(mockContext.data);
    });

    it('should provide access to settings property', () => {
      expect(manager.settings).toBe(mockContext.settings);
    });
  });

  describe('compare method', () => {
    let manager;
    let otherContext;

    beforeEach(() => {
      manager = new ExternalContextManager();
      otherContext = new Context();

      const mockComparisonResult = {
        added: ['newProperty'],
        removed: ['oldProperty'],
        modified: ['changedProperty'],
        unchanged: ['sameProperty']
      };

      mockContext.compare.mockReturnValue(mockComparisonResult);
    });

    it('should call context compare with default options', () => {
      const result = manager.compare(otherContext);

      expect(mockContext.compare).toHaveBeenCalledWith(otherContext, {});
      expect(result).toHaveProperty('added');
      expect(result).toHaveProperty('removed');
      expect(result).toHaveProperty('modified');
    });

    it('should call context compare with custom options', () => {
      const options = {
        compareBy: 'createdAt',
        sourceContext: mockContext
      };

      const result = manager.compare(otherContext, options);

      expect(mockContext.compare).toHaveBeenCalledWith(otherContext, options);
    });

    it('should handle comparison with ExternalContextManager', () => {
      const otherManager = new ExternalContextManager();
      manager.compare(otherManager.context);

      expect(mockContext.compare).toHaveBeenCalledWith(otherManager.context, {});
    });
  });

  describe('merge method', () => {
    let manager;
    let targetContext;

    beforeEach(() => {
      manager = new ExternalContextManager();
      targetContext = new Context();

      const mockMergeResult = {
        success: true,
        itemsProcessed: 5,
        conflicts: 1,
        changes: ['item1', 'item2'],
        statistics: {
          sourcePreferred: 3,
          targetPreferred: 2,
          created: 1,
          updated: 4,
          skipped: 0
        }
      };

      mockContext.merge.mockReturnValue(mockMergeResult);
    });

    it('should merge with default strategy and options', () => {
      const result = manager.merge(targetContext);

      expect(mockContext.merge).toHaveBeenCalledWith(
        targetContext,
        'mergeNewerWins',
        {}
      );
      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(5);
    });

    it('should merge with custom strategy', () => {
      const strategy = 'mergeSourcePriority';
      const result = manager.merge(targetContext, strategy);

      expect(mockContext.merge).toHaveBeenCalledWith(
        targetContext,
        strategy,
        {}
      );
    });

    it('should merge with custom options', () => {
      const strategy = 'mergeNewerWins';
      const options = {
        compareBy: 'createdAt',
        preserveMetadata: false,
        excludeComponents: ['schema'],
        dryRun: true
      };

      const result = manager.merge(targetContext, strategy, options);

      expect(mockContext.merge).toHaveBeenCalledWith(
        targetContext,
        strategy,
        options
      );
    });

    it('should merge with ExternalContextManager target', () => {
      const targetManager = new ExternalContextManager();
      const result = manager.merge(targetManager);

      expect(mockContext.merge).toHaveBeenCalledWith(
        targetManager.context,
        'mergeNewerWins',
        {}
      );
    });

    it('should handle merge with custom conflict resolution', () => {
      const onConflict = jest.fn((sourceItem, targetItem, path) => {
        if (path.includes('critical')) return sourceItem;
        return null;
      });

      const options = { onConflict };
      manager.merge(targetContext, 'mergeNewerWins', options);

      expect(mockContext.merge).toHaveBeenCalledWith(
        targetContext,
        'mergeNewerWins',
        options
      );
    });

    it('should merge with all available strategies', () => {
      const strategies = [
        'mergeNewerWins',
        'mergeSourcePriority',
        'mergeTargetPriority',
        'updateSourceToTarget',
        'updateTargetToSource',
        'replace',
        'noAction'
      ];

      strategies.forEach(strategy => {
        manager.merge(targetContext, strategy);
        expect(mockContext.merge).toHaveBeenCalledWith(
          targetContext,
          strategy,
          {}
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid root determination', () => {
      RootMapParser.parse.mockImplementationOnce(() => {
        throw new Error('Invalid root');
      });

      expect(() => {
        new ExternalContextManager({
          rootIdentifier: 'invalidRoot'
        });
      }).toThrow('Invalid root identifier: invalidRoot');
    });

    it('should handle invalid context root type', () => {
      RootMapParser.parse.mockReturnValue(null);

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Invalid context root');
    });

    it('should handle invalid path from root', () => {
      expect(() => {
        new ExternalContextManager({
          pathFromRoot: ''  // Empty string should trigger validation
        });
      }).toThrow('Invalid configuration: rootIdentifier, pathFromRoot, and rootMap must be defined');
    });

    it('should handle context merge errors', () => {
      const existingContext = new Context();
      
      // Set up the mock to return a context root with an existing context at the path
      const contextRootWithExisting = { testPath: existingContext };
      RootMapParser.parse.mockReturnValueOnce(contextRootWithExisting);

      ContextMerger.merge.mockImplementationOnce(() => {
        throw new Error('Merge operation failed');
      });

      expect(() => {
        new ExternalContextManager();
      }).toThrow('Context merge operation failed: Merge operation failed');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical user data management scenario', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        preferences: { theme: 'dark' }
      };

      const manager = new ExternalContextManager({
        initializationParams: {
          data: { user: userData },
          settings: { autoSave: true }
        }
      });

      expect(manager.data).toBeDefined();
      expect(manager.settings).toBeDefined();
    });

    it('should handle configuration override scenario', () => {
      const customConfig = {
        rootIdentifier: 'memoryRoot',
        pathFromRoot: 'userContext',
        rootMap: { memoryRoot: {} }
      };

      RootMapParser.parse.mockReturnValue({});

      const manager = new ExternalContextManager(customConfig);

      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: customConfig.rootMap,
        key: customConfig.rootIdentifier
      });
    });

    it('should handle multi-context synchronization scenario', () => {
      const manager1 = new ExternalContextManager();
      const manager2 = new ExternalContextManager();

      const mockMergeResult = {
        success: true,
        itemsProcessed: 10,
        conflicts: 2,
        changes: ['userData', 'settings'],
        statistics: {
          sourcePreferred: 5,
          targetPreferred: 3,
          created: 2,
          updated: 8,
          skipped: 0
        }
      };

      mockContext.merge.mockReturnValue(mockMergeResult);

      const result = manager1.merge(manager2, 'mergeNewerWins', {
        excludeComponents: ['schema', 'constants'],
        preserveMetadata: true
      });

      expect(result.success).toBe(true);
      expect(result.conflicts).toBe(2);
      expect(result.changes).toContain('userData');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initialization parameters', () => {
      const manager = new ExternalContextManager({
        initializationParams: {}
      });

      expect(manager).toBeInstanceOf(ExternalContextManager);
    });

    it('should handle undefined root identifier with fallback', () => {
      const manager = new ExternalContextManager({
        rootIdentifier: undefined
      });

      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: mockRootMap,
        key: 'testRoot' // Should use default from config
      });
    });

    it('should handle comparison with null context', () => {
      const manager = new ExternalContextManager();

      mockContext.compare.mockReturnValue({
        added: [],
        removed: [],
        modified: [],
        unchanged: []
      });

      const result = manager.compare(null);

      expect(mockContext.compare).toHaveBeenCalledWith(null, {});
    });

    it('should handle merge with invalid target gracefully', () => {
      const manager = new ExternalContextManager();

      mockContext.merge.mockReturnValue({
        success: false,
        error: 'Invalid target context'
      });

      const result = manager.merge(null);

      expect(result.success).toBe(false);
    });
  });

  describe('Constants Integration', () => {
    it('should work with different constants configurations', () => {
      const alternateConfig = {
        defaults: {
          rootIdentifier: 'alternateRoot',
          pathFromRoot: 'alternatePath'
        },
        rootMap: { alternateRoot: 'alternateValue' }
      };

      const alternateConstants = {
        getItem: jest.fn(() => ({ getItem: jest.fn(() => alternateConfig) }))
      };

      const alternateContext = {
        ...mockContext,
        constants: alternateConstants
      };

      Context.mockImplementationOnce(() => alternateContext);

      const manager = new ExternalContextManager();

      expect(RootMapParser.parse).toHaveBeenCalledWith({
        rootMap: alternateConfig.rootMap,
        key: alternateConfig.defaults.rootIdentifier
      });
    });

    it('should handle constants with different structure', () => {
      const directConstants = {
        context: {
          external: mockConfiguration
        }
      };

      const directConstantsContainer = {
        getItem: jest.fn(() => null),
        context: directConstants.context
      };

      const directContext = {
        ...mockContext,
        constants: directConstantsContainer
      };

      Context.mockImplementationOnce(() => directContext);

      const manager = new ExternalContextManager();

      expect(manager).toBeInstanceOf(ExternalContextManager);
    });
  });
});