/**
 * @file contextSync.unit.test.mjs
 * @description Unit tests for the ContextSync class functionality.
 * @path src/contexts/helpers/contextSync.unit.test.mjs

 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock modules with problematic imports first
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

vi.mock('../context.mjs', () => ({
  default: vi.fn().mockImplementation(() => ({
    container: {
      keys: vi.fn(),
      getItem: vi.fn()
    }
  }))
}));

vi.mock('./contextComparison.mjs', () => ({
  default: {
    compare: vi.fn(),
    compareItems: vi.fn()
  }
}));

vi.mock('./contextAutoSync.mjs', () => ({
  default: {
    sync: vi.fn(),
    analyze: vi.fn()
  }
}));

vi.mock('./contextItemSync.mjs', () => ({
  default: {
    syncFromSource: vi.fn(),
    syncToSource: vi.fn()
  }
}));

vi.mock('./contextContainerSync.mjs', () => ({
  default: {
    syncFromSource: vi.fn(),
    syncToSource: vi.fn()
  }
}));

vi.mock('./contextLegacySync.mjs', () => ({
  default: {
    legacySync: vi.fn()
  }
}));

import { ContextSync } from './contextSync.mjs';
import { ContextItem } from './contextItem.mjs';
import { ContextContainer } from './contextContainer.mjs';
import Context from '../context.mjs';
import ContextComparison from './contextComparison.mjs';
import ContextAutoSync from './contextAutoSync.mjs';
import ContextItemSync from './contextItemSync.mjs';
import ContextContainerSync from './contextContainerSync.mjs';
import ContextLegacySync from './contextLegacySync.mjs';
vi.mock('./contextItemSync.mjs');
vi.mock('./contextContainerSync.mjs');
vi.mock('./contextLegacySync.mjs');
vi.mock('./contextComparison.mjs');
vi.mock('../context.mjs');
vi.mock('./contextMerger.mjs', () => ({
  __esModule: true,
  default: {
    merge: vi.fn()
  },
  ItemFilter: vi.fn()
}));

describe('ContextSync', () => {
  let sourceItem, targetItem, sourceContainer, targetContainer, sourceContext, targetContext;

  beforeEach(() => {
    sourceItem = new ContextItem('source', { meta: 1 });
    targetItem = new ContextItem('target', { meta: 2 });
    sourceContainer = new ContextContainer({ foo: 'bar' });
    targetContainer = new ContextContainer({ foo: 'baz' });
    
    // Create mock Context objects with the isContextObject property
    sourceContext = { isContextObject: true, constructor: { name: 'Context' } };
    targetContext = { isContextObject: true, constructor: { name: 'Context' } };

    // Setup default mock behaviors
    ContextLegacySync.validateCompatibility.mockImplementation((source, target) => {
      // Mock real behavior: same types return true, different types return false
      if ((source instanceof ContextItem && target instanceof ContextItem) ||
          (source instanceof ContextContainer && target instanceof ContextContainer)) {
        return true;
      }
      return false;
    });
    ContextLegacySync.performLegacySync.mockReturnValue({ success: true, operation: 'test', changes: [] });

    vi.clearAllMocks();
  });

  describe('compare', () => {
    it('should delegate to ContextComparison.compare', () => {
      ContextComparison.compare.mockReturnValue({ result: 'EQUAL' });
      const result = ContextSync.compare(sourceItem, targetItem);
      expect(ContextComparison.compare).toHaveBeenCalledWith(sourceItem, targetItem, { compareBy: 'modifiedAt' });
      expect(result.result).toBe('EQUAL');
    });

    it('should pass compareBy option', () => {
      ContextComparison.compare.mockReturnValue({ result: 'A_NEWER' });
      ContextSync.compare(sourceContainer, targetContainer, { compareBy: 'createdAt' });
      expect(ContextComparison.compare).toHaveBeenCalledWith(sourceContainer, targetContainer, { compareBy: 'createdAt' });
    });
  });

  describe('validateCompatibility', () => {
    it('should return true for same type objects', () => {
      expect(ContextSync.validateCompatibility(sourceItem, targetItem)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceContainer, targetContainer)).toBe(true);
    });

    it('should return false for different type objects', () => {
      expect(ContextSync.validateCompatibility(sourceItem, sourceContainer)).toBe(false);
      expect(ContextSync.validateCompatibility(sourceContainer, sourceContext)).toBe(false);
    });

    it('should return false if either object is null or undefined', () => {
      expect(ContextSync.validateCompatibility(null, targetItem)).toBe(false);
      expect(ContextSync.validateCompatibility(sourceItem, undefined)).toBe(false);
    });
  });

  describe('sync', () => {
    it('should delegate to ContextAutoSync.autoSync for auto operation', async () => {
      ContextAutoSync.autoSync.mockResolvedValue({ success: true, operation: 'auto' });
      const result = await ContextSync.sync(sourceItem, targetItem, 'auto');
      expect(ContextAutoSync.autoSync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('auto');
    });

    it('should delegate to ContextAutoSync.autoSync if autoSync option is true', async () => {
      ContextAutoSync.autoSync.mockResolvedValue({ success: true, operation: 'auto' });
      const result = await ContextSync.sync(sourceItem, targetItem, 'mergeNewerWins', { autoSync: true });
      expect(ContextAutoSync.autoSync).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should delegate to ContextMerger.merge for Context instances', async () => {
      const ContextMerger = (await import('./contextMerger.mjs')).default;
      ContextMerger.merge.mockResolvedValue({ success: true, operation: 'mergeNewerWins' });
      const result = await ContextSync.sync(sourceContext, targetContext, 'mergeNewerWins', { deepSync: false });
      expect(ContextMerger.merge).toHaveBeenCalledWith(
        sourceContext,
        targetContext,
        'mergeNewerWins',
        expect.objectContaining({ compareBy: 'modifiedAt', preserveMetadata: true, createMissing: false })
      );
      expect(result.success).toBe(true);
    });

    it('should call #performLegacySync for non-Context objects', async () => {
      ContextLegacySync.performLegacySync.mockReturnValue({ success: true, operation: 'mergeNewerWins' });
      const result = await ContextSync.sync(sourceItem, targetItem, 'mergeNewerWins');
      expect(ContextLegacySync.performLegacySync).toHaveBeenCalledWith(sourceItem, targetItem, 'mergeNewerWins', {});
      expect(result.success).toBe(true);
    });

    it('should handle all option combinations correctly', async () => {
      const ContextMerger = (await import('./contextMerger.mjs')).default;
      ContextMerger.merge.mockResolvedValue({ success: true, operation: 'mergeNewerWins' });

      // Test deepSync option
      await ContextSync.sync(sourceContext, targetContext, 'mergeNewerWins', { deepSync: false, compareBy: 'createdAt', preserveMetadata: false });
      expect(ContextMerger.merge).toHaveBeenCalledWith(
        sourceContext,
        targetContext,
        'mergeNewerWins',
        expect.objectContaining({ compareBy: 'createdAt', preserveMetadata: false, createMissing: false })
      );

      // Test autoSync option delegation
      ContextAutoSync.autoSync.mockResolvedValue({ success: true, operation: 'auto' });
      await ContextSync.sync(sourceItem, targetItem, 'updateSourceToTarget', { autoSync: true });
      expect(ContextAutoSync.autoSync).toHaveBeenCalledWith(sourceItem, targetItem, expect.objectContaining({ deepSync: true }));
    });

    it('should throw error for unsupported object type combinations', async () => {
      const invalidObject = { foo: 'bar' };
      await expect(ContextSync.sync(invalidObject, targetItem, 'mergeNewerWins')).rejects.toThrow('Unsupported object types for synchronization');
      await expect(ContextSync.sync(sourceItem, invalidObject, 'mergeNewerWins')).rejects.toThrow('Unsupported object types for synchronization');
      await expect(ContextSync.sync(sourceContext, targetItem, 'mergeNewerWins')).rejects.toThrow('Unsupported object types for synchronization');
    });

    it('should handle async errors in ContextMerger delegation', async () => {
      const ContextMerger = (await import('./contextMerger.mjs')).default;
      const error = new Error('ContextMerger sync failed');
      ContextMerger.merge.mockRejectedValue(error);

      await expect(ContextSync.sync(sourceContext, targetContext, 'mergeNewerWins')).rejects.toThrow('ContextMerger sync failed');
    });

    it('should handle async errors in ContextLegacySync delegation', async () => {
      const error = new Error('Legacy sync failed');
      ContextLegacySync.performLegacySync.mockImplementation(() => { throw error; });

      await expect(ContextSync.sync(sourceItem, targetItem, 'mergeNewerWins')).rejects.toThrow('Legacy sync failed');
    });
  });  describe('syncSafe', () => {
    it('should handle null/undefined source and target gracefully', async () => {
      const result = await ContextSync.syncSafe(null, null, 'mergeNewerWins');
      expect(result).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Both source and target are null/undefined'],
        changes: []
      });

      const result2 = await ContextSync.syncSafe(undefined, undefined, 'mergeNewerWins');
      expect(result2).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Both source and target are null/undefined'],
        changes: []
      });
    });

    it('should handle null source with valid target', async () => {
      const result = await ContextSync.syncSafe(null, targetItem, 'mergeNewerWins');
      expect(result).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Source is null/undefined'],
        changes: []
      });

      const result2 = await ContextSync.syncSafe(undefined, targetItem, 'mergeNewerWins');
      expect(result2).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Source is null/undefined'],
        changes: []
      });
    });

    it('should handle valid source with null target', async () => {
      const result = await ContextSync.syncSafe(sourceItem, null, 'mergeNewerWins');
      expect(result).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Target is null/undefined'],
        changes: []
      });

      const result2 = await ContextSync.syncSafe(sourceItem, undefined, 'mergeNewerWins');
      expect(result2).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Target is null/undefined'],
        changes: []
      });
    });

    it('should validate compatibility and return error for incompatible types', async () => {
      const invalidObject = { foo: 'bar' };
      const result = await ContextSync.syncSafe(sourceItem, invalidObject, 'mergeNewerWins');
      expect(result).toEqual({
        success: false,
        operation: 'mergeNewerWins',
        error: 'Incompatible object types: type mismatch between source and target',
        warnings: []
      });

      const result2 = await ContextSync.syncSafe(sourceContext, targetItem, 'mergeNewerWins');
      expect(result2).toEqual({
        success: false,
        operation: 'mergeNewerWins',
        error: 'Incompatible object types: type mismatch between source and target',
        warnings: []
      });
    });

    it('should validate operation and return error for invalid operations', async () => {
      const result = await ContextSync.syncSafe(sourceItem, targetItem, 'invalidOperation');
      expect(result).toEqual({
        success: false,
        operation: 'invalidOperation',
        error: 'Invalid sync operation: invalidOperation',
        warnings: []
      });

      const result2 = await ContextSync.syncSafe(sourceContext, targetContext, 'unknownOp');
      expect(result2).toEqual({
        success: false,
        operation: 'unknownOp',
        error: 'Invalid sync operation: unknownOp',
        warnings: []
      });
    });

    it('should catch and wrap sync errors', async () => {
      const error = new Error('Sync operation failed');
      ContextLegacySync.performLegacySync.mockImplementation(() => { throw error; });

      const result = await ContextSync.syncSafe(sourceItem, targetItem, 'mergeNewerWins');
      expect(result).toEqual({
        success: false,
        operation: 'mergeNewerWins',
        error: 'Sync operation failed',
        warnings: []
      });
    });

    it('should merge warnings from input validation with sync warnings', async () => {
      const syncResult = { success: true, operation: 'mergeNewerWins', warnings: ['Sync warning'] };
      ContextLegacySync.performLegacySync.mockReturnValue(syncResult);

      // Test with null source to generate input validation warning
      const result = await ContextSync.syncSafe(null, targetItem, 'mergeNewerWins');
      expect(result).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Source is null/undefined'],
        changes: []
      });

      // Test with successful sync that has warnings
      const result2 = await ContextSync.syncSafe(sourceItem, targetItem, 'mergeNewerWins');
      expect(result2).toEqual({
        success: true,
        operation: 'mergeNewerWins',
        warnings: ['Sync warning']
      });
    });
  });

  describe('autoSync', () => {
    it('should delegate to ContextAutoSync.autoSync', async () => {
      ContextAutoSync.autoSync.mockResolvedValue({ success: true, operation: 'auto' });
      const result = await ContextSync.autoSync(sourceContainer, targetContainer, { deepSync: true });
      expect(ContextAutoSync.autoSync).toHaveBeenCalledWith(sourceContainer, targetContainer, { deepSync: true });
      expect(result.success).toBe(true);
    });
  });

  describe('private helpers', () => {
    it('should classify object types correctly', () => {
      // #getObjectType is private, but we can test via validateCompatibility
      expect(ContextSync.validateCompatibility(sourceItem, targetItem)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceContainer, targetContainer)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceContext, targetContext)).toBe(true);
      expect(ContextSync.validateCompatibility(sourceItem, sourceContainer)).toBe(false);
    });

    it('should use correct sync class for ContextItem and ContextContainer', async () => {
      // Test that ContextSync properly delegates to ContextLegacySync for different types
      ContextLegacySync.performLegacySync.mockReturnValue({ success: true, operation: 'updateSourceToTarget' });

      // Test with ContextItem
      await ContextSync.sync(sourceItem, targetItem, 'updateSourceToTarget');
      expect(ContextLegacySync.performLegacySync).toHaveBeenCalledWith(sourceItem, targetItem, 'updateSourceToTarget', {});

      // Test with ContextContainer
      await ContextSync.sync(sourceContainer, targetContainer, 'updateSourceToTarget');
      expect(ContextLegacySync.performLegacySync).toHaveBeenCalledWith(sourceContainer, targetContainer, 'updateSourceToTarget', {});
    });

    it('should throw for unsupported object type', async () => {
      const dummy = {};
      await expect(ContextSync.sync(dummy, targetItem, 'updateSourceToTarget')).rejects.toThrow('Unsupported object types for synchronization');
      await expect(ContextSync.sync(sourceItem, dummy, 'mergeNewerWins')).rejects.toThrow('Unsupported object types for synchronization');
    });
  });
});