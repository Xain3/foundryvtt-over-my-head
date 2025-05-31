import Context, { DEFAULT_INITIALIZATION_PARAMS } from './context.js';
import { ContextContainer } from './helpers/contextContainer.js';
import ContextMerger from './helpers/contextMerger.js';
import ContextSync from './helpers/contextSync.js';
import ContextOperations from './helpers/contextOperations.js';
import Validator from '@utils/static/validator';
import manifest from '@manifest';
import constants from '@constants';

/**
 * @file context.test.js
 * @description Unit tests for Context class with comprehensive testing of initialization, operations, and merge functionality.
 * @path /src/contexts/context.test.js
 */


// Mock external dependencies
jest.mock('@utils/static/validator');
jest.mock('./helpers/contextMerger.js');
jest.mock('./helpers/contextSync.js');
jest.mock('./helpers/contextOperations.js');
jest.mock('@manifest', () => ({
  name: 'test-module',
  version: '1.0.0',
  description: 'Test module'
}));
jest.mock('@constants', () => ({
  context: {
    schema: { version: '1.0', type: 'context' },
    naming: { data: 'data', settings: 'settings', flags: 'flags' },
    operationsParams: {
      defaults: {
        alwaysPullBeforeGetting: false,
        alwaysPullBeforeSetting: false,
        pullFrom: [],
        alwaysPushAfterSetting: false,
        pushTo: [],
        errorHandling: {
          onPullError: 'warn',
          onPushError: 'warn',
          onValidationError: 'throw'
        }
      }
    }
  },
  flags: { debug: false }
}));

