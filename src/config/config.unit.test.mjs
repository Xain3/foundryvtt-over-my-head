import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

function loadAlias(relativePath) {
  return async () => import(new URL(relativePath, import.meta.url).href);
}

vi.mock('@helpers/pathUtils.mjs', loadAlias('../helpers/pathUtils.mjs'));

import config from './config.mjs';

describe('Config.exportConstants', () => {
  beforeEach(() => {
    // Clear all possible global constants before each test
    Object.keys(globalThis).forEach(key => {
      if (key.endsWith('Constants')) {
        delete globalThis[key];
      }
    });
    // Mock console methods to capture output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up all possible global constants after each test
    Object.keys(globalThis).forEach(key => {
      if (key.endsWith('Constants')) {
        delete globalThis[key];
      }
    });
    // Restore console methods
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  it('should export constants to global scope with dynamic variable name', () => {
    // Get the expected variable name based on shortName
    const shortName = config.constants.moduleManagement?.shortName || 'OMH'; // OMH from "OverMyHead"
    const expectedVariableName = `${shortName}Constants`;

    // Ensure global constants don't exist initially
    expect(globalThis[expectedVariableName]).toBeUndefined();

    // Export constants
    config.exportConstants();

    // Verify constants are exported with correct variable name
    expect(globalThis[expectedVariableName]).toBeDefined();
    expect(globalThis[expectedVariableName]).toBe(config.constants);
    expect(console.log).toHaveBeenCalledWith(`OverMyHead: Constants exported to global scope as ${expectedVariableName}.`);
  });

  it('should warn when constants are already exported with same variable name', () => {
    // Get the expected variable name
    const shortName = config.constants.moduleManagement?.shortName || 'OMH';
    const expectedVariableName = `${shortName}Constants`;

    // Pre-populate global constants
    globalThis[expectedVariableName] = { existing: 'constants' };

    // Export constants
    config.exportConstants();

    // Verify warning was logged and constants were not overwritten
    expect(console.warn).toHaveBeenCalledWith(`OverMyHead: Constants already exported to global scope as ${expectedVariableName}.`);
    expect(globalThis[expectedVariableName]).toEqual({ existing: 'constants' });
  });

  it('should export the same reference as config.constants', () => {
    // Get the expected variable name
    const shortName = config.constants.moduleManagement?.shortName || 'OMH';
    const expectedVariableName = `${shortName}Constants`;

    config.exportConstants();

    // Verify the global reference is exactly the same object
    expect(globalThis[expectedVariableName]).toBe(config.constants);
  });

  it('should allow access to nested constants properties globally', () => {
    // Get the expected variable name
    const shortName = config.constants.moduleManagement?.shortName || 'OMH';
    const expectedVariableName = `${shortName}Constants`;

    config.exportConstants();

    // Test access to nested properties
    expect(globalThis[expectedVariableName].errors.pattern).toBe('{{module}}{{caller}}{{error}}{{stack}}');
    expect(globalThis[expectedVariableName].moduleManagement.referToModuleBy).toBe('title');
  });
});

describe('Config.buildManifestWithShortName', () => {
  it('should return a frozen manifest object that includes shortName from constants', () => {
    const result = config.buildManifestWithShortName();

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result.shortName).toBeDefined();
    expect(result.shortName).toBe(config.constants.moduleManagement.shortName);
    expect(Object.isFrozen(result)).toBe(true);
  });
});

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
      expect(config.manifest.id).toBe('foundryvtt-over-my-head');
      expect(config.manifest.title).toBe('OverMyHead');
      expect(config.manifest.description).toBe('A Foundry VTT module for managing vision occlusion with fade effects when a token is under a tile');
      const versioningPattern = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9-.]+)?(?:\+[A-Za-z0-9-.]+)?$/;
      expect(config.manifest.version).toMatch(versioningPattern);
    });
  });

  describe('Constants Access', () => {
    it('should provide access to moduleManagement.referToModuleBy', () => {
      expect(config.constants.moduleManagement.referToModuleBy).toBe('title');
    });

    it('should provide access to error configuration', () => {
      expect(config.constants.errors).toBeDefined();
      expect(config.constants.errors.separator).toBe(' || ');
      expect(config.constants.errors.pattern).toBe('{{module}}{{caller}}{{error}}{{stack}}');
    });

    it('should provide access to context configuration', () => {
      expect(config.constants.context).toBeDefined();
      expect(config.constants.context.operationsParams).toBeDefined();
      expect(config.constants.context.operationsParams.defaults.alwaysPullBeforeGetting).toBe(false);
    });

    it('should provide access to context helpers', () => {
      expect(config.constants.context.helpers).toBeDefined();
      expect(config.constants.context.helpers.mergeStrategies).toBeDefined();
      expect(config.constants.context.helpers.comparisonResults).toBeDefined();
    });

    it('should provide access to nested configuration', () => {
      expect(config.constants.foundry.defaults.i18nLocation).toBe('game.i18n');
      expect(config.constants.moduleManagement.defaults.modulesLocation).toBe('game.modules');
    });
  });

  describe('Manifest Access', () => {
    it('should provide access to module id', () => {
      expect(config.manifest.id).toBe('foundryvtt-over-my-head');
    });

    it('should provide access to module title', () => {
      expect(config.manifest.title).toBe('OverMyHead');
    });

    it('should provide access to module version', () => {
      const versioningPattern = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9-.]+)?(?:\+[A-Za-z0-9-.]+)?$/;
      expect(config.manifest.version).toMatch(versioningPattern);
    });

    it('should provide access to compatibility information', () => {
      expect(config.manifest.compatibility).toBeDefined();
      expect(config.manifest.compatibility.minimum).toBe('12');
    });

    it('should provide access to author information', () => {
      expect(config.manifest.authors).toBeDefined();
      expect(Array.isArray(config.manifest.authors)).toBe(true);
      expect(config.manifest.authors[0].name).toBe('Xain_it');
    });
  });

  describe('Integration', () => {
    it('should provide unified access to both constants and manifest', () => {
      // Test that we can access both through the same config object
      const moduleInfo = {
        id: config.manifest.id,
        title: config.manifest.title,
        errorPattern: config.constants.errors.pattern,
        errorSeparator: config.constants.errors.separator
      };

      expect(moduleInfo.id).toBe('foundryvtt-over-my-head');
      expect(moduleInfo.title).toBe('OverMyHead');
      expect(moduleInfo.errorPattern).toBe('{{module}}{{caller}}{{error}}{{stack}}');
      expect(moduleInfo.errorSeparator).toBe(' || ');
    });

    it('should work with typical module initialization patterns', () => {
      // Test common patterns that modules might use
      const moduleSetup = {
        moduleId: config.manifest.id,
        moduleTitle: config.manifest.title,
        errorSeparator: config.constants.errors.separator,
        moduleDefaults: config.constants.moduleManagement.defaults,
        foundryDefaults: config.constants.foundry.defaults
      };

      expect(moduleSetup.moduleId).toBe('foundryvtt-over-my-head');
      expect(moduleSetup.moduleTitle).toBe('OverMyHead');
      expect(moduleSetup.errorSeparator).toBe(' || ');
      expect(moduleSetup.moduleDefaults.modulesLocation).toBe('game.modules');
      expect(moduleSetup.foundryDefaults.i18nLocation).toBe('game.i18n');
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

  describe('Derived shortName and export behavior', () => {
    let originalConstants;

    beforeEach(() => {
      // Backup the original constants and clear any globallly exported constants
      originalConstants = config.constants;
      Object.keys(globalThis).forEach(key => {
        if (key.endsWith('Constants')) delete globalThis[key];
      });
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore original constants and console spies
      config.constants = originalConstants;
      console.info.mockRestore();
      console.log.mockRestore();
      console.warn.mockRestore();
      Object.keys(globalThis).forEach(key => {
        if (key.endsWith('Constants')) delete globalThis[key];
      });
    });

    it('derives a shortName when constants.moduleManagement.shortName is missing', () => {
      // Replace config.constants with a version that lacks shortName
      config.constants = { ...originalConstants, moduleManagement: { ...originalConstants.moduleManagement } };
      delete config.constants.moduleManagement.shortName;

      const result = config.buildManifestWithShortName();

      expect(result).toBeDefined();
      expect(result.shortName).toBeDefined();
      expect(typeof result.shortName).toBe('string');
      expect(console.info).toHaveBeenCalled();
    });

    it('exports constants globally using the derived shortName when none is provided', () => {
      // Ensure no explicit shortName exists and then export
      config.constants = { ...originalConstants, moduleManagement: { ...originalConstants.moduleManagement } };
      delete config.constants.moduleManagement.shortName;

      const built = config.buildManifestWithShortName();
      const variableName = `${built.shortName}Constants`;

      expect(globalThis[variableName]).toBeUndefined();

      config.exportConstants();

      expect(globalThis[variableName]).toBeDefined();
      expect(globalThis[variableName]).toBe(config.constants);
      expect(console.log).toHaveBeenCalledWith(`${config.manifest.title}: Constants exported to global scope as ${variableName}.`);
    });
  });
});