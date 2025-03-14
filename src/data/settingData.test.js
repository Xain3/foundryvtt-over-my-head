import SettingData from './settingData';

// src/data/settingData.test.js

describe('SettingData', () => {
    let instance, config, context, utils, logger;

    beforeEach(() => {
        // Create a fake config as expected by SettingData
        config = { CONSTANTS: { MODULE: { ID: 'testModule' } } };
        
        // Create a fake logger with jest functions
        logger = {
            debug: jest.fn(),
            error: jest.fn()
        };

        // Create a fake utils that contains the logger
        utils = { logger };

        // Setup a simple context mock
        let store = {};
        context = {
            get: jest.fn(key => store[key]),
            set: jest.fn((key, value) => { store[key] = value; })
        };

        // Reset global game object in every test
        global.game = { 
            // Mock the function to register settings
            settings: {
                register: jest.fn()
            }
        };

        // Create instance of SettingData
        instance = new SettingData('testSetting', { some: 'data' }, config, context, utils);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerSetting', () => {
        it('should register the setting and update context settings when game.settings exists', () => {
            // Initially context does not have settings, so get returns undefined
            context.get.mockReturnValueOnce(undefined);

            instance.registerSetting();

            // Expect game.settings.register to be called with proper parameters
            expect(global.game.settings.register).toHaveBeenCalledWith(
                'testModule',
                'testSetting',
                instance.data
            );
            // Expect debug logs for registration
            expect(logger.debug).toHaveBeenCalledWith('Registering setting: testSetting');
            expect(logger.debug).toHaveBeenCalledWith('Setting registered: testSetting');

            // Check that new settings object is created and updated with the new setting
            expect(context.set).toHaveBeenCalledWith('settings', expect.objectContaining({
                testSetting: instance.data
            }));
        });

        it('should use existing context settings if available and update it', () => {
            // Provide existing settings object
            const existingSettings = { existing: 'value' };
            context.get.mockReturnValueOnce(existingSettings);

            instance.registerSetting();

            expect(global.game.settings.register).toHaveBeenCalled();
            expect(context.set).toHaveBeenCalledWith('settings', expect.objectContaining({
                existing: 'value',
                testSetting: instance.data
            }));
        });

        it("should log an error if 'game.settings' is undefined", () => {
            // Remove game.settings
            delete global.game.settings;
            instance.registerSetting();
            expect(logger.error).toHaveBeenCalledWith(`'game.settings' is undefined. Cannot register setting: testSetting`);
        });

        it('should catch and log errors during registration', () => {
            // Force an error by making context.set throw an error
            context.set.mockImplementation(() => { throw new Error('Test error'); });

            instance.registerSetting();
            expect(logger.error).toHaveBeenCalledWith('Error registering setting: testSetting');
            expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getOrCreateSettings', () => {
        it('should return existing settings from context', () => {
            const existingSettings = { key: 'value' };
            context.get.mockReturnValue(existingSettings);
            const settings = instance.getOrCreateSettings();
            expect(settings).toEqual(existingSettings);
            // Should not call set if settings already exist
            expect(context.set).not.toHaveBeenCalled();
        });

        it('should create and return an empty settings object if none exist', () => {
            context.get.mockReturnValue(undefined);
            const settings = instance.getOrCreateSettings();
            expect(settings).toEqual({});
            expect(context.set).toHaveBeenCalledWith('settings', {});
        });
    });
});