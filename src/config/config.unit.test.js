/**
 * @file config.unit.test.js
 * @description Unit tests for the config instance that provides centralized configuration access.
 * @path src/config/config.unit.test.js
 */

import config from './config.js';

// Mock the dependencies
jest.mock('./constants', () => Object.freeze({
  referToModuleBy: 'title',
  errors: {
    separator: ' || ',
    pattern: '{{module}}{{caller}}{{error}}{{stack}}'
  },
  context: {
    sync: {
      defaults: {
        autoSync: true,
        syncStrategy: 'mergeNewerWins'
      }
    },
    external: {
      defaults: {
        rootIdentifier: 'module',
        pathFromRoot: 'context'
      },
      rootMap: {
        window: 'globalNamespace.window',
        game: 'globalNamespace.game',
        module: 'module'
      }
    },
    operationsParams: {
      defaults: {
        alwaysPullBeforeGetting: false,
        alwaysPushAfterSetting: false
      }
    }
  },
  contextHelpers: {
    mergeStrategies: {
      MERGE_NEWER_WINS: 'mergeNewerWins',
      MERGE_SOURCE_WINS: 'mergeSourceWins'
    },
    comparisonResults: {
      SOURCE_NEWER: 'sourceNewer',
      TARGET_NEWER: 'targetNewer',
      EQUAL: 'equal'
    }
  },
  testConstant: 'testValue'
}));

jest.mock('./manifest', () => Object.freeze({
  id: 'test-module',
  title: 'Test Module',
  description: 'A test module for unit testing',
  version: '1.0.0',
  compatibility: {
    minimum: '11',
    verified: '12'
  },
  authors: [{ name: 'Test Author' }]
}));

describe('Config', () => {
  describe('Instance Properties', () => {
    it('should be a valid config object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have constants property', () => {
      expect(config.constants).toBeDefined();
      expect(typeof config.constants).toBe('object');
    });

    it('should have manifest property', () => {
      expect(config.manifest).toBeDefined();
      expect(typeof config.manifest).toBe('object');
    });

    it('should have all expected manifest properties', () => {
      expect(config.manifest.id).toBe('test-module');
      expect(config.manifest.title).toBe('Test Module');
      expect(config.manifest.description).toBe('A test module for unit testing');
      expect(config.manifest.version).toBe('1.0.0');
    });
  });

  describe('Constants Access', () => {
    it('should provide access to referToModuleBy', () => {
      expect(config.constants.referToModuleBy).toBe('title');
    });

    it('should provide access to error configuration', () => {
      expect(config.constants.errors).toBeDefined();
      expect(config.constants.errors.separator).toBe(' || ');
      expect(config.constants.errors.pattern).toBe('{{module}}{{caller}}{{error}}{{stack}}');
    });

    it('should provide access to context configuration', () => {
      expect(config.constants.context).toBeDefined();
      expect(config.constants.context.sync).toBeDefined();
      expect(config.constants.context.sync.defaults.autoSync).toBe(true);
    });

    it('should provide access to context helpers', () => {
      expect(config.constants.contextHelpers).toBeDefined();
      expect(config.constants.contextHelpers.mergeStrategies).toBeDefined();
      expect(config.constants.contextHelpers.comparisonResults).toBeDefined();
    });

    it('should provide access to nested configuration', () => {
      expect(config.constants.context.external.rootMap.window).toBe('globalNamespace.window');
      expect(config.constants.context.external.rootMap.game).toBe('globalNamespace.game');
      expect(config.constants.context.external.rootMap.module).toBe('module');
    });

    it('should provide access to test constants', () => {
      expect(config.constants.testConstant).toBe('testValue');
    });
  });

  describe('Manifest Access', () => {
    it('should provide access to module id', () => {
      expect(config.manifest.id).toBe('test-module');
    });

    it('should provide access to module title', () => {
      expect(config.manifest.title).toBe('Test Module');
    });

    it('should provide access to module version', () => {
      expect(config.manifest.version).toBe('1.0.0');
    });

    it('should provide access to module description', () => {
      expect(config.manifest.description).toBe('A test module for unit testing');
    });

    it('should provide access to compatibility information', () => {
      expect(config.manifest.compatibility).toBeDefined();
      expect(config.manifest.compatibility.minimum).toBe('11');
      expect(config.manifest.compatibility.verified).toBe('12');
    });

    it('should provide access to author information', () => {
      expect(config.manifest.authors).toBeDefined();
      expect(Array.isArray(config.manifest.authors)).toBe(true);
      expect(config.manifest.authors[0].name).toBe('Test Author');
    });
  });

  describe('Object Properties', () => {
    it('should have frozen constants object', () => {
      expect(Object.isFrozen(config.constants)).toBe(true);
    });

    it('should have frozen manifest object', () => {
      expect(Object.isFrozen(config.manifest)).toBe(true);
    });

    it('should maintain same references on repeated access', () => {
      const constants1 = config.constants;
      const constants2 = config.constants;
      const manifest1 = config.manifest;
      const manifest2 = config.manifest;

      expect(constants1).toBe(constants2);
      expect(manifest1).toBe(manifest2);
    });
  });

  describe('Integration', () => {
    it('should provide unified access to both constants and manifest', () => {
      // Test that we can access both through the same config object
      const moduleInfo = {
        id: config.manifest.id,
        title: config.manifest.title,
        errorPattern: config.constants.errors.pattern,
        syncDefaults: config.constants.context.sync.defaults
      };

      expect(moduleInfo.id).toBe('test-module');
      expect(moduleInfo.title).toBe('Test Module');
      expect(moduleInfo.errorPattern).toBe('{{module}}{{caller}}{{error}}{{stack}}');
      expect(moduleInfo.syncDefaults.autoSync).toBe(true);
    });

    it('should work with typical module initialization patterns', () => {
      // Simulate common usage patterns
      const moduleSetup = {
        moduleId: config.manifest.id,
        moduleTitle: config.manifest.title,
        errorSeparator: config.constants.errors.separator,
        contextDefaults: config.constants.context.sync.defaults,
        rootMap: config.constants.context.external.rootMap
      };

      expect(moduleSetup.moduleId).toBe('test-module');
      expect(moduleSetup.moduleTitle).toBe('Test Module');
      expect(moduleSetup.errorSeparator).toBe(' || ');
      expect(moduleSetup.contextDefaults.autoSync).toBe(true);
      expect(moduleSetup.rootMap.module).toBe('module');
    });
  });

  describe('Consistency', () => {
    it('should maintain singleton pattern', () => {
      // Since we're importing the same config instance, these should be identical
      const config1 = config;
      const config2 = config;

      expect(config1).toBe(config2);
      expect(config1.constants).toBe(config2.constants);
      expect(config1.manifest).toBe(config2.manifest);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing properties gracefully', () => {
      // Even if properties are missing from mocks, the config should still work
      expect(() => {
        const nonExistent = config.constants.nonExistentProperty;
        const alsoNonExistent = config.manifest.nonExistentProperty;
      }).not.toThrow();
    });
  });
});
