/**
 * @file jsonc-helpers.unit.test.mjs
 * @description Unit tests for JSONC helper functions
 * @path tests/unit/adapters/jsonc-helpers.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import {
  parseJsoncString,
  detectIndentation,
  detectEolStyle,
  detectTrailingNewline,
} from '../../../.dev/utils/alias-adapters/jsonc-helpers.mjs';

describe('jsonc-helpers', () => {
  describe('parseJsoncString', () => {
    it('parses valid JSON', () => {
      const json = '{"key": "value"}';
      const result = parseJsoncString(json);

      expect(result).toEqual({ key: 'value' });
    });

    it('strips single-line comments', () => {
      const jsonc = '{\n  "key": "value" // comment\n}';
      const result = parseJsoncString(jsonc);

      expect(result).toEqual({ key: 'value' });
    });

    it('strips multi-line comments', () => {
      const jsonc = '{\n  /* comment */\n  "key": "value"\n}';
      const result = parseJsoncString(jsonc);

      expect(result).toEqual({ key: 'value' });
    });

    it('handles trailing commas', () => {
      const jsonc = '{\n  "key": "value",\n}';
      const result = parseJsoncString(jsonc);

      expect(result).toEqual({ key: 'value' });
    });

    it('handles complex JSONC', () => {
      const jsonc = `{
  // Single line comment
  "key1": "value1", // inline comment
  /* Multi-line
     comment */
  "key2": "value2",
}`;
      const result = parseJsoncString(jsonc);

      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });
  });

  describe('detectIndentation', () => {
    it('detects 2-space indentation', () => {
      const content = '{\n  "key": "value"\n}';
      const result = detectIndentation(content);

      expect(result.useTabs).toBe(false);
      expect(result.size).toBe(2);
    });

    it('detects 4-space indentation', () => {
      const content = '{\n    "key": "value"\n}';
      const result = detectIndentation(content);

      expect(result.useTabs).toBe(false);
      expect(result.size).toBe(4);
    });

    it('detects tab indentation', () => {
      const content = '{\n\t"key": "value"\n}';
      const result = detectIndentation(content);

      expect(result.useTabs).toBe(true);
    });

    it('defaults to 2 spaces when no indentation found', () => {
      const content = '{"key":"value"}';
      const result = detectIndentation(content);

      expect(result.size).toBe(2);
    });
  });

  describe('detectEolStyle', () => {
    it('detects LF style', () => {
      const content = 'line1\nline2\nline3';
      const result = detectEolStyle(content);

      expect(result).toBe('\n');
    });

    it('detects CRLF style', () => {
      const content = 'line1\r\nline2\r\nline3';
      const result = detectEolStyle(content);

      expect(result).toBe('\r\n');
    });

    it('prefers CRLF when both present', () => {
      const content = 'line1\r\nline2\nline3\r\n';
      const result = detectEolStyle(content);

      expect(result).toBe('\r\n');
    });
  });

  describe('detectTrailingNewline', () => {
    it('detects trailing LF', () => {
      const content = 'content\n';
      const result = detectTrailingNewline(content);

      expect(result).toBe(true);
    });

    it('detects trailing CRLF', () => {
      const content = 'content\r\n';
      const result = detectTrailingNewline(content);

      expect(result).toBe(true);
    });

    it('detects no trailing newline', () => {
      const content = 'content';
      const result = detectTrailingNewline(content);

      expect(result).toBe(false);
    });
  });
});
