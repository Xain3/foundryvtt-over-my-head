/**
 * @file settingsRetriever.unit.test.js
 * @description Unit tests for SettingsRetriever helper class
 * @path src/helpers/settingsRetriever.unit.test.js
 */

import SettingsRetriever from './settingsRetriever.mjs';

describe('SettingsRetriever', () => {
  const testNamespace = 'test-module';

  describe('constructor', () => {
    it('should create SettingsRetriever with valid namespace', () => {
      const retriever = new SettingsRetriever(testNamespace);
      
      expect(retriever.namespace).toBe(testNamespace);
    });

    it('should throw error with empty namespace', () => {
      expect(() => new SettingsRetriever('')).toThrow('SettingsRetriever requires a valid namespace string');
    });

    it('should throw error with null namespace', () => {
      expect(() => new SettingsRetriever(null)).toThrow('SettingsRetriever requires a valid namespace string');
    });

    it('should throw error with undefined namespace', () => {
      expect(() => new SettingsRetriever(undefined)).toThrow('SettingsRetriever requires a valid namespace string');
    });

    it('should throw error with non-string namespace', () => {
      expect(() => new SettingsRetriever(123)).toThrow('SettingsRetriever requires a valid namespace string');
      expect(() => new SettingsRetriever({})).toThrow('SettingsRetriever requires a valid namespace string');
      expect(() => new SettingsRetriever([])).toThrow('SettingsRetriever requires a valid namespace string');
    });
  });

  describe('hasSetting', () => {
    let retriever;

    beforeEach(() => {
      retriever = new SettingsRetriever(testNamespace);
      global.game = {
        settings: {
          get: jest.fn()
        }
      };
    });

    afterEach(() => {
      delete global.game;
    });

    it('should return true when setting exists', () => {
      global.game.settings.get.mockReturnValue(true);
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(true);
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'testSetting');
    });

    it('should return true even when setting value is false', () => {
      global.game.settings.get.mockReturnValue(false);
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(true);
    });

    it('should return true when setting value is 0', () => {
      global.game.settings.get.mockReturnValue(0);
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(true);
    });

    it('should return true when setting value is empty string', () => {
      global.game.settings.get.mockReturnValue('');
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(true);
    });

    it('should return false when setting returns undefined', () => {
      global.game.settings.get.mockReturnValue(undefined);
      
      const result = retriever.hasSetting('nonExistentSetting');
      
      expect(result).toBe(false);
    });

    it('should return false when setting throws error', () => {
      global.game.settings.get.mockImplementation(() => {
        throw new Error('Setting not found');
      });
      
      const result = retriever.hasSetting('errorSetting');
      
      expect(result).toBe(false);
    });

    it('should return false when game.settings is not available', () => {
      delete global.game;
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(false);
    });

    it('should return false when game is null', () => {
      global.game = null;
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(false);
    });

    it('should return false when game.settings is null', () => {
      global.game = { settings: null };
      
      const result = retriever.hasSetting('testSetting');
      
      expect(result).toBe(false);
    });

    it('should return false with empty key', () => {
      const result = retriever.hasSetting('');
      
      expect(result).toBe(false);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });

    it('should return false with null key', () => {
      const result = retriever.hasSetting(null);
      
      expect(result).toBe(false);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });

    it('should return false with non-string key', () => {
      const result = retriever.hasSetting(123);
      
      expect(result).toBe(false);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });
  });

  describe('getSettingValue', () => {
    let retriever;

    beforeEach(() => {
      retriever = new SettingsRetriever(testNamespace);
      global.game = {
        settings: {
          get: jest.fn()
        }
      };
    });

    afterEach(() => {
      delete global.game;
    });

    it('should return setting value when it exists', () => {
      const expectedValue = 'test value';
      global.game.settings.get.mockReturnValue(expectedValue);
      
      const result = retriever.getSettingValue('testSetting');
      
      expect(result).toBe(expectedValue);
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'testSetting');
    });

    it('should return boolean values correctly', () => {
      global.game.settings.get.mockReturnValue(true);
      expect(retriever.getSettingValue('boolSetting')).toBe(true);
      
      global.game.settings.get.mockReturnValue(false);
      expect(retriever.getSettingValue('boolSetting')).toBe(false);
    });

    it('should return number values correctly', () => {
      global.game.settings.get.mockReturnValue(42);
      expect(retriever.getSettingValue('numberSetting')).toBe(42);
      
      global.game.settings.get.mockReturnValue(0);
      expect(retriever.getSettingValue('numberSetting')).toBe(0);
      
      global.game.settings.get.mockReturnValue(-1);
      expect(retriever.getSettingValue('numberSetting')).toBe(-1);
    });

    it('should return string values correctly', () => {
      global.game.settings.get.mockReturnValue('test string');
      expect(retriever.getSettingValue('stringSetting')).toBe('test string');
      
      global.game.settings.get.mockReturnValue('');
      expect(retriever.getSettingValue('stringSetting')).toBe('');
    });

    it('should return object values correctly', () => {
      const testObject = { key: 'value', nested: { prop: 'data' } };
      global.game.settings.get.mockReturnValue(testObject);
      
      const result = retriever.getSettingValue('objectSetting');
      
      expect(result).toBe(testObject);
    });

    it('should return array values correctly', () => {
      const testArray = [1, 2, 3, 'test'];
      global.game.settings.get.mockReturnValue(testArray);
      
      const result = retriever.getSettingValue('arraySetting');
      
      expect(result).toBe(testArray);
    });

    it('should return undefined when setting does not exist', () => {
      global.game.settings.get.mockReturnValue(undefined);
      
      const result = retriever.getSettingValue('nonExistentSetting');
      
      expect(result).toBe(undefined);
    });

    it('should return undefined when setting throws error', () => {
      global.game.settings.get.mockImplementation(() => {
        throw new Error('Setting not found');
      });
      
      const result = retriever.getSettingValue('errorSetting');
      
      expect(result).toBe(undefined);
    });

    it('should return undefined when game.settings is not available', () => {
      delete global.game;
      
      const result = retriever.getSettingValue('testSetting');
      
      expect(result).toBe(undefined);
    });

    it('should return undefined when game is null', () => {
      global.game = null;
      
      const result = retriever.getSettingValue('testSetting');
      
      expect(result).toBe(undefined);
    });

    it('should return undefined with empty key', () => {
      const result = retriever.getSettingValue('');
      
      expect(result).toBe(undefined);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });

    it('should return undefined with null key', () => {
      const result = retriever.getSettingValue(null);
      
      expect(result).toBe(undefined);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });

    it('should return undefined with non-string key', () => {
      const result = retriever.getSettingValue(123);
      
      expect(result).toBe(undefined);
      expect(global.game.settings.get).not.toHaveBeenCalled();
    });
  });

  describe('hasDebugModeSetting', () => {
    let retriever;

    beforeEach(() => {
      retriever = new SettingsRetriever(testNamespace);
      global.game = {
        settings: {
          get: jest.fn()
        }
      };
    });

    afterEach(() => {
      delete global.game;
    });

    it('should return true when debugMode setting exists', () => {
      global.game.settings.get.mockReturnValue(false);
      
      const result = retriever.hasDebugModeSetting();
      
      expect(result).toBe(true);
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'debugMode');
    });

    it('should return false when debugMode setting does not exist', () => {
      global.game.settings.get.mockReturnValue(undefined);
      
      const result = retriever.hasDebugModeSetting();
      
      expect(result).toBe(false);
    });

    it('should return false when game.settings is not available', () => {
      delete global.game;
      
      const result = retriever.hasDebugModeSetting();
      
      expect(result).toBe(false);
    });
  });

  describe('getDebugModeSettingValue', () => {
    let retriever;

    beforeEach(() => {
      retriever = new SettingsRetriever(testNamespace);
      global.game = {
        settings: {
          get: jest.fn()
        }
      };
    });

    afterEach(() => {
      delete global.game;
    });

    it('should return true when debugMode is enabled', () => {
      global.game.settings.get.mockReturnValue(true);
      
      const result = retriever.getDebugModeSettingValue();
      
      expect(result).toBe(true);
      expect(global.game.settings.get).toHaveBeenCalledWith(testNamespace, 'debugMode');
    });

    it('should return false when debugMode is disabled', () => {
      global.game.settings.get.mockReturnValue(false);
      
      const result = retriever.getDebugModeSettingValue();
      
      expect(result).toBe(false);
    });

    it('should return undefined when debugMode setting does not exist', () => {
      global.game.settings.get.mockReturnValue(undefined);
      
      const result = retriever.getDebugModeSettingValue();
      
      expect(result).toBe(undefined);
    });

    it('should return undefined when game.settings is not available', () => {
      delete global.game;
      
      const result = retriever.getDebugModeSettingValue();
      
      expect(result).toBe(undefined);
    });
  });
});