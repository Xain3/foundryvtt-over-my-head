import OperatorValidator from './operatorValidator';

describe('OperatorValidator', () => {
  describe('ensureKeyTipesExist', () => {
    it('should return true if keyTypes is a valid array', () => {
      expect(OperatorValidator.ensureKeyTipesExist(['a', 'b', 'c'])).toBe(true);
    });

    it('should throw an error if keyTypes is not provided and throwError is true', () => {
      expect(() => OperatorValidator.ensureKeyTipesExist(undefined)).toThrow('Key types must be an array');
    });

    it('should log an error and return false if keyTypes is not provided, throwError is false, and consoleLog is true', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(OperatorValidator.ensureKeyTipesExist(undefined, false, true)).toBe(false);
      expect(spy).toHaveBeenCalledWith('Key types must be an array');
      spy.mockRestore();
    });

    it('should return false and not log if keyTypes is not provided, throwError is false, and consoleLog is false', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(OperatorValidator.ensureKeyTipesExist(undefined, false, false)).toBe(false);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should throw an error if keyTypes is not an array and throwError is true', () => {
      expect(() => OperatorValidator.ensureKeyTipesExist('not-an-array')).toThrow('Key types must be an array');
    });

    it('should log an error and return false if keyTypes is not an array, throwError is false, and consoleLog is true', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(OperatorValidator.ensureKeyTipesExist('not-an-array', false, true)).toBe(false);
      expect(spy).toHaveBeenCalledWith('Key types must be an array');
      spy.mockRestore();
    });
  });

  describe('validatePathArguments', () => {
    it('should return true if all pathArguments are strings', () => {
      expect(OperatorValidator.validatePathArguments(['foo', 'bar'])).toBe(true);
    });

    it('should throw an error if any pathArgument is not a string and throwError is true', () => {
      expect(() => OperatorValidator.validatePathArguments(['foo', 123])).toThrow('All path arguments must be strings');
    });

    it('should log an error and return false if any pathArgument is not a string, throwError is false, and consoleLog is true', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(OperatorValidator.validatePathArguments(['foo', 123], false, true)).toBe(false);
      expect(spy).toHaveBeenCalledWith('All path arguments must be strings');
      spy.mockRestore();
    });

    it('should return false and not log if any pathArgument is not a string, throwError is false, and consoleLog is false', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(OperatorValidator.validatePathArguments(['foo', 123], false, false)).toBe(false);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return true for an empty array', () => {
      expect(OperatorValidator.validatePathArguments([])).toBe(true);
    });
  });
});