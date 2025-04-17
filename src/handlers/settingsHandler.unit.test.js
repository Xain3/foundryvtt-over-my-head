import SettingsHandler from './settingsHandler.js';
import SettingsGetter from './settingsHelpers/settingsGetter.js';
import SettingsSetter from './settingsHelpers/settingsSetter.js';
import SettingsChecker from './settingsHelpers/settingsChecker.js';
import SettingsBuilder from './settingsHelpers/settingsBuilder.js';
import Handler from '../baseClasses/managers/handler.js';

// Mock dependencies
jest.mock('./settingsHelpers/settingsGetter.js');
jest.mock('./settingsHelpers/settingsSetter.js');
jest.mock('./settingsHelpers/settingsChecker.js');
jest.mock('./settingsHelpers/settingsBuilder.js');
jest.mock('../baseClasses/managers/handler.js');

describe('SettingsHandler', () => {
    let settingsHandler;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockGetter;
    let mockSetter;
    let mockChecker;
    let mockBuilder;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup mocks
        mockConfig = { someConfig: 'value' };
        mockContext = { 
            setFlags: jest.fn()
        };
        mockUtils = { someUtil: jest.fn() };
        
        mockGetter = {
            getSettingValue: jest.fn()
        };
        
        mockSetter = {
            setSettingValue: jest.fn()
        };
        
        mockChecker = {
            checkSettingsReady: jest.fn()
        };
        
        mockBuilder = {
            buildSettings: jest.fn().mockReturnValue({
                setting1: { id: 'setting1', registerSetting: jest.fn() },
                setting2: { id: 'setting2', registerSetting: jest.fn() }
            })
        };
        
        // Setup mock implementations
        SettingsGetter.mockImplementation(() => mockGetter);
        SettingsSetter.mockImplementation(() => mockSetter);
        SettingsChecker.mockImplementation(() => mockChecker);
        SettingsBuilder.mockImplementation(() => mockBuilder);
        
        settingsHandler = new SettingsHandler(mockConfig, mockContext, mockUtils);
        settingsHandler.logger = { 
            debug: jest.fn(),
            error: jest.fn()
        };
        settingsHandler.context = mockContext;
    });

    describe('constructor', () => {
        it('should initialize with the provided parameters', () => {
            expect(Handler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(SettingsGetter).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(SettingsSetter).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(SettingsChecker).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(SettingsBuilder).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(settingsHandler.settingsReady).toBe(false);
            expect(mockBuilder.buildSettings).toHaveBeenCalled();
            expect(settingsHandler.settings).toEqual(mockBuilder.buildSettings());
        });
    });

    describe('registerSettings', () => {
        it('should register all settings and set settingsReady to true on success', () => {
            // Call the method
            settingsHandler.registerSettings();
            
            // Verify that each setting's registerSetting method was called
            expect(settingsHandler.settings.setting1.registerSetting).toHaveBeenCalled();
            expect(settingsHandler.settings.setting2.registerSetting).toHaveBeenCalled();
            
            // Verify logs
            expect(settingsHandler.logger.debug).toHaveBeenCalledWith('Registering setting: setting1');
            expect(settingsHandler.logger.debug).toHaveBeenCalledWith('Registering setting: setting2');
            
            // Verify settingsReady flag was set
            expect(settingsHandler.settingsReady).toBe(true);
            expect(mockContext.setFlags).toHaveBeenCalledWith('settingsReady', true, true);
        });
        
        it('should handle errors and set settingsReady to false', () => {
            // Make one of the registerSetting calls throw an error
            settingsHandler.settings.setting1.registerSetting.mockImplementation(() => {
                throw new Error('Register error');
            });
            
            // Call the method
            settingsHandler.registerSettings();
            
            // Verify error was logged
            expect(settingsHandler.logger.error).toHaveBeenCalledWith(expect.stringContaining('Error registering settings'));
            
            // Verify settingsReady flag was not set
            expect(settingsHandler.settingsReady).toBe(false);
        });
        
        it('should handle case where settings are not valid', () => {
            // Set settings to null
            settingsHandler.settings = null;
            
            // Call the method
            settingsHandler.registerSettings();
            
            // Verify error was logged
            expect(settingsHandler.logger.error).toHaveBeenCalledWith('Settings are not valid.');
            
            // Verify settingsReady flag was not set
            expect(settingsHandler.settingsReady).toBe(false);
        });
    });
    
    describe('checkSettingsReady', () => {
        it('should call checker.checkSettingsReady with the handler instance', () => {
            mockChecker.checkSettingsReady.mockReturnValue(true);
            
            const result = settingsHandler.checkSettingsReady();
            
            expect(mockChecker.checkSettingsReady).toHaveBeenCalledWith(settingsHandler);
            expect(result).toBe(true);
        });
    });
    
    describe('getSettingValue', () => {
        it('should call getter.getSettingValue with the provided parameters', () => {
            const expectedValue = 'test-value';
            mockGetter.getSettingValue.mockReturnValue(expectedValue);
            
            const result = settingsHandler.getSettingValue('testSetting', 'testValue');
            
            expect(mockGetter.getSettingValue).toHaveBeenCalledWith('testSetting', 'testValue');
            expect(result).toBe(expectedValue);
        });
    });
    
    describe('setSettingValue', () => {
        it('should call setter.setSettingValue with the provided parameters', () => {
            settingsHandler.setSettingValue('testSetting', 'testValue', 'newValue');
            
            expect(mockSetter.setSettingValue).toHaveBeenCalledWith('testSetting', 'testValue', 'newValue');
        });
    });
    
    describe('buildSettings', () => {
        it('should call builder.buildSettings', () => {
            const expectedSettings = { setting: { id: 'test' } };
            mockBuilder.buildSettings.mockReturnValue(expectedSettings);
            
            const result = settingsHandler.buildSettings();
            
            expect(mockBuilder.buildSettings).toHaveBeenCalled();
            expect(result).toBe(expectedSettings);
        });
    });
});