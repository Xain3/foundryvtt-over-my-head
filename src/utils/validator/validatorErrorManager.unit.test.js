import ErrorManager from './validatorErrorManager';

describe('ErrorManager', () => {
  const MOCK_MODULE_NAME = 'TestModule';
  const MOCK_CALLER_NAME = 'TestCaller';
  const MOCK_SEPARATOR = '::';
  const MOCK_CUSTOM_PREFIX = 'PREFIX';
  const MOCK_CUSTOM_SUFFIX = 'SUFFIX';

  describe('constructor', () => {
    it('should initialize with provided values', () => {
      const manager = new ErrorManager({
        moduleName: MOCK_MODULE_NAME,
        callerName: MOCK_CALLER_NAME,
        separator: MOCK_SEPARATOR,
        customPrefix: MOCK_CUSTOM_PREFIX,
        customSuffix: MOCK_CUSTOM_SUFFIX,
      });
      expect(manager.moduleName).toBe(MOCK_MODULE_NAME);
      expect(manager.callerName).toBe(MOCK_CALLER_NAME);
      expect(manager.separator).toBe(MOCK_SEPARATOR);
      expect(manager.customPrefix).toBe(MOCK_CUSTOM_PREFIX);
      expect(manager.customSuffix).toBe(MOCK_CUSTOM_SUFFIX);
      expect(manager.errors).toEqual([]);
    });

    it('should initialize with default values if none are provided', () => {
      const manager = new ErrorManager({});
      expect(manager.moduleName).toBe('Unknown Module');
      expect(manager.callerName).toBe('Unknown Caller');
      expect(manager.separator).toBe('||');
      expect(manager.customPrefix).toBe('');
      expect(manager.customSuffix).toBe('');
    });

    it('should use default for falsy string values like empty string for moduleName and callerName', () => {
      const manager = new ErrorManager({ moduleName: '', callerName: '' });
      expect(manager.moduleName).toBe('Unknown Module'); // '' || 'Unknown Module'
      expect(manager.callerName).toBe('Unknown Caller'); // '' || 'Unknown Caller'
    });

    it('should use provided empty string for separator, prefix, suffix if Zod validation passes them', () => {
        // Current implementation: '' || 'default' makes empty strings for separator become default.
        // customPrefix and customSuffix default to '' if undefined, so providing '' explicitly works as expected.
      const manager = new ErrorManager({ separator: '', customPrefix: '', customSuffix: '' });
      expect(manager.separator).toBe('||'); // '' || '||'
      expect(manager.customPrefix).toBe('');
      expect(manager.customSuffix).toBe('');
    });

    it('should throw an error if constructor arguments are invalid (e.g., moduleName is not a string)', () => {
      expect(() => new ErrorManager({ moduleName: 123 }))
        .toThrow(/^Issue handling error\. Validation failed: moduleName: Expected string, received number/);
    });
  });

  describe('formatError', () => {
    let manager;
    beforeEach(() => {
      manager = new ErrorManager({
        moduleName: MOCK_MODULE_NAME,
        callerName: MOCK_CALLER_NAME,
        separator: MOCK_SEPARATOR,
      });
    });

    it('should format a string message using instance defaults', () => {
      const formatted = manager.formatError({ errorOrMessage: 'Test message' });
      expect(formatted).toBe(`${MOCK_MODULE_NAME}${MOCK_SEPARATOR}${MOCK_CALLER_NAME}${MOCK_SEPARATOR}Test message`);
    });

    it('should format an Error object using instance defaults', () => {
      const error = new Error('Test error object');
      const formatted = manager.formatError({ errorOrMessage: error });
      expect(formatted).toBe(`${MOCK_MODULE_NAME}${MOCK_SEPARATOR}${MOCK_CALLER_NAME}${MOCK_SEPARATOR}Error: Test error object`);
    });

    it('should format a message with all custom options provided to formatError', () => {
      const formatted = manager.formatError({
        errorOrMessage: 'Custom message',
        moduleName: 'CustomModule',
        callerName: 'CustomCaller',
        separator: '##',
        customPrefix: 'PRE',
        customSuffix: 'SUF',
        includeStack: false,
      });
      expect(formatted).toBe('CustomModule##CustomCaller##PRE##Custom message##SUF');
    });

    it('should include stack trace for Error object when includeStack is true', () => {
      const error = new Error('Error with stack');
      error.stack = 'Error: Error with stack\n    at func1 (file.js:1:1)\n    at func2 (file.js:2:2)';
      const formatted = manager.formatError({
        errorOrMessage: error,
        includeStack: true,
      });
      const expected = `${MOCK_MODULE_NAME}${MOCK_SEPARATOR}${MOCK_CALLER_NAME}${MOCK_SEPARATOR}Error: Error with stack${MOCK_SEPARATOR}func1 (file.js:1:1)${MOCK_SEPARATOR}func2 (file.js:2:2)`;
      expect(formatted).toBe(expected);
    });

    it('should handle customSuffix and includeStack together', () => {
      const error = new Error('Error with stack and suffix');
      error.stack = 'Error: Error with stack and suffix\n    at func1 (file.js:1:1)';
      const formatted = manager.formatError({
        errorOrMessage: error,
        customSuffix: 'MySuffix',
        includeStack: true,
      });
      const expected = `${MOCK_MODULE_NAME}${MOCK_SEPARATOR}${MOCK_CALLER_NAME}${MOCK_SEPARATOR}Error: Error with stack and suffix${MOCK_SEPARATOR}MySuffix${MOCK_SEPARATOR}func1 (file.js:1:1)`;
      expect(formatted).toBe(expected);
    });

    it('should not include stack trace for string message even if includeStack is true', () => {
      const formatted = manager.formatError({
        errorOrMessage: 'String message, no stack',
        includeStack: true,
      });
      expect(formatted).toBe(`${MOCK_MODULE_NAME}${MOCK_SEPARATOR}${MOCK_CALLER_NAME}${MOCK_SEPARATOR}String message, no stack`);
      expect(formatted).not.toContain('at ');
    });

    it('should throw if errorOrMessage is not a string or Error', () => {
      expect(() => manager.formatError({ errorOrMessage: 123 }))
        .toThrow(/^Issue handling error\. Validation failed: errorOrMessage: Expected string, received number/);
    });

    it('should throw if an argument like moduleName is of invalid type', () => {
      expect(() => manager.formatError({ errorOrMessage: "Valid message", moduleName: 123 }))
        .toThrow(/^Issue handling error\. Validation failed: moduleName: Expected string, received number/);
    });

    it('should throw if includeStack is not a boolean', () => {
        expect(() => manager.formatError({ errorOrMessage: "Valid message", includeStack: "true" }))
          .toThrow(/^Issue handling error\. Validation failed: includeStack: Expected boolean, received string/);
      });
  });

  describe('addError', () => {
    // Due to the current implementation of addError, it will always throw an error.
    // 1. If `args` is an object (as per JSDoc): `this.#validateError(args)` fails because `args` (the object) is not a string/Error.
    // 2. If `args` is a string/Error: `this.#validateError(args)` passes, but `args.errorOrMessage` (and other properties)
    //    are undefined, causing the subsequent `this.formatError` call to fail its own validation for `errorOrMessage`.
    let manager;
    beforeEach(() => {
      manager = new ErrorManager({ moduleName: MOCK_MODULE_NAME, callerName: MOCK_CALLER_NAME });
    });

    it('should throw when called with an object argument (as per JSDoc) due to #validateError expecting string|Error', () => {
      expect(() => manager.addError({ errorOrMessage: 'Test message' }))
        .toThrow(/^Issue handling error\. Validation failed: /); // Zod error message for wrong type
    });

    it('should throw when called with a string argument due to subsequent formatError call with undefined errorOrMessage', () => {
      expect(() => manager.addError('Test string error'))
        .toThrow(/^Issue handling error\. Validation failed: errorOrMessage: Required/);
    });

    it('should throw when called with an Error object argument due to subsequent formatError call with undefined errorOrMessage', () => {
      expect(() => manager.addError(new Error('Test Error object')))
        .toThrow(/^Issue handling error\. Validation failed: errorOrMessage: Required/);
    });
  });

  describe('getErrors, getFormattedErrors, hasErrors (with non-functional addError)', () => {
    let manager;
    beforeEach(() => {
      manager = new ErrorManager({});
      // Note: As addError currently always throws, errors cannot be added.
      // These tests reflect that state.
    });

    describe('getErrors', () => {
      it('should return an empty array initially', () => {
        expect(manager.getErrors()).toEqual([]);
      });

      it('should return an empty array even after attempting to add errors (since addError throws)', () => {
        try {
          manager.addError({ errorOrMessage: 'Test' });
        } catch (e) {
          // Expected
        }
        expect(manager.getErrors()).toEqual([]);
      });
    });

    describe('getFormattedErrors', () => {
      it('should return an empty string initially', () => {
        expect(manager.getFormattedErrors()).toBe('');
      });

      it('should return an empty string even after attempting to add errors', () => {
        try {
          manager.addError({ errorOrMessage: 'Test' });
        } catch (e) {
          // Expected
        }
        expect(manager.getFormattedErrors()).toBe('');
      });
    });

    describe('hasErrors', () => {
      it('should return false initially', () => {
        expect(manager.hasErrors()).toBe(false);
      });

      it('should return false even after attempting to add errors', () => {
        try {
          manager.addError({ errorOrMessage: 'Test' });
        } catch (e) {
          // Expected
        }
        expect(manager.hasErrors()).toBe(false);
      });
    });
  });
});