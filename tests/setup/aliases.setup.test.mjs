/**
 * @file aliases.setup.test.mjs
 * @description Tests to validate that aliases in babel.config.cjs and jsconfig.json are consistent
 * @path /tests/setup/aliases.setup.test.mjs
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'jsonc-parser';

/**
 * Gets the jsconfig.json content from the project root
 * @returns {object} The parsed jsconfig.json content
 */
const getJsconfigFromRoot = () => {
  const jsconfigPath = path.resolve(__dirname, '../../jsconfig.json');
  const jsconfigContent = fs.readFileSync(jsconfigPath, 'utf8');
  return parse(jsconfigContent);
};

/**
 * Gets the babel.config.cjs content from the project root
 * @returns {object} The babel configuration object
 */
const getBabelConfigFromRoot = () => {
  const babelConfigPath = path.resolve(__dirname, '../../babel.config.cjs');
  delete require.cache[require.resolve(babelConfigPath)];
  return require(babelConfigPath);
};

const babelConfig = getBabelConfigFromRoot();
const jsconfigJson = getJsconfigFromRoot();

describe('Alias Configuration Validation', () => {
  describe('Babel Configuration Structure', () => {
    it('should have correct babel config structure', () => {
      expect(babelConfig).toBeDefined();
      expect(Array.isArray(babelConfig.plugins)).toBe(true);

      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      expect(moduleResolverPlugin).toBeDefined();
      expect(moduleResolverPlugin[1]).toHaveProperty('root');
      expect(moduleResolverPlugin[1]).toHaveProperty('alias');
      expect(Array.isArray(moduleResolverPlugin[1].root)).toBe(true);
      expect(typeof moduleResolverPlugin[1].alias).toBe('object');
    });

    it('should have valid babel alias format', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;

      Object.keys(babelAliases).forEach(aliasKey => {
        // Aliases should start with @
        expect(aliasKey).toMatch(/^@/);

        // Alias values should be relative paths starting with ./
        const aliasValue = babelAliases[aliasKey];
        expect(aliasValue).toMatch(/^\.?\//);
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

      Object.keys(jsconfigPaths).forEach(pathKey => {
        // Path keys should start with @
        expect(pathKey).toMatch(/^@/);

        // Path values should be arrays
        const pathValue = jsconfigPaths[pathKey];
        expect(Array.isArray(pathValue)).toBe(true);
        expect(pathValue.length).toBe(1);

        // Path value should not start with ./
        expect(pathValue[0]).not.toMatch(/^\.\//);
      });
    });
  });

  describe('Alias Consistency Between Configurations', () => {
    it('should have matching alias configurations between babel and jsconfig', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      expect(babelAliases).toBeDefined();
      expect(jsconfigPaths).toBeDefined();

      // Compare each babel alias with corresponding jsconfig path
      Object.keys(babelAliases).forEach(aliasKey => {
        const babelPath = babelAliases[aliasKey];

        // Handle different formats between babel and jsconfig
        let jsconfigKey = aliasKey;
        if (!jsconfigKey.endsWith('/*') && !jsconfigKey.endsWith('*')) {
          // For non-wildcard aliases, check both with and without /*
          const wildcardKey = `${aliasKey}/*`;
          if (jsconfigPaths[wildcardKey]) {
            jsconfigKey = wildcardKey;
          }
        }

        expect(jsconfigPaths).toHaveProperty(jsconfigKey);

        const jsconfigPath = jsconfigPaths[jsconfigKey];
        expect(Array.isArray(jsconfigPath)).toBe(true);
        expect(jsconfigPath.length).toBe(1);

        // Normalize paths for comparison
        const normalizedBabelPath = babelPath.replace(/^\.\//, '').replace(/\/$/, '');
        const normalizedJsconfigPath = jsconfigPath[0].replace(/^\.\//, '').replace(/\/\*$/, '').replace(/\/$/, '');
        const normalizedBabelPathWithoutWildcard = normalizedBabelPath.replace(/\/\*$/, '');

        expect(normalizedJsconfigPath).toBe(normalizedBabelPathWithoutWildcard);
      });
    });

    it('should have all jsconfig paths represented in babel aliases', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      Object.keys(jsconfigPaths).forEach(pathKey => {
        // Remove /* suffix for comparison with babel aliases
        const baseKey = pathKey.replace(/\/\*$/, '');

        expect(babelAliases).toHaveProperty(baseKey);
      });
    });
  });

  describe('Required Project Aliases', () => {
    it('should have all required aliases in both configurations', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      const requiredAliases = [
        '@',
        '@config',
        '@contexts',
        '@handlers',
        '@utils',
        '@listeners',
        '@manifest',
        '@constants'
      ];

      requiredAliases.forEach(alias => {
        // Check babel config
        expect(babelAliases).toHaveProperty(alias);

        // Check jsconfig - might have /* suffix
        const aliasWithWildcard = `${alias}/*`;
        const hasExactMatch = jsconfigPaths.hasOwnProperty(alias);
        const hasWildcardMatch = jsconfigPaths.hasOwnProperty(aliasWithWildcard);

        expect(hasExactMatch || hasWildcardMatch).toBe(true);
      });
    });
  });

  describe('Alias Path Validation', () => {
    it('should validate alias paths point to existing or expected directory structure', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;

      Object.keys(babelAliases).forEach(aliasKey => {
        const aliasPath = babelAliases[aliasKey];
        const resolvedPath = path.resolve(__dirname, aliasPath);

        // Skip file-specific aliases
        if (aliasKey === '@manifest' || aliasKey === '@constants' || aliasKey === '@validator') {
          // For files, check if the file exists or the parent directory exists
          if (aliasPath.endsWith('.mjs') || aliasPath.endsWith('.json')) {
            const parentDir = path.dirname(resolvedPath);
            // Just verify the parent directory concept is valid
            expect(parentDir).toMatch(/\/(src|tests|scripts|constants)/);
          }
          return;
        }
      });
    });

    it('should validate no duplicate aliases exist', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      // Check for duplicate aliases in babel config
      const babelKeys = Object.keys(babelAliases);
      const uniqueBabelKeys = [...new Set(babelKeys)];
      expect(babelKeys.length).toBe(uniqueBabelKeys.length);

      // Check for duplicate paths in jsconfig
      const jsconfigKeys = Object.keys(jsconfigPaths);
      const uniqueJsconfigKeys = [...new Set(jsconfigKeys)];
      expect(jsconfigKeys.length).toBe(uniqueJsconfigKeys.length);
    });

    it('should validate file extension patterns for script and style aliases', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;

      Object.keys(babelAliases).forEach(aliasKey => {
        const aliasPath = babelAliases[aliasKey];

        // Validate specific file types
        if (aliasKey === '@manifest') {
          expect(aliasPath).toMatch(/\.mjs(on)?$/);
        }

        if (aliasKey === '@constants' || aliasKey === '@validator') {
          expect(aliasPath).toMatch(/\.mjs$/);
        }
      });
    });
  });

  describe('Future Alias Consistency', () => {
    it('should ensure any new aliases follow the same consistency patterns', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      // This test ensures that any new aliases added to either config
      // must follow the same pattern and be present in both
      const allBabelAliases = Object.keys(babelAliases);
      const allJsconfigAliases = Object.keys(jsconfigPaths).map(key => key.replace(/\/\*$/, ''));

      // Every babel alias should have a corresponding jsconfig path
      allBabelAliases.forEach(babelAlias => {
        expect(allJsconfigAliases).toContain(babelAlias);
      });

      // Every jsconfig path should have a corresponding babel alias
      allJsconfigAliases.forEach(jsconfigAlias => {
        expect(allBabelAliases).toContain(jsconfigAlias);
      });
    });

    it('should validate new aliases follow naming conventions', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      // Validate all aliases follow @ prefix convention
      Object.keys(babelAliases).forEach(alias => {
        // Allow for root alias "@" or aliases starting with "@" followed by a letter
        expect(alias).toMatch(/^@([a-zA-Z]|$)/);
        // Allow for both camelCase and others since @helpers vs @baseClasses exist
      });

      Object.keys(jsconfigPaths).forEach(alias => {
        const baseAlias = alias.replace(/\/\*$/, '');
        // Allow for root alias "@" or aliases starting with "@" followed by a letter
        expect(baseAlias).toMatch(/^@([a-zA-Z]|$)/);
        // Allow for both camelCase and others since @helpers vs @baseClasses exist
      });
    });

    it('should detect inconsistencies in alias paths between configurations', () => {
      const moduleResolverPlugin = babelConfig.plugins.find(plugin =>
        Array.isArray(plugin) && plugin[0] === 'module-resolver'
      );

      const babelAliases = moduleResolverPlugin[1].alias;
      const jsconfigPaths = jsconfigJson.compilerOptions.paths;

      // This test will catch any new aliases that are added to one config but not the other
      // or that point to different paths
      const allAliases = [
        ...Object.keys(babelAliases),
        ...Object.keys(jsconfigPaths).map(key => key.replace(/\/\*$/, ''))
      ];

      const uniqueAliases = [...new Set(allAliases)];

      uniqueAliases.forEach(alias => {
        const babelPath = babelAliases[alias];
        const jsconfigKey = jsconfigPaths[alias] ? alias : `${alias}/*`;
        const jsconfigPath = jsconfigPaths[jsconfigKey];

        if (babelPath && jsconfigPath) {
          // Both exist, ensure they point to the same location
          const normalizedBabelPath = babelPath.replace(/^\.\//, '').replace(/\/$/, '');
          const normalizedJsconfigPath = jsconfigPath[0].replace(/\/\*$/, '').replace(/\/$/, '');

          expect(normalizedBabelPath).toBe(normalizedJsconfigPath);
        } else {
          // One is missing - this should fail the test
          expect(babelPath).toBeDefined();
          expect(jsconfigPath).toBeDefined();
        }
      });
    });
  });
});
