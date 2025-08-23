/**
 * @file contextItemSync.unit.test.js
 * @description Unit tests for the ContextItemSync class functionality.
 * @path src/contexts/helpers/contextItemSync.unit.test.js

 */

import { ContextItemSync } from './contextItemSync.js';
import { ContextItem } from './contextItem.js';
import ContextComparison from './contextComparison.js';


// Mock the dependencies
jest.mock('./contextItem.js');
jest.mock('./contextComparison.js');

describe('ContextItemSync', () => {
  let mockSource;
  let mockTarget;
  let consoleSpy;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock ContextItem instances
    mockSource = {
      value: 'source value',
      metadata: { createdAt: '2024-01-01', modifiedAt: '2024-01-02' },
      setMetadata: jest.fn()
    };

    mockTarget = {
      value: 'target value',
      metadata: { createdAt: '2024-01-03', modifiedAt: '2024-01-04' },
      setMetadata: jest.fn()
    };

    // Mock console methods
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    // Restore console methods
    consoleSpy.debug.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  describe('updateTargetToMatchSource', () => {
    it('should update target value to match source value', () => {
      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toBe('source value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('target item updated to match source');
      expect(result.operation).toBe('updateTargetToMatchSource');
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0].type).toBe('value');
      expect(result.changes[0].from).toBe('target value');
      expect(result.changes[0].to).toBe('source value');
    });

    it('should sync metadata by default', () => {
      ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.setMetadata).toHaveBeenCalledWith(mockSource.metadata, false);
    });

    it('should not sync metadata when syncMetadata is false', () => {
      ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget, { syncMetadata: false });

      expect(mockTarget.setMetadata).not.toHaveBeenCalled();
    });

    it('should log debug messages during update', () => {
      ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(consoleSpy.debug).toHaveBeenCalledWith('Updating target item value from target value to source value');
      expect(consoleSpy.debug).toHaveBeenCalledWith('Preserving item metadata:', mockSource.metadata);
    });

    it('should handle complex object values', () => {
      mockSource.value = { nested: { data: 'complex' } };

      ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toEqual({ nested: { data: 'complex' } });
      expect(mockTarget.value).not.toBe(mockSource.value); // Should be deep cloned
    });
  });

  describe('updateSourceToMatchTarget', () => {
    it('should update source value to match target value', () => {
      const result = ContextItemSync.updateSourceToMatchTarget(mockSource, mockTarget);

      expect(mockSource.value).toBe('target value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('source item updated to match target');
      expect(result.operation).toBe('updateSourceToMatchTarget');
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0].type).toBe('value');
      expect(result.changes[0].from).toBe('source value');
      expect(result.changes[0].to).toBe('target value');
    });

    it('should sync metadata by default', () => {
      ContextItemSync.updateSourceToMatchTarget(mockSource, mockTarget);

      expect(mockSource.setMetadata).toHaveBeenCalledWith(mockTarget.metadata, false);
    });

    it('should not sync metadata when syncMetadata is false', () => {
      ContextItemSync.updateSourceToMatchTarget(mockSource, mockTarget, { syncMetadata: false });

      expect(mockSource.setMetadata).not.toHaveBeenCalled();
    });

    it('should log debug messages during update', () => {
      ContextItemSync.updateSourceToMatchTarget(mockSource, mockTarget);

      expect(consoleSpy.debug).toHaveBeenCalledWith('Updating source item value from source value to target value');
      expect(consoleSpy.debug).toHaveBeenCalledWith('Preserving item metadata:', mockTarget.metadata);
    });
  });

  describe('mergeNewerWins', () => {
    beforeEach(() => {
      ContextComparison.COMPARISON_RESULTS = {
        CONTAINER_A_NEWER: 'containerANewer',
        CONTAINER_B_NEWER: 'containerBNewer',
        EQUAL: 'equal'
      };
    });

    it('should update target when source is newer', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER
      });

      const result = ContextItemSync.mergeNewerWins(mockSource, mockTarget);

      expect(mockTarget.value).toBe('source value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('target item updated to match source');
      expect(result.operation).toBe('mergeNewerWins');
    });

    it('should update source when target is newer', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER
      });

      const result = ContextItemSync.mergeNewerWins(mockSource, mockTarget);

      expect(mockSource.value).toBe('target value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('source item updated to match target');
      expect(result.operation).toBe('mergeNewerWins');
    });

    it('should not update when items are equal', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.EQUAL
      });

      const result = ContextItemSync.mergeNewerWins(mockSource, mockTarget);

      expect(mockSource.value).toBe('source value');
      expect(mockTarget.value).toBe('target value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Items are equal, no merge needed');
      expect(result.operation).toBe('mergeNewerWins');
      expect(result.changes).toEqual([]);
    });

    it('should use modifiedAt by default for comparison', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.EQUAL
      });

      ContextItemSync.mergeNewerWins(mockSource, mockTarget);

      expect(ContextComparison.compare).toHaveBeenCalledWith(mockSource, mockTarget, { compareBy: 'modifiedAt' });
    });

    it('should use custom compareBy option', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.EQUAL
      });

      ContextItemSync.mergeNewerWins(mockSource, mockTarget, { compareBy: 'createdAt' });

      expect(ContextComparison.compare).toHaveBeenCalledWith(mockSource, mockTarget, { compareBy: 'createdAt' });
    });

    it('should pass syncMetadata option to update methods', () => {
      ContextComparison.compare.mockReturnValue({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER
      });

      ContextItemSync.mergeNewerWins(mockSource, mockTarget, { syncMetadata: false });

      expect(mockTarget.setMetadata).not.toHaveBeenCalled();
    });
  });

  describe('mergeWithPriority', () => {
    it('should update target when priority is source', () => {
      const result = ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'source');

      expect(mockTarget.value).toBe('source value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('target item updated to match source');
      expect(result.operation).toBe('mergeWithPriority');
    });

    it('should update source when priority is target', () => {
      const result = ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'target');

      expect(mockSource.value).toBe('target value');
      expect(result.success).toBe(true);
      expect(result.message).toBe('source item updated to match target');
      expect(result.operation).toBe('mergeWithPriority');
    });

    it('should handle invalid priority', () => {
      const result = ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'invalid');

      expect(mockSource.value).toBe('source value');
      expect(mockTarget.value).toBe('target value');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid priority: "invalid". Must be \'source\' or \'target\'.');
      expect(result.operation).toBe('mergeWithPriority');
      expect(result.changes).toEqual([]);
    });

    it('should log warning for invalid priority', () => {
      ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'invalid');

      expect(consoleSpy.warn).toHaveBeenCalledWith('Invalid priority: "invalid". Must be \'source\' or \'target\'.');
    });

    it('should pass syncMetadata option to update methods', () => {
      ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'source', { syncMetadata: false });

      expect(mockTarget.setMetadata).not.toHaveBeenCalled();
    });

    it('should sync metadata by default', () => {
      ContextItemSync.mergeWithPriority(mockSource, mockTarget, 'source');

      expect(mockTarget.setMetadata).toHaveBeenCalledWith(mockSource.metadata, false);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      mockSource.value = null;

      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toBeNull();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });

    it('should handle undefined values', () => {
      mockSource.value = undefined;

      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toBeUndefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });

    it('should handle empty object values', () => {
      mockSource.value = {};

      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toEqual({});
      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });

    it('should handle array values', () => {
      mockSource.value = [1, 2, 3];

      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.value).toEqual([1, 2, 3]);
      expect(mockTarget.value).not.toBe(mockSource.value); // Should be deep cloned
      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });

    it('should handle items with missing metadata', () => {
      mockSource.metadata = undefined;

      const result = ContextItemSync.updateTargetToMatchSource(mockSource, mockTarget);

      expect(mockTarget.setMetadata).toHaveBeenCalledWith(undefined, false);
      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });
  });

  describe('alias methods', () => {
    it('should have an alias for updateTargetToMatchSource', () => {
      const result = ContextItemSync.updateDestinationToMatchOrigin(mockSource, mockTarget);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateDestinationToMatchOrigin');
      expect(mockTarget.value).toBe('source value');
    });

    it('should have an alias for updateSourceToMatchTarget', () => {
      const result = ContextItemSync.updateOriginToMatchDestination(mockSource, mockTarget);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateOriginToMatchDestination');
      expect(mockSource.value).toBe('target value');
    });

    it('should have an alias for updateSourceToTarget', () => {
      const result = ContextItemSync.updateSourceToTarget(mockSource, mockTarget);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateSourceToTarget');
      expect(mockTarget.value).toBe('source value');
    });

    it('should have an alias for updateTargetToSource', () => {
      const result = ContextItemSync.updateTargetToSource(mockSource, mockTarget);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updateTargetToSource');
      expect(mockSource.value).toBe('target value');
    });
  });
});