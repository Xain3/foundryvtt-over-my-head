/**
 * @file aliases.setup.test.mjs
 * @description Validates alias consistency across alias.config.mjs, vite.config.mjs, jsconfig.json, and package.json imports
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

// /\\/g swaps Windows backslashes with forward slashes so comparisons stay OS-agnostic.
const normalizePath = (value) => path.normalize(value).replace(/\\/g, '/');
// /\/$/ trims a single trailing slash so directory aliases have a stable key.
const trimTrailingSlash = (value) => value.replace(/\/$/, '');
// /\/$/ removes optional trailing slash; /\/\*$/ removes trailing wildcard when present.
const normalizeAliasKey = (alias) =>
  alias.replace(/\/$/, '').replace(/\/\*$/, '');
const normalizeAliasValue = (value) =>
  trimTrailingSlash(normalizePath(value.replace(/\/\*$/, '')));

const loadJsonFile = (relativePath) => {
  const filePath = path.resolve(projectRoot, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const loadJsconfig = () => {
  const jsconfigPath = path.resolve(projectRoot, 'jsconfig.json');
  const jsconfigContent = fs.readFileSync(jsconfigPath, 'utf8');
  return parse(jsconfigContent);
};

const loadViteConfig = async () => {
  const viteConfigPath = pathToFileURL(
    path.resolve(projectRoot, 'vite.config.mjs')
  ).href;
  const viteModule = await import(viteConfigPath);
  return viteModule.default ?? viteModule;
};

const loadAliasConfig = async () => {
  const aliasConfigPath = pathToFileURL(
    path.resolve(projectRoot, 'alias.config.mjs')
  ).href;
  const aliasModule = await import(aliasConfigPath);
  const entries = aliasModule.aliasEntries ?? aliasModule.default ?? [];
  return Array.isArray(entries) ? entries : [];
};

const buildAliasMapFromArray = (entries) => {
  const map = new Map();
  entries
    .filter(
      (alias) =>
        alias &&
        typeof alias.find === 'string' &&
        typeof alias.replacement === 'string'
    )
    .forEach((alias) => {
      const key = normalizeAliasKey(alias.find);
      const relativeReplacement = trimTrailingSlash(
        normalizePath(path.relative(projectRoot, alias.replacement))
      );
      map.set(key, relativeReplacement);
    });
  return map;
};

const buildJsconfigAliasMap = (pathsConfig) => {
  const map = new Map();
  Object.entries(pathsConfig).forEach(([key, values]) => {
    if (!Array.isArray(values) || values.length === 0) return;
    const aliasKey = normalizeAliasKey(key);
    const aliasValue = normalizeAliasValue(values[0]);
    map.set(aliasKey, aliasValue);
  });
  return map;
};

const buildPackageImportMap = (importsConfig) => {
  const map = new Map();
  Object.entries(importsConfig ?? {}).forEach(([key, value]) => {
    if (typeof value !== 'string') return;
    const aliasKey = normalizeAliasKey(key);
    const aliasValue = normalizeAliasValue(value);
    map.set(aliasKey, aliasValue);
  });
  return map;
};

const EXPECTED_ALIAS_REGEX = /^#([A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)?$/;
const OPTIONAL_IMPORT_ALIASES = new Set(['#']);

let aliasConfigEntries;
let aliasConfigMap;
let viteConfig;
let viteAliasMap;
let jsconfigJson;
let jsconfigAliasMap;
let packageJson;
let packageImportMap;

beforeAll(async () => {
  aliasConfigEntries = await loadAliasConfig();
  aliasConfigMap = buildAliasMapFromArray(aliasConfigEntries);

  viteConfig = await loadViteConfig();
  const viteAliasEntries = Array.isArray(viteConfig?.resolve?.alias)
    ? viteConfig.resolve.alias
    : [];
  viteAliasMap = buildAliasMapFromArray(viteAliasEntries);

  jsconfigJson = loadJsconfig();
  jsconfigAliasMap = buildJsconfigAliasMap(
    jsconfigJson.compilerOptions?.paths ?? {}
  );

  packageJson = loadJsonFile('package.json');
  packageImportMap = buildPackageImportMap(packageJson.imports ?? {});
});

describe('Alias configuration integrity', () => {
  it('should load alias configuration from alias.config.mjs', () => {
    expect(Array.isArray(aliasConfigEntries)).toBe(true);
    expect(aliasConfigEntries.length).toBeGreaterThan(0);
  });

  it('should ensure each alias entry in alias.config.mjs is valid', () => {
    const seenKeys = new Set();
    aliasConfigEntries.forEach((alias) => {
      expect(typeof alias.find).toBe('string');
      expect(EXPECTED_ALIAS_REGEX.test(normalizeAliasKey(alias.find))).toBe(
        true
      );
      expect(typeof alias.replacement).toBe('string');
      expect(alias.replacement.startsWith(projectRoot)).toBe(true);
      const normalizedKey = normalizeAliasKey(alias.find);
      expect(seenKeys.has(normalizedKey)).toBe(false);
      seenKeys.add(normalizedKey);
    });
  });

  it('should ensure alias.config.mjs and vite.config.mjs expose the same aliases', () => {
    expect(new Set(viteAliasMap.keys())).toEqual(
      new Set(aliasConfigMap.keys())
    );
    aliasConfigMap.forEach((value, key) => {
      expect(viteAliasMap.get(key)).toBe(value);
    });
  });
});

describe('jsconfig.json alias validation', () => {
  it('should have correct jsconfig structure', () => {
    expect(jsconfigJson).toHaveProperty('compilerOptions');
    expect(jsconfigJson.compilerOptions).toHaveProperty('baseUrl', '.');
    expect(jsconfigJson.compilerOptions).toHaveProperty('paths');
  });

  it('should ensure jsconfig paths use valid alias syntax', () => {
    Object.entries(jsconfigJson.compilerOptions.paths).forEach(
      ([aliasKey, value]) => {
        expect(EXPECTED_ALIAS_REGEX.test(normalizeAliasKey(aliasKey))).toBe(
          true
        );
        expect(Array.isArray(value)).toBe(true);
        expect(value.length).toBe(1);
        expect(typeof value[0]).toBe('string');
        expect(value[0]).not.toMatch(/^\.\//);
        expect(value[0]).not.toMatch(/^\.\./);
      }
    );
  });
});

describe('package.json import map validation', () => {
  it('should ensure package.json declares an imports map with valid entries', () => {
    expect(packageJson).toHaveProperty('imports');
    Object.entries(packageJson.imports).forEach(([aliasKey, value]) => {
      expect(EXPECTED_ALIAS_REGEX.test(normalizeAliasKey(aliasKey))).toBe(true);
      expect(typeof value).toBe('string');
      expect(value.startsWith('./')).toBe(true);
      expect(value).not.toMatch(/^\.\.[/\\]/);
    });
  });

  it('should ensure package.json imports have unique keys', () => {
    const keys = Object.keys(packageJson.imports ?? {});
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Cross-source alias consistency', () => {
  it('should ensure every alias from alias.config exists in jsconfig and package imports (with allowed exceptions)', () => {
    aliasConfigMap.forEach((value, key) => {
      expect(jsconfigAliasMap.has(key)).toBe(true);
      expect(jsconfigAliasMap.get(key)).toBe(value);

      if (!OPTIONAL_IMPORT_ALIASES.has(key)) {
        expect(packageImportMap.has(key)).toBe(true);
        expect(packageImportMap.get(key)).toBe(value);
      }
    });
  });

  it('should ensure jsconfig aliases are declared in alias.config.mjs', () => {
    jsconfigAliasMap.forEach((value, key) => {
      expect(aliasConfigMap.has(key)).toBe(true);
      expect(aliasConfigMap.get(key)).toBe(value);
    });
  });

  it('should ensure package.json imports map to aliases defined in alias.config.mjs', () => {
    packageImportMap.forEach((value, key) => {
      expect(aliasConfigMap.has(key)).toBe(true);
      expect(aliasConfigMap.get(key)).toBe(value);
    });
  });
});

describe('Alias target validation', () => {
  it('should ensure aliased paths stay within the repository', () => {
    [
      ...aliasConfigMap.values(),
      ...jsconfigAliasMap.values(),
      ...packageImportMap.values(),
    ].forEach((relativePath) => {
      expect(relativePath).not.toMatch(/^\.\./);
    });
  });

  it('should ensure file aliases point to concrete files when required', () => {
    const fileAliasKeys = [
      '#manifest',
      '#constants',
      '#validator',
      '#module',
      '#helpers/pathUtils.mjs',
    ];
    fileAliasKeys.forEach((aliasKey) => {
      if (aliasConfigMap.has(aliasKey)) {
        const relativePath = aliasConfigMap.get(aliasKey);
        expect(relativePath).toMatch(/\.(mjs|json)$/);
      }
    });
  });
});

describe('Naming conventions', () => {
  it('should ensure aliases start with # followed by valid characters', () => {
    const allAliasKeys = new Set([
      ...aliasConfigMap.keys(),
      ...jsconfigAliasMap.keys(),
      ...packageImportMap.keys(),
    ]);

    allAliasKeys.forEach((aliasKey) => {
      expect(EXPECTED_ALIAS_REGEX.test(aliasKey)).toBe(true);
    });
  });
});
