/**
 * @file errorFormatter-types.ts
 * @description Shared types and guards for the error formatter utility.
 * @path src/utils/errorFormatter-types.ts
 */

/**
 * Describes the normalized values available to the formatter once coercion completes.
 */
export interface ErrorContext {
  module: string;
  caller?: string;
  message: string;
  stack?: string;
  pattern: ErrorPattern;
}

/**
 * Runtime options accepted by {@link formatError}.
 */
export interface FormatOptions {
  includeStack?: boolean;
  includeCaller?: boolean;
  caller?: string;
}

/**
 * Template configuration pulled from the config singleton or defaults.
 */
export interface ErrorPattern {
  template: string;
  separator: string;
  componentOrder: string[];
}

/**
 * Determines whether the provided value satisfies the {@link FormatOptions} shape.
 *
 * @param {unknown} value - Value to inspect.
 * @returns {value is FormatOptions} True when the object contains only option keys.
 */
export function isFormatOptions(value: unknown): value is FormatOptions {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const hasValidIncludeStack =
    !Object.prototype.hasOwnProperty.call(candidate, 'includeStack') ||
    typeof candidate.includeStack === 'boolean';
  const hasValidIncludeCaller =
    !Object.prototype.hasOwnProperty.call(candidate, 'includeCaller') ||
    typeof candidate.includeCaller === 'boolean';
  const hasValidCaller =
    !Object.prototype.hasOwnProperty.call(candidate, 'caller') ||
    typeof candidate.caller === 'string';

  return hasValidIncludeStack && hasValidIncludeCaller && hasValidCaller;
}

/**
 * Determines whether the provided value is a valid {@link ErrorContext}.
 *
 * @param {unknown} value - Value to inspect.
 * @returns {value is ErrorContext} True when the shape looks like the normalized context.
 */
export function isErrorContext(value: unknown): value is ErrorContext {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.module === 'string' &&
    candidate.module.trim().length > 0 &&
    typeof candidate.message === 'string' &&
    candidate.message.trim().length > 0 &&
    typeof candidate.pattern === 'object'
  );
}

/**
 * Determines whether the provided value is a valid {@link ErrorPattern}.
 *
 * @param {unknown} value - Value to inspect.
 * @returns {value is ErrorPattern} True when template/separator/order are present.
 */
export function isErrorPattern(value: unknown): value is ErrorPattern {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.template === 'string' &&
    typeof candidate.separator === 'string' &&
    Array.isArray(candidate.componentOrder)
  );
}
