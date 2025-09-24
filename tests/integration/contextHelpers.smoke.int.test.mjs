/**
 * @file contextHelpers.smoke.int.test.js
 * @description Simplified integration tests for context helpers to verify their integration between each other
 * @path tests/integration/contextHelpers.smoke.int.test.js
 */

import { ContextContainer } from '../../src/contexts/helpers/contextContainer.mjs';
import { ContextItem } from '../../src/contexts/helpers/contextItem.mjs';
import ContextComparison from '../../src/contexts/helpers/contextComparison.mjs';
import ContextContainerSync from '../../src/contexts/helpers/contextContainerSync.mjs';
import ContextItemSync from '../../src/contexts/helpers/contextItemSync.mjs';
import ContextSync from '../../src/contexts/helpers/contextSync.mjs';
import Validator from '@/utils/static/validator.mjs';

jest.mock('../../src/helpers/pathUtils.mjs', () => ({
  extractKeyComponents: jest.fn((key) => {
    const parts = key.split('.');
    return {
      firstKey: parts[0],
      remainingPath: parts.slice(1).join('.')
    };
  })
}));

describe('Context Helpers Integration Tests (Simplified)', () => {
  describe('Basic ContextContainer and ContextItem Integration', () => {
    let container;
    let item;

    beforeEach(() => {
      container = new ContextContainer({
        player: { name: 'John', level: 5 },
        settings: { volume: 0.8, theme: 'dark' }
      });

      item = new ContextItem('test value', { type: 'test' });
    });

    it('should create ContextContainer and ContextItem instances', () => {
      expect(container).toBeInstanceOf(ContextContainer);
      expect(item).toBeInstanceOf(ContextItem);
      expect(item.value).toBe('test value');
    });

    it('should access container items', () => {
      // Test basic item access
      expect(container.getItem('player')).toBeDefined();
      expect(container.getItem('settings')).toBeDefined();
    });
  });

  describe('ContextComparison Integration', () => {
    let item1;
    let item2;

    beforeEach(() => {
      item1 = new ContextItem('value1');
      item2 = new ContextItem('value2');

      // Set different modification times
      item1._updateModificationTimestamps('2025-01-02');
      item2._updateModificationTimestamps('2025-01-01');
    });

    it('should compare ContextItem timestamps correctly', () => {
      const comparison = ContextComparison.compare(item1, item2);

      expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(comparison.timeDifference).toBeGreaterThan(0);
    });
  });

  describe('ContextItemSync Integration', () => {
    let sourceItem;
    let targetItem;

    beforeEach(() => {
      sourceItem = new ContextItem('source value', { type: 'test' });
      targetItem = new ContextItem('target value', { type: 'test' });
    });

    it('should sync items using ContextItemSync', () => {
      const result = ContextItemSync.updateTargetToMatchSource(sourceItem, targetItem);

      expect(result.success).toBe(true);
      expect(targetItem.value).toBe('source value');
    });

    it('should merge items with newer wins strategy', () => {
      // Set source as newer
      sourceItem._updateModificationTimestamps('2025-01-02');
      targetItem._updateModificationTimestamps('2025-01-01');

      const result = ContextItemSync.mergeNewerWins(sourceItem, targetItem);

      expect(result.success).toBe(true);
      expect(targetItem.value).toBe('source value');
    });
  });

  describe('ContextContainerSync Integration', () => {
    let sourceContainer;
    let targetContainer;

    beforeEach(() => {
      sourceContainer = new ContextContainer({
        data: 'source data',
        shared: 'source shared'
      });

      targetContainer = new ContextContainer({
        data: 'target data',
        shared: 'target shared'
      });
    });

    it('should sync containers using ContextContainerSync', () => {
      const result = ContextContainerSync.updateTargetToMatchSource(
        sourceContainer,
        targetContainer
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Target container updated to match source');
    });

    it('should merge containers with newer wins', () => {
      // Mock newer timestamp for source
      sourceContainer._updateModificationTimestamps('2025-01-02');
      targetContainer._updateModificationTimestamps('2025-01-01');

      const result = ContextContainerSync.mergeNewerWins(
        sourceContainer,
        targetContainer
      );

      expect(result.success).toBe(true);
    });
  });

  describe('ContextSync as Facade', () => {
    let sourceItem;
    let targetItem;
    let sourceContainer;
    let targetContainer;

    beforeEach(() => {
      sourceItem = new ContextItem('source item');
      targetItem = new ContextItem('target item');
      sourceContainer = new ContextContainer({ data: 'source container' });
      targetContainer = new ContextContainer({ data: 'target container' });
    });

    it('should delegate ContextItem operations to ContextItemSync', async () => {
      const result = await ContextSync.sync(
        sourceItem,
        targetItem,
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(result.success).toBe(true);
      expect(targetItem.value).toBe('source item');
    });

    it('should delegate ContextContainer operations to ContextContainerSync', async () => {
      const result = await ContextSync.sync(
        sourceContainer,
        targetContainer,
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(result.success).toBe(true);
    });

    it('should provide comparison through unified interface', () => {
      const itemComparison = ContextSync.compare(sourceItem, targetItem);
      const containerComparison = ContextSync.compare(sourceContainer, targetContainer);

      expect(itemComparison.result).toBeDefined();
      expect(containerComparison.result).toBeDefined();
    });

    it('should validate compatibility between objects', () => {
      expect(ContextSync.validateCompatibility(sourceItem, targetItem)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceContainer, targetContainer)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceItem, targetContainer)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid sync operations gracefully', async () => {
      const item1 = new ContextItem('test');
      const item2 = new ContextItem('test');

      // Test with invalid operation
      await expect(ContextSync.sync(item1, item2, 'invalidOperation')).rejects.toThrow();
    });

    it('should handle null/undefined inputs', () => {
      expect(ContextSync.validateCompatibility(null, null)).toBe(false);
      expect(ContextSync.validateCompatibility(undefined, undefined)).toBe(false);
    });
  });
});
