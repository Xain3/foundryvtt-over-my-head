import Utility from './utility.js';
import Base from './base.js';

// ./tests/unit/baseClasses/utility.test.js


jest.mock('@baseClasses/base');

describe('Utility', () => {
    let utility;
    let config;

    beforeEach(() => {
        config = {
            CONSTANTS: {
                MODULE: {}
            }
        };
        utility = new Utility(config);
    });

    test('should extend Base class', () => {
        expect(utility).toBeInstanceOf(Base);
    });

    test('should initialize with provided config', () => {
        expect(Base).toHaveBeenCalledWith(config);
    });

    test('should update config correctly', () => {
        const newConfig = {
            CONSTANTS: {
                MODULE: {}
            }
        };
        utility.updateConfig(newConfig);
        expect(utility.config).toBe(newConfig);
        expect(utility.const).toBe(newConfig.CONSTANTS);
        expect(utility.moduleConstants).toBe(newConfig.CONSTANTS.MODULE);
    });
});