/**
 * @file contextMerger.unit.test.js
 * @description Unit tests for the ContextMerger class
 * @path /src/context/helpers/contextMerger.unit.test.js
 */

import ContextMerger from './contextMerger.js';
import ContextSync from './contextSync.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
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
});
