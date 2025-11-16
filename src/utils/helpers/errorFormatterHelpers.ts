/**
 * @file errorFormatterHelpers.ts
 * @description Helper utilities for error formatting, stack truncation, and temp log persistence.
 * @path src/utils/helpers/errorFormatterHelpers.ts
 */

import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '#config';
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import type { ModuleNameResolverConfig } from '#/utils/static/moduleNameResolver-types.ts';
import type {
  ErrorContext,
  ErrorPattern,
  FormatOptions,
  FormatterDefaults,
  NormalizedFormatOptions,
  PlaceholderKey,
} from '../errorFormatter-types.ts';

const MODULE_PREFIX = 'OMH';
const FALLBACK_PATTERN = '{{module}}{{caller}}{{error}}{{stack}}';
const FALLBACK_SEPARATOR = ' || ';
const FALLBACK_MODULE_NAME = 'Unknown Module';
const FALLBACK_PLACEHOLDER_MESSAGE = '[No error message provided]';
const FALLBACK_MAX_STACK_LINES = 20;
const FALLBACK_TEMP_LOG_PREFIX = 'omh-error';

/**
 * Normalizes a stack trace string into trimmed lines and truncates it to the desired length.
 *
 * @param {string | undefined} stack - Raw stack trace.
 * @param {number} [maxLines=DEFAULT_STACK_LINES] - Maximum lines to keep.
 * @returns {{ truncated: string | undefined; hasOverflow: boolean; fullText: string }}
 * Object describing the truncated stack and whether overflow exists.
 */
export function truncateStack(
  stack: string | undefined,
  maxLines: number = FALLBACK_MAX_STACK_LINES
): { truncated: string | undefined; hasOverflow: boolean; fullText: string } {
  if (!stack) {
    return {
      truncated: undefined,
      hasOverflow: false,
      fullText: '',
    };
  }

  const normalized = stack
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (normalized.length === 0) {
    return {
      truncated: undefined,
      hasOverflow: false,
      fullText: '',
    };
  }

  const truncatedLines = normalized.slice(0, maxLines);
  return {
    truncated: truncatedLines.join('\n'),
    hasOverflow: normalized.length > maxLines,
    fullText: normalized.join('\n'),
  };
}

/**
 * Writes the full stack trace to a temporary log file for offline inspection.
 *
 * @param {string} fullStack - Complete stack trace text.
 * @param {string} [filePrefix='omh-error'] - Prefix for generated file names.
 * @returns {string | null} Absolute path to the temp file, or null when write fails.
 */
export function writeFullStackToTempFile(
  fullStack: string,
  filePrefix: string = FALLBACK_TEMP_LOG_PREFIX
): string | null {
  const tempDir = tmpdir();
  const uniqueSuffix = randomUUID();
  const fileName = `${filePrefix}-${Date.now()}-${uniqueSuffix}.log`;
  const filePath = join(tempDir, fileName);

  try {
    writeFileSync(filePath, fullStack, 'utf8');
    return filePath;
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.warn(
      `[${MODULE_PREFIX}] Failed to write full stack trace to temp file ${filePath}: ${details}`
    );
    return null;
  }
}

/**
 * Convenience helper that performs truncation and optionally writes overflow to disk.
 *
 * @param {string | undefined} stack - Raw stack trace text.
 * @param {number} [maxLines=DEFAULT_STACK_LINES] - Maximum lines displayed inline.
 * @returns {{ stackText?: string; fullFilePath?: string }} Stack info for formatter usage.
 */
export function prepareStackForOutput(
  stack: string | undefined,
  maxLines: number = FALLBACK_MAX_STACK_LINES,
  filePrefix: string = FALLBACK_TEMP_LOG_PREFIX
): { stackText?: string; fullFilePath?: string } {
  const { truncated, hasOverflow, fullText } = truncateStack(stack, maxLines);

  if (!truncated) {
    return {};
  }

  if (!hasOverflow) {
    return { stackText: truncated };
  }

  const filePath = writeFullStackToTempFile(fullText, filePrefix);
  if (!filePath) {
    return { stackText: truncated };
  }

  return {
    stackText: truncated,
    fullFilePath: filePath,
  };
}

/**
 * Ensures the provided value is an Error instance, coercing strings when necessary.
 *
 * @param {Error | string} value - Incoming error or string message.
 * @returns {Error} Normalized error instance.
 * @throws {TypeError} When the value cannot be coerced.
 */
export function coerceError(value: Error | string): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'string') {
    return new Error(value);
  }

  throw new TypeError('[OMH] formatError() expects an Error or string value');
}

/**
 * Normalizes optional format flags into booleans with trimmed caller text.
 *
 * @param {FormatOptions} [options] - Raw format options.
 * @returns {Required<FormatOptions>} Normalized options object.
 */
export function normalizeOptions(
  options?: FormatOptions
): NormalizedFormatOptions {
  const includeStack = Boolean(options?.includeStack);
  const includeCaller = Boolean(options?.includeCaller);
  let caller: string | undefined;

  if (includeCaller && options?.caller) {
    const trimmed = options.caller.trim();
    caller = trimmed.length > 0 ? trimmed : undefined;
  }

  return {
    includeStack,
    includeCaller,
    caller,
  };
}

