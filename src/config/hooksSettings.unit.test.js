import HOOKS_SETTINGS, { getPrefix } from './hooksSettings';

// ./src/config/hooksSettings.test.js

jest.mock('./constants', () => ({
    MODULE: {
        SHORT_NAME: 'MockedShortNameForHooksTest' // This value will be used by getPrefix's default param
    }
}));

describe('getPrefix', () => {
    test('should return the custom prefix if the prefix is valid', () => {
        const customPrefix = 'I am a custom prefix';
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(customPrefix);
    }),

    test('should return the short name from constants (mocked) if the custom prefix is undefined', () => {
        const customPrefix = undefined;
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe('MockedShortNameForHooksTest');
    });

    test('should return the fallback prefix if the custom prefix is undefined both as an arguments and in the settings (mocked constants)', () => {
        const customPrefix = undefined;
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe('MockedShortNameForHooksTest'); // Will use mocked value
    });

    test('should return the fallback prefix if the custom prefix is null', () => {
        const customPrefix = null;
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should return the fallback prefix if the custom prefix is not a string', () => {
        const customPrefix = 123;
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should return the fallback prefix if the custom prefix is an empty string', () => {
        const customPrefix = '';
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should return the fallback prefix if the custom prefix is a whitespace string', () => {
        const customPrefix = ' ';
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should return the fallback prefix if the custom prefix is a string with only whitespace', () => {
        const customPrefix = '    ';
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should return the fallback prefix if the custom prefix is a string with only tabs', () => {
        const customPrefix = '\t\t\t\t';
        const fallbackPrefix = 'I am a fallback prefix';
        expect(getPrefix(customPrefix, fallbackPrefix)).toBe(fallbackPrefix);
    });

    test('should throw an error if both the custom prefix and the fallback prefix are not strings', () => {
        const customPrefix = 123;
        const fallbackPrefix = 123;
        expect(() => getPrefix(customPrefix, fallbackPrefix)).toThrow();
    });
});

describe('HOOKS_SETTINGS', () => {
    test('should have the correct NO_PREFIX_GROUPS', () => {
        expect(HOOKS_SETTINGS.NO_PREFIX_GROUPS).toEqual(['BUILT_IN']);
    });

    test('should have the correct ALLOWED_GROUPS', () => {
        expect(HOOKS_SETTINGS.ALLOWED_GROUPS).toEqual(['OUT', 'IN', 'BUILT_IN']);
    });

    test('should have the correct DEFAULT_GROUP', () => {
        expect(HOOKS_SETTINGS.DEFAULT_GROUP).toBe('BUILT_IN');
    });

    test('should have the correct DEFAULT_PREFIX', () => {
        // This will use the mocked CONSTANTS.MODULE.SHORT_NAME from the top of this file
        expect(HOOKS_SETTINGS.DEFAULT_PREFIX).toBe('MockedShortNameForHooksTest');
    });
});