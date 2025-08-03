import config from '@/config/config';

describe('Config Integration Test', () => {
  describe('Constants Integration', () => {
    it('should correctly load and parse constants.yaml through config', () => {
      // Check if the testConstant exists and has the correct value
      expect(config.constants.testConstant).toBeDefined();
      expect(config.constants.testConstant).toBe('testValue');
    });

    it('should have the context schema parsed as an object through config', () => {
      expect(config.constants.context).toBeDefined();
      expect(config.constants.context.schema).toBeDefined();
      // Check if it's a plain object (no longer using Zod schema)
      expect(typeof config.constants.context.schema).toBe('object');
      expect(config.constants.context.schema).not.toBeNull();
    });

    it('should load other values from constants.yaml through config', () => {
      expect(config.constants.moduleManagement.referToModuleBy).toBeDefined();
      expect(config.constants.errors).toBeDefined();
      expect(config.constants.errors.separator).toBeDefined();
      expect(config.constants.placeables).toBeDefined();
      expect(config.constants.placeables.token).toBeDefined();
      expect(config.constants.placeables.token.name).toBe('Token');
    });

    it('should provide access to all context configuration', () => {
      expect(config.constants.context.sync).toBeDefined();
      expect(config.constants.context.operationsParams).toBeDefined();
      expect(config.constants.context.helpers).toBeDefined();
    });

    it('should provide access to context helper constants', () => {
      expect(config.constants.context.helpers).toBeDefined();
      expect(config.constants.context.helpers.mergeStrategies).toBeDefined();
      expect(config.constants.context.helpers.comparisonResults).toBeDefined();
    });
  });

  describe('Manifest Integration', () => {
    it('should load and validate manifest through config', () => {
      expect(config.manifest).toBeDefined();
      expect(config.manifest.id).toBeDefined();
      expect(config.manifest.title).toBeDefined();
      expect(config.manifest.version).toBeDefined();
      expect(config.manifest.description).toBeDefined();
    });

    it('should provide validated manifest with required attributes', () => {
      // These attributes should be validated against the constants requirements
      expect(typeof config.manifest.id).toBe('string');
      expect(typeof config.manifest.title).toBe('string');
      expect(typeof config.manifest.version).toBe('string');
      expect(typeof config.manifest.description).toBe('string');
    });

    it('should have manifest as frozen object', () => {
      expect(Object.isFrozen(config.manifest)).toBe(true);
    });
  });

  describe('Config Integration Patterns', () => {
    it('should support complete module initialization workflow', () => {
      // Test the integration pattern for module initialization
      const moduleConfig = {
        id: config.manifest.id,
        title: config.manifest.title,
        version: config.manifest.version,
        referenceBy: config.constants.moduleManagement.referToModuleBy,
        errorSeparator: config.constants.errors.separator,
        contextDefaults: config.constants.context.sync.defaults
      };

      expect(moduleConfig.id).toBeDefined();
      expect(moduleConfig.title).toBeDefined();
      expect(moduleConfig.version).toBeDefined();
      expect(moduleConfig.referenceBy).toBeDefined();
      expect(moduleConfig.errorSeparator).toBeDefined();
      expect(moduleConfig.contextDefaults).toBeDefined();
    });

    it('should support error formatter configuration', () => {
      const errorConfig = {
        pattern: config.constants.errors.pattern,
        separator: config.constants.errors.separator,
        moduleTitle: config.manifest.title
      };

      expect(errorConfig.pattern).toBeDefined();
      expect(errorConfig.separator).toBeDefined();
      expect(errorConfig.moduleTitle).toBeDefined();
    });

    it('should support context manager configuration', () => {
      const contextConfig = {
        moduleId: config.manifest.id,
        syncDefaults: config.constants.context.sync.defaults,
        operationsDefaults: config.constants.context.operationsParams.defaults,
        mergeStrategies: config.constants.context.helpers.mergeStrategies
      };

      expect(contextConfig.moduleId).toBeDefined();
      expect(contextConfig.syncDefaults).toBeDefined();
      expect(contextConfig.operationsDefaults).toBeDefined();
      expect(contextConfig.mergeStrategies).toBeDefined();
    });
  });

  describe('Config Consistency', () => {
    it('should provide consistent data across config instance', () => {
      // Since config is a singleton, these should be identical
      const config1 = config;
      const config2 = config;

      expect(config1.constants.moduleManagement.referToModuleBy).toBe(config2.constants.moduleManagement.referToModuleBy);
      expect(config1.manifest.id).toBe(config2.manifest.id);
      expect(config1.manifest.title).toBe(config2.manifest.title);
      expect(config1).toBe(config2);
    });

    it('should maintain immutability', () => {
      // Objects should be frozen
      expect(Object.isFrozen(config.constants)).toBe(true);
      expect(Object.isFrozen(config.manifest)).toBe(true);
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should handle complete foundry module setup', () => {
      // Simulate a real foundry module setup using config
      const foundryModuleSetup = {
        manifest: config.manifest,
        settings: {
          debugMode: config.constants.settings.find(s => s.key === 'debugMode'),
          useModule: config.constants.settings.find(s => s.key === 'useModule')
        },
        context: {
          syncStrategy: config.constants.context.sync.defaults.syncStrategy,
          mergeStrategies: config.constants.context.helpers.mergeStrategies
        }
      };

      // Verify all required data is present
      expect(foundryModuleSetup.manifest.id).toBeDefined();
      expect(foundryModuleSetup.manifest.title).toBeDefined();
      expect(foundryModuleSetup.manifest.version).toBeDefined();
      expect(foundryModuleSetup.settings.debugMode).toBeDefined();
      expect(foundryModuleSetup.settings.useModule).toBeDefined();
      expect(foundryModuleSetup.context.syncStrategy).toBeDefined();
      expect(foundryModuleSetup.context.mergeStrategies).toBeDefined();
    });

    it('should support hooks configuration', () => {
      // Test hook-related configuration access
      const hookConfig = {
        moduleId: config.manifest.id,
        moduleTitle: config.manifest.title,
        errorSeparator: config.constants.errors.separator
      };

      expect(hookConfig.moduleId).toBeDefined();
      expect(hookConfig.moduleTitle).toBeDefined();
      expect(hookConfig.errorSeparator).toBeDefined();
    });
  });
});