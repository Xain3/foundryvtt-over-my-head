/**
 * @file contextHelpers.unit.test.js
 * @description Unit tests for the ContextHelpers class.
 * @path src/contexts/helpers/contextHelpers.unit.test.js
 */

import ContextHelpers from './contextHelpers.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import ContextSync from './contextSync.js';
import ContextMerger from './contextMerger.js';

describe('ContextHelpers', () => {
  describe('Class Exports', () => {
    it('should export all core data management classes', () => {
      expect(ContextHelpers.Item).toBe(ContextItem);
      expect(ContextHelpers.Container).toBe(ContextContainer);
      expect(ContextHelpers.ValueWrapper).toBeDefined();
      expect(ContextHelpers.ItemSetter).toBeDefined();
    });

    it('should export all synchronization classes', () => {
  expect(ContextHelpers.Sync).toBe(ContextSync);
  expect(ContextHelpers.ItemSync).toBeDefined();
  expect(ContextHelpers.ContainerSync).toBeDefined();
  expect(ContextHelpers.ContainerSyncEngine).toBeDefined();
  expect(ContextHelpers.AutoSync).toBeDefined();
  expect(ContextHelpers.LegacySync).toBeDefined();
    });

    it('should export all merging and operations classes', () => {
  expect(ContextHelpers.Merger).toBe(ContextMerger);
  expect(ContextHelpers.Operations).toBeDefined();
  expect(ContextHelpers.Filter).toBeDefined();
    });

    it('should export all utility classes', () => {
  expect(ContextHelpers.Comparison).toBeDefined();
  expect(ContextHelpers.Validator).toBeDefined();
    });
  });

  describe('Convenience Methods', () => {
    let sourceItem, targetItem;

    beforeEach(() => {
      sourceItem = new ContextItem('source value', { type: 'test' });
      targetItem = new ContextItem('target value', { type: 'test' });
    });

    describe('sync()', () => {
      it('should delegate to ContextSync.sync', () => {
        const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });

        const result = ContextHelpers.sync(sourceItem, targetItem, 'mergeNewerWins');

        expect(syncSpy).toHaveBeenCalledWith(sourceItem, targetItem, 'mergeNewerWins', {});
        expect(result).toEqual({ success: true });

        syncSpy.mockRestore();
      });

      it('should pass options to ContextSync.sync', () => {
        const syncSpy = jest.spyOn(ContextSync, 'sync').mockReturnValue({ success: true });
        const options = { preserveMetadata: true };

        ContextHelpers.sync(sourceItem, targetItem, 'mergeSourcePriority', options);

        expect(syncSpy).toHaveBeenCalledWith(sourceItem, targetItem, 'mergeSourcePriority', options);

        syncSpy.mockRestore();
      });
    });

    describe('syncSafe()', () => {
      it('should delegate to ContextSync.syncSafe', () => {
        const syncSafeSpy = jest.spyOn(ContextSync, 'syncSafe').mockReturnValue({ success: true });

        const result = ContextHelpers.syncSafe(sourceItem, targetItem, 'mergeNewerWins');

        expect(syncSafeSpy).toHaveBeenCalledWith(sourceItem, targetItem, 'mergeNewerWins', {});
        expect(result).toEqual({ success: true });

        syncSafeSpy.mockRestore();
      });
    });

    describe('autoSync()', () => {
      it('should delegate to ContextSync.autoSync', () => {
        const autoSyncSpy = jest.spyOn(ContextSync, 'autoSync').mockReturnValue({ success: true });

        const result = ContextHelpers.autoSync(sourceItem, targetItem);

        expect(autoSyncSpy).toHaveBeenCalledWith(sourceItem, targetItem, {});
        expect(result).toEqual({ success: true });

        autoSyncSpy.mockRestore();
      });
    });

    describe('compare()', () => {
      it('should delegate to ContextComparison.compare', () => {
        const compareSpy = jest.spyOn(ContextHelpers.Comparison, 'compare')
          .mockReturnValue({ result: 'equal' });

        const result = ContextHelpers.compare(sourceItem, targetItem);

        expect(compareSpy).toHaveBeenCalledWith(sourceItem, targetItem, {});
        expect(result).toEqual({ result: 'equal' });

        compareSpy.mockRestore();
      });
    });

  describe('wrap()', () => {
      it('should delegate to ContextValueWrapper.wrap', () => {
        const wrapSpy = jest.spyOn(ContextHelpers.ValueWrapper, 'wrap')
          .mockReturnValue(new ContextItem('wrapped'));

        const result = ContextHelpers.wrap('test value');

        expect(wrapSpy).toHaveBeenCalledWith('test value', {});
        expect(result).toBeInstanceOf(ContextItem);

        wrapSpy.mockRestore();
      });
    });
  });

  describe('Context Creation Convenience', () => {
  describe('Item creation', () => {
      it('should create ContextItem instances through the helper', () => {
        const item = new ContextHelpers.Item('test value', { type: 'test' });

        expect(item).toBeInstanceOf(ContextItem);
        expect(item.value).toBe('test value');
        expect(item.metadata).toEqual({ type: 'test' });
      });
    });

  describe('Container creation', () => {
      it('should create ContextContainer instances through the helper', () => {
        const container = new ContextHelpers.Container({ test: 'value' });

        expect(container).toBeInstanceOf(ContextContainer);
        expect(container.getItem('test')).toBe('value');
      });
    });
  });

  describe('Constants and Enums', () => {
    it('should expose SYNC_OPERATIONS from Sync', () => {
      expect(ContextHelpers.SYNC_OPERATIONS).toBeDefined();
      expect(ContextHelpers.SYNC_OPERATIONS).toBe(ContextHelpers.Sync.SYNC_OPERATIONS);
    });

    it('should expose COMPARISON_RESULTS from Comparison', () => {
      expect(ContextHelpers.COMPARISON_RESULTS).toBeDefined();
      expect(ContextHelpers.COMPARISON_RESULTS).toBe(ContextHelpers.Comparison.COMPARISON_RESULTS);
    });

    it('should expose MERGE_STRATEGIES from Merger', () => {
      expect(ContextHelpers.MERGE_STRATEGIES).toBeDefined();
      expect(ContextHelpers.MERGE_STRATEGIES).toBe(ContextHelpers.Merger.MERGE_STRATEGIES);
    });
  });

  describe('Integration', () => {
    it('should provide seamless access to all helper functionality', () => {
      // Create instances using the helper
      const item1 = new ContextHelpers.Item('value1');
      const item2 = new ContextHelpers.Item('value2');

      // Use comparison
      const comparison = ContextHelpers.compare(item1, item2);
      expect(comparison).toBeDefined();

      // Use synchronization
      const syncResult = ContextHelpers.sync(item1, item2, ContextHelpers.SYNC_OPERATIONS.MERGE_NEWER_WINS);
      expect(syncResult).toBeDefined();

      // Use wrapping
      const wrapped = ContextHelpers.wrap('test');
      expect(wrapped).toBeDefined();
    });

    it('should maintain consistency with direct class usage', () => {
      // Create using helper
      const helperItem = new ContextHelpers.Item('test');
      // Create using direct import
      const directItem = new ContextItem('test');

      // Should be instances of the same class
      expect(helperItem.constructor).toBe(directItem.constructor);
      expect(helperItem).toBeInstanceOf(ContextItem);
      expect(directItem).toBeInstanceOf(ContextHelpers.Item);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in convenience methods gracefully when using syncSafe', async () => {
      // Test with invalid parameters using syncSafe - should not throw and return a result
      const result = await ContextHelpers.syncSafe(null, null, 'invalidOperation');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Both source and target are null/undefined');
    });
  });
});
