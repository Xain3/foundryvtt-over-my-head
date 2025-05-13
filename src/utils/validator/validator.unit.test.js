import Validator from './validator.js';
import ManifestValidator from './manifestValidator.js';
import ParentObjectValidator from './parentObjectValidator.js';

// ErrorManager is a real dependency used by Validator.

jest.mock('./manifestValidator.js', () => ({
  __esModule: true,
  default: {
    validateManifest: jest.fn(),
  },
}));

jest.mock('./parentObjectValidator.js', () => ({
  __esModule: true,
  default: {
    validateParentObject: jest.fn(),
  },
}));

describe('Validator', () => {
  let validator;

  const testDefaultManifest = {
    id: 'default-test-module-id',
    name: 'Default Test Module Name',
    title: 'Default Test Module Title',
    constants: {
      validatorSeparator: ' ::: ',
    },
    referToModuleBy: 'id',
  };

  const mockValidManifest = {
    id: 'test-mod-id',
    name: 'Test Mod Name',
    title: 'Test Mod Title',
    constants: { validatorSeparator: ' --- ' },
    referToModuleBy: 'name',
  };

  const mockZodSchema = {
    parse: jest.fn(),
  };

  const createZodError = (issues, message = 'Zod validation failed') => {
    const err = new Error(message);
    err.issues = issues;
    return err;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations: assume validation passes
    ManifestValidator.validateManifest.mockImplementation(() => true);
    ParentObjectValidator.validateParentObject.mockImplementation(() => true);
    // Ensure mockZodSchema.parse is reset for each test if it's modified
    mockZodSchema.parse = jest.fn(data => data); // Simple pass-through
  });

  describe('Constructor', () => {
    it('should initialize with default manifest and settings', () => {
      // Pass the testDefaultManifest directly
      validator = new Validator({ manifest: testDefaultManifest });
      // Check if ManifestValidator was called with the testDefaultManifest
      expect(ManifestValidator.validateManifest).toHaveBeenCalledWith(testDefaultManifest);
      // Indirectly check ErrorManager config via an error message
      validator.addCheck('TestCheck', () => { throw new Error('Test Error'); });
      validator.run();
      const errors = validator.getErrors();
      // Example: "[default-test-module-id ::: run ::: TestCheck] Error: Test Error"
      expect(errors[0]).toContain(testDefaultManifest.id); // Module name
      expect(errors[0]).toContain(testDefaultManifest.constants.validatorSeparator); // Separator
      expect(errors[0]).toContain('run'); // Default callerName
      expect(errors[0]).toContain('TestCheck'); // Check name
      expect(errors[0]).toContain('Error: Test Error'); // Error message with prefix
    });

    it('should use provided manifest for ErrorManager configuration', () => {
      validator = new Validator({ manifest: mockValidManifest });
      expect(ManifestValidator.validateManifest).toHaveBeenCalledWith(mockValidManifest);
      validator.addCheck('AnotherCheck', () => { throw new Error('Another Error'); });
      validator.run();
      const errors = validator.getErrors();
      expect(errors[0]).toContain(mockValidManifest.name); // Derived from referToModuleBy: 'name'
      expect(errors[0]).toContain(mockValidManifest.constants.validatorSeparator);
      expect(errors[0]).toContain('AnotherCheck');
      expect(errors[0]).toContain('Error: Another Error');
    });

    it('should use fallback settings if provided manifest is invalid', () => {
      ManifestValidator.validateManifest.mockImplementation(() => {
        throw new Error('Invalid manifest');
      });
      const invalidManifest = { id: 'bad-manifest' }; // Missing constants.validatorSeparator
      // Pass a manifest that will cause validation to fail, or rely on default if manifest is optional
      // The constructor logic tries to use the passed manifest first.
      validator = new Validator({ manifest: invalidManifest });
      expect(ManifestValidator.validateManifest).toHaveBeenCalledWith(invalidManifest);
      validator.addCheck('FallbackCheck', () => { throw new Error('Fallback Error'); });
      validator.run();
      const errors = validator.getErrors();
      expect(errors[0]).toContain('Unknown module'); // Fallback module name
      expect(errors[0]).toContain(' || '); // Fallback separator
      expect(errors[0]).toContain('FallbackCheck');
      expect(errors[0]).toContain('Error: Fallback Error');
    });

    it('should derive module name correctly based on referToModuleBy', () => {
      const manifestName = { ...mockValidManifest, referToModuleBy: 'name' };
      validator = new Validator({ manifest: manifestName });
      validator.addCheck('T', () => { throw new Error('E'); }); validator.run();
      expect(validator.getErrors()[0]).toContain(manifestName.name);
      expect(validator.getErrors()[0]).toContain('Error: E');

      const manifestTitle = { ...mockValidManifest, referToModuleBy: 'title' };
      validator = new Validator({ manifest: manifestTitle });
      validator.addCheck('T', () => { throw new Error('E'); }); validator.run();
      expect(validator.getErrors()[0]).toContain(manifestTitle.title);
      expect(validator.getErrors()[0]).toContain('Error: E');

      const manifestId = { ...mockValidManifest, referToModuleBy: 'id' };
      validator = new Validator({ manifest: manifestId });
      validator.addCheck('T', () => { throw new Error('E'); }); validator.run();
      expect(validator.getErrors()[0]).toContain(manifestId.id);
      expect(validator.getErrors()[0]).toContain('Error: E');

      const manifestDefault = { ...mockValidManifest, id: 'defaultIdTest', referToModuleBy: 'nonexistent' };
      validator = new Validator({ manifest: manifestDefault });
      validator.addCheck('T', () => { throw new Error('E'); }); validator.run();
      expect(validator.getErrors()[0]).toContain(manifestDefault.id); // Falls back to id, name, title
      expect(validator.getErrors()[0]).toContain('Error: E');
    });

    it('should use errorManagerOptions to override derived/default settings', () => {
      validator = new Validator({
        manifest: mockValidManifest, // This test already provides a manifest
        errorManagerOptions: {
          moduleName: 'OverriddenModule',
          callerName: 'OverriddenCaller',
          separator: ' *** ',
        },
      });
      validator.addCheck('OverrideTest', () => { throw new Error('Override Error'); });
      validator.run();
      const errors = validator.getErrors();
      expect(errors[0]).toContain('OverriddenModule');
      expect(errors[0]).toContain('OverriddenCaller');
      expect(errors[0]).toContain(' *** ');
      expect(errors[0]).toContain('OverrideTest');
      expect(errors[0]).toContain('Error: Override Error');
    });

    it('should set throwOnError option', () => {
      // Provide a manifest, e.g., testDefaultManifest
      validator = new Validator({ manifest: testDefaultManifest, throwOnError: true });
      validator.addCheck('Fail', () => { throw new Error('Failure'); });
      expect(() => validator.run()).toThrow(/Error: Failure/);
    });

    it('should set errorReturnType option', () => {
      // Provide a manifest
      validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'errorsArray' });
      validator.addCheck('Fail', () => { throw new Error('Failure'); });
      const result = validator.run();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toContain('Error: Failure');

      // Provide a manifest
      validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'formattedMessage' });
      validator.addCheck('Fail', () => { throw new Error('Failure'); });
      const resultStr = validator.run();
      expect(typeof resultStr).toBe('string');
      expect(resultStr).toContain('Error: Failure');
    });

    it('should throw if invalid errorReturnType is provided', () => {
      // Provide a manifest
      expect(() => new Validator({ manifest: testDefaultManifest, errorReturnType: 'invalidType' }))
        .toThrow(/Invalid errorReturnType 'invalidType'/);
    });
  });

  describe('reset()', () => {
    it('should clear all checks and errors', () => {
      validator = new Validator({ manifest: testDefaultManifest });
      validator.addCheck('Check1', () => { throw new Error('Error1'); });
      validator.run();
      expect(validator.hasErrors()).toBe(true);

      validator.reset();
      expect(validator.hasErrors()).toBe(false);
      expect(validator.run()).toBe(true); // No checks, should pass
      expect(validator.getErrors()).toEqual([]);
    });
  });

  describe('addCheck()', () => {
    beforeEach(() => {
      validator = new Validator({ manifest: testDefaultManifest });
    });

    it('should add a function check', () => {
      const mockFn = jest.fn();
      validator.addCheck('FunctionCheck', mockFn);
      validator.run();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should add a Zod-like schema check with data', () => {
      const data = { name: 'test' };
      validator.addCheck('ZodCheck', mockZodSchema, data);
      validator.run();
      expect(mockZodSchema.parse).toHaveBeenCalledWith(data);
    });

    it('should add a Zod-like schema check with undefined data if explicitly passed', () => {
      validator.addCheck('ZodUndefinedCheck', mockZodSchema, undefined);
      validator.run();
      expect(mockZodSchema.parse).toHaveBeenCalledWith(undefined);
    });

    it('should throw if checkName is invalid', () => {
      expect(() => validator.addCheck('', () => {}))
        .toThrow('Validator.addCheck: checkName must be a non-empty string.');
      expect(() => validator.addCheck(123, () => {}))
        .toThrow('Validator.addCheck: checkName must be a non-empty string.');
    });

    it('should throw if funcOrSchema is not a function or valid schema', () => {
      expect(() => validator.addCheck('InvalidType', 123))
        .toThrow(/funcOrSchema must be a function or a Zod-like schema object/);
      expect(() => validator.addCheck('InvalidTypeObj', { notParse: () => {} }))
        .toThrow(/funcOrSchema must be a function or a Zod-like schema object/);
    });

    it('should throw if Zod-like schema is provided without dataToValidate argument', () => {
      const schema = { parse: jest.fn() };
      // Call addCheck with only two arguments for a schema
      expect(() => validator.addCheck('ZodMissingData', schema))
        .toThrow(/Zod-like schema provided but 'dataToValidate' argument is missing/);
    });
  });

  describe('addManifestCheck()', () => {
    it('should add a manifest validation check', () => {
      validator = new Validator({ manifest: testDefaultManifest });
      const manifestObj = { id: 'test' };
      validator.addManifestCheck(manifestObj, 'MyManifestCheck');
      validator.run();
      expect(ManifestValidator.validateManifest).toHaveBeenCalledWith(manifestObj);
    });
  });

  describe('addParentObjectCheck()', () => {
    it('should add a parent object validation check', () => {
      validator = new Validator({ manifest: testDefaultManifest });
      const parentObj = { data: {} };
      validator.addParentObjectCheck(parentObj, 'MyParentCheck');
      validator.run();
      expect(ParentObjectValidator.validateParentObject).toHaveBeenCalledWith(parentObj);
    });
  });

  describe('run()', () => {
    it('should return true if no checks are added', () => {
      validator = new Validator({ manifest: testDefaultManifest });
      expect(validator.run()).toBe(true);
    });

    it('should return true if all checks pass', () => {
      validator = new Validator({ manifest: testDefaultManifest });
      validator.addCheck('Pass1', () => {});
      validator.addCheck('Pass2', mockZodSchema, {});
      expect(validator.run()).toBe(true);
      expect(validator.hasErrors()).toBe(false);
    });

    describe('Error Handling and Return Types', () => {
      const errorMsg = 'Validation Failed';
      const failingFunc = () => { throw new Error(errorMsg); };
      const zodErrorIssues = [{ path: ['field'], message: 'Zod issue' }];
      const failingZodParse = () => { throw createZodError(zodErrorIssues); };

      it('should return false if a check fails (default errorReturnType)', () => {
        validator = new Validator({ manifest: testDefaultManifest }); // errorReturnType: 'boolean'
        validator.addCheck('FailCheck', failingFunc);
        expect(validator.run()).toBe(false);
        expect(validator.hasErrors()).toBe(true);
        expect(validator.getErrors()[0]).toContain(`Error: ${errorMsg}`);
      });

      it('should return array of errors if errorReturnType is "errorsArray"', () => {
        validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'errorsArray' });
        validator.addCheck('FailCheck1', failingFunc);
        validator.addCheck('FailCheck2', failingZodParse);
        const errors = validator.run();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(2);
        expect(errors[0]).toContain(`Error: ${errorMsg}`);
        expect(errors[1]).toContain('field: Zod issue'); // Zod errors are pre-formatted by Validator.run
      });

      it('should return formatted string if errorReturnType is "formattedMessage"', () => {
        validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'formattedMessage' });
        validator.addCheck('FailCheck1', failingFunc);
        validator.addCheck('FailCheck2', failingZodParse);
        const errors = validator.run();
        expect(typeof errors).toBe('string');
        expect(errors).toContain(`Error: ${errorMsg}`);
        expect(errors).toContain('field: Zod issue'); // Zod errors are pre-formatted
      });

      it('should throw error if throwOnError is true and a check fails', () => {
        validator = new Validator({ manifest: testDefaultManifest, throwOnError: true });
        validator.addCheck('FailCheck', failingFunc);
        try {
          validator.run();
          throw new Error('Test failed: validator.run() did not throw'); // Should not reach here
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          // e.message is the fully formatted string from ErrorManager
          expect(e.message).toContain(`Error: ${errorMsg}`);
          expect(e.details).toBeDefined();
          expect(Array.isArray(e.details)).toBe(true);
          expect(e.details[0]).toContain(`Error: ${errorMsg}`);
        }
      });
    });

    describe('Zod Error Formatting in run()', () => {
      beforeEach(() => {
        validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'errorsArray' });
      });

      it('should format Zod-like errors with issues', () => {
        const issues = [
          { path: ['user', 'name'], message: 'Name is too short' },
          { path: ['email'], message: 'Invalid email' },
          { path: [], message: 'Root issue'}
        ];
        mockZodSchema.parse.mockImplementation(() => { throw createZodError(issues); });
        validator.addCheck('ZodFormatting', mockZodSchema, {});
        const errors = validator.run();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('user.name: Name is too short; email: Invalid email; Root issue');
      });

      it('should use error.message if Zod issues are empty but message exists', () => {
        mockZodSchema.parse.mockImplementation(() => { throw createZodError([], 'Fallback Zod Message'); });
        validator.addCheck('ZodEmptyIssues', mockZodSchema, {});
        const errors = validator.run();
        expect(errors).toHaveLength(1);
        // Validator.run extracts error.message for Zod errors with empty issues, passes string to ErrorManager.
        // So, ErrorManager does not add "Error: " prefix.
        expect(errors[0]).toContain('Fallback Zod Message');
      });

      it('should use error.message for non-Zod errors', () => {
        const genericError = new Error('Generic error message');
        validator.addCheck('GenericError', () => { throw genericError; });
        const errors = validator.run();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Error: Generic error message');
      });
      
      it('should handle error objects without a message property', () => {
        const errorWithoutMessage = {}; // No .message, no .issues
        validator.addCheck('NamelessError', () => { throw errorWithoutMessage; });
        const errors = validator.run();
        expect(errors).toHaveLength(1);
        // ErrorManager will likely stringify the object. Check for check name.
        expect(errors[0]).toContain('NamelessError');
        // If Validator.run passes {} to ErrorManager, and ErrorManager's #parseErrorOrMessage
        // results in baseMessage being {}, and it's not instanceof Error,
        // then messageToFormat becomes {}. Stringified, this is '[object Object]'.
        expect(errors[0]).toContain('[object Object]');
      });
    });

    it('should clear previous errors from ErrorManager at the start of run()', () => {
      validator = new Validator({ manifest: testDefaultManifest, errorReturnType: 'errorsArray' });
      validator.addCheck('FailingCheck', () => { throw new Error('Initial Fail'); });
      let errors = validator.run();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Initial Fail');

      // Don't reset, but change the check to pass.
      // The #checks array still has 'FailingCheck', but its behavior changes.
      // This test is more about ErrorManager being cleared by run().
      // A better way:
      validator.reset(); // Clear checks
      validator.addCheck('FirstRunFail', () => { throw new Error('Error One'); });
      validator.run(); // ErrorManager now has "Error One"
      // Ensure the error message matches, including the "Error: " prefix if applicable
      expect(validator.getErrors()[0]).toContain('Error: Error One');

      validator.reset(); // Clear checks again
      validator.addCheck('SecondRunPass', () => {});
      validator.run(); // ErrorManager should be cleared by this run()
      expect(validator.hasErrors()).toBe(false);
      expect(validator.getErrors()).toEqual([]);
    });
  });

  describe('Error Accessor Methods', () => {
    beforeEach(() => {
      validator = new Validator({ manifest: testDefaultManifest });
      validator.addCheck('ErrorCheck', () => { throw new Error('AccessThis'); });
      validator.run();
    });

    it('getErrors() should return array of error messages', () => {
      const errors = validator.getErrors();
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Error: AccessThis');
    });

    it('getFormattedErrors() should return a single string of errors', () => {
      const formattedErrors = validator.getFormattedErrors();
      expect(typeof formattedErrors).toBe('string');
      expect(formattedErrors).toContain('Error: AccessThis');
    });

    it('hasErrors() should return true if errors exist', () => {
      expect(validator.hasErrors()).toBe(true);
    });

    it('hasErrors() should return false if no errors exist', () => {
      validator.reset(); // validator instance already created with testDefaultManifest
      validator.addCheck('Pass', () => {});
      validator.run();
      expect(validator.hasErrors()).toBe(false);
    });
  });
});