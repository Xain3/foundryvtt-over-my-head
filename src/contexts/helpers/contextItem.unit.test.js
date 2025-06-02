import { ContextItem } from './contextItem.js';

/**
 * @file contextItem.unit.test.js
 * @description This file contains tests for the ContextItem class.
 * @path src/contexts/helpers/contextItem.unit.test.js
 */


describe('ContextItem', () => {
  let contextItem;
  let initialValue;
  let metadata;

  beforeEach(() => {
    initialValue = 'test value';
    metadata = { type: 'string', source: 'test' };
    contextItem = new ContextItem(initialValue, metadata);
  });

  describe('constructor', () => {
    it('should create a ContextItem with initial value', () => {
      expect(contextItem.value).toBe(initialValue);
    });

    it('should create a ContextItem with metadata', () => {
      expect(contextItem.metadata).toEqual(metadata);
    });

    it('should create a ContextItem with default empty metadata', () => {
      const item = new ContextItem('test');
      expect(item.metadata).toEqual({});
    });

    it('should set timestamps on creation', () => {
      const beforeCreation = new Date();
      const item = new ContextItem('test');
      const afterCreation = new Date();

      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.modifiedAt).toBeInstanceOf(Date);
      expect(item.lastAccessedAt).toBeInstanceOf(Date);
      expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(item.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should set default access recording options', () => {
      const item = new ContextItem('test');
      expect(item.recordAccess).toBe(true);
      expect(item.recordAccessForMetadata).toBe(false);
    });

    it('should respect custom access recording options', () => {
      const item = new ContextItem('test', {}, { recordAccess: false, recordAccessForMetadata: true });
      expect(item.recordAccess).toBe(false);
      expect(item.recordAccessForMetadata).toBe(true);
    });

    it('should create unfrozen item by default', () => {
      const item = new ContextItem('test');
      expect(item.isFrozen()).toBe(false);
    });

    it('should create frozen item when frozen option is true', () => {
      const item = new ContextItem('test', {}, { frozen: true });
      expect(item.isFrozen()).toBe(true);
    });
  });

  describe('value getter', () => {
    it('should return the current value', () => {
      expect(contextItem.value).toBe(initialValue);
    });

    it('should update lastAccessedAt when recordAccess is true', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;

      // Add small delay to ensure timestamp difference
      setTimeout(() => {
        contextItem.value;
        expect(contextItem.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should not update lastAccessedAt when recordAccess is false', () => {
      const item = new ContextItem('test', {}, { recordAccess: false });
      const originalLastAccessed = item.lastAccessedAt;

      setTimeout(() => {
        item.value;
        expect(item.lastAccessedAt).toBe(originalLastAccessed);
      }, 10);
    });
  });

  describe('value setter', () => {
    it('should set a new value', () => {
      const newValue = 'new test value';
      contextItem.value = newValue;
      expect(contextItem.value).toBe(newValue);
    });

    it('should update modifiedAt timestamp', () => {
      const originalModified = contextItem.modifiedAt;

      setTimeout(() => {
        contextItem.value = 'new value';
        expect(contextItem.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });

    it('should update lastAccessedAt timestamp', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;

      setTimeout(() => {
        contextItem.value = 'new value';
        expect(contextItem.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should throw error when trying to set value on frozen item', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.value = 'new value';
      }).toThrow('Cannot modify a frozen ContextItem.');
    });
  });

  describe('timestamp getters', () => {
    it('should return createdAt without updating lastAccessedAt', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;
      const createdAt = contextItem.createdAt;
      expect(createdAt).toBeInstanceOf(Date);
      expect(contextItem.lastAccessedAt).toBe(originalLastAccessed);
    });

    it('should return modifiedAt without updating lastAccessedAt', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;
      const modifiedAt = contextItem.modifiedAt;
      expect(modifiedAt).toBeInstanceOf(Date);
      expect(contextItem.lastAccessedAt).toBe(originalLastAccessed);
    });

    it('should return lastAccessedAt without updating it', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;
      const lastAccessedAt = contextItem.lastAccessedAt;
      expect(lastAccessedAt).toBeInstanceOf(Date);
      expect(contextItem.lastAccessedAt).toBe(originalLastAccessed);
    });
  });

  describe('metadata getter', () => {
    it('should return metadata object', () => {
      expect(contextItem.metadata).toEqual(metadata);
    });

    it('should update lastAccessedAt when recordAccessForMetadata is true', () => {
      const item = new ContextItem('test', metadata, { recordAccessForMetadata: true });
      const originalLastAccessed = item.lastAccessedAt;

      setTimeout(() => {
        item.metadata;
        expect(item.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should not update lastAccessedAt when recordAccessForMetadata is false', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;
      contextItem.metadata;
      expect(contextItem.lastAccessedAt).toBe(originalLastAccessed);
    });
  });

  describe('setMetadata', () => {
    it('should merge metadata by default', () => {
      const newMetadata = { version: '1.0', additional: 'data' };
      contextItem.setMetadata(newMetadata);

      expect(contextItem.metadata).toEqual({
        ...metadata,
        ...newMetadata
      });
    });

    it('should replace metadata when merge is false', () => {
      const newMetadata = { version: '1.0', additional: 'data' };
      contextItem.setMetadata(newMetadata, false);

      expect(contextItem.metadata).toEqual(newMetadata);
    });

    it('should update modifiedAt timestamp', () => {
      const originalModified = contextItem.modifiedAt;

      setTimeout(() => {
        contextItem.setMetadata({ new: 'data' });
        expect(contextItem.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });

    it('should update lastAccessedAt timestamp', () => {
      const originalLastAccessed = contextItem.lastAccessedAt;

      setTimeout(() => {
        contextItem.setMetadata({ new: 'data' });
        expect(contextItem.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should throw error when trying to set metadata on frozen item', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.setMetadata({ new: 'data' });
      }).toThrow('Cannot modify metadata of a frozen ContextItem.');
    });
  });

  describe('freeze', () => {
    it('should freeze the item', () => {
      expect(contextItem.isFrozen()).toBe(false);
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);
    });

    it('should prevent value modification after freezing', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.value = 'new value';
      }).toThrow('Cannot modify a frozen ContextItem.');
    });

    it('should prevent metadata modification after freezing', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.setMetadata({ new: 'data' });
      }).toThrow('Cannot modify metadata of a frozen ContextItem.');
    });

    it('should allow multiple freeze calls without error', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.freeze();
      }).not.toThrow();
      expect(contextItem.isFrozen()).toBe(true);
    });
  });

  describe('unfreeze', () => {
    it('should unfreeze a frozen item', () => {
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);
      contextItem.unfreeze();
      expect(contextItem.isFrozen()).toBe(false);
    });

    it('should allow value modification after unfreezing', () => {
      contextItem.freeze();
      contextItem.unfreeze();
      expect(() => {
        contextItem.value = 'new value';
      }).not.toThrow();
      expect(contextItem.value).toBe('new value');
    });

    it('should allow metadata modification after unfreezing', () => {
      contextItem.freeze();
      contextItem.unfreeze();
      expect(() => {
        contextItem.setMetadata({ new: 'data' });
      }).not.toThrow();
      expect(contextItem.metadata).toEqual({ ...metadata, new: 'data' });
    });

    it('should allow multiple unfreeze calls without error', () => {
      expect(() => {
        contextItem.unfreeze();
      }).not.toThrow();
      expect(contextItem.isFrozen()).toBe(false);
    });
  });

  describe('isFrozen', () => {
    it('should return false for unfrozen item', () => {
      expect(contextItem.isFrozen()).toBe(false);
    });

    it('should return true for frozen item', () => {
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);
    });

    it('should return correct state after freeze/unfreeze cycle', () => {
      expect(contextItem.isFrozen()).toBe(false);
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);
      contextItem.unfreeze();
      expect(contextItem.isFrozen()).toBe(false);
    });
  });

  describe('reinitialize', () => {
    it('should reset value and metadata', () => {
      const newValue = 'new test value';
      const newMetadata = { type: 'number', source: 'test' };
      contextItem.reinitialize(newValue, newMetadata);

      expect(contextItem.value).toBe(newValue);
      expect(contextItem.metadata).toEqual(newMetadata);
    });

    it('should reset timestamps to current time', () => {
      const originalCreatedAt = contextItem.createdAt;
      const originalModifiedAt = contextItem.modifiedAt;
      const originalLastAccessedAt = contextItem.lastAccessedAt;

      setTimeout(() => {
        contextItem.reinitialize('new value');
        expect(contextItem.createdAt.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
        expect(contextItem.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
        expect(contextItem.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessedAt.getTime());
      }, 10);
    });

    it('should respect access recording options on reinitialization', () => {
      const item = new ContextItem('test', {}, { recordAccess: false, recordAccessForMetadata: true });
      item.reinitialize('new value', {}, { recordAccess: true, recordAccessForMetadata: false });

      expect(item.recordAccess).toBe(true);
      expect(item.recordAccessForMetadata).toBe(false);
    });

    it('should respect frozen option on reinitialization', () => {
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);

      contextItem.reinitialize('new value', {}, { frozen: false });
      expect(contextItem.isFrozen()).toBe(false);

      contextItem.reinitialize('another value', {}, { frozen: true });
      expect(contextItem.isFrozen()).toBe(true);
    });

    it('should unfreeze item by default on reinitialization', () => {
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);

      contextItem.reinitialize('new value');
      expect(contextItem.isFrozen()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset value and metadata to undefined and empty object', () => {
      contextItem.clear();
      expect(contextItem.value).toBeUndefined();
      expect(contextItem.metadata).toEqual({});
    });

    it('should reset timestamps to current time', () => {
      const originalCreatedAt = contextItem.createdAt;
      const originalModifiedAt = contextItem.modifiedAt;
      const originalLastAccessedAt = contextItem.lastAccessedAt;

      setTimeout(() => {
        contextItem.clear();
        expect(contextItem.createdAt.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
        expect(contextItem.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
        expect(contextItem.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessedAt.getTime());
      }, 10);
    });

    it('should unfreeze item after clearing', () => {
      contextItem.freeze();
      expect(contextItem.isFrozen()).toBe(true);

      contextItem.clear();
      expect(contextItem.isFrozen()).toBe(false);
    });
  });

  describe('frozen state edge cases', () => {
    it('should allow reading value from frozen item', () => {
      contextItem.freeze();
      expect(() => {
        const value = contextItem.value;
      }).not.toThrow();
      expect(contextItem.value).toBe(initialValue);
    });

    it('should allow reading metadata from frozen item', () => {
      contextItem.freeze();
      expect(() => {
        const meta = contextItem.metadata;
      }).not.toThrow();
      expect(contextItem.metadata).toEqual(metadata);
    });

    it('should allow reading timestamps from frozen item', () => {
      contextItem.freeze();
      expect(() => {
        const created = contextItem.createdAt;
        const modified = contextItem.modifiedAt;
        const accessed = contextItem.lastAccessedAt;
      }).not.toThrow();
    });

    it('should allow changing access recording options on frozen item', () => {
      contextItem.freeze();
      expect(() => {
        contextItem.changeAccessRecord({ recordAccess: false });
      }).not.toThrow();
      expect(contextItem.recordAccess).toBe(false);
    });

    it('should maintain frozen state through access recording changes', () => {
      contextItem.freeze();
      contextItem.changeAccessRecord({ recordAccess: false, recordAccessForMetadata: true });
      expect(contextItem.isFrozen()).toBe(true);
    });
  });
});