/**
 * Parses the configured template into an ordered placeholder array.
 *
 * SECURITY NOTE: Only the template string is parsed for placeholders.
 * Component values (module, caller, error, stack) are treated as literal
 * strings and never evaluated, so braces in those values are safe.
 *
 * @param {string} template - Template string with placeholders.
 * @returns {PlaceholderKey[]} Ordered placeholder keys.
 */
export function parsePattern(template: string): PlaceholderKey[] {
  const matches = template.match(/\{\{(module|caller|error|stack)\}\}/g);
  if (!matches) {
    return ['module', 'error'];
  }

  return matches.map(
    (placeholder) =>
      placeholder.replace(/^\{\{/, '').replace(/\}\}$/, '') as PlaceholderKey
  );
}

/**
 * Reads formatter configuration from the config singleton with hardcoded fallbacks.
 *
 * @returns {FormatterDefaults} Effective formatter defaults.
 */
export function loadFormatterDefaults(): FormatterDefaults {
  try {
    const errorsNamespace = (config?.constants?.errors ?? {}) as Record<
      string,
      unknown
    >;
    const pattern =
      typeof errorsNamespace.pattern === 'string'
        ? errorsNamespace.pattern
        : FALLBACK_PATTERN;
    const separator =
      typeof errorsNamespace.separator === 'string'
        ? errorsNamespace.separator
        : FALLBACK_SEPARATOR;
    const fallbackModuleName =
      typeof errorsNamespace.fallbackModuleName === 'string'
        ? errorsNamespace.fallbackModuleName
        : FALLBACK_MODULE_NAME;
    const maxStackLines =
      typeof errorsNamespace.maxStackLines === 'number' &&
      Number.isFinite(errorsNamespace.maxStackLines)
        ? Math.max(1, Math.floor(errorsNamespace.maxStackLines))
        : FALLBACK_MAX_STACK_LINES;
    const tempLogFilePrefix =
      typeof errorsNamespace.tempLogFilePrefix === 'string' &&
      errorsNamespace.tempLogFilePrefix.trim().length > 0
        ? errorsNamespace.tempLogFilePrefix.trim()
        : FALLBACK_TEMP_LOG_PREFIX;

    return {
      template: pattern,
      separator,
      componentOrder: parsePattern(pattern),
      fallbackModuleName,
      maxStackLines,
      tempLogFilePrefix,
    };
  } catch (error) {
    console.warn(
      `[${MODULE_PREFIX}] Failed to load formatter defaults, using fallbacks: ${String(error)}`
    );
    return {
      template: FALLBACK_PATTERN,
      separator: FALLBACK_SEPARATOR,
      componentOrder: parsePattern(FALLBACK_PATTERN),
      fallbackModuleName: FALLBACK_MODULE_NAME,
      maxStackLines: FALLBACK_MAX_STACK_LINES,
      tempLogFilePrefix: FALLBACK_TEMP_LOG_PREFIX,
    };
  }
}

/**
 * Safely resolves the module name using the configured strategy.
 *
 * @param {string} fallback - Name to use when resolution fails.
 * @returns {string} Module identifier for prefixing errors.
 */
export function resolveModuleNameSafely(fallback: string): string {
  try {
    const resolverConfig: ModuleNameResolverConfig = {
      moduleManagement: (config?.configs?.moduleManagement ?? {}) as {
        referToModuleBy?: string;
      },
      module: (config?.module ?? {}) as Record<string, string>,
    };
    const resolved = resolveModuleName(resolverConfig);
    if (resolved && typeof resolved === 'string') {
      return resolved;
    }
  } catch (error) {
    console.warn(
      `[${MODULE_PREFIX}] Unable to resolve module name, falling back to default: ${String(
        error
      )}`
    );
  }

  return fallback;
}

/**
 * Builds a mapping of template placeholders to populated strings.
 *
 * @param {Pick<ErrorContext, 'module' | 'caller' | 'message' | 'stack'>} context - Core formatter context.
 * @param {Required<FormatOptions>} options - Normalized runtime options.
 * @returns {Record<PlaceholderKey, string | undefined>} Component mapping.
 */
export function buildComponentMap(
  context: Pick<ErrorContext, 'module' | 'caller' | 'message' | 'stack'>,
  options: NormalizedFormatOptions
): Record<PlaceholderKey, string | undefined> {
  const callerValue = options.includeCaller ? context.caller : undefined;

  return {
    module: context.module,
    caller: callerValue,
    error: context.message,
    stack: context.stack,
  };
}

/**
 * Builds the stack placeholder component using configured truncation settings.
 *
 * @param {string | undefined} stack - Raw stack trace text from the Error instance.
 * @param {Pick<FormatterDefaults, 'maxStackLines' | 'tempLogFilePrefix'>} defaults - Stack defaults from config.
 * @returns {string | undefined} Stack section ready for interpolation, or undefined when unavailable.
 */
export function buildStackComponent(
  stack: string | undefined,
  defaults: Pick<FormatterDefaults, 'maxStackLines' | 'tempLogFilePrefix'>
): string | undefined {
  if (!stack) {
    return undefined;
  }

  const { stackText, fullFilePath } = prepareStackForOutput(
    stack,
    defaults.maxStackLines,
    defaults.tempLogFilePrefix
  );

  if (!stackText) {
    return undefined;
  }

  let formatted = `Stack trace:\n${stackText}`;
  if (fullFilePath) {
    formatted += `\n[Full trace: ${fullFilePath}]`;
  }

  return formatted;
}
