/**
 * @file adapter-registry.unit.test.mjs
 * @description Unit tests for AdapterRegistry class
 * @path tests/unit/adapters/adapter-registry.unit.test.mjs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdapterRegistry } from '../../../.dev/utils/alias-adapters/adapter-registry.mjs';
import { BaseConfigAdapter } from '../../../.dev/utils/alias-adapters/base-adapter.mjs';

// Test adapter implementations
class TestAdapterA extends BaseConfigAdapter {
  getFormat() {
    return 'test-a';
  }
  getFilePaths() {
    return ['/test/a.json'];
  }
  async read() {
    return {};
  }
  async write(_aliases) {}
}

class TestAdapterB extends BaseConfigAdapter {
  getFormat() {
    return 'test-b';
  }
  getFilePaths() {
    return ['/test/b.json'];
  }
  async read() {
    return {};
  }
  async write(_aliases) {}
}

describe('AdapterRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new AdapterRegistry();
    registry.clear();
  });

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = AdapterRegistry.getInstance();
      const instance2 = AdapterRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('registers adapter successfully', () => {
      const adapter = new TestAdapterA();
      registry.register(adapter);

      expect(registry.getByFormat('test-a')).toBe(adapter);
    });

    it('throws error if adapter missing getFormat method', () => {
      const adapter = {};
      expect(() => registry.register(adapter)).toThrow(
        '[OMH] Adapter must implement getFormat()'
      );
    });

    it('throws error if adapter missing getFilePaths method', () => {
      const adapter = { getFormat: () => 'test' };
      expect(() => registry.register(adapter)).toThrow(
        '[OMH] Adapter must implement getFilePaths()'
      );
    });

    it('throws error if adapter missing read method', () => {
      const adapter = {
        getFormat: () => 'test',
        getFilePaths: () => [],
      };
      expect(() => registry.register(adapter)).toThrow(
        '[OMH] Adapter must implement read()'
      );
    });

    it('throws error if adapter missing write method', () => {
      const adapter = {
        getFormat: () => 'test',
        getFilePaths: () => [],
        read: () => {},
      };
      expect(() => registry.register(adapter)).toThrow(
        '[OMH] Adapter must implement write()'
      );
    });

    it('throws error if format already registered', () => {
      const adapter1 = new TestAdapterA();
      const adapter2 = new TestAdapterA();

      registry.register(adapter1);
      expect(() => registry.register(adapter2)).toThrow(
        '[OMH] Adapter for format "test-a" is already registered'
      );
    });

    it('throws error if file path already registered', () => {
      class DuplicatePathAdapter extends BaseConfigAdapter {
        getFormat() {
          return 'duplicate';
        }
        getFilePaths() {
          return ['/test/a.json'];
        }
        async read() {
          return {};
        }
        async write(_aliases) {}
      }

      registry.register(new TestAdapterA());
      expect(() => registry.register(new DuplicatePathAdapter())).toThrow(
        '[OMH] File path "/test/a.json" is already registered'
      );
    });
  });

  describe('getByFormat', () => {
    it('retrieves adapter by format', () => {
      const adapter = new TestAdapterA();
      registry.register(adapter);

      expect(registry.getByFormat('test-a')).toBe(adapter);
    });

    it('returns undefined for unknown format', () => {
      expect(registry.getByFormat('unknown')).toBeUndefined();
    });
  });

  describe('getByFilePath', () => {
    it('retrieves adapter by file path', () => {
      const adapter = new TestAdapterA();
      registry.register(adapter);

      expect(registry.getByFilePath('/test/a.json')).toBe(adapter);
    });

    it('returns undefined for unknown file path', () => {
      expect(registry.getByFilePath('/unknown.json')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns empty array when no adapters registered', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('returns all registered adapters', () => {
      const adapterA = new TestAdapterA();
      const adapterB = new TestAdapterB();

      registry.register(adapterA);
      registry.register(adapterB);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(adapterA);
      expect(all).toContain(adapterB);
    });
  });

  describe('getSupportedFormats', () => {
    it('returns empty array when no adapters registered', () => {
      expect(registry.getSupportedFormats()).toEqual([]);
    });

    it('returns all supported format identifiers', () => {
      registry.register(new TestAdapterA());
      registry.register(new TestAdapterB());

      const formats = registry.getSupportedFormats();
      expect(formats).toEqual(['test-a', 'test-b']);
    });
  });

  describe('supports', () => {
    it('returns true for supported format', () => {
      registry.register(new TestAdapterA());
      expect(registry.supports('test-a')).toBe(true);
    });

    it('returns false for unsupported format', () => {
      expect(registry.supports('unknown')).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes all registered adapters', () => {
      registry.register(new TestAdapterA());
      registry.register(new TestAdapterB());

      registry.clear();

      expect(registry.getAll()).toHaveLength(0);
      expect(registry.getSupportedFormats()).toHaveLength(0);
    });
  });
});
