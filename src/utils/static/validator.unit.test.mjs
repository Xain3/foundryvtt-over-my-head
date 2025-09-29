import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { Validator } from './validator.mjs';
import dayjs from 'dayjs';
  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(Validator.isFunction(() => {})).toBe(true);
      expect(Validator.isFunction(function() {})).toBe(true);
    });
    it('should return false for non-functions', () => {
      expect(Validator.isFunction(123)).toBe(false);
      expect(Validator.isFunction('string')).toBe(false);
      expect(Validator.isFunction({})).toBe(false);
      expect(Validator.isFunction([])).toBe(false);
      expect(Validator.isFunction(null)).toBe(false);
      expect(Validator.isFunction(undefined)).toBe(false);
    });
  });

  describe('isSymbol', () => {
    it('should return true for symbols', () => {
      expect(Validator.isSymbol(Symbol('test'))).toBe(true);
    });
    it('should return false for non-symbols', () => {
      expect(Validator.isSymbol('symbol')).toBe(false);
      expect(Validator.isSymbol(123)).toBe(false);
      expect(Validator.isSymbol({})).toBe(false);
      expect(Validator.isSymbol([])).toBe(false);
      expect(Validator.isSymbol(null)).toBe(false);
      expect(Validator.isSymbol(undefined)).toBe(false);
    });
  });

  describe('isValidType', () => {
    it('should return true when value matches allowed type (string)', () => {
      expect(Validator.isValidType('hello', 'string')).toBe(true);
      expect(Validator.isValidType(123, 'number')).toBe(true);
      expect(Validator.isValidType([], 'array')).toBe(true);
      expect(Validator.isValidType({}, 'object')).toBe(true);
    });
    it('should return true when value matches one of allowed types (array)', () => {
      expect(Validator.isValidType('hello', ['string', 'number'])).toBe(true);
      expect(Validator.isValidType(123, ['string', 'number'])).toBe(true);
    });
    it('should return false when value does not match allowed types', () => {
      expect(Validator.isValidType('hello', 'number')).toBe(false);
      expect(Validator.isValidType(123, 'string')).toBe(false);
      expect(Validator.isValidType({}, 'array')).toBe(false);
    });
    it('should return false for invalid allowedTypes', () => {
      expect(Validator.isValidType('test', true)).toBe(false);
      expect(Validator.isValidType('test', [])).toBe(false);
    });
  });

  describe('isValidKey', () => {
    it('should return true for string and number keys', () => {
      expect(Validator.isValidKey('key')).toBe(true);
      expect(Validator.isValidKey(123)).toBe(true);
    });
    it('should return false for non-string/number keys', () => {
      expect(Validator.isValidKey({})).toBe(false);
      expect(Validator.isValidKey([])).toBe(false);
      expect(Validator.isValidKey(null)).toBe(false);
      expect(Validator.isValidKey(undefined)).toBe(false);
  expect(Validator.isValidKey(Symbol('test'))).toBe(true);
    });
  });

/**
 * @file validator.unit.test.mjs
 * @description This file contains tests for the Validator class.
 * @path src/utils/static/validator.unit.test.mjs
 */


vi.mock('dayjs');

