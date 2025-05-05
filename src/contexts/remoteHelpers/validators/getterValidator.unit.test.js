import GetterValidator, { VALID_BEHAVIOURS } from './getterValidator';

describe('GetterValidator', () => {
	describe('validateTimestampFlags', () => {
		it('returns true for valid booleans', () => {
			expect(GetterValidator.validateTimestampFlags(true, false)).toBe(true);
		});
		it('throws error if timestampModified is not boolean', () => {
			expect(() => GetterValidator.validateTimestampFlags('yes', true)).toThrow(/Invalid timestampModified/);
		});
		it('returns false and warns if timestampModified is not boolean and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateTimestampFlags('yes', true, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid timestampModified'));
			spy.mockRestore();
		});
		it('throws error if timestampRetrieved is not boolean', () => {
			expect(() => GetterValidator.validateTimestampFlags(true, 'no')).toThrow(/Invalid timestampRetrieved/);
		});
		it('returns false and warns if timestampRetrieved is not boolean and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateTimestampFlags(true, 'no', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid timestampRetrieved'));
			spy.mockRestore();
		});
	});

	describe('validateKey', () => {
		it('returns true for valid key', () => {
			expect(GetterValidator.validateKey('abc')).toBe(true);
		});
		it('throws error if key is null', () => {
			expect(() => GetterValidator.validateKey(null)).toThrow(/Key must be provided/);
		});
		it('returns false and warns if key is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateKey(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must be provided'));
			spy.mockRestore();
		});
		it('throws error if key is not string', () => {
			expect(() => GetterValidator.validateKey(123)).toThrow(/Key must be a valid string/);
		});
		it('returns false and warns if key is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateKey(123, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must be a valid string'));
			spy.mockRestore();
		});
		it('throws error if key is empty string', () => {
			expect(() => GetterValidator.validateKey('')).toThrow(/Key must not be an empty string/);
		});
		it('returns false and warns if key is empty string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateKey('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must not be an empty string'));
			spy.mockRestore();
		});
	});

	describe('validateLocation', () => {
		it('returns true for valid location', () => {
			expect(GetterValidator.validateLocation('here')).toBe(true);
		});
		it('throws error if location is falsy', () => {
			expect(() => GetterValidator.validateLocation('')).toThrow(/Location string must be provided/);
		});
		it('returns false and warns if location is falsy and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateLocation('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Location string must be provided'));
			spy.mockRestore();
		});
		it('throws error if location is not string', () => {
			expect(() => GetterValidator.validateLocation(42)).toThrow(/Location string must be a valid string/);
		});
		it('returns false and warns if location is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateLocation(42, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Location string must be a valid string'));
			spy.mockRestore();
		});
	});

	describe('validateSource', () => {
		it('returns true for valid source', () => {
			expect(GetterValidator.validateSource('src')).toBe(true);
		});
		it('throws error if source is falsy', () => {
			expect(() => GetterValidator.validateSource('')).toThrow(/Source string must be provided/);
		});
		it('returns false and warns if source is falsy and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateSource('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Source string must be provided'));
			spy.mockRestore();
		});
		it('throws error if source is not string', () => {
			expect(() => GetterValidator.validateSource({})).toThrow(/Source string must be a valid string/);
		});
		it('returns false and warns if source is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateSource({}, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Source string must be a valid string'));
			spy.mockRestore();
		});
	});

	describe('validateItem', () => {
		it('returns true for valid item', () => {
			expect(GetterValidator.validateItem('item')).toBe(true);
		});
		it('throws error if item is null', () => {
			expect(() => GetterValidator.validateItem(null)).toThrow(/Item must be provided/);
		});
		it('returns false and warns if item is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateItem(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Item must be provided'));
			spy.mockRestore();
		});
		it('throws error if item is not string', () => {
			expect(() => GetterValidator.validateItem(1)).toThrow(/Item must be a valid string/);
		});
		it('returns false and warns if item is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateItem(1, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Item must be a valid string'));
			spy.mockRestore();
		});
		it('throws error if item is empty string', () => {
			expect(() => GetterValidator.validateItem('')).toThrow(/Item must not be an empty string/);
		});
		it('returns false and warns if item is empty string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateItem('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Item must not be an empty string'));
			spy.mockRestore();
		});
	});

	describe('validatePath', () => {
		it('returns true for valid path', () => {
			expect(GetterValidator.validatePath('path/to/file')).toBe(true);
		});
		it('throws error if path is falsy', () => {
			expect(() => GetterValidator.validatePath('')).toThrow(/Path must be provided/);
		});
		it('returns false and warns if path is falsy and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validatePath('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Path must be provided'));
			spy.mockRestore();
		});
		it('throws error if path is not string', () => {
			expect(() => GetterValidator.validatePath([])).toThrow(/Path must be a valid string/);
		});
		it('returns false and warns if path is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validatePath([], false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Path must be a valid string'));
			spy.mockRestore();
		});
	});

	describe('validateTimestampKey', () => {
		it('returns true for valid timestampKey', () => {
			expect(GetterValidator.validateTimestampKey('ts')).toBe(true);
		});
		it('throws error if timestampKey is null', () => {
			expect(() => GetterValidator.validateTimestampKey(null)).toThrow(/Key must be provided/);
		});
		it('returns false and warns if timestampKey is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateTimestampKey(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must be provided'));
			spy.mockRestore();
		});
		it('throws error if timestampKey is not string', () => {
			expect(() => GetterValidator.validateTimestampKey(0)).toThrow(/Key must be a valid string/);
		});
		it('returns false and warns if timestampKey is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateTimestampKey(0, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must be a valid string'));
			spy.mockRestore();
		});
		it('throws error if timestampKey is empty string', () => {
			expect(() => GetterValidator.validateTimestampKey('')).toThrow(/Key must not be an empty string/);
		});
		it('returns false and warns if timestampKey is empty string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateTimestampKey('', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Key must not be an empty string'));
			spy.mockRestore();
		});
	});

	describe('validateObject', () => {
		it('returns true for valid object', () => {
			expect(GetterValidator.validateObject({ a: 1 })).toBe(true);
		});
		it('throws error if object is undefined', () => {
			expect(() => GetterValidator.validateObject(undefined)).toThrow(/Object is invalid/);
		});
		it('returns false and warns if object is undefined and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateObject(undefined, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Object is invalid'));
			spy.mockRestore();
		});
		it('throws error if object is null', () => {
			expect(() => GetterValidator.validateObject(null)).toThrow(/Object is invalid/);
		});
		it('returns false and warns if object is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateObject(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Object is invalid'));
			spy.mockRestore();
		});
		it('throws error if object is not an object', () => {
			expect(() => GetterValidator.validateObject('str')).toThrow(/Object is not a valid object/);
		});
		it('returns false and warns if object is not an object and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateObject('str', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Object is not a valid object'));
			spy.mockRestore();
		});
		it('throws error if object is empty', () => {
			expect(() => GetterValidator.validateObject({})).toThrow(/Object is empty/);
		});
		it('returns false and warns if object is empty and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateObject({}, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Object is empty'));
			spy.mockRestore();
		});
	});

	describe('validateKeyInObject', () => {
		it('returns true if key exists', () => {
			expect(GetterValidator.validateKeyInObject({ foo: 1 }, 'foo')).toBe(true);
		});
		it('throws error if key does not exist', () => {
			expect(() => GetterValidator.validateKeyInObject({ foo: 1 }, 'bar')).toThrow(/Key 'bar' not found/);
		});
		it('returns false and warns if key does not exist and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateKeyInObject({ foo: 1 }, 'bar', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining("Key 'bar' not found"));
			spy.mockRestore();
		});
	});

	describe('validateResponse', () => {
		it('returns true for valid response', () => {
			expect(GetterValidator.validateResponse({ ok: true })).toBe(true);
		});
		it('throws error if response is null', () => {
			expect(() => GetterValidator.validateResponse(null)).toThrow(/Response must be provided/);
		});
		it('returns false and warns if response is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateResponse(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Response must be provided'));
			spy.mockRestore();
		});
		it('throws error if response is undefined', () => {
			expect(() => GetterValidator.validateResponse(undefined)).toThrow(/Response must be defined/);
		});
		it('returns false and warns if response is undefined and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateResponse(undefined, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Response must be defined'));
			spy.mockRestore();
		});
		it('throws error if response is not object', () => {
			expect(() => GetterValidator.validateResponse('bad')).toThrow(/Response must be a valid object/);
		});
		it('returns false and warns if response is not object and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateResponse('bad', false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Response must be a valid object'));
			spy.mockRestore();
		});
		it('throws error if response is empty object', () => {
			expect(() => GetterValidator.validateResponse({})).toThrow(/Response must not be an empty object/);
		});
		it('returns false and warns if response is empty object and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateResponse({}, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Response must not be an empty object'));
			spy.mockRestore();
		});
	});

	describe('validateOutputExists', () => {
		it('returns true for valid output', () => {
			expect(GetterValidator.validateOutputExists(0)).toBe(true);
			expect(GetterValidator.validateOutputExists('')).toBe(true);
			expect(GetterValidator.validateOutputExists([])).toBe(true);
		});
		it('throws error if output is undefined', () => {
			expect(() => GetterValidator.validateOutputExists(undefined)).toThrow(/Output is invalid/);
		});
		it('returns false and warns if output is undefined and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateOutputExists(undefined, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Output is invalid'));
			spy.mockRestore();
		});
		it('throws error if output is null', () => {
			expect(() => GetterValidator.validateOutputExists(null)).toThrow(/Output is invalid/);
		});
		it('returns false and warns if output is null and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateOutputExists(null, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Output is invalid'));
			spy.mockRestore();
		});
	});

	describe('validateOutputHasMinimumKeys', () => {
		it('returns true if output has at least min keys', () => {
			expect(GetterValidator.validateOutputHasMinimumKeys({ a: 1, b: 2 }, 2)).toBe(true);
		});
		it('throws error if output has less than min keys', () => {
			expect(() => GetterValidator.validateOutputHasMinimumKeys({ a: 1 }, 2)).toThrow(/Expected at least 2 keys/);
		});
		it('returns true if output has at least 1 key (default)', () => {
			expect(GetterValidator.validateOutputHasMinimumKeys({ a: 1 })).toBe(true);
		});
		it('returns false and warns if output has less than min keys and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateOutputHasMinimumKeys({ a: 1 }, 2, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Expected at least 2 keys'));
			spy.mockRestore();
		});
		it('returns false and warns if output has no keys and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validateOutputHasMinimumKeys({}, 1, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Output is empty'));
			spy.mockRestore();
		});
	});

	describe('validatePullBehaviour', () => {
		it('returns true for valid behaviour and localState', () => {
			expect(GetterValidator.validatePullBehaviour('pull', undefined)).toBe(true);
			expect(GetterValidator.validatePullBehaviour('merge', {})).toBe(true);
		});
		it('throws error if behaviour is not string', () => {
			expect(() => GetterValidator.validatePullBehaviour(123, {})).toThrow(/Invalid behaviour/);
		});
		it('returns false and warns if behaviour is not string and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validatePullBehaviour(123, {}, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid behaviour'));
			spy.mockRestore();
		});
		it('throws error if localState is not object', () => {
			expect(() => GetterValidator.validatePullBehaviour('pull', 123)).toThrow(/Invalid localState/);
		});
		it('returns false and warns if localState is not object and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validatePullBehaviour('pull', 123, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid localState'));
			spy.mockRestore();
		});
		it('throws error if behaviour is not in VALID_BEHAVIOURS', () => {
			expect(() => GetterValidator.validatePullBehaviour('invalid', {})).toThrow(/Invalid behaviour: invalid/);
		});
		it('returns false and warns if behaviour is not in VALID_BEHAVIOURS and throwError=false', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			expect(GetterValidator.validatePullBehaviour('invalid', {}, false, true)).toBe(false);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid behaviour: invalid'));
			spy.mockRestore();
		});
		it('warns if behaviour is pull and localState is provided', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			GetterValidator.validatePullBehaviour('pull', {});
			expect(spy).toHaveBeenCalledWith(expect.stringContaining("Behaviour 'pull' is set, but localState is provided"));
			spy.mockRestore();
		});
		it('warns if behaviour is pull and localState is null', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			GetterValidator.validatePullBehaviour('pull', null);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining("Behaviour 'pull' is set, but no localState is provided"));
			spy.mockRestore();
		});
		it('warns if behaviour is pull and localState is undefined', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			GetterValidator.validatePullBehaviour('pull', undefined);
			expect(spy).toHaveBeenCalledWith(expect.stringContaining("Behaviour 'pull' is set, but no localState is provided"));
			spy.mockRestore();
		});
	});
});