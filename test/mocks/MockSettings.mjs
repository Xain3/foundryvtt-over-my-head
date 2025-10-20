/**
 * @file MockSettings.mjs
 * @description Mock Settings class for game settings
 * @path tests/mocks/MockSettings.mjs
 */

/**
 * Mock Settings class for game settings
 */
class MockSettings {
  constructor() {
    this.storage = new Map();
  }

  register(module, key, data) {
    const settingKey = `${module}.${key}`;
    this.storage.set(settingKey, { ...data, value: data.default });
  }

  get(module, key) {
    const settingKey = `${module}.${key}`;
    const setting = this.storage.get(settingKey);
    return setting ? setting.value : undefined;
  }

  async set(module, key, value) {
    const settingKey = `${module}.${key}`;
    const setting = this.storage.get(settingKey);
    if (setting) {
      setting.value = value;
    }
    return value;
  }
}

export default MockSettings;
