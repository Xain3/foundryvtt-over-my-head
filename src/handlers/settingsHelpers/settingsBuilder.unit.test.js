// ./tests/unit/handlers/settingsFunctions/settingsBuilder.test.js

import SettingsBuilder from "./settingsBuilder";
import MockConfig from "../../../tests/mocks/config";
import MockContext from "../../../tests/mocks/context";

describe('SettingsBuilder', () => {
    let settingsBuilder;
    let mockConfig, mockContext, mockUtils, mockModuleConstants;

    beforeEach(() => {
        mockConfig = new MockConfig();
        mockUtils = {
            hookFormatter: jest.fn(),
            localizer: jest.fn()
        };
        mockContext = new MockContext(mockConfig, mockUtils);
        mockModuleConstants = mockConfig.CONSTANTS.MODULE;

        settingsBuilder = new SettingsBuilder(mockConfig, mockContext, mockUtils);
        settingsBuilder.moduleConstants = mockModuleConstants;
    });

    test('should initialize with given config, context, and utils', () => {
        expect(settingsBuilder.moduleId).toBe(mockModuleConstants.ID);
        expect(settingsBuilder.formatter).toBe(mockUtils.hookFormatter);
        expect(settingsBuilder.localizer).toBe(mockUtils.localizer);
        expect(settingsBuilder.moduleSettings).toBe(mockModuleConstants.SETTINGS);
    });

    test('should set context correctly', () => {
        const newContext = { newKey: 'newValue' };
        settingsBuilder.setContext(newContext);
        expect(settingsBuilder.context).toBe(newContext);
    });

    test('should initialize settings correctly with valid settings', () => {
        // Mock the SETTINGS object with valid settings
        mockModuleConstants.SETTINGS = {
            setting1: { name: 'Setting 1', type: 'string' },
            setting2: { name: 'Setting 2', type: 'boolean' }
        };
        
        const result = settingsBuilder.initializeSettings();
        
        expect(Object.keys(result).length).toBe(2);
        expect(result.setting1).toBeDefined();
        expect(result.setting2).toBeDefined();
        expect(settingsBuilder.settings).toBe(result);
    });

    test('should use provided context when initializing settings', () => {
        const newContext = { newKey: 'newValue' };
        
        settingsBuilder.initializeSettings(newContext);
        
        expect(settingsBuilder.context).toBe(newContext);
    });

    test('should use existing context when no context is provided', () => {
        const originalContext = settingsBuilder.context;
        
        settingsBuilder.initializeSettings();
        
        expect(settingsBuilder.context).toBe(originalContext);
    });

    test('should log error for invalid setting data types', () => {
        // Mock the SETTINGS object with an invalid setting
        mockModuleConstants.SETTINGS = {
            validSetting: { name: 'Valid Setting', type: 'string' },
            invalidSetting: 'not an object'
        };
        
        // Mock the logger method
        const originalLogger = settingsBuilder.logger;
        settingsBuilder.logger = { error: jest.fn() };
        
        const result = settingsBuilder.initializeSettings();
        
        expect(settingsBuilder.logger.error).toHaveBeenCalledWith(
            'Invalid data type for setting: invalidSetting. Expected object.'
        );
        expect(Object.keys(result).length).toBe(1);
        expect(result.validSetting).toBeDefined();
        expect(result.invalidSetting).toBeUndefined();
        
        // Restore the original logger
        settingsBuilder.logger = originalLogger;
    });

    test('should reset settings before initializing new ones', () => {
        // Setup initial settings
        mockModuleConstants.SETTINGS = {
            setting1: { name: 'Setting 1', type: 'string' }
        };
        settingsBuilder.initializeSettings();
        
        // Change settings and reinitialize
        mockModuleConstants.SETTINGS = {
            setting2: { name: 'Setting 2', type: 'boolean' }
        };
        settingsBuilder.initializeSettings();
        
        expect(Object.keys(settingsBuilder.settings).length).toBe(1);
        expect(settingsBuilder.settings.setting1).toBeUndefined();
        expect(settingsBuilder.settings.setting2).toBeDefined();
    });

    test('should return the settings object', () => {
        mockModuleConstants.SETTINGS = {
            setting1: { name: 'Setting 1', type: 'string' }
        };
        
        const result = settingsBuilder.initializeSettings();
        
        expect(result).toBe(settingsBuilder.settings);
    });
    test('should handle empty settings gracefully', () => {
        mockModuleConstants.SETTINGS = {};
        
        const result = settingsBuilder.initializeSettings();
        
        expect(Object.keys(result).length).toBe(0);
    });

    test('should initialize settings correctly with valid settings', () => {

        mockModuleConstants.SETTINGS = {
            setting1: { name: 'Setting 1', type: 'string' },
            setting2: { name: 'Setting 2', type: 'boolean' }
        };
        
        const result = settingsBuilder.initializeSettings();
        
        expect(Object.keys(result).length).toBe(2);
        expect(result.setting1).toBeDefined();
        expect(result.setting2).toBeDefined();
        expect(settingsBuilder.settings).toBe(result);
    });
});    