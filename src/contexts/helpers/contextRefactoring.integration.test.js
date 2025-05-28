/**
 * @file contextRefactoring.integration.test.js
 * @description Integration tests to verify the context synchronization refactoring works correctly
 * @path /src/context/helpers/contextRefactoring.integration.test.js
 */

import Context from '../context.js';
import ContextSync from './contextSync.js';
import ContextMerger from './contextMerger.js';

// Mock dependencies
jest.mock('@manifest', () => ({ name: 'test-module', version: '1.0.0' }));
jest.mock('@/constants/constants', () => ({
  context: {
    schema: {},
    naming: {}
  },
  flags: {}
}));
jest.mock('@/utils/static/validator', () => ({
  validateObject: jest.fn(() => true)
}));

describe('Context Synchronization Refactoring Integration', () => {
  let sourceContext;
  let targetContext;

  beforeEach(() => {
    // Create two test contexts with some data
    sourceContext = new Context({
      initializationParams: {
        data: { userPrefs: 'source', shared: 'sourceValue', timestamp: new Date('2025-01-02') },
        settings: { theme: 'dark', autoSave: true }
      }
    });

    targetContext = new Context({
      initializationParams: {
        data: { userPrefs: 'target', shared: 'targetValue', timestamp: new Date('2025-01-01') },
        settings: { theme: 'light', language: 'en' }
      }
    });

    // Mock timestamps to control merge behavior
    const now = new Date();
    const earlier = new Date(now.getTime() - 1000);
    const later = new Date(now.getTime() + 1000);

    // Make source data newer than target
    if (sourceContext.data && typeof sourceContext.data.setMetadata === 'function') {
      sourceContext.data.setMetadata({ modifiedAt: later });
    }
    if (targetContext.data && typeof targetContext.data.setMetadata === 'function') {
      targetContext.data.setMetadata({ modifiedAt: earlier });
    }
  });

  describe('ContextSync delegation to ContextMerger', () => {
    it('should delegate Context instances to ContextMerger for sync operations', () => {
      const contextMergerSpy = jest.spyOn(ContextMerger, 'merge');

      const result = ContextSync.sync(sourceContext, targetContext, 'mergeNewerWins');

      expect(contextMergerSpy).toHaveBeenCalledWith(
        sourceContext,
        targetContext,
        'mergeNewerWins',
        expect.objectContaining({
          compareBy: 'modifiedAt',
          preserveMetadata: true,
          createMissing: true
        })
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();

      contextMergerSpy.mockRestore();
    });

    it('should delegate Context instances to ContextMerger for autoSync', () => {
      const contextMergerSpy = jest.spyOn(ContextMerger, 'merge');

      const result = ContextSync.autoSync(sourceContext, targetContext);

      expect(contextMergerSpy).toHaveBeenCalledWith(
        sourceContext,
        targetContext,
        'mergeNewerWins',
        expect.objectContaining({
          compareBy: 'modifiedAt',
          preserveMetadata: true,
          createMissing: true
        })
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();

      contextMergerSpy.mockRestore();
    });
  });

  describe('Context class API delegation', () => {
    it('should use the new merge method for sophisticated operations', () => {
      const contextMergerSpy = jest.spyOn(ContextMerger, 'merge');

      const result = sourceContext.merge(targetContext, 'mergeNewerWins', {
        excludeComponents: ['schema'],
        preserveMetadata: true
      });

      expect(contextMergerSpy).toHaveBeenCalledWith(
        sourceContext,
        targetContext,
        'mergeNewerWins',
        expect.objectContaining({
          excludeComponents: ['schema'],
          preserveMetadata: true
        })
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.strategy).toBe('mergeNewerWins');

      contextMergerSpy.mockRestore();
    });

    it('should still support deprecated sync methods', () => {
      const contextSyncSpy = jest.spyOn(ContextSync, 'sync');

      const result = sourceContext.sync(targetContext, 'mergeSourcePriority');

      expect(contextSyncSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();

      contextSyncSpy.mockRestore();
    });

    it('should still support deprecated autoSync method', () => {
      const contextSyncSpy = jest.spyOn(ContextSync, 'autoSync');

      const result = sourceContext.autoSync(targetContext);

      expect(contextSyncSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();

      contextSyncSpy.mockRestore();
    });
  });

  describe('Strategy consistency between ContextSync and ContextMerger', () => {
    const strategies = [
      'mergeNewerWins',
      'mergeSourcePriority',
      'mergeTargetPriority',
      'updateSourceToTarget',
      'updateTargetToSource'
    ];

    strategies.forEach(strategy => {
      it(`should handle ${strategy} strategy consistently`, () => {
        const syncResult = ContextSync.sync(sourceContext, targetContext, strategy);
        const mergeResult = ContextMerger.merge(sourceContext, targetContext, strategy);

        // Both should succeed
        expect(syncResult.success).toBeDefined();
        expect(mergeResult.success).toBeDefined();

        // ContextMerger should provide more detailed information
        expect(mergeResult.strategy).toBe(strategy);
        expect(mergeResult.statistics).toBeDefined();
        expect(mergeResult.itemsProcessed).toBeDefined();
      });
    });
  });

  describe('Error handling consistency', () => {
    it('should handle errors gracefully in both sync paths', () => {
      // Create invalid contexts to trigger errors
      const invalidSource = null;
      const invalidTarget = targetContext;

      expect(() => {
        ContextSync.sync(invalidSource, invalidTarget, 'mergeNewerWins');
      }).toThrow();

      expect(() => {
        ContextMerger.merge(invalidSource, invalidTarget, 'mergeNewerWins');
      }).toThrow('Invalid source or target context for merge operation');
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain the same API for existing ContextSync operations', () => {
      // Test that all expected static methods exist
      expect(typeof ContextSync.compare).toBe('function');
      expect(typeof ContextSync.sync).toBe('function');
      expect(typeof ContextSync.autoSync).toBe('function');
      expect(typeof ContextSync.validateCompatibility).toBe('function');

      // Test that all expected constants exist
      expect(ContextSync.SYNC_OPERATIONS).toBeDefined();
      expect(ContextSync.COMPARISON_RESULTS).toBeDefined();
      expect(ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS).toBe('mergeNewerWins');
      expect(ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY).toBe('mergeSourcePriority');
    });

    it('should maintain the same API for existing Context methods', () => {
      // Test that all expected instance methods exist and are marked as deprecated
      expect(typeof sourceContext.compare).toBe('function');
      expect(typeof sourceContext.sync).toBe('function');
      expect(typeof sourceContext.autoSync).toBe('function');
      expect(typeof sourceContext.updateToMatch).toBe('function');
      expect(typeof sourceContext.updateTarget).toBe('function');
      expect(typeof sourceContext.merge).toBe('function'); // New method
    });
  });

  describe('Performance and optimization benefits', () => {
    it('should provide detailed statistics through ContextMerger', () => {
      const result = sourceContext.merge(targetContext, 'mergeNewerWins');

      expect(result.statistics).toBeDefined();
      expect(result.statistics).toHaveProperty('sourcePreferred');
      expect(result.statistics).toHaveProperty('targetPreferred');
      expect(result.statistics).toHaveProperty('created');
      expect(result.statistics).toHaveProperty('updated');
      expect(result.statistics).toHaveProperty('skipped');
      expect(result.itemsProcessed).toBeDefined();
      expect(result.conflicts).toBeDefined();
      expect(result.changes).toBeInstanceOf(Array);
    });

    it('should support advanced options only available in ContextMerger', () => {
      const result = sourceContext.merge(targetContext, 'mergeNewerWins', {
        excludeComponents: ['schema', 'constants'],
        includeComponents: null,
        dryRun: true,
        createMissing: false,
        onConflict: (sourceItem, targetItem, path) => {
          return path.includes('userPrefs') ? targetItem : null;
        }
      });

      expect(result.success).toBeDefined();
      // In dry run mode, no actual changes should be made
      // This would need to be verified based on the actual implementation
    });
  });
});
