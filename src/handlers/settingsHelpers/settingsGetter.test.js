import SettingsGetter from '../../handlers/settingsHelpers/settingsGetter';
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

describe('SettingsGetter', () => {
    let settingsGetter;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockLogger;
    let mockSettings;

    beforeEach(() => {
        // Create mock objects
        mockLogger = {
            error: jest.fn()
        };

        mockSettings = {
            'testSetting': {
                getValue: jest.fn().mockImplementation(valueKey => {
                    if (valueKey === 'existingValue') return 'expectedValue';
                    return null;
                })
            }
        };

        // Set up config, context and utils
        mockConfig = new MockConfig(); 
        mockContext = new MockContext();
        mockUtils = mockUtilities;
        
        // Create the settings getter instance
        settingsGetter = new SettingsGetter(mockConfig, mockContext, mockUtils);
        
        // Mock the settings and logger properties
        settingsGetter.settings = mockSettings;
        settingsGetter.logger = mockLogger;
    });

    it('should retrieve a setting value when the setting exists', () => {
        const result = settingsGetter.getSettingValue('testSetting', 'existingValue');
        
        expect(result).toBe('expectedValue');
        expect(mockSettings.testSetting.getValue).toHaveBeenCalledWith('existingValue');
        expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return null and log an error when the setting does not exist', () => {
        const result = settingsGetter.getSettingValue('nonExistentSetting', 'someValue');
        
        expect(result).toBeNull();
        expect(mockLogger.error).toHaveBeenCalledWith(
            'Setting with key nonExistentSetting does not exist.'
        );
    });

    it('should return null when the setting exists but the value key does not', () => {
        const result = settingsGetter.getSettingValue('testSetting', 'nonExistentValue');
        
        expect(result).toBeNull();
        expect(mockSettings.testSetting.getValue).toHaveBeenCalledWith('nonExistentValue');
        expect(mockLogger.error).not.toHaveBeenCalled();
    });
});