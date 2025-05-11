import TypeChecks, {GenericTypeChecks} from './typeChecks';

describe('TypeChecks', () => {
  describe('isString', () => {
    it('returns true for string', () => {
      expect(TypeChecks.isString('hello')).toBe(true);
    });
    it('returns false for non-string', () => {
      expect(TypeChecks.isString(123)).toBe(false);
      expect(TypeChecks.isString({})).toBe(false);
      expect(TypeChecks.isString([])).toBe(false);
      expect(TypeChecks.isString(null)).toBe(false);
      expect(TypeChecks.isString(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('returns true for numbers', () => {
      expect(TypeChecks.isNumber(0)).toBe(true);
      expect(TypeChecks.isNumber(123.45)).toBe(true);
      expect(TypeChecks.isNumber(-1)).toBe(true);
    });
    it('returns false for NaN', () => {
      expect(TypeChecks.isNumber(NaN)).toBe(false);
    });
    it('returns false for non-numbers', () => {
      expect(TypeChecks.isNumber('123')).toBe(false);
      expect(TypeChecks.isNumber([])).toBe(false);
      expect(TypeChecks.isNumber({})).toBe(false);
      expect(TypeChecks.isNumber(null)).toBe(false);
      expect(TypeChecks.isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('returns true for booleans', () => {
      expect(TypeChecks.isBoolean(true)).toBe(true);
      expect(TypeChecks.isBoolean(false)).toBe(true);
    });
    it('returns false for non-booleans', () => {
      expect(TypeChecks.isBoolean(0)).toBe(false);
      expect(TypeChecks.isBoolean('true')).toBe(false);
      expect(TypeChecks.isBoolean(null)).toBe(false);
      expect(TypeChecks.isBoolean(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('returns true for arrays', () => {
      expect(TypeChecks.isArray([])).toBe(true);
      expect(TypeChecks.isArray([1, 2, 3])).toBe(true);
    });
    it('returns false for non-arrays', () => {
      expect(TypeChecks.isArray({})).toBe(false);
      expect(TypeChecks.isArray('[]')).toBe(false);
      expect(TypeChecks.isArray(null)).toBe(false);
      expect(TypeChecks.isArray(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('returns true for plain objects', () => {
      expect(TypeChecks.isObject({})).toBe(true);
      expect(TypeChecks.isObject({ a: 1 })).toBe(true);
    });
    it('returns false for arrays', () => {
      expect(TypeChecks.isObject([])).toBe(false);
    });
    it('returns false for null', () => {
      expect(TypeChecks.isObject(null)).toBe(false);
    });
    it('returns false for non-objects', () => {
      expect(TypeChecks.isObject('object')).toBe(false);
      expect(TypeChecks.isObject(123)).toBe(false);
      expect(TypeChecks.isObject(undefined)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('returns true for functions', () => {
      expect(TypeChecks.isFunction(function() {})).toBe(true);
      expect(TypeChecks.isFunction(() => {})).toBe(true);
      class MyClass {}
      expect(TypeChecks.isFunction(MyClass)).toBe(true);
    });
    it('returns false for non-functions', () => {
      expect(TypeChecks.isFunction({})).toBe(false);
      expect(TypeChecks.isFunction('function')).toBe(false);
      expect(TypeChecks.isFunction(123)).toBe(false);
      expect(TypeChecks.isFunction(undefined)).toBe(false);
    });
  });

  describe('isSymbol', () => {
    it('returns true for symbols', () => {
      expect(TypeChecks.isSymbol(Symbol('foo'))).toBe(true);
    });
    it('returns false for non-symbols', () => {
      expect(TypeChecks.isSymbol('symbol')).toBe(false);
      expect(TypeChecks.isSymbol(123)).toBe(false);
      expect(TypeChecks.isSymbol({})).toBe(false);
      expect(TypeChecks.isSymbol(undefined)).toBe(false);
    });
  });

  describe('isValidType', () => {
    it('validates string type', () => {
      const result = TypeChecks.isValidType('abc', 'string');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates number type', () => {
      const result = TypeChecks.isValidType(123, 'number');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates boolean type', () => {
      const result = TypeChecks.isValidType(true, 'boolean');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates array type', () => {
      const result = TypeChecks.isValidType([1, 2], 'array');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates object type', () => {
      const result = TypeChecks.isValidType({ a: 1 }, 'object');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates function type', () => {
      const result = TypeChecks.isValidType(() => {}, 'function');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates symbol type', () => {
      const result = TypeChecks.isValidType(Symbol('foo'), 'symbol');
      expect(result.overallIsValid).toBe(true);
    });
    it('validates instance of class', () => {
      class MyClass {}
      const result = TypeChecks.isValidType(new MyClass(), MyClass);
      expect(result.overallIsValid).toBe(true);
    });
    it('validates multiple types with "or" logic', () => {
      expect(TypeChecks.isValidType('abc', ['string', 'number']).overallIsValid).toBe(true);
      expect(TypeChecks.isValidType(123, ['string', 'number']).overallIsValid).toBe(true);
      expect(TypeChecks.isValidType(true, ['string', 'number']).overallIsValid).toBe(false);
    });
    it('validates multiple types with "and" logic', () => {
      // Only objects that are also arrays (which is never true)
      expect(TypeChecks.isValidType([], ['object', 'array'], undefined, undefined, 'and').overallIsValid).toBe(false);
      // Only objects that are not arrays
      expect(TypeChecks.isValidType({}, ['object'], undefined, undefined, 'and').overallIsValid).toBe(true);
    });
    it('throws a configuration error for invalid expectedTypes', () => {
      expect(() => TypeChecks.isValidType('abc', undefined)).toThrow();
      expect(() => TypeChecks.isValidType('abc', 123)).toThrow();
      expect(() => TypeChecks.isValidType('abc', [])).toThrow();
      expect(() => TypeChecks.isValidType('abc', 'notatype')).toThrow();
    });
  });

  describe('returnsValidType', () => {
    it('returns true if function returns expected type', () => {
      const fn = (a, b) => a + b;
      expect(TypeChecks.returnsValidType(fn, [1, 2], 'number')).toBe(true);
    });
    it('returns false if function returns wrong type', () => {
      const fn = () => 'hello';
      expect(TypeChecks.returnsValidType(fn, [], 'number')).toBe(false);
    });
    it('returns false if not a function', () => {
      expect(TypeChecks.returnsValidType(123, [], 'number')).toBe(false);
    });
    it('works with multiple expected types', () => {
      const fn = () => 42;
      expect(TypeChecks.returnsValidType(fn, [], ['string', 'number'])).toBe(true);
    });
    it('works with "and" logic', () => {
      const fn = () => [];
      expect(TypeChecks.returnsValidType(fn, [], ['array', 'object'], 'and')).toBe(false);
    });
  });
});

describe('GenericTypeChecks', () => {
  describe('isValidType', () => {
    it('validates string type', () => {
      const result = GenericTypeChecks.isValidType('abc', 'string');
      expect(result.overallIsValid).toBe(true);
      expect(result.finalTypeErrorMessage).toBe('must be a string');
    });

    it('invalidates non-string type', () => {
      const result = GenericTypeChecks.isValidType(123, 'string');
      expect(result.overallIsValid).toBe(false);
      expect(result.finalTypeErrorMessage).toBe('must be a string');
    });

    it('validates number type', () => {
      const result = GenericTypeChecks.isValidType(123, 'number');
      expect(result.overallIsValid).toBe(true);
      expect(result.finalTypeErrorMessage).toBe('must be a number');
    });

    it('invalidates NaN as number', () => {
      const result = GenericTypeChecks.isValidType(NaN, 'number');
      expect(result.overallIsValid).toBe(false);
      expect(result.finalTypeErrorMessage).toBe('must be a number');
    });

    it('validates boolean type', () => {
      expect(GenericTypeChecks.isValidType(true, 'boolean').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType(false, 'boolean').overallIsValid).toBe(true);
    });

    it('validates array type', () => {
      expect(GenericTypeChecks.isValidType([], 'array').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType([1, 2], 'array').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType({}, 'array').overallIsValid).toBe(false);
    });

    it('validates object type', () => {
      expect(GenericTypeChecks.isValidType({}, 'object').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType({ a: 1 }, 'object').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType([], 'object').overallIsValid).toBe(false);
      expect(GenericTypeChecks.isValidType(null, 'object').overallIsValid).toBe(false);
    });

    it('validates function type', () => {
      expect(GenericTypeChecks.isValidType(() => {}, 'function').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType(function() {}, 'function').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType({}, 'function').overallIsValid).toBe(false);
    });

    it('validates symbol type', () => {
      expect(GenericTypeChecks.isValidType(Symbol('s'), 'symbol').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType('s', 'symbol').overallIsValid).toBe(false);
    });

    it('validates defined type', () => {
      expect(GenericTypeChecks.isValidType('abc', 'defined').overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType(undefined, 'defined').overallIsValid).toBe(false);
      expect(GenericTypeChecks.isValidType(null, 'defined').overallIsValid).toBe(false);
    });

    it('validates instance of class', () => {
      class MyClass {}
      const instance = new MyClass();
      expect(GenericTypeChecks.isValidType(instance, MyClass).overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType({}, MyClass).overallIsValid).toBe(false);
    });

    it('validates multiple types with OR logic (default)', () => {
      expect(GenericTypeChecks.isValidType('abc', ['string', 'number']).overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType(123, ['string', 'number']).overallIsValid).toBe(true);
      expect(GenericTypeChecks.isValidType(true, ['string', 'number']).overallIsValid).toBe(false);
    });

    it('validates multiple types with AND logic', () => {
      class MyClass {}
      const instance = new MyClass();
      // instance is object and instance of MyClass
      expect(GenericTypeChecks.isValidType(instance, ['object', MyClass], undefined, undefined, 'and').overallIsValid).toBe(true);
      // {} is object but not MyClass
      expect(GenericTypeChecks.isValidType({}, ['object', MyClass], undefined, undefined, 'and').overallIsValid).toBe(false);
    });

    it('throws error for unsupported type string', () => {
      expect(() => {
      GenericTypeChecks.isValidType('abc', 'notatype');
      }).toThrow(/Unsupported expectedType string/);
    });

    it('throws error for invalid expectedType parameter', () => {
      expect(() => {
      GenericTypeChecks.isValidType('abc', 12345);
      }).toThrow(/Invalid expectedType parameter/);
    });

    it('throws error for empty expectedTypes array', () => {
      expect(() => {
      GenericTypeChecks.isValidType('abc', []);
      }).toThrow(/must not be empty/);
    });

    it('throws error for undefined expectedTypes', () => {
      expect(() => {
      GenericTypeChecks.isValidType('abc', undefined);
      }).toThrow(/cannot be undefined or null/);
    });

    it('includes valueName and value in result', () => {
      const result = GenericTypeChecks.isValidType('abc', 'string', 'myVar');
      expect(result.valueName).toBe('myVar');
      expect(result.value).toBe('abc');
    });

    it('passes options and behaviour through', () => {
      const result = GenericTypeChecks.isValidType('abc', 'string', 'myVar', 'throw', 'or', { custom: true });
      expect(result.behaviour).toBe('throw');
      expect(result.options).toEqual(expect.objectContaining({ custom: true }));
    });
  });
});
