/**
 * @file errorFormatter.ts
 * @description Entry point for the configurable error formatter utility.
 * @path src/utils/errorFormatter.ts
 */

import {
  coerceError,
  normalizeOptions,
  loadFormatterDefaults,
  resolveModuleNameSafely,
  buildComponentMap,
  buildStackComponent,
} from '#/utils/helpers/errorFormatterHelpers';
import type {
  ErrorContext,
  FormatOptions,
  PlaceholderKey,
} from './errorFormatter-types.ts';

const FALLBACK_PLACEHOLDER_MESSAGE = '[No error message provided]';

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
    .map((key) => components[key as PlaceholderKey])
    .filter((value): value is string => Boolean(value && value.length > 0));

  if (orderedPieces.length === 0) {
    return moduleName;
  }

  return orderedPieces.join(pattern.separator);
}
