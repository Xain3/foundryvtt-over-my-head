/**
 * @file logger-types.ts
 * @description Type definitions for the configurable logger
 * @path src/utils/logger-types.ts
 */

/**
 * Supported log severity levels.
 * @export
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

/**
 * Numeric mapping of log levels for threshold comparison.
 * @export
 */
export const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

/**
 * Configuration for timestamp formatting in log messages.
 * @export
 */
export interface TimestampConfig {
  enabled: boolean;
  format: 'iso' | 'locale';
}

/**
 * Configuration for separator handling in log messages.
 * @export
 */
export interface SeparatorConfig {
  separator: string;
  keepSeparatorIfFieldEmpty?: boolean;
}

/**
 * Custom format templates for each log level.
 * @export
 */
export interface FormatTemplates {
  error?: string;
  warn?: string;
  info?: string;
  verbose?: string;
  debug?: string;
}

/**
 * Complete logger configuration object.
 * @export
 */
export interface LogConfigurationObject {
  moduleName: string;
  level: LogLevel;
  debugMode?: boolean;
  colorize?: boolean;
  timestamp?: TimestampConfig;
  separator?: SeparatorConfig;
  format?: FormatTemplates;
}

/**
 * Per-call configuration overrides for logging methods.
 * @export
 */
export type LogOverrides = Partial<
  Omit<
    LogConfigurationObject,
    'moduleName' | 'timestamp' | 'separator' | 'format'
  >
> & {
  timestamp?: Partial<TimestampConfig>;
  separator?: Partial<SeparatorConfig>;
  format?: FormatTemplates;
};

/**
 * Structured options supported by each public logging method.
 * @export
 */
export interface LogMethodOptions {
  metadata?: unknown;
  overrides?: LogOverrides;
}

/**
 * Context object passed to placeholder substitution in format templates.
 * @export
 */
export interface LogContext {
  module: string;
  level: string;
  timestamp: string;
  message: string;
  metadata?: unknown;
}

/**
 * Internal normalized configuration with all defaults applied.
 * @internal
 */
export type NormalizedConfig = {
  moduleName: string;
  level: LogLevel;
  debugMode: boolean;
  colorize: boolean;
  timestamp: TimestampConfig;
  separator: SeparatorConfig;
  format: Required<FormatTemplates>;
};

/**
 * Internal context for placeholder substitution that includes metadata.
 * @internal
 */
export type PlaceholderContext = LogContext & {
  metadata?: unknown;
};
