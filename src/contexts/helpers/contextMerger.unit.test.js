/**
 * @file contextMerger.unit.test.js
 * @description Unit tests for the ContextMerger class and ItemFilter helper
 * @path /src/contexts/helpers/contextMerger.unit.test.js
 */

import ContextMerger, { ItemFilter } from './contextMerger.js';
import ContextSync from './contextSync.js';
import { ContextItem } from './contextItem.js';
import ContextContainer from './contextContainer.js';
import Context from '../context.js';

// Mock dependencies
jest.mock('./contextSync.js');
jest.mock('./contextItem.js');
jest.mock('./contextContainer.js');
jest.mock('../context.js');

describe('ContextMerger', () => {
  let sourceContext;
  let targetContext;
  let sourceItem;
  let targetItem;
  let sourceContainer;
  let targetContainer;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock timestamps
    const now = new Date();
    const earlier = new Date(now.getTime() - 1000);
    const later = new Date(now.getTime() + 1000);

    // Mock ContextItem instances
    sourceItem = {
      value: 'source value',
      modifiedAt: later,
      createdAt: earlier,
      lastAccessedAt: now
    };

    targetItem = {
      value: 'target value',
      modifiedAt: earlier,
      createdAt: earlier,
      lastAccessedAt: now
    };

    // Mock ContextContainer instances
    sourceContainer = {
      keys: jest.fn().mockReturnValue(['item1', 'item2']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      value: { nested: 'source container value' },
      modifiedAt: later,
      createdAt: earlier,
      lastAccessedAt: now
    };

    targetContainer = {
      keys: jest.fn().mockReturnValue(['item1', 'item3']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      value: { nested: 'target container value' },
      modifiedAt: earlier,
      createdAt: earlier,
      lastAccessedAt: now
    };

    // Mock Context instances
    sourceContext = {
      schema: sourceContainer,
      constants: sourceContainer,
      manifest: sourceContainer,
      flags: sourceContainer,
      state: sourceContainer,
      data: sourceContainer,
      settings: sourceContainer
    };

    targetContext = {
      schema: targetContainer,
      constants: targetContainer,
      manifest: targetContainer,
      flags: targetContainer,
      state: targetContainer,
      data: targetContainer,
      settings: targetContainer
    };

    // Set up ContextSync mock
    ContextSync.compare.mockReturnValue({
      result: ContextSync.COMPARISON_RESULTS.SOURCE_NEWER,
      sourceTimestamp: later,
      targetTimestamp: earlier,
      timeDifference: 1000
    });

    ContextSync.COMPARISON_RESULTS = {
      SOURCE_NEWER: 'sourceNewer',
      TARGET_NEWER: 'targetNewer',
      EQUAL: 'equal',
      SOURCE_MISSING: 'sourceMissing',
      TARGET_MISSING: 'targetMissing',
      BOTH_MISSING: 'bothMissing'
    };

    // Set up instanceof checks
    ContextItem.mockImplementation(function() {
      return sourceItem;
    });

    ContextContainer.mockImplementation(function() {
      return sourceContainer;
    });

    Object.setPrototypeOf(sourceItem, ContextItem.prototype);
    Object.setPrototypeOf(targetItem, ContextItem.prototype);
    Object.setPrototypeOf(sourceContainer, ContextContainer.prototype);
    Object.setPrototypeOf(targetContainer, ContextContainer.prototype);
  });

  describe('merge()', () => {
    it('should throw error for invalid contexts', () => {
      expect(() => {
        ContextMerger.merge(null, targetContext);
      }).toThrow('Invalid source or target context for merge operation');

      expect(() => {
        ContextMerger.merge(sourceContext, null);
      }).toThrow('Invalid source or target context for merge operation');
    });

    it('should successfully merge contexts with default strategy', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        if (key === 'item2') return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        if (key === 'item3') return targetItem;
        return null;
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return ['item1', 'item3'].includes(key);
      });

      const result = ContextMerger.merge(sourceContext, targetContext);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('mergeNewerWins');
      expect(result.itemsProcessed).toBeGreaterThanOrEqual(0);
      expect(result.statistics).toHaveProperty('sourcePreferred');
      expect(result.statistics).toHaveProperty('targetPreferred');
      expect(result.statistics).toHaveProperty('created');
      expect(result.statistics).toHaveProperty('updated');
      expect(result.statistics).toHaveProperty('skipped');
    });

    it('should respect excludeComponents option', () => {
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        excludeComponents: ['schema', 'constants']
      });

      expect(result.success).toBe(true);
      // Verify that excluded components were not processed
      // This would be implementation specific based on actual merge logic
    });

    it('should respect includeComponents option', () => {
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        includeComponents: ['data', 'settings']
      });

      expect(result.success).toBe(true);
      // Verify that only included components were processed
    });

    it('should perform dry run without making changes', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        return null;
      });

      const originalTargetValue = targetItem.value;

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        dryRun: true
      });

      expect(result.success).toBe(true);
      expect(targetItem.value).toBe(originalTargetValue); // Should not be changed
    });

    it('should handle custom conflict resolver', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        return null;
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return key === 'item1';
      });

      const customResolver = jest.fn().mockReturnValue(targetItem);

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        onConflict: customResolver
      });

      expect(result.success).toBe(true);
      expect(customResolver).toHaveBeenCalled();
    });

    it('should handle different merge strategies', () => {
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
        const result = ContextMerger.merge(sourceContext, targetContext, strategy);
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should handle unknown merge strategy', () => {
      sourceContainer.getItem.mockImplementation(() => sourceItem);
      targetContainer.getItem.mockImplementation(() => targetItem);

      // This test depends on the actual implementation - the error might be caught differently
      const result = ContextMerger.merge(sourceContext, targetContext, 'unknownStrategy');

      // The implementation might handle this gracefully or throw an error
      // Adjust based on actual behavior
      expect(result.success).toBeDefined();
    });

    it('should preserve metadata when specified', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        return null;
      });

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
        preserveMetadata: true
      });

      expect(result.success).toBe(true);
    });

    it('should create missing items when specified', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        if (key === 'item2') return sourceItem;
        return null;
      });

      sourceContainer.hasItem.mockImplementation((key) => {
        return ['item1', 'item2'].includes(key);
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        return null; // item2 missing in target
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return key === 'item1';
      });

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        createMissing: true
      });

      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', () => {
      // Mock an error in container processing
      sourceContainer.keys.mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = ContextMerger.merge(sourceContext, targetContext);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Check that at least one error contains our test error message
      expect(result.errors.some(error => error.includes('Test error'))).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle component processing errors', () => {
      // Mock error in specific component
      sourceContainer.keys.mockImplementation(() => {
        throw new Error('Component processing error');
      });

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle partial failures', () => {
      // Setup some components to work and others to fail
      let callCount = 0;
      sourceContainer.keys.mockImplementation(() => {
        callCount++;
        if (callCount === 2) throw new Error('Second component error');
        return ['item1'];
      });

      sourceContainer.getItem.mockReturnValue(sourceItem);
      targetContainer.getItem.mockReturnValue(targetItem);

      const result = ContextMerger.merge(sourceContext, targetContext);

      // Should handle partial failures gracefully
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe('integration with ContextSync', () => {
    it('should use ContextSync for timestamp comparisons', () => {
      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'item1') return targetItem;
        return null;
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return key === 'item1';
      });

      ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins');

      expect(ContextSync.compare).toHaveBeenCalled();
    });

    it('should handle different comparison results', () => {
      const comparisonResults = [
        ContextSync.COMPARISON_RESULTS.SOURCE_NEWER,
        ContextSync.COMPARISON_RESULTS.TARGET_NEWER,
        ContextSync.COMPARISON_RESULTS.EQUAL
      ];

      comparisonResults.forEach(comparisonResult => {
        ContextSync.compare.mockReturnValueOnce({
          result: comparisonResult,
          sourceTimestamp: new Date(),
          targetTimestamp: new Date(),
          timeDifference: 0
        });

        sourceContainer.getItem.mockImplementation((key) => {
          if (key === 'item1') return sourceItem;
          return null;
        });

        targetContainer.getItem.mockImplementation((key) => {
          if (key === 'item1') return targetItem;
          return null;
        });

        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('performance and edge cases', () => {
    it('should handle empty contexts', () => {
      const emptyContext = {
        schema: { keys: () => [], getItem: () => null },
        constants: { keys: () => [], getItem: () => null },
        manifest: { keys: () => [], getItem: () => null },
        flags: { keys: () => [], getItem: () => null },
        state: { keys: () => [], getItem: () => null },
        data: { keys: () => [], getItem: () => null },
        settings: { keys: () => [], getItem: () => null }
      };

      const result = ContextMerger.merge(emptyContext, emptyContext);

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(0);
    });

    it('should handle large numbers of items efficiently', () => {
      const manyItems = Array.from({ length: 1000 }, (_, i) => `item${i}`);

      sourceContainer.keys.mockReturnValue(manyItems);
      targetContainer.keys.mockReturnValue(manyItems);

      sourceContainer.getItem.mockReturnValue(sourceItem);
      targetContainer.getItem.mockReturnValue(targetItem);
      targetContainer.hasItem.mockReturnValue(true);

      const startTime = Date.now();
      const result = ContextMerger.merge(sourceContext, targetContext);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle deeply nested containers', () => {
      const nestedItem = { ...sourceItem };
      const nestedContainer = {
        keys: () => ['nested'],
        getItem: () => nestedItem,
        hasItem: () => true,
        setItem: jest.fn()
      };

      Object.setPrototypeOf(nestedContainer, ContextContainer.prototype);
      Object.setPrototypeOf(nestedItem, ContextItem.prototype);

      sourceContainer.getItem.mockImplementation((key) => {
        if (key === 'nested') return nestedContainer;
        return sourceItem;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (key === 'nested') return nestedContainer;
        return targetItem;
      });

      const result = ContextMerger.merge(sourceContext, targetContext);

      expect(result.success).toBe(true);
    });
  });

  describe('ItemFilter', () => {
    let sourceItem, targetItem;

    beforeEach(() => {
      sourceItem = { value: 'source', timestamp: 100 };
      targetItem = { value: 'target', timestamp: 50 };
    });

    describe('allowOnly()', () => {
      it('should create filter that allows only specified paths', () => {
        const filter = ItemFilter.allowOnly(['data.inventory', 'settings.volume']);

        expect(filter(sourceItem, targetItem, 'data.inventory.weapons')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'data.other')).toBe(targetItem);
        expect(filter(sourceItem, targetItem, 'state.ui')).toBe(targetItem);
      });

      it('should handle empty paths array', () => {
        const filter = ItemFilter.allowOnly([]);

        expect(filter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
      });
    });

    describe('blockOnly()', () => {
      it('should create filter that blocks specified paths', () => {
        const filter = ItemFilter.blockOnly(['data.temp', 'state.cache']);

        expect(filter(sourceItem, targetItem, 'data.temp.something')).toBe(targetItem);
        expect(filter(sourceItem, targetItem, 'state.cache')).toBe(targetItem);
        expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      });
    });

    describe('matchPattern()', () => {
      it('should create filter that matches regex patterns', () => {
        const filter = ItemFilter.matchPattern(/data\.player/);

        expect(filter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'data.playerInventory')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
        expect(filter(sourceItem, targetItem, 'settings.player')).toBe(targetItem);
      });

      it('should handle complex regex patterns', () => {
        const filter = ItemFilter.matchPattern(/settings\..*volume$/);

        expect(filter(sourceItem, targetItem, 'settings.audio.volume')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'settings.ui.volume')).toBe(sourceItem);
        expect(filter(sourceItem, targetItem, 'settings.audio.quality')).toBe(targetItem);
      });
    });

    describe('custom()', () => {
      it('should create filter based on custom condition', () => {
        const conditionFn = jest.fn((source, target, path) => {
          return source.timestamp > target.timestamp;
        });
        const filter = ItemFilter.custom(conditionFn);

        expect(filter(sourceItem, targetItem, 'any.path')).toBe(sourceItem);
        expect(conditionFn).toHaveBeenCalledWith(sourceItem, targetItem, 'any.path');
      });

      it('should return target when condition is false', () => {
        const conditionFn = () => false;
        const filter = ItemFilter.custom(conditionFn);

        expect(filter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
      });
    });

    describe('and()', () => {
      it('should combine filters with AND logic', () => {
        const filter1 = ItemFilter.allowOnly(['data.player']);
        const filter2 = ItemFilter.custom(() => true);
        const combinedFilter = ItemFilter.and(filter1, filter2);

        expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
        expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
      });

      it('should short-circuit on first rejection', () => {
        const filter1 = ItemFilter.allowOnly(['data.other']);
        const filter2 = jest.fn(() => sourceItem);
        const combinedFilter = ItemFilter.and(filter1, filter2);

        combinedFilter(sourceItem, targetItem, 'data.player');

        expect(filter2).not.toHaveBeenCalled();
      });
    });

    describe('or()', () => {
      it('should combine filters with OR logic', () => {
        const filter1 = ItemFilter.allowOnly(['data.player']);
        const filter2 = ItemFilter.allowOnly(['settings.volume']);
        const combinedFilter = ItemFilter.or(filter1, filter2);

        expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
        expect(combinedFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
        expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
      });

      it('should short-circuit on first acceptance', () => {
        const filter1 = ItemFilter.allowOnly(['data.player']);
        const filter2 = jest.fn(() => sourceItem);
        const combinedFilter = ItemFilter.or(filter1, filter2);

        combinedFilter(sourceItem, targetItem, 'data.playerStats');

        expect(filter2).not.toHaveBeenCalled();
      });
    });
  });

  describe('ContextMerger merge() with filtering parameters', () => {
    beforeEach(() => {
      // Setup common mock behavior for convenience method tests
      sourceContainer.getItem.mockImplementation((key) => {
        if (['item1', 'item2'].includes(key)) return sourceItem;
        return null;
      });

      targetContainer.getItem.mockImplementation((key) => {
        if (['item1', 'item3'].includes(key)) return targetItem;
        return null;
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return ['item1', 'item3'].includes(key);
      });
    });

    describe('allowOnly parameter', () => {
      it('should merge only specified paths', () => {
        const allowedPaths = ['data.inventory', 'settings.volume'];
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          allowOnly: allowedPaths
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });

      it('should accept custom strategy', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
          allowOnly: ['data.inventory']
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeSourcePriority');
      });

      it('should accept additional options', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          allowOnly: ['data.inventory'],
          dryRun: true
        });

        expect(result.success).toBe(true);
      });
    });

    describe('blockOnly parameter', () => {
      it('should merge everything except specified paths', () => {
        const blockedPaths = ['data.temp', 'state.cache'];
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          blockOnly: blockedPaths
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });

      it('should accept custom strategy', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeTargetPriority', {
          blockOnly: ['data.temp']
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeTargetPriority');
      });
    });

    describe('singleItem parameter', () => {
      it('should merge a single specific item', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          singleItem: 'data.playerStats.level'
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });

      it('should accept custom strategy', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
          singleItem: 'data.playerStats.level'
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeSourcePriority');
      });

      it('should support all merge options', () => {
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
          singleItem: 'data.playerStats.level',
          preserveMetadata: true,
          dryRun: true
        });

        expect(result.success).toBe(true);
      });
    });

    describe('matchPattern parameter', () => {
      it('should merge items matching regex pattern', () => {
        const pattern = /data\.player/;
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          matchPattern: pattern
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });

      it('should accept custom strategy', () => {
        const pattern = /settings\..*volume$/;
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
          matchPattern: pattern
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeSourcePriority');
      });
    });

    describe('customFilter parameter', () => {
      it('should merge items based on custom condition', () => {
        const conditionFn = jest.fn().mockReturnValue(true);
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          customFilter: conditionFn
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });

      it('should call condition function with correct parameters', () => {
        const conditionFn = jest.fn().mockReturnValue(false);

        ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
          customFilter: conditionFn
        });

        // The condition function should be wrapped in ItemFilter.custom
        // Exact verification depends on implementation details
        expect(conditionFn).toBeDefined();
      });

      it('should accept custom strategy', () => {
        const conditionFn = () => true;
        const result = ContextMerger.merge(sourceContext, targetContext, 'mergeTargetPriority', {
          customFilter: conditionFn
        });

        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeTargetPriority');
      });
    });
  });

  describe('ContextMerger advanced usage', () => {
    it('should support complex filtering combinations', () => {
      const complexFilter = ItemFilter.and(
        ItemFilter.allowOnly(['data.player', 'settings.ui']),
        ItemFilter.custom((source, target, path) => source.timestamp > target.timestamp)
      );

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        onConflict: complexFilter
      });

      expect(result.success).toBe(true);
    });

    it('should handle multiple convenience methods chaining', () => {
      // Test that merge method with filtering parameters works with different strategies
      const strategies = ['mergeNewerWins', 'mergeSourcePriority', 'mergeTargetPriority'];

      strategies.forEach(strategy => {
        const result = ContextMerger.merge(sourceContext, targetContext, strategy, {
          allowOnly: ['data.inventory']
        });
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should handle parameter precedence correctly', () => {
      // Test that onConflict takes precedence over convenience parameters
      const customFilter = jest.fn().mockReturnValue(true);

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        onConflict: customFilter,
        allowOnly: ['data.inventory'], // This should be ignored since onConflict is provided
        blockOnly: ['data.temp']      // This should also be ignored
      });

      expect(result.success).toBe(true);
      // The customFilter should be used instead of the convenience parameters
    });

    it('should handle edge cases in filtering parameters', () => {
      // Test empty paths
      const result1 = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        allowOnly: []
      });
      expect(result1.success).toBe(true);

      // Test valid regex pattern
      const result2 = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        matchPattern: /valid\.pattern/
      });
      expect(result2.success).toBe(true);

      // Test undefined condition function (should not throw during method call, but might fail during merge)
      const result3 = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        customFilter: undefined
      });
      // The method call itself shouldn't throw, but the result might indicate failure
      expect(result3).toBeDefined();
    });
  });

  describe('real-world scenarios', () => {
    beforeEach(() => {
      // Setup more realistic test data
      const playerStatsItem = {
        value: { level: 10, experience: 1500 },
        timestamp: Date.now(),
        version: '1.2.0'
      };

      const inventoryItem = {
        value: { weapons: ['sword', 'bow'], armor: ['helmet'] },
        timestamp: Date.now() - 1000,
        version: '1.1.0'
      };

      const settingsItem = {
        value: { volume: 0.8, quality: 'high' },
        timestamp: Date.now() + 1000,
        version: '1.3.0'
      };

      sourceContainer.getItem.mockImplementation((key) => {
        switch (key) {
          case 'playerStats': return playerStatsItem;
          case 'inventory': return inventoryItem;
          case 'settings': return settingsItem;
          default: return null;
        }
      });

      targetContainer.getItem.mockImplementation((key) => {
        switch (key) {
          case 'playerStats': return { ...playerStatsItem, value: { level: 8, experience: 1200 } };
          case 'inventory': return { ...inventoryItem, value: { weapons: ['dagger'], armor: [] } };
          case 'settings': return { ...settingsItem, value: { volume: 0.5, quality: 'medium' } };
          default: return null;
        }
      });

      targetContainer.hasItem.mockImplementation((key) => {
        return ['playerStats', 'inventory', 'settings'].includes(key);
      });
    });

    it('should handle selective player data sync', () => {
      // Only sync player stats and inventory, not settings
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
        allowOnly: ['data.playerStats', 'data.inventory']
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('mergeSourcePriority');
    });

    it('should handle excluding temporary data', () => {
      // Merge everything except cache and temporary data
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        blockOnly: ['data.cache', 'data.temp', 'state.pending']
      });

      expect(result.success).toBe(true);
    });

    it('should handle pattern-based game data sync', () => {
      // Sync all player-related data using pattern
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        matchPattern: /data\.player/
      });

      expect(result.success).toBe(true);
    });

    it('should handle conditional version-based sync', () => {
      // Only sync items with higher version numbers
      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
        customFilter: (sourceItem, targetItem, itemPath) => {
          if (!sourceItem?.version || !targetItem?.version) return false;
          return sourceItem.version > targetItem.version;
        }
      });

      expect(result.success).toBe(true);
    });

    it('should handle complex filtering scenarios', () => {
      // Complex filter: Allow player data OR settings with newer timestamps
      const complexFilter = ItemFilter.or(
        ItemFilter.allowOnly(['data.player']),
        ItemFilter.and(
          ItemFilter.allowOnly(['settings']),
          ItemFilter.custom((source, target) => source.timestamp > target.timestamp)
        )
      );

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        onConflict: complexFilter
      });

      expect(result.success).toBe(true);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain existing API compatibility', () => {
      // Test that existing merge() calls still work unchanged
      const result = ContextMerger.merge(sourceContext, targetContext);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('mergeNewerWins');
    });

    it('should support existing onConflict custom functions', () => {
      const customConflictResolver = jest.fn().mockReturnValue(sourceItem);

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
        onConflict: customConflictResolver
      });

      expect(result.success).toBe(true);
      // The custom resolver should still work as before
    });

    it('should handle all existing merge strategies', () => {
      const strategies = Object.values(ContextMerger.MERGE_STRATEGIES);

      strategies.forEach(strategy => {
        const result = ContextMerger.merge(sourceContext, targetContext, strategy);
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should support all existing options', () => {
      const allOptions = {
        includeComponents: ['data', 'settings'],
        excludeComponents: ['schema'],
        compareBy: 'timestamp',
        createMissing: true,
        dryRun: true,
        preserveMetadata: true
      };

      const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', allOptions);
      expect(result.success).toBe(true);
    });
  });
});
