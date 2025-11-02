/**
 * @file logger.int.test.mjs
 * @description Integration tests for the Logger and configuration flow.
 * @path tests/integration/logger.int.test.mjs
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '#/utils/logger.ts';
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';

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
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockClear();

    const debugLogger = new Logger({
      ...baseLoggingConfig,
      debugMode: true,
    });
    debugLogger.debug('Visible debug message');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('applies per-call overrides without mutating base configuration', () => {
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
          enabled: true,
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
    expect(config.logging.format.info).toBe('[{module}] :: {message}');
    expect(config.logging.timestamp.enabled).toBe(true);

    logger.info('Base info message again');

    expect(consoleInfoSpy).toHaveBeenCalledTimes(3);
    expect(consoleInfoSpy.mock.calls[2][0]).toBe(
      '[OMH] :: Base info message again'
    );
  });
});
