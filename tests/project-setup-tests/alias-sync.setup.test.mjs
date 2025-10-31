/**
 * @file alias-sync.setup.test.mjs
 * @description Validates that all configuration files maintain synchronized alias definitions
 * @path tests/project-setup-tests/alias-sync.setup.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { AdapterRegistry } from '#/utils/alias-adapters/adapter-registry.mjs';
import { TsConfigAdapter } from '#/utils/alias-adapters/tsconfig-adapter.mjs';
import { PackageJsonAdapter } from '#/utils/alias-adapters/package-json-adapter.mjs';
import { ViteConfigAdapter } from '#/utils/alias-adapters/vite-adapter.mjs';
import { VitestConfigAdapter } from '#/utils/alias-adapters/vitest-adapter.mjs';
import { normalizeFromAliasConfig } from '#/utils/alias-adapters/normalization-helpers.mjs';
import aliasEntries from '../../alias.config.mjs';

const projectRoot = resolve(process.cwd());

// Normalize expected aliases from alias.config.mjs
const expectedAliases = normalizeFromAliasConfig(aliasEntries, projectRoot);

describe('Alias synchronization validation', () => {
  describe('tsconfig.json paths', () => {
    it('matches alias.config.mjs', async () => {
      const adapter = new TsConfigAdapter(projectRoot);
      const result = await adapter.validate(expectedAliases);

      if (!result.valid) {
        const message = `
tsconfig.json paths are out of sync with alias.config.mjs

Expected:
${JSON.stringify(expectedAliases, null, 2)}

Current:
${JSON.stringify(result.diff.current, null, 2)}

Diff:
${result.diff.formatted}

Fix with: npm run sync-aliases
`;
        expect.fail(message);
      }

      expect(result.valid).toBe(true);
    });
  });

  describe('package.json imports', () => {
    it('matches alias.config.mjs', async () => {
      const adapter = new PackageJsonAdapter(projectRoot);
      const result = await adapter.validate(expectedAliases);

      if (!result.valid) {
        const message = `
package.json imports are out of sync with alias.config.mjs

Expected:
${JSON.stringify(expectedAliases, null, 2)}

Current:
${JSON.stringify(result.diff.current, null, 2)}

Diff:
${result.diff.formatted}

Fix with: npm run sync-aliases
`;
        expect.fail(message);
      }

      expect(result.valid).toBe(true);
    });
  });

  describe('vite.config.mjs', () => {
    it('correctly imports from alias.config.mjs', async () => {
      const adapter = new ViteConfigAdapter(projectRoot);
      const result = await adapter.validate(expectedAliases);

      if (!result.valid) {
        const message = `
vite.config.mjs does not correctly import from alias.config.mjs

${result.diff.formatted}

Ensure vite.config.mjs contains:
  import aliasEntries from './alias.config.mjs';

  resolve: {
    alias: aliasEntries,
  },
`;
        expect.fail(message);
      }

      expect(result.valid).toBe(true);
    });
  });

  describe('vitest.config.mjs', () => {
    it('correctly imports from alias.config.mjs', async () => {
      const adapter = new VitestConfigAdapter(projectRoot);
      const result = await adapter.validate(expectedAliases);

      if (!result.valid) {
        const message = `
vitest.config.mjs does not correctly import from alias.config.mjs

${result.diff.formatted}

Ensure vitest.config.mjs contains:
  import aliasEntries from './alias.config.mjs';

  resolve: {
    alias: aliasEntries,
  },
`;
        expect.fail(message);
      }

      expect(result.valid).toBe(true);
    });
  });

  describe('AdapterRegistry integration', () => {
    it('registers all adapters without conflicts', () => {
      const registry = new AdapterRegistry();
      registry.clear();

      expect(() => {
        registry.register(new TsConfigAdapter(projectRoot));
        registry.register(new PackageJsonAdapter(projectRoot));
        registry.register(new ViteConfigAdapter(projectRoot));
        registry.register(new VitestConfigAdapter(projectRoot));
      }).not.toThrow();

      expect(registry.getAll()).toHaveLength(4);
      expect(registry.getSupportedFormats()).toEqual([
        'jsonc',
        'json',
        'vite',
        'vitest',
      ]);
    });
  });
});
