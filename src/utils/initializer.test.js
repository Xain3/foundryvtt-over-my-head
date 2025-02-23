// ./src/utils/initializer.test.js

import Initializer from './initializer.js';
import MockConfig from '../../tests/mocks/mockConfig.js';
import MockContext from '../../tests/mocks/mockContext.js';
import Utility from '../baseClasses/utility.js';

jest.mock('@baseClasses/utility.js');

describe('Initializer', () => {
  let mockConfig;
  let mockUtils;
  let mockContext;
  let initializer;

  beforeEach(() => {
    mockConfig = new MockConfig().getConfig();
    mockUtils = {
      logger: {
        log: jest.fn(),
      },
      gameManager: {
        remoteContext: {},
      },
      hookFormatter: {
        formatHooks: jest.fn(),
      },
    };

    initializer = new Initializer(mockConfig, mockUtils, MockContext);
    initializer.config = mockConfig;
  });

  test('should ensure config', () => {
    const config = initializer.ensureConfig(null);
    expect(config).toBe(mockConfig);
  });

  test('should throw error if no config is provided', () => {
    initializer.config = null;
    expect(() => initializer.ensureConfig(null)).toThrow('No configuration provided');
  });

  test('should initialize context object', () => {
    const context = initializer.initializeContextObject();
    expect(mockUtils.logger.log).toHaveBeenCalledWith('Initializing context');
    expect(mockUtils.logger.log).toHaveBeenCalledWith('Context initialized');
    expect(context).toBeInstanceOf(MockContext);
  });

  test('should initialize remote context', () => {
      const context = initializer.initializeContextObject();
      context.setRemoteLocation = jest.fn();
      initializer.initializeRemoteContext(context);
      expect(mockUtils.logger.log).toHaveBeenCalledWith('Initializing session with remote context');
      expect(context.setRemoteLocation).toHaveBeenCalledWith(mockUtils.gameManager.remoteContext, true);
      expect(mockUtils.logger.log).toHaveBeenCalledWith('Session initialized');
  });

  test('should register settings', () => {
    const handlers = {
      settings: {
        registerSettings: jest.fn(),
      },
    };
    initializer.registerSettings(handlers, mockContext);
    expect(mockUtils.logger.log).toHaveBeenCalledWith('Registering settings');
    expect(handlers.settings.registerSettings).toHaveBeenCalledWith(mockContext);
    expect(mockUtils.logger.log).toHaveBeenCalledWith('Settings registered');
  });

  test('should initialize context', async () => {
    global.Hooks = {
      once: jest.fn((hookName, callback) => {
        callback();
      }),
    };
    const context = await initializer.initializeContext();
    expect(context).toBeInstanceOf(MockContext);
  });

  test('should initialize settings', () => {
    global.Hooks = {
      once: jest.fn((hookName, callback) => {
        callback();
      }),
      callAll: jest.fn(),
    };
    global.settingsReady = false;
    const context = {
      setFlags: jest.fn(),
    };
    initializer.context = context;
    initializer.registerSettings = jest.fn();
    initializer.logger = mockUtils.logger;
    initializer.hookFormatter.formatHooks.mockReturnValue('formattedHook');
    initializer.initializeSettings();

    expect(mockUtils.logger.log).toHaveBeenCalledWith('Initializing module');
    expect(initializer.registerSettings).toHaveBeenCalled();
    expect(mockUtils.logger.log).toHaveBeenCalledWith('Module initialized');
    expect(context.setFlags).toHaveBeenCalledWith('settingsReady', true);
    expect(global.Hooks.callAll).toHaveBeenCalledWith('formattedHook');
  });
});