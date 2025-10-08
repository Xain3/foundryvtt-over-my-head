/**
 * @file aliases.setup.test.mjs
 * @description Tests to validate that aliases in vite.config.mjs and jsconfig.json are consistent
 * @path /tests/setup/aliases.setup.test.mjs
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'jsonc-parser';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

/**
 * Gets the jsconfig.json content from the project root
 * @returns {object} The parsed jsconfig.json content
 */
const getJsconfigFromRoot = () => {
  const jsconfigPath = path.resolve(projectRoot, 'jsconfig.json');
  const jsconfigContent = fs.readFileSync(jsconfigPath, 'utf8');
  return parse(jsconfigContent);
};

/**
 * Loads the Vite configuration from the project root
 * @returns {Promise<object>} The Vite configuration object
 */
const loadViteConfigFromRoot = async () => {
  const viteConfigPath = pathToFileURL(path.resolve(projectRoot, 'vite.config.mjs')).href;
  const viteModule = await import(viteConfigPath);
  return viteModule.default ?? viteModule;
};

const normalizePath = (value) => path.normalize(value).replace(/\\/g, '/');
const trimTrailingSlash = (value) => value.replace(/\/$/, '');

const buildViteAliasMap = (aliases) => {
  const entries = new Map();
  aliases
    .filter((alias) => alias && typeof alias.find === 'string' && typeof alias.replacement === 'string')
    .forEach((alias) => {
      const relativeReplacement = trimTrailingSlash(
        normalizePath(path.relative(projectRoot, alias.replacement))
      );
      entries.set(alias.find, relativeReplacement);
    });
  return entries;
};

const buildJsconfigAliasMap = (pathsConfig) => {
  const entries = new Map();
  Object.entries(pathsConfig).forEach(([key, values]) => {
    if (!Array.isArray(values) || values.length === 0) return;
    const normalizedKey = key.replace(/\/\*$/, '');
    const normalizedValue = trimTrailingSlash(normalizePath(values[0].replace(/\/\*$/, '')));
    entries.set(normalizedKey, normalizedValue);
  });
  return entries;
};

let viteConfig;
let viteAliasMap;
let jsconfigJson;
let jsconfigAliasMap;

beforeAll(async () => {
  jsconfigJson = getJsconfigFromRoot();
  viteConfig = await loadViteConfigFromRoot();
  const aliasArray = viteConfig?.resolve?.alias ?? [];
  viteAliasMap = buildViteAliasMap(aliasArray);
  jsconfigAliasMap = buildJsconfigAliasMap(jsconfigJson.compilerOptions.paths);
});

describe('Alias Configuration Validation', () => {
  describe('Vite Configuration Structure', () => {
    it('should load Vite configuration with resolve aliases', () => {
      expect(viteConfig).toBeDefined();
      expect(viteConfig.resolve).toBeDefined();
      expect(Array.isArray(viteConfig.resolve.alias)).toBe(true);
      expect(viteConfig.resolve.alias.length).toBeGreaterThan(0);
    });

    it('should have valid Vite alias format', () => {
      const seenAliases = new Set();
      viteConfig.resolve.alias.forEach((alias) => {
        expect(typeof alias.find).toBe('string');
        expect(alias.find.startsWith('#')).toBe(true);
        expect(typeof alias.replacement).toBe('string');
        expect(alias.replacement.startsWith(projectRoot)).toBe(true);
        expect(seenAliases.has(alias.find)).toBe(false);
        seenAliases.add(alias.find);
      });
    });
  });

  describe('JSConfig Configuration Structure', () => {
    it('should have correct jsconfig structure', () => {
      expect(jsconfigJson).toHaveProperty('compilerOptions');
      expect(jsconfigJson.compilerOptions).toHaveProperty('baseUrl');
      expect(jsconfigJson.compilerOptions).toHaveProperty('paths');
      expect(jsconfigJson.compilerOptions.baseUrl).toBe('.');
      expect(typeof jsconfigJson.compilerOptions.paths).toBe('object');
    });

    it('should have valid jsconfig paths format', () => {
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      Object.keys(jsconfigPaths).forEach((pathKey) => {
        expect(pathKey).toMatch(/^#/);

        const pathValue = jsconfigPaths[pathKey];
        expect(Array.isArray(pathValue)).toBe(true);
        expect(pathValue.length).toBe(1);
        expect(pathValue[0]).not.toMatch(/^\.\//);
      });
    });
  });

  describe('Alias Consistency Between Configurations', () => {
    it('should have matching alias configurations between Vite and jsconfig', () => {
      expect(viteAliasMap.size).toBeGreaterThan(0);
      viteAliasMap.forEach((vitePath, aliasKey) => {
        expect(jsconfigAliasMap.has(aliasKey)).toBe(true);
        const jsconfigPath = jsconfigAliasMap.get(aliasKey);
        expect(jsconfigPath).toBe(vitePath);
      });
    });

    it('should have all jsconfig paths represented in Vite aliases', () => {
      jsconfigAliasMap.forEach((_, aliasKey) => {
        expect(viteAliasMap.has(aliasKey)).toBe(true);
      });
    });
  });

  describe('Required Project Aliases', () => {
    it('should have all required aliases in both configurations', () => {
      const requiredAliases = [
        '#',
        '#config',
        '#contexts',
        '#handlers',
        '#utils',
        '#listeners',
        '#manifest',
        '#constants'
      ];

      requiredAliases.forEach((alias) => {
        expect(viteAliasMap.has(alias)).toBe(true);
        expect(jsconfigAliasMap.has(alias)).toBe(true);
      });
    });
  });

  describe('Alias Path Validation', () => {
    it('should validate alias paths resolve within the project', () => {
      viteAliasMap.forEach((relativePath, aliasKey) => {
        expect(relativePath).not.toMatch(/^\.\./);

        if (['#manifest', '#constants', '#validator', '#module'].includes(aliasKey)) {
          expect(relativePath).toMatch(/\.(mjs|json)$/);
        }
      });
    });

    it('should validate no duplicate aliases exist', () => {
      expect(viteAliasMap.size).toBe(viteConfig.resolve.alias.length);
      const jsconfigKeys = Object.keys(jsconfigJson.compilerOptions.paths);
      const uniqueJsconfigKeys = [...new Set(jsconfigKeys)];
      expect(jsconfigKeys.length).toBe(uniqueJsconfigKeys.length);
    });
  });

  describe('Future Alias Consistency', () => {
    it('should ensure any new aliases follow the same consistency patterns', () => {
      const allViteAliases = [...viteAliasMap.keys()];
      const allJsconfigAliases = [...jsconfigAliasMap.keys()];

      allViteAliases.forEach((alias) => {
        expect(allJsconfigAliases).toContain(alias);
      });

      allJsconfigAliases.forEach((alias) => {
        expect(allViteAliases).toContain(alias);
      });
    });

    it('should validate new aliases follow naming conventions', () => {
      viteAliasMap.forEach((_, alias) => {
        expect(alias).toMatch(/^#([a-zA-Z]|$)/);
      });

      jsconfigAliasMap.forEach((_, alias) => {
        expect(alias).toMatch(/^#([a-zA-Z]|$)/);
      });
    });
  });
});
