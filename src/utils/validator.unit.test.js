import Validator from './validator';

describe('Validator', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator('Prefix: ');
    });

    describe('isDefined', () => {
        it('should return valid true when value is defined', () => {
            const result = validator.isDefined(123, 'Number');
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is undefined', () => {
            const result = validator.isDefined(undefined, 'Test');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Test is not defined');
        });

        it('should return valid false with error message when value is null', () => {
            const result = validator.isDefined(null, 'Value');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not defined');
        });
    });

    describe('isString', () => {
        it('should return valid true when value is a string', () => {
            const result = validator.isString('hello', 'Greeting');
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not a string', () => {
            const result = validator.isString(123, 'Greeting');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Greeting is not a string');
        });
    });

    describe('isNumber', () => {
        it('should return valid true when value is a number', () => {
            const result = validator.isNumber(123);
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not a number', () => {
            const result = validator.isNumber('123');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not a number');
        });
    });

    describe('isBoolean', () => {
        it('should return valid true when value is a boolean', () => {
            const result = validator.isBoolean(true);
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not a boolean', () => {
            const result = validator.isBoolean('true');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not a boolean');
        });
    });

    describe('isArray', () => {
        it('should return valid true when value is an array', () => {
            const result = validator.isArray([1, 2, 3]);
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not an array', () => {
            const result = validator.isArray({ key: 'value' });
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not an array');
        });
    });

    describe('isObject', () => {
        it('should return valid true when value is an object', () => {
            const result = validator.isObject({ key: 'value' });
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not an object', () => {
            const result = validator.isObject('not an object');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not an object');
        });
    });

    describe('isFunction', () => {
        it('should return valid true when value is a function', () => {
            const result = validator.isFunction(() => {});
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not a function', () => {
            const result = validator.isFunction(123);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not a function');
        });
    });

    describe('isSymbol', () => {
        it('should return valid true when value is a symbol', () => {
            const sym = Symbol('test');
            const result = validator.isSymbol(sym);
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when value is not a symbol', () => {
            const result = validator.isSymbol('symbol');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Value is not a symbol');
        });
    });

    describe('isValidType', () => {
        it('should return valid true when value matches one of the allowed types (array input)', () => {
            const result = validator.isValidType('hello', ['string', 'number'], 'Greeting');
            expect(result.valid).toBe(true);
        });

        it('should return valid true when allowedTypes is provided as string (intended as single type)', () => {
            const result = validator.isValidType(123, 'number', 'Number');
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when allowedTypes is not one of string, number, array, object', () => {
            const result = validator.isValidType('test', true, 'Test');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Error: validTypes must be a string, number, array, or object');
        });

        it('should return valid false with error message when no allowed types are provided', () => {
            const result = validator.isValidType('test', [], 'Test');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('No valid types provided for validation of Test');
        });

        it('should return valid false with error message if value type is not in allowedTypes', () => {
            const result = validator.isValidType(123, ['string'], 'Number');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Number is not a valid type');
        });
    });

    describe('isVakidKey', () => {
        it('should return valid true when key is of allowed type', () => {
            const result = validator.isVakidKey('key');
            expect(result.valid).toBe(true);
        });

        it('should return valid true when key is a number', () => {
            const result = validator.isVakidKey(123);
            expect(result.valid).toBe(true);
        });

        it('should return valid false with error message when key is not of an allowed type', () => {
            const result = validator.isVakidKey({ key: 'value' });
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Key is not a valid type');
        });
    });
});