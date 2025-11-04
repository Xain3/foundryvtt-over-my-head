/**
 * @file logger.unit.test.mjs
 * @description Unit tests for the Logger class formatting and behavior.
 * @path tests/unit/logger.unit.test.mjs
 */

import chalk from 'chalk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '#/utils/logger.ts';
import { config } from '#/config/config.ts';

const FIXED_DATE = new Date('2025-11-02T15:30:45.123Z');

const baseConfig = {
  moduleName: 'OMH',
  level: 'debug',
  colorize: false,
  timestamp: {
    enabled: true,
    format: 'iso',
  },
};

function createLogger(overrides = {}) {
  return new Logger({
    ...baseConfig,
    ...overrides,
  });
}

function setUpConsoleSpy(method) {
  return vi.spyOn(console, method).mockImplementation(() => {});
}

describe('Logger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates an instance with the provided configuration', () => {
    expect(() => createLogger()).not.toThrow();
  });

  it('formats error messages with module name, level, timestamp, and message', () => {
    const errorSpy = setUpConsoleSpy('error');
    const logger = createLogger({ colorize: false });

    logger.error('Critical failure');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe(
      '[OMH] ERROR | 2025-11-02T15:30:45.123Z | Critical failure'
    );
  });

  it('formats warn messages with module name, level, timestamp, and message', () => {
    const warnSpy = setUpConsoleSpy('warn');
    const logger = createLogger({ colorize: false });

    logger.warn('Cache nearing capacity');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toBe(
      '[OMH] WARN | 2025-11-02T15:30:45.123Z | Cache nearing capacity'
    );
  });

  it('formats info messages with module name and message', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({ colorize: false });

    logger.info('User authenticated');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toBe('[OMH] User authenticated');
  });

  it('formats verbose messages with module name and message', () => {
    const logSpy = setUpConsoleSpy('log');
    const logger = createLogger({ colorize: false, debugMode: true });

    logger.verbose('Processing queue item');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toBe(
      '[OMH] VERBOSE | Processing queue item'
    );
  });

  it('formats debug messages with metadata serialization', () => {
    const debugSpy = setUpConsoleSpy('debug');
    const logger = createLogger({ colorize: false, debugMode: true });

    logger.debug('Debug details', { feature: 'logger', enabled: true });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toBe(
      '[OMH] DEBUG | 2025-11-02T15:30:45.123Z | Debug details | {"feature":"logger","enabled":true}'
    );
  });

  it('produces ISO 8601 timestamps when configured', () => {
    const warnSpy = setUpConsoleSpy('warn');
    const logger = createLogger();

    logger.warn('Timestamp verification');

    expect(warnSpy.mock.calls[0][0]).toContain('2025-11-02T15:30:45.123Z');
  });

  it('replaces core placeholders with contextual values', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({
      format: {
        info: '{module}::{level}::{timestamp}::{message}',
      },
    });

    logger.info('Placeholder test');

    expect(infoSpy.mock.calls[0][0]).toBe(
      'OMH::INFO::2025-11-02T15:30:45.123Z::Placeholder test'
    );
  });

  it('replaces custom metadata placeholders', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({
      format: {
        info: '{module}::{metadata.user.id}',
      },
    });

    logger.info('Metadata test', { user: { id: 123 } });

    expect(infoSpy.mock.calls[0][0]).toBe('OMH::123');
  });

  it('suppresses verbose and debug messages when debug mode is disabled', () => {
    const verboseSpy = setUpConsoleSpy('log');
    const debugSpy = setUpConsoleSpy('debug');
    const logger = createLogger({
      level: 'info',
      debugMode: false,
    });

    logger.verbose('Should not appear');
    logger.debug('Should not appear');

    expect(verboseSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('emits verbose and debug messages when debug mode is enabled', () => {
    const verboseSpy = setUpConsoleSpy('log');
    const debugSpy = setUpConsoleSpy('debug');
    const logger = createLogger({
      level: 'info',
      debugMode: true,
    });

    logger.verbose('Verbose enabled');
    logger.debug('Debug enabled');

    expect(verboseSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('still emits error, warn, and info messages when debug mode is disabled', () => {
    const errorSpy = setUpConsoleSpy('error');
    const warnSpy = setUpConsoleSpy('warn');
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({
      level: 'info',
      debugMode: false,
    });

    logger.error('Error still logs');
    logger.warn('Warn still logs');
    logger.info('Info still logs');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('allows overriding error format on a per-call basis', () => {
    const errorSpy = setUpConsoleSpy('error');
    const logger = createLogger({ colorize: false });

    logger.error('Override error', undefined, {
      format: {
        error: '!!! {message} !!!',
      },
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe('!!! Override error !!!');
  });

  it('allows overriding warn format on a per-call basis', () => {
    const warnSpy = setUpConsoleSpy('warn');
    const logger = createLogger({ colorize: false });

    logger.warn('Override warn', undefined, {
      format: {
        warn: '<WARN> {message}',
      },
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toBe('<WARN> Override warn');
  });

  it('allows overriding info format on a per-call basis', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({ colorize: false });

    logger.info('Override info', undefined, {
      format: {
        info: 'INFO :: {message}',
      },
    });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toBe('INFO :: Override info');
  });

  it('allows overriding verbose format on a per-call basis', () => {
    const logSpy = setUpConsoleSpy('log');
    const logger = createLogger({ colorize: false, debugMode: true });

    logger.verbose('Override verbose', undefined, {
      format: {
        verbose: 'VERBOSE => {message}',
      },
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toBe('VERBOSE => Override verbose');
  });

  it('allows overriding debug format on a per-call basis', () => {
    const debugSpy = setUpConsoleSpy('debug');
    const logger = createLogger({ colorize: false, debugMode: true });

    logger.debug(
      'Override debug',
      { flag: true },
      {
        format: {
          debug: 'DEBUG => {message} :: {metadata.flag}',
        },
      }
    );

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toBe('DEBUG => Override debug :: true');
  });

  it('allows overriding timestamp.enabled per call', () => {
    const errorSpy = setUpConsoleSpy('error');
    const logger = createLogger();

    logger.error('No timestamp', undefined, {
      timestamp: {
        enabled: false,
        format: 'iso',
      },
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).not.toContain('2025-11-02');
  });

  it('allows overriding timestamp.format per call', () => {
    const warnSpy = setUpConsoleSpy('warn');
    const logger = createLogger();
    vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(
      '11/02/2025, 15:30:45'
    );

    logger.warn('Locale timestamp', undefined, {
      timestamp: {
        enabled: true,
        format: 'locale',
      },
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('11/02/2025, 15:30:45');
  });

  it('supports overriding multiple settings without persisting changes', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({ colorize: false });

    logger.info(
      'Composite override',
      { value: 42 },
      {
        colorize: false,
        timestamp: {
          enabled: false,
          format: 'iso',
        },
        format: {
          info: 'Composite => {message} ({metadata.value})',
        },
      }
    );

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toBe(
      'Composite => Composite override (42)'
    );

    logger.info('Original format check');
    expect(infoSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy.mock.calls[1][0]).toBe('[OMH] Original format check');
  });

  it('does not mutate the base configuration when overrides are used', () => {
    const infoSpy = setUpConsoleSpy('info');
    const logger = createLogger({ colorize: false });
    const overrides = {
      format: {
        info: 'IMMUTABLE => {message}',
      },
    };

    logger.info('Immutable test', undefined, overrides);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toBe('IMMUTABLE => Immutable test');
    expect(baseConfig.format).toBeUndefined();
    expect(overrides).toEqual({
      format: {
        info: 'IMMUTABLE => {message}',
      },
    });
  });

  it('applies chalk colorization when enabled', () => {
    const errorSpy = setUpConsoleSpy('error');
    const logger = createLogger({ colorize: true });

    logger.error('Color check');

    const expected = chalk.red(
      '[OMH] ERROR | 2025-11-02T15:30:45.123Z | Color check'
    );
    expect(errorSpy.mock.calls[0][0]).toBe(expected);
  });

  it('handles circular metadata without throwing and inserts placeholder', () => {
    const errorSpy = setUpConsoleSpy('error');
    const warnSpy = setUpConsoleSpy('warn');
    const circular = {};
    circular.self = circular;

    const logger = createLogger({
      format: {
        error: '[{module}] ERROR | {metadata}',
      },
    });

    expect(() => logger.error('Circular test', circular)).not.toThrow();
    expect(errorSpy.mock.calls[0][0]).toContain('[Circular]');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('accepts a Config object and extracts logging configuration', () => {
    const infoSpy = setUpConsoleSpy('info');
    
    // Create logger using Config object
    expect(() => new Logger(config)).not.toThrow();
    
    const logger = new Logger(config);
    logger.info('Test message from Config');
    
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toContain('Test message from Config');
  });

  it('throws error if Config object does not have configs.logging', () => {
    const invalidConfig = {
      constants: {},
      module: {},
      settings: [],
      env: {},
    };
    
    expect(() => new Logger(invalidConfig)).toThrow(
      /Config.constants.defaults is not available or invalid/
    );
  });

  it('uses logging configuration from Config.configs.logging', () => {
    const errorSpy = setUpConsoleSpy('error');
    const logger = new Logger(config);
    
    // The config should have the default format from defaults.yaml
    logger.error('Config-based error');
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    // Verify it uses the format from defaults.yaml
    expect(errorSpy.mock.calls[0][0]).toMatch(/\[.*\] ERROR \|/);
  });

  it('accepts custom configPath parameter for Config object', () => {
    const infoSpy = setUpConsoleSpy('info');
    
    // Using default path should work
    const defaultLogger = new Logger(config);
    defaultLogger.info('Default path test');
    
    expect(infoSpy).toHaveBeenCalledTimes(1);
    
    // Using explicit path should also work
    const explicitLogger = new Logger(config, 'defaults.logging');
    explicitLogger.info('Explicit path test');
    
    expect(infoSpy).toHaveBeenCalledTimes(2);
  });

  it('throws error when custom configPath does not exist', () => {
    expect(() => new Logger(config, 'nonexistent.path')).toThrow(
      /Config.constants.nonexistent is not available or invalid/
    );
  });

  it('ignores configPath parameter when using LogConfigurationObject', () => {
    const infoSpy = setUpConsoleSpy('info');
    
    // configPath should be ignored when passing explicit config
    const logger = new Logger({
      moduleName: 'TEST',
      level: 'info',
      colorize: false,
    }, 'ignored.path');
    
    logger.info('Direct config test');
    
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toContain('TEST');
  });
});
