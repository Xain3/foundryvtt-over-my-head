import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';

// Mock dependencies that use problematic aliases
vi.mock('#handlers/settingsHelpers/settingsParser.mjs', () => ({
  default: class MockSettingsParser {
    constructor() {}
    parse(settings) {
      return {
        parsed: settings || [],
        validSettings: settings || [],
        invalidSettings: [],
      };
    }
  },
}));

vi.mock('#handlers/settingsHelpers/settingsRegistrar.mjs', () => ({
  default: class MockSettingsRegistrar {
    constructor() {}
    register() {
      return { success: true, counter: 1, successCounter: 1 };
    }
  },
}));

vi.mock('#handlers/settingsHelpers/settingLocalizer.mjs', () => ({
  default: class MockSettingLocalizer {
    constructor() {}
  },
}));

vi.mock('#helpers/settingsRetriever.mjs', async () =>
  vi.importActual('../helpers/settingsRetriever.mjs')
);

// Mock placeable handler dependencies
vi.mock('./placeableHelpers/placeableGetter.mjs', () => ({
  default: class MockPlaceableGetter {
    constructor() {}
    getAllPlaceables() {
      return [{ id: 'placeable1' }, { id: 'placeable2' }];
    }
    getCorner() {
      return { x: 10, y: 20 };
    }
    getCenter() {
      return { x: 50, y: 50 };
    }
    getElevation() {
      return 5;
    }
    getRectBounds() {
      return { x: 0, y: 0, width: 100, height: 100 };
    }
    getPosition() {
      return { x: 25, y: 25 };
    }
  },
}));

vi.mock('./placeableHelpers/placeableChecker.mjs', () => ({
  default: class MockPlaceableChecker {
    constructor() {}
    isSelected() {
      return true;
    }
    isUnder() {
      return true;
    }
    isOver() {
      return false;
    }
  },
}));

vi.mock('./placeableHelpers/placeableSetter.mjs', () => ({
  default: class MockPlaceableSetter {
    constructor() {}
    setCurrentPlaceable() {
      return { id: 'currentPlaceable' };
    }
  },
}));

import Handlers from './handlers.mjs';

import Handler from '../baseClasses/handler.mjs';
import SettingsHandler from './settingsHandler.mjs';
import PlaceableHandler from './placeableHandler.mjs';

