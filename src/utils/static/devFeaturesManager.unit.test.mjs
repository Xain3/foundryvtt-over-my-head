/**
 * @file devFeaturesManager.unit.test.mjs
 * @description Unit tests for DevFeaturesManager class
 * @path src/utils/static/devFeaturesManager.unit.test.mjs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import DevFeaturesManager from './devFeaturesManager.mjs';

describe('DevFeaturesManager', () => {
  describe('shouldEnableDevFeatures', () => {
    it('should return true when manifest.flags.dev is true', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.shouldEnableDevFeatures(manifest);
      expect(result).toBe(true);
    });

    it('should return false when manifest.flags.dev is false', () => {
      const manifest = { flags: { dev: false } };
      const result = DevFeaturesManager.shouldEnableDevFeatures(manifest);
      expect(result).toBe(false);
    });

    it('should return false when manifest.flags is missing', () => {
      const manifest = {};
      const result = DevFeaturesManager.shouldEnableDevFeatures(manifest);
      expect(result).toBe(false);
    });

    it('should return false when manifest.flags.dev is undefined', () => {
      const manifest = { flags: {} };
      const result = DevFeaturesManager.shouldEnableDevFeatures(manifest);
      expect(result).toBe(false);
    });

    it('should return false when manifest is null', () => {
      const result = DevFeaturesManager.shouldEnableDevFeatures(null);
      expect(result).toBe(false);
    });

    it('should return false when manifest is undefined', () => {
      const result = DevFeaturesManager.shouldEnableDevFeatures(undefined);
      expect(result).toBe(false);
    });

    it('should return false when manifest is not an object', () => {
      const result1 = DevFeaturesManager.shouldEnableDevFeatures('string');
      expect(result1).toBe(false);

      const result2 = DevFeaturesManager.shouldEnableDevFeatures(42);
      expect(result2).toBe(false);

      const result3 = DevFeaturesManager.shouldEnableDevFeatures(true);
      expect(result3).toBe(false);
    });

    it('should return true for truthy dev flag values', () => {
      const manifest1 = { flags: { dev: 1 } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest1)).toBe(true);

      const manifest2 = { flags: { dev: 'true' } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest2)).toBe(true);

      const manifest3 = { flags: { dev: {} } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest3)).toBe(true);
    });

    it('should return false for falsy dev flag values', () => {
      const manifest1 = { flags: { dev: 0 } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest1)).toBe(false);

      const manifest2 = { flags: { dev: '' } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest2)).toBe(false);

      const manifest3 = { flags: { dev: null } };
      expect(DevFeaturesManager.shouldEnableDevFeatures(manifest3)).toBe(false);
    });
  });

  describe('resolveManifestFlag', () => {
    it('should resolve a simple flag path', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.dev', false);
      expect(result).toBe(true);
    });

    it('should resolve a nested flag path', () => {
      const manifest = { flags: { debug: { mode: true } } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.debug.mode', false);
      expect(result).toBe(true);
    });

    it('should return default value for missing flag', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.missing', 'default');
      expect(result).toBe('default');
    });

    it('should return default value for missing nested path', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.nested.missing', 'default');
      expect(result).toBe('default');
    });

    it('should return default value when manifest is null', () => {
      const result = DevFeaturesManager.resolveManifestFlag(null, 'flags.dev', 'default');
      expect(result).toBe('default');
    });

    it('should return default value when manifest is undefined', () => {
      const result = DevFeaturesManager.resolveManifestFlag(undefined, 'flags.dev', 'default');
      expect(result).toBe('default');
    });

    it('should return default value when manifest is not an object', () => {
      const result = DevFeaturesManager.resolveManifestFlag('string', 'flags.dev', 'default');
      expect(result).toBe('default');
    });

    it('should return default value when flagPath is null', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, null, 'default');
      expect(result).toBe('default');
    });

    it('should return default value when flagPath is empty string', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, '', 'default');
      expect(result).toBe('default');
    });

    it('should handle single-level paths', () => {
      const manifest = { version: '1.0.0' };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'version', 'unknown');
      expect(result).toBe('1.0.0');
    });

    it('should handle falsy flag values correctly', () => {
      const manifest = { flags: { dev: false } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.dev', true);
      expect(result).toBe(false);
    });

    it('should handle numeric zero flag values', () => {
      const manifest = { flags: { count: 0 } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.count', 100);
      expect(result).toBe(0);
    });

    it('should handle empty string flag values', () => {
      const manifest = { flags: { label: '' } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.label', 'default');
      expect(result).toBe('');
    });

    it('should handle complex object flag values', () => {
      const manifest = { flags: { config: { a: 1, b: 2 } } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.config', {});
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle array flag values', () => {
      const manifest = { flags: { list: [1, 2, 3] } };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.list', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return default when intermediate path is not an object', () => {
      const manifest = { flags: 'not-an-object' };
      const result = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.dev', 'default');
      expect(result).toBe('default');
    });
  });

  describe('hasManifestFlag', () => {
    it('should return true when flag exists', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(true);
    });

    it('should return true when flag exists even if falsy', () => {
      const manifest = { flags: { dev: false } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(true);
    });

    it('should return true when flag is null', () => {
      const manifest = { flags: { dev: null } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(true);
    });

    it('should return true when flag is undefined but key exists', () => {
      const manifest = { flags: { dev: undefined } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(true);
    });

    it('should return false when flag does not exist', () => {
      const manifest = { flags: {} };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(false);
    });

    it('should return false when parent path does not exist', () => {
      const manifest = {};
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(false);
    });

    it('should return false when manifest is null', () => {
      const result = DevFeaturesManager.hasManifestFlag(null, 'flags.dev');
      expect(result).toBe(false);
    });

    it('should return false when manifest is undefined', () => {
      const result = DevFeaturesManager.hasManifestFlag(undefined, 'flags.dev');
      expect(result).toBe(false);
    });

    it('should return false when manifest is not an object', () => {
      const result = DevFeaturesManager.hasManifestFlag('string', 'flags.dev');
      expect(result).toBe(false);
    });

    it('should return false when flagPath is null', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, null);
      expect(result).toBe(false);
    });

    it('should return false when flagPath is empty string', () => {
      const manifest = { flags: { dev: true } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, '');
      expect(result).toBe(false);
    });

    it('should handle nested paths', () => {
      const manifest = { flags: { debug: { mode: true } } };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.debug.mode');
      expect(result).toBe(true);
    });

    it('should return false for nested path when intermediate is not object', () => {
      const manifest = { flags: 'not-an-object' };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
      expect(result).toBe(false);
    });

    it('should handle single-level paths', () => {
      const manifest = { version: '1.0.0' };
      const result = DevFeaturesManager.hasManifestFlag(manifest, 'version');
      expect(result).toBe(true);
    });
  });
});
