// ./tests/unit/handlers/settingsFunctions/settingsBuilder.test.js

import SettingsBuilder from './settingsBuilder.js';
import MockConfig from '../../../tests/mocks/mockConfig.js';

describe('SettingsBuilder', () => {
    let config;
    let context;
    let utils;
    let settingsBuilder;

    beforeEach(() => {
        config = MockConfig;
        context = { /* mock context */ };
        utils = {
            hookFormatter: jest.fn(),
            localizer: jest.fn(),
        };
        settingsBuilder = new SettingsBuilder(config, context, utils);
    });

    test('should initialize with correct properties', () => {
        expect(settingsBuilder.moduleId).toBe(config.moduleConstants.ID);
        expect(settingsBuilder.formatter).toBe(utils.hookFormatter);
        expect(settingsBuilder.localizer).toBe(utils.localizer);
        expect(settingsBuilder.moduleSettings).toBe(config.moduleConstants.SETTINGS);
        expect(settingsBuilder.settings).toEqual({});
    });

    test('setContext should update the context', () => {
        const newContext = { user: 'testUser' };
        settingsBuilder.setContext(newContext);
        expect(settingsBuilder.context).toBe(newContext);
    });

    test('initializeSettings should initialize settings correctly', () => {
        const mockSettings = {
            setting1: { key: 'value1' },
            setting2: { key: 'value2' },
        };
        config.moduleConstants.SETTINGS.initializeSettings.mockReturnValue(mockSettings);

        const initializedSettings = settingsBuilder.initializeSettings();

        expect(config.moduleConstants.SETTINGS.initializeSettings).toHaveBeenCalledWith(context);
        expect(initializedSettings.setting1).toBeInstanceOf(SettingData);
        expect(initializedSettings.setting2).toBeInstanceOf(SettingData);
    });

    test('initializeSettings should log error for invalid setting data', () => {
        const mockSettings = {
            setting1: 'invalid',
        };
        config.moduleConstants.SETTINGS.initializeSettings.mockReturnValue(mockSettings);
        settingsBuilder.logger = { error: jest.fn() };

        settingsBuilder.initializeSettings();

        expect(settingsBuilder.logger.error).toHaveBeenCalledWith('Invalid data type for setting: setting1. Expected object.');
    });

    test('initializeSettings should use provided context if given', () => {
        const newContext = { user: 'newTestUser' };
        const mockSettings = {
            setting1: { key: 'value1' },
        };
        config.moduleConstants.SETTINGS.initializeSettings.mockReturnValue(mockSettings);

        settingsBuilder.initializeSettings(newContext);

        expect(settingsBuilder.context).toBe(newContext);
        expect(config.moduleConstants.SETTINGS.initializeSettings).toHaveBeenCalledWith(newContext);
    });

    test('initializeSettings should use existing context if none provided', () => {
        const mockSettings = {
            setting1: { key: 'value1' },
        };
        config.moduleConstants.SETTINGS.initializeSettings.mockReturnValue(mockSettings);

        settingsBuilder.initializeSettings();

        expect(settingsBuilder.context).toBe(context);
        expect(config.moduleConstants.SETTINGS.initializeSettings).toHaveBeenCalledWith(context);
    });
});