describe('Context', () => {
  let mockMergeResult;
  let mockCompareResult;
  let mockOperationsResult;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockMergeResult = {
      success: true,
      strategy: 'mergeNewerWins',
      itemsProcessed: 5,
      conflicts: 2,
      changes: [
        { action: 'updated', path: 'data.test', timestamp: Date.now() }
      ],
      statistics: {
        sourcePreferred: 1,
        targetPreferred: 1,
        created: 0,
        updated: 1,
        skipped: 2
      },
      errors: []
    };

    mockCompareResult = {
      isNewer: true,
      timeDifference: 1000,
      sourceTimestamp: Date.now(),
      targetTimestamp: Date.now() - 1000
    };

    mockOperationsResult = {
      success: true,
      itemsProcessed: 3,
      conflicts: 1,
      changes: [
        { action: 'pulled', path: 'data.item', timestamp: Date.now() }
      ]
    };

    ContextMerger.merge.mockReturnValue(mockMergeResult);
    ContextMerger.analyze.mockReturnValue(mockMergeResult);
    ContextSync.compare.mockReturnValue(mockCompareResult);
    ContextOperations.pullItems.mockReturnValue(mockOperationsResult);
    ContextOperations.pushItems.mockReturnValue(mockOperationsResult);

    // Setup validator mocks
    Validator.validateArgsObjectStructure.mockImplementation(() => {});
    Validator.validateSchemaDefinition.mockImplementation(() => {});
    Validator.validateObject.mockImplementation(() => {});
    Validator.validateStringAgainstPattern.mockImplementation(() => {});
  });

  describe('Constructor', () => {
    describe('Basic initialization', () => {
      it('should create context with default parameters', () => {
        const context = new Context();

        expect(context).toBeInstanceOf(Context);
        expect(context).toBeInstanceOf(ContextContainer);
        expect(context.schema).toBeDefined();
        expect(context.constants).toBeDefined();
        expect(context.manifest).toBeDefined();
        expect(context.flags).toBeDefined();
        expect(context.state).toBeDefined();
        expect(context.data).toBeDefined();
        expect(context.settings).toBeDefined();
      });

      it('should create context with custom initialization parameters', () => {
        const customData = { test: 'value' };
        const customSettings = { volume: 0.8 };
        const customFlags = { debug: true };

        const context = new Context({
          initializationParams: {
            data: customData,
            settings: customSettings,
            flags: customFlags
          }
        });

        expect(context.data.getItem('test')).toBe('value');
        expect(context.settings.getItem('volume')).toBe(0.8);
        expect(context.flags.getItem('debug')).toBe(true);
      });

      it('should create context with custom operations parameters', () => {
        const customOpsParams = {
          alwaysPullBeforeGetting: true,
          alwaysPushAfterSetting: true,
          pullFrom: [],
          pushTo: []
        };

        const context = new Context({
          operationsParams: customOpsParams
        });

        expect(context).toBeInstanceOf(Context);
      });

      it('should freeze schema, constants, and manifest items', () => {
        const context = new Context();

        expect(Object.isFrozen(context.schema.value)).toBe(true);
        expect(Object.isFrozen(context.constants.value)).toBe(true);
        expect(Object.isFrozen(context.manifest.value)).toBe(true);
      });

      it('should initialize empty state container', () => {
        const context = new Context();

        expect(context.state).toBeInstanceOf(ContextContainer);
        expect(Object.keys(context.state.value)).toHaveLength(0);
      });
    });

    describe('Parameter validation', () => {
      it('should validate constructor arguments', () => {
        new Context();

        expect(Validator.validateArgsObjectStructure).toHaveBeenCalled();
        expect(Validator.validateSchemaDefinition).toHaveBeenCalled();
        expect(Validator.validateObject).toHaveBeenCalledWith(
          expect.any(Object),
          'Naming convention'
        );
      });

      it('should validate naming convention patterns', () => {
        new Context();

        expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('Naming convention'),
          /^[a-zA-Z0-9_]+$/,
          'alphanumeric characters and underscores',
          { allowEmpty: false }
        );
      });

      it('should throw error for invalid operations parameters', () => {
        expect(() => {
          new Context({
            operationsParams: {
              pullFrom: 'not-an-array'
            }
          });
        }).toThrow('operationsParams.pullFrom must be an array');
      });

      it('should throw error for invalid context instances in operations params', () => {
        expect(() => {
          new Context({
            operationsParams: {
              pullFrom: [{ notAContext: true }]
            }
          });
        }).toThrow('Context at index 0 is not a valid Context instance');
      });
    });
  });

  describe('Item Operations', () => {
    let context;

    beforeEach(() => {
      context = new Context();
    });

    describe('setItem', () => {
      it('should set item without pull/push operations by default', () => {
        context.setItem('data.test', 'value');

        expect(context.data.getItem('test')).toBe('value');
        expect(ContextOperations.pullItems).not.toHaveBeenCalled();
        expect(ContextOperations.pushItems).not.toHaveBeenCalled();
      });

      it('should perform pull operation when configured', () => {
        const sourceContext = new Context();
        sourceContext.data.setItem('test', 'sourceValue');

        context.setItem('data.test', 'value', {
          pull: true,
          pullFrom: [sourceContext]
        });

        expect(ContextOperations.pullItems).toHaveBeenCalledWith(
          sourceContext,
          context,
          ['data.test'],
          'mergeNewerWins',
          { dryRun: true }
        );
      });

      it('should perform push operation when configured', () => {
        const targetContext = new Context();

        context.setItem('data.test', 'value', {
          push: true,
          pushTo: [targetContext]
        });

        expect(ContextOperations.pushItems).toHaveBeenCalledWith(
          context,
          targetContext,
          ['data.test'],
          'mergeSourcePriority'
        );
      });

      it('should handle pull errors gracefully', () => {
        const sourceContext = new Context();
        ContextOperations.pullItems.mockImplementationOnce(() => {
          throw new Error('Pull failed');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        context.setItem('data.test', 'value', {
          pull: true,
          pullFrom: [sourceContext]
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          'Pull failed:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });

      it('should handle push errors gracefully', () => {
        const targetContext = new Context();
        ContextOperations.pushItems.mockImplementationOnce(() => {
          throw new Error('Push failed');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        context.setItem('data.test', 'value', {
          push: true,
          pushTo: [targetContext]
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          'Push failed:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe('pullAndGetItem', () => {
      it('should return undefined when no pull sources configured', () => {
        const result = context.pullAndGetItem({ itemPath: 'data.test' });

        expect(result).toBeUndefined();
        expect(ContextOperations.pullItems).not.toHaveBeenCalled();
      });

      it('should return undefined when pullFrom array is empty', () => {
        const result = context.pullAndGetItem({
          itemPath: 'data.test',
          pullFrom: []
        });

        expect(result).toBeUndefined();
      });

      it('should pull and return item from source context', () => {
        const sourceContext = new Context();
        sourceContext.data.setItem('test', 'sourceValue');

        // Mock successful pull with changes
        ContextOperations.pullItems.mockReturnValue({
          success: true,
          changes: [{ path: 'data.test' }]
        });

        const result = context.pullAndGetItem({
          itemPath: 'data.test',
          pullFrom: [sourceContext]
        });

        expect(ContextOperations.pullItems).toHaveBeenCalledWith(
          sourceContext,
          context,
          ['data.test'],
          'mergeNewerWins',
          { dryRun: true }
        );
        expect(result).toBeDefined();
      });

      it('should return undefined when pull operation has no changes', () => {
        const sourceContext = new Context();

        ContextOperations.pullItems.mockReturnValue({
          success: true,
          changes: []
        });

        const result = context.pullAndGetItem({
          itemPath: 'data.test',
          pullFrom: [sourceContext]
        });

        expect(result).toBeUndefined();
      });

      it('should handle pull errors and return undefined', () => {
        const sourceContext = new Context();
        ContextOperations.pullItems.mockImplementationOnce(() => {
          throw new Error('Pull failed');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = context.pullAndGetItem({
          itemPath: 'data.test',
          pullFrom: [sourceContext]
        });

        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to pull and get item data.test:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });

      it('should try multiple sources and return first successful pull', () => {
        const sourceContext1 = new Context();
        const sourceContext2 = new Context();
        sourceContext2.data.setItem('test', 'value2');

        // First source fails, second succeeds
        ContextOperations.pullItems
          .mockReturnValueOnce({ success: true, changes: [] })
          .mockReturnValueOnce({ success: true, changes: [{ path: 'data.test' }] });

        const result = context.pullAndGetItem({
          itemPath: 'data.test',
          pullFrom: [sourceContext1, sourceContext2]
        });

        expect(ContextOperations.pullItems).toHaveBeenCalledTimes(2);
        expect(result).toBeDefined();
      });
    });
  });

  describe('Property Getters', () => {
    let context;

    beforeEach(() => {
      context = new Context();
    });

    it('should return schema property', () => {
      const schema = context.schema;

      expect(schema).toBeInstanceOf(ContextContainer);
      expect(schema.value).toEqual(constants.context.schema);
    });

    it('should return constants property', () => {
      const contextConstants = context.constants;

      expect(contextConstants).toBeInstanceOf(ContextContainer);
      expect(contextConstants.value).toEqual(constants);
    });

    it('should return manifest property', () => {
      const contextManifest = context.manifest;

      expect(contextManifest).toBeInstanceOf(ContextContainer);
      expect(contextManifest.value).toEqual(manifest);
    });

    it('should return flags property', () => {
      const flags = context.flags;

      expect(flags).toBeInstanceOf(ContextContainer);
      expect(flags.value).toEqual(constants.flags);
    });

    it('should return state property', () => {
      const state = context.state;

      expect(state).toBeInstanceOf(ContextContainer);
      expect(typeof state.value).toBe('object');
    });

    it('should return data property', () => {
      const data = context.data;

      expect(data).toBeInstanceOf(ContextContainer);
      expect(typeof data.value).toBe('object');
    });

    it('should return settings property', () => {
      const settings = context.settings;

      expect(settings).toBeInstanceOf(ContextContainer);
      expect(typeof settings.value).toBe('object');
    });

    it('should return namingConvention property', () => {
      const naming = context.namingConvention;

      expect(naming).toBeInstanceOf(ContextContainer);
      expect(Object.isFrozen(naming.value)).toBe(true);
    });

    it('should trigger pull operation when alwaysPullBeforeGetting is enabled', () => {
      const sourceContext = new Context();
      const contextWithPull = new Context({
        operationsParams: {
          alwaysPullBeforeGetting: true,
          pullFrom: [sourceContext]
        }
      });

      // Mock to simulate cooldown passed
      Date.now = jest.fn().mockReturnValue(2000);

      contextWithPull.data;

      expect(ContextOperations.pullItems).toHaveBeenCalled();
    });
  });

  describe('Merge Operations', () => {
    let context;
    let targetContext;

    beforeEach(() => {
      context = new Context();
      targetContext = new Context();
    });

    describe('merge', () => {
      it('should call ContextMerger.merge with correct parameters', () => {
        const strategy = 'mergeSourcePriority';
        const options = { preserveMetadata: true };

        const result = context.merge(targetContext, strategy, options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          strategy,
          options
        );
        expect(result).toEqual(mockMergeResult);
      });

      it('should use default strategy when not specified', () => {
        context.merge(targetContext);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeNewerWins',
          {}
        );
      });

      it('should pass through all merge options', () => {
        const options = {
          allowOnly: ['data.test'],
          preserveMetadata: false,
          dryRun: true
        };

        context.merge(targetContext, 'mergeTargetPriority', options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeTargetPriority',
          options
        );
      });
    });

    describe('mergeItem', () => {
      it('should merge single item successfully', () => {
        const itemPath = 'data.testItem';
        const strategy = 'mergeSourcePriority';

        const result = context.mergeItem(targetContext, itemPath, strategy);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          strategy,
          { singleItem: itemPath }
        );

        expect(result.success).toBe(true);
        expect(result.itemPath).toBe(itemPath);
        expect(result.wasConflict).toBe(true);
        expect(result.changes).toEqual(mockMergeResult.changes);
      });

      it('should throw error for missing itemPath', () => {
        expect(() => {
          context.mergeItem(targetContext, '');
        }).toThrow('itemPath must be a non-empty string');

        expect(() => {
          context.mergeItem(targetContext, null);
        }).toThrow('itemPath must be a non-empty string');
      });

      it('should use default strategy when not specified', () => {
        const itemPath = 'data.testItem';

        context.mergeItem(targetContext, itemPath);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeNewerWins',
          { singleItem: itemPath }
        );
      });

      it('should pass additional options correctly', () => {
        const itemPath = 'data.testItem';
        const options = { preserveMetadata: false, dryRun: true };

        context.mergeItem(targetContext, itemPath, 'mergeSourcePriority', options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeSourcePriority',
          { ...options, singleItem: itemPath }
        );
      });

      it('should determine resolution correctly when no conflict', () => {
        ContextMerger.merge.mockReturnValue({
          ...mockMergeResult,
          conflicts: 0
        });

        const result = context.mergeItem(targetContext, 'data.test');

        expect(result.wasConflict).toBe(false);
        expect(result.resolution).toBeNull();
      });

      it('should handle custom conflict resolution', () => {
        const customResolver = jest.fn();
        const options = { onConflict: customResolver };

        context.mergeItem(targetContext, 'data.test', 'mergeNewerWins', options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeNewerWins',
          { ...options, singleItem: 'data.test' }
        );
      });
    });

    describe('analyzeMerge', () => {
      it('should call ContextMerger.analyze with correct parameters', () => {
        const strategy = 'mergeSourcePriority';
        const options = { includeComponents: ['data'] };

        const result = context.analyzeMerge(targetContext, strategy, options);

        expect(ContextMerger.analyze).toHaveBeenCalledWith(
          context,
          targetContext,
          strategy,
          options
        );
        expect(result).toEqual(mockMergeResult);
      });

      it('should use default strategy when not specified', () => {
        context.analyzeMerge(targetContext);

        expect(ContextMerger.analyze).toHaveBeenCalledWith(
          context,
          targetContext,
          'mergeNewerWins',
          {}
        );
      });
    });
  });

  describe('Comparison Operations', () => {
    let context;
    let targetContext;

    beforeEach(() => {
      context = new Context();
      targetContext = new Context();
    });

    it('should call ContextSync.compare with correct parameters', () => {
      const options = { compareBy: 'createdAt' };

      const result = context.compare(targetContext, options);

      expect(ContextSync.compare).toHaveBeenCalledWith(
        context,
        targetContext,
        options
      );
      expect(result).toEqual(mockCompareResult);
    });

    it('should use context as default source', () => {
      context.compare(targetContext);

      expect(ContextSync.compare).toHaveBeenCalledWith(
        context,
        targetContext,
        {}
      );
    });

    it('should allow custom source context', () => {
      const customSource = new Context();
      const options = { sourceContext: customSource };

      context.compare(targetContext, options);

      expect(ContextSync.compare).toHaveBeenCalledWith(
        customSource,
        targetContext,
        {}
      );
    });
  });

  describe('Performance Metrics', () => {
    let context;

    beforeEach(() => {
      context = new Context();
    });

    it('should return performance metrics object', () => {
      const metrics = context.getPerformanceMetrics();

      expect(metrics).toEqual({
        pullOperations: 0,
        pushOperations: 0,
        averagePullTime: 0,
        averagePushTime: 0
      });
    });

    it('should return a copy of metrics (not reference)', () => {
      const metrics1 = context.getPerformanceMetrics();
      const metrics2 = context.getPerformanceMetrics();

      expect(metrics1).not.toBe(metrics2);
      expect(metrics1).toEqual(metrics2);
    });
  });

  describe('Error Handling', () => {
    let context;
    let consoleSpy;

    beforeEach(() => {
      context = new Context();
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle pull errors with warn strategy', () => {
      const sourceContext = new Context();
      const error = new Error('Pull failed');

      ContextOperations.pullItems.mockImplementationOnce(() => {
        throw error;
      });

      context.setItem('data.test', 'value', {
        pull: true,
        pullFrom: [sourceContext]
      });

      expect(consoleSpy).toHaveBeenCalledWith('Pull failed:', error);
    });

    it('should handle push errors with warn strategy', () => {
      const targetContext = new Context();
      const error = new Error('Push failed');

      ContextOperations.pushItems.mockImplementationOnce(() => {
        throw error;
      });

      context.setItem('data.test', 'value', {
        push: true,
        pushTo: [targetContext]
      });

      expect(consoleSpy).toHaveBeenCalledWith('Push failed:', error);
    });

    it('should throw errors when configured with throw strategy', () => {
      const errorThrowingContext = new Context({
        operationsParams: {
          errorHandling: {
            onPullError: 'throw'
          }
        }
      });

      const sourceContext = new Context();
      ContextOperations.pullItems.mockImplementationOnce(() => {
        throw new Error('Pull failed');
      });

      expect(() => {
        errorThrowingContext.setItem('data.test', 'value', {
          pull: true,
          pullFrom: [sourceContext]
        });
      }).toThrow('Pull failed');
    });

    it('should silently handle errors when configured with silent strategy', () => {
      const silentContext = new Context({
        operationsParams: {
          errorHandling: {
            onPullError: 'silent'
          }
        }
      });

      const sourceContext = new Context();
      ContextOperations.pullItems.mockImplementationOnce(() => {
        throw new Error('Pull failed');
      });

      silentContext.setItem('data.test', 'value', {
        pull: true,
        pullFrom: [sourceContext]
      });

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle context with no data gracefully', () => {
      const emptyContext = new Context({
        initializationParams: {
          data: {},
          settings: {},
          flags: {}
        }
      });

      expect(emptyContext.data).toBeInstanceOf(ContextContainer);
      expect(Object.keys(emptyContext.data.value)).toHaveLength(0);
    });

    it('should handle null/undefined values in initialization', () => {
      const context = new Context({
        initializationParams: {
          data: { nullValue: null, undefinedValue: undefined },
          settings: { emptyString: '' }
        }
      });

      expect(context.data.getItem('nullValue')).toBeNull();
      expect(context.data.getItem('undefinedValue')).toBeUndefined();
      expect(context.settings.getItem('emptyString')).toBe('');
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        player: {
          stats: {
            level: 10,
            experience: 1500,
            skills: ['magic', 'combat']
          },
          inventory: {
            items: [
              { id: 1, name: 'sword', quantity: 1 },
              { id: 2, name: 'potion', quantity: 5 }
            ]
          }
        }
      };

      const context = new Context({
        initializationParams: {
          data: complexData
        }
      });

      expect(context.data.getItem('player.stats.level')).toBe(10);
      expect(context.data.getItem('player.inventory.items')).toHaveLength(2);
    });

    it('should handle concurrent pull operations with cooldown', () => {
      let currentTime = 1000;
      Date.now = jest.fn().mockImplementation(() => currentTime);

      const sourceContext = new Context();
      const contextWithCooldown = new Context({
        operationsParams: {
          alwaysPullBeforeGetting: true,
          pullFrom: [sourceContext]
        }
      });

      // First access - should pull
      contextWithCooldown.data;
      expect(ContextOperations.pullItems).toHaveBeenCalledTimes(1);

      // Second access within cooldown - should not pull
      currentTime = 1500;
      contextWithCooldown.data;
      expect(ContextOperations.pullItems).toHaveBeenCalledTimes(1);

      // Third access after cooldown - should pull again
      currentTime = 2100;
      contextWithCooldown.data;
      expect(ContextOperations.pullItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle game session context integration', () => {
      const playerContext = new Context({
        initializationParams: {
          data: {
            player: { id: 1, name: 'TestPlayer', level: 5 },
            inventory: { gold: 100, items: [] }
          },
          settings: {
            volume: 0.8,
            difficulty: 'normal'
          }
        }
      });

      const gameStateContext = new Context({
        initializationParams: {
          data: {
            currentMap: 'forest',
            enemies: ['goblin', 'orc'],
            questProgress: { mainQuest: 50 }
          }
        }
      });

      // Merge player data into game state
      const mergeResult = playerContext.merge(gameStateContext, 'mergeSourcePriority', {
        includeComponents: ['data'],
        allowOnly: ['data.player', 'data.inventory']
      });

      expect(ContextMerger.merge).toHaveBeenCalledWith(
        playerContext,
        gameStateContext,
        'mergeSourcePriority',
        {
          includeComponents: ['data'],
          allowOnly: ['data.player', 'data.inventory']
        }
      );
      expect(mergeResult.success).toBe(true);
    });

    it('should handle multi-context synchronization scenario', () => {
      const localContext = new Context({
        initializationParams: {
          data: { localData: 'local' },
          settings: { theme: 'dark' }
        }
      });

      const remoteContext = new Context({
        initializationParams: {
          data: { remoteData: 'remote' },
          settings: { language: 'en' }
        }
      });

      const cacheContext = new Context({
        initializationParams: {
          data: { cacheData: 'cached' }
        }
      });

      // Configure local context to pull from remote and cache
      const syncContext = new Context({
        operationsParams: {
          alwaysPullBeforeSetting: true,
          pullFrom: [remoteContext, cacheContext],
          alwaysPushAfterSetting: true,
          pushTo: [cacheContext]
        }
      });

      syncContext.setItem('data.newItem', 'newValue');

      expect(ContextOperations.pullItems).toHaveBeenCalled();
      expect(ContextOperations.pushItems).toHaveBeenCalled();
    });

    it('should handle error recovery in distributed context scenario', () => {
      const primaryContext = new Context();
      const backupContext = new Context({
        initializationParams: {
          data: { backup: 'data' }
        }
      });

      // Simulate primary context failure
      ContextOperations.pullItems
        .mockImplementationOnce(() => {
          throw new Error('Primary failed');
        })
        .mockReturnValueOnce({
          success: true,
          changes: [{ path: 'data.item' }]
        });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = primaryContext.pullAndGetItem({
        itemPath: 'data.item',
        pullFrom: [primaryContext, backupContext]
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle large data sets efficiently', () => {
      const largeData = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`item${i}`] = { id: i, value: `value${i}` };
      }

      const context = new Context({
        initializationParams: {
          data: largeData
        }
      });

      expect(context.data).toBeInstanceOf(ContextContainer);
      expect(Object.keys(context.data.value)).toHaveLength(1000);
    });

    it('should handle frequent merge operations', () => {
      const source = new Context({
        initializationParams: {
          data: { counter: 0 }
        }
      });

      const target = new Context();

      // Simulate frequent merges
      for (let i = 0; i < 10; i++) {
        source.merge(target, 'mergeSourcePriority', {
          singleItem: 'data.counter'
        });
      }

      expect(ContextMerger.merge).toHaveBeenCalledTimes(10);
    });
  });
});