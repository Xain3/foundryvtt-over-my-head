/**
 * @file MockDocument.unit.test.mjs
 * @description Unit tests for MockDocument class
 * @path tests/mocks/MockDocument.unit.test.mjs
 */

import MockDocument from './MockDocument.mjs';

describe('MockDocument', () => {
  let document;

  beforeEach(() => {
    document = new MockDocument();
  });

  describe('constructor', () => {
    it('should create document with default values', () => {
      expect(document.id).toMatch(/^mock-/);
      expect(document.name).toBe('Mock Document');
      expect(document.flags).toEqual({});
      expect(document.permission).toBe(3);
      expect(document.sort).toBe(0);
      expect(document.folder).toBeNull();
    });

    it('should create document with provided data', () => {
      const data = {
        id: 'custom-id',
        name: 'Custom Document',
        flags: { module: { key: 'value' } },
        permission: 2,
        sort: 100,
        folder: 'folder-id'
      };
      const customDocument = new MockDocument(data);

      expect(customDocument.id).toBe('custom-id');
      expect(customDocument.name).toBe('Custom Document');
      expect(customDocument.flags).toEqual({ module: { key: 'value' } });
      expect(customDocument.permission).toBe(2);
      expect(customDocument.sort).toBe(100);
      expect(customDocument.folder).toBe('folder-id');
    });

    it('should copy data to _source', () => {
      const data = { id: 'test', name: 'Test' };
      const doc = new MockDocument(data);
      expect(doc._source).toEqual(data);
    });
  });

  describe('getFlag', () => {
    beforeEach(() => {
      document.flags = {
        module1: { key1: 'value1', key2: 'value2' },
        module2: { key1: 'different-value' }
      };
    });

    it('should get flag value', () => {
      expect(document.getFlag('module1', 'key1')).toBe('value1');
      expect(document.getFlag('module2', 'key1')).toBe('different-value');
    });

    it('should return undefined for non-existent scope', () => {
      expect(document.getFlag('nonexistent', 'key')).toBeUndefined();
    });

    it('should return undefined for non-existent key', () => {
      expect(document.getFlag('module1', 'nonexistent')).toBeUndefined();
    });
  });

  describe('setFlag', () => {
    it('should set flag in existing scope', async () => {
      document.flags = { module: { existingKey: 'existingValue' } };
      
      const result = await document.setFlag('module', 'newKey', 'newValue');
      
      expect(document.flags.module.newKey).toBe('newValue');
      expect(document.flags.module.existingKey).toBe('existingValue');
      expect(result).toBe(document);
    });

    it('should create new scope if it does not exist', async () => {
      const result = await document.setFlag('newModule', 'key', 'value');
      
      expect(document.flags.newModule).toEqual({ key: 'value' });
      expect(result).toBe(document);
    });

    it('should overwrite existing flag', async () => {
      document.flags = { module: { key: 'oldValue' } };
      
      await document.setFlag('module', 'key', 'newValue');
      
      expect(document.flags.module.key).toBe('newValue');
    });
  });

  describe('update', () => {
    it('should update document data', async () => {
      document.data = { name: 'Original', value: 42 };
      
      const result = await document.update({ name: 'Updated', newField: 'new' });
      
      expect(document.data).toEqual({ name: 'Updated', value: 42, newField: 'new' });
      expect(result).toBe(document);
    });

    it('should handle empty update', async () => {
      const originalData = { name: 'Test' };
      document.data = { ...originalData };
      
      const result = await document.update({});
      
      expect(document.data).toEqual(originalData);
      expect(result).toBe(document);
    });

    it('should accept options parameter', async () => {
      const options = { diff: false };
      const result = await document.update({ name: 'Test' }, options);
      expect(result).toBe(document);
    });
  });

  describe('delete', () => {
    it('should return the document', async () => {
      const result = await document.delete();
      expect(result).toBe(document);
    });

    it('should accept options parameter', async () => {
      const options = { deleteSubfolders: true };
      const result = await document.delete(options);
      expect(result).toBe(document);
    });
  });
});
