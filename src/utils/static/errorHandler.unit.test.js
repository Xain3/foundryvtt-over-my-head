import ErrorHandler, { defaultHandlerArgs } from './errorHandler';

describe('ErrorHandler', () => {
  let error;
  let errorList;

  beforeEach(() => {
    error = new Error('Test error');
    errorList = [];
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should export defaultHandlerArgs', () => {
    expect(defaultHandlerArgs).toHaveProperty('alsoReturn');
    expect(defaultHandlerArgs).toHaveProperty('addPrefix');
    expect(defaultHandlerArgs).toHaveProperty('errorList');
    expect(defaultHandlerArgs).toHaveProperty('appendErrors');
    expect(defaultHandlerArgs).toHaveProperty('forceReturn');
    expect(defaultHandlerArgs).toHaveProperty('updateErrorMessage');
    expect(defaultHandlerArgs).toHaveProperty('errorPrefix');
    expect(defaultHandlerArgs).toHaveProperty('customSuffix');
  });

  describe('handle', () => {
    it('should throw error for "throw" behaviour', () => {
      expect(() => ErrorHandler.handle('throw', error)).toThrow('Test error');
    });

    it('should log the error as is if addPrefix is false and the behavior is set as "logError"', () => {
      ErrorHandler.handle('logError', error, { addPrefix: false, errorList });
      expect(console.error).toHaveBeenCalledWith('Test error');
      expect(errorList[0]).toBe(error);
    });

    it('should log error for "logError" behaviour and return outcome if alsoReturn is true', () => {
      const result = ErrorHandler.handle('logError', error, { errorList });
      expect(console.error).toHaveBeenCalledWith('Test error');
      expect(result).toEqual({ outcome: false, errors: errorList });
      expect(errorList[0]).toBe(error);
    });

    it('should warn for "warn" behaviour and return outcome if alsoReturn is true', () => {
      const result = ErrorHandler.handle('warn', error, { errorList });
      expect(console.warn).toHaveBeenCalledWith('Test error');
      expect(result).toEqual({ outcome: false, errors: errorList });
      expect(errorList[0]).toBe(error);
    });

    it('should log for "log" behaviour and return outcome if alsoReturn is true', () => {
      const result = ErrorHandler.handle('log', error, { errorList });
      expect(console.log).toHaveBeenCalledWith('Test error');
      expect(result).toEqual({ outcome: false, errors: errorList });
      expect(errorList[0]).toBe(error);
    });

    it('should log and throw for "logAndThrow" behaviour', () => {
      expect(() => ErrorHandler.handle('logAndThrow', error, { errorList })).toThrow('Test error');
      expect(console.error).toHaveBeenCalledWith('Test error');
      expect(errorList[0]).toBe(error);
    });

    it('should append error for "append" behaviour', () => {
      const result = ErrorHandler.handle('append', error, { errorList });
      expect(errorList[0]).toBe(error);
      expect(result).toEqual({ outcome: false, errors: errorList });
    });

    it('should return special object for "return" behaviour', () => {
      const result = ErrorHandler.handle('return', error, { errorList });
      expect(result).toEqual({ outcome: false, errors: [] });
    });

    it('should do nothing for "silent" behaviour but return outcome if alsoReturn is true', () => {
      const result = ErrorHandler.handle('silent', error, { errorList });
      expect(result).toEqual({ outcome: false, errors: errorList });
      expect(errorList.length).toBe(0);
    });

    it('should log error for unknown behaviour', () => {
      const result = ErrorHandler.handle('unknown', error, { errorList });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Unknown error handling behaviour: 'unknown'. Logging error: Test error")
      );
      expect(result).toEqual({ outcome: false, errors: errorList });
    });

    it('should add prefix and suffix to error message if addPrefix and customSuffix are set', () => {
      ErrorHandler.handle('logError', error, {
        errorList,
        addPrefix: true,
        errorPrefix: '[PREFIX] ',
        customSuffix: ' [SUFFIX]'
      });
      expect(error.message).toBe('[PREFIX] Test error [SUFFIX]');
    });

    it('should not update error message if updateErrorMessage is false', () => {
      ErrorHandler.handle('logError', error, {
        errorList,
        updateErrorMessage: false,
        errorPrefix: '[PREFIX] ',
        customSuffix: ' [SUFFIX]'
      });
      expect(error.message).toBe('Test error');
    });

    it('should force return outcome if forceReturn is true', () => {
      const result = ErrorHandler.handle('logError', error, { errorList, alsoReturn: false, forceReturn: true });
      expect(result).toEqual({ outcome: false, errors: errorList });
    });

    it('should throw a new Error if error is not an Error instance', () => {
      expect(() => ErrorHandler.handle('throw', 'string error')).toThrow('string error');
    });

    it('should return undefined if alsoReturn and forceReturn are false', () => {
      const result = ErrorHandler.handle('logError', error, { alsoReturn: false, forceReturn: false });
      expect(result).toBeUndefined();
    });

    it('should append error to errorList only if appendErrors is true', () => {
      ErrorHandler.handle('logError', error, { errorList, appendErrors: false });
      expect(errorList.length).toBe(0);
      ErrorHandler.handle('logError', error, { errorList, appendErrors: true });
      expect(errorList.length).toBe(1);
    });

    it('should handle non-object error gracefully', () => {
      const result = ErrorHandler.handle('logError', 'string error', { errorList });
      expect(console.error).toHaveBeenCalledWith('string error');
      expect(result).toEqual({ outcome: false, errors: errorList });
    });
  });
});