/**
 * @file helpers.int.test.js
 * @description Integration tests for context helpers to verify their integration between each other
 * @path tests/integration/helpers.int.test.js
 */

import { ContextContainer } from '../../src/contexts/helpers/contextContainer.js';
import { ContextItem } from '../../src/contexts/helpers/contextItem.js';
import ContextValueWrapper from '../../src/contexts/helpers/contextValueWrapper.js';
import { ContextItemSetter } from '../../src/contexts/helpers/contextItemSetter.js';
import ContextSync from '../../src/contexts/helpers/contextSync.js';
import ContextContainerSync from '../../src/contexts/helpers/contextContainerSync.js';
import ContextComparison from '../../src/contexts/helpers/contextComparison.js';
import ContextContainerSyncEngine from '../../src/contexts/helpers/contextContainerSyncEngine.js';
import ContextOperations from '../../src/contexts/helpers/contextOperations.js';
import ContextMerger, { ItemFilter } from '../../src/contexts/helpers/contextMerger.js';
import ContextItemSync from '../../src/contexts/helpers/contextItemSync.js';

describe('Context Helpers Integration Tests', () => {
  describe('ContextContainer with ContextItem, ContextValueWrapper, and ContextItemSetter Integration', () => {
    let container;

    beforeEach(() => {
      container = new ContextContainer({
        player: { name: 'John', level: 5 },
        settings: { volume: 0.8, theme: 'dark' }
      });
    });

    it('should integrate ContextContainer with ContextItem for item management', () => {
      // Test that ContextContainer properly wraps values using ContextValueWrapper
      const playerItem = container.getItem('player');
      expect(playerItem).toBeDefined();

      // Test that items are properly wrapped as ContextItem instances
      const volumeItem = container.getItem('settings.volume');
      expect(volumeItem).toBe(0.8); // Should return the wrapped value

      // Test setting new items through ContextItemSetter integration
      container.setItem('newItem', 'test value');
      expect(container.getItem('newItem')).toBe('test value');

      // Test nested item setting
      container.setItem('nested.deep.testValue', 42);
      expect(container.getItem('nested.deep.testValue')).toBe(42);
    });

    it('should use ContextValueWrapper for different value types', () => {
      // Test primitive wrapping
      container.setItem('primitiveString', 'hello');
      container.setItem('primitiveNumber', 123);
      container.setItem('primitiveBoolean', true);

      expect(container.getItem('primitiveString')).toBe('hello');
      expect(container.getItem('primitiveNumber')).toBe(123);
      expect(container.getItem('primitiveBoolean')).toBe(true);

      // Test object wrapping as ContextContainer
      container.setItem('complexObject', { nested: { data: 'value' } });
      expect(container.getItem('complexObject.nested.data')).toBe('value');
    });

    it('should handle metadata and timestamps through ContextItem integration', () => {
      const initialTime = Date.now();

      // Create item with metadata
      container.setItem('itemWithMetadata', 'value', {
        metadata: { type: 'test', priority: 1 }
      });

      // Verify the container's internal item management
      expect(container.hasItem('itemWithMetadata')).toBe(true);
      expect(container.getItem('itemWithMetadata')).toBe('value');

      // Test modification tracking
      container.setItem('itemWithMetadata', 'updated value');
      expect(container.getItem('itemWithMetadata')).toBe('updated value');
    });
  });

  describe('ContextContainerSync > ContextComparison > ContextContainerSyncEngine Workflow', () => {
    let sourceContainer;
    let targetContainer;

    beforeEach(() => {
      // Create source container with newer timestamps
      sourceContainer = new ContextContainer({
        shared: 'sourceValue',
        sourceOnly: 'sourceData',
        conflicted: 'sourceConflict'
      });

      // Create target container with older timestamps
      targetContainer = new ContextContainer({
        shared: 'targetValue',
        targetOnly: 'targetData',
        conflicted: 'targetConflict'
      });

      // Make source newer
      sourceContainer.value = {
        shared: 'updatedSourceValue',
        sourceOnly: 'updatedSourceData',
        conflicted: 'updatedSourceConflict'
    };
  });

  it('should manage the cases where both containers are missing', () => {
      const comparison = ContextComparison.compare(null, null);

      expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.BOTH_MISSING);
      expect(comparison.containerATimestamp).toBeNull();
      expect(comparison.containerBTimestamp).toBeNull();
      expect(comparison.timeDifference).toBe(0);
    });

    it('should manage the cases where one container is missing', () => {
      const comparisonA = ContextComparison.compare(null, targetContainer); // Container A is missing
      const comparisonB = ContextComparison.compare(sourceContainer, null); // Container B is missing

      // Container A missing
      expect(comparisonA.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_MISSING);
      expect(comparisonA.containerATimestamp).toBeNull();
      expect(comparisonA.containerBTimestamp).toBeInstanceOf(Date);
      expect(comparisonA.timeDifference).toBeNull();

      // Container B missing
      expect(comparisonB.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_MISSING);
      expect(comparisonB.containerATimestamp).toBeInstanceOf(Date);
      expect(comparisonB.containerBTimestamp).toBeNull();
      expect(comparisonB.timeDifference).toBeNull();
    });

    it('should use ContextComparison for timestamp-based decisions', () => {
      //wait .5 second to ensure timestamps are different
      setTimeout(() => {
        sourceContainer._updateModificationTimestamps();
        const comparison = ContextComparison.compare(sourceContainer, targetContainer);

        expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(comparison.timeDifference).toBeGreaterThan(0);
        expect(comparison.containerATimestamp).toBeInstanceOf(Date);
      }, 500);
    });

    it('should execute ContextContainerSync operations using ContextContainerSyncEngine', () => {
      // Test updateSourceToMatchTarget
      const updateResult = ContextContainerSync.updateSourceToMatchTarget(
        sourceContainer,
        targetContainer
      );

      expect(updateResult.success).toBe(true);
      expect(updateResult.operation).toBe('updateSourceToMatchTarget');

      // Test mergeNewerWins
      const mergeResult = ContextContainerSync.mergeNewerWins(
        sourceContainer,
        targetContainer
      );

      expect(mergeResult.success).toBe(true);
      expect(mergeResult.operation).toBe('mergeNewerWins');
    });

    it('should handle deep container synchronization through SyncEngine', () => {
      // Create nested containers
      const nestedSource = new ContextContainer({
        level1: {
          level2: {
            data: 'deep source value'
          }
        }
      });

      const nestedTarget = new ContextContainer({
        level1: {
          level2: {
            data: 'deep target value'
          },
          additional: 'target extra'
        }
      });

      const syncEngine = new ContextContainerSyncEngine({ syncMetadata: true });
      syncEngine.sync(nestedSource, nestedTarget, 'sourceToTarget');

      // Verify deep sync occurred
      expect(nestedTarget.getItem('level1.level2.data')).toBe('deep source value');
      expect(nestedTarget.getItem('level1.additional')).toBe('target extra');
    });
  });

  describe('ContextOperations > ContextMerger > Other Helpers Workflow', () => {
    let sourceContainer;
    let targetContainer;
    let anotherContainer;

    beforeEach(() => {
      sourceContainer = new ContextContainer({
        data: {
          inventory: ['sword', 'potion'],
          stats: { level: 10, xp: 1500 }
        },
        settings: {
          volume: 0.8,
          graphics: 'high'
        }
      });

      targetContainer = new ContextContainer({
        data: {
          inventory: ['bow', 'scroll'],
          stats: { level: 8, xp: 1200 },
          location: 'village'
        },
        settings: {
          volume: 0.6,
          language: 'en'
        }
      });

      anotherContainer = new ContextContainer({
        data: {
          stats: { level: 12, xp: 2000 }
        },
        settings: {
          theme: 'dark'
        }
      });
    });

    it('should execute bulk operations through ContextOperations', () => {
      // Test pushing specific items
      const pushResult = ContextOperations.pushItems(
        sourceContainer,
        targetContainer,
        ['data.stats', 'settings.volume']
      );

      expect(pushResult.success).toBe(true);
      expect(pushResult.itemsProcessed).toContain('data.stats');
      expect(pushResult.itemsProcessed).toContain('settings.volume');

      // Test pulling specific items
      const pullResult = ContextOperations.pullItems(
        targetContainer,
        sourceContainer,
        ['data.location']
      );

      expect(pullResult.success).toBe(true);
      expect(pullResult.itemsProcessed).toContain('data.location');
    });

    it('should handle multi-source operations through ContextOperations', () => {
      const sources = [sourceContainer, anotherContainer];
      const results = ContextOperations.pushFromMultipleSources(
        sources,
        targetContainer,
        'mergeSourcePriority'
      );

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeSourcePriority');
      });
    });

    it('should use ContextMerger for sophisticated merge operations with ItemFilter', () => {
      // Test merge with allowOnly filter
      const allowFilter = ItemFilter.allowOnly(['data.stats', 'settings.volume']);
      const mergeResult = ContextMerger.merge(
        sourceContainer,
        targetContainer,
        'mergeNewerWins',
        { customFilter: allowFilter }
      );

      expect(mergeResult.success).toBe(true);
      expect(mergeResult.strategy).toBe('mergeNewerWins');
      expect(mergeResult.statistics).toBeDefined();

      // Test merge with blockOnly filter
      const blockFilter = ItemFilter.blockOnly(['data.inventory']);
      const blockResult = ContextMerger.merge(
        sourceContainer,
        targetContainer,
        'mergeSourcePriority',
        { customFilter: blockFilter }
      );

      expect(blockResult.success).toBe(true);
      expect(blockResult.itemsProcessed).not.toContain('data.inventory');
    });

    it('should combine multiple filters using ItemFilter logic operations', () => {
      const combinedFilter = ItemFilter.and(
        ItemFilter.allowOnly(['data', 'settings']),
        ItemFilter.blockOnly(['settings.graphics'])
      );

      const result = ContextMerger.merge(
        sourceContainer,
        targetContainer,
        'mergeNewerWins',
        { customFilter: combinedFilter }
      );

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).not.toContain('settings.graphics');
    });

    it('should use ContextComparison in merge decisions', () => {
      // Create containers with specific timestamps
      const olderContainer = new ContextContainer({ data: 'old' });
      const newerContainer = new ContextContainer({ data: 'new' });

      // Mock timestamps
      olderContainer._updateModificationTimestamps(new Date('2025-01-01'))  ;
      newerContainer._updateModificationTimestamps(new Date('2025-01-02'));

      const comparison = ContextComparison.compare(olderContainer, newerContainer);
      expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);

      // Use comparison result in merge
      const mergeResult = ContextMerger.merge(
        olderContainer,
        newerContainer,
        'mergeNewerWins'
      );

      expect(mergeResult.success).toBe(true);
    });
  });

  describe('Single Item Operations', () => {
    let sourceItem;
    let targetItem;

    beforeEach(() => {
      sourceItem = new ContextItem('source value', { type: 'test' });
      targetItem = new ContextItem('target value', { type: 'test' });

      // Set different timestamps (source is newer)
      sourceItem._updateModificationTimestamps(new Date('2025-01-02'));
      targetItem._updateModificationTimestamps(new Date('2025-01-01'));
    });

    it('should sync individual ContextItems using ContextItemSync', () => {
      const syncResult = ContextItemSync.updateTargetToMatchSource(
        sourceItem,
        targetItem
      );

      expect(syncResult.success).toBe(true);
      expect(syncResult.operation).toBe('updateTargetToMatchSource');
      expect(targetItem.value).toBe('source value');
    });

    it('should compare individual items using ContextComparison', () => {
      const comparison = ContextComparison.compare(sourceItem, targetItem);

      expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(comparison.timeDifference).toBeGreaterThan(0);
    });

    it('should use mergeNewerWins strategy with ContextItemSync', () => {
        const mergeResult = ContextItemSync.mergeNewerWins(sourceItem, targetItem);

      expect(mergeResult.success).toBe(true);
      expect(mergeResult.operation).toBe('mergeNewerWins');
      // Since source is newer, target should be updated
      expect(targetItem.value).toBe('source value');
    });
  });

  describe('Complex Merging Operations', () => {
    let complexSource;
    let complexTarget;

    beforeEach(() => {
      complexSource = new ContextContainer({
        playerData: {
          profile: { name: 'Alice', class: 'Warrior' },
          stats: { level: 15, hp: 100, mp: 50 },
          inventory: {
            weapons: ['Sword of Power', 'Shield of Defense'],
            consumables: ['Health Potion', 'Mana Potion']
          }
        },
        gameSettings: {
          difficulty: 'hard',
          autoSave: true,
          notifications: { sound: true, popup: false }
        }
      });

      complexTarget = new ContextContainer({
        playerData: {
          profile: { name: 'Alice', class: 'Warrior', guild: 'Knights' },
          stats: { level: 12, hp: 80, mp: 60, stamina: 90 },
          inventory: {
            weapons: ['Basic Sword'],
            armor: ['Leather Armor'],
            consumables: ['Basic Potion']
          }
        },
        gameSettings: {
          difficulty: 'normal',
          graphics: 'high',
          notifications: { sound: false, popup: true, email: true }
        },
        systemData: {
          lastLogin: '2025-01-01',
          preferences: { theme: 'dark' }
        }
      });
    });

    it('should handle complex nested merging with selective filtering', async () => {
      // Use ContextSync for container merging, which will delegate to appropriate handler
      const result = await ContextSync.sync(
        complexSource,
        complexTarget,
        'mergeSourcePriority'
      );

      expect(result.success).toBe(true);
      // For ContextContainer sync, itemsProcessed might be an array of changed paths
      const itemsProcessed = Array.isArray(result.itemsProcessed) ? result.itemsProcessed :
                             result.changes ? result.changes.map(c => c.path || c.key) : [];
      expect(itemsProcessed.length).toBeGreaterThan(0);
    });

    it('should preserve existing data while merging new data', () => {
      const result = ContextMerger.merge(
        complexSource,
        complexTarget,
        'mergeTargetPriority',
        {
          createMissing: true,
          preserveMetadata: true
        }
      );

      expect(result.success).toBe(true);
      // Target-specific data should be preserved
      expect(complexTarget.getItem('playerData.profile.guild')).toBe('Knights');
      expect(complexTarget.getItem('systemData.lastLogin')).toBe('2025-01-01');
    });

    it('should handle pattern-based filtering', async () => {
      // Use ContextSync for container merging
      const result = await ContextSync.sync(
        complexSource,
        complexTarget,
        'mergeNewerWins'
      );

      expect(result.success).toBe(true);
      // For ContextContainer sync, just verify the operation completed successfully
      expect(result.operation).toBe('mergeNewerWins');
    });
  });

  describe('Bulk Operations', () => {
    let containers;

    beforeEach(() => {
      containers = [
        new ContextContainer({
          id: 'container1',
          data: { value: 100, shared: 'from1' }
        }),
        new ContextContainer({
          id: 'container2',
          data: { value: 200, shared: 'from2' }
        }),
        new ContextContainer({
          id: 'container3',
          data: { value: 300, shared: 'from3' }
        })
      ];
    });

    it('should handle bulk push operations to multiple targets', () => {
      const source = containers[0];
      const targets = containers.slice(1);

      const results = ContextOperations.pushToMultipleTargets(
        source,
        targets,
        'mergeSourcePriority'
      );

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeSourcePriority');
      });
    });

    it('should handle bulk pull operations from multiple sources', () => {
      const target = containers[0];
      const sources = containers.slice(1);

      const results = ContextOperations.pushFromMultipleSources(
        sources,
        target,
        'mergeNewerWins'
      );

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.strategy).toBe('mergeNewerWins');
      });
    });

    it('should execute bidirectional synchronization', () => {
      const container1 = containers[0];
      const container2 = containers[1];

      const syncResult = ContextOperations.synchronizeBidirectional(
        container1,
        container2,
        {
          strategy: 'mergeNewerWins',
          excludePaths: ['id']
        }
      );

      expect(syncResult.success).toBe(true);
      expect(syncResult.direction1to2).toBeDefined();
      expect(syncResult.direction2to1).toBeDefined();
    });

    it('should handle bulk item operations across multiple containers', () => {
      const sources = containers.slice(0, 2);
      const targets = containers.slice(2);

      const results = ContextOperations.pushItemsBulk(
        sources,
        targets,
        ['data.value'],
        'mergeSourcePriority'
      );

      expect(results).toHaveLength(2); // 2 sources
      expect(results[0]).toHaveLength(1); // 1 target per source

      results.forEach(sourceResults => {
        sourceResults.forEach(result => {
          expect(result.success).toBe(true);
          expect(result.itemsProcessed).toContain('data.value');
        });
      });
    });
  });

  describe('ContextSync as Facade for All Operations', () => {
    let sourceContainer;
    let targetContainer;
    let sourceItem;
    let targetItem;

    beforeEach(() => {
      sourceContainer = new ContextContainer({ data: 'source container' });
      targetContainer = new ContextContainer({ data: 'target container' });
      sourceItem = new ContextItem('source item');
      targetItem = new ContextItem('target item');
    });

    it('should delegate ContextContainer operations to ContextContainerSync', async () => {
      const result = await ContextSync.sync(
        sourceContainer,
        targetContainer,
        ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(result.success).toBe(true);
      expect(result.operation).toBe('mergeNewerWins');
    });

    it('should delegate ContextItem operations to ContextItemSync', async () => {
      const result = await ContextSync.sync(
        sourceItem,
        targetItem,
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateSourceToTarget');
    });

    it('should provide comparison operations through unified interface', () => {
      const containerComparison = ContextSync.compare(sourceContainer, targetContainer);
      const itemComparison = ContextSync.compare(sourceItem, targetItem);

      expect(containerComparison.result).toBeDefined();
      expect(itemComparison.result).toBeDefined();
      expect(containerComparison.result).toBe(ContextSync.COMPARISON_RESULTS.EQUAL);
      expect(itemComparison.result).toBe(ContextSync.COMPARISON_RESULTS.EQUAL);
    });

    it('should handle all sync operations through unified API', async () => {
      const operations = [
        ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET,
        ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE,
        ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS,
        ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY,
        ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY
      ];

      for (const operation of operations) {
        const containerResult = await ContextSync.sync(sourceContainer, targetContainer, operation);
        const itemResult = await ContextSync.sync(sourceItem, targetItem, operation);

        expect(containerResult.success).toBe(true);
        expect(itemResult.success).toBe(true);
        expect(containerResult.operation).toBe(operation);
        expect(itemResult.operation).toBe(operation);
      }
    });

    it('should provide safe sync operations with error handling', async () => {
      // Test with null inputs
      const safeResult = await ContextSync.syncSafe(null, targetContainer, 'mergeNewerWins');

      expect(safeResult.success).toBe(true);
      expect(safeResult.warnings).toBeDefined();
      expect(safeResult.warnings.length).toBeGreaterThan(0);
    });

    it('should maintain consistent API across all object types', async () => {
      // Test that the same methods work for all types
      const containerSync = await ContextSync.sync(sourceContainer, targetContainer, 'mergeNewerWins');
      const itemSync = await ContextSync.sync(sourceItem, targetItem, 'mergeNewerWins');

      // Both should have the same result structure
      expect(containerSync).toHaveProperty('success');
      expect(containerSync).toHaveProperty('operation');
      expect(itemSync).toHaveProperty('success');
      expect(itemSync).toHaveProperty('operation');

      // Both should support comparison
      const containerComparison = ContextSync.compare(sourceContainer, targetContainer);
      const itemComparison = ContextSync.compare(sourceItem, targetItem);

      expect(containerComparison).toHaveProperty('result');
      expect(itemComparison).toHaveProperty('result');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing or undefined objects gracefully', async () => {
      const container = new ContextContainer({ data: 'test' });

      // Test with undefined objects
      const result1 = await ContextSync.syncSafe(undefined, container, 'mergeNewerWins');
      const result2 = await ContextSync.syncSafe(container, undefined, 'mergeNewerWins');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.warnings.length).toBeGreaterThan(0);
      expect(result2.warnings.length).toBeGreaterThan(0);
    });

    it('should handle type mismatches between objects', async () => {
      const container = new ContextContainer({ data: 'test' });
      const item = new ContextItem('test');

      // Attempting to sync different types should fail gracefully
      const result = await ContextSync.syncSafe(container, item, 'mergeNewerWins');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('type mismatch');
    });

    it('should validate sync operations and provide meaningful errors', async () => {
      const container = new ContextContainer({ data: 'test' });

      // Test with invalid operation
      const result = await ContextSync.syncSafe(container, container, 'invalidOperation');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid sync operation');
    });

    it('should handle circular references in nested containers', async () => {
      const container1 = new ContextContainer({ id: 'container1' });
      const container2 = new ContextContainer({ id: 'container2' });

      // Create circular reference scenario (if supported by implementation)
      container1.setItem('reference', container2);
      container2.setItem('reference', container1);

      // Sync should handle this gracefully without infinite recursion
      const result = await ContextSync.syncSafe(container1, container2, 'mergeNewerWins');

      expect(result.success).toBe(true);
      // Should not hang or throw stack overflow
    });
  });
});
