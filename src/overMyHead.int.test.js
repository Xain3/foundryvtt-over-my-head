/**
 * @file overMyHead.integration.test.js
 * @description Integration tests for OverMyHead class focusing on config usage and exportConstants migration.
 * @path src/overMyHead.integration.test.js
 */

import OverMyHead from './overMyHead.js';
import config from './config/config.js';

// Mock the Utilities class since we're testing config integration
jest.mock('./utils/utils.js', () => {
  return jest.fn().mockImplementation(() => ({
    static: {
      unpack: jest.fn()
    },
    initializer: {
      initializeDevFeatures: jest.fn()
    }
  }));
});

// Mock Hooks since we're not in Foundry environment
global.Hooks = {
  once: jest.fn((event, callback) => {
    if (event === 'init') {
      // For testing, we can call the callback immediately or store it
      // Here we'll just mock it
    }
  })
};

describe('OverMyHead Integration Tests', () => {
  let originalOMHconstants;

  beforeEach(() => {
    // Store original global constants if they exist
    originalOMHconstants = globalThis.OMHconstants;
    
    // Clear all possible global constants before each test
    Object.keys(globalThis).forEach(key => {
      if (key.endsWith('Constants')) {
        delete globalThis[key];
      }
    });
    
    // Mock console methods to capture output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original global constants
    if (originalOMHconstants !== undefined) {
      globalThis.OMHconstants = originalOMHconstants;
    } else {
      delete globalThis.OMHconstants;
    }
    
    // Clean up all possible global constants after each test
    Object.keys(globalThis).forEach(key => {
      if (key.endsWith('Constants')) {
        delete globalThis[key];
      }
    });
    
    // Restore console methods
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('Config Integration', () => {
    it('should use config instance for constants and manifest', () => {
      const overMyHead = new OverMyHead();

      // Verify OverMyHead uses config for constants and manifest
      expect(overMyHead.constants).toBe(config.constants);
      expect(overMyHead.manifest).toEqual(config.buildManifestWithShortName());
    });

    it('should have access to all config properties', () => {
      const overMyHead = new OverMyHead();

      // Test constants access
      expect(overMyHead.constants.errors).toBeDefined();
      expect(overMyHead.constants.context).toBeDefined();
      expect(overMyHead.constants.moduleManagement).toBeDefined();

      // Test manifest access
      expect(overMyHead.manifest.id).toBeDefined();
      expect(overMyHead.manifest.title).toBeDefined();
      expect(overMyHead.manifest.shortName).toBeDefined();
    });
  });

  describe('ExportConstants Migration', () => {
    it('should call config.exportConstants() during initialization', async () => {
      const overMyHead = new OverMyHead();
      
      // Spy on config.exportConstants to verify it's called
      const exportConstantsSpy = jest.spyOn(config, 'exportConstants');

      await overMyHead.init();

      expect(exportConstantsSpy).toHaveBeenCalledTimes(1);
      
      // Find the exported variable (should be dynamically named)
      const exportedVar = Object.keys(globalThis).find(key => key.endsWith('Constants') && globalThis[key] === config.constants);
      expect(exportedVar).toBeDefined();
      expect(globalThis[exportedVar]).toBe(config.constants);

      exportConstantsSpy.mockRestore();
    });

    it('should use config for constants export instead of local method', async () => {
      const overMyHead = new OverMyHead();

      // Verify OverMyHead no longer has its own exportConstants method
      expect(typeof overMyHead.exportConstants).toBe('undefined');

      // Verify config has the exportConstants method
      expect(typeof config.exportConstants).toBe('function');
    });

    it('should export correct constants structure globally with dynamic naming', async () => {
      const overMyHead = new OverMyHead();
      
      await overMyHead.init();

      // Find the exported variable
      const exportedVar = Object.keys(globalThis).find(key => key.endsWith('Constants') && globalThis[key] === config.constants);
      
      // Verify global constants have expected structure
      expect(globalThis[exportedVar]).toBeDefined();
      expect(globalThis[exportedVar].errors.separator).toBeDefined();
      expect(globalThis[exportedVar].context.sync.defaults).toBeDefined();
      expect(globalThis[exportedVar].moduleManagement.referToModuleBy).toBeDefined();
    });

    it('should log appropriate messages during export with dynamic naming', async () => {
      const overMyHead = new OverMyHead();
      
      await overMyHead.init();

      // Should log with the module title and dynamic variable name
      const logCalls = console.log.mock.calls;
      const exportLogCall = logCalls.find(call => call[0].includes('Constants exported to global scope'));
      expect(exportLogCall).toBeDefined();
      expect(exportLogCall[0]).toMatch(/OverMyHead: Constants exported to global scope as \w+Constants\./);
    });

    it('should handle multiple initialization calls gracefully with dynamic naming', async () => {
      const overMyHead1 = new OverMyHead();
      const overMyHead2 = new OverMyHead();
      
      await overMyHead1.init();
      console.log.mockClear();
      console.warn.mockClear();
      
      await overMyHead2.init();

      // Should warn with the module title and dynamic variable name
      const warnCalls = console.warn.mock.calls;
      const exportWarnCall = warnCalls.find(call => call[0].includes('Constants already exported to global scope'));
      expect(exportWarnCall).toBeDefined();
      expect(exportWarnCall[0]).toMatch(/OverMyHead: Constants already exported to global scope as \w+Constants\./);
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain same constants reference as before migration', async () => {
      const overMyHead = new OverMyHead();
      
      // Store reference to instance constants
      const instanceConstants = overMyHead.constants;
      
      await overMyHead.init();
      
      // Find the exported variable
      const exportedVar = Object.keys(globalThis).find(key => key.endsWith('Constants') && globalThis[key] === config.constants);
      
      // Verify global constants are the same as instance constants
      expect(globalThis[exportedVar]).toBe(instanceConstants);
      expect(globalThis[exportedVar]).toBe(config.constants);
    });

    it('should provide shortName in manifest for backwards compatibility', () => {
      const overMyHead = new OverMyHead();

      expect(overMyHead.manifest.shortName).toBeDefined();
      expect(typeof overMyHead.manifest.shortName).toBe('string');
    });

    it('should maintain frozen state of exported objects', async () => {
      const overMyHead = new OverMyHead();
      
      await overMyHead.init();

      // Find the exported variable
      const exportedVar = Object.keys(globalThis).find(key => key.endsWith('Constants') && globalThis[key] === config.constants);

      expect(Object.isFrozen(globalThis[exportedVar])).toBe(true);
      expect(Object.isFrozen(overMyHead.manifest)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during initialization gracefully', async () => {
      const overMyHead = new OverMyHead();
      
      // Mock config.exportConstants to throw an error
      const originalExportConstants = config.exportConstants;
      config.exportConstants = jest.fn(() => {
        throw new Error('Test error');
      });

      await expect(overMyHead.init()).rejects.toThrow('Test error');
      expect(console.error).toHaveBeenCalled();

      // Restore original method
      config.exportConstants = originalExportConstants;
    });
  });
});
