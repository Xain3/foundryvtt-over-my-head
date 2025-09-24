/**
 * @file contextPathUtils.unit.test.mjs
 * @description Unit tests for the ContextPathUtils class functionality.
 * @path src/contexts/helpers/contextPathUtils.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ContextPathUtils from './contextPathUtils.mjs';
import { ContextContainer } from './contextContainer.mjs';
import { ContextItem } from './contextItem.mjs';

describe('ContextPathUtils', () => {
  let mockPlainObject;

  beforeEach(() => {
    mockPlainObject = {
      plainProperty: 'plainValue',
      nested: {
        value: 'nestedValue'
      }
    };
  });

  describe('Integration with real ContextContainer instances', () => {
    it('should resolve paths through real ContextContainer structures', () => {
      // Create real ContextContainer instances for integration testing
      const container = new ContextContainer();
      
      container.setItem('item1', { value: 'test1' });
      container.setItem('item2', { value: 'test2' });

      const result = ContextPathUtils.resolveMixedPath(container, 'item1.value');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('test1');
    });

    it('should resolve nested paths through mixed structures', () => {
      const container = new ContextContainer();
      
      container.setItem('item', { 
        nested: { value: 'nestedTest' },
        plain: mockPlainObject
      });

      const result = ContextPathUtils.resolveMixedPath(container, 'item.plain.plainProperty');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('plainValue');
    });

    it('should resolve paths through plain objects within containers', () => {
      const container = new ContextContainer();
      
      container.setItem('item', mockPlainObject);

      const result = ContextPathUtils.resolveMixedPath(container, 'item.nested.value');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('nestedValue');
    });

    it('should return false for non-existent paths', () => {
      const container = new ContextContainer();
      
      const result = ContextPathUtils.pathExistsInMixedStructure(container, 'nonexistent.path');
      
      expect(result).toBe(false);
    });

    it('should return undefined for non-existent path values', () => {
      const container = new ContextContainer();
      
      const result = ContextPathUtils.getValueFromMixedPath(container, 'nonexistent.path');
      
      expect(result).toBeUndefined();
    });
  });

  describe('pathExistsInMixedStructure', () => {
    it('should return true when path exists in ContextContainer', () => {
      const container = new ContextContainer();
      container.setItem('test', { value: 'data' });

      const result = ContextPathUtils.pathExistsInMixedStructure(container, 'test.value');
      
      expect(result).toBe(true);
    });

    it('should return false when path does not exist', () => {
      const container = new ContextContainer();
      
      const result = ContextPathUtils.pathExistsInMixedStructure(container, 'nonexistent.path');
      
      expect(result).toBe(false);
    });
  });

  describe('getValueFromMixedPath', () => {
    it('should return value when path exists', () => {
      const container = new ContextContainer();
      const expectedValue = { data: 'test' };
      container.setItem('test', expectedValue);

      const result = ContextPathUtils.getValueFromMixedPath(container, 'test');
      
      expect(result).toEqual(expectedValue);
    });

    it('should return undefined when path does not exist', () => {
      const container = new ContextContainer();
      
      const result = ContextPathUtils.getValueFromMixedPath(container, 'nonexistent.path');
      
      expect(result).toBeUndefined();
    });
  });

  describe('Context navigation behavior', () => {
    it('should properly identify ContextContainer objects', () => {
      const container = new ContextContainer();
      const plainObject = { some: 'data' };

      // This tests the private method indirectly through resolveMixedPath
      const containerResult = ContextPathUtils.resolveMixedPath(container, 'nonexistent');
      const plainResult = ContextPathUtils.resolveMixedPath(plainObject, 'some');

      // Both should return valid results but use different navigation strategies
      expect(containerResult).toBeDefined();
      expect(containerResult.exists).toBe(false); // No item 'nonexistent'
      
      expect(plainResult).toBeDefined();
      expect(plainResult.exists).toBe(true); // Property 'some' exists
      expect(plainResult.value).toBe('data');
    });

    it('should handle mixed ContextContainer and plain object navigation', () => {
      const container = new ContextContainer();
      
      container.setItem('mixed', {
        plain: { value: 'test' },
        another: 'direct'
      });

      // Navigate through ContextContainer then plain object
      const result = ContextPathUtils.resolveMixedPath(container, 'mixed.plain.value');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('test');
    });

    it('should return correct finalContainer and finalKey for ContextContainer', () => {
      const container = new ContextContainer();
      container.setItem('item', 'value');

      const result = ContextPathUtils.resolveMixedPath(container, 'item');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('value');
      expect(result.finalContainer).toBe(container); // Should be the ContextContainer
      expect(result.finalKey).toBe('item');
    });

    it('should return correct finalContainer and finalKey for plain objects', () => {
      const obj = { 
        nested: { 
          value: 'test' 
        } 
      };

      const result = ContextPathUtils.resolveMixedPath(obj, 'nested.value');
      
      expect(result.exists).toBe(true);
      expect(result.value).toBe('test');
      expect(result.finalContainer).toBe(obj.nested);
      expect(result.finalKey).toBe('value');
    });
  });
});
