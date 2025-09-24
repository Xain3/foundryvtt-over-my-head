/**
 * @file MockSettings.unit.test.mjs
 * @description Unit tests for MockSettings class
 * @path tests/mocks/MockSettings.unit.test.mjs
 */

import MockSettings from './MockSettings.mjs';

describe('MockSettings', () => {
  let settings;

  beforeEach(() => {
    settings = new MockSettings();
  });

  describe('constructor', () => {
    it('should create settings with empty storage', () => {
      expect(settings.storage).toBeInstanceOf(Map);
      expect(settings.storage.size).toBe(0);
    });
  });

  describe('register', () => {
    it('should register setting with default value', () => {
      const settingData = {
        name: 'Test Setting',
        hint: 'A test setting',
        scope: 'world',
        config: true,
        type: String,
        default: 'defaultValue'
      };

      settings.register('testModule', 'testKey', settingData);

      const storedSetting = settings.storage.get('testModule.testKey');
      expect(storedSetting).toEqual({
        ...settingData,
        value: 'defaultValue'
      });
    });

    it('should register multiple settings', () => {
      settings.register('module1', 'setting1', { default: 'value1' });
      settings.register('module1', 'setting2', { default: 'value2' });
      settings.register('module2', 'setting1', { default: 'value3' });

      expect(settings.storage.size).toBe(3);
      expect(settings.storage.has('module1.setting1')).toBe(true);
      expect(settings.storage.has('module1.setting2')).toBe(true);
      expect(settings.storage.has('module2.setting1')).toBe(true);
    });

    it('should handle different data types', () => {
      settings.register('test', 'string', { default: 'text' });
      settings.register('test', 'number', { default: 42 });
      settings.register('test', 'boolean', { default: true });
      settings.register('test', 'object', { default: { key: 'value' } });

      expect(settings.get('test', 'string')).toBe('text');
      expect(settings.get('test', 'number')).toBe(42);
      expect(settings.get('test', 'boolean')).toBe(true);
      expect(settings.get('test', 'object')).toEqual({ key: 'value' });
    });

    it('should overwrite existing registration', () => {
      settings.register('test', 'key', { default: 'original' });
      settings.register('test', 'key', { default: 'updated' });

      expect(settings.get('test', 'key')).toBe('updated');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      settings.register('testModule', 'testKey', { default: 'testValue' });
      settings.register('anotherModule', 'anotherKey', { default: 123 });
    });

    it('should get registered setting value', () => {
      expect(settings.get('testModule', 'testKey')).toBe('testValue');
      expect(settings.get('anotherModule', 'anotherKey')).toBe(123);
    });

    it('should return undefined for non-existent setting', () => {
      expect(settings.get('nonExistent', 'key')).toBeUndefined();
      expect(settings.get('testModule', 'nonExistent')).toBeUndefined();
    });

    it('should return updated value after set', async () => {
      await settings.set('testModule', 'testKey', 'updatedValue');
      expect(settings.get('testModule', 'testKey')).toBe('updatedValue');
    });
  });

  describe('set', () => {
    beforeEach(() => {
      settings.register('testModule', 'testKey', { default: 'defaultValue' });
    });

    it('should update existing setting value', async () => {
      const result = await settings.set('testModule', 'testKey', 'newValue');
      
      expect(result).toBe('newValue');
      expect(settings.get('testModule', 'testKey')).toBe('newValue');
    });

    it('should handle different value types', async () => {
      settings.register('test', 'string', { default: '' });
      settings.register('test', 'number', { default: 0 });
      settings.register('test', 'boolean', { default: false });
      settings.register('test', 'object', { default: {} });

      await settings.set('test', 'string', 'new text');
      await settings.set('test', 'number', 99);
      await settings.set('test', 'boolean', true);
      await settings.set('test', 'object', { updated: true });

      expect(settings.get('test', 'string')).toBe('new text');
      expect(settings.get('test', 'number')).toBe(99);
      expect(settings.get('test', 'boolean')).toBe(true);
      expect(settings.get('test', 'object')).toEqual({ updated: true });
    });

    it('should handle non-existent setting gracefully', async () => {
      const result = await settings.set('nonExistent', 'key', 'value');
      expect(result).toBe('value');
      expect(settings.get('nonExistent', 'key')).toBeUndefined();
    });

    it('should be async and return promise', async () => {
      const promise = settings.set('testModule', 'testKey', 'asyncValue');
      expect(promise).toBeInstanceOf(Promise);
      
      const result = await promise;
      expect(result).toBe('asyncValue');
    });
  });

  describe('integration tests', () => {
    it('should handle complete setting lifecycle', async () => {
      // Register
      settings.register('myModule', 'mySetting', {
        name: 'My Setting',
        scope: 'world',
        config: true,
        type: String,
        default: 'initial'
      });

      // Get default
      expect(settings.get('myModule', 'mySetting')).toBe('initial');

      // Update
      await settings.set('myModule', 'mySetting', 'updated');
      expect(settings.get('myModule', 'mySetting')).toBe('updated');

      // Update again
      await settings.set('myModule', 'mySetting', 'final');
      expect(settings.get('myModule', 'mySetting')).toBe('final');
    });

    it('should handle multiple modules with same key names', async () => {
      settings.register('module1', 'enabled', { default: true });
      settings.register('module2', 'enabled', { default: false });

      expect(settings.get('module1', 'enabled')).toBe(true);
      expect(settings.get('module2', 'enabled')).toBe(false);

      await settings.set('module1', 'enabled', false);
      await settings.set('module2', 'enabled', true);

      expect(settings.get('module1', 'enabled')).toBe(false);
      expect(settings.get('module2', 'enabled')).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should simulate module configuration', async () => {
      // Register module settings
      settings.register('over-my-head', 'enabled', {
        name: 'Enable Over My Head',
        hint: 'Enables the Over My Head module functionality',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      settings.register('over-my-head', 'displayMode', {
        name: 'Display Mode',
        hint: 'How to display information',
        scope: 'client',
        config: true,
        type: String,
        choices: { tooltip: 'Tooltip', panel: 'Side Panel' },
        default: 'tooltip'
      });

      // Check defaults
      expect(settings.get('over-my-head', 'enabled')).toBe(true);
      expect(settings.get('over-my-head', 'displayMode')).toBe('tooltip');

      // User changes settings
      await settings.set('over-my-head', 'enabled', false);
      await settings.set('over-my-head', 'displayMode', 'panel');

      // Verify changes
      expect(settings.get('over-my-head', 'enabled')).toBe(false);
      expect(settings.get('over-my-head', 'displayMode')).toBe('panel');
    });

    it('should simulate game system settings', async () => {
      settings.register('dnd5e', 'metricWeightUnits', { default: false });
      settings.register('dnd5e', 'disableExperienceTracking', { default: false });
      settings.register('dnd5e', 'restVariant', { default: 'normal' });

      // Configure for European game
      await settings.set('dnd5e', 'metricWeightUnits', true);
      await settings.set('dnd5e', 'restVariant', 'gritty');

      expect(settings.get('dnd5e', 'metricWeightUnits')).toBe(true);
      expect(settings.get('dnd5e', 'disableExperienceTracking')).toBe(false);
      expect(settings.get('dnd5e', 'restVariant')).toBe('gritty');
    });
  });
});
