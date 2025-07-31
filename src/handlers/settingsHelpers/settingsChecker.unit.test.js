import SettingsChecker from './settingsChecker';

describe('SettingsChecker', () => {
    let settingsChecker;

    beforeEach(() => {
        const config = {};
        const context = {};
        const utils = {};
        settingsChecker = new SettingsChecker(config, context, utils);
    });

    test('should return true when settings are ready', () => {
        const settings = { settingsReady: true };
        expect(settingsChecker.checkSettingsReady(settings)).toBe(true);
    });

    test('should return false when settings are not ready', () => {
        const settings = { settingsReady: false };
        expect(settingsChecker.checkSettingsReady(settings)).toBe(false);
    });
});