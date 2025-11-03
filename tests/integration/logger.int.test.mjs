/**
 * @file logger.int.test.mjs
 * @description Integration tests for the Logger and configuration flow.
 * @path tests/integration/logger.int.test.mjs
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '#/utils/logger.ts';
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import { config } from '#/config/config.ts';

describe('Logger integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs messages end-to-end using resolved module name', () => {
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});
    const config = {
      moduleManagement: {
        referToModuleBy: 'shortName',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
        shortName: 'OMH',
      },
      logging: {
        level: 'info',
        colorize: false,
        timestamp: {
          enabled: false,
          format: 'iso',
        },
        format: {
          info: '[{module}] :: {message}',
        },
      },
    };

    const moduleName = resolveModuleName(config);
    const logger = new Logger({
      ...config.logging,
      moduleName,
    });

    logger.info('Integration test log');

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleInfoSpy.mock.calls[0][0]).toBe(
      '[OMH] :: Integration test log'
    );
    expect(config.logging.level).toBe('info');
    expect(config.logging.timestamp.enabled).toBe(false);
  });

  it('toggles debug mode behavior between logger instances', () => {
    const consoleDebugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => {});
    const config = {
      moduleManagement: {
        referToModuleBy: 'shortName',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
        shortName: 'OMH',
      },
      logging: {
        level: 'info',
        colorize: false,
        timestamp: {
          enabled: false,
          format: 'iso',
        },
      },
    };

    const moduleName = resolveModuleName(config);
    const baseLoggingConfig = {
      ...config.logging,
      moduleName,
    };

    const nonDebugLogger = new Logger({
      ...baseLoggingConfig,
      debugMode: false,
    });
    nonDebugLogger.debug('Suppressed debug message');

    expect(consoleDebugSpy).not.toHaveBeenCalled();

    consoleDebugSpy.mockClear();

    const debugLogger = new Logger({
      ...baseLoggingConfig,
      debugMode: true,
    });
    debugLogger.debug('Visible debug message');

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
  });

  it('applies per-call overrides without mutating base configuration', () => {
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});
    const configObj = {
      moduleManagement: {
        referToModuleBy: 'shortName',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
        shortName: 'OMH',
      },
      logging: {
        level: 'info',
        colorize: false,
        timestamp: {
          enabled: true,
          format: 'iso',
        },
        format: {
          info: '[{module}] :: {message}',
        },
      },
    };

    const moduleName = resolveModuleName(configObj);
    const logger = new Logger({
      ...configObj.logging,
      moduleName,
    });

    logger.info('Base info message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleInfoSpy.mock.calls[0][0]).toBe('[OMH] :: Base info message');

    const overrides = {
      timestamp: {
        enabled: false,
        format: 'iso',
      },
      format: {
        info: '[OVERRIDE] {message} ({metadata.step})',
      },
    };

    logger.info('Override message', { step: 'alpha' }, overrides);

    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleInfoSpy.mock.calls[1][0]).toBe(
      '[OVERRIDE] Override message (alpha)'
    );
    expect(configObj.logging.format.info).toBe('[{module}] :: {message}');
    expect(configObj.logging.timestamp.enabled).toBe(true);

    logger.info('Base info message again');

    expect(consoleInfoSpy).toHaveBeenCalledTimes(3);
    expect(consoleInfoSpy.mock.calls[2][0]).toBe(
      '[OMH] :: Base info message again'
    );
  });

  it('creates logger directly from Config singleton', () => {
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    // Create logger using Config singleton
    const logger = new Logger(config);

    logger.info('Message from Config singleton');

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleInfoSpy.mock.calls[0][0]).toContain(
      'Message from Config singleton'
    );
  });

  it('uses logging configuration from Config.features.logging', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Create logger using Config singleton
    const logger = new Logger(config);

    logger.error('Error from Config singleton');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    // Verify it follows the format from features.yaml
    const errorMessage = consoleErrorSpy.mock.calls[0][0];
    expect(errorMessage).toMatch(/\[.*\] ERROR \|/);
    expect(errorMessage).toContain('Error from Config singleton');
  });
});
