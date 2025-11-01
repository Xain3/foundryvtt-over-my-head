/**
 * @file base-adapter.unit.test.mjs
 * @description Unit tests for BaseConfigAdapter class
 * @path tests/unit/adapters/base-adapter.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { BaseConfigAdapter } from '../../../.dev/utils/alias-adapters/base-adapter.mjs';

// Test implementation of BaseConfigAdapter
class TestAdapter extends BaseConfigAdapter {
  #aliases;

  constructor(aliases = {}) {
    super();
    this.#aliases = aliases;
  }

  getFormat() {
    return 'test';
  }

  getFilePaths() {
    return ['/test/path.json'];
  }

  async read() {
    return this.#aliases;
  }

  async write(aliases) {
    this.#aliases = aliases;
  }
}

describe('BaseConfigAdapter', () => {
  describe('getFormat', () => {
    it('throws error if not implemented', () => {
      const adapter = new BaseConfigAdapter();
      expect(() => adapter.getFormat()).toThrow(
        '[OMH] getFormat() must be implemented'
      );
    });
  });

  describe('getFilePaths', () => {
    it('throws error if not implemented', () => {
      const adapter = new BaseConfigAdapter();
      expect(() => adapter.getFilePaths()).toThrow(
        '[OMH] getFilePaths() must be implemented'
      );
    });
  });

  describe('canHandle', () => {
    it('returns true for matching file path', () => {
      const adapter = new TestAdapter();
      expect(adapter.canHandle('/test/path.json')).toBe(true);
    });

    it('returns false for non-matching file path', () => {
      const adapter = new TestAdapter();
      expect(adapter.canHandle('/other/path.json')).toBe(false);
    });
  });

  describe('read', () => {
    it('throws error if not implemented', async () => {
      const adapter = new BaseConfigAdapter();
      await expect(adapter.read()).rejects.toThrow(
        '[OMH] read() must be implemented'
      );
    });
  });

  describe('write', () => {
    it('throws error if not implemented', async () => {
      const adapter = new BaseConfigAdapter();
      await expect(adapter.write({})).rejects.toThrow(
        '[OMH] write() must be implemented'
      );
    });
  });

  describe('validate', () => {
    it('returns valid=true when aliases match', async () => {
      const adapter = new TestAdapter({ '#/': './src/' });
      const result = await adapter.validate({ '#/': './src/' });

      expect(result.valid).toBe(true);
      expect(result.diff).toBeUndefined();
    });

    it('returns valid=false when aliases do not match', async () => {
      const adapter = new TestAdapter({ '#/': './lib/' });
      const result = await adapter.validate({ '#/': './src/' });

      expect(result.valid).toBe(false);
      expect(result.diff).toBeDefined();
      expect(result.diff.mismatched).toHaveLength(1);
    });

    it('includes formatted diff in result', async () => {
      const adapter = new TestAdapter({ '#/': './lib/' });
      const result = await adapter.validate({ '#/': './src/' });

      expect(result.diff.formatted).toBeDefined();
      expect(result.diff.formatted).toContain('Mismatched');
    });
  });
});
