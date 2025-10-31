/**
 * @file normalization-helpers.unit.test.mjs
 * @description Unit tests for normalization helper functions
 * @path tests/unit/adapters/normalization-helpers.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeFromAliasConfig,
  normalizeFromTsConfigPaths,
  normalizeToTsConfigPaths,
  normalizeFromPackageJsonImports,
  normalizeToPackageJsonImports,
  compareAliases,
  formatDiff,
} from '#devutils/alias-adapters/normalization-helpers.mjs';

describe('normalization-helpers', () => {
  describe('normalizeFromAliasConfig', () => {
    it('converts alias.config.mjs format to normalized format', () => {
      const entries = [
        { find: '#', replacement: '/abs/path/to/src' },
        { find: '#tests', replacement: '/abs/path/to/tests' },
      ];

      const result = normalizeFromAliasConfig(entries, '/abs/path/to');

      expect(result).toEqual({
        '#/': './src/',
        '#tests/': './tests/',
      });
    });

    it('ensures keys end with /', () => {
      const entries = [{ find: '#', replacement: '/abs/path/to/src' }];
      const result = normalizeFromAliasConfig(entries, '/abs/path/to');

      expect(result['#/']).toBeDefined();
      expect(result['#']).toBeUndefined();
    });

    it('ensures values end with /', () => {
      const entries = [{ find: '#', replacement: '/abs/path/to/src' }];
      const result = normalizeFromAliasConfig(entries, '/abs/path/to');

      expect(result['#/']).toMatch(/\/$/);
    });

    it('converts absolute paths to relative paths', () => {
      const entries = [{ find: '#', replacement: '/abs/path/to/src' }];
      const result = normalizeFromAliasConfig(entries, '/abs/path/to');

      expect(result['#/']).toMatch(/^\.\//);
    });
  });

  describe('normalizeFromTsConfigPaths', () => {
    it('converts TypeScript paths format to normalized format', () => {
      const paths = {
        '#/*': ['./src/*'],
        '#tests/*': ['./tests/*'],
      };

      const result = normalizeFromTsConfigPaths(paths);

      expect(result).toEqual({
        '#/': './src/',
        '#tests/': './tests/',
      });
    });

    it('removes /* from keys and values', () => {
      const paths = { '#/*': ['./src/*'] };
      const result = normalizeFromTsConfigPaths(paths);

      expect(result['#/']).toBe('./src/');
      expect(result['#/*']).toBeUndefined();
    });

    it('takes first path from array', () => {
      const paths = { '#/*': ['./src/*', './alternative/*'] };
      const result = normalizeFromTsConfigPaths(paths);

      expect(result['#/']).toBe('./src/');
    });
  });

  describe('normalizeToTsConfigPaths', () => {
    it('converts normalized format to TypeScript paths format', () => {
      const normalized = {
        '#/': './src/',
        '#tests/': './tests/',
      };

      const result = normalizeToTsConfigPaths(normalized);

      expect(result).toEqual({
        '#/*': ['./src/*'],
        '#tests/*': ['./tests/*'],
      });
    });

    it('adds /* to keys and values', () => {
      const normalized = { '#/': './src/' };
      const result = normalizeToTsConfigPaths(normalized);

      expect(result['#/*']).toEqual(['./src/*']);
    });

    it('wraps values in array', () => {
      const normalized = { '#/': './src/' };
      const result = normalizeToTsConfigPaths(normalized);

      expect(Array.isArray(result['#/*'])).toBe(true);
      expect(result['#/*']).toHaveLength(1);
    });
  });

  describe('normalizeFromPackageJsonImports', () => {
    it('returns imports format unchanged (already normalized)', () => {
      const imports = {
        '#/': './src/',
        '#tests/': './tests/',
      };

      const result = normalizeFromPackageJsonImports(imports);

      expect(result).toEqual(imports);
    });

    it('skips non-alias entries', () => {
      const imports = {
        '#/': './src/',
        '#package.json': './package.json',
        other: './other',
      };

      const result = normalizeFromPackageJsonImports(imports);

      expect(result).toEqual({ '#/': './src/' });
      expect(result['#package.json']).toBeUndefined();
      expect(result['other']).toBeUndefined();
    });
  });

  describe('normalizeToPackageJsonImports', () => {
    it('returns normalized format unchanged (same as package.json format)', () => {
      const normalized = {
        '#/': './src/',
        '#tests/': './tests/',
      };

      const result = normalizeToPackageJsonImports(normalized);

      expect(result).toEqual(normalized);
    });
  });

  describe('compareAliases', () => {
    it('returns empty arrays when aliases match', () => {
      const current = { '#/': './src/', '#tests/': './tests/' };
      const expected = { '#/': './src/', '#tests/': './tests/' };

      const result = compareAliases(current, expected);

      expect(result.missing).toHaveLength(0);
      expect(result.extra).toHaveLength(0);
      expect(result.mismatched).toHaveLength(0);
    });

    it('detects missing aliases', () => {
      const current = { '#/': './src/' };
      const expected = { '#/': './src/', '#tests/': './tests/' };

      const result = compareAliases(current, expected);

      expect(result.missing).toEqual(['#tests/']);
      expect(result.extra).toHaveLength(0);
      expect(result.mismatched).toHaveLength(0);
    });

    it('detects extra aliases', () => {
      const current = { '#/': './src/', '#extra/': './extra/' };
      const expected = { '#/': './src/' };

      const result = compareAliases(current, expected);

      expect(result.missing).toHaveLength(0);
      expect(result.extra).toEqual(['#extra/']);
      expect(result.mismatched).toHaveLength(0);
    });

    it('detects mismatched aliases', () => {
      const current = { '#/': './lib/' };
      const expected = { '#/': './src/' };

      const result = compareAliases(current, expected);

      expect(result.missing).toHaveLength(0);
      expect(result.extra).toHaveLength(0);
      expect(result.mismatched).toHaveLength(1);
      expect(result.mismatched[0]).toEqual({
        key: '#/',
        currentValue: './lib/',
        expectedValue: './src/',
      });
    });

    it('handles multiple differences simultaneously', () => {
      const current = { '#/': './lib/', '#extra/': './extra/' };
      const expected = { '#/': './src/', '#tests/': './tests/' };

      const result = compareAliases(current, expected);

      expect(result.missing).toEqual(['#tests/']);
      expect(result.extra).toEqual(['#extra/']);
      expect(result.mismatched).toHaveLength(1);
    });
  });

  describe('formatDiff', () => {
    it('formats missing aliases', () => {
      const diff = { missing: ['#tests/'], extra: [], mismatched: [] };
      const current = { '#/': './src/' };
      const expected = { '#/': './src/', '#tests/': './tests/' };

      const result = formatDiff(diff, current, expected);

      expect(result).toContain('Missing aliases');
      expect(result).toContain('#tests/');
      expect(result).toContain('./tests/');
    });

    it('formats extra aliases', () => {
      const diff = { missing: [], extra: ['#extra/'], mismatched: [] };
      const current = { '#/': './src/', '#extra/': './extra/' };
      const expected = { '#/': './src/' };

      const result = formatDiff(diff, current, expected);

      expect(result).toContain('Extra aliases');
      expect(result).toContain('#extra/');
      expect(result).toContain('./extra/');
    });

    it('formats mismatched aliases', () => {
      const diff = {
        missing: [],
        extra: [],
        mismatched: [
          { key: '#/', currentValue: './lib/', expectedValue: './src/' },
        ],
      };
      const current = { '#/': './lib/' };
      const expected = { '#/': './src/' };

      const result = formatDiff(diff, current, expected);

      expect(result).toContain('Mismatched aliases');
      expect(result).toContain('#/');
      expect(result).toContain('./lib/');
      expect(result).toContain('./src/');
    });

    it('formats all difference types together', () => {
      const diff = {
        missing: ['#tests/'],
        extra: ['#extra/'],
        mismatched: [
          { key: '#/', currentValue: './lib/', expectedValue: './src/' },
        ],
      };
      const current = { '#/': './lib/', '#extra/': './extra/' };
      const expected = { '#/': './src/', '#tests/': './tests/' };

      const result = formatDiff(diff, current, expected);

      expect(result).toContain('Missing aliases');
      expect(result).toContain('Extra aliases');
      expect(result).toContain('Mismatched aliases');
    });
  });
});
