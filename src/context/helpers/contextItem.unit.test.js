import { ContextItem } from './contextItem.js';

/**
 * @file contextItem.test.js
 * @description This file contains tests for the ContextItem class.
 * @path src/context/helpers/contextItem.test.js
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
  });

  describe('changeAccessRecord', () => {
    it('should change recordAccess setting', () => {
      contextItem.changeAccessRecord({ recordAccess: false });
      expect(contextItem.recordAccess).toBe(false);
    });

    it('should change recordAccessForMetadata setting', () => {
      contextItem.changeAccessRecord({ recordAccessForMetadata: true });
      expect(contextItem.recordAccessForMetadata).toBe(true);
    });

    it('should use default values when no options provided', () => {
      const item = new ContextItem('test', {}, { recordAccess: false, recordAccessForMetadata: true });
      item.changeAccessRecord();

      expect(item.recordAccess).toBe(true);
      expect(item.recordAccessForMetadata).toBe(false);
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
  }
  );
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
  });
});
