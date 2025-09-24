/**
 * @file settingsRetriever.int.test.mjs
 * @description Integration tests for SettingsRetriever helper class with actual settings workflow
 * @path tests/integration/settingsRetriever.int.test.mjs
 */

import SettingsRetriever from '../../src/helpers/settingsRetriever.mjs';

// Mock Foundry VTT API
global.game = {
  settings: {
    register: jest.fn(),
    get: jest.fn(),
    set: jest.fn()
  }
};

describe('SettingsRetriever Integration Tests', () => {
  const testNamespace = 'test-integration-module';
  let retriever;

  beforeEach(() => {
    jest.clearAllMocks();
    retriever = new SettingsRetriever(testNamespace);

    // Ensure global.game is properly set up for each test
    global.game = {
      settings: {
        register: jest.fn(),
        get: jest.fn(),
        set: jest.fn()
      }
    };

    // Setup mock settings values
    global.game.settings.get.mockImplementation((namespace, key) => {
      const mockSettings = {
        'test-integration-module': {
          debugMode: true,
          userPreference: 'dark',
          maxItems: 50,
          enableFeature: false,
          configData: { theme: 'default', lang: 'en' }
        }
      };
      return mockSettings[namespace]?.[key];
    });
  });

  afterEach(() => {
    // Clean up global state after each test
    delete global.game;
  });

  describe('Real-world Settings Workflow', () => {
    it('should handle typical module settings usage pattern', () => {
      // Simulate checking for various settings
      expect(retriever.hasSetting('debugMode')).toBe(true);
      expect(retriever.hasSetting('userPreference')).toBe(true);
      expect(retriever.hasSetting('nonExistentSetting')).toBe(false);

      // Retrieve values for conditional logic
      const debugMode = retriever.getSettingValue('debugMode');
      const userPreference = retriever.getSettingValue('userPreference');
      const maxItems = retriever.getSettingValue('maxItems');

      expect(debugMode).toBe(true);
      expect(userPreference).toBe('dark');
      expect(maxItems).toBe(50);

      // Verify the correct namespace was used
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'debugMode');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'userPreference');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'maxItems');
    });

    it('should handle complex conditional logic based on settings', () => {
      // Simulate a module that needs to check multiple settings for feature enablement
      const hasDebugMode = retriever.hasDebugModeSetting();
      const isDebugEnabled = retriever.getDebugModeSettingValue();
      const isFeatureEnabled = retriever.getSettingValue('enableFeature');
      const configData = retriever.getSettingValue('configData');

      // Complex conditional logic
      const shouldShowAdvancedUI = hasDebugMode && isDebugEnabled && !isFeatureEnabled;
      const shouldUseCustomTheme = configData && configData.theme !== 'default';

      expect(shouldShowAdvancedUI).toBe(true);
      expect(shouldUseCustomTheme).toBe(false);

      // Verify all expected calls were made
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'debugMode');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'enableFeature');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'configData');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should gracefully handle Foundry VTT API unavailability', () => {
      // Simulate API not being ready
      delete global.game;

      expect(retriever.hasSetting('debugMode')).toBe(false);
      expect(retriever.getSettingValue('debugMode')).toBe(undefined);
      expect(retriever.hasDebugModeSetting()).toBe(false);
      expect(retriever.getDebugModeSettingValue()).toBe(undefined);
    });

    it('should handle game.settings.get throwing errors', () => {
      global.game.settings.get.mockImplementation(() => {
        throw new Error('Settings system error');
      });

      expect(retriever.hasSetting('debugMode')).toBe(false);
      expect(retriever.getSettingValue('debugMode')).toBe(undefined);
      expect(retriever.hasDebugModeSetting()).toBe(false);
      expect(retriever.getDebugModeSettingValue()).toBe(undefined);
    });

    it('should handle partial API availability', () => {
      global.game = { settings: null };

      expect(retriever.hasSetting('debugMode')).toBe(false);
      expect(retriever.getSettingValue('debugMode')).toBe(undefined);
    });
  });

  describe('Performance with Multiple Settings', () => {
    it('should efficiently handle multiple setting checks', () => {
      const startTime = Date.now();

      // Simulate checking many settings
      const settingsToCheck = Array.from({ length: 100 }, (_, i) => `setting${i}`);
      const results = settingsToCheck.map(key => ({
        key,
        exists: retriever.hasSetting(key),
        value: retriever.getSettingValue(key)
      }));

      const endTime = Date.now();

      // All should return false/undefined since they don't exist in our mock
      expect(results.every(r => !r.exists && r.value === undefined)).toBe(true);

      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);

      // Should have made the expected number of API calls
      expect(global.game.settings.get).toHaveBeenCalledTimes(200); // 100 for hasSetting + 100 for getSettingValue
    });
  });

  describe('Different Setting Types', () => {
    beforeEach(() => {
      global.game.settings.get.mockImplementation((namespace, key) => {
        const settingTypes = {
          'test-integration-module': {
            booleanSetting: true,
            stringSetting: 'test string',
            numberSetting: 42,
            objectSetting: { prop: 'value', nested: { data: 'test' } },
            arraySetting: [1, 2, 3, 'four'],
            nullSetting: null,
            zeroSetting: 0,
            emptySetting: '',
            falseSetting: false
          }
        };
        return settingTypes[namespace]?.[key];
      });
    });

    it('should correctly handle all Foundry VTT setting data types', () => {
      // Boolean values
      expect(retriever.hasSetting('booleanSetting')).toBe(true);
      expect(retriever.getSettingValue('booleanSetting')).toBe(true);
      expect(retriever.hasSetting('falseSetting')).toBe(true);
      expect(retriever.getSettingValue('falseSetting')).toBe(false);

      // String values
      expect(retriever.hasSetting('stringSetting')).toBe(true);
      expect(retriever.getSettingValue('stringSetting')).toBe('test string');
      expect(retriever.hasSetting('emptySetting')).toBe(true);
      expect(retriever.getSettingValue('emptySetting')).toBe('');

      // Number values
      expect(retriever.hasSetting('numberSetting')).toBe(true);
      expect(retriever.getSettingValue('numberSetting')).toBe(42);
      expect(retriever.hasSetting('zeroSetting')).toBe(true);
      expect(retriever.getSettingValue('zeroSetting')).toBe(0);

      // Object values
      expect(retriever.hasSetting('objectSetting')).toBe(true);
      const objectValue = retriever.getSettingValue('objectSetting');
      expect(objectValue).toEqual({ prop: 'value', nested: { data: 'test' } });

      // Array values
      expect(retriever.hasSetting('arraySetting')).toBe(true);
      expect(retriever.getSettingValue('arraySetting')).toEqual([1, 2, 3, 'four']);

      // Null values (these should still be detected as existing settings)
      expect(retriever.hasSetting('nullSetting')).toBe(true);
      expect(retriever.getSettingValue('nullSetting')).toBe(null);
    });
  });

  describe('Module Integration Scenario', () => {
    it('should work correctly in a realistic module initialization scenario', () => {
      // Simulate module checking its settings during initialization
      const moduleSettings = {
        isEnabled: retriever.getSettingValue('moduleEnabled') ?? true, // Default to true
        debugLevel: retriever.getSettingValue('debugLevel') ?? 'info',
        theme: retriever.getSettingValue('theme') ?? 'default',
        maxConnections: retriever.getSettingValue('maxConnections') ?? 10
      };

      // Since our mock doesn't have these settings, they should use defaults
      expect(moduleSettings).toEqual({
        isEnabled: true,
        debugLevel: 'info',
        theme: 'default',
        maxConnections: 10
      });

      // Verify the retriever attempted to check for each setting
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'moduleEnabled');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'debugLevel');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'theme');
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'maxConnections');
    });

    it('should enable conditional feature loading based on settings', () => {
      // Mock additional settings for this test
      global.game.settings.get.mockImplementation((namespace, key) => {
        const moduleConfig = {
          'test-integration-module': {
            debugMode: true,
            experimentalFeatures: true,
            advancedMode: false,
            apiVersion: '2.0'
          }
        };
        return moduleConfig[namespace]?.[key];
      });

      // Simulate module feature loading logic
      const shouldLoadDebugTools = retriever.hasDebugModeSetting() && retriever.getDebugModeSettingValue();
      const shouldLoadExperimentalFeatures = retriever.getSettingValue('experimentalFeatures');
      const shouldUseAdvancedUI = retriever.getSettingValue('advancedMode');
      const apiVersion = retriever.getSettingValue('apiVersion');

      expect(shouldLoadDebugTools).toBe(true);
      expect(shouldLoadExperimentalFeatures).toBe(true);
      expect(shouldUseAdvancedUI).toBe(false);
      expect(apiVersion).toBe('2.0');

      // This would translate to conditional feature loading in a real module
      const featuresConfig = {
        debugTools: shouldLoadDebugTools,
        experimental: shouldLoadExperimentalFeatures,
        advancedUI: shouldUseAdvancedUI,
        compatibility: apiVersion === '2.0' ? 'modern' : 'legacy'
      };

      expect(featuresConfig).toEqual({
        debugTools: true,
        experimental: true,
        advancedUI: false,
        compatibility: 'modern'
      });
    });
  });
});