/**
 * @file settingLocalizer.mjs
 * @description Helper class to localize Foundry VTT setting definitions (name, hint, choices)
 * @path src/handlers/settingsHelpers/settingLocalizer.mjs
 */

/**
 * SettingLocalizer provides static helpers to localize settings definitions
 * using Foundry VTT's i18n system. It safely handles missing i18n and returns
 * the original objects when localization cannot be performed.
 *
 * @class SettingLocalizer
 * @export
 */
class SettingLocalizer {
  /**
   * Localize a single setting definition.
   *
   * @param {Object} setting - The setting definition to localize
   * @param {string} setting.key - Setting key
   * @param {Object} setting.config - Setting config
   * @param {Object} [utils] - Utilities bag; if provided, tries `utils.static.localizer` first.
   * @returns {Object} Localized setting definition (shallow-copied)
   */
  static #resolveLocalizeFn(utils) {
    const candidate = utils?.static?.localizer;
    if (candidate && typeof candidate.localize === 'function') {
      return (key) => {
        try { return candidate.localize(key); } catch { return key; }
      };
    }
    if (globalThis?.game?.i18n && typeof globalThis.game.i18n.localize === 'function') {
      const i18n = globalThis.game.i18n;
      return (key) => {
        try { return i18n.localize(key); } catch { return key; }
      };
    }
    return null;
  }

  static #localizeField(localizeFn, obj, field) {
    if (!localizeFn) return;
    if (obj && typeof obj[field] === 'string') {
      const v = localizeFn(obj[field]);
      if (v !== obj[field]) obj[field] = v;
    }
  }

  static #localizeChoices(localizeFn, obj) {
    if (!localizeFn) return;
    if (!obj || typeof obj.choices !== 'object') return;
    const choices = {};
    for (const [k, value] of Object.entries(obj.choices)) {
      if (typeof value === 'string') {
        const loc = localizeFn(value);
        choices[k] = loc !== value ? loc : value;
      } else {
        choices[k] = value;
      }
    }
    obj.choices = choices;
  }

  static localizeSetting(setting, utils) {
    if (!setting || !setting.config) return setting;

    const localizeFn = SettingLocalizer.#resolveLocalizeFn(utils);
    if (!localizeFn) return setting;

    const localizedSetting = { ...setting, config: { ...setting.config } };

    SettingLocalizer.#localizeField(localizeFn, localizedSetting.config, 'name');
    SettingLocalizer.#localizeField(localizeFn, localizedSetting.config, 'hint');
    SettingLocalizer.#localizeChoices(localizeFn, localizedSetting.config);

    return localizedSetting;
  }

  /**
   * Localize an array of setting definitions.
   *
   * @param {Array<Object>} settings - Array of settings to localize
   * @param {Object} [utils] - Utilities bag; if provided, tries `utils.static.localizer` first.
   * @returns {Array<Object>} Localized settings array (mapped copy)
   */
  static localizeSettings(settings, utils) {
    if (!Array.isArray(settings)) return settings;
    return settings.map((s) => SettingLocalizer.localizeSetting(s, utils));
  }
}

export default SettingLocalizer;
