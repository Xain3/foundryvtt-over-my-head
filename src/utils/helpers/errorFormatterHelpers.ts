/**
 * @file errorFormatterHelpers.mts
 * @description Helper utilities for stack truncation, temp log persistence, and brace escaping.
 * @path src/utils/helpers/errorFormatterHelpers.mts
 */

import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MODULE_PREFIX = 'OMH';
const DEFAULT_STACK_LINES = 20;
const DEFAULT_TEMP_FILE_PREFIX = 'omh-error';

/**
 * Escapes `{{` / `}}` sequences so literal braces render in formatted output.
 *
 * @param {string} value - Input value that may contain template braces.
 * @returns {string} Escaped string safe for placeholder substitution.
 */
export function escapeTemplateBraces(value: string): string {
  return value.replaceAll(/{{/g, '\\{\\{').replaceAll(/}}/g, '\\}\\}');
}

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
  maxLines: number = DEFAULT_STACK_LINES
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
  filePrefix = 'omh-error'
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
  maxLines: number = DEFAULT_STACK_LINES,
  filePrefix: string = DEFAULT_TEMP_FILE_PREFIX
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
