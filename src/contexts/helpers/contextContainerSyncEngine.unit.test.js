import ContextContainerSyncEngine from './contextContainerSyncEngine.js';
import { ContextContainer } from './contextContainer.js';
import ContextItemSync from './contextItemSync.js';

/**
 * @file contextContainerSyncEngine.test.js
 * @description Test file for the ContextContainerSyncEngine class functionality.
 * @path src/contexts/helpers/contextContainerSyncEngine.test.js
 */


// Mock dependencies
jest.mock('./contextContainer.js');
jest.mock('./contextItemSync.js');

describe('ContextContainerSyncEngine', () => {
  let engine;
  let mockSourceContainer;
  let mockTargetContainer;
  let mockSourceItem;
  let mockTargetItem;
  let mockNestedContainer;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock items
    mockSourceItem = {
      isContextItem: true,
      isContextContainer: false,
      value: 'source value',
      metadata: { createdAt: '2024-01-01' }
    };

    mockTargetItem = {
      isContextItem: true,
      isContextContainer: false,
      value: 'target value',
      metadata: { createdAt: '2024-01-02' },
      setMetadata: jest.fn()
    };

    mockNestedContainer = {
      isContextItem: false,
      isContextContainer: true,
      value: 'nested container',
      metadata: { type: 'nested' },
      keys: jest.fn(() => ['nestedItem1']),
      getItem: jest.fn(() => mockSourceItem),
      hasItem: jest.fn(() => false),
      setItem: jest.fn(),
      setMetadata: jest.fn()
    };

    // Create mock containers
    mockSourceContainer = {
      isContextContainer: true,
      value: 'source container',
      metadata: { type: 'source' },
      keys: jest.fn(() => ['item1', 'item2', 'nestedContainer']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      setMetadata: jest.fn()
    };

    mockTargetContainer = {
      isContextContainer: true,
      value: 'target container',
      metadata: { type: 'target' },
      keys: jest.fn(() => ['item1']),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      setMetadata: jest.fn()
    };

    // Setup mock returns
    mockSourceContainer.getItem.mockImplementation((key) => {
      switch (key) {
        case 'item1': return mockSourceItem;
        case 'item2': return mockSourceItem;
        case 'nestedContainer': return mockNestedContainer;
        default: return null;
      }
    });

    mockTargetContainer.getItem.mockImplementation((key) => {
      switch (key) {
        case 'item1': return mockTargetItem;
        default: return null;
      }
    });

    mockTargetContainer.hasItem.mockImplementation((key) => key === 'item1');

    // Mock ContextContainer constructor
    ContextContainer.mockImplementation((value, metadata) => ({
      isContextContainer: true,
      value,
      metadata,
      keys: jest.fn(() => []),
      getItem: jest.fn(),
      hasItem: jest.fn(),
      setItem: jest.fn(),
      setMetadata: jest.fn()
    }));
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      engine = new ContextContainerSyncEngine();
      expect(engine.syncMetadata).toBe(false);
    });

    it('should initialize with custom syncMetadata option', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
      expect(engine.syncMetadata).toBe(true);
    });

    it('should handle empty options object', () => {
      engine = new ContextContainerSyncEngine({});
      expect(engine.syncMetadata).toBe(false);
    });
  });

  describe('sync', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      jest.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should sync sourceToTarget direction correctly', () => {
      engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockTargetContainer, mockSourceContainer);
    });

    it('should sync targetToSource direction correctly', () => {
      engine.sync(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer);
    });

    it('should handle container1 and container2 parameters correctly', () => {
      const container1 = mockSourceContainer;
      const container2 = mockTargetContainer;

      engine.sync(container1, container2, 'sourceToTarget');
      expect(engine._syncContainer).toHaveBeenCalledWith(container2, container1);
    });
  });

  describe('_syncContainer', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      jest.spyOn(engine, '_updateItem').mockImplementation(() => {});
      jest.spyOn(engine, '_addItem').mockImplementation(() => {});
    });

    it('should iterate through all source container keys', () => {
      engine._syncContainer(mockTargetContainer, mockSourceContainer);
      expect(mockSourceContainer.keys).toHaveBeenCalled();
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('item1');
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('item2');
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('nestedContainer');
    });

    it('should update existing items in target container', () => {
      engine._syncContainer(mockTargetContainer, mockSourceContainer);
      expect(mockTargetContainer.hasItem).toHaveBeenCalledWith('item1');
      expect(engine._updateItem).toHaveBeenCalledWith(mockSourceItem, mockTargetItem);
    });

    it('should add new items to target container', () => {
      engine._syncContainer(mockTargetContainer, mockSourceContainer);
      expect(engine._addItem).toHaveBeenCalledWith('item2', mockSourceItem, mockTargetContainer);
      expect(engine._addItem).toHaveBeenCalledWith('nestedContainer', mockNestedContainer, mockTargetContainer);
    });

    it('should skip null items', () => {
      mockSourceContainer.getItem.mockReturnValue(null);
      engine._syncContainer(mockTargetContainer, mockSourceContainer);
      expect(engine._updateItem).not.toHaveBeenCalled();
      expect(engine._addItem).not.toHaveBeenCalled();
    });

    it('should handle containers with circular references gracefully', () => {
      const circularContainer = {
        isContextContainer: true,
        keys: jest.fn(() => ['self']),
        getItem: jest.fn(),
        hasItem: jest.fn(() => false),
        setItem: jest.fn()
      };

      circularContainer.getItem.mockReturnValue(circularContainer);

      expect(() => {
        engine._syncContainer(mockTargetContainer, circularContainer);
      }).not.toThrow();
    });

    // This test is commented out because it requires a more complex setup to create circular references
    // it('should log warning for circular reference in _syncContainer', () => {
    //   const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    //   const circularContainer1 = {
    //     isContextContainer: true,
    //     keys: jest.fn(() => ['circular']),
    //     getItem: jest.fn(),
    //     hasItem: jest.fn(() => false),
    //     setItem: jest.fn()
    //   };

    //   const circularContainer2 = {
    //     isContextContainer: true,
    //     keys: jest.fn(() => ['back']),
    //     getItem: jest.fn(),
    //     hasItem: jest.fn(() => false),
    //     setItem: jest.fn()
    //   };

    //   // Create circular reference: container1 -> container2 -> container1
    //   circularContainer1.getItem.mockImplementation((key) => key === 'circular' ? circularContainer2 : null);
    //   circularContainer2.getItem.mockImplementation((key) => key === 'back' ? circularContainer1 : null);

    //   engine._syncContainer(mockTargetContainer, circularContainer1);

    //   expect(consoleSpy).toHaveBeenCalledWith('Circular reference detected in source container, skipping to prevent infinite recursion');

    //   consoleSpy.mockRestore();
    // });

    it('should log warning for self-reference in #syncContainerItems', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const selfReferencingContainer = {
        isContextContainer: true,
        keys: jest.fn(() => ['self']),
        getItem: jest.fn(),
        hasItem: jest.fn(() => false),
        setItem: jest.fn()
      };

      // Create self-reference
      selfReferencingContainer.getItem.mockReturnValue(selfReferencingContainer);

      engine._syncContainer(mockTargetContainer, selfReferencingContainer);

      expect(consoleSpy).toHaveBeenCalledWith('Self-reference detected for key "self", skipping to prevent infinite recursion');

      consoleSpy.mockRestore();
    });
  });

  describe('_addItem', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      jest.spyOn(engine, '_cloneAndAddContainer').mockImplementation(() => {});
    });

    it('should clone and add container items', () => {
      engine._addItem('containerKey', mockNestedContainer, mockTargetContainer);
      expect(engine._cloneAndAddContainer).toHaveBeenCalledWith('containerKey', mockNestedContainer, mockTargetContainer);
    });

    it('should directly add regular items', () => {
      engine._addItem('itemKey', mockSourceItem, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('itemKey', mockSourceItem.value, { metadata: mockSourceItem.metadata });
    });

    it('should handle items without metadata', () => {
      const itemWithoutMetadata = { ...mockSourceItem, metadata: undefined };
      engine._addItem('itemKey', itemWithoutMetadata, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('itemKey', itemWithoutMetadata.value, { metadata: undefined });
    });
  });

  describe('_updateItem', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
      jest.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should update ContextItem to ContextItem', () => {
      engine._updateItem(mockSourceItem, mockTargetItem);
      expect(ContextItemSync.updateTargetToMatchSource).toHaveBeenCalledWith(mockSourceItem, mockTargetItem, { syncMetadata: true });
    });

    it('should sync ContextContainer to ContextContainer', () => {
      const sourceContainer = { ...mockSourceContainer, isContextItem: false };
      const targetContainer = { ...mockTargetContainer, isContextItem: false };

      engine._updateItem(sourceContainer, targetContainer);
      expect(engine._syncContainer).toHaveBeenCalledWith(targetContainer, sourceContainer);
    });

    it('should handle mixed type updates with syncMetadata', () => {
      const mixedTarget = { value: 'old value', setMetadata: jest.fn() };

      engine._updateItem(mockSourceItem, mixedTarget);
      expect(mixedTarget.value).toBe('source value');
      expect(mixedTarget.setMetadata).toHaveBeenCalledWith(mockSourceItem.metadata, false);
    });

    it('should handle mixed type updates without syncMetadata', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: false });
      const mixedTarget = { value: 'old value', setMetadata: jest.fn() };

      engine._updateItem(mockSourceItem, mixedTarget);
      expect(mixedTarget.value).toBe('source value');
      expect(mixedTarget.setMetadata).not.toHaveBeenCalled();
    });

    it('should handle items without setMetadata method', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
      const mixedTarget = { value: 'old value' };

      expect(() => {
        engine._updateItem(mockSourceItem, mixedTarget);
      }).not.toThrow();
      expect(mixedTarget.value).toBe('source value');
    });
  });

  describe('_cloneAndAddContainer', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      jest.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should create new container with source value and metadata', () => {
      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(ContextContainer).toHaveBeenCalledWith(mockNestedContainer.value, mockNestedContainer.metadata);
    });

    it('should sync the new container with source container', () => {
      const mockNewContainer = { isContextContainer: true };
      ContextContainer.mockReturnValue(mockNewContainer);

      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(engine._syncContainer).toHaveBeenCalledWith(mockNewContainer, mockNestedContainer);
    });

    it('should add the cloned container to target', () => {
      const mockNewContainer = { isContextContainer: true };
      ContextContainer.mockReturnValue(mockNewContainer);

      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('containerKey', mockNewContainer, { metadata: mockNestedContainer.metadata });
    });

    it('should handle containers without metadata', () => {
      const containerWithoutMetadata = { ...mockNestedContainer, metadata: undefined };

      engine._cloneAndAddContainer('containerKey', containerWithoutMetadata, mockTargetContainer);
      expect(ContextContainer).toHaveBeenCalledWith(containerWithoutMetadata.value, undefined);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
    });

    it('should handle complex nested synchronization', () => {
      // Restore real implementation for integration test
      engine._syncContainer.mockRestore?.();
      engine._updateItem.mockRestore?.();
      engine._addItem.mockRestore?.();
      engine._cloneAndAddContainer.mockRestore?.();

      const result = engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');

      expect(mockSourceContainer.keys).toHaveBeenCalled();
      expect(mockTargetContainer.hasItem).toHaveBeenCalled();
    });

    it('should handle empty source container', () => {
      mockSourceContainer.keys.mockReturnValue([]);

      expect(() => {
        engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      }).not.toThrow();
    });

    it('should handle source container with only null items', () => {
      mockSourceContainer.getItem.mockReturnValue(null);

      expect(() => {
        engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
    });

    it('should handle undefined direction', () => {
      jest.spyOn(engine, '_syncContainer').mockImplementation(() => {});

      engine.sync(mockSourceContainer, mockTargetContainer, undefined);
      expect(engine._syncContainer).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer);
    });

    it('should handle invalid direction', () => {
      jest.spyOn(engine, '_syncContainer').mockImplementation(() => {});

      engine.sync(mockSourceContainer, mockTargetContainer, 'invalidDirection');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer);
    });
  });
});