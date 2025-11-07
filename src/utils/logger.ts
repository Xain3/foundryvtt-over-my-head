/**
 * @file logger.ts
 * @description Configurable logger implementation for the Over My Head module.
 * @path src/utils/logger.ts
 */

import chalk from 'chalk';
import type { Config } from '#/config/config.ts';
import type {
  LogLevel,
  TimestampConfig,
  FormatTemplates,
  LogConfigurationObject,
  LogOverrides,
  LogContext,
  NormalizedConfig,
  PlaceholderContext,
} from './logger-types.ts';
import { LOG_LEVELS } from './logger-types.ts';

const MODULE_PREFIX = '[OMH]';

const OVERRIDE_KEYS = ['level', 'debugMode', 'colorize', 'timestamp', 'format'];

const DEFAULT_TIMESTAMP_CONFIG: TimestampConfig = {
  enabled: true,
  format: 'iso',
};

const DEFAULT_FORMAT_TEMPLATES: Required<FormatTemplates> = {
  error: '[{module}] ERROR | {timestamp} | {message}',
  warn: '[{module}] WARN | {timestamp} | {message}',
  info: '[{module}] {message}',
  verbose: '[{module}] VERBOSE | {message}',
  debug: '[{module}] DEBUG | {timestamp} | {message} | {metadata}',
};

/**
 * Default configuration path in Config.constants for logger settings.
 * @private
 */
const DEFAULT_CONFIG_PATH = 'defaults.logging';

/**
 * Extracts LogConfigurationObject from a Config instance using a configuration path.
 *
 * @param {Config} config - Config singleton instance containing logging configuration.
 * @param {string} [configPath='configs.logging'] - Dot-separated path to logging config in Config.constants.
 * @returns {LogConfigurationObject} Extracted logging configuration.
 * @throws {Error} If the configuration path is not properly structured.
 *
 * @example
 * // Using default path (config.constants.defaults.logging)
 * const logConfig = extractLogConfigFromConfig(config);
 *
 * @example
 * // Using custom path (config.constants.myapp.logger)
 * const logConfig = extractLogConfigFromConfig(config, 'myapp.logger');
 */
