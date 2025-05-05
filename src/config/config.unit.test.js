import Config from '@/config/config';
import CONSTANTS from '@/config/constants';
import HOOKS from '@/config/hooks';
import Base from '@/baseClasses/base'; // Base will be the MockBase class below in this test environment

// Tracker for Base constructor calls
const mockBaseInstance = jest.fn();

// Mock the Base class with a mock class constructor
jest.mock('@/baseClasses/base', () => {
    return class MockBase {
        constructor(options) {
            // Track calls to the constructor
            mockBaseInstance(options);
            // Add any methods/properties from Base needed by Config here if necessary
        }
    };
});

describe('Config', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        mockBaseInstance.mockClear(); // Clear the constructor call tracker
    });

    it('should instantiate with default constants and hooks', () => {
        const config = new Config();
        expect(config).toBeInstanceOf(Config); // Should now pass
        expect(config.CONSTANTS).toBe(CONSTANTS);
        expect(config.HOOKS).toBe(HOOKS);
        // Check constructor calls using the tracker
        expect(mockBaseInstance).toHaveBeenCalledTimes(1);
        expect(mockBaseInstance).toHaveBeenCalledWith({ shouldLoadGame: true, shouldLoadConfig: false });
    });

    it('should instantiate with provided constants and hooks', () => {
        const mockConstants = { MODULE: { ID: 'test-module' } };
        const mockHooks = { READY: 'testReady' };
        const config = new Config(mockConstants, mockHooks);

        expect(config).toBeInstanceOf(Config); // Should now pass
        expect(config.CONSTANTS).toBe(mockConstants);
        expect(config.HOOKS).toBe(mockHooks);
        // Check constructor calls using the tracker
        expect(mockBaseInstance).toHaveBeenCalledTimes(1);
        expect(mockBaseInstance).toHaveBeenCalledWith({ shouldLoadGame: true, shouldLoadConfig: false });
    });

    it('should throw an error if constants are not provided', () => {
        expect(() => new Config(null, HOOKS)).toThrow('Error initializing Config. Constants must be provided.');
    });

    it('should throw an error if hooks are not provided', () => {
        expect(() => new Config(CONSTANTS, null)).toThrow('Error initializing Config. Hooks must be provided.');
    });

    it('should throw an error if constants are not an object', () => {
        expect(() => new Config('not an object', HOOKS)).toThrow('Error initializing Config. Constants must be an object.');
    });

    it('should throw an error if hooks are not an object', () => {
        expect(() => new Config(CONSTANTS, 'not an object')).toThrow('Error initializing Config. Hooks must be an object.');
    });
});