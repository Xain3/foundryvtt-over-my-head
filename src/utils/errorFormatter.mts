/**
 * @file errorFormatter.mts
 * @description Entry point for the configurable error formatter utility.
 * @path src/utils/errorFormatter.mts
 */

import { config } from '#config';
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import type { ModuleNameResolverConfig } from '#/utils/static/moduleNameResolver-types.ts';
import {
  prepareStackForOutput,
  escapeTemplateBraces,
} from '#/utils/helpers/errorFormatterHelpers.mts';

import type {
  ErrorContext,
  ErrorPattern,
  FormatOptions,
} from './errorFormatter-types.ts';

const MODULE_PREFIX = 'OMH';
const FALLBACK_PATTERN = '{{module}}{{caller}}{{error}}{{stack}}';
const FALLBACK_SEPARATOR = ' || ';
const FALLBACK_MODULE_NAME = 'Unknown Module';
const FALLBACK_PLACEHOLDER_MESSAGE = '[No error message provided]';
const FALLBACK_MAX_STACK_LINES = 20;
const FALLBACK_TEMP_LOG_PREFIX = 'omh-error';

type PlaceholderKey = 'module' | 'caller' | 'error' | 'stack';

interface FormatterDefaults extends ErrorPattern {
  fallbackModuleName: string;
  maxStackLines: number;
  tempLogFilePrefix: string;
}

interface NormalizedFormatOptions {
  includeStack: boolean;
  includeCaller: boolean;
  caller?: string;
}

/**
 * Formats errors for the Over My Head module using configurable templates.
 *
 * @param {Error | string} errorOrMessage - Error instance or text to format.
 * @param {FormatOptions} [options] - Optional format overrides.
 * @returns {string} Formatted error output.
 */
export function formatError(
  errorOrMessage: Error | string,
  options?: FormatOptions
): string {
  const normalizedError = coerceError(errorOrMessage);
  const defaults = loadFormatterDefaults();
  const normalizedOptions = normalizeOptions(options);
  const moduleName = resolveModuleNameSafely(defaults.fallbackModuleName);
  const message =
    normalizedError.message?.trim() || FALLBACK_PLACEHOLDER_MESSAGE;
  const pattern = defaults;
  const shouldIncludeStack =
    normalizedOptions.includeStack && pattern.componentOrder.includes('stack');
  const stackComponent = shouldIncludeStack
    ? buildStackComponent(normalizedError.stack, defaults)
    : undefined;

  const context: Pick<ErrorContext, 'module' | 'caller' | 'message' | 'stack'> =
    {
      module: moduleName,
      caller: normalizedOptions.caller,
      message,
      stack: stackComponent,
    };

  const components = buildComponentMap(context, normalizedOptions);
  const orderedPieces = pattern.componentOrder
    .map((key) => components[key])
    .filter((value): value is string => Boolean(value && value.length > 0));

  if (orderedPieces.length === 0) {
    return moduleName;
  }

  return orderedPieces.join(pattern.separator);
}

/**
 * Ensures the provided value is an Error instance, coercing strings when necessary.
 *
 * @param {Error | string} value - Incoming error or string message.
 * @returns {Error} Normalized error instance.
 * @throws {TypeError} When the value cannot be coerced.
 */
function coerceError(value: Error | string): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'string') {
    return new Error(value);
  }

  throw new TypeError('[OMH] formatError() expects an Error or string value');
}

/**
 * Normalizes optional format flags into booleans with trimmed and escaped caller text.
 *
 * @param {FormatOptions} [options] - Raw format options.
 * @returns {Required<FormatOptions>} Normalized options object.
 */
function normalizeOptions(options?: FormatOptions): NormalizedFormatOptions {
  const includeStack = Boolean(options?.includeStack);
  const includeCaller = Boolean(options?.includeCaller);
  let caller: string | undefined;

  if (includeCaller && options?.caller) {
    const trimmed = options.caller.trim();
    caller = trimmed.length > 0 ? escapeTemplateBraces(trimmed) : undefined;
  }

  return {
    includeStack,
    includeCaller,
    caller,
  };
}

/**
 * Reads formatter configuration from the config singleton with hardcoded fallbacks.
 *
 * @returns {FormatterDefaults} Effective formatter defaults.
 */
function loadFormatterDefaults(): FormatterDefaults {
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
function resolveModuleNameSafely(fallback: string): string {
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
 * Parses the configured template into an ordered placeholder array.
 *
 * @param {string} template - Template string with placeholders.
 * @returns {PlaceholderKey[]} Ordered placeholder keys.
 */
function parsePattern(template: string): PlaceholderKey[] {
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
 * Builds a mapping of template placeholders to populated strings.
 *
 * @param {Pick<ErrorContext, 'module' | 'caller' | 'message' | 'stack'>} context - Core formatter context.
 * @param {Required<FormatOptions>} options - Normalized runtime options.
 * @returns {Record<PlaceholderKey, string | undefined>} Component mapping.
 */
function buildComponentMap(
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
function buildStackComponent(
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
