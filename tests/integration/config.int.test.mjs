/**
 * @file Config Integration Tests
 * @description Integration tests for Config singleton with real project files
 * @path tests/integration/config.int.test.mjs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Config Integration Tests - Real Project Files', () => {
  // We test with the real files to ensure the actual config works

  describe('Config Initialization', () => {
    it('should initialize Config singleton successfully', async () => {
      // Dynamically import to get fresh instance
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config).toBeDefined();
      expect(config).not.toBeNull();
      expect(typeof config).toBe('object');
    });

    it('should have all required properties', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config).toHaveProperty('constants');
      expect(config).toHaveProperty('settings');
      expect(config).toHaveProperty('module');
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('toString');
    });

    it('should load module manifest with correct ID', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.module).toBeDefined();
      expect(config.module.id).toBe('foundryvtt-over-my-head');
    });

    it('should load YAML constants with all namespaces', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.constants).toBeDefined();
      expect(typeof config.constants).toBe('object');

      // Each YAML file should be a namespace
      expect(config.constants).toHaveProperty('errors');
      expect(config.constants).toHaveProperty('foundry');
      expect(config.constants).toHaveProperty('hooks');
      expect(config.constants).toHaveProperty('moduleManagement');
    });

    it('should load settings as array', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.settings).toBeDefined();
      expect(Array.isArray(config.settings)).toBe(true);
    });

    it('should load environment variables as object', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.env).toBeDefined();
      expect(typeof config.env).toBe('object');
    });
  });

  describe('Constants Structure', () => {
    it('should have errors constants with separator', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.constants.errors).toBeDefined();
      expect(config.constants.errors).toHaveProperty('separator');
      expect(typeof config.constants.errors.separator).toBe('string');
    });

    it('should have foundry constants with defaults', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.constants.foundry).toBeDefined();
      expect(config.constants.foundry).toHaveProperty('defaults');
    });

    it('should have hooks constants', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.constants.hooks).toBeDefined();
      expect(typeof config.constants.hooks).toBe('object');
    });

    it('should have moduleManagement constants with shortName', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.constants.moduleManagement).toBeDefined();
      expect(config.constants.moduleManagement).toHaveProperty('shortName');
      expect(config.constants.moduleManagement.shortName).toBe('OMH');
    });
  });

  describe('Module Manifest', () => {
    it('should have module title', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.module).toHaveProperty('title');
      expect(config.module.title).toBeTruthy();
    });

    it('should have module version', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.module).toHaveProperty('version');
      expect(typeof config.module.version).toBe('string');
    });

    it('should have compatibility information', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(config.module).toHaveProperty('compatibility');
      expect(config.module.compatibility).toHaveProperty('minimum');
    });
  });

  describe('Immutability', () => {
    it('config object should be frozen', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(Object.isFrozen(config)).toBe(true);
    });

    it('config.constants should be frozen', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(Object.isFrozen(config.constants)).toBe(true);
    });

    it('nested config objects should be frozen', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      if (
        config.constants.foundry &&
        typeof config.constants.foundry === 'object'
      ) {
        expect(Object.isFrozen(config.constants.foundry)).toBe(true);
      }
    });

    it('should not allow modifications to config properties', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const originalValue = config.module.id;

      // In strict mode this would throw, in loose mode it fails silently
      config.module.id = 'modified-value';

      // Verify the value hasn't changed
      expect(config.module.id).toBe(originalValue);
    });

    it('should not allow adding new properties', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      config.newProperty = 'test-value';

      // Verify property was not added
      expect(config.newProperty).toBeUndefined();
    });

    it('should not allow deleting properties', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const hadId = 'id' in config.module;
      delete config.module.id;

      // Verify property is still there
      expect('id' in config.module).toBe(hadId);
    });
  });

  describe('Environment Variables', () => {
    it('env object should contain only OMH-prefixed variables', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const envKeys = Object.keys(config.env);

      // Check all env vars have the correct prefix
      for (const key of envKeys) {
        expect(key).toMatch(/^OMH_/);
      }
    });

    it('env values should be strings', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const envValues = Object.values(config.env);

      for (const value of envValues) {
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('toString Method', () => {
    it('should have a toString method', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(typeof config.toString).toBe('function');
    });

    it('toString should return a descriptive string', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const str = config.toString();

      expect(typeof str).toBe('string');
      expect(str).toContain('Config');
      expect(str).toContain('OMH');
      expect(str).toContain('foundryvtt-over-my-head');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple imports', async () => {
      const module1 = await import('../../src/config/config.ts');
      const module2 = await import('../../src/config/config.ts');

      // Both should reference the same singleton
      expect(module1.config === module2.config).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('config properties should have correct types', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      expect(typeof config.constants).toBe('object');
      expect(
        Array.isArray(config.settings) || typeof config.settings === 'object'
      ).toBe(true);
      expect(typeof config.module).toBe('object');
      expect(typeof config.env).toBe('object');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing environment variables gracefully', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      // Accessing a non-existent env var should return undefined
      expect(config.env.OMH_NONEXISTENT).toBeUndefined();
    });

    it('should handle empty settings array gracefully', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      // Settings should be iterable even if empty
      if (Array.isArray(config.settings)) {
        expect(() => {
          config.settings.forEach(() => {});
        }).not.toThrow();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle constants with empty YAML files', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      // If any constant file is empty, it should still load as an empty object
      expect(config.constants).toBeDefined();

      for (const value of Object.values(config.constants)) {
        expect(value === null || typeof value === 'object').toBe(true);
      }
    });

    it('should have logging prefix from moduleManagement', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const prefix = config.constants.moduleManagement.shortName;
      expect(prefix).toBe('OMH');
    });
  });
});
