import Checks from './checks';

describe('Checks', () => {
  // --- Presence Checks ---
  describe('isDefined', () => {
    it('returns truthy for defined values', () => {
      expect(Checks.isDefined(0)).toBeTruthy();
      expect(Checks.isDefined('')).toBeTruthy();
      expect(Checks.isDefined([])).toBeTruthy();
      expect(Checks.isDefined({})).toBeTruthy();
      expect(Checks.isDefined(false)).toBeTruthy();
    });

    it('throws for undefined or null (default behaviour)', () => {
      expect(() => Checks.isDefined(undefined)).toThrow();
      expect(() => Checks.isDefined(null)).toThrow();
    });
    it('returns falsy for undefined or null (bool behaviour)', () => {
      expect(Checks.isDefined(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefined(null, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or null (object behaviour)', () => {
      expect(Checks.isDefined(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefined(null, 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isEmpty', () => {
    it('returns truthy for undefined/null (default considerUndefinedAsEmpty)', () => {
      expect(Checks.isEmpty(undefined)).toBeTruthy();
      expect(Checks.isEmpty(null)).toBeTruthy();
    });

    it('returns falsy for undefined if considerUndefinedAsEmpty is false (default behaviour)', () => {
      expect(() => Checks.isEmpty(undefined, undefined, undefined, undefined, false)).toThrow();
    });
    it('returns falsy for undefined if considerUndefinedAsEmpty is false (bool behaviour)', () => {
      expect(Checks.isEmpty(undefined, undefined, undefined, undefined, false, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined if considerUndefinedAsEmpty is false (object behaviour)', () => {
      expect(Checks.isEmpty(undefined, undefined, undefined, undefined, false, 'object')).toMatchObject({ outcome: false });
    });

    it('returns truthy for empty string, array, object', () => {
      expect(Checks.isEmpty('')).toBeTruthy();
      expect(Checks.isEmpty([])).toBeTruthy();
      expect(Checks.isEmpty({})).toBeTruthy();
    });

    it('throws for non-empty string, array, object, 0, false (default behaviour)', () => {
      expect(() => Checks.isEmpty('abc')).toThrow();
      expect(() => Checks.isEmpty([1])).toThrow();
      expect(() => Checks.isEmpty({ a: 1 })).toThrow();
      expect(() => Checks.isEmpty(0)).toThrow();
      expect(() => Checks.isEmpty(false)).toThrow();
    });
    it('returns falsy for non-empty string, array, object, 0, false (bool behaviour)', () => {
      expect(Checks.isEmpty('abc', undefined, undefined, undefined, undefined, 'bool')).toBeFalsy();
      expect(Checks.isEmpty([1], undefined, undefined, undefined, undefined, 'bool')).toBeFalsy();
      expect(Checks.isEmpty({ a: 1 }, undefined, undefined, undefined, undefined, 'bool')).toBeFalsy();
      expect(Checks.isEmpty(0, undefined, undefined, undefined, undefined, 'bool')).toBeFalsy();
      expect(Checks.isEmpty(false, undefined, undefined, undefined, undefined, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-empty string, array, object, 0, false (object behaviour)', () => {
      expect(Checks.isEmpty('abc', undefined, undefined, undefined, undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isEmpty([1], undefined, undefined, undefined, undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isEmpty({ a: 1 }, undefined, undefined, undefined, undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isEmpty(0, undefined, undefined, undefined, undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isEmpty(false, undefined, undefined, undefined, undefined, 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndNotEmpty', () => {
    it('throws for undefined, null, empty string/array/object (default behaviour)', () => {
      expect(() => Checks.isDefinedAndNotEmpty(undefined)).toThrow();
      expect(() => Checks.isDefinedAndNotEmpty(null)).toThrow();
      expect(() => Checks.isDefinedAndNotEmpty('')).toThrow();
      expect(() => Checks.isDefinedAndNotEmpty([])).toThrow();
      expect(() => Checks.isDefinedAndNotEmpty({})).toThrow();
    });
    it('returns falsy for undefined, null, empty string/array/object (bool behaviour)', () => {
      expect(Checks.isDefinedAndNotEmpty(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndNotEmpty(null, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndNotEmpty('', 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndNotEmpty([], 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndNotEmpty({}, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined, null, empty string/array/object (object behaviour)', () => {
      expect(Checks.isDefinedAndNotEmpty(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndNotEmpty(null, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndNotEmpty('', 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndNotEmpty([], 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndNotEmpty({}, 'object')).toMatchObject({ outcome: false });
    });

    it('returns truthy for non-empty string/array/object, 0, false', () => {
      expect(Checks.isDefinedAndNotEmpty('abc')).toBeTruthy();
      expect(Checks.isDefinedAndNotEmpty([1])).toBeTruthy();
      expect(Checks.isDefinedAndNotEmpty({ a: 1 })).toBeTruthy();
      expect(Checks.isDefinedAndNotEmpty(0)).toBeTruthy();
      expect(Checks.isDefinedAndNotEmpty(false)).toBeTruthy();
    });
  });

  // --- Type Checks ---
  describe('isString', () => {
    it('returns truthy for string', () => {
      expect(Checks.isString('abc')).toBeTruthy();
    });
    it('throws for non-string (default behaviour)', () => {
      expect(() => Checks.isString(123)).toThrow();
      expect(() => Checks.isString([])).toThrow();
    });
    it('returns falsy for non-string (bool behaviour)', () => {
      expect(Checks.isString(123, 'bool')).toBeFalsy();
      expect(Checks.isString([], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-string (object behaviour)', () => {
      expect(Checks.isString(123, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isString([], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isNumber', () => {
    it('returns truthy for number', () => {
      expect(Checks.isNumber(123)).toBeTruthy();
      expect(Checks.isNumber(0)).toBeTruthy();
    });
    it('throws for non-number (default behaviour)', () => {
      expect(() => Checks.isNumber('123')).toThrow();
      expect(() => Checks.isNumber([])).toThrow();
    });
    it('returns falsy for non-number (bool behaviour)', () => {
      expect(Checks.isNumber('123', 'bool')).toBeFalsy();
      expect(Checks.isNumber([], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-number (object behaviour)', () => {
      expect(Checks.isNumber('123', 'object')).toMatchObject({ outcome: false });
      expect(Checks.isNumber([], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isBoolean', () => {
    it('returns truthy for boolean', () => {
      expect(Checks.isBoolean(true)).toBeTruthy();
      expect(Checks.isBoolean(false)).toBeTruthy();
    });
    it('throws for non-boolean (default behaviour)', () => {
      expect(() => Checks.isBoolean(0)).toThrow();
      expect(() => Checks.isBoolean('true')).toThrow();
    });
    it('returns falsy for non-boolean (bool behaviour)', () => {
      expect(Checks.isBoolean(0, 'bool')).toBeFalsy();
      expect(Checks.isBoolean('true', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-boolean (object behaviour)', () => {
      expect(Checks.isBoolean(0, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isBoolean('true', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isArray', () => {
    it('returns truthy for array', () => {
      expect(Checks.isArray([])).toBeTruthy();
      expect(Checks.isArray([1, 2])).toBeTruthy();
    });
    it('throws for non-array (default behaviour)', () => {
      expect(() => Checks.isArray({})).toThrow();
      expect(() => Checks.isArray('[]')).toThrow();
    });
    it('returns falsy for non-array (bool behaviour)', () => {
      expect(Checks.isArray({}, 'bool')).toBeFalsy();
      expect(Checks.isArray('[]', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-array (object behaviour)', () => {
      expect(Checks.isArray({}, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isArray('[]', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isObject', () => {
    it('returns truthy for object', () => {
      expect(Checks.isObject({})).toBeTruthy();
      expect(Checks.isObject({ a: 1 })).toBeTruthy();
    });
    it('throws for non-object (default behaviour)', () => {
      expect(() => Checks.isObject([])).toThrow();
      expect(() => Checks.isObject('abc')).toThrow();
    });
    it('returns falsy for non-object (bool behaviour)', () => {
      expect(Checks.isObject([], 'bool')).toBeFalsy();
      expect(Checks.isObject('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-object (object behaviour)', () => {
      expect(Checks.isObject([], 'object')).toMatchObject({ outcome: false });
      expect(Checks.isObject('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isFunction', () => {
    it('returns truthy for function', () => {
      expect(Checks.isFunction(() => {})).toBeTruthy();
      function f() {}
      expect(Checks.isFunction(f)).toBeTruthy();
    });
    it('throws for non-function (default behaviour)', () => {
      expect(() => Checks.isFunction({})).toThrow();
      expect(() => Checks.isFunction('abc')).toThrow();
    });
    it('returns falsy for non-function (bool behaviour)', () => {
      expect(Checks.isFunction({}, 'bool')).toBeFalsy();
      expect(Checks.isFunction('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-function (object behaviour)', () => {
      expect(Checks.isFunction({}, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isFunction('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isSymbol', () => {
    it('returns truthy for symbol', () => {
      expect(Checks.isSymbol(Symbol('a'))).toBeTruthy();
    });
    it('throws for non-symbol (default behaviour)', () => {
      expect(() => Checks.isSymbol('abc')).toThrow();
      expect(() => Checks.isSymbol(123)).toThrow();
    });
    it('returns falsy for non-symbol (bool behaviour)', () => {
      expect(Checks.isSymbol('abc', 'bool')).toBeFalsy();
      expect(Checks.isSymbol(123, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for non-symbol (object behaviour)', () => {
      expect(Checks.isSymbol('abc', 'object')).toMatchObject({ outcome: false });
      expect(Checks.isSymbol(123, 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isValidType', () => {
    it('returns truthy if value matches expected type(s)', () => {
      expect(Checks.isValidType('abc', ['string'])).toBeTruthy();
      expect(Checks.isValidType(123, ['string', 'number'])).toBeTruthy();
    });
    it('throws if value does not match expected type(s) (default behaviour)', () => {
      expect(() => Checks.isValidType([], ['string', 'number'])).toThrow();
    });
    it('returns falsy if value does not match expected type(s) (bool behaviour)', () => {
      expect(Checks.isValidType([], ['string', 'number'], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if value does not match expected type(s) (object behaviour)', () => {
      expect(Checks.isValidType([], ['string', 'number'], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('returnsValidType', () => {
    it('returns truthy if function returns expected type', () => {
      expect(Checks.returnsValidType(() => 1, [], ['number'])).toBeTruthy();
      expect(Checks.returnsValidType(() => 'a', [], ['string', 'number'])).toBeTruthy();
    });
    it('throws if function does not return expected type (default behaviour)', () => {
      expect(() => Checks.returnsValidType(() => [], [], ['string', 'number'])).toThrow();
    });
    it('returns falsy if function does not return expected type (bool behaviour)', () => {
      expect(Checks.returnsValidType(() => [], [], ['string', 'number'], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if function does not return expected type (object behaviour)', () => {
      expect(Checks.returnsValidType(() => [], [], ['string', 'number'], 'object')).toMatchObject({ outcome: false });
    });
  });

  // --- Containment Checks ---
  describe('objectIncludes', () => {
    it('returns truthy if object includes all specified keys', () => {
      expect(Checks.objectIncludes({ a: 1, b: 2 }, ['a', 'b'])).toBeTruthy();
    });
    it('throws if object does not include all specified keys (default behaviour)', () => {
      expect(() => Checks.objectIncludes({ a: 1 }, ['a', 'b'])).toThrow();
    });
    it('returns falsy if object does not include all specified keys (bool behaviour)', () => {
      expect(Checks.objectIncludes({ a: 1 }, ['a', 'b'], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if object does not include all specified keys (object behaviour)', () => {
      expect(Checks.objectIncludes({ a: 1 }, ['a', 'b'], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('arrayIncludes', () => {
    it('returns truthy if array includes all specified values', () => {
      expect(Checks.arrayIncludes([1, 2, 3], [1, 2])).toBeTruthy();
    });
    it('throws if array does not include all specified values (default behaviour)', () => {
      expect(() => Checks.arrayIncludes([1, 2], [1, 3])).toThrow();
    });
    it('returns falsy if array does not include all specified values (bool behaviour)', () => {
      expect(Checks.arrayIncludes([1, 2], [1, 3], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if array does not include all specified values (object behaviour)', () => {
      expect(Checks.arrayIncludes([1, 2], [1, 3], 'object')).toMatchObject({ outcome: false });
    });
  });

  // --- Combined Checks ---
  describe('isDefinedAndIsString', () => {
    it('returns truthy for defined string', () => {
      expect(Checks.isDefinedAndIsString('abc')).toBeTruthy();
    });
    it('throws for undefined or non-string (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsString(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsString(123)).toThrow();
    });
    it('returns falsy for undefined or non-string (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsString(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsString(123, 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-string (object behaviour)', () => {
      expect(Checks.isDefinedAndIsString(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsString(123, 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsNumber', () => {
    it('returns truthy for defined number', () => {
      expect(Checks.isDefinedAndIsNumber(123)).toBeTruthy();
    });
    it('throws for undefined or non-number (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsNumber(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsNumber('abc')).toThrow();
    });
    it('returns falsy for undefined or non-number (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsNumber(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsNumber('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-number (object behaviour)', () => {
      expect(Checks.isDefinedAndIsNumber(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsNumber('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsBoolean', () => {
    it('returns truthy for defined boolean', () => {
      expect(Checks.isDefinedAndIsBoolean(true)).toBeTruthy();
    });
    it('throws for undefined or non-boolean (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsBoolean(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsBoolean('abc')).toThrow();
    });
    it('returns falsy for undefined or non-boolean (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsBoolean(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsBoolean('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-boolean (object behaviour)', () => {
      expect(Checks.isDefinedAndIsBoolean(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsBoolean('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsArray', () => {
    it('returns truthy for defined array', () => {
      expect(Checks.isDefinedAndIsArray([1])).toBeTruthy();
    });
    it('throws for undefined or non-array (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsArray(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsArray('abc')).toThrow();
    });
    it('returns falsy for undefined or non-array (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsArray(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsArray('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-array (object behaviour)', () => {
      expect(Checks.isDefinedAndIsArray(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsArray('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsObject', () => {
    it('returns truthy for defined object', () => {
      expect(Checks.isDefinedAndIsObject({})).toBeTruthy();
    });
    it('throws for undefined or non-object (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsObject(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsObject([])).toThrow();
    });
    it('returns falsy for undefined or non-object (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsObject(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsObject([],'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-object (object behaviour)', () => {
      expect(Checks.isDefinedAndIsObject(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsObject([], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsFunction', () => {
    it('returns truthy for defined function', () => {
      expect(Checks.isDefinedAndIsFunction(() => {})).toBeTruthy();
    });
    it('throws for undefined or non-function (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsFunction(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsFunction('abc')).toThrow();
    });
    it('returns falsy for undefined or non-function (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsFunction(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsFunction('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-function (object behaviour)', () => {
      expect(Checks.isDefinedAndIsFunction(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsFunction('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsSymbol', () => {
    it('returns truthy for defined symbol', () => {
      expect(Checks.isDefinedAndIsSymbol(Symbol('a'))).toBeTruthy();
    });
    it('throws for undefined or non-symbol (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsSymbol(undefined)).toThrow();
      expect(() => Checks.isDefinedAndIsSymbol('abc')).toThrow();
    });
    it('returns falsy for undefined or non-symbol (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsSymbol(undefined, 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsSymbol('abc', 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or non-symbol (object behaviour)', () => {
      expect(Checks.isDefinedAndIsSymbol(undefined, 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsSymbol('abc', 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsValidType', () => {
    it('returns truthy for defined value of valid type', () => {
      expect(Checks.isDefinedAndIsValidType('abc', ['string'])).toBeTruthy();
      expect(Checks.isDefinedAndIsValidType(123, ['string', 'number'])).toBeTruthy();
    });
    it('throws for undefined or invalid type (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsValidType(undefined, ['string'])).toThrow();
      expect(() => Checks.isDefinedAndIsValidType([], ['string', 'number'])).toThrow();
    });
    it('returns falsy for undefined or invalid type (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsValidType(undefined, ['string'], 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsValidType([], ['string', 'number'], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false for undefined or invalid type (object behaviour)', () => {
      expect(Checks.isDefinedAndIsValidType(undefined, ['string'], 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsValidType([], ['string', 'number'], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsArrayContaining', () => {
    it('returns truthy if array contains all items', () => {
      expect(Checks.isDefinedAndIsArrayContaining([1, 2, 3], [1, 2])).toBeTruthy();
    });
    it('throws if not array or missing items (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsArrayContaining(undefined, [1])).toThrow();
      expect(() => Checks.isDefinedAndIsArrayContaining([1, 2], [3])).toThrow();
    });
    it('returns falsy if not array or missing items (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsArrayContaining(undefined, [1], 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsArrayContaining([1, 2], [3], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if not array or missing items (object behaviour)', () => {
      expect(Checks.isDefinedAndIsArrayContaining(undefined, [1], 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsArrayContaining([1, 2], [3], 'object')).toMatchObject({ outcome: false });
    });
  });

  describe('isDefinedAndIsObjectContaining', () => {
    it('returns truthy if object contains all keys', () => {
      expect(Checks.isDefinedAndIsObjectContaining({ a: 1, b: 2 }, ['a'])).toBeTruthy();
    });
    it('throws if not object or missing keys (default behaviour)', () => {
      expect(() => Checks.isDefinedAndIsObjectContaining(undefined, ['a'])).toThrow();
      expect(() => Checks.isDefinedAndIsObjectContaining({ a: 1 }, ['b'])).toThrow();
    });
    it('returns falsy if not object or missing keys (bool behaviour)', () => {
      expect(Checks.isDefinedAndIsObjectContaining(undefined, ['a'], 'bool')).toBeFalsy();
      expect(Checks.isDefinedAndIsObjectContaining({ a: 1 }, ['b'], 'bool')).toBeFalsy();
    });
    it('returns object with outcome: false if not object or missing keys (object behaviour)', () => {
      expect(Checks.isDefinedAndIsObjectContaining(undefined, ['a'], 'object')).toMatchObject({ outcome: false });
      expect(Checks.isDefinedAndIsObjectContaining({ a: 1 }, ['b'], 'object')).toMatchObject({ outcome: false });
    });
  });
});