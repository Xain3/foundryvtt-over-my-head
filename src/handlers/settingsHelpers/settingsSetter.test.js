import SettingsSetter from '../../handlers/settingsHelpers/settingsSetter';
import MockConfig from '../../../tests/mocks/config';
import MockContext from '../../../tests/mocks/context';
import mockUtilities from '../../../tests/mocks/utils';
import Config from '../../config/config';
import Context from '../../contexts/context';
import Utilities from '../../utils/utils';

// Mock dependencies
jest.mock('../../config/config');
jest.mock('../../contexts/context');
jest.mock('../../utils/utils');

describe('SettingsSetter', () => {
    let settingsSetter, config, context, utils;
    let mockSetting, mockLogger;

    beforeEach(() => {
        // Set up mocks
        mockSetting = {
            setValue: jest.fn()
        };
        
        mockLogger = {
            error: jest.fn()
        };

        // Initialize real dependencies
        config = new MockConfig();
        context = new MockContext();
        utils = mockUtilities;
        
        // Create the SettingsSetter instance
        settingsSetter = new SettingsSetter(config, context, utils);
        
        // Mock internal properties
        settingsSetter.settings = {
            'testSetting': mockSetting
        };
        settingsSetter.logger = mockLogger;
    });

    describe('setSettingValue', () => {
        it('should call setValue on the setting when it exists', () => {
            // Arrange
            const settingKey = 'testSetting';
            const valueKey = 'someProperty';
            const value = 'newValue';
            
            // Act
            settingsSetter.setSettingValue(settingKey, valueKey, value);
            
            // Assert
            expect(mockSetting.setValue).toHaveBeenCalledWith(valueKey, value);
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should log an error when the setting does not exist', () => {
            // Arrange
            const settingKey = 'nonExistentSetting';
            const valueKey = 'someProperty';
            const value = 'newValue';
            
            // Act
            settingsSetter.setSettingValue(settingKey, valueKey, value);
            
            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`Setting with key ${settingKey} does not exist.`)
            );
            expect(mockSetting.setValue).not.toHaveBeenCalled();
        });
    });
});