/**
 * @file stringFormatter-types.ts
 * @description Type definitions for the string formatting utility.
 * @path src/utils/static/stringFormatter-types.ts
 */

/**
 * Options for formatting a string with optional prefix and/or suffix.
 * @export
 */
export interface FormatOptions {
  /**
   * String to prepend to the base string.
   * @optional
   */
  prefix?: string;

  /**
   * String to append to the base string.
   * @optional
   */
  suffix?: string;
}
