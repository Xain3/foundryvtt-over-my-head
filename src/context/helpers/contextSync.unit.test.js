/**
 * @file contextSync.unit.test.js
 * @description Unit tests for the ContextSync class for synchronizing Context instances, ContextContainers, and ContextItems.
 * @path /src/context/helpers/contextSync.unit.test.js
 * @date 23 May 2025
 */

import { ContextSync } from './contextSync.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import Context from '../context.js';

// Mock the dependencies
jest.mock('./contextItem.js');
jest.mock('./contextContainer.js');
jest.mock('../context.js');

describe('ContextSync', () => {
  let mockDate;

  beforeEach(() => {
    mockDate = new Date('2023-01-01T00:00:00.000Z');
    jest.clearAllMocks();
  });

  describe('SYNC_OPERATIONS enum', () => {
    it('should have all expected operation types', () => {
      expect(ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET).toBe('updateSourceToTarget');
      expect(ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE).toBe('updateTargetToSource');
      expect(ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS).toBe('mergeNewerWins');
      expect(ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY).toBe('mergeSourcePriority');
      expect(ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY).toBe('mergeTargetPriority');
      expect(ContextSync.SYNC_OPERATIONS.NO_ACTION).toBe('noAction');
    });
  });

  describe('COMPARISON_RESULTS enum', () => {
    it('should have all expected comparison results', () => {
      expect(ContextSync.COMPARISON_RESULTS.SOURCE_NEWER).toBe('sourceNewer');
      expect(ContextSync.COMPARISON_RESULTS.TARGET_NEWER).toBe('targetNewer');
      expect(ContextSync.COMPARISON_RESULTS.EQUAL).toBe('equal');
      expect(ContextSync.COMPARISON_RESULTS.SOURCE_MISSING).toBe('sourceMissing');
      expect(ContextSync.COMPARISON_RESULTS.TARGET_MISSING).toBe('targetMissing');
      expect(ContextSync.COMPARISON_RESULTS.BOTH_MISSING).toBe('bothMissing');
    });
  });

  describe('compare', () => {
    it('should return BOTH_MISSING when both source and target are null', () => {
      const result = ContextSync.compare(null, null);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.BOTH_MISSING);
      expect(result.sourceTimestamp).toBeNull();
      expect(result.targetTimestamp).toBeNull();
      expect(result.timeDifference).toBe(0);
    });

    it('should return SOURCE_MISSING when source is null', () => {
      const target = { modifiedAt: mockDate };
      const result = ContextSync.compare(null, target);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.SOURCE_MISSING);
      expect(result.sourceTimestamp).toBeNull();
      expect(result.targetTimestamp).toBe(mockDate);
      expect(result.timeDifference).toBeNull();
    });

    it('should return TARGET_MISSING when target is null', () => {
      const source = { modifiedAt: mockDate };
      const result = ContextSync.compare(source, null);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.TARGET_MISSING);
      expect(result.sourceTimestamp).toBe(mockDate);
      expect(result.targetTimestamp).toBeNull();
      expect(result.timeDifference).toBeNull();
    });

    it('should return SOURCE_NEWER when source timestamp is newer', () => {
      const sourceDate = new Date('2023-01-02T00:00:00.000Z');
      const targetDate = new Date('2023-01-01T00:00:00.000Z');
      const source = { modifiedAt: sourceDate };
      const target = { modifiedAt: targetDate };

      const result = ContextSync.compare(source, target);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.SOURCE_NEWER);
      expect(result.sourceTimestamp).toBe(sourceDate);
      expect(result.targetTimestamp).toBe(targetDate);
      expect(result.timeDifference).toBe(24 * 60 * 60 * 1000); // 1 day in ms
    });

    it('should return TARGET_NEWER when target timestamp is newer', () => {
      const sourceDate = new Date('2023-01-01T00:00:00.000Z');
      const targetDate = new Date('2023-01-02T00:00:00.000Z');
      const source = { modifiedAt: sourceDate };
      const target = { modifiedAt: targetDate };

      const result = ContextSync.compare(source, target);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.TARGET_NEWER);
      expect(result.sourceTimestamp).toBe(sourceDate);
      expect(result.targetTimestamp).toBe(targetDate);
      expect(result.timeDifference).toBe(-24 * 60 * 60 * 1000); // -1 day in ms
    });

    it('should return EQUAL when timestamps are equal', () => {
      const source = { modifiedAt: mockDate };
      const target = { modifiedAt: mockDate };

      const result = ContextSync.compare(source, target);

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.EQUAL);
      expect(result.sourceTimestamp).toBe(mockDate);
      expect(result.targetTimestamp).toBe(mockDate);
      expect(result.timeDifference).toBe(0);
    });

    it('should use custom compareBy parameter', () => {
      const createdDate = new Date('2023-01-01T00:00:00.000Z');
      const source = { createdAt: createdDate, modifiedAt: new Date('2023-01-02T00:00:00.000Z') };
      const target = { createdAt: createdDate, modifiedAt: new Date('2023-01-03T00:00:00.000Z') };

      const result = ContextSync.compare(source, target, { compareBy: 'createdAt' });

      expect(result.result).toBe(ContextSync.COMPARISON_RESULTS.EQUAL);
      expect(result.sourceTimestamp).toBe(createdDate);
      expect(result.targetTimestamp).toBe(createdDate);
    });
  });

  describe('sync', () => {
    let mockSource, mockTarget;

    beforeEach(() => {
      mockSource = {
        modifiedAt: mockDate,
        value: 'sourceValue',
        metadata: { source: true },
        setMetadata: jest.fn()
      };
      mockTarget = {
        modifiedAt: mockDate,
        value: 'targetValue',
        metadata: { target: true },
        setMetadata: jest.fn()
      };
      // Ensure ContextSync.autoSync is a spy for deep sync tests
      jest.spyOn(ContextSync, 'autoSync').mockImplementation(() => ({ success: true, changes: [] }));
    });

    afterEach(() => {
      // Restore any spied-on methods
      if (ContextSync.autoSync.mockRestore) {
        ContextSync.autoSync.mockRestore();
      }
    });

    it('should throw error for unknown operation', () => {
      expect(() => {
        ContextSync.sync(mockSource, mockTarget, 'invalidOperation');
      }).toThrow('Unknown synchronization operation: invalidOperation');
    });

    it('should return no action result for NO_ACTION operation', () => {
      const result = ContextSync.sync(
        mockSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.NO_ACTION
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('No synchronization performed');
      expect(result.changes).toEqual([]);
    });

    it('should handle UPDATE_SOURCE_TO_TARGET for ContextItems', () => {
      const mockSourceItem = {
        ...mockSource,
        setMetadata: jest.fn()
      };
      const mockTargetItem = {
        ...mockTarget,
        setMetadata: jest.fn()
      };

      ContextItem.mockImplementation(() => mockSourceItem);
      Object.setPrototypeOf(mockSourceItem, ContextItem.prototype);
      Object.setPrototypeOf(mockTargetItem, ContextItem.prototype);

      const result = ContextSync.sync(
        mockSourceItem,
        mockTargetItem,
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Source updated to match target');
      expect(mockSourceItem.value).toBe('targetValue');
    });

    it('should handle UPDATE_TARGET_TO_SOURCE for ContextItems', () => {
      const mockSourceItem = {
        ...mockSource,
        setMetadata: jest.fn()
      };
      const mockTargetItem = {
        ...mockTarget,
        setMetadata: jest.fn()
      };

      ContextItem.mockImplementation(() => mockSourceItem);
      Object.setPrototypeOf(mockSourceItem, ContextItem.prototype);
      Object.setPrototypeOf(mockTargetItem, ContextItem.prototype);

      const result = ContextSync.sync(
        mockSourceItem,
        mockTargetItem,
        ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Target updated to match source');
      expect(mockTargetItem.value).toBe('sourceValue');
    });

    it('should handle auto sync when operation is "auto"', () => {
      const autoSyncSpy = jest.spyOn(ContextSync, 'autoSync').mockReturnValue({ success: true });

      ContextSync.sync(mockSource, mockTarget, 'auto');

      expect(autoSyncSpy).toHaveBeenCalledWith(
        mockSource,
        mockTarget,
        { deepSync: true, compareBy: 'modifiedAt', preserveMetadata: true }
      );

      autoSyncSpy.mockRestore();
    });

    it('should handle MERGE_NEWER_WINS operation', () => {
      const newerSource = {
        ...mockSource,
        modifiedAt: new Date('2023-01-02T00:00:00.000Z')
      };

      Object.setPrototypeOf(newerSource, ContextItem.prototype);
      Object.setPrototypeOf(mockTarget, ContextItem.prototype);

      const result = ContextSync.sync(
        newerSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Target updated to match source');
    });

    it('should handle MERGE_NEWER_WINS operation when target is newer', () => {
      const newerTarget = {
        ...mockTarget,
        modifiedAt: new Date('2023-01-02T00:00:00.000Z')
      };
      const olderSource = {
        ...mockSource,
        modifiedAt: new Date('2023-01-01T00:00:00.000Z')
      };

      Object.setPrototypeOf(olderSource, ContextItem.prototype);
      Object.setPrototypeOf(newerTarget, ContextItem.prototype);

      const result = ContextSync.sync(
        olderSource,
        newerTarget,
        ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Source updated to match target');
    });

    it('should handle MERGE_NEWER_WINS operation when timestamps are equal', () => {
      const sameDate = new Date('2023-01-01T00:00:00.000Z');
      const sourceWithSameDate = {
        ...mockSource,
        modifiedAt: sameDate
      };
      const targetWithSameDate = {
        ...mockTarget,
        modifiedAt: sameDate
      };

      Object.setPrototypeOf(sourceWithSameDate, ContextItem.prototype);
      Object.setPrototypeOf(targetWithSameDate, ContextItem.prototype);

      const result = ContextSync.sync(
        sourceWithSameDate,
        targetWithSameDate,
        ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Objects are equal, no merge needed');
      expect(result.changes).toEqual([]);
    });

    it('should handle MERGE_SOURCE_PRIORITY operation', () => {
      Object.setPrototypeOf(mockSource, ContextItem.prototype);
      Object.setPrototypeOf(mockTarget, ContextItem.prototype);

      const result = ContextSync.sync(
        mockSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Target updated to match source');
    });

    it('should handle ContextContainer sync with deepSync', () => {
      const mockSourceContainer = {
        ...mockSource,
        keys: jest.fn().mockReturnValue(['key1']),
        getItem: jest.fn().mockReturnValue(mockSource),
        hasItem: jest.fn().mockReturnValue(true),
        setItem: jest.fn()
      };
      const mockTargetContainer = {
        ...mockTarget,
        keys: jest.fn().mockReturnValue(['key1']),
        getItem: jest.fn().mockReturnValue(mockTarget),
        hasItem: jest.fn().mockReturnValue(true),
        setItem: jest.fn()
      };

      Object.setPrototypeOf(mockSourceContainer, ContextContainer.prototype);
      Object.setPrototypeOf(mockTargetContainer, ContextContainer.prototype);

      const result = ContextSync.sync(
        mockSourceContainer,
        mockTargetContainer,
        ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE,
        { deepSync: true }
      );

      expect(result.success).toBe(true);
    });

    describe('ContextContainer deepSync with UPDATE_SOURCE_TO_TARGET (sourceToTarget direction)', () => {
      let sourceContainer, targetContainer;
      let sourceItemA, targetItemA, targetItemB;

      beforeEach(() => {
        sourceItemA = { value: 'sourceA', metadata: { meta: 'sA' }, modifiedAt: mockDate, setMetadata: jest.fn() };
        targetItemA = { value: 'targetA', metadata: { meta: 'tA' }, modifiedAt: mockDate, setMetadata: jest.fn() };
        targetItemB = { value: 'targetB', metadata: { meta: 'tB' }, modifiedAt: mockDate, setMetadata: jest.fn() };

        Object.setPrototypeOf(sourceItemA, ContextItem.prototype);
        Object.setPrototypeOf(targetItemA, ContextItem.prototype);
        Object.setPrototypeOf(targetItemB, ContextItem.prototype);

        sourceContainer = {
          value: { initialSource: true },
          metadata: { sourceContainer: true },
          modifiedAt: mockDate,
          setMetadata: jest.fn(),
          keys: jest.fn().mockReturnValue(['itemA']),
          getItem: jest.fn(key => (key === 'itemA' ? sourceItemA : null)),
          hasItem: jest.fn(key => key === 'itemA'),
          setItem: jest.fn(),
        };
        targetContainer = {
          value: { initialTarget: true },
          metadata: { targetContainer: true },
          modifiedAt: mockDate,
          setMetadata: jest.fn(),
          keys: jest.fn().mockReturnValue(['itemA', 'itemB']),
          getItem: jest.fn(key => (key === 'itemA' ? targetItemA : (key === 'itemB' ? targetItemB : null))),
          hasItem: jest.fn(key => key === 'itemA' || key === 'itemB'),
          setItem: jest.fn(),
        };

        Object.setPrototypeOf(sourceContainer, ContextContainer.prototype);
        Object.setPrototypeOf(targetContainer, ContextContainer.prototype);
      });

      it('should call autoSync for items existing in both source and target', () => {
        ContextSync.sync(
          sourceContainer,
          targetContainer,
          ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
          { deepSync: true, preserveMetadata: true }
        );

        expect(targetContainer.keys).toHaveBeenCalled();
        expect(sourceContainer.hasItem).toHaveBeenCalledWith('itemA');
        expect(ContextSync.autoSync).toHaveBeenCalledWith(sourceItemA, targetItemA, { preserveMetadata: true });
      });

      it('should add items from target to source if not present in source', () => {
        ContextSync.sync(
          sourceContainer,
          targetContainer,
          ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
          { deepSync: true, preserveMetadata: true }
        );

        expect(targetContainer.keys).toHaveBeenCalled();
        expect(sourceContainer.hasItem).toHaveBeenCalledWith('itemB');
        // Since itemB is not in sourceContainer, hasItem('itemB') for sourceContainer would return false
        sourceContainer.hasItem.mockImplementation(key => key === 'itemA'); // Adjust mock for this specific test case logic

        // Re-run sync with adjusted mock for hasItem
        ContextSync.sync(
            sourceContainer,
            targetContainer,
            ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
            { deepSync: true, preserveMetadata: true }
        );

        expect(sourceContainer.setItem).toHaveBeenCalledWith('itemB', targetItemB.value, { metadata: targetItemB.metadata });
      });

      it('should not affect items in source that are not in target', () => {
        // Add an item to sourceContainer that is not in targetContainer
        const sourceItemC = { value: 'sourceC', metadata: { meta: 'sC' } };
        Object.setPrototypeOf(sourceItemC, ContextItem.prototype);
        sourceContainer.keys.mockReturnValue(['itemA', 'itemC']);
        sourceContainer.getItem.mockImplementation(key => {
          if (key === 'itemA') return sourceItemA;
          if (key === 'itemC') return sourceItemC;
          return null;
        });
        sourceContainer.hasItem.mockImplementation(key => key === 'itemA' || key === 'itemC');

        ContextSync.sync(
          sourceContainer,
          targetContainer,
          ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
          { deepSync: true, preserveMetadata: true }
        );
        // We iterate over targetContainer.keys(), so itemC in sourceContainer should not be directly processed for removal or update by this loop.
        // autoSync might be called for itemA, setItem for itemB. No calls related to itemC from this specific loop.
        expect(ContextSync.autoSync).toHaveBeenCalledWith(sourceItemA, targetItemA, { preserveMetadata: true });
        expect(sourceContainer.setItem).toHaveBeenCalledWith('itemB', targetItemB.value, { metadata: targetItemB.metadata });
        // Verify setItem was not called for itemC (or any other unexpected item)
        expect(sourceContainer.setItem).not.toHaveBeenCalledWith('itemC', expect.anything(), expect.anything());
      });

      it('should preserve metadata of the source container itself if preserveMetadata is true', () => {
        // This part is handled by #updateSourceToTarget directly, not #syncContainerItems
        // but it's part of the overall UPDATE_SOURCE_TO_TARGET operation for containers.
        // For deepSync: true, the container's own value/metadata is not directly copied, only items are synced.
        // The test for non-deepSync covers container value/metadata copy.
        // Let's ensure the container's direct metadata isn't touched when deepSync is true.
        sourceContainer.setMetadata.mockClear(); // Clear any calls from setup

        ContextSync.sync(
          sourceContainer,
          targetContainer,
          ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
          { deepSync: true, preserveMetadata: true }
        );
        // In deep sync, the top-level container's metadata/value is NOT directly copied from target.
        // Only items are synced.
        expect(sourceContainer.setMetadata).not.toHaveBeenCalled();
        expect(sourceContainer.value).toEqual({ initialSource: true }); // Should remain unchanged
      });
    });
  });

  describe('autoSync', () => {
    let mockSource, mockTarget;

    beforeEach(() => {
      mockSource = {
        modifiedAt: new Date('2023-01-02T00:00:00.000Z'),
        value: 'sourceValue'
      };
      mockTarget = {
        modifiedAt: new Date('2023-01-01T00:00:00.000Z'),
        value: 'targetValue'
      };
    });

    it('should choose UPDATE_TARGET_TO_SOURCE when source is newer', () => {
      const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

      ContextSync.autoSync(mockSource, mockTarget);

      expect(syncSpy).toHaveBeenCalledWith(
        mockSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE,
        expect.any(Object)
      );

      syncSpy.mockRestore();
    });

    it('should choose UPDATE_SOURCE_TO_TARGET when target is newer', () => {
      mockSource.modifiedAt = new Date('2023-01-01T00:00:00.000Z');
      mockTarget.modifiedAt = new Date('2023-01-02T00:00:00.000Z');

      const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

      ContextSync.autoSync(mockSource, mockTarget);

      expect(syncSpy).toHaveBeenCalledWith(
        mockSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
        expect.any(Object)
      );

      syncSpy.mockRestore();
    });

    it('should choose NO_ACTION when timestamps are equal', () => {
      mockSource.modifiedAt = mockDate;
      mockTarget.modifiedAt = mockDate;

      const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

      ContextSync.autoSync(mockSource, mockTarget);

      expect(syncSpy).toHaveBeenCalledWith(
        mockSource,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.NO_ACTION,
        expect.any(Object)
      );

      syncSpy.mockRestore();
    });

    it('should choose NO_ACTION when source is missing', () => {
      const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

      ContextSync.autoSync(null, mockTarget);

      expect(syncSpy).toHaveBeenCalledWith(
        null,
        mockTarget,
        ContextSync.SYNC_OPERATIONS.NO_ACTION,
        expect.any(Object)
      );

      syncSpy.mockRestore();
    });

    it('should choose UPDATE_TARGET_TO_SOURCE when target is missing', () => {
      const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

      ContextSync.autoSync(mockSource, null);

      expect(syncSpy).toHaveBeenCalledWith(
        mockSource,
        null,
        ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE,
        expect.any(Object)
      );

      syncSpy.mockRestore();
    });
  });

  describe('validateCompatibility', () => {
    it('should return false when source or target is null', () => {
      expect(ContextSync.validateCompatibility(null, {})).toBe(false);
      expect(ContextSync.validateCompatibility({}, null)).toBe(false);
      expect(ContextSync.validateCompatibility(null, null)).toBe(false);
    });

    it('should return true for compatible ContextItems', () => {
      const source = {};
      const target = {};

      Object.setPrototypeOf(source, ContextItem.prototype);
      Object.setPrototypeOf(target, ContextItem.prototype);

      expect(ContextSync.validateCompatibility(source, target)).toBe(true);
    });

    it('should return true for compatible ContextContainers', () => {
      const source = {};
      const target = {};

      Object.setPrototypeOf(source, ContextContainer.prototype);
      Object.setPrototypeOf(target, ContextContainer.prototype);

      expect(ContextSync.validateCompatibility(source, target)).toBe(true);
    });

    it('should return true for compatible Context objects', () => {
      const source = {};
      const target = {};

      Object.setPrototypeOf(source, Context.prototype);
      Object.setPrototypeOf(target, Context.prototype);

      expect(ContextSync.validateCompatibility(source, target)).toBe(true);
    });

    it('should return false for incompatible types', () => {
      const source = {};
      const target = {};

      Object.setPrototypeOf(source, ContextItem.prototype);
      Object.setPrototypeOf(target, ContextContainer.prototype);

      expect(ContextSync.validateCompatibility(source, target)).toBe(false);
    });
  });
});