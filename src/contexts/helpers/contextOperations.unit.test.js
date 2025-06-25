import ContextOperations from './contextOperations.js';
import ContextMerger, { ItemFilter } from './contextMerger.js';

/**
 * @file contextOperations.test.js
 * @description Test file for the ContextOperations class functionality.
 * @path src/contexts/helpers/contextOperations.test.js
 */


// Mock the dependencies
jest.mock('./contextMerger.js');

describe('ContextOperations', () => {
  let mockContext1, mockContext2, mockContext3, mockTarget;
  let mockMergeResult;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock contexts
    mockContext1 = { id: 'context1', data: { value: 1 } };
    mockContext2 = { id: 'context2', data: { value: 2 } };
    mockContext3 = { id: 'context3', data: { value: 3 } };
    mockTarget = { id: 'target', data: { value: 0 } };

    // Setup default mock merge result
    mockMergeResult = {
      success: true,
      itemsProcessed: 5,
      conflicts: 1,
      mergedItems: ['data.value']
    };

    ContextMerger.merge.mockReturnValue(mockMergeResult);
    ItemFilter.and = jest.fn().mockReturnValue('andFilter');
    ItemFilter.or = jest.fn().mockReturnValue('orFilter');
    ItemFilter.allowOnly = jest.fn().mockReturnValue('allowOnlyFilter');
    ItemFilter.blockOnly = jest.fn().mockReturnValue('blockOnlyFilter');
  });

  describe('pushItems', () => {
    it('should push specific items from source to target', () => {
      const itemPaths = ['data.value', 'settings.theme'];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const result = ContextOperations.pushItems(mockContext1, mockTarget, itemPaths, strategy, options);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, strategy, {
        validateSchema: true,
        allowOnly: itemPaths
      });
      expect(result).toBe(mockMergeResult);
    });

    it('should use default strategy when not provided', () => {
      const itemPaths = ['data.value'];

      ContextOperations.pushItems(mockContext1, mockTarget, itemPaths);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, 'mergeNewerWins', {
        allowOnly: itemPaths
      });
    });

    it('should throw error when source is not provided', () => {
      const itemPaths = ['data.value'];

      expect(() => {
        ContextOperations.pushItems(null, mockTarget, itemPaths);
      }).toThrow('Source and target contexts must be provided');
    });

    it('should throw error when target is not provided', () => {
      const itemPaths = ['data.value'];

      expect(() => {
        ContextOperations.pushItems(mockContext1, null, itemPaths);
      }).toThrow('Source and target contexts must be provided');
    });

    it('should throw error when itemPaths is not an array', () => {
      expect(() => {
        ContextOperations.pushItems(mockContext1, mockTarget, 'not-an-array');
      }).toThrow('Item paths must be a non-empty array');
    });

    it('should throw error when itemPaths is empty array', () => {
      expect(() => {
        ContextOperations.pushItems(mockContext1, mockTarget, []);
      }).toThrow('Item paths must be a non-empty array');
    });
  });

  describe('pullItems', () => {
    it('should pull specific items from source to target', () => {
      const itemPaths = ['data.value', 'settings.theme'];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const result = ContextOperations.pullItems(mockContext1, mockTarget, itemPaths, strategy, options);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockTarget, mockContext1, strategy, {
        validateSchema: true,
        allowOnly: itemPaths
      });
      expect(result).toBe(mockMergeResult);
    });

    it('should use default strategy when not provided', () => {
      const itemPaths = ['data.value'];

      ContextOperations.pullItems(mockContext1, mockTarget, itemPaths);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockTarget, mockContext1, 'mergeNewerWins', {
        allowOnly: itemPaths
      });
    });

    it('should throw error when source is not provided', () => {
      const itemPaths = ['data.value'];

      expect(() => {
        ContextOperations.pullItems(null, mockTarget, itemPaths);
      }).toThrow('Source and target contexts must be provided');
    });

    it('should throw error when target is not provided', () => {
      const itemPaths = ['data.value'];

      expect(() => {
        ContextOperations.pullItems(mockContext1, null, itemPaths);
      }).toThrow('Source and target contexts must be provided');
    });

    it('should throw error when itemPaths is not an array', () => {
      expect(() => {
        ContextOperations.pullItems(mockContext1, mockTarget, 'not-an-array');
      }).toThrow('Item paths must be a non-empty array');
    });

    it('should throw error when itemPaths is empty array', () => {
      expect(() => {
        ContextOperations.pullItems(mockContext1, mockTarget, []);
      }).toThrow('Item paths must be a non-empty array');
    });
  });

  describe('pushFromMultipleSources', () => {
    it('should push from multiple sources to single target successfully', () => {
      const sources = [mockContext1, mockContext2, mockContext3];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const results = ContextOperations.pushFromMultipleSources(sources, mockTarget, strategy, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(3);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(1, mockContext1, mockTarget, strategy, options);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(2, mockContext2, mockTarget, strategy, options);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(3, mockContext3, mockTarget, strategy, options);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toEqual({
          sourceIndex: index,
          success: true,
          result: mockMergeResult
        });
      });
    });

    it('should handle merge errors gracefully', () => {
      const sources = [mockContext1, mockContext2];
      const errorMessage = 'Merge failed';

      ContextMerger.merge
        .mockReturnValueOnce(mockMergeResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushFromMultipleSources(sources, mockTarget);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        sourceIndex: 0,
        success: true,
        result: mockMergeResult
      });
      expect(results[1]).toEqual({
        sourceIndex: 1,
        success: false,
        error: errorMessage,
        result: null
      });
    });

    it('should use default strategy when not provided', () => {
      const sources = [mockContext1];

      ContextOperations.pushFromMultipleSources(sources, mockTarget);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, 'mergeNewerWins', {});
    });

    it('should throw error when sources is not an array', () => {
      expect(() => {
        ContextOperations.pushFromMultipleSources('not-an-array', mockTarget);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when sources is empty array', () => {
      expect(() => {
        ContextOperations.pushFromMultipleSources([], mockTarget);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when target is not provided', () => {
      expect(() => {
        ContextOperations.pushFromMultipleSources([mockContext1], null);
      }).toThrow('Target context must be provided');
    });
  });

  describe('pushToMultipleTargets', () => {
    it('should push from single source to multiple targets successfully', () => {
      const targets = [mockContext1, mockContext2, mockContext3];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const results = ContextOperations.pushToMultipleTargets(mockTarget, targets, strategy, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(3);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(1, mockTarget, mockContext1, strategy, options);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(2, mockTarget, mockContext2, strategy, options);
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(3, mockTarget, mockContext3, strategy, options);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toEqual({
          targetIndex: index,
          success: true,
          result: mockMergeResult
        });
      });
    });

    it('should handle merge errors gracefully', () => {
      const targets = [mockContext1, mockContext2];
      const errorMessage = 'Merge failed';

      ContextMerger.merge
        .mockReturnValueOnce(mockMergeResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushToMultipleTargets(mockTarget, targets);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        targetIndex: 0,
        success: true,
        result: mockMergeResult
      });
      expect(results[1]).toEqual({
        targetIndex: 1,
        success: false,
        error: errorMessage,
        result: null
      });
    });

    it('should use default strategy when not provided', () => {
      const targets = [mockContext1];

      ContextOperations.pushToMultipleTargets(mockTarget, targets);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockTarget, mockContext1, 'mergeNewerWins', {});
    });

    it('should throw error when source is not provided', () => {
      expect(() => {
        ContextOperations.pushToMultipleTargets(null, [mockContext1]);
      }).toThrow('Source context must be provided');
    });

    it('should throw error when targets is not an array', () => {
      expect(() => {
        ContextOperations.pushToMultipleTargets(mockTarget, 'not-an-array');
      }).toThrow('Targets must be a non-empty array of contexts');
    });

    it('should throw error when targets is empty array', () => {
      expect(() => {
        ContextOperations.pushToMultipleTargets(mockTarget, []);
      }).toThrow('Targets must be a non-empty array of contexts');
    });
  });

  describe('pushItemsBulk', () => {
    it('should push items from multiple sources to multiple targets successfully', () => {
      const sources = [mockContext1, mockContext2];
      const targets = [mockContext3, mockTarget];
      const itemPaths = ['data.value', 'settings.theme'];
      const strategy = 'mergeSourcePriority';
      const options = { validateSchema: true };

      const results = ContextOperations.pushItemsBulk(sources, targets, itemPaths, strategy, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(4);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(2);
      expect(results[1]).toHaveLength(2);

      // Check each result
      expect(results[0][0]).toEqual({
        sourceIndex: 0,
        targetIndex: 0,
        success: true,
        result: mockMergeResult
      });

      // Verify merge calls with allowOnly filter
      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockContext3, strategy, {
        validateSchema: true,
        allowOnly: itemPaths
      });
    });

    it('should handle merge errors gracefully in bulk operations', () => {
      const sources = [mockContext1, mockContext2];
      const targets = [mockContext3];
      const itemPaths = ['data.value'];
      const errorMessage = 'Merge failed';

      ContextMerger.merge
        .mockReturnValueOnce(mockMergeResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const results = ContextOperations.pushItemsBulk(sources, targets, itemPaths);

      expect(results).toHaveLength(2);
      expect(results[0][0]).toEqual({
        sourceIndex: 0,
        targetIndex: 0,
        success: true,
        result: mockMergeResult
      });
      expect(results[1][0]).toEqual({
        sourceIndex: 1,
        targetIndex: 0,
        success: false,
        error: errorMessage,
        result: null
      });
    });

    it('should use default strategy when not provided', () => {
      const sources = [mockContext1];
      const targets = [mockTarget];
      const itemPaths = ['data.value'];

      ContextOperations.pushItemsBulk(sources, targets, itemPaths);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, 'mergeNewerWins', {
        allowOnly: itemPaths
      });
    });

    it('should throw error when sources is not an array', () => {
      expect(() => {
        ContextOperations.pushItemsBulk('not-an-array', [mockTarget], ['data.value']);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when targets is not an array', () => {
      expect(() => {
        ContextOperations.pushItemsBulk([mockContext1], 'not-an-array', ['data.value']);
      }).toThrow('Targets must be a non-empty array of contexts');
    });

    it('should throw error when itemPaths is not an array', () => {
      expect(() => {
        ContextOperations.pushItemsBulk([mockContext1], [mockTarget], 'not-an-array');
      }).toThrow('Item paths must be a non-empty array');
    });

    it('should throw error when arrays are empty', () => {
      expect(() => {
        ContextOperations.pushItemsBulk([], [mockTarget], ['data.value']);
      }).toThrow('Sources must be a non-empty array of contexts');

      expect(() => {
        ContextOperations.pushItemsBulk([mockContext1], [], ['data.value']);
      }).toThrow('Targets must be a non-empty array of contexts');

      expect(() => {
        ContextOperations.pushItemsBulk([mockContext1], [mockTarget], []);
      }).toThrow('Item paths must be a non-empty array');
    });
  });

  describe('synchronizeBidirectional', () => {
    it('should synchronize contexts bidirectionally successfully', () => {
      const options = {
        strategy: 'mergeSourcePriority',
        context1Priority: ['data.player'],
        context2Priority: ['settings.ui'],
        excludePaths: ['data.cache'],
        validateSchema: true
      };

      const result = ContextOperations.synchronizeBidirectional(mockContext1, mockContext2, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
      expect(ItemFilter.and).toHaveBeenCalledTimes(2);
      expect(ItemFilter.or).toHaveBeenCalledTimes(2);
      expect(ItemFilter.blockOnly).toHaveBeenCalledWith(['data.cache']);
      expect(ItemFilter.allowOnly).toHaveBeenCalledWith(['data.player']);
      expect(ItemFilter.allowOnly).toHaveBeenCalledWith(['settings.ui']);

      expect(result).toEqual({
        success: true,
        context1ToContext2: mockMergeResult,
        context2ToContext1: mockMergeResult,
        totalItemsProcessed: 10,
        totalConflicts: 2
      });
    });

    it('should use default options when not provided', () => {
      ContextOperations.synchronizeBidirectional(mockContext1, mockContext2);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockContext2, 'mergeNewerWins', expect.any(Object));
      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext2, mockContext1, 'mergeNewerWins', expect.any(Object));
    });

    it('should handle merge failures in bidirectional sync', () => {
      const failedResult = { success: false, itemsProcessed: 0, conflicts: 0 };

      ContextMerger.merge
        .mockReturnValueOnce(mockMergeResult)
        .mockReturnValueOnce(failedResult);

      const result = ContextOperations.synchronizeBidirectional(mockContext1, mockContext2);

      expect(result.success).toBe(false);
      expect(result.context1ToContext2).toBe(mockMergeResult);
      expect(result.context2ToContext1).toBe(failedResult);
    });

    it('should handle empty priority arrays', () => {
      const options = {
        context1Priority: [],
        context2Priority: [],
        excludePaths: []
      };

      ContextOperations.synchronizeBidirectional(mockContext1, mockContext2, options);

      expect(ItemFilter.allowOnly).toHaveBeenCalledWith([]);
      expect(ItemFilter.blockOnly).toHaveBeenCalledWith([]);
    });
  });

  describe('consolidateContexts', () => {
    it('should consolidate multiple contexts successfully', () => {
      const sources = [mockContext1, mockContext2, mockContext3];
      const options = {
        strategy: 'mergeSourcePriority',
        priorities: { 0: 'high', 1: 'medium', 2: 'low' },
        excludePaths: ['data.temp'],
        validateSchema: true
      };

      const result = ContextOperations.consolidateContexts(sources, mockTarget, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(3);
      expect(ItemFilter.blockOnly).toHaveBeenCalledWith(['data.temp']);

      expect(result).toEqual({
        success: true,
        results: expect.arrayContaining([
          expect.objectContaining({ sourceIndex: expect.any(Number), success: true, result: mockMergeResult })
        ]),
        totalItemsProcessed: 15,
        totalConflicts: 3,
        consolidatedSources: 3
      });
    });

    it('should sort sources by priority correctly', () => {
      const sources = [mockContext1, mockContext2, mockContext3];
      const options = {
        priorities: { 0: 'low', 1: 'high', 2: 'medium' }
      };

      ContextOperations.consolidateContexts(sources, mockTarget, options);

      // High priority (context2) should be processed first
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(1, mockContext2, mockTarget, 'mergeNewerWins', expect.any(Object));
      // Medium priority (context3) should be processed second
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(2, mockContext3, mockTarget, 'mergeNewerWins', expect.any(Object));
      // Low priority (context1) should be processed last
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(3, mockContext1, mockTarget, 'mergeNewerWins', expect.any(Object));
    });

    it('should handle sources without explicit priorities', () => {
      const sources = [mockContext1, mockContext2];
      const options = { priorities: { 0: 'high' } }; // Only first source has priority

      ContextOperations.consolidateContexts(sources, mockTarget, options);

      expect(ContextMerger.merge).toHaveBeenCalledTimes(2);
      // High priority source should be processed first
      expect(ContextMerger.merge).toHaveBeenNthCalledWith(1, mockContext1, mockTarget, 'mergeNewerWins', expect.any(Object));
    });

    it('should handle merge errors during consolidation', () => {
      const sources = [mockContext1, mockContext2];
      const errorMessage = 'Consolidation failed';

      ContextMerger.merge
        .mockReturnValueOnce(mockMergeResult)
        .mockImplementationOnce(() => { throw new Error(errorMessage); });

      const result = ContextOperations.consolidateContexts(sources, mockTarget);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1]).toEqual({
        sourceIndex: 1,
        success: false,
        error: errorMessage,
        result: null
      });
    });

    it('should use default options when not provided', () => {
      const sources = [mockContext1];

      ContextOperations.consolidateContexts(sources, mockTarget);

      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, 'mergeNewerWins', {});
    });

    it('should skip filter when no exclude paths provided', () => {
      const sources = [mockContext1];

      ContextOperations.consolidateContexts(sources, mockTarget);

      expect(ItemFilter.blockOnly).not.toHaveBeenCalled();
      expect(ContextMerger.merge).toHaveBeenCalledWith(mockContext1, mockTarget, 'mergeNewerWins', {
        onConflict: undefined
      });
    });

    it('should throw error when sources is not an array', () => {
      expect(() => {
        ContextOperations.consolidateContexts('not-an-array', mockTarget);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when sources is empty array', () => {
      expect(() => {
        ContextOperations.consolidateContexts([], mockTarget);
      }).toThrow('Sources must be a non-empty array of contexts');
    });

    it('should throw error when target is not provided', () => {
      expect(() => {
        ContextOperations.consolidateContexts([mockContext1], null);
      }).toThrow('Target context must be provided');
    });
  });
});