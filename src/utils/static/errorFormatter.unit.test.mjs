/**
 * @file errorFormatter.unit.test.mjs
 * @description Unit tests for the ErrorFormatter class and formatError function.
 * @path src/helpers/errorFormatter.unit.test.mjs
 * @date 25 May 2025
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ErrorFormatter, { formatError } from './errorFormatter.mjs';

// Mock manifest
vi.mock('@manifest', () => ({
  title: 'OverMyHead',
  name: 'foundryvtt-over-my-head',
  id: 'foundryvtt-over-my-head',
  shortName: 'OMH'
}), { virtual: true });

// Mock constants
vi.mock('@constants', () => ({
  moduleManagement: {
    referToModuleBy: 'title',
  },
  errors: {
    separator: ' || ',
    pattern: '{{module}}{{caller}}{{error}}{{stack}}'
  }
}), { virtual: true });

describe('ErrorFormatter', () => {
  let testError;

  beforeEach(() => {
    testError = new Error('Test error message');
    testError.stack = 'Error: Test error message\n    at Object.<anonymous> (/path/to/file.mjs:10:15)';
  });

  describe('formatError static method', () => {
    describe('basic functionality', () => {
      it('should format error with default options', () => {
        const result = ErrorFormatter.formatError(testError, {});

        expect(result).toContain('OverMyHead');
        expect(result).toContain('Test error message');
        expect(result).not.toContain('Call Stack:');
        expect(result).not.toContain(' || '); // No caller separator
      });

      it('should include module name from manifest', () => {
        const result = ErrorFormatter.formatError(testError, {});

        expect(result).toContain('OverMyHead');
      });

      it('should include error message', () => {
        const result = ErrorFormatter.formatError(testError, {});

        expect(result).toContain('Test error message');
      });
    });

    describe('includeStack option', () => {
      it('should include stack trace when includeStack is true', () => {
        const result = ErrorFormatter.formatError(testError, { includeStack: true });

        expect(result).toContain('Call Stack:');
        expect(result).toContain('at Object.<anonymous>');
        expect(result).toContain('/path/to/file.mjs:10:15');
      });

      it('should not include stack trace when includeStack is false', () => {
        const result = ErrorFormatter.formatError(testError, { includeStack: false });

        expect(result).not.toContain('Call Stack:');
        expect(result).not.toContain('at Object.<anonymous>');
      });

      it('should not include stack trace by default', () => {
        const result = ErrorFormatter.formatError(testError, {});

        expect(result).not.toContain('Call Stack:');
      });
    });

    describe('includeCaller option', () => {
      it('should include caller when includeCaller is true and caller is provided', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeCaller: true,
          caller: 'TestClass.testMethod'
        });

        expect(result).toContain('TestClass.testMethod || ');
      });

      it('should not include caller when includeCaller is false', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeCaller: false,
          caller: 'TestClass.testMethod'
        });

        expect(result).not.toContain('TestClass.testMethod');
        expect(result).not.toContain(' || ');
      });

      it('should not include caller by default', () => {
        const result = ErrorFormatter.formatError(testError, {
          caller: 'TestClass.testMethod'
        });

        expect(result).not.toContain('TestClass.testMethod');
      });

      it('should handle empty caller string', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeCaller: true,
          caller: ''
        });

        expect(result).toContain(' || ');
      });
    });

    describe('pattern replacement', () => {
      it('should replace all pattern placeholders correctly', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeStack: true,
          includeCaller: true,
          caller: 'TestCaller'
        });

        expect(result).toMatch(/OverMyHead \|\| TestCaller \|\| Test error message[\s\S]*Call Stack:/);
      });

      it('should handle missing optional placeholders', () => {
        const result = ErrorFormatter.formatError(testError, {});

        // Should not contain placeholder strings
        expect(result).not.toContain('{{');
        expect(result).not.toContain('}}');
        expect(result).toContain('OverMyHead');
        expect(result).toContain('Test error message');
      });
    });

    describe('complete format combinations', () => {
      it('should format with all options enabled', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeStack: true,
          includeCaller: true,
          caller: 'CompleteTest.method'
        });

        expect(result).toContain('OverMyHead');
        expect(result).toContain('CompleteTest.method || ');
        expect(result).toContain('Test error message');
        expect(result).toContain('Call Stack:');
        expect(result).toContain(testError.stack);
      });

      it('should format with mixed options', () => {
        const result = ErrorFormatter.formatError(testError, {
          includeStack: false,
          includeCaller: true,
          caller: 'PartialTest'
        });

        expect(result).toContain('OverMyHead');
        expect(result).toContain('PartialTest || ');
        expect(result).toContain('Test error message');
        expect(result).not.toContain('Call Stack:');
      });
    });
  });

  describe('input validation', () => {
    describe('error parameter validation', () => {
  it('should throw TypeError if error is not an object or string', () => {
        expect(() => ErrorFormatter.formatError(null, {})).toThrow(TypeError);
        expect(() => ErrorFormatter.formatError(undefined, {})).toThrow(TypeError);
        expect(() => ErrorFormatter.formatError(123, {})).toThrow(TypeError);
        expect(() => ErrorFormatter.formatError(true, {})).toThrow(TypeError);
      });

      it('should provide meaningful error message for invalid error parameter', () => {
        expect(() => ErrorFormatter.formatError(null, {})).toThrow('Error must be an object');
      });

      it('should throw TypeError if error.message is not a string', () => {
        const invalidError = { message: null };
        expect(() => ErrorFormatter.formatError(invalidError, {})).toThrow(TypeError);

        const invalidError2 = { message: 123 };
        expect(() => ErrorFormatter.formatError(invalidError2, {})).toThrow(TypeError);

        const invalidError3 = {};
        expect(() => ErrorFormatter.formatError(invalidError3, {})).toThrow(TypeError);
      });

      it('should provide meaningful error message for invalid message property', () => {
        const invalidError = { message: null };
        expect(() => ErrorFormatter.formatError(invalidError, {})).toThrow('Error message must be a string');
      });

      it('should throw TypeError if error.stack is not a string when includeStack is true', () => {
        const invalidError = {
          message: 'Valid message',
          stack: null
        };

        expect(() => ErrorFormatter.formatError(invalidError, { includeStack: true }))
          .toThrow(TypeError);
        expect(() => ErrorFormatter.formatError(invalidError, { includeStack: true }))
          .toThrow('Error stack must be a string');
      });

      it('should not validate stack when includeStack is false', () => {
        const errorWithInvalidStack = {
          message: 'Valid message',
          stack: null
        };

        expect(() => ErrorFormatter.formatError(errorWithInvalidStack, { includeStack: false }))
          .not.toThrow();
      });
    });

    describe('edge cases for error objects', () => {
      it('should handle Error instances correctly', () => {
        const realError = new Error('Real error');
        const result = ErrorFormatter.formatError(realError, {});

        expect(result).toContain('Real error');
      });

      it('should handle custom error objects', () => {
        const customError = {
          message: 'Custom error message',
          stack: 'Custom stack trace'
        };

        const result = ErrorFormatter.formatError(customError, { includeStack: true });

        expect(result).toContain('Custom error message');
        expect(result).toContain('Custom stack trace');
      });

      it('should handle errors with additional properties', () => {
        const errorWithExtras = {
          message: 'Error with extras',
          stack: 'Stack trace',
          code: 'E001',
          timestamp: Date.now()
        };

        const result = ErrorFormatter.formatError(errorWithExtras, {});

        expect(result).toContain('Error with extras');
        // Should not break with extra properties
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('string input coercion', () => {
    it('should accept a string and format it as an error', () => {
      const result = ErrorFormatter.formatError('Something went wrong', {});
      expect(result).toMatch(/Something went wrong/);
    });

    it('should include stack when includeStack is true with string input', () => {
      const result = ErrorFormatter.formatError('Boom', { includeStack: true });
      expect(result).toMatch(/Boom/);
      expect(result).toMatch(/Call Stack:/);
    });

    it('should include caller when requested with string input', () => {
      const result = ErrorFormatter.formatError('Oops', { includeCaller: true, caller: 'myFunc' });
      expect(result).toMatch(/Oops/);
      expect(result).toMatch(/myFunc/);
    });
  });

  describe('module identification', () => {
    it('should use title by default from constants.moduleManagement.referToModuleBy', () => {
      const result = ErrorFormatter.formatError(testError, {});
      expect(result).toContain('OverMyHead');
    });

    // Test different moduleManagement.referToModuleBy values would require different mock setups
    // These tests demonstrate how the system would work with different configurations
  });

  describe('formatError standalone function', () => {
    it('should work identically to ErrorFormatter.formatError', () => {
      const options = {
        includeStack: true,
        includeCaller: true,
        caller: 'StandaloneTest'
      };

      const classResult = ErrorFormatter.formatError(testError, options);
      const functionResult = formatError(testError, options);

      expect(functionResult).toBe(classResult);
    });

    it('should be a wrapper around ErrorFormatter.formatError', () => {
      const spy = vi.spyOn(ErrorFormatter, 'formatError');

      const options = { includeStack: false };
      formatError(testError, options);

      expect(spy).toHaveBeenCalledWith(testError, options);

      spy.mockRestore();
    });
  });

  describe('constants integration', () => {
    it('should use separator from constants', () => {
      const result = ErrorFormatter.formatError(testError, {
        includeCaller: true,
        caller: 'TestCaller'
      });

      expect(result).toContain(' || '); // The separator from mocked constants
    });

    it('should use pattern from constants', () => {
      // The pattern {{module}}{{caller}}{{error}}{{stack}} should be used
      const result = ErrorFormatter.formatError(testError, {
        includeCaller: true,
        caller: 'TestCaller'
      });

      // Should contain module first, then caller, then error
      const moduleIndex = result.indexOf('OverMyHead');
      const callerIndex = result.indexOf('TestCaller');
      const errorIndex = result.indexOf('Test error message');

      expect(moduleIndex).toBeLessThan(callerIndex);
      expect(callerIndex).toBeLessThan(errorIndex);
    });
  });

  describe('special characters and formatting', () => {
    it('should handle errors with special characters', () => {
      const specialError = new Error('Error with "quotes" and \'apostrophes\' and <tags>');
      const result = ErrorFormatter.formatError(specialError, {});

      expect(result).toContain('Error with "quotes" and \'apostrophes\' and <tags>');
    });

    it('should handle multi-line error messages', () => {
      const multilineError = new Error('Line 1\nLine 2\nLine 3');
      const result = ErrorFormatter.formatError(multilineError, {});

      expect(result).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty error messages', () => {
      const emptyError = { message: '', stack: 'Some stack' };
      const result = ErrorFormatter.formatError(emptyError, {});

      expect(typeof result).toBe('string');
      expect(result).toContain('OverMyHead');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longError = new Error(longMessage);
      const result = ErrorFormatter.formatError(longError, {});

      expect(result).toContain(longMessage);
      expect(result.length).toBeGreaterThan(1000);
    });
  });

  describe('real-world error scenarios', () => {
    it('should handle TypeError', () => {
      const typeError = new TypeError('Cannot read property of undefined');
      const result = ErrorFormatter.formatError(typeError, { includeStack: true });

      expect(result).toContain('Cannot read property of undefined');
      expect(result).toContain('OverMyHead');
    });

    it('should handle ReferenceError', () => {
      const refError = new ReferenceError('variable is not defined');
      const result = ErrorFormatter.formatError(refError, {
        includeCaller: true,
        caller: 'SomeModule.someMethod'
      });

      expect(result).toContain('variable is not defined');
      expect(result).toContain('SomeModule.someMethod');
    });

    it('should handle custom application errors', () => {
      const appError = {
        message: 'Failed to load module configuration',
        stack: 'ConfigError: Failed to load module configuration\n    at loadConfig (config.mjs:25:10)',
        code: 'CONFIG_LOAD_ERROR'
      };

      const result = ErrorFormatter.formatError(appError, {
        includeStack: true,
        includeCaller: true,
        caller: 'ConfigManager.initialize'
      });

      expect(result).toContain('Failed to load module configuration');
      expect(result).toContain('ConfigManager.initialize');
      expect(result).toContain('Call Stack:');
    });
  });
});
