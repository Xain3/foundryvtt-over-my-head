import RootManagerValidator from './rootManagerValidator';

describe('RootManagerValidator', () => {
  const operationName = 'test';

  describe('_validateSource', () => {
    it('returns true for valid string source', () => {
      expect(RootManagerValidator._validateSource('abc', operationName)).toBe(true);
    });

    it('throws error if source is falsy', () => {
      expect(() => RootManagerValidator._validateSource('', operationName)).toThrow(
        `Could not ${operationName} remote context root. Source string must be provided`
      );
      expect(() => RootManagerValidator._validateSource(undefined, operationName)).toThrow();
      expect(() => RootManagerValidator._validateSource(null, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and source is falsy', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateSource('', operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Source string must be provided`
      );
      console.error.mockRestore();
    });

    it('throws error if source is not a string', () => {
      expect(() => RootManagerValidator._validateSource(123, operationName)).toThrow(
        `Could not ${operationName} remote context root. Source string must be a valid string, received number instead`
      );
      expect(() => RootManagerValidator._validateSource({}, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and source is not a string', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateSource(123, operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Source string must be a valid string, received number instead`
      );
      console.error.mockRestore();
    });

    it('returns false and does not log if consoleLog is false', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateSource('', operationName, false, false)).toBe(false);
      expect(console.error).not.toHaveBeenCalled();
      console.error.mockRestore();
    });
  });

  describe('_validateTarget', () => {
    it('returns true for valid object target', () => {
      expect(RootManagerValidator._validateTarget({}, operationName)).toBe(true);
      expect(RootManagerValidator._validateTarget({ a: 1 }, operationName)).toBe(true);
    });

    it('throws error if target is falsy', () => {
      expect(() => RootManagerValidator._validateTarget(undefined, operationName)).toThrow(
        `Could not ${operationName} remote context root. Target object must be provided`
      );
      expect(() => RootManagerValidator._validateTarget(null, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and target is falsy', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateTarget(undefined, operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Target object must be provided`
      );
      console.error.mockRestore();
    });

    it('throws error if target is not an object', () => {
      expect(() => RootManagerValidator._validateTarget('string', operationName)).toThrow(
        `Could not ${operationName} remote context root. Target object must be a valid object, received string instead`
      );
      expect(() => RootManagerValidator._validateTarget(123, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and target is not an object', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateTarget('string', operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Target object must be a valid object, received string instead`
      );
      console.error.mockRestore();
    });

    it('returns false and does not log if consoleLog is false', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateTarget(undefined, operationName, false, false)).toBe(false);
      expect(console.error).not.toHaveBeenCalled();
      console.error.mockRestore();
    });
  });

  describe('_validateReturnValue', () => {
    it('returns true if returnValue is undefined', () => {
      expect(RootManagerValidator._validateReturnValue(undefined, operationName)).toBe(true);
    });

    it('returns true if returnValue is boolean', () => {
      expect(RootManagerValidator._validateReturnValue(true, operationName)).toBe(true);
      expect(RootManagerValidator._validateReturnValue(false, operationName)).toBe(true);
    });

    it('throws error if returnValue is not boolean or undefined', () => {
      expect(() => RootManagerValidator._validateReturnValue('string', operationName)).toThrow(
        `Could not ${operationName} remote context root. Return value must be a boolean, received string instead`
      );
      expect(() => RootManagerValidator._validateReturnValue(123, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and returnValue is not boolean', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateReturnValue('string', operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Return value must be a boolean, received string instead`
      );
      console.error.mockRestore();
    });

    it('returns false and does not log if consoleLog is false', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateReturnValue('string', operationName, false, false)).toBe(false);
      expect(console.error).not.toHaveBeenCalled();
      console.error.mockRestore();
    });
  });

  describe('_validateSetProperty', () => {
    it('returns true if setProperty is undefined', () => {
      expect(RootManagerValidator._validateSetProperty(undefined, operationName)).toBe(true);
    });

    it('returns true if setProperty is boolean', () => {
      expect(RootManagerValidator._validateSetProperty(true, operationName)).toBe(true);
      expect(RootManagerValidator._validateSetProperty(false, operationName)).toBe(true);
    });

    it('throws error if setProperty is not boolean or undefined', () => {
      expect(() => RootManagerValidator._validateSetProperty('string', operationName)).toThrow(
        `Could not ${operationName} remote context root. Set property must be a boolean, received string instead`
      );
      expect(() => RootManagerValidator._validateSetProperty(123, operationName)).toThrow();
    });

    it('returns false and logs error if throwError is false and setProperty is not boolean', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateSetProperty('string', operationName, false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Could not ${operationName} remote context root. Set property must be a boolean, received string instead`
      );
      console.error.mockRestore();
    });

    it('returns false and does not log if consoleLog is false', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator._validateSetProperty('string', operationName, false, false)).toBe(false);
      expect(console.error).not.toHaveBeenCalled();
      console.error.mockRestore();
    });
  });

  describe('validateSourceString', () => {
    it('returns true for valid string', () => {
      expect(RootManagerValidator.validateSourceString('abc')).toBe(true);
    });

    it('throws error if sourceString is falsy', () => {
      expect(() => RootManagerValidator.validateSourceString('')).toThrow(
        'Could not determine remote context root. Source string must be provided'
      );
      expect(() => RootManagerValidator.validateSourceString(undefined)).toThrow();
    });

    it('throws error if sourceString is not a string', () => {
      expect(() => RootManagerValidator.validateSourceString(123)).toThrow(
        'Could not determine remote context root. Source string must be a valid string, received number instead'
      );
      expect(() => RootManagerValidator.validateSourceString({})).toThrow();
    });

    it('returns false and logs error if throwError is false and sourceString is not a string', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(RootManagerValidator.validateSourceString(123, 'determine', false, true)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Could not determine remote context root. Source string must be a valid string, received number instead'
      );
      console.error.mockRestore();
    });
  });

  describe('validateManageRootArgs', () => {
    const validArgs = {
      source: 'abc',
      target: {},
      returnValue: true,
      setProperty: false,
      operationName: 'manage'
    };

    it('returns true for all valid arguments', () => {
      expect(RootManagerValidator.validateManageRootArgs(validArgs)).toBe(true);
    });

    it('returns false if any argument is invalid (source)', () => {
      const args = { ...validArgs, source: '' };
      expect(() => RootManagerValidator.validateManageRootArgs(args)).toThrow();
      expect(RootManagerValidator.validateManageRootArgs(args, false, false)).toBe(false);
    });

    it('returns false if any argument is invalid (target)', () => {
      const args = { ...validArgs, target: null };
      expect(() => RootManagerValidator.validateManageRootArgs(args)).toThrow();
      expect(RootManagerValidator.validateManageRootArgs(args, false, false)).toBe(false);
    });

    it('returns false if any argument is invalid (returnValue)', () => {
      const args = { ...validArgs, returnValue: 'notBoolean' };
      expect(() => RootManagerValidator.validateManageRootArgs(args)).toThrow();
      expect(RootManagerValidator.validateManageRootArgs(args, false, false)).toBe(false);
    });

    it('returns false if any argument is invalid (setProperty)', () => {
      const args = { ...validArgs, setProperty: 'notBoolean' };
      expect(() => RootManagerValidator.validateManageRootArgs(args)).toThrow();
      expect(RootManagerValidator.validateManageRootArgs(args, false, false)).toBe(false);
    });
  });
});