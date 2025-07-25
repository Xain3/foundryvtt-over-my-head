/**
 * @file contextMerger.unit.test.js
 * @description Unit tests for the ContextMerger class functionality.
 * @path src/contexts/helpers/contextMerger.unit.test.js

 */

import ContextMerger from './contextMerger.js';
import ContextComparison from './contextComparison.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import { ItemFilter } from './contextItemFilter.js';
import Context from '../context.js';

jest.mock('./contextComparison.js');
jest.mock('./contextItemFilter.js');

describe('ContextMerger', () => {
  let mockSourceContext;
  let mockTargetContext;
  let mockSourceContainer;
  let mockTargetContainer;
  let mockSourceItem;
  let mockTargetItem;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock ContextItems
    mockSourceItem = {
      value: 'source value',
      metadata: { source: true },
      modifiedAt: new Date('2025-05-30T10:00:00Z'),
      setMetadata: jest.fn()
    };

    mockTargetItem = {
      value: 'target value',
      metadata: { target: true },
      modifiedAt: new Date('2025-05-30T09:00:00Z'),
      setMetadata: jest.fn()
    };

    // Create mock ContextContainers
    mockSourceContainer = {
      keys: jest.fn(() => ['item1', 'item2']),
      getItem: jest.fn((key) => key === 'item1' ? mockSourceItem : { value: `source ${key}` }),
      hasItem: jest.fn(() => true),
      setItem: jest.fn()
    };

    mockTargetContainer = {
      keys: jest.fn(() => ['item1']),
      getItem: jest.fn(() => mockTargetItem),
      hasItem: jest.fn(() => true),
      setItem: jest.fn()
    };

    // Create mock Context instances
    mockSourceContext = {
      schema: mockSourceContainer,
      constants: mockSourceContainer,
      manifest: mockSourceContainer,
      flags: mockSourceContainer,
      state: mockSourceContainer,
      data: mockSourceContainer,
      settings: mockSourceContainer
    };

    mockTargetContext = {
      schema: mockTargetContainer,
      constants: mockTargetContainer,
      manifest: mockTargetContainer,
      flags: mockTargetContainer,
      state: mockTargetContainer,
      data: mockTargetContainer,
      settings: mockTargetContainer
    };

    // Mock instanceof checks
    Object.setPrototypeOf(mockSourceItem, ContextItem.prototype);
    Object.setPrototypeOf(mockTargetItem, ContextItem.prototype);
    Object.setPrototypeOf(mockSourceContainer, ContextContainer.prototype);
    Object.setPrototypeOf(mockTargetContainer, ContextContainer.prototype);
    Object.setPrototypeOf(mockSourceContext, Context.prototype);
    Object.setPrototypeOf(mockTargetContext, Context.prototype);

    // Mock ContextComparison
    ContextComparison.compare.mockReturnValue({
      result: ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER
    });

    ContextComparison.COMPARISON_RESULTS = {
      SOURCE_NEWER: 'sourceNewer',
      TARGET_NEWER: 'targetNewer',
      EQUAL: 'equal',
      TARGET_MISSING: 'targetMissing',
      SOURCE_MISSING: 'sourceMissing'
    };
  });

  describe('MERGE_STRATEGIES', () => {
    it('should define all required merge strategies', () => {
      expect(ContextMerger.MERGE_STRATEGIES).toEqual({
        MERGE_NEWER_WINS: 'mergeNewerWins',
        MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
        MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
        UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
        UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
        REPLACE: 'replace',
        NO_ACTION: 'noAction'
      });
    });
  });

  describe('DEFAULT_COMPONENTS', () => {
    it('should define all default context components', () => {
      expect(ContextMerger.DEFAULT_COMPONENTS).toEqual([
        'schema',
        'constants',
        'manifest',
        'flags',
        'state',
        'data',
        'settings'
      ]);
    });
  });

  describe('merge', () => {
    it('should perform basic merge with default strategy', () => {
      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('mergeNewerWins');
      expect(result.itemsProcessed).toBeGreaterThan(0);
      expect(result.statistics).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    it('should throw error for invalid source context', () => {
      expect(() => ContextMerger.merge(null, mockTargetContext))
        .toThrow('Invalid source or target context for merge operation');
    });

    it('should throw error for invalid target context', () => {
      expect(() => ContextMerger.merge(mockSourceContext, null))
        .toThrow('Invalid source or target context for merge operation');
    });

    it('should use custom strategy', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeSourcePriority'
      );

      expect(result.strategy).toBe('mergeSourcePriority');
    });

    it('should process only included components', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { includeComponents: ['data', 'settings'] }
      );

      expect(result.success).toBe(true);
      expect(mockTargetContext.data.setItem).toHaveBeenCalled();
    });

    it('should exclude specified components', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { excludeComponents: ['schema', 'constants'] }
      );

      expect(result.success).toBe(true);
    });

    it('should handle allowOnly option with ItemFilter', () => {
      const mockFilter = jest.fn();
      ItemFilter.allowOnly.mockReturnValue(mockFilter);

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { allowOnly: ['data.item1'] }
      );

      expect(ItemFilter.allowOnly).toHaveBeenCalledWith(['data.item1']);
    });

    it('should handle blockOnly option with ItemFilter', () => {
      const mockFilter = jest.fn();
      ItemFilter.blockOnly.mockReturnValue(mockFilter);

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { blockOnly: ['data.temp'] }
      );

      expect(ItemFilter.blockOnly).toHaveBeenCalledWith(['data.temp']);
    });

    it('should handle singleItem option with ItemFilter', () => {
      const mockFilter = jest.fn();
      ItemFilter.allowOnly.mockReturnValue(mockFilter);

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { singleItem: 'data.specific' }
      );

      expect(ItemFilter.allowOnly).toHaveBeenCalledWith(['data.specific']);
    });

    it('should handle matchPattern option with ItemFilter', () => {
      const mockFilter = jest.fn();
      const pattern = /data\.player/;
      ItemFilter.matchPattern.mockReturnValue(mockFilter);

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { matchPattern: pattern }
      );

      expect(ItemFilter.matchPattern).toHaveBeenCalledWith(pattern);
    });

    it('should handle customFilter option with ItemFilter', () => {
      const mockFilter = jest.fn();
      const customFunction = jest.fn();
      ItemFilter.custom.mockReturnValue(mockFilter);

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { customFilter: customFunction }
      );

      expect(ItemFilter.custom).toHaveBeenCalledWith(customFunction);
    });

    it('should preserve existing onConflict function', () => {
      const customOnConflict = jest.fn();

      ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { onConflict: customOnConflict, allowOnly: ['data.item1'] }
      );

      // Should not call ItemFilter when onConflict is already provided
      expect(ItemFilter.allowOnly).not.toHaveBeenCalled();
    });

    it('should handle createMissing option', () => {
      mockTargetContainer.hasItem.mockReturnValue(false);

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { createMissing: true }
      );

      expect(result.statistics.created).toBeGreaterThan(0);
    });

    it('should handle dryRun option', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { dryRun: true }
      );

      expect(result.success).toBe(true);
      expect(mockTargetContainer.setItem).not.toHaveBeenCalled();
    });

    it('should handle preserveMetadata option', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { preserveMetadata: true }
      );

      expect(result.success).toBe(true);
    });

    it('should handle onConflict resolver', () => {
      const onConflict = jest.fn().mockReturnValue(mockSourceItem);
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.TARGET_NEWER
      });

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { onConflict }
      );

      expect(result.conflicts).toBeGreaterThan(0);
      expect(onConflict).toHaveBeenCalled();
    });

    it('should track conflicts without resolver', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.TARGET_NEWER
      });

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins'
      );

      expect(result.conflicts).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', () => {
      mockTargetContainer.getItem.mockImplementation(() => {
        throw new Error('Get item failed');
      });

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Merge Strategies', () => {
    describe('MERGE_NEWER_WINS', () => {
      it('should prefer source when source is newer', () => {
        ContextComparison.compare.mockReturnValue({
          result: ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER
        });

        // Ensure we have items to process by setting up the containers properly
        mockSourceContainer.keys.mockReturnValue(['item1']);
        mockTargetContainer.keys.mockReturnValue(['item1']);
        mockTargetContainer.hasItem.mockReturnValue(true);

        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'mergeNewerWins'
        );

        expect(result.statistics.sourcePreferred).toBeGreaterThan(0);
      });

      it('should prefer target when target is newer', () => {
        ContextComparison.compare.mockReturnValue({
          result: ContextComparison.COMPARISON_RESULTS.TARGET_NEWER
        });

        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'mergeNewerWins'
        );

        expect(result.statistics.targetPreferred).toBeGreaterThan(0);
      });

      it('should skip when items are equal', () => {
        ContextComparison.compare.mockReturnValue({
          result: ContextComparison.COMPARISON_RESULTS.EQUAL
        });

        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'mergeNewerWins'
        );

        expect(result.statistics.skipped).toBeGreaterThan(0);
      });
    });

    describe('MERGE_SOURCE_PRIORITY', () => {
      it('should always prefer source items', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'mergeSourcePriority'
        );

        expect(result.statistics.sourcePreferred).toBeGreaterThan(0);
      });
    });

    describe('MERGE_TARGET_PRIORITY', () => {
      it('should always prefer target items', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'mergeTargetPriority'
        );

        expect(result.statistics.targetPreferred).toBeGreaterThan(0);
      });
    });

    describe('UPDATE_SOURCE_TO_TARGET', () => {
      it('should update source with target values', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'updateSourceToTarget'
        );

        expect(result.statistics.targetPreferred).toBeGreaterThan(0);
      });
    });

    describe('UPDATE_TARGET_TO_SOURCE', () => {
      it('should update target with source values', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'updateTargetToSource'
        );

        expect(result.statistics.sourcePreferred).toBeGreaterThan(0);
      });
    });

    describe('REPLACE', () => {
      it('should replace target with source', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'replace'
        );

        expect(result.statistics.sourcePreferred).toBeGreaterThan(0);
      });
    });

    describe('NO_ACTION', () => {
      it('should perform no actions', () => {
        const result = ContextMerger.merge(
          mockSourceContext,
          mockTargetContext,
          'noAction'
        );

        expect(result.statistics.skipped).toBeGreaterThan(0);
        expect(result.changes.some(change => change.reason === 'noAction strategy')).toBe(true);
      });
    });
  });

  describe('analyze', () => {
    it('should perform analysis without making changes', () => {
      const result = ContextMerger.analyze(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(true);
      expect(mockTargetContainer.setItem).not.toHaveBeenCalled();
    });

    it('should use custom strategy for analysis', () => {
      const result = ContextMerger.analyze(
        mockSourceContext,
        mockTargetContext,
        'mergeSourcePriority'
      );

      expect(result.strategy).toBe('mergeSourcePriority');
    });

    it('should pass through options correctly', () => {
      const result = ContextMerger.analyze(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { compareBy: 'createdAt' }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('validateCompatibility', () => {
    it('should return true for compatible contexts', () => {
      const isCompatible = ContextMerger.validateCompatibility(
        mockSourceContext,
        mockTargetContext
      );

      expect(isCompatible).toBe(true);
    });

    it('should return false for null source', () => {
      const isCompatible = ContextMerger.validateCompatibility(
        null,
        mockTargetContext
      );

      expect(isCompatible).toBe(false);
    });

    it('should return false for null target', () => {
      const isCompatible = ContextMerger.validateCompatibility(
        mockSourceContext,
        null
      );

      expect(isCompatible).toBe(false);
    });

    it('should return false for incompatible contexts', () => {
      const incompatibleContext = { schema: true };

      const isCompatible = ContextMerger.validateCompatibility(
        mockSourceContext,
        incompatibleContext
      );

      expect(isCompatible).toBe(false);
    });

    it('should require all component properties', () => {
      const partialContext = {
        schema: mockSourceContainer,
        constants: mockSourceContainer
        // missing other components
      };

      const isCompatible = ContextMerger.validateCompatibility(
        mockSourceContext,
        partialContext
      );

      expect(isCompatible).toBe(false);
    });
  });

  describe('Component Processing', () => {
    it('should skip missing components gracefully', () => {
      const contextWithMissingComponent = {
        ...mockSourceContext,
        schema: null
      };

      const result = ContextMerger.merge(
        contextWithMissingComponent,
        mockTargetContext
      );

      expect(result.success).toBe(true);
      expect(result.statistics.skipped).toBeGreaterThan(0);
    });

    it('should handle components with no items', () => {
      const emptyContainer = {
        keys: jest.fn(() => []),
        getItem: jest.fn(),
        hasItem: jest.fn(() => false),
        setItem: jest.fn()
      };

      const contextWithEmptyComponent = {
        ...mockSourceContext,
        data: emptyContainer
      };

      const result = ContextMerger.merge(
        contextWithEmptyComponent,
        mockTargetContext
      );

      expect(result.success).toBe(true);
    });

    it('should handle component errors gracefully', () => {
      mockSourceContainer.keys.mockImplementation(() => {
        throw new Error('Keys retrieval failed');
      });

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('Keys retrieval failed'))).toBe(true);
    });
  });

  describe('Item Processing', () => {
    it('should create missing items when createMissing is true', () => {
      mockTargetContainer.hasItem.mockReturnValue(false);

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { createMissing: true }
      );

      expect(mockTargetContainer.setItem).toHaveBeenCalled();
      expect(result.statistics.created).toBeGreaterThan(0);
    });

    it('should skip missing items when createMissing is false', () => {
      mockTargetContainer.hasItem.mockReturnValue(false);

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { createMissing: false }
      );

      expect(result.statistics.skipped).toBeGreaterThan(0);
    });

    it('should handle null source items', () => {
      mockSourceContainer.getItem.mockReturnValue(null);

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(true);
      expect(result.statistics.skipped).toBeGreaterThan(0);
    });

    it('should preserve metadata when option is set', () => {
      const itemWithMetadata = {
        ...mockSourceItem,
        setMetadata: jest.fn()
      };

      mockTargetContainer.setItem.mockImplementation((key, item) => {
        if (item.setMetadata) {
          item.setMetadata({ ...mockTargetItem.metadata, ...item.metadata });
        }
      });

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeSourcePriority',
        { preserveMetadata: true }
      );

      expect(result.success).toBe(true);
    });

    it('should handle item processing errors', () => {
      mockTargetContainer.setItem.mockImplementation(() => {
        throw new Error('Item set failed');
      });

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.changes.some(change =>
        change.action === 'error' && change.error === 'Item set failed'
      )).toBe(true);
    });
  });

  describe('Statistics Tracking', () => {
    it('should track all statistics correctly', () => {
      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.statistics).toHaveProperty('sourcePreferred');
      expect(result.statistics).toHaveProperty('targetPreferred');
      expect(result.statistics).toHaveProperty('created');
      expect(result.statistics).toHaveProperty('updated');
      expect(result.statistics).toHaveProperty('skipped');
      expect(typeof result.statistics.sourcePreferred).toBe('number');
    });

    it('should count items processed correctly', () => {
      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.itemsProcessed).toBeGreaterThan(0);
      expect(typeof result.itemsProcessed).toBe('number');
    });

    it('should track changes with proper format', () => {
      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(Array.isArray(result.changes)).toBe(true);
      if (result.changes.length > 0) {
        expect(result.changes[0]).toHaveProperty('path');
        expect(result.changes[0]).toHaveProperty('action');
      }
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex merge with multiple components', () => {
      const complexSource = {
        schema: mockSourceContainer,
        data: {
          keys: () => ['player', 'world', 'settings'],
          getItem: (key) => ({ value: `source ${key}`, modifiedAt: new Date() }),
          hasItem: () => true,
          setItem: jest.fn()
        },
        flags: {
          keys: () => ['feature1', 'feature2'],
          getItem: (key) => ({ value: true, modifiedAt: new Date() }),
          hasItem: () => true,
          setItem: jest.fn()
        },
        constants: mockSourceContainer,
        manifest: mockSourceContainer,
        state: mockSourceContainer,
        settings: mockSourceContainer
      };

      const result = ContextMerger.merge(
        complexSource,
        mockTargetContext,
        'mergeNewerWins'
      );

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBeGreaterThan(0);
    });

    it('should handle partial context synchronization', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { includeComponents: ['data', 'flags'] }
      );

      expect(result.success).toBe(true);
    });

    it('should handle edge case with identical contexts', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.EQUAL
      });

      const result = ContextMerger.merge(
        mockSourceContext,
        mockSourceContext,
        'mergeNewerWins'
      );

      expect(result.success).toBe(true);
      expect(result.statistics.skipped).toBeGreaterThan(0);
    });

    it('should handle large-scale merge operations', () => {
      const largeContainer = {
        keys: () => Array.from({ length: 100 }, (_, i) => `item${i}`),
        getItem: (key) => ({ value: `value ${key}`, modifiedAt: new Date() }),
        hasItem: () => true,
        setItem: jest.fn()
      };

      const largeContext = {
        ...mockSourceContext,
        data: largeContainer
      };

      const result = ContextMerger.merge(largeContext, mockTargetContext);

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBeGreaterThan(50);
    });
  });

  describe('Constants Integration', () => {
    it('should properly integrate with merge strategy constants', () => {
      Object.values(ContextMerger.MERGE_STRATEGIES).forEach(strategy => {
        expect(typeof strategy).toBe('string');
        expect(strategy.length).toBeGreaterThan(0);
      });
    });

    it('should work with all default component constants', () => {
      ContextMerger.DEFAULT_COMPONENTS.forEach(component => {
        expect(typeof component).toBe('string');
        expect(mockSourceContext).toHaveProperty(component);
        expect(mockTargetContext).toHaveProperty(component);
      });
    });
  });

  describe('Alternative Constants Configuration', () => {
    it('should handle custom component sets', () => {
      const customComponents = ['data', 'flags'];

      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { includeComponents: customComponents }
      );

      expect(result.success).toBe(true);
    });

    it('should handle custom comparison fields', () => {
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'mergeNewerWins',
        { compareBy: 'lastAccessed' }
      );

      expect(ContextComparison.compare).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { compareBy: 'lastAccessed' }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle contexts with undefined components', () => {
      const contextWithUndefined = {
        ...mockSourceContext,
        schema: undefined
      };

      const result = ContextMerger.merge(contextWithUndefined, mockTargetContext);

      expect(result.success).toBe(true);
    });

    it('should handle containers without required methods', () => {
      const invalidContainer = { value: 'test' };
      const contextWithInvalidContainer = {
        ...mockSourceContext,
        data: invalidContainer
      };

      const result = ContextMerger.merge(contextWithInvalidContainer, mockTargetContext);

      expect(result.success).toBe(true);
    });

    it('should handle circular reference scenarios safely', () => {
      const circularItem = { value: 'circular' };
      circularItem.ref = circularItem;

      mockSourceContainer.getItem.mockReturnValue(circularItem);

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle component processing errors', () => {
      mockSourceContainer.keys.mockImplementation(() => {
        throw new Error('Component error');
      });

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should collect multiple errors', () => {
      mockSourceContainer.keys.mockImplementation(() => {
        throw new Error('Keys error');
      });
      mockTargetContainer.setItem.mockImplementation(() => {
        throw new Error('SetItem error');
      });

      const result = ContextMerger.merge(mockSourceContext, mockTargetContext);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle invalid merge strategy gracefully', () => {
      // The current implementation doesn't validate strategy names
      // This test ensures it doesn't crash with unknown strategies
      const result = ContextMerger.merge(
        mockSourceContext,
        mockTargetContext,
        'unknownStrategy'
      );

      expect(result).toBeDefined();
    });
  });
});