/**
 * @file contextLegacySync.unit.test.js
 * @description Unit tests for the ContextLegacySync class functionality.
 * @path src/contexts/helpers/contextLegacySync.unit.test.js

 */

import ContextLegacySync from './contextLegacySync.js';
import { ContextContainer } from './contextContainer.js';
import { ContextItem } from './contextItem.js';
import ContextItemSync from './contextItemSync.js';
import ContextContainerSync from './contextContainerSync.js';

// Mock the sync classes
jest.mock('./contextItemSync.js');
jest.mock('./contextContainerSync.js');

describe('ContextLegacySync', () => {
  let mockContainer;
  let mockItem;

  beforeEach(() => {
    mockContainer = new ContextContainer({ data: 'test' });
    mockItem = new ContextItem('test value');

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('SYNC_OPERATIONS constants', () => {
    it('should have all expected sync operation constants', () => {
      expect(ContextLegacySync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET).toBe('updateSourceToTarget');
      expect(ContextLegacySync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE).toBe('updateTargetToSource');
      expect(ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS).toBe('mergeNewerWins');
      expect(ContextLegacySync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY).toBe('mergeSourcePriority');
      expect(ContextLegacySync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY).toBe('mergeTargetPriority');
      expect(ContextLegacySync.SYNC_OPERATIONS.NO_ACTION).toBe('noAction');
    });
  });

  describe('performLegacySync', () => {
    it('should delegate UPDATE_SOURCE_TO_TARGET to appropriate sync class', () => {
      const mockResult = { success: true, operation: 'updateSourceToTarget' };
      ContextContainerSync.updateSourceToTarget.mockReturnValue(mockResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(ContextContainerSync.updateSourceToTarget).toHaveBeenCalledWith(
        mockContainer,
        mockContainer,
        {}
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate UPDATE_TARGET_TO_SOURCE to appropriate sync class', () => {
      const mockResult = { success: true, operation: 'updateTargetToSource' };
      ContextItemSync.updateTargetToSource.mockReturnValue(mockResult);

      const result = ContextLegacySync.performLegacySync(
        mockItem,
        mockItem,
        ContextLegacySync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE
      );

      expect(ContextItemSync.updateTargetToSource).toHaveBeenCalledWith(
        mockItem,
        mockItem,
        {}
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate MERGE_NEWER_WINS to appropriate sync class', () => {
      const mockResult = { success: true, operation: 'mergeNewerWins' };
      ContextContainerSync.mergeNewerWins.mockReturnValue(mockResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(ContextContainerSync.mergeNewerWins).toHaveBeenCalledWith(
        mockContainer,
        mockContainer,
        {}
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate MERGE_SOURCE_PRIORITY to appropriate sync class', () => {
      const mockResult = { success: true, operation: 'mergeSourcePriority' };
      ContextItemSync.mergeWithPriority.mockReturnValue(mockResult);

      const result = ContextLegacySync.performLegacySync(
        mockItem,
        mockItem,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY
      );

      expect(ContextItemSync.mergeWithPriority).toHaveBeenCalledWith(
        mockItem,
        mockItem,
        'source',
        {}
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate MERGE_TARGET_PRIORITY to appropriate sync class', () => {
      const mockResult = { success: true, operation: 'mergeTargetPriority' };
      ContextContainerSync.mergeWithPriority.mockReturnValue(mockResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY
      );

      expect(ContextContainerSync.mergeWithPriority).toHaveBeenCalledWith(
        mockContainer,
        mockContainer,
        'target',
        {}
      );
      expect(result).toEqual(mockResult);
    });

    it('should return error result if syncClass.updateSourceToTarget fails', () => {
      const errorResult = { success: false, message: 'SyncClass updateSourceToTarget failed', changes: [] };
      ContextContainerSync.updateSourceToTarget.mockReturnValue(errorResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET
      );

      expect(result).toEqual(errorResult);
      expect(result.success).toBe(false);
    });

    it('should return error result if syncClass.updateTargetToSource fails', () => {
      const errorResult = { success: false, message: 'SyncClass updateTargetToSource failed', changes: [] };
      ContextItemSync.updateTargetToSource.mockReturnValue(errorResult);

      const result = ContextLegacySync.performLegacySync(
        mockItem,
        mockItem,
        ContextLegacySync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE
      );

      expect(result).toEqual(errorResult);
      expect(result.success).toBe(false);
    });

    it('should return error result if syncClass.mergeNewerWins fails', () => {
      const errorResult = { success: false, message: 'SyncClass mergeNewerWins failed', changes: [] };
      ContextContainerSync.mergeNewerWins.mockReturnValue(errorResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS
      );

      expect(result).toEqual(errorResult);
      expect(result.success).toBe(false);
    });

    it('should return error result if syncClass.mergeWithPriority fails (source priority)', () => {
      const errorResult = { success: false, message: 'SyncClass mergeWithPriority failed', changes: [] };
      ContextItemSync.mergeWithPriority.mockReturnValue(errorResult);

      const result = ContextLegacySync.performLegacySync(
        mockItem,
        mockItem,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY
      );

      expect(result).toEqual(errorResult);
      expect(result.success).toBe(false);
    });

    it('should return error result if syncClass.mergeWithPriority fails (target priority)', () => {
      const errorResult = { success: false, message: 'SyncClass mergeWithPriority failed', changes: [] };
      ContextContainerSync.mergeWithPriority.mockReturnValue(errorResult);

      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY
      );

      expect(result).toEqual(errorResult);
      expect(result.success).toBe(false);
    });

    it('should handle NO_ACTION operation', () => {
      const result = ContextLegacySync.performLegacySync(
        mockContainer,
        mockContainer,
        ContextLegacySync.SYNC_OPERATIONS.NO_ACTION
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('No synchronization performed');
      expect(result.operation).toBe('noAction');
      expect(result.changes).toEqual([]);
      expect(result.comparison).toBeDefined();
    });

    it('should throw error for unknown operation', () => {
      expect(() => {
        ContextLegacySync.performLegacySync(
          mockContainer,
          mockContainer,
          'unknownOperation'
        );
      }).toThrow('Unknown synchronization operation: unknownOperation');
    });

    it('should throw error for unsupported object type', () => {
      const unsupportedObject = { unsupported: true };

      expect(() => {
        ContextLegacySync.performLegacySync(
          unsupportedObject,
          mockContainer,
          ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS
        );
      }).toThrow('Unsupported object type for synchronization');
    });
  });

  describe('validateCompatibility', () => {
    it('should return true for compatible ContextContainer objects', () => {
      const container1 = new ContextContainer({ data: 'test1' });
      const container2 = new ContextContainer({ data: 'test2' });

      const result = ContextLegacySync.validateCompatibility(container1, container2);
      expect(result).toBe(true);
    });

    it('should return true for compatible ContextItem objects', () => {
      const item1 = new ContextItem('value1');
      const item2 = new ContextItem('value2');

      const result = ContextLegacySync.validateCompatibility(item1, item2);
      expect(result).toBe(true);
    });

    it('should return false for incompatible object types', () => {
      const container = new ContextContainer({ data: 'test' });
      const item = new ContextItem('test value');

      const result = ContextLegacySync.validateCompatibility(container, item);
      expect(result).toBe(false);
    });

    it('should return false when source is null', () => {
      const result = ContextLegacySync.validateCompatibility(null, mockContainer);
      expect(result).toBe(false);
    });

    it('should return false when target is null', () => {
      const result = ContextLegacySync.validateCompatibility(mockContainer, null);
      expect(result).toBe(false);
    });

    it('should return false when both are null', () => {
      const result = ContextLegacySync.validateCompatibility(null, null);
      expect(result).toBe(false);
    });

    it('should handle unknown object types gracefully', () => {
      const unknownObject = { unknown: true };
      const result = ContextLegacySync.validateCompatibility(unknownObject, mockContainer);
      expect(result).toBe(false);
    });
  });
});
