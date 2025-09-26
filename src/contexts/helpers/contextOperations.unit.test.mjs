/**
 * @file contextOperations.unit.test.mjs
 * @description Unit tests for the ContextOperations class functionality.
 * @path src/contexts/helpers/contextOperations.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock modules with problematic imports
vi.mock('./contextItem.mjs', () => ({
  ContextItem: vi.fn().mockImplementation((value, metadata) => ({
    value,
    metadata: metadata || {},
    modifiedAt: new Date(),
    setMetadata: vi.fn()
  }))
}));

vi.mock('./contextContainer.mjs', () => ({
  ContextContainer: vi.fn().mockImplementation(() => ({
    keys: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn()
  }))
}));

vi.mock('./contextContainerSync.mjs', () => ({
  default: {
    syncFromSource: vi.fn(),
    syncToSource: vi.fn()
  }
}));

vi.mock('./contextItemSync.mjs', () => ({
  default: {
    syncFromSource: vi.fn(),
    syncToSource: vi.fn()
  }
}));

vi.mock('./contextMerger.mjs', () => ({
  default: {
    merge: vi.fn(),
    analyze: vi.fn()
  }
}));

import ContextOperations from './contextOperations.mjs';
import ContextContainerSync from './contextContainerSync.mjs';
import ContextItemSync from './contextItemSync.mjs';
import ContextMerger from './contextMerger.mjs';

// Import the actual classes for instanceof checks to work
import { ContextContainer } from './contextContainer.mjs';
import { ContextItem } from './contextItem.mjs';

describe('ContextOperations', () => {
  let mockContainer1, mockContainer2, mockContainer3, mockTargetContainer, mockTargetContainer2;
  let mockItem1, mockItem2, mockItem3, mockTargetItem;
  let mockContainerSyncResult, mockItemSyncResult, mockResult;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock ContextContainer objects
    mockContainer1 = {};
    Object.setPrototypeOf(mockContainer1, ContextContainer.prototype);

    mockContainer2 = {};
    Object.setPrototypeOf(mockContainer2, ContextContainer.prototype);

    mockContainer3 = {};
    Object.setPrototypeOf(mockContainer3, ContextContainer.prototype);

    mockTargetContainer = {};
    Object.setPrototypeOf(mockTargetContainer, ContextContainer.prototype);

    mockTargetContainer2 = {};
    Object.setPrototypeOf(mockTargetContainer2, ContextContainer.prototype);

    // Create mock ContextItem objects
    mockItem1 = {};
    Object.setPrototypeOf(mockItem1, ContextItem.prototype);

    mockItem2 = {};
    Object.setPrototypeOf(mockItem2, ContextItem.prototype);

    mockItem3 = {};
    Object.setPrototypeOf(mockItem3, ContextItem.prototype);

    mockTargetItem = {};
    Object.setPrototypeOf(mockTargetItem, ContextItem.prototype);

    // Setup default mock results
    mockContainerSyncResult = {
      success: true,
      itemsProcessed: ['data.value', 'settings.theme'],
      conflicts: 1,
      changes: [{ type: 'update', path: 'data.value' }],
      operation: 'test'
    };

    mockItemSyncResult = {
      success: true,
      itemsProcessed: [1],
      changes: [{ type: 'value', path: 'test' }],
      operation: 'test'
    };

    // Mock ContextContainerSync methods
    ContextContainerSync.mergeWithPriority.mockReturnValue(mockContainerSyncResult);
    ContextContainerSync.mergeNewerWins.mockReturnValue(mockContainerSyncResult);

    // Mock ContextItemSync methods
    ContextItemSync.updateTargetToSource.mockReturnValue(mockItemSyncResult);
    ContextItemSync.mergeNewerWins.mockReturnValue(mockItemSyncResult);

    // Mock ContextMerger methods (needed for filtering operations)
    mockResult = {
      success: true,
      operation: 'merge',
      itemsProcessed: ['data.value', 'settings.theme'],
      conflicts: 0,
      changes: [{ type: 'update', path: 'data.value' }]
    };
    ContextMerger.merge = vi.fn().mockReturnValue(mockResult);
  });

  describe('pushItems', () => {
    describe('with ContextContainer instances', () => {
      it('should push specific items from source to target', () => {
        const itemPaths = ['data.value', 'settings.theme'];
        const strategy = 'mergeSourcePriority';
        const options = { validateSchema: true };

        const result = ContextOperations.pushItems(mockContainer1, mockTargetContainer, itemPaths, strategy, options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          strategy,
          { validateSchema: true, allowOnly: itemPaths }
        );
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
        expect(result.operation).toBe('pushItems');
        expect(result.itemsProcessed).toEqual(expect.arrayContaining(itemPaths));
      });

      it('should use mergeNewerWins strategy by default', () => {
        const itemPaths = ['data.value'];

        ContextOperations.pushItems(mockContainer1, mockTargetContainer, itemPaths);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'mergeNewerWins',
          { allowOnly: itemPaths }
        );
      });

      it('should handle mergeTargetPriority strategy', () => {
        const itemPaths = ['data.value'];
        const strategy = 'mergeTargetPriority';

        ContextOperations.pushItems(mockContainer1, mockTargetContainer, itemPaths, strategy);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          strategy,
          { allowOnly: itemPaths }
        );
      });
    });

    describe('with ContextItem instances', () => {
      it('should push specific items from source to target', () => {
        const itemPaths = ['value'];
        const strategy = 'mergeSourcePriority';
        const options = { validateSchema: true };

        const result = ContextOperations.pushItems(mockItem1, mockTargetItem, itemPaths, strategy, options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockItem1,
          mockTargetItem,
          strategy,
          { validateSchema: true, allowOnly: itemPaths }
        );
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
        expect(result.operation).toBe('pushItems');
      });

      it('should use mergeNewerWins strategy by default', () => {
        const itemPaths = ['value'];

        ContextOperations.pushItems(mockItem1, mockTargetItem, itemPaths);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockItem1,
          mockTargetItem,
          'mergeNewerWins',
          { allowOnly: itemPaths }
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when source is not provided', () => {
        const itemPaths = ['data.value'];

        expect(() => {
          ContextOperations.pushItems(null, mockTargetContainer, itemPaths);
        }).toThrow('Source and target contexts must be provided');
      });

      it('should throw error when target is not provided', () => {
        const itemPaths = ['data.value'];

        expect(() => {
          ContextOperations.pushItems(mockContainer1, null, itemPaths);
        }).toThrow('Source and target contexts must be provided');
      });

      it('should throw error when itemPaths is not an array', () => {
        expect(() => {
          ContextOperations.pushItems(mockContainer1, mockTargetContainer, 'not-an-array');
        }).toThrow('Item paths must be a non-empty array');
      });

      it('should throw error when itemPaths is empty array', () => {
        expect(() => {
          ContextOperations.pushItems(mockContainer1, mockTargetContainer, []);
        }).toThrow('Item paths must be a non-empty array');
      });

      it('should throw error for incompatible object types', () => {
        ContextMerger.merge.mockImplementation(() => {
          throw new Error('Incompatible object types: ContextContainer and ContextItem');
        });

        expect(() => {
          ContextOperations.pushItems(mockContainer1, mockTargetItem, ['value']);
        }).toThrow('Incompatible object types: ContextContainer and ContextItem');
      });
    });
  });

  describe('pullItems', () => {
    describe('with ContextContainer instances', () => {
      it('should pull specific items from source to target', () => {
        const itemPaths = ['data.value', 'settings.theme'];
        const strategy = 'mergeSourcePriority';
        const options = { validateSchema: true };

        const result = ContextOperations.pullItems(mockContainer1, mockTargetContainer, itemPaths, strategy, options);

        // pullItems swaps source and target parameters
        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockTargetContainer,
          mockContainer1,
          strategy,
          { validateSchema: true, allowOnly: itemPaths }
        );
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
        expect(result.operation).toBe('pullItems');
      });
    });

    describe('with ContextItem instances', () => {
      it('should pull specific items from source to target', () => {
        const itemPaths = ['value'];
        const strategy = 'mergeNewerWins';

        const result = ContextOperations.pullItems(mockItem1, mockTargetItem, itemPaths, strategy);

        // pullItems swaps source and target parameters
        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockTargetItem,
          mockItem1,
          strategy,
          { allowOnly: itemPaths }
        );
        expect(result.operation).toBe('pullItems');
      });
    });

    describe('error handling', () => {
      it('should throw error when source is not provided', () => {
        const itemPaths = ['data.value'];

        expect(() => {
          ContextOperations.pullItems(null, mockTargetContainer, itemPaths);
        }).toThrow('Source and target contexts must be provided');
      });

      it('should throw error when itemPaths is empty', () => {
        expect(() => {
          ContextOperations.pullItems(mockContainer1, mockTargetContainer, []);
        }).toThrow('Item paths must be a non-empty array');
      });
    });
  });

  describe('pushFromMultipleSources', () => {
    it('should push from multiple ContextContainer sources to single target successfully', () => {
      const sources = [mockContainer1, mockContainer2, mockContainer3];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const results = ContextOperations.pushFromMultipleSources(sources, mockTargetContainer, strategy, options);

      expect(ContextContainerSync.mergeWithPriority).toHaveBeenCalledTimes(3);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(1, mockContainer1, mockTargetContainer, 'source', options);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(2, mockContainer2, mockTargetContainer, 'source', options);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(3, mockContainer3, mockTargetContainer, 'source', options);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.sourceIndex).toBe(index);
        expect(result.success).toBe(true);
        expect(result.operation).toBe('pushFromMultipleSources');
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should push from multiple ContextItem sources successfully', () => {
      const sources = [mockItem1, mockItem2];
      const strategy = 'mergeNewerWins';

      const results = ContextOperations.pushFromMultipleSources(sources, mockTargetItem, strategy);

      expect(ContextItemSync.mergeNewerWins).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
    });

    it('should handle sync errors gracefully', () => {
      const sources = [mockContainer1, mockContainer2];
      const errorMessage = 'Sync failed';

      ContextContainerSync.mergeWithPriority
        .mockReturnValueOnce(mockContainerSyncResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushFromMultipleSources(sources, mockTargetContainer, 'mergeSourcePriority');

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe(errorMessage);
    });

    it('should throw error when sources is not an array', () => {
      expect(() => {
        ContextOperations.pushFromMultipleSources('not-an-array', mockTargetContainer);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when target is not provided', () => {
      expect(() => {
        ContextOperations.pushFromMultipleSources([mockContainer1], null);
      }).toThrow('Target context must be provided');
    });
  });

  describe('pushToMultipleTargets', () => {
    it('should push from single source to multiple ContextContainer targets successfully', () => {
      const targets = [mockContainer1, mockContainer2, mockContainer3];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const results = ContextOperations.pushToMultipleTargets(mockTargetContainer, targets, strategy, options);

      expect(ContextContainerSync.mergeWithPriority).toHaveBeenCalledTimes(3);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(1, mockTargetContainer, mockContainer1, 'source', options);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(2, mockTargetContainer, mockContainer2, 'source', options);
      expect(ContextContainerSync.mergeWithPriority).toHaveBeenNthCalledWith(3, mockTargetContainer, mockContainer3, 'source', options);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.targetIndex).toBe(index);
        expect(result.success).toBe(true);
        expect(result.operation).toBe('pushToMultipleTargets');
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should handle sync errors gracefully', () => {
      const targets = [mockContainer1, mockContainer2];
      const errorMessage = 'Sync failed';

      ContextContainerSync.mergeNewerWins
        .mockReturnValueOnce(mockContainerSyncResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushToMultipleTargets(mockTargetContainer, targets);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe(errorMessage);
    });

    it('should throw error when source is not provided', () => {
      expect(() => {
        ContextOperations.pushToMultipleTargets(null, [mockContainer1]);
      }).toThrow('Source context must be provided');
    });

    it('should throw error when targets is not an array', () => {
      expect(() => {
        ContextOperations.pushToMultipleTargets(mockTargetContainer, 'not-an-array');
      }).toThrow('Targets must be a non-empty array of contexts');
    });
  });

  describe('pushItemsBulk', () => {
      it('should push items from multiple sources to multiple targets successfully', () => {
        const sources = [mockContainer1, mockContainer2];
        const targets = [mockTargetContainer, mockTargetContainer2];
        const itemPaths = ['data', 'settings'];
        const strategy = 'mergeWithPriority';
        const options = { validateSchema: true };

        const results = ContextOperations.pushItemsBulk(sources, targets, itemPaths, strategy, options);

        expect(ContextMerger.merge).toHaveBeenCalledTimes(4);
        expect(results).toHaveLength(2); // 2 sources
        expect(results[0]).toHaveLength(2); // 2 targets for each source
        expect(results[1]).toHaveLength(2);
        
        // Check that ContextMerger.merge was called with correct parameters
        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          strategy,
          { validateSchema: true, allowOnly: itemPaths }
        );

      // Check result structure
      expect(results[0][0]).toEqual(expect.objectContaining({
        sourceIndex: 0,
        targetIndex: 0,
        success: true,
        operation: 'pushItemsBulk',
        strategy: strategy
      }));
    });

    it('should handle sync errors gracefully in bulk operations', () => {
      const sources = [mockContainer1, mockContainer2];
      const targets = [mockContainer3];
      const itemPaths = ['data.value'];
      const errorMessage = 'Sync failed';

      ContextMerger.merge
        .mockReturnValueOnce(mockResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushItemsBulk(sources, targets, itemPaths);

      expect(results).toHaveLength(2);
      expect(results[0][0].success).toBe(true);
      expect(results[1][0].success).toBe(false);
      expect(results[1][0].error).toBe(errorMessage);
    });

    it('should throw error when arrays are empty', () => {
      expect(() => {
        ContextOperations.pushItemsBulk([], [mockTargetContainer], ['data.value']);
      }).toThrow('Sources must be a non-empty array of contexts');

      expect(() => {
        ContextOperations.pushItemsBulk([mockContainer1], [], ['data.value']);
      }).toThrow('Targets must be a non-empty array of contexts');

      expect(() => {
        ContextOperations.pushItemsBulk([mockContainer1], [mockTargetContainer], []);
      }).toThrow('Item paths must be a non-empty array');
    });
  });

  describe('synchronizeBidirectional', () => {
    it('should synchronize ContextContainer instances bidirectionally successfully', () => {
      const options = {
        strategy: 'mergeSourcePriority',
        validateSchema: true
      };

      const result = ContextOperations.synchronizeBidirectional(mockContainer1, mockContainer2, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(1, mockContainer1, mockContainer2, 'mergeSourcePriority', { validateSchema: true, excludePaths: [] });
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(2, mockContainer2, mockContainer1, 'mergeSourcePriority', { validateSchema: true, excludePaths: [] });

      expect(result).toEqual({
        success: true,
        operation: 'synchronizeBidirectional',
        strategy: 'mergeSourcePriority',
        direction1to2: expect.objectContaining({ success: true }),
        direction2to1: expect.objectContaining({ success: true })
      });
    });

    it('should synchronize ContextItem instances bidirectionally successfully', () => {
      const result = ContextOperations.synchronizeBidirectional(mockItem1, mockItem2);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.operation).toBe('synchronizeBidirectional');
    });

    it('should handle sync failures in bidirectional sync', () => {
      const failedResult = { success: false, itemsProcessed: 0, conflicts: 0 };

      ContextMerger.merge
        .mockReturnValueOnce(mockResult)
        .mockReturnValueOnce(failedResult);

      const result = ContextOperations.synchronizeBidirectional(mockContainer1, mockContainer2);

      expect(result.success).toBe(false);
      expect(result.direction1to2.success).toBe(true);
      expect(result.direction2to1.success).toBe(false);
    });

    it('should handle errors during synchronization', () => {
      ContextMerger.merge.mockImplementation(() => {
        throw new Error('Sync error');
      });

      const result = ContextOperations.synchronizeBidirectional(mockContainer1, mockContainer2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync error');
    });
  });

  describe('consolidateContexts', () => {
    it('should consolidate multiple ContextContainer sources successfully', () => {
      const sources = [mockContainer1, mockContainer2, mockContainer3];
      const options = {
        strategy: 'mergeSourcePriority',
        priorities: { 0: 'high', 1: 'medium', 2: 'low' },
        validateSchema: true
      };

      const result = ContextOperations.consolidateContexts(sources, mockTargetContainer, options);

      expect(ContextContainerSync.mergeWithPriority).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.operation).toBe('consolidateContexts');
      expect(result.strategy).toBe('mergeSourcePriority');
      expect(result.results).toHaveLength(3);
      expect(result.consolidatedSources).toBe(3);

      // Check that results contain expected structure
      result.results.forEach(res => {
        expect(res).toEqual(expect.objectContaining({
          sourceIndex: expect.any(Number),
          success: true,
          operation: 'consolidateContexts',
          strategy: 'mergeSourcePriority'
        }));
      });
    });

    it('should sort sources by priority correctly', () => {
      const sources = [mockContainer1, mockContainer2, mockContainer3];
      const options = {
        priorities: { 0: 'low', 1: 'high', 2: 'medium' }
      };

      ContextOperations.consolidateContexts(sources, mockTargetContainer, options);

      // High priority (container2) should be processed first
      expect(ContextContainerSync.mergeNewerWins).toHaveBeenNthCalledWith(1, mockContainer2, mockTargetContainer, {});
      // Medium priority (container3) should be processed second
      expect(ContextContainerSync.mergeNewerWins).toHaveBeenNthCalledWith(2, mockContainer3, mockTargetContainer, {});
      // Low priority (container1) should be processed last
      expect(ContextContainerSync.mergeNewerWins).toHaveBeenNthCalledWith(3, mockContainer1, mockTargetContainer, {});
    });

    it('should handle consolidation errors gracefully', () => {
      const sources = [mockContainer1, mockContainer2];
      const errorMessage = 'Consolidation failed';

      ContextContainerSync.mergeNewerWins
        .mockReturnValueOnce(mockContainerSyncResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const result = ContextOperations.consolidateContexts(sources, mockTargetContainer);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1]).toEqual({
        sourceIndex: 1,
        success: false,
        error: errorMessage,
        operation: 'consolidateContexts',
        strategy: 'mergeNewerWins'
      });
    });

    it('should use default options when not provided', () => {
      const sources = [mockContainer1];

      ContextOperations.consolidateContexts(sources, mockTargetContainer);

      expect(ContextContainerSync.mergeNewerWins).toHaveBeenCalledWith(mockContainer1, mockTargetContainer, {});
    });

    it('should throw error when sources is not an array', () => {
      expect(() => {
        ContextOperations.consolidateContexts('not-an-array', mockTargetContainer);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when target is not provided', () => {
      expect(() => {
        ContextOperations.consolidateContexts([mockContainer1], null);
      }).toThrow('Target context must be provided');
    });
  });

  describe('filtering capabilities', () => {
    describe('allowOnly filtering', () => {
      it('should preserve filtering capabilities through allowOnly options', () => {
        const itemPaths = ['data.specific', 'settings.specific'];

        ContextOperations.pushItems(mockContainer1, mockTargetContainer, itemPaths);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'mergeNewerWins',
          { allowOnly: itemPaths }
        );
      });

      it('should preserve filtering in bulk operations', () => {
        const sources = [mockContainer1];
        const targets = [mockTargetContainer];
        const itemPaths = ['filtered.path1', 'filtered.path2'];

        ContextOperations.pushItemsBulk(sources, targets, itemPaths);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'mergeNewerWins',
          { allowOnly: itemPaths }
        );
      });
    });

    describe('blockOnly and excludePaths filtering', () => {
      beforeEach(() => {
        // Setup the mock return value for ContextMerger.merge
        ContextMerger.merge = vi.fn().mockReturnValue({
          success: true,
          operation: 'merge',
          itemsProcessed: 2,
          conflicts: 0
        });
      });

      afterEach(() => {
        vi.clearAllMocks();
      });

      it('should use ContextMerger when blockOnly is specified', () => {
        const options = { blockOnly: ['blocked.path'] };

        const result = ContextOperations.pushFromMultipleSources([mockContainer1], mockTargetContainer, 'merge', options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'merge',
          { blockOnly: ['blocked.path'] }
        );
      });

      it('should use ContextMerger when excludePaths is specified', () => {
        const options = { excludePaths: ['excluded.path'] };

        ContextOperations.pushFromMultipleSources([mockContainer1], mockTargetContainer, 'merge', options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'merge',
          { excludePaths: ['excluded.path'] }
        );
      });

      it('should use ContextMerger in consolidation with excludePaths', () => {
        const sources = [mockContainer1];
        const options = { excludePaths: ['excluded.path'] };

        ContextOperations.consolidateContexts(sources, mockTargetContainer, options);

        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockTargetContainer,
          'mergeNewerWins',
          { excludePaths: ['excluded.path'] }
        );
      });

      it('should use ContextMerger in bidirectional sync with filtering', () => {
        const options = { blockOnly: ['blocked.path'] };

        ContextOperations.synchronizeBidirectional(mockContainer1, mockContainer2, options);

        expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer1,
          mockContainer2,
          'mergeNewerWins',
          { blockOnly: ['blocked.path'], excludePaths: [] }
        );
        expect(ContextMerger.merge).toHaveBeenCalledWith(
          mockContainer2,
          mockContainer1,
          'mergeNewerWins',
          { blockOnly: ['blocked.path'], excludePaths: [] }
        );
      });
    });
  });
});