function extractLogConfigFromConfig(
  config: Config,
  configPath: string = DEFAULT_CONFIG_PATH
): LogConfigurationObject {
  const pathSegments = configPath.split('.');
  let current: unknown = config.constants;

  // Traverse the path to find the configuration object
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    if (!current || typeof current !== 'object') {
      const traversedPath = pathSegments.slice(0, i).join('.');
      throw new Error(
        `${MODULE_PREFIX} Config.constants.${traversedPath} is not available or invalid`
      );
    }

    const currentRecord = current as Record<string, unknown>;
    current = currentRecord[segment];

    if (current === undefined) {
      const fullPath = pathSegments.slice(0, i + 1).join('.');
      throw new Error(
        `${MODULE_PREFIX} Config.constants.${fullPath} is not available or invalid`
      );
    }
  }

  // Validate that we have a valid object at the end of the path
  if (!current || typeof current !== 'object') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath} is not available or invalid`
    );
  }

  // Safe to cast: runtime check confirms current is an object
  const loggingRecord = current as Record<string, unknown>;

  // Validate required fields for LogConfigurationObject
  if (typeof loggingRecord.moduleName !== 'string') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath}.moduleName must be a string`
    );
  }

  if (typeof loggingRecord.level !== 'string') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath}.level must be a string`
    );
  }

  // Safe to cast: validation confirms structure matches LogConfigurationObject
  // The normalizeConfig method will validate remaining fields
  return loggingRecord as unknown as LogConfigurationObject;
}

/**
 * Type guard to check if the provided value is a Config instance.
 * Uses structural typing to distinguish Config from LogConfigurationObject.
 *
 * The discriminator relies on:
 * - Config has: constants, module, settings, env (no moduleName)
 * - LogConfigurationObject has: moduleName, level (no constants/module/settings/env)
 *
 * This approach is safe because:
 * 1. The two types serve different purposes and have non-overlapping structures
 * 2. LogConfigurationObject is a flat configuration object
 * 3. Config is a complex singleton with nested properties
 *
 * @param {Config | LogConfigurationObject} value - Value to check.
 * @returns {boolean} True if value is a Config instance.
 */
function isConfig(value: Config | LogConfigurationObject): value is Config {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check for Config-specific structure with all required properties
  const hasConstants = 'constants' in value;
  const hasModule = 'module' in value;
  const hasSettings = 'settings' in value;
  const hasEnv = 'env' in value;

  // LogConfigurationObject must have moduleName, not module
  const hasModuleName = 'moduleName' in value;

  // A Config has constants/module/settings/env, while LogConfigurationObject has moduleName
  return hasConstants && hasModule && hasSettings && hasEnv && !hasModuleName;
}

/**
 * Configurable logger that formats console output based on runtime configuration.
 */
export class Logger {
  private readonly baseConfig: NormalizedConfig;

  private readonly colors: Record<LogLevel, (text: string) => string>;

  private readonly baseThreshold: number;

  /**
   * Creates a logger instance using the provided configuration options.
   *
   * @param {Config | LogConfigurationObject} config - Either a Config singleton instance
   * (extracting logging configuration from config.configs.logging by default) or a pre-parsed
   * LogConfigurationObject defining logger behavior directly.
   * When {@link LogConfigurationObject.debugMode} is true the logger emits verbose and debug entries
   * regardless of the base log level threshold.
   * @param {string} [configPath='configs.logging'] - When using Config, optional dot-separated path
   * to logging configuration in Config.constants. Defaults to 'configs.logging'.
   * Ignored when passing a LogConfigurationObject directly.
   * @throws {Error} If Config is provided but the configuration path is not properly configured.
   *
   * @example
   * // Using Config singleton with default path (config.constants.defaults.logging)
   * import { config } from '#config';
   * const logger = new Logger(config);
   *
   * @example
   * // Using Config singleton with custom path (config.constants.myapp.logger)
   * import { config } from '#config';
   * const logger = new Logger(config, 'myapp.logger');
   *
   * @example
   * // Using explicit configuration (configPath is ignored)
   * const logger = new Logger({
   *   moduleName: 'OMH',
   *   level: 'info',
   *   debugMode: false,
   *   colorize: true
   * });
   */
  constructor(
    config: Config | LogConfigurationObject,
    configPath: string = DEFAULT_CONFIG_PATH
  ) {
    const logConfig = isConfig(config)
      ? extractLogConfigFromConfig(config, configPath)
      : config;

    this.baseConfig = this.normalizeConfig(logConfig);
    this.colors = {
      error: (text: string) => chalk.red(text),
      warn: (text: string) => chalk.yellow(text),
      info: (text: string) => chalk.black(text),
      verbose: (text: string) => chalk.blue(text),
      debug: (text: string) => chalk.gray(text),
    };
    this.baseThreshold = this.resolveThreshold(this.baseConfig);
  }

  /**
   * Logs an error-level message. Always emitted regardless of threshold.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   */
  error(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('error', message, metadata, overrides);
  }

  /**
   * Logs a warn-level message when threshold permits.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   */
  warn(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('warn', message, metadata, overrides);
  }

  /**
   * Logs an info-level message when threshold permits.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   */
  info(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('info', message, metadata, overrides);
  }

  /**
   * Logs a verbose-level message when threshold permits.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   */
  verbose(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('verbose', message, metadata, overrides);
  }

  /**
   * Logs a debug-level message when threshold permits or debug mode is active.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   */
  debug(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('debug', message, metadata, overrides);
  }

  /**
   * Logs a message at info level. Functionally identical to the {@link info} method.
   * Provided as a generic alias for compatibility with standard logging conventions.
   *
   * @param {string} message - Message content to log.
   * @param {unknown} [metadata] - Optional contextual data to include in the log entry.
   * @param {LogOverrides} [overrides] - Optional configuration overrides applied to this log call only.
   * @returns {void}
   *
   * @example
   * logger.log('Application started'); // Same as logger.info('Application started')
   */
  log(message: string, metadata?: unknown, overrides?: LogOverrides): void {
    this._log('info', message, metadata, overrides);
  }

  /**
   * Internal routing method that coordinates log event processing through formatting and emission pipelines.
   * This private method is used by all public logging methods (error, warn, info, verbose, debug, log).
   * It handles threshold evaluation, config merging, message formatting, and console emission.
   *
   * @private
   * @param {LogLevel} level - Severity level for the log event.
   * @param {string} message - Message content to log.
   * @param {unknown} [metadataOrOverrides] - Metadata payload or an overrides object when a third argument is omitted.
   * @param {LogOverrides} [overrides] - Explicit configuration overrides merged against the base logger settings.
   * @returns {void}
   */
  private _log(
    level: LogLevel,
    message: string,
    metadataOrOverrides?: unknown,
    overrides?: LogOverrides
  ): void {
    const { metadata, overrides: resolvedOverrides } =
      this.resolveCallParameters(metadataOrOverrides, overrides);
    const effectiveConfig = this.mergeConfig(resolvedOverrides);
    const threshold =
      effectiveConfig === this.baseConfig
        ? this.baseThreshold
        : this.resolveThreshold(effectiveConfig);

    if (!this.shouldLog(level, effectiveConfig, threshold)) {
      return;
    }

    const formatted = this.formatMessage(
      level,
      message,
      metadata,
      effectiveConfig
    );
    this.emit(level, formatted);
  }

  /**
   * Distinguishes between metadata and overrides based on the optional arguments supplied to a log method.
   *
   * @param {unknown} metadataOrOverrides - Second argument passed to a logging method.
   * @param {LogOverrides} [overrides] - Third argument containing explicit overrides, when provided.
   * @returns {{ metadata?: unknown; overrides?: LogOverrides }} Normalized metadata and overrides payload.
   */
  private resolveCallParameters(
    metadataOrOverrides?: unknown,
    overrides?: LogOverrides
  ): { metadata?: unknown; overrides?: LogOverrides } {
    if (overrides !== undefined) {
      return {
        metadata: metadataOrOverrides,
        overrides,
      };
    }

    if (this.isOverrideCandidate(metadataOrOverrides)) {
      return {
        metadata: undefined,
        overrides: metadataOrOverrides,
      };
    }

    return {
      metadata: metadataOrOverrides,
      overrides: undefined,
    };
  }

  /**
   * Emits the formatted payload to the appropriate console method based on level.
   *
   * @param {LogLevel} level - Level that determines the console method.
   * @param {string} payload - Formatted log message ready for output.
   * @returns {void}
   */
  private emit(level: LogLevel, payload: string): void {
    switch (level) {
      case 'error': {
        console.error(payload);
        break;
      }
      case 'warn': {
        console.warn(payload);
        break;
      }
      case 'info': {
        console.info(payload);
        break;
      }
      case 'verbose': {
        console.log(payload);
        break;
      }
      case 'debug': {
        console.debug(payload);
        break;
      }
      default: {
        console.log(payload);
      }
    }
  }

  /**
   * Builds a formatted log message with placeholder substitution and colorization.
   *
   * @param {LogLevel} level - Severity level of the log entry.
   * @param {string} message - Original message content provided by the caller.
   * @param {unknown} metadata - Optional metadata payload for placeholder evaluation.
   * @param {NormalizedConfig} config - Effective configuration to apply for this log entry.
   * @returns {string} Formatted log output ready for emission.
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    metadata: unknown,
    config: NormalizedConfig
  ): string {
    const template = config.format[level];
    const timestamp = this.formatTimestamp(config.timestamp);
    const resolvedMessage = this.serializeMessage(message);
    const { serialized: serializedMetadata, hadCircularReference } =
      this.serializeMetadata(metadata);

    if (hadCircularReference) {
      console.warn(
        `${MODULE_PREFIX} Metadata contained circular references and was stringified with [Circular] placeholders`
      );
    }

    const context: PlaceholderContext = {
      module: config.moduleName,
      level: level.toUpperCase(),
      timestamp,
      message: resolvedMessage,
      metadata,
    };

    const substituted = this.applyPlaceholders(
      template,
      context,
      serializedMetadata
    );
    return this.applyColor(level, substituted, config);
  }

  /**
   * Formats the current timestamp according to configuration settings.
   *
   * @param {TimestampConfig} config - Timestamp configuration options.
   * @returns {string} Timestamp string or empty string when disabled.
   */
  private formatTimestamp(config: TimestampConfig): string {
    if (!config.enabled) {
      return '';
    }

    const now = new Date();

    if (config.format === 'locale') {
      return now.toLocaleString();
    }

    return now.toISOString();
  }

  /**
   * Applies context-aware placeholder replacement for message templates.
   *
   * @param {string} template - Template string containing `{placeholder}` tokens.
   * @param {PlaceholderContext} context - Core context values exposed to placeholders.
   * @param {string} serializedMetadata - Pre-serialized metadata string used for `{metadata}` token.
   * @returns {string} Template with placeholders substituted.
   */
  private applyPlaceholders(
    template: string,
    context: PlaceholderContext,
    serializedMetadata: string
  ): string {
    // Single-pass regex handles all placeholders, including nested metadata paths (`metadata.user.id`).
    return template.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      if (key === 'metadata') {
        return serializedMetadata;
      }

      if (key.startsWith('metadata.')) {
        const path = key.split('.').slice(1);
        let current: unknown = context.metadata;

        for (const segment of path) {
          if (current === null || current === undefined) {
            return '';
          }

          if (typeof current !== 'object') {
            return '';
          }

          current = (current as Record<string, unknown>)[segment];
        }

        return current === undefined ? '' : this.stringifyScalar(current);
      }

      const contextRecord = context as unknown as Record<string, unknown>;
      const value = contextRecord[key];
      if (value === undefined || value === null) {
        return '';
      }

      return this.stringifyScalar(value);
    });
  }

  /**
   * Applies ANSI colorization for the given log level when enabled.
   *
   * @param {LogLevel} level - Severity level determining the color palette.
   * @param {string} message - Formatted message prior to colorization.
   * @param {NormalizedConfig} config - Effective configuration with colorization flag.
   * @returns {string} Potentially colorized message.
   */
  private applyColor(
    level: LogLevel,
    message: string,
    config: NormalizedConfig
  ): string {
    if (!config.colorize) {
      return message;
    }

    const colorFn = this.colors[level];
    return colorFn(message);
  }

  /**
   * Determines whether the requested log level passes the configured threshold.
   * Debug and verbose events are short-circuited when {@link NormalizedConfig.debugMode} is disabled,
   * regardless of the underlying level threshold.
   *
   * @param {LogLevel} level - Level for the pending log event.
   * @param {NormalizedConfig} config - Effective configuration to evaluate.
   * @param {number} threshold - Numeric threshold derived from constructor configuration.
   * @returns {boolean} True when the log event should be emitted.
   */
  private shouldLog(
    level: LogLevel,
    config: NormalizedConfig,
    threshold: number
  ): boolean {
    if ((level === 'debug' || level === 'verbose') && !config.debugMode) {
      return false;
    }

    const targetThreshold = config.debugMode ? LOG_LEVELS.debug : threshold;
    return LOG_LEVELS[level] <= targetThreshold;
  }

  /**
   * Performs a shallow merge between the immutable base configuration and per-call overrides.
   * Format overrides replace the format mapping wholesale, while timestamp overrides merge with defaults.
   *
   * @param {LogOverrides} [overrides] - Override values supplied with the log call.
   * @returns {NormalizedConfig} Effective configuration for the current log invocation.
   */
  private mergeConfig(overrides?: LogOverrides): NormalizedConfig {
    if (!overrides || Object.keys(overrides).length === 0) {
      return this.baseConfig;
    }

    // Shallow merge keeps override precedence predictable while avoiding costly deep copies of static defaults.
    const mergedLevel = overrides.level
      ? this.normalizeLevel(overrides.level)
      : this.baseConfig.level;
    const mergedDebugMode =
      overrides.debugMode !== undefined
        ? Boolean(overrides.debugMode)
        : this.baseConfig.debugMode;
    const mergedColorize =
      overrides.colorize !== undefined
        ? Boolean(overrides.colorize)
        : this.baseConfig.colorize;

    let mergedTimestamp = this.baseConfig.timestamp;
    if (overrides.timestamp !== undefined) {
      mergedTimestamp = this.normalizeTimestamp({
        ...this.baseConfig.timestamp,
        ...overrides.timestamp,
      } as TimestampConfig);
    }

    let mergedFormat = this.baseConfig.format;
    if (overrides.format !== undefined) {
      mergedFormat = this.normalizeFormat(overrides.format);
    }

    const mergedConfig: NormalizedConfig = {
      moduleName: this.baseConfig.moduleName,
      level: mergedLevel,
      debugMode: mergedDebugMode,
      colorize: mergedColorize,
      timestamp: mergedTimestamp,
      format: mergedFormat,
    };

    return Object.freeze(mergedConfig) as NormalizedConfig;
  }

  /**
   * Determines whether the provided value should be interpreted as a overrides object instead of metadata.
   *
   * @param {unknown} candidate - Value passed in place of metadata.
   * @returns {boolean} True when the value matches the expected override shape.
   */
  private isOverrideCandidate(candidate: unknown): candidate is LogOverrides {
    if (candidate === null || candidate === undefined) {
      return false;
    }

    if (typeof candidate !== 'object' || Array.isArray(candidate)) {
      return false;
    }

    const record = candidate as Record<string, unknown>;
    return OVERRIDE_KEYS.some((key) =>
      Object.prototype.hasOwnProperty.call(record, key)
    );
  }

  /**
   * Computes numeric threshold based on configuration log level.
   *
   * @param {NormalizedConfig} config - Configuration containing the base log level.
   * @returns {number} Numeric representation used for comparisons.
   */
  private resolveThreshold(config: NormalizedConfig): number {
    return LOG_LEVELS[config.level];
  }

  /**
   * Normalizes user-provided configuration into a fully-populated immutable structure.
   *
   * @param {LogConfigurationObject} config - Raw configuration provided to the constructor.
   * @returns {NormalizedConfig} Normalized configuration with defaults applied.
   */
  private normalizeConfig(config: LogConfigurationObject): NormalizedConfig {
    if (
      !config ||
      typeof config.moduleName !== 'string' ||
      config.moduleName.trim().length === 0
    ) {
      throw new Error(
        `${MODULE_PREFIX} moduleName is required and must be a non-empty string`
      );
    }

    const normalizedLevel = this.normalizeLevel(config.level);
    const timestamp = this.normalizeTimestamp(config.timestamp);
    const format = this.normalizeFormat(config.format);

    return Object.freeze({
      moduleName: config.moduleName,
      level: normalizedLevel,
      debugMode: Boolean(config.debugMode),
      colorize: config.colorize !== undefined ? Boolean(config.colorize) : true,
      timestamp,
      format,
    });
  }

  /**
   * Validates and normalizes a log level value.
   *
   * @param {LogLevel} level - User-provided log level.
   * @returns {LogLevel} A supported log level.
   */
  private normalizeLevel(level: LogLevel): LogLevel {
    if (level && LOG_LEVELS[level] !== undefined) {
      return level;
    }

    console.warn(
      `${MODULE_PREFIX} Invalid log level "${String(level)}", defaulting to "info"`
    );
    return 'info';
  }

  /**
   * Produces a timestamp configuration with defaults for omitted fields.
   *
   * @param {TimestampConfig} [custom] - Optional overrides for timestamp behavior.
   * @returns {TimestampConfig} Populated timestamp configuration.
   */
  private normalizeTimestamp(custom?: TimestampConfig): TimestampConfig {
    if (!custom) {
      return { ...DEFAULT_TIMESTAMP_CONFIG };
    }

    return {
      enabled: custom.enabled ?? DEFAULT_TIMESTAMP_CONFIG.enabled,
      format: custom.format ?? DEFAULT_TIMESTAMP_CONFIG.format,
    };
  }

  /**
   * Generates a format template map with defaults for missing entries.
   *
   * @param {FormatTemplates} [custom] - Optional template overrides.
   * @returns {Required<FormatTemplates>} Template map containing all log levels.
   */
  private normalizeFormat(custom?: FormatTemplates): Required<FormatTemplates> {
    if (!custom) {
      return { ...DEFAULT_FORMAT_TEMPLATES };
    }

    return {
      error: custom.error ?? DEFAULT_FORMAT_TEMPLATES.error,
      warn: custom.warn ?? DEFAULT_FORMAT_TEMPLATES.warn,
      info: custom.info ?? DEFAULT_FORMAT_TEMPLATES.info,
      verbose: custom.verbose ?? DEFAULT_FORMAT_TEMPLATES.verbose,
      debug: custom.debug ?? DEFAULT_FORMAT_TEMPLATES.debug,
    };
  }

  /**
   * Serializes message input into a string, respecting Error and object inputs.
   *
   * @param {unknown} message - Message payload provided by the caller.
   * @returns {string} Serialized message string.
   */
  private serializeMessage(message: unknown): string {
    if (message instanceof Error) {
      const stack = message.stack ? `\n${message.stack}` : '';
      return `${message.name}: ${message.message}${stack}`;
    }

    if (typeof message === 'string') {
      return message;
    }

    if (message === undefined || message === null) {
      return '';
    }

    if (typeof message === 'object') {
      const { serialized } = this.serializeWithCircularDetection(message);
      return serialized;
    }

    return String(message);
  }

  /**
   * Serializes metadata objects and captures whether circular references were present.
   *
   * @param {unknown} metadata - Metadata payload supplied with the log entry.
   * @returns {{ serialized: string; hadCircularReference: boolean }} Serialized metadata and detection flag.
   */
  private serializeMetadata(metadata: unknown): {
    serialized: string;
    hadCircularReference: boolean;
  } {
    if (metadata === undefined || metadata === null) {
      return {
        serialized: '',
        hadCircularReference: false,
      };
    }

    if (typeof metadata === 'object') {
      return this.serializeWithCircularDetection(metadata);
    }

    if (metadata instanceof Error) {
      return {
        serialized: this.serializeMessage(metadata),
        hadCircularReference: false,
      };
    }

    return {
      serialized: String(metadata),
      hadCircularReference: false,
    };
  }

  /**
   * Serializes values while inserting a `[Circular]` token when cycles are detected.
   *
   * @param {unknown} value - Value to serialize safely.
   * @returns {{ serialized: string; hadCircularReference: boolean }} Serialized string and circular detection flag.
   */
  private serializeWithCircularDetection(value: unknown): {
    serialized: string;
    hadCircularReference: boolean;
  } {
    const seen = new WeakSet<object>();
    let circularDetected = false;

    const replacer = (_key: string, currentValue: unknown): unknown => {
      if (typeof currentValue === 'object' && currentValue !== null) {
        if (seen.has(currentValue as object)) {
          circularDetected = true;
          return '[Circular]';
        }

        seen.add(currentValue as object);
      }

      if (currentValue instanceof Error) {
        return `${currentValue.name}: ${currentValue.message}`;
      }

      return currentValue;
    };

    try {
      const serialized = JSON.stringify(value, replacer);
      return {
        serialized: serialized ?? '',
        hadCircularReference: circularDetected,
      };
    } catch (_error) {
      return {
        serialized: '[Circular]',
        hadCircularReference: true,
      };
    }
  }

  /**
   * Converts scalar values into string form, serializing objects when required.
   *
   * @param {unknown} value - Value to convert into a string representation.
   * @returns {string} String representation of the provided value.
   */
  private stringifyScalar(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      const { serialized } = this.serializeWithCircularDetection(value);
      return serialized;
    }

    if (value instanceof Error) {
      return this.serializeMessage(value);
    }

    return String(value);
  }
}

export type {
  LogLevel,
  TimestampConfig,
  FormatTemplates,
  LogConfigurationObject,
  LogOverrides,
  LogContext,
} from './logger-types.ts';
export { LOG_LEVELS } from './logger-types.ts';
