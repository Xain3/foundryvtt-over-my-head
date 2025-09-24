/**
 * @file settingLocalizer.unit.test.mjs
 * @description Unit tests for SettingLocalizer
 * @path src/handlers/settingsHelpers/settingLocalizer.unit.test.mjs
 */

import SettingLocalizer from './settingLocalizer.mjs';

// Helper to create a fake game.i18n
const makeI18n = (dict = {}) => ({
  localize: (k) => (k in dict ? dict[k] : k),
});

describe('SettingLocalizer', () => {
  let originalGame;

  beforeEach(() => {
    originalGame = global.game;
    delete global.game;
  });

  afterEach(() => {
    global.game = originalGame;
  });

  const sampleSetting = () => ({
    key: 'debugMode',
    config: {
      name: 'MY.KEY.NAME',
      hint: 'MY.KEY.HINT',
      choices: {
        a: 'MY.KEY.CHOICE_A',
        b: 'MY.KEY.CHOICE_B',
        c: 42,
      },
    },
  });

  it('should no-op when neither localizer nor game.i18n is available', () => {
    const input = sampleSetting();
    const out = SettingLocalizer.localizeSetting(input);
    expect(out).toBe(input);
  });

  it('should use provided localizer over game.i18n', () => {
    global.game = { i18n: makeI18n({ 'MY.KEY.NAME': 'GN', 'MY.KEY.HINT': 'GH', 'MY.KEY.CHOICE_A': 'GA' }) };
    const utils = { static: { localizer: { localize: (k) => ({ 'MY.KEY.NAME': 'LN', 'MY.KEY.HINT': 'LH', 'MY.KEY.CHOICE_A': 'LA', 'MY.KEY.CHOICE_B': 'LB' }[k] || k) } } };
    const out = SettingLocalizer.localizeSetting(sampleSetting(), utils);
    expect(out.config.name).toBe('LN');
    expect(out.config.hint).toBe('LH');
    expect(out.config.choices.a).toBe('LA');
    expect(out.config.choices.b).toBe('LB');
    expect(out.config.choices.c).toBe(42);
  });

  it('should fallback to game.i18n when localizer is not provided', () => {
    global.game = { i18n: makeI18n({ 'MY.KEY.NAME': 'GN', 'MY.KEY.HINT': 'GH', 'MY.KEY.CHOICE_A': 'GA' }) };
    const out = SettingLocalizer.localizeSetting(sampleSetting());
    expect(out.config.name).toBe('GN');
    expect(out.config.hint).toBe('GH');
    expect(out.config.choices.a).toBe('GA');
    expect(out.config.choices.b).toBe('MY.KEY.CHOICE_B');
    expect(out.config.choices.c).toBe(42);
  });

  it('localizeSettings should map across array', () => {
    const utils = { static: { localizer: { localize: (k) => ({ 'MY.KEY.NAME': 'N1', 'MY.KEY.HINT': 'H1', 'MY.KEY.CHOICE_A': 'A1' }[k] || k) } } };
    const out = SettingLocalizer.localizeSettings([sampleSetting(), sampleSetting()], utils);
    expect(out).toHaveLength(2);
    expect(out[0].config.name).toBe('N1');
    expect(out[1].config.name).toBe('N1');
  });
});
