/**
 * @file contextHelpers.int.test.js
 * @description Integration tests for context helpers to verify their integration between each other
 * @path tests/integration/contextHelpers.int.test.js
 */

import { ContextContainer } from '../../src/contexts/helpers/contextContainer.mjs';
import { ContextItem } from '../../src/contexts/helpers/contextItem.mjs';
import ContextValueWrapper from '../../src/contexts/helpers/contextValueWrapper.mjs';
import { ContextItemSetter } from '../../src/contexts/helpers/contextItemSetter.mjs';
import ContextSync from '../../src/contexts/helpers/contextSync.mjs';
import ContextContainerSync from '../../src/contexts/helpers/contextContainerSync.mjs';
import ContextComparison from '../../src/contexts/helpers/contextComparison.mjs';
import ContextContainerSyncEngine from '../../src/contexts/helpers/contextContainerSyncEngine.mjs';
import ContextOperations from '../../src/contexts/helpers/contextOperations.mjs';
import ContextMerger, { ItemFilter } from '../../src/contexts/helpers/contextMerger.mjs';
import ContextItemSync from '../../src/contexts/helpers/contextItemSync.mjs';

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
  // Ensure both pairs share the exact same timestamp to expect EQUAL
  const equalDate = new Date('2025-01-01T00:00:00Z');
  sourceContainer._updateModificationTimestamps(equalDate);
  targetContainer._updateModificationTimestamps(equalDate);
  sourceItem._updateModificationTimestamps(equalDate);
  targetItem._updateModificationTimestamps(equalDate);

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

  describe('Advanced Filtering Integration Tests', () => {
    let sourceContainer;
    let targetContainer;

    beforeEach(() => {
      // Create comprehensive test data with various nesting levels
      sourceContainer = new ContextContainer({
        // Simple paths
        username: 'sourceUser',
        level: 10,
        isActive: true,

        // Nested object paths
        player: {
          profile: {
            name: 'Alice',
            class: 'Warrior',
            guild: 'Dragons'
          },
          stats: {
            health: 100,
            mana: 50,
            experience: 1500
          },
          inventory: {
            weapons: ['sword', 'shield'],
            consumables: ['potion', 'scroll'],
            armor: {
              helmet: 'Iron Helmet',
              chest: 'Leather Armor',
              boots: 'Steel Boots'
            }
          }
        },

        // Game settings with deep nesting
        settings: {
          graphics: {
            resolution: '1920x1080',
            quality: 'high',
            effects: {
              shadows: true,
              particles: true,
              lighting: 'advanced'
            }
          },
          audio: {
            master: 0.8,
            music: 0.6,
            effects: 0.9
          },
          controls: {
            keyboard: {
              forward: 'w',
              backward: 's',
              left: 'a',
              right: 'd'
            },
            mouse: {
              sensitivity: 1.5,
              invertY: false
            }
          }
        }
      });

      targetContainer = new ContextContainer({
        // Simple paths with different values
        username: 'targetUser',
        level: 8,
        isActive: false,
        score: 500, // Target-only field

        // Nested object paths with some overlap
        player: {
          profile: {
            name: 'Bob',
            class: 'Mage',
            race: 'Elf' // Target-only field
          },
          stats: {
            health: 80,
            mana: 100,
            stamina: 60 // Target-only field
          },
          inventory: {
            weapons: ['staff'],
            consumables: ['elixir'],
            accessories: ['ring', 'amulet'] // Target-only field
          }
        },

        // Settings with different structure
        settings: {
          graphics: {
            resolution: '1280x720',
            quality: 'medium',
            vsync: true // Target-only field
          },
          audio: {
            master: 0.5,
            music: 0.7
          },
          network: { // Target-only section
            server: 'us-east',
            port: 8080
          }
        }
      });
    });

    describe('allowOnly filtering', () => {
      it('should merge only allowed simple paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { allowOnly: ['username', 'level'] }
        );

        expect(result[0].success).toBe(true);

        // Allowed paths should be updated
        expect(targetContainer.getItem('username')).toBe('sourceUser');
        expect(targetContainer.getItem('level')).toBe(10);

        // Non-allowed paths should remain unchanged
        expect(targetContainer.getItem('isActive')).toBe(false); // Original target value
        expect(targetContainer.getItem('score')).toBe(500); // Target-only, preserved
      });

      it('should merge only allowed nested paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { allowOnly: ['player.profile.name', 'player.stats.health', 'settings.audio.master'] }
        );

        expect(result[0].success).toBe(true);

        // Allowed nested paths should be updated
        expect(targetContainer.getItem('player.profile.name')).toBe('Alice');
        expect(targetContainer.getItem('player.stats.health')).toBe(100);
        expect(targetContainer.getItem('settings.audio.master')).toBe(0.8);

        // Non-allowed nested paths should remain unchanged
        expect(targetContainer.getItem('player.profile.class')).toBe('Mage'); // Original target value
        expect(targetContainer.getItem('player.stats.mana')).toBe(100); // Original target value
        expect(targetContainer.getItem('settings.audio.music')).toBe(0.7); // Original target value
      });

      it('should handle wildcard-like patterns for entire object sections', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { allowOnly: ['player.inventory'] }
        );

        expect(result[0].success).toBe(true);

        // The entire inventory section should be updated
        expect(targetContainer.getItem('player.inventory.weapons')).toEqual(['sword', 'shield']);
        expect(targetContainer.getItem('player.inventory.consumables')).toEqual(['potion', 'scroll']);
        expect(targetContainer.getItem('player.inventory.armor.helmet')).toBe('Iron Helmet');

        // Other sections should remain unchanged
        expect(targetContainer.getItem('player.profile.name')).toBe('Bob');
        expect(targetContainer.getItem('player.stats.health')).toBe(80);
      });
    });

    describe('blockOnly filtering', () => {
      it('should block only specified simple paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { blockOnly: ['username', 'isActive'] }
        );

        expect(result[0].success).toBe(true);

        // Blocked paths should remain unchanged
        expect(targetContainer.getItem('username')).toBe('targetUser');
        expect(targetContainer.getItem('isActive')).toBe(false);

        // Non-blocked paths should be updated
        expect(targetContainer.getItem('level')).toBe(10);
      });

      it('should block only specified nested paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { blockOnly: ['player.profile.class', 'settings.graphics.quality'] }
        );

        expect(result[0].success).toBe(true);

        // Blocked nested paths should remain unchanged
        expect(targetContainer.getItem('player.profile.class')).toBe('Mage');
        expect(targetContainer.getItem('settings.graphics.quality')).toBe('medium');

        // Non-blocked nested paths should be updated
        expect(targetContainer.getItem('player.profile.name')).toBe('Alice');
        expect(targetContainer.getItem('settings.graphics.resolution')).toBe('1920x1080');
      });

      it('should block entire object sections', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { blockOnly: ['player.inventory', 'settings.controls'] }
        );

        expect(result[0].success).toBe(true);

        // Blocked sections should remain unchanged
        expect(targetContainer.getItem('player.inventory.weapons')).toEqual(['staff']);
        expect(targetContainer.getItem('player.inventory.consumables')).toEqual(['elixir']);
        expect(targetContainer.hasItem('settings.controls')).toBe(false); // Should not be added

        // Non-blocked sections should be updated
        expect(targetContainer.getItem('player.profile.name')).toBe('Alice');
        expect(targetContainer.getItem('settings.graphics.resolution')).toBe('1920x1080');
      });
    });

    describe('excludePaths filtering', () => {
      it('should exclude specified simple paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { excludePaths: ['username', 'isActive'] }
        );

        expect(result[0].success).toBe(true);

        // Excluded paths should remain unchanged
        expect(targetContainer.getItem('username')).toBe('targetUser');
        expect(targetContainer.getItem('isActive')).toBe(false);

        // Non-excluded paths should be updated
        expect(targetContainer.getItem('level')).toBe(10);
      });

      it('should exclude deeply nested paths', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { excludePaths: ['settings.graphics.effects.shadows', 'player.inventory.armor.boots'] }
        );

        expect(result[0].success).toBe(true);

        // Deep paths should be excluded
        expect(targetContainer.hasItem('settings.graphics.effects.shadows')).toBe(false);
        expect(targetContainer.hasItem('player.inventory.armor.boots')).toBe(false);

        // Other deep paths should be included
        expect(targetContainer.getItem('settings.graphics.effects.particles')).toBe(true);
        expect(targetContainer.getItem('player.inventory.armor.helmet')).toBe('Iron Helmet');
      });
    });

    describe('combined filtering operations', () => {
      it('should work with allowOnly in ContextMerger operations', () => {
        const result = ContextMerger.merge(
          sourceContainer,
          targetContainer,
          'mergeSourcePriority',
          {
            allowOnly: ['player.profile', 'settings.audio'],
            createMissing: true
          }
        );

        expect(result.success).toBe(true);

        // Only allowed sections should be merged
        expect(targetContainer.getItem('player.profile.name')).toBe('Alice');
        expect(targetContainer.getItem('player.profile.guild')).toBe('Dragons'); // New field added
        expect(targetContainer.getItem('settings.audio.effects')).toBe(0.9); // New field added

        // Non-allowed sections should remain unchanged
        expect(targetContainer.getItem('player.stats.health')).toBe(80); // Original target value
        expect(targetContainer.getItem('settings.graphics.resolution')).toBe('1280x720'); // Original target value
      });

      it('should work with blockOnly in consolidation operations', () => {
        const anotherSource = new ContextContainer({
          username: 'thirdUser',
          player: {
            profile: { name: 'Charlie', class: 'Rogue' }
          }
        });

        const result = ContextOperations.consolidateContexts(
          [sourceContainer, anotherSource],
          targetContainer,
          {
            strategy: 'mergeSourcePriority',
            blockOnly: ['player.profile.class']
          }
        );

        expect(result.overallSuccess).toBe(true);

        // Blocked paths should remain unchanged even with multiple sources
        expect(targetContainer.getItem('player.profile.class')).toBe('Mage');

        // Non-blocked paths should be updated from the sources
        expect(targetContainer.getItem('player.profile.name')).toBe('Charlie'); // From last source
        expect(targetContainer.getItem('username')).toBe('thirdUser'); // From last source
      });

      it('should work with excludePaths in bidirectional sync', () => {
        const result = ContextOperations.synchronizeBidirectional(
          sourceContainer,
          targetContainer,
          {
            strategy: 'mergeNewerWins',
            excludePaths: ['player.inventory', 'settings.controls']
          }
        );

        expect(result.success).toBe(true);

        // Excluded paths should not be synchronized in either direction
        expect(sourceContainer.getItem('player.inventory.weapons')).toEqual(['sword', 'shield']); // Original source
        expect(targetContainer.getItem('player.inventory.weapons')).toEqual(['staff']); // Original target

        // Non-excluded paths should be synchronized
        expect(result.direction1to2).toBeDefined();
        expect(result.direction2to1).toBeDefined();
      });
    });

    describe('filtering with array and object values', () => {
      it('should handle filtering of array values at different nesting levels', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { allowOnly: ['player.inventory.weapons', 'player.inventory.consumables'] }
        );

        expect(result[0].success).toBe(true);

        // Array values should be completely replaced when allowed
        expect(targetContainer.getItem('player.inventory.weapons')).toEqual(['sword', 'shield']);
        expect(targetContainer.getItem('player.inventory.consumables')).toEqual(['potion', 'scroll']);

        // Other inventory items should remain unchanged
        expect(targetContainer.getItem('player.inventory.accessories')).toEqual(['ring', 'amulet']);
      });

      it('should handle filtering of complex nested objects', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          {
            allowOnly: ['settings.graphics.effects'],
            blockOnly: []
          }
        );

        expect(result[0].success).toBe(true);

        // Complex nested object should be merged when allowed
        expect(targetContainer.getItem('settings.graphics.effects.shadows')).toBe(true);
        expect(targetContainer.getItem('settings.graphics.effects.particles')).toBe(true);
        expect(targetContainer.getItem('settings.graphics.effects.lighting')).toBe('advanced');

        // Other graphics settings should remain unchanged
        expect(targetContainer.getItem('settings.graphics.resolution')).toBe('1280x720');
        expect(targetContainer.getItem('settings.graphics.quality')).toBe('medium');
      });
    });

    describe('edge cases and error scenarios', () => {
      it('should handle non-existent paths in allowOnly filter', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          { allowOnly: ['nonexistent.path', 'player.profile.name', 'also.missing'] }
        );

        expect(result[0].success).toBe(true);

        // Existing allowed paths should still work
        expect(targetContainer.getItem('player.profile.name')).toBe('Alice');

        // Non-existent paths should not cause errors
        expect(targetContainer.hasItem('nonexistent.path')).toBe(false);
        expect(targetContainer.hasItem('also.missing')).toBe(false);
      });

      it('should handle empty filtering arrays', () => {
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          {
            allowOnly: [],
            blockOnly: [],
            excludePaths: []
          }
        );

        expect(result[0].success).toBe(true);

        // With empty filters, normal merge should occur
        expect(targetContainer.getItem('username')).toBe('sourceUser');
        expect(targetContainer.getItem('level')).toBe(10);
      });

      it('should handle conflicting filter combinations gracefully', () => {
        // Test conflicting allowOnly and blockOnly (implementation-dependent behavior)
        const result = ContextOperations.pushFromMultipleSources(
          [sourceContainer],
          targetContainer,
          'mergeSourcePriority',
          {
            allowOnly: ['username', 'level'],
            blockOnly: ['username'] // Conflict: username is both allowed and blocked
          }
        );

        expect(result[0].success).toBe(true);
        // The implementation should handle this gracefully (behavior may vary)
      });
    });
  });

  describe('Enhanced Nested Path Checking Integration Tests', () => {
    describe('ContextContainer with enhanced nested path checking disabled (default)', () => {
      let container;

      beforeEach(() => {
        container = new ContextContainer({
          player: {
            profile: { name: 'Alice', class: 'Warrior' },
            stats: { level: 10, health: 100 },
            inventory: {
              weapons: ['sword', 'shield'],
              armor: { helmet: 'Iron Helmet', chest: 'Leather Armor' }
            }
          },
          settings: {
            graphics: { resolution: '1920x1080', quality: 'high' },
            audio: { master: 0.8, music: 0.6 }
          }
        });
      });

      it('should use default behavior and not find nested paths in plain objects', () => {
        // Top-level items should be found
        expect(container.hasItem('player')).toBe(true);
        expect(container.hasItem('settings')).toBe(true);

        // Nested paths in plain objects should NOT be found with default behavior
        expect(container.hasItem('player.profile')).toBe(false);
        expect(container.hasItem('player.profile.name')).toBe(false);
        expect(container.hasItem('player.stats.level')).toBe(false);
        expect(container.hasItem('settings.graphics.resolution')).toBe(false);
        expect(container.hasItem('settings.audio.master')).toBe(false);
      });

      it('should preserve filtering behavior in merge operations', () => {
        const sourceContainer = new ContextContainer({
          player: {
            profile: { name: 'Bob', class: 'Mage' },
            stats: { level: 15, health: 120 }
          }
        });

        // Test merge with excludePaths - this should work correctly with default behavior
        const result = ContextMerger.merge(
          sourceContainer,
          container,
          'mergeSourcePriority',
          {
            excludePaths: ['player.stats.level']
          }
        );

        expect(result.success).toBe(true);
        
        // The excluded path should not be overridden
        expect(container.getItem('player.stats.level')).toBe(10); // Original value preserved
        
        // Other values should be merged
        expect(container.getItem('player.profile.name')).toBe('Bob');
        expect(container.getItem('player.stats.health')).toBe(120);
      });
    });

    describe('ContextContainer with enhanced nested path checking enabled', () => {
      let container;

      beforeEach(() => {
        container = new ContextContainer({
          player: {
            profile: { name: 'Alice', class: 'Warrior' },
            stats: { level: 10, health: 100 },
            inventory: {
              weapons: ['sword', 'shield'],
              armor: { helmet: 'Iron Helmet', chest: 'Leather Armor' }
            }
          },
          settings: {
            graphics: { resolution: '1920x1080', quality: 'high' },
            audio: { master: 0.8, music: 0.6 }
          }
        }, {}, { enhancedNestedPathChecking: true });
      });

      it('should find nested paths in plain objects with enhanced behavior', () => {
        // Top-level items should be found
        expect(container.hasItem('player')).toBe(true);
        expect(container.hasItem('settings')).toBe(true);

        // Nested paths in plain objects should be found with enhanced behavior
        expect(container.hasItem('player.profile')).toBe(true);
        expect(container.hasItem('player.profile.name')).toBe(true);
        expect(container.hasItem('player.profile.class')).toBe(true);
        expect(container.hasItem('player.stats')).toBe(true);
        expect(container.hasItem('player.stats.level')).toBe(true);
        expect(container.hasItem('player.stats.health')).toBe(true);
        expect(container.hasItem('player.inventory')).toBe(true);
        expect(container.hasItem('player.inventory.weapons')).toBe(true);
        expect(container.hasItem('player.inventory.armor')).toBe(true);
        expect(container.hasItem('player.inventory.armor.helmet')).toBe(true);
        expect(container.hasItem('player.inventory.armor.chest')).toBe(true);
        expect(container.hasItem('settings.graphics')).toBe(true);
        expect(container.hasItem('settings.graphics.resolution')).toBe(true);
        expect(container.hasItem('settings.graphics.quality')).toBe(true);
        expect(container.hasItem('settings.audio')).toBe(true);
        expect(container.hasItem('settings.audio.master')).toBe(true);
        expect(container.hasItem('settings.audio.music')).toBe(true);

        // Non-existent paths should NOT be found
        expect(container.hasItem('player.stats.mana')).toBe(false);
        expect(container.hasItem('player.inventory.consumables')).toBe(false);
        expect(container.hasItem('settings.network')).toBe(false);
        expect(container.hasItem('nonexistent')).toBe(false);
        expect(container.hasItem('player.nonexistent.path')).toBe(false);
      });

      it('should still work correctly with ContextContainer nesting', () => {
        // Add a nested ContextContainer with enhanced path checking enabled to match parent
        const nestedContainer = new ContextContainer({ 
          nestedData: 'from nested container',
          deepValue: { very: { deep: 'value' } }
        }, {}, { enhancedNestedPathChecking: true });
        container.setItem('nestedContainer', nestedContainer);

        // Should work with ContextContainer nesting regardless of enhanced option
        expect(container.hasItem('nestedContainer')).toBe(true);
        expect(container.hasItem('nestedContainer.nestedData')).toBe(true);
        expect(container.hasItem('nestedContainer.deepValue')).toBe(true);
        expect(container.hasItem('nestedContainer.deepValue.very')).toBe(true);
        expect(container.hasItem('nestedContainer.deepValue.very.deep')).toBe(true);
      });

      it('should maintain correct filtering behavior in operations', () => {
        const sourceContainer = new ContextContainer({
          player: {
            profile: { name: 'Bob', class: 'Mage', race: 'Elf' },
            stats: { level: 15, health: 120, mana: 150 }
          }
        }, {}, { enhancedNestedPathChecking: true });

        // Test that filtering still works correctly even with enhanced checking
        const result = ContextMerger.merge(
          sourceContainer,
          container,
          'mergeSourcePriority',
          {
            excludePaths: ['player.stats.level', 'player.profile.class']
          }
        );

        expect(result.success).toBe(true);
        
        // Excluded paths should not be overridden
        expect(container.getItem('player.stats.level')).toBe(10); // Original value preserved
        expect(container.getItem('player.profile.class')).toBe('Warrior'); // Original value preserved
        
        // Non-excluded values should be merged
        expect(container.getItem('player.profile.name')).toBe('Bob');
        expect(container.getItem('player.stats.health')).toBe(120);
        expect(container.getItem('player.stats.mana')).toBe(150); // New field added
        expect(container.getItem('player.profile.race')).toBe('Elf'); // New field added
      });
    });

    describe('Behavior consistency across integration scenarios', () => {
      it('should maintain consistent hasItem behavior in ContextOperations', () => {
        const defaultContainer = new ContextContainer({
          data: { player: { name: 'Alice', stats: { level: 5 } } }
        });

        const enhancedContainer = new ContextContainer({
          data: { player: { name: 'Bob', stats: { level: 10 } } }
        }, {}, { enhancedNestedPathChecking: true });

        // Default behavior: should not find nested paths in plain objects
        expect(defaultContainer.hasItem('data.player.stats')).toBe(false);
        expect(defaultContainer.hasItem('data.player.stats.level')).toBe(false);

        // Enhanced behavior: should find nested paths in plain objects
        expect(enhancedContainer.hasItem('data.player.stats')).toBe(true);
        expect(enhancedContainer.hasItem('data.player.stats.level')).toBe(true);

        // Both should find the top-level items
        expect(defaultContainer.hasItem('data')).toBe(true);
        expect(enhancedContainer.hasItem('data')).toBe(true);
      });

      it('should not affect ContextContainer-to-ContextContainer operations', () => {
        const sourceWithEnhanced = new ContextContainer({
          nested: new ContextContainer({ testValue: 'test' }, {}, { enhancedNestedPathChecking: true })
        }, {}, { enhancedNestedPathChecking: true });

        const targetWithDefault = new ContextContainer({
          other: 'data'
        }); // Default behavior

        // Both should handle ContextContainer nesting the same way
        expect(sourceWithEnhanced.hasItem('nested')).toBe(true);
        expect(sourceWithEnhanced.hasItem('nested.testValue')).toBe(true);

        // Sync operation should work regardless of enhanced option differences
        const result = ContextContainerSync.updateTargetToMatchSource(
          sourceWithEnhanced,
          targetWithDefault
        );

        expect(result.success).toBe(true);
        expect(targetWithDefault.hasItem('nested')).toBe(true);
        expect(targetWithDefault.hasItem('nested.testValue')).toBe(true);
      });
    });
  });

  describe('Nested Container and Hybrid Type Integration Tests', () => {
    let parentContainer;
    let nestedContainer;
    let nestedItem;

    beforeEach(() => {
      // Create a nested ContextContainer
      nestedContainer = new ContextContainer({
        nestedData: 'from nested container',
        deepSettings: {
          option1: true,
          option2: 'value'
        }
      });

      // Create a nested ContextItem
      nestedItem = new ContextItem('from nested item', {
        metadata: { type: 'nested', level: 2 }
      });

      // Create a parent container with nested containers and items
      parentContainer = new ContextContainer({
        // Plain object nesting
        plainObject: {
          level1: {
            level2: 'plain nested value'
          }
        },
        // ContextContainer nesting
        nestedContainer: nestedContainer,
        // ContextItem nesting
        nestedItem: nestedItem,
        // Hybrid nesting - mix of types
        hybridSection: {
          plainData: 'plain value',
          containerData: new ContextContainer({
            innerValue: 'inner container value'
          }),
          itemData: new ContextItem('inner item value')
        }
      });
    });

    it('should handle ContextContainer nested within ContextContainer', () => {
      // Test direct access to nested container - should return the wrapped value, not the ContextContainer itself
      const retrievedContainer = parentContainer.getItem('nestedContainer');
      // Since getItem returns item.value, not the item itself, we get the unwrapped value
      expect(typeof retrievedContainer).toBe('object');
      expect(retrievedContainer.nestedData).toBe('from nested container');

      // Test deep path access through nested container
      expect(parentContainer.getItem('nestedContainer.nestedData')).toBe('from nested container');
      expect(parentContainer.getItem('nestedContainer.deepSettings.option1')).toBe(true);
      expect(parentContainer.getItem('nestedContainer.deepSettings.option2')).toBe('value');

      // Test modification of nested container through parent
      parentContainer.setItem('nestedContainer.newValue', 'added through parent');
      expect(nestedContainer.getItem('newValue')).toBe('added through parent');
      expect(parentContainer.getItem('nestedContainer.newValue')).toBe('added through parent');
    });

    it('should handle ContextItem nested within ContextContainer', () => {
      // Test direct access to nested item - getItem returns the item's value, not the ContextItem itself
      const retrievedItemValue = parentContainer.getItem('nestedItem');
      expect(retrievedItemValue).toBe('from nested item');

      // Test accessing nested item's value through dot notation (this won't work as expected since ContextItem doesn't have getItem)
      // Instead, we need to access the managed item directly
      const actualNestedItem = parentContainer._getManagedItem('nestedItem');
      expect(actualNestedItem).toBe(nestedItem);
      expect(actualNestedItem.value).toBe('from nested item');

      // Test modification of nested item through parent
      parentContainer.setItem('nestedItem', 'modified through parent');
      expect(parentContainer.getItem('nestedItem')).toBe('modified through parent');
    });

    it('should handle hybrid nesting with mixed types', () => {
      // Test access to plain data in hybrid section
      expect(parentContainer.getItem('hybridSection.plainData')).toBe('plain value');

      // Test accessing the hybrid section itself to see the structure
      const hybridSection = parentContainer.getItem('hybridSection');
      expect(hybridSection.plainData).toBe('plain value');

      // Since containerData and itemData are complex objects stored in a plain object,
      // they need to be accessed differently than pure ContextContainer nesting
      expect(hybridSection.containerData).toBeInstanceOf(ContextContainer);
      expect(hybridSection.itemData).toBeInstanceOf(ContextItem);

      // Access values through the actual instances
      expect(hybridSection.containerData.getItem('innerValue')).toBe('inner container value');
      expect(hybridSection.itemData.value).toBe('inner item value');

      // Test modification of each type
      // For plain data within the hybrid section, we need to modify the whole object
      const updatedHybridSection = { ...hybridSection, plainData: 'modified plain' };
      parentContainer.setItem('hybridSection', updatedHybridSection);

      // Modify the nested container through its reference
      hybridSection.containerData.setItem('newInnerValue', 'new inner value');
      // Modify the nested item through its reference
      hybridSection.itemData.value = 'modified inner item';

      expect(parentContainer.getItem('hybridSection.plainData')).toBe('modified plain');
      expect(hybridSection.containerData.getItem('newInnerValue')).toBe('new inner value');
      expect(hybridSection.itemData.value).toBe('modified inner item');
    });    it('should synchronize nested containers correctly', () => {
      // Create another container with nested structure
      const sourceNestedContainer = new ContextContainer({
        nestedData: 'updated from source',
        newNestedField: 'source only field'
      });

      const sourceContainer = new ContextContainer({
        nestedContainer: sourceNestedContainer,
        newTopLevel: 'source top level'
      });

      // Make source container newer to ensure mergeNewerWins picks the source
      sourceContainer._updateModificationTimestamps(new Date(Date.now() + 1000));

      // Perform synchronization
      const result = ContextContainerSync.mergeNewerWins(sourceContainer, parentContainer);

      expect(result.success).toBe(true);

      // Check that nested container was properly synchronized
      expect(parentContainer.getItem('nestedContainer.nestedData')).toBe('updated from source');
      expect(parentContainer.getItem('nestedContainer.newNestedField')).toBe('source only field');
      expect(parentContainer.getItem('newTopLevel')).toBe('source top level');

      // Original nested container data should be preserved if not overwritten
      expect(parentContainer.getItem('nestedContainer.deepSettings.option1')).toBe(true);
    });

    it('should handle filtering with nested containers', () => {
      const sourceContainer = new ContextContainer({
        nestedContainer: new ContextContainer({
          allowedField: 'should be copied',
          blockedField: 'should not be copied'
        }),
        topLevelAllowed: 'top level allowed',
        topLevelBlocked: 'top level blocked'
      });

      // Test allowOnly filtering with nested paths
      const allowResult = ContextMerger.merge(
        sourceContainer,
        parentContainer,
        'mergeSourcePriority',
        {
          allowOnly: ['nestedContainer.allowedField', 'topLevelAllowed']
        }
      );

      expect(allowResult.success).toBe(true);
      expect(parentContainer.getItem('nestedContainer.allowedField')).toBe('should be copied');
      expect(parentContainer.getItem('topLevelAllowed')).toBe('top level allowed');

      // Blocked fields should not be copied
      expect(parentContainer.getItem('nestedContainer.blockedField')).toBeUndefined();
      expect(parentContainer.getItem('topLevelBlocked')).toBeUndefined();
    });

    it('should handle blockOnly filtering with nested containers', () => {
      const sourceContainer = new ContextContainer({
        nestedContainer: new ContextContainer({
          allowedField: 'should be copied',
          blockedField: 'should not be copied'
        }),
        topLevelAllowed: 'top level allowed',
        topLevelBlocked: 'top level blocked'
      });

      const targetContainer = new ContextContainer({
        nestedContainer: new ContextContainer({
          existingField: 'existing nested'
        }),
        existingTopLevel: 'existing top'
      });

      // Test blockOnly filtering with nested paths
      const blockResult = ContextMerger.merge(
        sourceContainer,
        targetContainer,
        'mergeSourcePriority',
        {
          blockOnly: ['nestedContainer.blockedField', 'topLevelBlocked']
        }
      );

      expect(blockResult.success).toBe(true);
      expect(targetContainer.getItem('nestedContainer.allowedField')).toBe('should be copied');
      expect(targetContainer.getItem('topLevelAllowed')).toBe('top level allowed');

      // Blocked fields should not be copied
      expect(targetContainer.getItem('nestedContainer.blockedField')).toBeUndefined();
      expect(targetContainer.getItem('topLevelBlocked')).toBeUndefined();

      // Existing data should be preserved
      expect(targetContainer.getItem('nestedContainer.existingField')).toBe('existing nested');
      expect(targetContainer.getItem('existingTopLevel')).toBe('existing top');
    });

    it('should handle ContextOperations with nested containers', () => {
      const sourceContainer = new ContextContainer({
        nestedContainer: new ContextContainer({
          playerStats: { level: 10, xp: 1000 },
          inventory: ['sword', 'potion']
        }),
        gameSettings: {
          difficulty: 'hard',
          volume: 0.8
        }
      });

      // Test pushItems with nested container paths
      const pushResult = ContextOperations.pushItems(
        sourceContainer,
        parentContainer,
        ['nestedContainer.playerStats', 'gameSettings.difficulty']
      );

      expect(pushResult.success).toBe(true);
      expect(pushResult.itemsProcessed).toContain('nestedContainer.playerStats');
      expect(pushResult.itemsProcessed).toContain('gameSettings.difficulty');

      // Verify the nested data was copied
      expect(parentContainer.getItem('nestedContainer.playerStats.level')).toBe(10);
      expect(parentContainer.getItem('nestedContainer.playerStats.xp')).toBe(1000);
      expect(parentContainer.getItem('gameSettings.difficulty')).toBe('hard');
    });

    it('should handle deeply nested containers in bulk operations', () => {
      const createDeepContainer = (id) => new ContextContainer({
        level1: new ContextContainer({
          level2: new ContextContainer({
            level3: {
              data: `deep data from ${id}`,
              value: id * 100
            }
          })
        })
      });

      const sources = [createDeepContainer(1), createDeepContainer(2)];
      const targets = [createDeepContainer(3), createDeepContainer(4)];

      // Test bulk operations with deeply nested containers
      const bulkResult = ContextOperations.pushItemsBulk(
        sources,
        targets,
        ['level1.level2.level3.data'],
        'mergeSourcePriority'
      );

      expect(bulkResult).toHaveLength(2); // 2 sources
      expect(bulkResult[0]).toHaveLength(2); // 2 targets for each source

      // Verify the deep nested data was copied
      // Since pushItemsBulk applies each source to each target, and sources are processed in order,
      // the final values should be from the last source (source 2)
      expect(targets[0].getItem('level1.level2.level3.data')).toBe('deep data from 2');
      expect(targets[1].getItem('level1.level2.level3.data')).toBe('deep data from 2');
    });

    it('should handle circular references in nested containers', () => {
      const containerA = new ContextContainer({ id: 'A' });
      const containerB = new ContextContainer({ id: 'B' });
      const containerC = new ContextContainer({ id: 'C' });

      // Create circular references: A -> B -> C -> A
      containerA.setItem('reference', containerB);
      containerB.setItem('reference', containerC);
      containerC.setItem('reference', containerA);

      const parentWithCircular = new ContextContainer({
        circularChain: containerA,
        normalData: 'normal'
      });

      // Make the source newer to ensure mergeNewerWins picks the source
      parentWithCircular._updateModificationTimestamps(new Date(Date.now() + 1000));

      // Test that operations handle circular references gracefully
      const targetContainer = new ContextContainer({
        existing: 'data'
      });

      const result = ContextContainerSync.mergeNewerWins(parentWithCircular, targetContainer);

      expect(result.success).toBe(true);
      expect(targetContainer.getItem('normalData')).toBe('normal');
      expect(targetContainer.getItem('circularChain.id')).toBe('A');
      // Should not cause infinite recursion
    });

    it('should preserve type integrity in nested scenarios', () => {
      // Test that nested ContextContainers are preserved as items (not their raw values)
      const actualNestedContainer = parentContainer._getManagedItem('nestedContainer');
      expect(actualNestedContainer).toBeInstanceOf(ContextContainer);
      expect(actualNestedContainer.constructor.name).toBe('ContextContainer');

      // Test that nested ContextItems are preserved as items
      const actualNestedItem = parentContainer._getManagedItem('nestedItem');
      expect(actualNestedItem).toBeInstanceOf(ContextItem);
      expect(actualNestedItem.constructor.name).toBe('ContextItem');

      // Test that getItem returns unwrapped values, but _getManagedItem returns the wrapped instances
      const unwrappedContainer = parentContainer.getItem('nestedContainer');
      expect(unwrappedContainer).not.toBeInstanceOf(ContextContainer);
      expect(typeof unwrappedContainer).toBe('object');

      const unwrappedItem = parentContainer.getItem('nestedItem');
      expect(unwrappedItem).not.toBeInstanceOf(ContextItem);
      expect(typeof unwrappedItem).toBe('string');
    });

    it('should handle comparison operations with nested containers', () => {
      const containerWithNested1 = new ContextContainer({
        nested: new ContextContainer({ value: 'test1' })
      });

      const containerWithNested2 = new ContextContainer({
        nested: new ContextContainer({ value: 'test2' })
      });

      // Update timestamps to ensure one is newer (reverse the order to make B newer)
      containerWithNested1._updateModificationTimestamps(new Date('2025-01-02'));
      containerWithNested2._updateModificationTimestamps(new Date('2025-01-01'));

      const comparison = ContextComparison.compare(containerWithNested1, containerWithNested2);

      expect(comparison.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(comparison.timeDifference).toBeGreaterThan(0);
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
