import ContextContainerSync from './contextContainerSync.js';
import ContextContainerSyncEngine from './contextContainerSyncEngine.js';
import ContextComparison from './contextComparison.js';

/**
 * @file contextContainerSync.test.js
 * @description Test file for the ContextContainerSync class functionality.
 * @path src/contexts/helpers/contextContainerSync.test.js
 */

// Mock dependencies
jest.mock('./contextContainer.js');
jest.mock('./contextItem.js');
jest.mock('./contextComparison.js');

// Mock the ContextContainerSyncEngine and its instance methods
const mockSync = jest.fn();
jest.mock('./contextContainerSyncEngine.js', () => {
  return jest.fn().mockImplementation((options) => ({
    ...options,
    sync: mockSync,
  }));
});

describe('ContextContainerSync', () => {
  let mockSourceContainer;
  let mockTargetContainer;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock ContextContainer instances
    mockSourceContainer = {
      value: 'source container',
      metadata: { createdAt: '2024-01-01', modifiedAt: '2024-01-02' },
      keys: jest.fn(() => ['item1', 'item2']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      setMetadata: jest.fn(),
    };

    mockTargetContainer = {
      value: 'target container',
      metadata: { createdAt: '2024-01-03', modifiedAt: '2024-01-04' },
      keys: jest.fn(() => ['item1']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      setMetadata: jest.fn(),
    };
  });

  describe('updateSourceToMatchTarget', () => {
    it('should delegate to ContextContainerSyncEngine for deep sync', () => {
      const result = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerSync', direction: 'sourceToTarget' }]);
    });

    it('should perform shallow sync when deepSync is false', () => {
      const result = ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer, { deepSync: false });

      expect(mockSync).not.toHaveBeenCalled();
      expect(mockSourceContainer.value).toBe('target container');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerValue', to: 'target container' }]);
    });

    it('should pass syncMetadata option to the engine', () => {
      ContextContainerSync.updateSourceToMatchTarget(mockSourceContainer, mockTargetContainer, { syncMetadata: false });

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: false });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
    });
  });

  describe('updateTargetToMatchSource', () => {
    it('should delegate to ContextContainerSyncEngine for deep sync', () => {
      const result = ContextContainerSync.updateTargetToMatchSource(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerSync', direction: 'targetToSource' }]);
    });

    it('should perform shallow sync when deepSync is false', () => {
      const result = ContextContainerSync.updateTargetToMatchSource(mockSourceContainer, mockTargetContainer, { deepSync: false });

      expect(mockSync).not.toHaveBeenCalled();
      expect(mockTargetContainer.value).toBe('source container');
      expect(result.success).toBe(true);
      expect(result.changes).toEqual([{ type: 'containerValue', to: 'source container' }]);
    });
  });

  describe('mergeNewerWins', () => {
    beforeEach(() => {
      ContextComparison.COMPARISON_RESULTS = {
        SOURCE_NEWER: 'source_newer',
        TARGET_NEWER: 'target_newer',
        EQUAL: 'equal',
      };
    });

    it('should update target when source is newer', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER });
      ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
    });

    it('should update source when target is newer', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.TARGET_NEWER });
      ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
    });

    it('should do nothing when containers are equal', () => {
      ContextComparison.compare.mockReturnValue({ result: ContextComparison.COMPARISON_RESULTS.EQUAL });
      const result = ContextContainerSync.mergeNewerWins(mockSourceContainer, mockTargetContainer);

      expect(mockSync).not.toHaveBeenCalled();
      expect(result.message).toBe('Containers are equal, no merge needed');
    });
  });

  describe('mergeWithPriority', () => {
    it('should update target when priority is source', () => {
      ContextContainerSync.mergeWithPriority(mockSourceContainer, mockTargetContainer, 'source');

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'targetToSource');
    });

    it('should update source when priority is target', () => {
      ContextContainerSync.mergeWithPriority(mockSourceContainer, mockTargetContainer, 'target');

      expect(ContextContainerSyncEngine).toHaveBeenCalledWith({ syncMetadata: true });
      expect(mockSync).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
    });
  });
});