describe('Handlers', () => {
  const fakeConfig = {
    constants: {
      settings: {
        requiredKeys: ['key', 'config'],
        settingsList: [
          {
            key: 'testSetting',
            config: { name: 'Test Setting', type: Boolean, default: true },
          },
        ],
      },
    },
    manifest: { id: 'foundryvtt-over-my-head' },
  };

  const fakeConfigWithDebug = {
    constants: {
      settings: {
        requiredKeys: ['key', 'config'],
        settingsList: [
          {
            key: 'testSetting',
            config: { name: 'Test Setting', type: Boolean, default: true },
          },
          {
            key: 'debugMode',
            config: { name: 'Debug Mode', type: Boolean, default: false },
          },
        ],
      },
    },
    manifest: { id: 'foundryvtt-over-my-head' },
  };

  const fakeUtils = {
    formatError: (m) => m,
    formatHookName: (n) => `formatted.${n}`,
    logWarning: () => {},
    logDebug: () => {},
    log: () => {},
  };

  const fakeContext = { some: 'context' };

  it('constructs and creates a settings handler instance', () => {
    const handlers = new Handlers({
      config: fakeConfig,
      utils: fakeUtils,
      context: fakeContext,
    });

    expect(handlers).toBeDefined();
    // Handlers should inherit from Handler
    expect(handlers instanceof Handler).toBe(true);
    // Should have a settings property (SettingsHandler instance)
    expect(handlers.settings).toBeDefined();
    // It should carry through config, utils, and context
    expect(handlers.config).toBe(fakeConfig);
    expect(handlers.utils).toBe(fakeUtils);
    expect(handlers.context).toBe(fakeContext);
  });

  it('throws when missing parameters', () => {
    expect(
      () =>
        new Handlers({ config: null, utils: fakeUtils, context: fakeContext })
    ).toThrow();
    expect(
      () =>
        new Handlers({ config: fakeConfig, utils: null, context: fakeContext })
    ).toThrow();
    expect(
      () =>
        new Handlers({ config: fakeConfig, utils: fakeUtils, context: null })
    ).toThrow();
  });

  it('should create a settings handler instance', () => {
    const handlers = new Handlers({
      config: fakeConfig,
      utils: fakeUtils,
      context: fakeContext,
    });
    expect(handlers.settings).toBeInstanceOf(SettingsHandler);
  });

  it('should create a placeable handler instance', () => {
    const handlers = new Handlers({
      config: fakeConfig,
      utils: fakeUtils,
      context: fakeContext,
    });
    expect(handlers.placeable).toBeInstanceOf(PlaceableHandler);
  });

  describe('Debug Mode convenience methods', () => {
    it('should delegate hasDebugModeSettingConfig to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfigWithDebug,
        utils: fakeUtils,
        context: fakeContext,
      });
      vi.spyOn(handlers.settings, 'hasDebugModeSettingConfig').mockReturnValue(
        true
      );

      const result = handlers.hasDebugModeSettingConfig();

      expect(handlers.settings.hasDebugModeSettingConfig).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should delegate getDebugModeSettingConfig to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfigWithDebug,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockDebugSetting = {
        key: 'debugMode',
        config: { name: 'Debug Mode' },
      };
      vi.spyOn(handlers.settings, 'getDebugModeSettingConfig').mockReturnValue(
        mockDebugSetting
      );

      const result = handlers.getDebugModeSettingConfig();

      expect(handlers.settings.getDebugModeSettingConfig).toHaveBeenCalled();
      expect(result).toBe(mockDebugSetting);
    });

    it('should delegate registerDebugModeSetting to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfigWithDebug,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockResult = { success: true, counter: 1, successCounter: 1 };
      vi.spyOn(handlers.settings, 'registerDebugModeSetting').mockReturnValue(
        mockResult
      );

      const result = handlers.registerDebugModeSetting();

      expect(handlers.settings.registerDebugModeSetting).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should return false when no debug setting exists', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });

      const hasDebug = handlers.hasDebugModeSettingConfig();
      const debugSetting = handlers.getDebugModeSettingConfig();

      expect(hasDebug).toBe(false);
      expect(debugSetting).toBe(null);
    });
  });

  describe('Generic setting convenience methods', () => {
    it('should delegate hasSettingConfigByKey to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      vi.spyOn(handlers.settings, 'hasSettingConfigByKey').mockReturnValue(
        true
      );

      const result = handlers.hasSettingConfigByKey('testSetting');

      expect(handlers.settings.hasSettingConfigByKey).toHaveBeenCalledWith(
        'testSetting'
      );
      expect(result).toBe(true);
    });

    it('should delegate getSettingConfigByKey to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockSetting = {
        key: 'testSetting',
        config: { name: 'Test Setting' },
      };
      vi.spyOn(handlers.settings, 'getSettingConfigByKey').mockReturnValue(
        mockSetting
      );

      const result = handlers.getSettingConfigByKey('testSetting');

      expect(handlers.settings.getSettingConfigByKey).toHaveBeenCalledWith(
        'testSetting'
      );
      expect(result).toBe(mockSetting);
    });

    it('should delegate registerSettingByKey to settings handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockResult = { success: true, counter: 1, successCounter: 1 };
      vi.spyOn(handlers.settings, 'registerSettingByKey').mockReturnValue(
        mockResult
      );

      const result = handlers.registerSettingByKey('testSetting');

      expect(handlers.settings.registerSettingByKey).toHaveBeenCalledWith(
        'testSetting'
      );
      expect(result).toBe(mockResult);
    });

    it('should return false when setting does not exist', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });

      const hasSetting = handlers.hasSettingConfigByKey('nonExistentSetting');
      const setting = handlers.getSettingConfigByKey('nonExistentSetting');

      expect(hasSetting).toBe(false);
      expect(setting).toBe(null);
    });

    it('should return true for existing setting', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });

      const hasSetting = handlers.hasSettingConfigByKey('testSetting');
      const setting = handlers.getSettingConfigByKey('testSetting');

      expect(hasSetting).toBe(true);
      expect(setting).toEqual({
        key: 'testSetting',
        config: { name: 'Test Setting', type: Boolean, default: true },
      });
    });
  });

  describe('Settings Value Retrieval Methods', () => {
    beforeEach(() => {
      global.game = {
        settings: {
          get: vi.fn(),
        },
      };
    });

    afterEach(() => {
      delete global.game;
    });

    describe('hasSetting', () => {
      it('should delegate to settings handler hasSetting method', () => {
        global.game.settings.get.mockReturnValue(true);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.hasSetting('testSetting');

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith(
          'foundryvtt-over-my-head',
          'testSetting'
        );
      });

      it('should return false when setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.hasSetting('nonExistentSetting');

        expect(result).toBe(false);
      });
    });

    describe('getSettingValue', () => {
      it('should delegate to settings handler getSettingValue method', () => {
        const expectedValue = 'test value';
        global.game.settings.get.mockReturnValue(expectedValue);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.getSettingValue('testSetting');

        expect(result).toBe(expectedValue);
        expect(global.game.settings.get).toHaveBeenCalledWith(
          'foundryvtt-over-my-head',
          'testSetting'
        );
      });

      it('should return undefined when setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.getSettingValue('nonExistentSetting');

        expect(result).toBe(undefined);
      });
    });

    describe('hasDebugModeSetting', () => {
      it('should delegate to settings handler hasDebugModeSetting method', () => {
        global.game.settings.get.mockReturnValue(false);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.hasDebugModeSetting();

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith(
          'foundryvtt-over-my-head',
          'debugMode'
        );
      });

      it('should return false when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.hasDebugModeSetting();

        expect(result).toBe(false);
      });
    });

    describe('getDebugModeSettingValue', () => {
      it('should delegate to settings handler getDebugModeSettingValue method', () => {
        global.game.settings.get.mockReturnValue(true);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.getDebugModeSettingValue();

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith(
          'foundryvtt-over-my-head',
          'debugMode'
        );
      });

      it('should return false when debugMode is disabled', () => {
        global.game.settings.get.mockReturnValue(false);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.getDebugModeSettingValue();

        expect(result).toBe(false);
      });

      it('should return undefined when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers({
          config: fakeConfig,
          utils: fakeUtils,
          context: fakeContext,
        });

        const result = handlers.getDebugModeSettingValue();

        expect(result).toBe(undefined);
      });
    });
  });

  describe('Placeable Convenience Methods', () => {
    it('should delegate setCurrentPlaceable to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockResult = { id: 'currentPlaceable' };
      vi.spyOn(handlers.placeable, 'setCurrent').mockReturnValue(mockResult);

      const result = handlers.setCurrentPlaceable(mockPlaceable);

      expect(handlers.placeable.setCurrent).toHaveBeenCalledWith(mockPlaceable);
      expect(result).toBe(mockResult);
    });

    it('should delegate getCurrentPlaceable to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockCurrent = { id: 'currentPlaceable' };
      vi.spyOn(handlers.placeable, 'getCurrent').mockReturnValue(mockCurrent);

      const result = handlers.getCurrentPlaceable();

      expect(handlers.placeable.getCurrent).toHaveBeenCalled();
      expect(result).toBe(mockCurrent);
    });

    it('should delegate getAllPlaceables to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceables = [{ id: 'placeable1' }, { id: 'placeable2' }];
      vi.spyOn(handlers.placeable, 'getAll').mockReturnValue(mockPlaceables);

      const result = handlers.getAllPlaceables('Token', true, true);

      expect(handlers.placeable.getAll).toHaveBeenCalledWith(
        'Token',
        true,
        true
      );
      expect(result).toBe(mockPlaceables);
    });

    it('should delegate getPlaceableCorner to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockCorner = { x: 10, y: 20 };
      vi.spyOn(handlers.placeable, 'getCorner').mockReturnValue(mockCorner);

      const result = handlers.getPlaceableCorner('topLeft', mockPlaceable);

      expect(handlers.placeable.getCorner).toHaveBeenCalledWith(
        'topLeft',
        mockPlaceable
      );
      expect(result).toBe(mockCorner);
    });

    it('should delegate getPlaceableCenter to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockCenter = { x: 50, y: 50 };
      vi.spyOn(handlers.placeable, 'getCenter').mockReturnValue(mockCenter);

      const result = handlers.getPlaceableCenter(mockPlaceable);

      expect(handlers.placeable.getCenter).toHaveBeenCalledWith(mockPlaceable);
      expect(result).toBe(mockCenter);
    });

    it('should delegate getPlaceableElevation to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockElevation = 5;
      vi.spyOn(handlers.placeable, 'getElevation').mockReturnValue(
        mockElevation
      );

      const result = handlers.getPlaceableElevation(mockPlaceable);

      expect(handlers.placeable.getElevation).toHaveBeenCalledWith(
        mockPlaceable
      );
      expect(result).toBe(mockElevation);
    });

    it('should delegate getPlaceableRectBounds to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockBounds = { x: 0, y: 0, width: 100, height: 100 };
      vi.spyOn(handlers.placeable, 'getRectBounds').mockReturnValue(mockBounds);

      const result = handlers.getPlaceableRectBounds(mockPlaceable);

      expect(handlers.placeable.getRectBounds).toHaveBeenCalledWith(
        mockPlaceable
      );
      expect(result).toBe(mockBounds);
    });

    it('should delegate getPlaceablePosition to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      const mockManager = { some: 'manager' };
      const mockPosition = { x: 25, y: 25 };
      vi.spyOn(handlers.placeable, 'getPosition').mockReturnValue(mockPosition);

      const result = handlers.getPlaceablePosition(
        mockPlaceable,
        mockManager,
        'center'
      );

      expect(handlers.placeable.getPosition).toHaveBeenCalledWith(
        mockPlaceable,
        mockManager,
        'center'
      );
      expect(result).toBe(mockPosition);
    });

    it('should delegate isPlaceableSelected to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockPlaceable = { id: 'testPlaceable' };
      vi.spyOn(handlers.placeable, 'isSelected').mockReturnValue(true);

      const result = handlers.isPlaceableSelected(mockPlaceable);

      expect(handlers.placeable.isSelected).toHaveBeenCalledWith(mockPlaceable);
      expect(result).toBe(true);
    });

    it('should delegate isPlaceableUnder to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockTarget = { id: 'target' };
      const mockReference = { id: 'reference' };
      const mockTargetManager = { type: 'target' };
      const mockReferenceManager = { type: 'reference' };
      vi.spyOn(handlers.placeable, 'isUnder').mockReturnValue(true);

      const result = handlers.isPlaceableUnder(
        mockTarget,
        mockReference,
        mockTargetManager,
        mockReferenceManager,
        'center',
        'rectangle',
        'under'
      );

      expect(handlers.placeable.isUnder).toHaveBeenCalledWith(
        mockTarget,
        mockReference,
        mockTargetManager,
        mockReferenceManager,
        'center',
        'rectangle',
        'under'
      );
      expect(result).toBe(true);
    });

    it('should delegate isPlaceableOver to placeable handler', () => {
      const handlers = new Handlers({
        config: fakeConfig,
        utils: fakeUtils,
        context: fakeContext,
      });
      const mockTarget = { id: 'target' };
      const mockReference = { id: 'reference' };
      const mockTargetManager = { type: 'target' };
      const mockReferenceManager = { type: 'reference' };
      vi.spyOn(handlers.placeable, 'isOver').mockReturnValue(false);

      const result = handlers.isPlaceableOver(
        mockTarget,
        mockReference,
        mockTargetManager,
        mockReferenceManager,
        'center',
        'rectangle',
        'above'
      );

      expect(handlers.placeable.isOver).toHaveBeenCalledWith(
        mockTarget,
        mockReference,
        mockTargetManager,
        mockReferenceManager,
        'center',
        'rectangle',
        'above'
      );
      expect(result).toBe(false);
    });
  });
});