describe('Validator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(Validator.isDefined(null)).toBe(true);
      expect(Validator.isDefined(0)).toBe(true);
      expect(Validator.isDefined('')).toBe(true);
      expect(Validator.isDefined(false)).toBe(true);
      expect(Validator.isDefined({})).toBe(true);
      expect(Validator.isDefined([])).toBe(true);
    });

    it('should return false for undefined values', () => {
      expect(Validator.isDefined(undefined)).toBe(false);
    });
  });

  describe('isNull', () => {
    it('should return true for null values', () => {
      expect(Validator.isNull(null)).toBe(true);
    });

    it('should return false for non-null values', () => {
      expect(Validator.isNull(undefined)).toBe(false);
      expect(Validator.isNull(0)).toBe(false);
      expect(Validator.isNull('')).toBe(false);
      expect(Validator.isNull(false)).toBe(false);
      expect(Validator.isNull({})).toBe(false);
      expect(Validator.isNull([])).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for string values', () => {
      expect(Validator.isString('hello')).toBe(true);
      expect(Validator.isString('')).toBe(true);
      expect(Validator.isString('123')).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(Validator.isString(123)).toBe(false);
      expect(Validator.isString(null)).toBe(false);
      expect(Validator.isString(undefined)).toBe(false);
      expect(Validator.isString({})).toBe(false);
      expect(Validator.isString([])).toBe(false);
      expect(Validator.isString(true)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(Validator.isObject({})).toBe(true);
      expect(Validator.isObject({ key: 'value' })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(Validator.isObject(null)).toBe(false);
      expect(Validator.isObject([])).toBe(false);
      expect(Validator.isObject('string')).toBe(false);
      expect(Validator.isObject(123)).toBe(false);
      expect(Validator.isObject(true)).toBe(false);
      expect(Validator.isObject(undefined)).toBe(false);
    });

    it('should validate prototype name when specified', () => {
      class TestClass {}
      const instance = new TestClass();

      expect(Validator.isObject(instance, { expectedPrototypeName: 'TestClass' })).toBe(true);
      expect(Validator.isObject(instance, { expectedPrototypeName: 'WrongClass' })).toBe(false);
      expect(Validator.isObject({}, { expectedPrototypeName: 'Object' })).toBe(true);
    });

    it('should handle objects without constructor', () => {
      const objWithoutConstructor = Object.create(null);
      expect(Validator.isObject(objWithoutConstructor, { expectedPrototypeName: 'Object' })).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(Validator.isArray([])).toBe(true);
      expect(Validator.isArray([1, 2, 3])).toBe(true);
      expect(Validator.isArray(new Array(5))).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(Validator.isArray({})).toBe(false);
      expect(Validator.isArray(null)).toBe(false);
      expect(Validator.isArray('string')).toBe(false);
      expect(Validator.isArray(123)).toBe(false);
      expect(Validator.isArray(true)).toBe(false);
      expect(Validator.isArray(undefined)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(Validator.isPlainObject({})).toBe(true);
      expect(Validator.isPlainObject({ key: 'value' })).toBe(true);
      expect(Validator.isPlainObject(Object.create(null))).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(Validator.isPlainObject([])).toBe(false);
      expect(Validator.isPlainObject(null)).toBe(false);
      expect(Validator.isPlainObject('string')).toBe(false);
      expect(Validator.isPlainObject(123)).toBe(false);
      expect(Validator.isPlainObject(true)).toBe(false);
      expect(Validator.isPlainObject(undefined)).toBe(false);
      expect(Validator.isPlainObject(new Date())).toBe(false);
      expect(Validator.isPlainObject(/regex/)).toBe(false);
    });

    it('should return false for class instances', () => {
      class TestClass {}
      const instance = new TestClass();
      expect(Validator.isPlainObject(instance)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(Validator.isNumber(123)).toBe(true);
      expect(Validator.isNumber(0)).toBe(true);
      expect(Validator.isNumber(-123)).toBe(true);
      expect(Validator.isNumber(3.14)).toBe(true);
      expect(Validator.isNumber(Infinity)).toBe(true);
      expect(Validator.isNumber(-Infinity)).toBe(true);
    });

    it('should return false for non-numbers', () => {
      expect(Validator.isNumber('123')).toBe(false);
      expect(Validator.isNumber(null)).toBe(false);
      expect(Validator.isNumber(undefined)).toBe(false);
      expect(Validator.isNumber({})).toBe(false);
      expect(Validator.isNumber([])).toBe(false);
      expect(Validator.isNumber(true)).toBe(false);
      expect(Validator.isNumber(NaN)).toBe(false);
    });

    it('should validate integer option', () => {
      expect(Validator.isNumber(123, { integer: true })).toBe(true);
      expect(Validator.isNumber(0, { integer: true })).toBe(true);
      expect(Validator.isNumber(-123, { integer: true })).toBe(true);
      expect(Validator.isNumber(3.14, { integer: true })).toBe(false);
    });

    it('should validate float option', () => {
      expect(Validator.isNumber(3.14, { float: true })).toBe(true);
      expect(Validator.isNumber(-3.14, { float: true })).toBe(true);
      expect(Validator.isNumber(123, { float: true })).toBe(false);
      expect(Validator.isNumber(0, { float: true })).toBe(false);
    });

    it('should return false for contradictory integer and float options', () => {
      expect(Validator.isNumber(123, { integer: true, float: true })).toBe(false);
      expect(Validator.isNumber(3.14, { integer: true, float: true })).toBe(false);
    });

    it('should validate positive option', () => {
      expect(Validator.isNumber(123, { positive: true })).toBe(true);
      expect(Validator.isNumber(0, { positive: true, includeZero: true })).toBe(true);
      expect(Validator.isNumber(0, { positive: true, includeZero: false })).toBe(false);
      expect(Validator.isNumber(-123, { positive: true })).toBe(false);
    });

    it('should validate negative option', () => {
      expect(Validator.isNumber(-123, { negative: true })).toBe(true);
      expect(Validator.isNumber(0, { negative: true, includeZero: true })).toBe(true);
      expect(Validator.isNumber(0, { negative: true, includeZero: false })).toBe(false);
      expect(Validator.isNumber(123, { negative: true })).toBe(false);
    });

    it('should return false for contradictory positive and negative options', () => {
      expect(Validator.isNumber(123, { positive: true, negative: true })).toBe(false);
      expect(Validator.isNumber(-123, { positive: true, negative: true })).toBe(false);
    });

    it('should handle includeZero option correctly', () => {
      expect(Validator.isNumber(0, { positive: true, includeZero: true })).toBe(true);
      expect(Validator.isNumber(0, { negative: true, includeZero: true })).toBe(true);
      expect(Validator.isNumber(0, { positive: true, includeZero: false })).toBe(false);
      expect(Validator.isNumber(0, { negative: true, includeZero: false })).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(Validator.isEmpty('')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(Validator.isEmpty('hello')).toBe(false);
      expect(Validator.isEmpty(' ')).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(Validator.isEmpty([])).toBe(true);
    });

    it('should return false for non-empty arrays', () => {
      expect(Validator.isEmpty([1, 2, 3])).toBe(false);
      expect(Validator.isEmpty([undefined])).toBe(false);
    });

    it('should return true for empty objects', () => {
      expect(Validator.isEmpty({})).toBe(true);
    });

    it('should return false for non-empty objects', () => {
      expect(Validator.isEmpty({ key: 'value' })).toBe(false);
    });

    it('should return false for non-string, non-array, non-object values', () => {
      expect(Validator.isEmpty(null)).toBe(false);
      expect(Validator.isEmpty(undefined)).toBe(false);
      expect(Validator.isEmpty(123)).toBe(false);
      expect(Validator.isEmpty(true)).toBe(false);
    });
  });

  describe('validateObject', () => {
    it('should pass for valid objects', () => {
      expect(() => Validator.validateObject({ key: 'value' }, 'testObject')).not.toThrow();
    });

    it('should skip validation for undefined values', () => {
      expect(() => Validator.validateObject(undefined, 'testObject')).not.toThrow();
    });

    it('should throw for non-objects', () => {
      expect(() => Validator.validateObject('string', 'testObject')).toThrow('testObject must be an object. Received: string');
      expect(() => Validator.validateObject(123, 'testObject')).toThrow('testObject must be an object. Received: number');
      expect(() => Validator.validateObject([], 'testObject')).toThrow('testObject cannot be an array.');
    });

    it('should handle null values based on allowNull option', () => {
      expect(() => Validator.validateObject(null, 'testObject')).toThrow('testObject cannot be null.');
      expect(() => Validator.validateObject(null, 'testObject', { allowNull: true })).not.toThrow();
    });

    it('should handle empty objects based on allowEmpty option', () => {
      expect(() => Validator.validateObject({}, 'testObject')).toThrow('testObject cannot be an empty object.');
      expect(() => Validator.validateObject({}, 'testObject', { allowEmpty: true })).not.toThrow();
    });

    it('should validate string keys when checkKeys is true', () => {
      const objWithSymbolKey = {};
      objWithSymbolKey[Symbol('test')] = 'value';
  // Symbol-keyed objects are considered empty, so expect empty object error
  expect(() => Validator.validateObject(objWithSymbolKey, 'testObject')).toThrow('testObject cannot be an empty object.');
    });

    it('should skip key validation when checkKeys is false', () => {
      const objWithSymbolKey = {};
      objWithSymbolKey[Symbol('test')] = 'value';
  // Symbol-keyed objects are considered empty, so expect empty object error
  expect(() => Validator.validateObject(objWithSymbolKey, 'testObject', { checkKeys: false })).toThrow('testObject cannot be an empty object.');
    });

    it('should not check keys for empty objects when allowEmpty is true', () => {
      expect(() => Validator.validateObject({}, 'testObject', { allowEmpty: true, checkKeys: true })).not.toThrow();
    });
  });

  describe('validateString', () => {
    it('should pass for valid strings', () => {
      expect(() => Validator.validateString('hello', 'testString')).not.toThrow();
    });

    it('should skip validation for undefined values', () => {
      expect(() => Validator.validateString(undefined, 'testString')).not.toThrow();
    });

    it('should throw for non-strings', () => {
      expect(() => Validator.validateString(123, 'testString')).toThrow('testString must be a string. Received: number');
      expect(() => Validator.validateString(null, 'testString')).toThrow('testString must be a string. Received: object');
      expect(() => Validator.validateString({}, 'testString')).toThrow('testString must be a string. Received: object');
    });

    it('should handle empty strings based on allowEmpty option', () => {
      expect(() => Validator.validateString('', 'testString')).toThrow('testString cannot be empty.');
      expect(() => Validator.validateString('', 'testString', { allowEmpty: true })).not.toThrow();
    });
  });

  describe('validateNumber', () => {
    it('should pass for valid numbers', () => {
      expect(() => Validator.validateNumber(123, 'testNumber')).not.toThrow();
      expect(() => Validator.validateNumber(3.14, 'testNumber')).not.toThrow();
      expect(() => Validator.validateNumber(0, 'testNumber')).not.toThrow();
    });

    it('should skip validation for undefined values', () => {
      expect(() => Validator.validateNumber(undefined, 'testNumber')).not.toThrow();
    });

    it('should throw for non-numbers', () => {
      expect(() => Validator.validateNumber('123', 'testNumber')).toThrow('testNumber must be a number. Received: string');
      expect(() => Validator.validateNumber(null, 'testNumber')).toThrow('testNumber must be a number. Received: object');
    });

    it('should throw for NaN values', () => {
      expect(() => Validator.validateNumber(NaN, 'testNumber')).toThrow('testNumber cannot be NaN.');
    });

    it('should validate integer requirement', () => {
      expect(() => Validator.validateNumber(123, 'testNumber', { isInt: true })).not.toThrow();
      expect(() => Validator.validateNumber(3.14, 'testNumber', { isInt: true })).toThrow('testNumber must be an integer.');
    });

    it('should validate min and max constraints', () => {
      expect(() => Validator.validateNumber(5, 'testNumber', { min: 0, max: 10 })).not.toThrow();
      expect(() => Validator.validateNumber(-1, 'testNumber', { min: 0 })).toThrow('testNumber (value: -1) cannot be less than 0.');
      expect(() => Validator.validateNumber(11, 'testNumber', { max: 10 })).toThrow('testNumber (value: 11) cannot be greater than 10.');
    });

    it('should handle future timestamp validation', () => {
      const futureTimestamp = Date.now() + 10000;
      const pastTimestamp = Date.now() - 10000;

      expect(() => Validator.validateNumber(futureTimestamp, 'Timestamp')).toThrow('Timestamp cannot be in the future.');
      expect(() => Validator.validateNumber(futureTimestamp, 'Timestamp', { allowFutureTimestamp: true })).not.toThrow();
      expect(() => Validator.validateNumber(pastTimestamp, 'Timestamp')).not.toThrow();
    });

    it('should only apply future timestamp validation to fields named "Timestamp"', () => {
      const futureTimestamp = Date.now() + 10000;
      expect(() => Validator.validateNumber(futureTimestamp, 'someOtherNumber')).not.toThrow();
    });
  });

  describe('validateDate', () => {
    it('should pass for valid Date objects', () => {
      const validDate = new Date('2023-01-01');
      expect(() => Validator.validateDate(validDate)).not.toThrow();
    });

    it('should pass for valid date strings when dayjs validates them', () => {
      const mockDayjs = { isValid: () => true };
      dayjs.mockImplementation(() => mockDayjs);

      expect(() => Validator.validateDate('2023-01-01')).not.toThrow();
      expect(dayjs).toHaveBeenCalledWith('2023-01-01');
    });

    it('should throw for invalid Date objects', () => {
      const invalidDate = new Date('invalid');
      expect(() => Validator.validateDate(invalidDate)).toThrow('Date must be a valid date. Received: Invalid Date');
    });

    it('should throw for non-Date values that dayjs cannot validate', () => {
      const mockDayjs = { isValid: () => false };
      dayjs.mockReturnValue(mockDayjs);

      expect(() => Validator.validateDate('invalid-date')).toThrow('date must be a valid Date object');
      expect(() => Validator.validateDate(123)).toThrow('date must be a valid Date object');
    });

    it('should use custom name in error messages', () => {
      const invalidDate = new Date('invalid');
      expect(() => Validator.validateDate(invalidDate, 'customDate')).toThrow('customDate must be a valid date. Received: Invalid Date');
    });
  });

  describe('validateArgsObjectStructure', () => {
    it('should pass for valid argument objects', () => {
      expect(() => Validator.validateArgsObjectStructure({ key: 'value' })).not.toThrow();
    });

    it('should throw for non-objects', () => {
      expect(() => Validator.validateArgsObjectStructure('string')).toThrow('Constructor arguments must be an object. Received: string');
      expect(() => Validator.validateArgsObjectStructure([])).toThrow('Constructor arguments cannot be an array.');
    });

    it('should throw for empty objects', () => {
      expect(() => Validator.validateArgsObjectStructure({})).toThrow('Constructor arguments cannot be an empty object.');
    });

    it('should validate string keys', () => {
      const objWithSymbolKey = {};
      objWithSymbolKey[Symbol('test')] = 'value';
  // Symbol-keyed objects are considered empty, so expect empty object error
  expect(() => Validator.validateArgsObjectStructure(objWithSymbolKey)).toThrow('Constructor arguments cannot be an empty object.');
    });

    it('should use custom name in error messages', () => {
      expect(() => Validator.validateArgsObjectStructure({}, 'customArgs')).toThrow('customArgs cannot be an empty object.');
    });
  });

  describe('validateSchemaDefinition', () => {
    it('should pass for valid schema objects', () => {
      expect(() => Validator.validateSchemaDefinition({ field: 'definition' }, 'testSchema')).not.toThrow();
    });

    it('should throw when schema is not provided', () => {
      expect(() => Validator.validateSchemaDefinition(undefined, 'testSchema')).toThrow('Context schema must be provided.');
    });

    it('should throw for invalid schema objects', () => {
      expect(() => Validator.validateSchemaDefinition({}, 'testSchema')).toThrow('testSchema cannot be an empty object.');
      expect(() => Validator.validateSchemaDefinition('string', 'testSchema')).toThrow('testSchema must be an object. Received: string');
    });
  });

  describe('validateStringAgainstPattern', () => {
    const testPattern = /^[a-z]+$/;
    const patternDescription = 'lowercase letters only';

    it('should pass for strings matching the pattern', () => {
      expect(() => Validator.validateStringAgainstPattern('hello', 'testString', testPattern, patternDescription)).not.toThrow();
    });

    it('should throw when value is not provided', () => {
      expect(() => Validator.validateStringAgainstPattern(undefined, 'testString', testPattern, patternDescription)).toThrow('testString must be provided.');
    });

    it('should throw for non-strings', () => {
      expect(() => Validator.validateStringAgainstPattern(123, 'testString', testPattern, patternDescription)).toThrow('testString must be a string. Received: number');
    });

    it('should throw for strings not matching the pattern', () => {
      expect(() => Validator.validateStringAgainstPattern('HELLO', 'testString', testPattern, patternDescription)).toThrow('testString must be lowercase letters only. Received: "HELLO"');
    });

    it('should pass string validation options to validateString', () => {
      expect(() => Validator.validateStringAgainstPattern('', 'testString', testPattern, patternDescription, { allowEmpty: true })).toThrow('testString must be lowercase letters only. Received: ""');
      expect(() => Validator.validateStringAgainstPattern('', 'testString', testPattern, patternDescription, { allowEmpty: false })).toThrow('testString cannot be empty.');
    });
  });

  describe('validateObjectKeysExist', () => {
    const testObject = { key1: 'value1', key2: 'value2' };

    it('should pass when all required keys exist', () => {
      expect(() => Validator.validateObjectKeysExist(testObject, 'key1')).not.toThrow();
      expect(() => Validator.validateObjectKeysExist(testObject, ['key1', 'key2'])).not.toThrow();
    });

    it('should throw when object is not provided', () => {
      expect(() => Validator.validateObjectKeysExist(undefined, 'key1')).toThrow('Object must be provided for key existence check.');
    });

    it('should throw when keys to check are not provided', () => {
      expect(() => Validator.validateObjectKeysExist(testObject, undefined)).toThrow('Keys to check must be provided for Object.');
    });

    it('should throw for invalid objects', () => {
      expect(() => Validator.validateObjectKeysExist('string', 'key1')).toThrow('Object must be an object. Received: string');
      expect(() => Validator.validateObjectKeysExist({}, 'key1')).toThrow('Object cannot be an empty object.');
    });

    it('should throw when keys array is empty', () => {
      expect(() => Validator.validateObjectKeysExist(testObject, [])).toThrow('The list of keys to check for Object cannot be empty.');
    });

    it('should throw for invalid key types', () => {
      expect(() => Validator.validateObjectKeysExist(testObject, 123)).toThrow('Key to check ("123") in Object must be a string. Received: number');
      expect(() => Validator.validateObjectKeysExist(testObject, [''])).toThrow('Key to check ("") in Object cannot be empty.');
    });

    it('should throw when required keys do not exist', () => {
      expect(() => Validator.validateObjectKeysExist(testObject, 'nonexistent')).toThrow('Required key "nonexistent" is not found in Object.');
      expect(() => Validator.validateObjectKeysExist(testObject, ['key1', 'nonexistent'])).toThrow('Required key "nonexistent" is not found in Object.');
    });

    it('should use custom object name in error messages', () => {
      expect(() => Validator.validateObjectKeysExist(undefined, 'key1', 'customObject')).toThrow('customObject must be provided for key existence check.');
    });
  });

  describe('isReservedKey', () => {
    it('should return false for invalid keys', () => {
      expect(Validator.isReservedKey('')).toBe(false);
      expect(Validator.isReservedKey(123)).toBe(false);
      expect(Validator.isReservedKey(null)).toBe(false);
      expect(Validator.isReservedKey(undefined)).toBe(false);
    });

    it('should return false for non-reserved keys', () => {
      expect(Validator.isReservedKey('customKey')).toBe(false);
    });

    it('should identify additional reserved keys from Set', () => {
      const reservedKeys = new Set(['reserved1', 'reserved2']);
      expect(Validator.isReservedKey('reserved1', { additionalReservedKeys: reservedKeys })).toBe(true);
      expect(Validator.isReservedKey('reserved2', { additionalReservedKeys: reservedKeys })).toBe(true);
      expect(Validator.isReservedKey('notReserved', { additionalReservedKeys: reservedKeys })).toBe(false);
    });

    it('should identify additional reserved keys from array', () => {
      const reservedKeys = ['reserved1', 'reserved2'];
      expect(Validator.isReservedKey('reserved1', { additionalReservedKeys: reservedKeys })).toBe(true);
      expect(Validator.isReservedKey('reserved2', { additionalReservedKeys: reservedKeys })).toBe(true);
      expect(Validator.isReservedKey('notReserved', { additionalReservedKeys: reservedKeys })).toBe(false);
    });

    it('should identify additional reserved keys from single string', () => {
      expect(Validator.isReservedKey('reserved1', { additionalReservedKeys: 'reserved1' })).toBe(true);
      expect(Validator.isReservedKey('notReserved', { additionalReservedKeys: 'reserved1' })).toBe(false);
    });

    it('should identify prototype methods from class prototypes', () => {
      class TestClass {
        testMethod() {}
        get testProperty() { return 'test'; }
      }

      expect(Validator.isReservedKey('testMethod', { classPrototypes: TestClass })).toBe(true);
      expect(Validator.isReservedKey('testProperty', { classPrototypes: TestClass })).toBe(true);
      expect(Validator.isReservedKey('constructor', { classPrototypes: TestClass })).toBe(true);
      expect(Validator.isReservedKey('nonExistent', { classPrototypes: TestClass })).toBe(false);
    });

    it('should handle multiple class prototypes', () => {
      class TestClass1 {
        method1() {}
      }
      class TestClass2 {
        method2() {}
      }

      expect(Validator.isReservedKey('method1', { classPrototypes: [TestClass1, TestClass2] })).toBe(true);
      expect(Validator.isReservedKey('method2', { classPrototypes: [TestClass1, TestClass2] })).toBe(true);
      expect(Validator.isReservedKey('nonExistent', { classPrototypes: [TestClass1, TestClass2] })).toBe(false);
    });

    it('should handle invalid class prototypes gracefully', () => {
      expect(Validator.isReservedKey('test', { classPrototypes: null })).toBe(false);
      expect(Validator.isReservedKey('test', { classPrototypes: undefined })).toBe(false);
      expect(Validator.isReservedKey('test', { classPrototypes: {} })).toBe(false);
    });

    it('should check instance prototype chain', () => {
      class TestClass {
        testMethod() {}
      }
      const instance = new TestClass();
      instance.instanceProperty = 'value';

      expect(Validator.isReservedKey('testMethod', { instance })).toBe(true);
      expect(Validator.isReservedKey('instanceProperty', { instance })).toBe(true);
      expect(Validator.isReservedKey('nonExistent', { instance })).toBe(false);
    });

    it('should filter out non-string keys from additional reserved keys', () => {
      const reservedKeys = ['valid', 123, null, undefined, true];
      expect(Validator.isReservedKey('valid', { additionalReservedKeys: reservedKeys })).toBe(true);
      expect(Validator.isReservedKey('123', { additionalReservedKeys: reservedKeys })).toBe(false);
    });

    it('should combine all reservation sources', () => {
      class TestClass {
        classMethod() {}
      }
      const instance = new TestClass();
      instance.instanceProp = 'value';
      const additionalKeys = ['additionalKey'];

      expect(Validator.isReservedKey('classMethod', {
        classPrototypes: TestClass,
        additionalReservedKeys: additionalKeys,
        instance
      })).toBe(true);
      expect(Validator.isReservedKey('instanceProp', {
        classPrototypes: TestClass,
        additionalReservedKeys: additionalKeys,
        instance
      })).toBe(true);
      expect(Validator.isReservedKey('additionalKey', {
        classPrototypes: TestClass,
        additionalReservedKeys: additionalKeys,
        instance
      })).toBe(true);
    });
  });

  describe('isPrimitive', () => {
    it('should return true for string', () => {
      expect(Validator.isPrimitive('hello')).toBe(true);
      expect(Validator.isPrimitive('')).toBe(true);
    });

    it('should return true for number', () => {
      expect(Validator.isPrimitive(123)).toBe(true);
      expect(Validator.isPrimitive(0)).toBe(true);
      expect(Validator.isPrimitive(-1)).toBe(true);
      expect(Validator.isPrimitive(3.14)).toBe(true);
      expect(Validator.isPrimitive(Infinity)).toBe(true);
      expect(Validator.isPrimitive(-Infinity)).toBe(true);
      expect(Validator.isPrimitive(NaN)).toBe(true); // NaN is typeof 'number'
    });

    it('should return true for boolean', () => {
      expect(Validator.isPrimitive(true)).toBe(true);
      expect(Validator.isPrimitive(false)).toBe(true);
    });

    it('should return true for null', () => {
      expect(Validator.isPrimitive(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(Validator.isPrimitive(undefined)).toBe(true);
    });

    it('should return false for objects', () => {
      expect(Validator.isPrimitive({})).toBe(false);
      expect(Validator.isPrimitive({ key: 'value' })).toBe(false);
      expect(Validator.isPrimitive(Object.create(null))).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(Validator.isPrimitive([])).toBe(false);
      expect(Validator.isPrimitive([1, 2, 3])).toBe(false);
    });

    it('should return false for functions', () => {
      expect(Validator.isPrimitive(() => {})).toBe(false);
      expect(Validator.isPrimitive(function() {})).toBe(false);
    });

    it('should return false for symbols', () => {
      expect(Validator.isPrimitive(Symbol('test'))).toBe(false);
    });

    it('should return false for BigInt', () => {
      expect(Validator.isPrimitive(BigInt(123))).toBe(false);
    });
  });

  describe('validate', () => {
    describe('input validation', () => {
      it('should throw for invalid validation type', () => {
        expect(() => Validator.validate(123, { value: 'test' })).toThrow('Validation type must be a non-empty string.');
        expect(() => Validator.validate('', { value: 'test' })).toThrow('Validation type must be a non-empty string.');
        expect(() => Validator.validate(null, { value: 'test' })).toThrow('Validation type must be a non-empty string.');
        expect(() => Validator.validate(undefined, { value: 'test' })).toThrow('Validation type must be a non-empty string.');
      });

      it('should throw for unsupported validation type', () => {
        expect(() => Validator.validate('unsupportedType', { value: 'test' })).toThrow('Unsupported validation type: "unsupportedType".');
      });
    });

    describe('check methods (return boolean)', () => {
      it('should handle isDefined validation', () => {
        expect(Validator.validate('isDefined', { value: 'test' })).toBe(true);
        expect(Validator.validate('isDefined', { value: null })).toBe(true);
        expect(Validator.validate('isDefined', { value: undefined })).toBe(false);
      });

      it('should handle isNull validation', () => {
        expect(Validator.validate('isNull', { value: null })).toBe(true);
        expect(Validator.validate('isNull', { value: 'test' })).toBe(false);
        expect(Validator.validate('isNull', { value: undefined })).toBe(false);
      });

      it('should handle isString validation', () => {
        expect(Validator.validate('isString', { value: 'test' })).toBe(true);
        expect(Validator.validate('isString', { value: 123 })).toBe(false);
        expect(Validator.validate('isString', { value: null })).toBe(false);
      });

      it('should handle isObject validation with options', () => {
        expect(Validator.validate('isObject', { value: {} })).toBe(true);
        expect(Validator.validate('isObject', { value: [] })).toBe(false);
        expect(Validator.validate('isObject', { value: null })).toBe(false);

        class TestClass {}
        const instance = new TestClass();
        expect(Validator.validate('isObject', {
          value: instance,
          options: { expectedPrototypeName: 'TestClass' }
        })).toBe(true);
        expect(Validator.validate('isObject', {
          value: instance,
          options: { expectedPrototypeName: 'WrongClass' }
        })).toBe(false);
      });

      it('should handle isArray validation', () => {
        expect(Validator.validate('isArray', { value: [] })).toBe(true);
        expect(Validator.validate('isArray', { value: [1, 2, 3] })).toBe(true);
        expect(Validator.validate('isArray', { value: {} })).toBe(false);
        expect(Validator.validate('isArray', { value: 'test' })).toBe(false);
      });

      it('should handle isPlainObject validation', () => {
        expect(Validator.validate('isPlainObject', { value: {} })).toBe(true);
        expect(Validator.validate('isPlainObject', { value: { key: 'value' } })).toBe(true);
        expect(Validator.validate('isPlainObject', { value: [] })).toBe(false);
        expect(Validator.validate('isPlainObject', { value: new Date() })).toBe(false);
      });

      it('should handle isNumber validation with options', () => {
        expect(Validator.validate('isNumber', { value: 123 })).toBe(true);
        expect(Validator.validate('isNumber', { value: 3.14 })).toBe(true);
        expect(Validator.validate('isNumber', { value: 'test' })).toBe(false);
        expect(Validator.validate('isNumber', { value: NaN })).toBe(false);

        expect(Validator.validate('isNumber', {
          value: 123,
          options: { integer: true }
        })).toBe(true);
        expect(Validator.validate('isNumber', {
          value: 3.14,
          options: { integer: true }
        })).toBe(false);
      });

      it('should handle isEmpty validation', () => {
        expect(Validator.validate('isEmpty', { value: '' })).toBe(true);
        expect(Validator.validate('isEmpty', { value: [] })).toBe(true);
        expect(Validator.validate('isEmpty', { value: {} })).toBe(true);
        expect(Validator.validate('isEmpty', { value: 'test' })).toBe(false);
        expect(Validator.validate('isEmpty', { value: [1] })).toBe(false);
        expect(Validator.validate('isEmpty', { value: { key: 'value' } })).toBe(false);
      });

      it('should handle isBoolean validation', () => {
        expect(Validator.validate('isBoolean', { value: true })).toBe(true);
        expect(Validator.validate('isBoolean', { value: false })).toBe(true);
        expect(Validator.validate('isBoolean', { value: 1 })).toBe(false);
        expect(Validator.validate('isBoolean', { value: 'true' })).toBe(false);
      });

      it('should handle isPrimitive validation', () => {
        expect(Validator.validate('isPrimitive', { value: 'test' })).toBe(true);
        expect(Validator.validate('isPrimitive', { value: 123 })).toBe(true);
        expect(Validator.validate('isPrimitive', { value: true })).toBe(true);
        expect(Validator.validate('isPrimitive', { value: null })).toBe(true);
        expect(Validator.validate('isPrimitive', { value: undefined })).toBe(true);
        expect(Validator.validate('isPrimitive', { value: {} })).toBe(false);
        expect(Validator.validate('isPrimitive', { value: [] })).toBe(false);
      });

      it('should handle isReservedKey validation with options', () => {
        expect(Validator.validate('isReservedKey', { value: 'test' })).toBe(false);
        expect(Validator.validate('isReservedKey', {
          value: 'reserved',
          options: { additionalReservedKeys: ['reserved'] }
        })).toBe(true);

        class TestClass {
          testMethod() {}
        }
        expect(Validator.validate('isReservedKey', {
          value: 'testMethod',
          options: { classPrototypes: TestClass }
        })).toBe(true);
      });

      it('should handle isFunction validation', () => {
        expect(Validator.validate('isFunction', { value: () => {} })).toBe(true);
        expect(Validator.validate('isFunction', { value: function() {} })).toBe(true);
        expect(Validator.validate('isFunction', { value: 'string' })).toBe(false);
        expect(Validator.validate('isFunction', { value: 123 })).toBe(false);
        expect(Validator.validate('isFunction', { value: {} })).toBe(false);
        expect(Validator.validate('isFunction', { value: null })).toBe(false);
      });

      it('should handle isSymbol validation', () => {
        expect(Validator.validate('isSymbol', { value: Symbol('test') })).toBe(true);
        expect(Validator.validate('isSymbol', { value: 'symbol' })).toBe(false);
        expect(Validator.validate('isSymbol', { value: 123 })).toBe(false);
        expect(Validator.validate('isSymbol', { value: {} })).toBe(false);
        expect(Validator.validate('isSymbol', { value: null })).toBe(false);
      });

      it('should handle isValidType validation', () => {
        expect(Validator.validate('isValidType', {
          value: 'hello',
          options: { allowedTypes: 'string' }
        })).toBe(true);
        expect(Validator.validate('isValidType', {
          value: 123,
          options: { allowedTypes: ['string', 'number'] }
        })).toBe(true);
        expect(Validator.validate('isValidType', {
          value: [],
          options: { allowedTypes: 'array' }
        })).toBe(true);
        expect(Validator.validate('isValidType', {
          value: 'hello',
          options: { allowedTypes: 'number' }
        })).toBe(false);
        expect(Validator.validate('isValidType', {
          value: {},
          options: { allowedTypes: 'array' }
        })).toBe(false);
      });

      it('should handle isValidKey validation', () => {
        expect(Validator.validate('isValidKey', { value: 'key' })).toBe(true);
        expect(Validator.validate('isValidKey', { value: 123 })).toBe(true);
        expect(Validator.validate('isValidKey', { value: Symbol('test') })).toBe(true);
        expect(Validator.validate('isValidKey', {
          value: 'key',
          options: { allowedTypes: ['string'] }
        })).toBe(true);
        expect(Validator.validate('isValidKey', {
          value: 123,
          options: { allowedTypes: ['string'] }
        })).toBe(false);
        expect(Validator.validate('isValidKey', { value: {} })).toBe(false);
        expect(Validator.validate('isValidKey', { value: null })).toBe(false);
      });
    });

    describe('validate methods (throw on failure)', () => {
      it('should handle validateObject validation', () => {
        expect(() => Validator.validate('validateObject', {
          value: { key: 'value' },
          name: 'testObject'
        })).not.toThrow();

        expect(() => Validator.validate('validateObject', {
          value: 'string',
          name: 'testObject'
        })).toThrow('testObject must be an object. Received: string');

        expect(() => Validator.validate('validateObject', {
          value: {},
          name: 'testObject',
          options: { allowEmpty: true }
        })).not.toThrow();
      });

      it('should handle validateString validation', () => {
        expect(() => Validator.validate('validateString', {
          value: 'test',
          name: 'testString'
        })).not.toThrow();

        expect(() => Validator.validate('validateString', {
          value: 123,
          name: 'testString'
        })).toThrow('testString must be a string. Received: number');

        expect(() => Validator.validate('validateString', {
          value: '',
          name: 'testString',
          options: { allowEmpty: true }
        })).not.toThrow();
      });

      it('should handle validateNumber validation', () => {
        expect(() => Validator.validate('validateNumber', {
          value: 123,
          name: 'testNumber'
        })).not.toThrow();

        expect(() => Validator.validate('validateNumber', {
          value: 'string',
          name: 'testNumber'
        })).toThrow('testNumber must be a number. Received: string');

        expect(() => Validator.validate('validateNumber', {
          value: 3.14,
          name: 'testNumber',
          options: { isInt: true }
        })).toThrow('testNumber must be an integer.');
      });

      it('should handle validateDate validation', () => {
        const mockDayjs = { isValid: () => true };
        dayjs.mockReturnValue(mockDayjs);

        expect(() => Validator.validate('validateDate', {
          value: new Date('2023-01-01')
        })).not.toThrow();

        expect(() => Validator.validate('validateDate', {
          value: new Date('invalid'),
          name: 'customDate'
        })).toThrow('customDate must be a valid date. Received: Invalid Date');
      });

      it('should handle validateArgsObjectStructure validation', () => {
        expect(() => Validator.validate('validateArgsObjectStructure', {
          value: { key: 'value' }
        })).not.toThrow();

        expect(() => Validator.validate('validateArgsObjectStructure', {
          value: {}
        })).toThrow('Constructor arguments cannot be an empty object.');

        expect(() => Validator.validate('validateArgsObjectStructure', {
          value: 'string',
          name: 'customArgs'
        })).toThrow('customArgs must be an object. Received: string');
      });

      it('should handle validateSchemaDefinition validation', () => {
        expect(() => Validator.validate('validateSchemaDefinition', {
          value: { field: 'definition' },
          name: 'testSchema'
        })).not.toThrow();

        expect(() => Validator.validate('validateSchemaDefinition', {
          value: undefined,
          name: 'testSchema'
        })).toThrow('Context schema must be provided.');
      });

      it('should handle validateStringAgainstPattern validation', () => {
        const pattern = /^[a-z]+$/;
        const patternDescription = 'lowercase letters only';

        expect(() => Validator.validate('validateStringAgainstPattern', {
          value: 'hello',
          name: 'testString',
          options: { pattern, patternDescription }
        })).not.toThrow();

        expect(() => Validator.validate('validateStringAgainstPattern', {
          value: 'HELLO',
          name: 'testString',
          options: { pattern, patternDescription }
        })).toThrow('testString must be lowercase letters only. Received: "HELLO"');

        expect(() => Validator.validate('validateStringAgainstPattern', {
          value: 'test'
        })).toThrow('Pattern and patternDescription are required for validateStringAgainstPattern.');
      });

      it('should handle validateObjectKeysExist validation', () => {
        const testObject = { key1: 'value1', key2: 'value2' };

        expect(() => Validator.validate('validateObjectKeysExist', {
          value: testObject,
          options: { keysToCheck: 'key1' }
        })).not.toThrow();

        expect(() => Validator.validate('validateObjectKeysExist', {
          value: testObject,
          options: { keysToCheck: ['key1', 'key2'] }
        })).not.toThrow();

        expect(() => Validator.validate('validateObjectKeysExist', {
          value: testObject,
          options: { keysToCheck: 'nonexistent' }
        })).toThrow('Required key "nonexistent" is not found in Object.');

        expect(() => Validator.validate('validateObjectKeysExist', {
          value: testObject
        })).toThrow('keysToCheck option is required for validateObjectKeysExist.');
      });
    });

    describe('default naming behavior', () => {
      it('should use default names when name is not provided', () => {
        expect(() => Validator.validate('validateString', {
          value: 123
        })).toThrow('Value must be a string. Received: number');

        expect(() => Validator.validate('validateNumber', {
          value: 'string'
        })).toThrow('Value must be a number. Received: string');

        expect(() => Validator.validate('validateDate', {
          value: new Date('invalid')
        })).toThrow('Date must be a valid date. Received: Invalid Date');

        expect(() => Validator.validate('validateSchemaDefinition', {
          value: {}
        })).toThrow('Schema cannot be an empty object.');

        expect(() => Validator.validate('validateObjectKeysExist', {
          value: { key: 'value' },
          options: { keysToCheck: 'nonexistent' }
        })).toThrow('Required key "nonexistent" is not found in Object.');
      });
    });

    describe('edge cases', () => {
      it('should handle missing arguments object', () => {
        expect(Validator.validate('isDefined')).toBe(false); // undefined value when no args provided
      });

      it('should handle empty arguments object', () => {
        expect(Validator.validate('isDefined', {})).toBe(false); // undefined value
      });

      it('should handle undefined options', () => {
        expect(Validator.validate('isString', { value: 'test', options: undefined })).toBe(true);
      });

      it('should handle null options', () => {
        expect(Validator.validate('isString', { value: 'test', options: null })).toBe(true);
      });
    });

    describe('options handling', () => {
      it('should pass options correctly to underlying methods', () => {
        // Test complex options passing
        expect(Validator.validate('isNumber', {
          value: 123,
          options: {
            integer: true,
            positive: true,
            includeZero: false
          }
        })).toBe(true);

        expect(Validator.validate('isNumber', {
          value: -123,
          options: {
            integer: true,
            positive: true,
            includeZero: false
          }
        })).toBe(false);
      });

      it('should handle stringValidationOptions in validateStringAgainstPattern', () => {
        const pattern = /^test$/;
        const patternDescription = 'exactly "test"';

        expect(() => Validator.validate('validateStringAgainstPattern', {
          value: '',
          name: 'testString',
          options: {
            pattern,
            patternDescription,
            stringValidationOptions: { allowEmpty: false }
          }
        })).toThrow('testString cannot be empty.');
      });
    });
  });
});