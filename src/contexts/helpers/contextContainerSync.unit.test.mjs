/**
 * @file contextContainerSync.unit.test.mjs
 * @description Unit tests for the ContextContainerSync class.
 * @path src/contexts/helpers/contextContainerSync.unit.test.mjs

 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ContextContainerSync from './contextContainerSync.mjs';
import ContextContainerSyncEngine from './contextContainerSyncEngine.mjs';
import ContextComparison from './contextComparison.mjs';

function loadAlias(relativePath) {
  return async () => import(new URL(relativePath, import.meta.url).href);
}

vi.mock('@utils/static/validator.mjs', loadAlias('../../utils/static/validator.mjs'));
vi.mock('@helpers/pathUtils.mjs', loadAlias('../../helpers/pathUtils.mjs'));
vi.mock('@config', loadAlias('../../config/config.mjs'));
vi.mock('@constants', loadAlias('../../config/constants.mjs'));
vi.mock('@manifest', loadAlias('../../config/manifest.mjs'));

// Mock dependencies
vi.mock('./contextContainer.mjs');
vi.mock('./contextItem.mjs');
vi.mock('./contextComparison.mjs');

// Mock the ContextContainerSyncEngine and its instance methods
const mockSync = vi.fn();
vi.mock('./contextContainerSyncEngine.mjs', () => ({
  default: vi.fn().mockImplementation((options) => ({
    ...options,
    sync: mockSync,
  }))
}));

describe('ContextContainerSync', () => {
  let mockSourceContainer;
  let mockTargetContainer;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock ContextContainer instances
    mockSourceContainer = {
      value: 'source container',
      metadata: { createdAt: '2024-01-01', modifiedAt: '2024-01-02' },
      keys: vi.fn(() => ['item1', 'item2']),
      getItem: vi.fn(),
      hasItem: vi.fn(),
      setItem: vi.fn(),
      setMetadata: vi.fn(),
    };

    mockTargetContainer = {
      value: 'target container',
      metadata: { createdAt: '2024-01-03', modifiedAt: '2024-01-04' },
      keys: vi.fn(() => ['item1']),
      getItem: vi.fn(),
      hasItem: vi.fn(),
      setItem: vi.fn(),
      setMetadata: vi.fn(),
    };
  });

  describe('updateSourceToMatchTarget', () => {
    it('should delegate to ContextContainerSyncEngine for deep sync', () => {
      const result = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerSync', direction: 'targetToSource' }]);
      expect(result.operation).toBe('updateSourceToMatchTarget');
    });

    it('should perform shallow sync when deepSync is false', () => {
      const result = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer, { deepSync: false });

      expect(mockSync).not.toHaveBeenCalled();
      expect(mockSourceContainer.value).toBe('target container');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerValue', to: 'target container' }]);
      expect(result.operation).toBe('updateSourceToMatchTarget');
    });

    it('should pass syncMetadata option to the engine', () => {
      const result = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer, { syncMetadata: false });

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: false });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(result.operation).toBe('updateSourceToMatchTarget');
    });
  });

  describe('updateTargetToMatchSource', () => {
    it('should delegate to ContextContainerSyncEngine for deep sync', () => {
      const result = ContextContainerSync.updateTargetToMatchSource(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerSync', direction: 'sourceToTarget' }]);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });

    it('should perform shallow sync when deepSync is false', () => {
      const result = ContextContainerSync.updateTargetToMatchSource(mockSourceContainer, mockTargetContainer, { deepSync: false });

      expect(mockSync).not.toHaveBeenCalled();
      expect(mockTargetContainer.value).toBe('source container');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerValue', to: 'source container' }]);
      expect(result.operation).toBe('updateTargetToMatchSource');
    });
  });

  describe('mergeNewerWins', () => {
    beforeEach(() => {
      ContextComparison.COMPARISON_RESULTS = {
        CONTAINER_A_NEWER: 'containerANewer',
        CONTAINER_B_NEWER: 'containerBNewer',
        EQUAL: 'equal',
      };
    });

    it('should update target when source is newer', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER });
      const result = ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(result.operation).toBe('mergeNewerWins');
    });

    it('should update source when target is newer', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER });
      const result = ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(result.operation).toBe('mergeNewerWins');
    });

    it('should do nothing when containers are equal', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.EQUAL });
      const result = ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(mockSync).not.toHaveBeenCalled();
      expect(result.message).toBe('Containers are equal, no merge needed');
      expect(result.operation).toBe('mergeNewerWins');
    });
  });

  describe('mergeWithPriority', () => {
    it('should update target when priority is source', () => {
      const result = ContextContainerSync.mergeWithPriority(mockSourceContainer, mockTargetContainer, 'source');

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(result.operation).toBe('mergeWithPriority');
    });

    it('should update source when priority is target', () => {
      const result = ContextContainerSync.mergeWithPriority(mockSourceContainer, mockTargetContainer, 'target');

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(result.operation).toBe('mergeWithPriority');
    });
  });

  describe('alias methods', () => {
    it('should alias updateSourceToTarget to updateTargetToMatchSource', () => {
      const result = ContextContainerSync.updateSourceToTarget(mockSourceContainer, mockTargetContainer);
      const expected = ContextContainerSync.updateTargetToMatchSource(mockSourceContainer, mockTargetContainer);
      expect(result).toEqual({ ...expected, operation: 'updateSourceToTarget' });
    });

    it('should alias updateTargetToSource to updateSourceToMatchTarget', () => {
      const result = ContextContainerSync.updateTargetToSource(mockSourceContainer, mockTargetContainer);
      const expected = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer);
      expect(result).toEqual({ ...expected, operation: 'updateTargetToSource' });
    });
  });
});