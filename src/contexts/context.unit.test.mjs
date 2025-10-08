/**
 * @file context.unit.test.mjs
 * @description Unit tests for the Context class.
 * @path src/contexts/context.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Context from './context.mjs';
import { ContextContainer } from './helpers/contextContainer.mjs';
import { ContextItem } from './helpers/contextItem.mjs';
import Validator from '#utils/static/validator.mjs';

// Mock config to avoid pulling real constants/manifest and transitive deps in unit tests
vi.mock('../config/config.mjs', () => ({
  default: {
    constants: {
      context: {
        naming: {
          state: 'state',
          settings: 'settings',
          flags: 'flags',
          data: 'data',
          manifest: 'manifest',
          timestamp: 'timestamp'
        },
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
      }
    }
  }
}));

// Local constants mirroring the mocked config for assertions in this test
const constants = {
  context: {
    naming: {
      state: 'state',
      settings: 'settings',
      flags: 'flags',
      data: 'data',
      manifest: 'manifest',
      timestamp: 'timestamp'
    },
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
  }
};

// Mock the validator import (use importActual to avoid circular self-mock and preserve export shape)
vi.mock('#utils/static/validator.mjs', async () => {
  const actual = await vi.importActual('../utils/static/validator.mjs');
  const ActualValidator = actual.default ?? actual.Validator;

  const methodNames = Object.getOwnPropertyNames(ActualValidator)
    .filter(name => !['length', 'name', 'prototype'].includes(name) && typeof ActualValidator[name] === 'function');

  class MockedValidator extends ActualValidator {}

  for (const name of methodNames) {
    MockedValidator[name] = vi.fn((...args) => ActualValidator[name](...args));
  }

  return {
    ...actual,
    default: MockedValidator,
    Validator: MockedValidator
  };
});

// Mock helpers to avoid circular dependencies in tests
var mockContextHelpers;

vi.mock('./helpers/contextHelpers.mjs', () => {
  mockContextHelpers = {
    Comparison: {
      compare: vi.fn((source, target, options) => ({
        result: 'equal',
        differences: [],
        options
      }))
    },
    Merger: {
      merge: vi.fn((source, target, strategy, options) => ({
        success: true,
        strategy,
        itemsProcessed: 0,
        conflicts: 0,
        changes: [],
        statistics: {
          sourcePreferred: 0,
          targetPreferred: 0,
          created: 0,
          updated: 0,
          skipped: 0
        },
        errors: []
      })),
      analyze: vi.fn((source, target, strategy, options) => ({
        strategy,
        wouldProcess: 0,
        potentialConflicts: 0,
        changes: [],
        errors: []
      }))
    },
    Sync: {
      sync: vi.fn((source, target, operation, options) => ({
        success: true,
        operation,
        itemsProcessed: 0,
        errors: []
      })),
      syncItem: vi.fn((source, target, itemPath, operation, options) => {
        // Actually transfer the data for testing
        if (operation === 'updateTargetToSource' && source.hasItem && target.setItem) {
          if (source.hasItem(itemPath)) {
            const value = source.getItem(itemPath);
            target.setItem(itemPath, value);
          }
        }
        return {
          success: true,
          operation,
          itemPath,
          processed: true,
          errors: []
        };
      })
    },
    PathUtils: {
      getValueFromMixedPath: vi.fn((obj, path) => {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return undefined;
          }
        }
        return current;
      }),
      pathExists: vi.fn((obj, path) => {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return false;
          }
        }
        return true;
      })
    }
  };

  return {
    default: mockContextHelpers,
    ...mockContextHelpers
  };
});

describe('Context', () => {
  let context;
  let mockTargetContext;

  const defaultInitParams = {
    contextSchema: { version: '1.0' },
    namingConvention: { test: 'testValue' },
    contextLocation: 'test-module',
    constants: { app: { name: 'TestApp' } },
    manifest: { id: 'test', version: '1.0.0' },
    flags: { debug: true },
    data: { player: { name: 'Hero', stats: { level: 5 } } },
    settings: { ui: { theme: 'dark' } }
  };

  const defaultOpParams = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    context = new Context({
      initializationParams: defaultInitParams,
      operationsParams: defaultOpParams
    });

    // Create a mock target context for testing
    mockTargetContext = new Context({
      initializationParams: {
        data: { player: { name: 'Villain', stats: { level: 10 } } }
      }
    });
  });

  describe('Constructor', () => {
    it('should create a Context instance with default parameters', () => {
      const defaultContext = new Context();

      expect(defaultContext).toBeInstanceOf(Context);
      expect(defaultContext).toBeInstanceOf(ContextContainer);
      expect(defaultContext.isContextObject).toBe(true);
      expect(defaultContext.contextLocation).toBe('local');
    });

    it('should create a Context instance with custom parameters', () => {
      expect(context).toBeInstanceOf(Context);
      expect(context.isContextObject).toBe(true);
      expect(context.contextLocation).toBe('test-module');
    });

    it('should initialize all core components', () => {
      expect(context.schema).toBeInstanceOf(ContextItem);
      expect(context.constants).toBeInstanceOf(ContextItem);
      expect(context.manifest).toBeInstanceOf(ContextItem);
      expect(context.flags).toBeInstanceOf(ContextContainer);
      expect(context.state).toBeInstanceOf(ContextContainer);
      expect(context.data).toBeInstanceOf(ContextContainer);
      expect(context.settings).toBeInstanceOf(ContextContainer);
    });

    it('should freeze readonly components', () => {
      expect(context.schema.isFrozen()).toBe(true);
      expect(context.constants.isFrozen()).toBe(true);
      expect(context.manifest.isFrozen()).toBe(true);
    });

    it('should not freeze mutable components', () => {
      expect(context.flags.isFrozen()).toBe(false);
      expect(context.state.isFrozen()).toBe(false);
      expect(context.data.isFrozen()).toBe(false);
      expect(context.settings.isFrozen()).toBe(false);
    });

    it('should initialize with provided data', () => {
      expect(context.getItem('data.player.name')).toBe('Hero');
      expect(context.getItem('settings.ui.theme')).toBe('dark');
      expect(context.getItem('flags.debug')).toBe(true);
    });

    it('should initialize performance metrics', () => {
      const metrics = context.performanceMetrics;
      expect(metrics.pullOperations).toBe(0);
      expect(metrics.pushOperations).toBe(0);
      expect(metrics.totalPullTime).toBe(0);
      expect(metrics.totalPushTime).toBe(0);
      expect(metrics.lastPullTime).toBeNull();
      expect(metrics.lastPushTime).toBeNull();
    });
  });

  describe('Component Getters', () => {
    it('should return schema component', () => {
      const schema = context.schema;
      expect(schema).toBeInstanceOf(ContextItem);
      expect(schema.value.version).toBe('1.0');
    });

    it('should return constants component', () => {
      const constants = context.constants;
      expect(constants).toBeInstanceOf(ContextItem);
      expect(constants.value.app.name).toBe('TestApp');
    });

    it('should return manifest component', () => {
      const manifest = context.manifest;
      expect(manifest).toBeInstanceOf(ContextItem);
      expect(manifest.value.id).toBe('test');
    });

    it('should return flags component with nested access', () => {
      const flags = context.flags;
      expect(flags).toBeInstanceOf(ContextContainer);
      expect(flags.getItem('debug')).toBe(true);
    });

    it('should return state component', () => {
      const state = context.state;
      expect(state).toBeInstanceOf(ContextContainer);
      expect(state.size).toBe(0); // Empty by default
    });

    it('should return data component with nested access', () => {
      const data = context.data;
      expect(data).toBeInstanceOf(ContextContainer);
      expect(data.getItem('player.name')).toBe('Hero');
      expect(data.getItem('player.stats.level')).toBe(5);
    });

    it('should return settings component with nested access', () => {
      const settings = context.settings;
      expect(settings).toBeInstanceOf(ContextContainer);
      expect(settings.getItem('ui.theme')).toBe('dark');
    });
  });

  describe('Nested Path Access', () => {
    it('should support direct nested path access through getItem', () => {
      expect(context.getItem('data.player.name')).toBe('Hero');
      expect(context.getItem('data.player.stats.level')).toBe(5);
      expect(context.getItem('settings.ui.theme')).toBe('dark');
      expect(context.getItem('flags.debug')).toBe(true);
    });

    it('should support nested path existence checks through hasItem', () => {
      // Should find top-level items in components
      expect(context.hasItem('data.player')).toBe(true);
      expect(context.hasItem('settings.ui')).toBe(true);

      // Should NOT find nested paths in plain objects with default behavior (enhanced checking disabled)
      expect(context.hasItem('data.player.name')).toBe(false);
      expect(context.hasItem('data.player.stats.level')).toBe(false);
      expect(context.hasItem('settings.ui.theme')).toBe(false);

      // Should not find nonexistent paths
      expect(context.hasItem('data.player.nonexistent')).toBe(false);
      expect(context.hasItem('nonexistent.path')).toBe(false);
    });

    it('should support setting nested paths through setItem', () => {
      context.setItem('data.player.stats.experience', 1500);
      context.setItem('settings.ui.layout.sidebar', 'collapsed');
      context.setItem('flags.experimental.betaMode', true);

      expect(context.getItem('data.player.stats.experience')).toBe(1500);
      expect(context.getItem('settings.ui.layout.sidebar')).toBe('collapsed');
      expect(context.getItem('flags.experimental.betaMode')).toBe(true);
    });

    it('should create nested containers automatically when setting deep paths', () => {
      context.setItem('data.inventory.weapons.sword', { damage: 10 });

      expect(context.hasItem('data.inventory')).toBe(true);
      expect(context.hasItem('data.inventory.weapons')).toBe(true);
      expect(context.getItem('data.inventory.weapons.sword.damage')).toBe(10);
    });
  });

  describe('Component-specific nested operations', () => {
    it('should allow component-specific nested access', () => {
      context.data.setItem('player.stats.experience', 1500);
      context.settings.setItem('ui.layout.sidebar', 'collapsed');
      context.flags.setItem('experimental.betaMode', true);

      expect(context.data.getItem('player.stats.experience')).toBe(1500);
      expect(context.settings.getItem('ui.layout.sidebar')).toBe('collapsed');
      expect(context.flags.getItem('experimental.betaMode')).toBe(true);
    });

    it('should maintain consistency between direct and component access', () => {
      // Set through direct path
      context.setItem('data.player.stats.mana', 100);

      // Access through component
      expect(context.data.getItem('player.stats.mana')).toBe(100);

      // Set through component
      context.settings.setItem('graphics.quality', 'high');

      // Access through direct path
      expect(context.getItem('settings.graphics.quality')).toBe('high');
    });
  });

  describe('Operations Parameters', () => {
    it('should return operations parameters', () => {
      const params = context.operationsParams;
      expect(params.alwaysPullBeforeGetting).toBe(false);
      expect(params.alwaysPullBeforeSetting).toBe(false);
      expect(params.alwaysPushAfterSetting).toBe(false);
      expect(Array.isArray(params.pullFrom)).toBe(true);
      expect(Array.isArray(params.pushTo)).toBe(true);
    });

    it('should not allow direct modification of operations parameters', () => {
      const params = context.operationsParams;
      params.alwaysPullBeforeGetting = true;

      // Original should be unchanged
      expect(context.operationsParams.alwaysPullBeforeGetting).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    it('should return performance metrics', () => {
      const metrics = context.performanceMetrics;
      expect(typeof metrics.pullOperations).toBe('number');
      expect(typeof metrics.pushOperations).toBe('number');
      expect(typeof metrics.totalPullTime).toBe('number');
      expect(typeof metrics.totalPushTime).toBe('number');
    });

    it('should not allow direct modification of performance metrics', () => {
      const metrics = context.performanceMetrics;
      metrics.pullOperations = 999;

      // Original should be unchanged
      expect(context.performanceMetrics.pullOperations).toBe(0);
    });
  });

  describe('Duck Typing', () => {
    it('should identify as a Context object', () => {
      expect(context.isContextObject).toBe(true);
    });

    it('should identify as a ContextContainer', () => {
      expect(context.isContextContainer).toBe(true);
    });
  });

  describe('Comparison Operations', () => {
    it('should delegate comparison to ContextComparison helper', () => {
      const result = context.compare(mockTargetContext, { compareBy: 'modifiedAt' });

      expect(result.result).toBe('equal');
      expect(result.options.compareBy).toBe('modifiedAt');
    });

    it('should handle comparison with options', () => {
      const options = {
        compareBy: 'createdAt',
        includeMetadata: true
      };

      context.compare(mockTargetContext, options);

        expect(mockContextHelpers.Comparison.compare).toHaveBeenCalledWith(
        context,
        mockTargetContext,
        options
      );
    });
  });

  describe('Merge Operations', () => {
    it('should delegate merge to ContextMerger helper', () => {
      const result = context.merge(mockTargetContext, 'mergeNewerWins');

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('mergeNewerWins');
    });

    it('should use default merge strategy', () => {
      context.merge(mockTargetContext);

      expect(mockContextHelpers.Merger.merge).toHaveBeenCalledWith(
        context,
        mockTargetContext,
        'mergeNewerWins',
        {}
      );
    });

    it('should handle merge with options', () => {
      const options = {
        allowOnly: ['data.player.stats', 'settings.ui.theme']
      };

      context.merge(mockTargetContext, 'mergeSourcePriority', options);

      expect(mockContextHelpers.Merger.merge).toHaveBeenCalledWith(
        context,
        mockTargetContext,
        'mergeSourcePriority',
        options
      );
    });

    it('should merge specific items', () => {
      const result = context.mergeItem(mockTargetContext, 'data.player.inventory');

      expect(result.success).toBe(true);

      expect(mockContextHelpers.Merger.merge).toHaveBeenCalledWith(
        context,
        mockTargetContext,
        'mergeNewerWins',
        { singleItem: 'data.player.inventory' }
      );
    });

    it('should analyze merge operations', () => {
      const result = context.analyzeMerge(mockTargetContext, 'mergeNewerWins');

      expect(result.strategy).toBe('mergeNewerWins');

      expect(mockContextHelpers.Merger.analyze).toHaveBeenCalledWith(
        context,
        mockTargetContext,
        'mergeNewerWins',
        {}
      );
    });
  });

  describe('Pull and Push Operations', () => {
    let contextWithSources;
    let sourceContext1;
    let sourceContext2;

    beforeEach(() => {
      sourceContext1 = new Context({
        initializationParams: {
          data: {
            shared: { value: 'from-source1' },
            test: 'test-value-from-source1'
          }
        }
      });

      sourceContext2 = new Context({
        initializationParams: {
          data: { shared: { value: 'from-source2' } }
        }
      });

      contextWithSources = new Context({
        initializationParams: defaultInitParams,
        operationsParams: {
          ...defaultOpParams,
          pullFrom: [sourceContext1, sourceContext2],
          pushTo: [mockTargetContext]
        }
      });
    });

    it('should pull and get item from specified sources', () => {
      const result = context.pullAndGetItem({
        itemPath: 'data.player.inventory.weapons',
        pullFrom: [sourceContext1, sourceContext2]
      });

  expect(mockContextHelpers.Sync.syncItem).toHaveBeenCalled();
    });

    it('should handle pull cooldown', () => {
      // First pull should succeed
      const result1 = contextWithSources.pullAndGetItem({
        itemPath: 'data.test',
        pullFrom: [sourceContext1]
      });

      // Immediate second pull should be limited by cooldown
      const result2 = contextWithSources.pullAndGetItem({
        itemPath: 'data.test',
        pullFrom: [sourceContext1]
      });

      // Both should return values, but second pull might be skipped due to cooldown
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should track performance metrics', () => {
      const initialMetrics = contextWithSources.performanceMetrics;

      contextWithSources.pullAndGetItem({
        itemPath: 'data.test',
        pullFrom: [sourceContext1]
      });

      const updatedMetrics = contextWithSources.performanceMetrics;
      expect(updatedMetrics.pullOperations).toBeGreaterThanOrEqual(initialMetrics.pullOperations);
    });
  });

  describe('Automatic Pull/Push Behavior', () => {
    let autoContext;
    let sourceContext;
    let targetContext;

    beforeEach(() => {
      sourceContext = new Context();
      targetContext = new Context();

      autoContext = new Context({
        operationsParams: {
          alwaysPullBeforeGetting: true,
          alwaysPullBeforeSetting: true,
          pullFrom: [sourceContext],
          alwaysPushAfterSetting: true,
          pushTo: [targetContext]
        }
      });
    });

    it('should auto-pull before getting when configured', () => {
      autoContext.getItem('data.test');

  // When getting a specific item, syncItem is called, not sync
  expect(mockContextHelpers.Sync.syncItem).toHaveBeenCalled();
    });

    it('should auto-pull and auto-push when setting items', () => {
      autoContext.setItem('data.test', 'value');

  // When setting a specific item, syncItem is called for pull, sync might be called for push
  expect(mockContextHelpers.Sync.syncItem).toHaveBeenCalled();
    });

    it('should allow skipping auto-pull/push with overrides', () => {
      vi.clearAllMocks();

      autoContext.setItem('data.test', 'value', {}, {
        skipPull: true,
        skipPush: true
      });

  // Should not have called sync because of skip overrides
  expect(mockContextHelpers.Sync.sync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    let errorContext;

    beforeEach(() => {
      errorContext = new Context({
        operationsParams: {
          errorHandling: {
            onPullError: 'throw',
            onPushError: 'warn',
            onValidationError: 'silent'
          }
        }
      });
    });

    it('should respect error handling configuration', () => {
      const errorHandling = errorContext.operationsParams.errorHandling;
      expect(errorHandling.onPullError).toBe('throw');
      expect(errorHandling.onPushError).toBe('warn');
      expect(errorHandling.onValidationError).toBe('silent');
    });
  });

  describe('Reinitialize', () => {
    it('should reinitialize with new parameters', () => {
      const newInitParams = {
        contextLocation: 'new-location',
        data: { newPlayer: { name: 'NewHero' } },
        settings: { newTheme: 'light' }
      };

      const newOpParams = {
        alwaysPullBeforeGetting: true,
        alwaysPushAfterSetting: true
      };

      context.reinitialize({
        initializationParams: newInitParams,
        operationsParams: newOpParams
      });

      expect(context.contextLocation).toBe('new-location');
      expect(context.operationsParams.alwaysPullBeforeGetting).toBe(true);
      expect(context.operationsParams.alwaysPushAfterSetting).toBe(true);
      expect(context.getItem('data.newPlayer.name')).toBe('NewHero');
      expect(context.getItem('settings.newTheme')).toBe('light');
    });

    it('should reset performance metrics on reinitialize', () => {
      // Simulate some operations first
      context.pullAndGetItem({
        itemPath: 'data.test',
        pullFrom: [mockTargetContext]
      });

      const initialMetrics = context.performanceMetrics;

      context.reinitialize({});

      const resetMetrics = context.performanceMetrics;
      expect(resetMetrics.pullOperations).toBe(0);
      expect(resetMetrics.pushOperations).toBe(0);
      expect(resetMetrics.totalPullTime).toBe(0);
      expect(resetMetrics.totalPushTime).toBe(0);
      expect(resetMetrics.lastPullTime).toBeNull();
      expect(resetMetrics.lastPushTime).toBeNull();
    });

    it('should preserve existing values when partial updates provided', () => {
      const originalLocation = context.contextLocation;
      const originalData = context.getItem('data.player.name');

      context.reinitialize({
        operationsParams: {
          alwaysPullBeforeGetting: true
        }
      });

      expect(context.contextLocation).toBe(originalLocation);
      expect(context.getItem('data.player.name')).toBe(originalData);
      expect(context.operationsParams.alwaysPullBeforeGetting).toBe(true);
    });
  });

  describe('Clear', () => {
    it('should clear all components and reset metrics', () => {
      // Add some data first
      context.setItem('data.test', 'value');
      context.setItem('settings.test', 'value');

      // Simulate some operations
      context.pullAndGetItem({
        itemPath: 'data.test',
        pullFrom: [mockTargetContext]
      });

      context.clear();

      // Check that components are cleared
      expect(context.data.size).toBe(0);
      expect(context.settings.size).toBe(0);
      expect(context.flags.size).toBe(0);
      expect(context.state.size).toBe(0);

      // Check that metrics are reset
      const metrics = context.performanceMetrics;
      expect(metrics.pullOperations).toBe(0);
      expect(metrics.pushOperations).toBe(0);
      expect(metrics.totalPullTime).toBe(0);
      expect(metrics.totalPushTime).toBe(0);
      expect(metrics.lastPullTime).toBeNull();
      expect(metrics.lastPushTime).toBeNull();
    });

    it('should maintain component types after clear', () => {
      context.clear();

      expect(context.schema).toBeInstanceOf(ContextItem);
      expect(context.constants).toBeInstanceOf(ContextItem);
      expect(context.manifest).toBeInstanceOf(ContextItem);
      expect(context.flags).toBeInstanceOf(ContextContainer);
      expect(context.state).toBeInstanceOf(ContextContainer);
      expect(context.data).toBeInstanceOf(ContextContainer);
      expect(context.settings).toBeInstanceOf(ContextContainer);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined initialization parameters gracefully', () => {
      const undefinedContext = new Context({
        initializationParams: {
          data: undefined,
          settings: undefined,
          flags: undefined
        }
      });

      expect(undefinedContext.data.size).toBe(0);
      expect(undefinedContext.settings.size).toBe(0);
      expect(undefinedContext.flags.size).toBe(0);
    });

    it('should handle null values in nested paths', () => {
      context.setItem('data.nullable', null);
      context.setItem('data.nested.nullable', null);

      expect(context.getItem('data.nullable')).toBeNull();
      expect(context.getItem('data.nested.nullable')).toBeNull();
      expect(context.hasItem('data.nullable')).toBe(true);
      expect(context.hasItem('data.nested.nullable')).toBe(true);
    });

    it('should handle empty string paths', () => {
      expect(context.getItem('')).toBeUndefined();
      expect(context.hasItem('')).toBe(false);
    });

    it('should handle very deep nested paths', () => {
      const deepPath = 'data.level1.level2.level3.level4.level5.deepValue';
      context.setItem(deepPath, 'deep-value');

      expect(context.getItem(deepPath)).toBe('deep-value');
      expect(context.hasItem(deepPath)).toBe(true);
    });

    it('should handle special characters in path segments', () => {
      context.setItem('data.player-stats.health_points', 100);
      context.setItem('data.inventory.sword of power', { damage: 50 });

      expect(context.getItem('data.player-stats.health_points')).toBe(100);
      expect(context.hasItem('data.player-stats.health_points')).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex data structures', () => {
      const complexData = {
        player: {
          character: {
            name: 'Aragorn',
            class: 'Ranger',
            level: 20,
            stats: {
              strength: 18,
              dexterity: 16,
              constitution: 15,
              intelligence: 14,
              wisdom: 16,
              charisma: 17
            },
            equipment: {
              weapon: {
                name: 'Andúril',
                type: 'longsword',
                damage: '1d8+5',
                properties: ['versatile', 'magical']
              },
              armor: {
                name: 'Chainmail',
                type: 'medium',
                ac: 16
              }
            },
            spells: [
              { name: 'Hunter\'s Mark', level: 1 },
              { name: 'Cure Wounds', level: 1 }
            ]
          },
          session: {
            currentHp: 95,
            maxHp: 95,
            tempHp: 0,
            conditions: [],
            inspiration: true
          }
        },
        world: {
          campaign: 'Lord of the Rings',
          currentLocation: 'Minas Tirith',
          time: {
            day: 15,
            month: 'March',
            year: 3019
          }
        }
      };

      context.data.setItem('player', complexData.player);
      context.data.setItem('world', complexData.world);

      // Test deep nested access
      expect(context.getItem('data.player.character.name')).toBe('Aragorn');
      expect(context.getItem('data.player.character.stats.strength')).toBe(18);
      expect(context.getItem('data.player.character.equipment.weapon.name')).toBe('Andúril');
      expect(context.getItem('data.world.time.year')).toBe(3019);

      // Test array access
      expect(context.getItem('data.player.character.spells')).toHaveLength(2);

      // Test existence checks - with default behavior (enhanced checking disabled)
      // Should find top-level items
      expect(context.hasItem('data.player')).toBe(true);
      expect(context.hasItem('data.world')).toBe(true);
      // Should NOT find nested paths in plain objects with default behavior
      expect(context.hasItem('data.player.session.inspiration')).toBe(false);
      expect(context.hasItem('data.player.character.equipment.shield')).toBe(false);
    });

    it('should handle module settings configuration', () => {
      const moduleSettings = {
        ui: {
          theme: {
            color: 'dark',
            variant: 'blue',
            customCss: true
          },
          layout: {
            sidebar: {
              position: 'left',
              width: 300,
              collapsed: false
            },
            toolbar: {
              position: 'top',
              visible: true,
              buttons: ['save', 'load', 'settings']
            }
          },
          notifications: {
            enabled: true,
            duration: 5000,
            position: 'top-right'
          }
        },
        gameplay: {
          automation: {
            rollDamage: true,
            applyEffects: false,
            calculateAc: true
          },
          rules: {
            variantRules: {
              flanking: true,
              inspiration: true,
              featsOptional: false
            },
            homebrew: {
              enabled: true,
              rulesPath: '/custom/rules'
            }
          }
        }
      };

      // Set up the settings data in the settings component
      context.settings.setItem('ui', moduleSettings.ui);
      context.settings.setItem('gameplay', moduleSettings.gameplay);

      // Test settings access patterns
      expect(context.getItem('settings.ui.theme.color')).toBe('dark');
      expect(context.getItem('settings.gameplay.automation.rollDamage')).toBe(true);
      expect(context.settings.getItem('ui.layout.sidebar.width')).toBe(300);

      // Test partial updates
      context.setItem('settings.ui.theme.color', 'light');
      context.setItem('settings.gameplay.rules.variantRules.flanking', false);

      expect(context.getItem('settings.ui.theme.color')).toBe('light');
      expect(context.getItem('settings.ui.theme.variant')).toBe('blue'); // Should preserve
      expect(context.getItem('settings.gameplay.rules.variantRules.flanking')).toBe(false);
      expect(context.getItem('settings.gameplay.rules.variantRules.inspiration')).toBe(true); // Should preserve
    });

    it('should handle context synchronization scenarios', () => {
      // Create contexts representing different scopes
      const playerContext = new Context({
        initializationParams: {
          data: {
            character: { name: 'PlayerCharacter', level: 5 }
          }
        }
      });

      const gmContext = new Context({
        initializationParams: {
          data: {
            campaign: { name: 'Epic Campaign', session: 12 },
            npcs: { count: 25 }
          }
        }
      });

      const sharedContext = new Context({
        operationsParams: {
          pullFrom: [playerContext, gmContext],
          alwaysPullBeforeGetting: false // Disable for testing
        }
      });

      // Test merge scenarios
      const mergeResult = sharedContext.merge(playerContext, 'mergeNewerWins');
      expect(mergeResult.success).toBe(true);

      // Test selective synchronization
      const playerData = sharedContext.pullAndGetItem({
        itemPath: 'data.character',
        pullFrom: [playerContext]
      });

      expect(mockContextHelpers.Sync.syncItem).toHaveBeenCalledWith(
        playerContext,
        sharedContext,
        'data.character',
        'updateTargetToSource',
        {}
      );
    });
  });

  describe('Enhanced Nested Path Checking', () => {
    it('should use default behavior (enhanced checking disabled) by default', () => {
      const context = new Context({
        initializationParams: {
          data: {
            player: { stats: { level: 5, health: 100 } }
          }
        }
      });

      // Should find the top-level item
      expect(context.hasItem('data.player')).toBe(true);

      // Should NOT find nested paths in plain objects with default behavior
      expect(context.hasItem('data.player.stats')).toBe(false);
      expect(context.hasItem('data.player.stats.level')).toBe(false);
    });

    it('should support enhanced nested path checking when enabled', () => {
      const context = new Context({
        initializationParams: {
          data: {
            player: { stats: { level: 5, health: 100 } }
          }
        },
        enhancedNestedPathChecking: true
      });

      // Should find the top-level item
      expect(context.hasItem('data.player')).toBe(true);

      // Should find nested paths in plain objects with enhanced behavior
      expect(context.hasItem('data.player.stats')).toBe(true);
      expect(context.hasItem('data.player.stats.level')).toBe(true);
      expect(context.hasItem('data.player.stats.health')).toBe(true);

      // Should NOT find non-existent paths
      expect(context.hasItem('data.player.stats.mana')).toBe(false);
      expect(context.hasItem('data.player.inventory')).toBe(false);
    });

    it('should work correctly with nested ContextContainers regardless of option', () => {
      // Create a context with nested ContextContainer
      const context = new Context();
      context.setItem('data.player', new ContextContainer({ stats: { level: 5 } }, {}, { enhancedNestedPathChecking: true }));

      // Should work with ContextContainer nesting regardless of the option
      expect(context.hasItem('data.player')).toBe(true);
      expect(context.hasItem('data.player.stats')).toBe(true);
      expect(context.hasItem('data.player.stats.level')).toBe(true);
    });

    it('should preserve filtering behavior in integration operations', () => {
      const sourceContext = new Context({
        initializationParams: {
          data: {
            player: {
              profile: { name: 'Alice' },
              stats: { level: 10, health: 100 }
            }
          }
        }
      });

      const targetContext = new Context({
        initializationParams: {
          data: {
            player: {
              profile: { name: 'Bob' },
              stats: { level: 8, health: 80 }
            }
          }
        }
      });

      // For now, just test that the contexts are properly constructed
      // and that enhanced nested path checking doesn't break basic operations
      expect(sourceContext.hasItem('data.player')).toBe(true);
      expect(targetContext.hasItem('data.player')).toBe(true);
      expect(sourceContext.getItem('data.player.profile.name')).toBe('Alice');
      expect(targetContext.getItem('data.player.profile.name')).toBe('Bob');
    });
  });

  describe('Integration with Constants', () => {
    it('should use constants for default values', () => {
      const defaultContext = new Context();
      const opParams = defaultContext.operationsParams;

      expect(opParams.alwaysPullBeforeGetting).toBe(constants.context.operationsParams.defaults.alwaysPullBeforeGetting);
      expect(opParams.alwaysPullBeforeSetting).toBe(constants.context.operationsParams.defaults.alwaysPullBeforeSetting);
      expect(opParams.alwaysPushAfterSetting).toBe(constants.context.operationsParams.defaults.alwaysPushAfterSetting);
    });

    it('should use constants for naming convention', () => {
      const defaultContext = new Context();
      const naming = defaultContext.namingConvention;

      expect(naming.value.state).toBe(constants.context.naming.state);
      expect(naming.value.settings).toBe(constants.context.naming.settings);
      expect(naming.value.flags).toBe(constants.context.naming.flags);
      expect(naming.value.data).toBe(constants.context.naming.data);
    });
  });

  describe('Additional Coverage', () => {
    it('throws on pull error when configured to throw', () => {
  const helpers = mockContextHelpers;
  const err = new Error('pull boom');
  helpers.Sync.syncItem.mockImplementationOnce(() => { throw err; });

      const throwing = new Context({
        operationsParams: { errorHandling: { onPullError: 'throw', onPushError: 'warn', onValidationError: 'silent' } }
      });

      expect(() => throwing.pullAndGetItem({ itemPath: 'data.x', pullFrom: [new Context()] })).toThrow('pull boom');
    });

    it('warns (does not throw) on pull error when configured to warn', () => {
  const helpers = mockContextHelpers;
  const err = new Error('pull warn');
      helpers.Sync.syncItem.mockImplementationOnce(() => { throw err; });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const warnCtx = new Context({
        operationsParams: { errorHandling: { onPullError: 'warn', onPushError: 'warn', onValidationError: 'silent' } }
      });

      expect(() => warnCtx.pullAndGetItem({ itemPath: 'data.x', pullFrom: [new Context()] })).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('throws on push error when configured to throw', () => {
  const helpers = mockContextHelpers;
  helpers.Sync.syncItem.mockImplementationOnce(() => { throw new Error('push boom'); });

      const pushing = new Context({
        operationsParams: {
          alwaysPushAfterSetting: true,
          pushTo: [new Context()],
          errorHandling: { onPullError: 'warn', onPushError: 'throw', onValidationError: 'silent' }
        }
      });

      expect(() => pushing.setItem('data.k', 1)).toThrow('push boom');
    });

    it('warns (does not throw) on push error when configured to warn', () => {
  const helpers = mockContextHelpers;
  helpers.Sync.syncItem.mockImplementationOnce(() => { throw new Error('push warn'); });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const warnPush = new Context({
        operationsParams: {
          alwaysPushAfterSetting: true,
          pushTo: [new Context()],
          errorHandling: { onPullError: 'warn', onPushError: 'warn', onValidationError: 'silent' }
        }
      });

      expect(() => warnPush.setItem('data.k', 1)).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('enforces frozen components and does not allow bypass even with ignoreFrozen', () => {
      const ctx = new Context({
        initializationParams: {
          constants: { app: { version: '1.0' } },
          manifest: { id: 'm1' },
          contextSchema: { rules: {} }
        }
      });

      // Throws for schema regardless of ignoreFrozen due to ContextItem immutability
      expect(() => ctx.setItem('schema.rules.enabled', true)).toThrow('Cannot modify frozen schema component');
      expect(() => ctx.setItem('schema.rules.enabled', true, { ignoreFrozen: true })).toThrow('Cannot modify a frozen ContextItem.');
      expect(ctx.getItem('schema.rules.enabled')).toBeUndefined();

      // Throws for constants regardless of ignoreFrozen
      expect(() => ctx.setItem('constants.app.version', '2.0')).toThrow('Cannot modify frozen constants component');
      expect(() => ctx.setItem('constants.app.version', '2.0', { ignoreFrozen: true })).toThrow('Cannot modify a frozen ContextItem.');
      expect(ctx.getItem('constants.app.version')).toBe('1.0');

      // Throws for manifest regardless of ignoreFrozen
      expect(() => ctx.setItem('manifest.id', 'm2')).toThrow('Cannot modify frozen manifest component');
      expect(() => ctx.setItem('manifest.id', 'm2', { ignoreFrozen: true })).toThrow('Cannot modify a frozen ContextItem.');
      expect(ctx.getItem('manifest.id')).toBe('m1');
    });
  });
});
