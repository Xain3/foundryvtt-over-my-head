import RemoteContextGetter from './getter';
import RemoteContextOperator from './operator';
import GetterValidator from './validators/getterValidator';
import { get, isEqual } from 'lodash';

// Mock dependencies
jest.mock('./operator');
jest.mock('./validators/getterValidator');
jest.mock('lodash', () => ({
    get: jest.fn(),
    isEqual: jest.fn(),
}));

describe('RemoteContextGetter', () => {
    let getter;
    let mockConfig;
    let mockContextRootMap;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        mockConfig = { some: 'config' };
        mockContextRootMap = { rootMap: { some: { nested: { object: { value: 123, timestamp: 1678886400000 } } } } };

        // Mock RemoteContextOperator implementation details needed by Getter
        RemoteContextOperator.prototype.contextRootMap = mockContextRootMap;
        RemoteContextOperator.prototype.remoteContextRoot = 'some.nested.object';
        RemoteContextOperator.prototype.contextObjectPath = 'some.nested.object';
        RemoteContextOperator.prototype.defaultTimestampKey = 'timestamp';
        RemoteContextOperator.prototype.getContextObjectPath = jest.fn((options) => options?.location || 'some.nested.object');
        RemoteContextOperator.prototype.parseKeyOrPath = jest.fn((key) => (typeof key === 'string' ? key.split('.') : key));
        RemoteContextOperator.prototype.getDataPath = jest.fn(() => 'data.path');
        RemoteContextOperator.prototype.getFlagsPath = jest.fn(() => 'flags.path');
        RemoteContextOperator.prototype.getSettingsPath = jest.fn(() => 'settings.path');


        getter = new RemoteContextGetter({ config: mockConfig });

        // Mock lodash.get behavior
        get.mockImplementation((obj, path, defaultValue) => {
            if (obj === mockContextRootMap.rootMap && path === 'some.nested.object') {
                return { value: 123, timestamp: 1678886400000 };
            }
            if (obj === mockContextRootMap.rootMap && path === 'data.path') {
                return { dataValue: 'abc' };
            }
             if (obj === mockContextRootMap.rootMap && path === 'flags.path') {
                return { flagValue: true };
            }
             if (obj === mockContextRootMap.rootMap && path === 'settings.path') {
                return { settingValue: 'xyz' };
            }
            // Simple nested get for testing _getNestedValue via _getItemAtPath/_getValueAtPath
             if (path === 'some.nested.object' && obj === mockContextRootMap.rootMap) {
                 const base = { value: 123, timestamp: 1678886400000, nestedItem: { deep: 'found' } };
                 return base;
             }
             if (path === 'some.nested.object.nestedItem.deep' && obj === mockContextRootMap.rootMap) {
                 return 'found';
             }
             // Handle direct object access in _getNestedValue mock simulation
             if (typeof obj === 'object' && obj !== null && typeof path === 'string') {
                 const keys = path.split('.');
                 let current = obj;
                 for (const key of keys) {
                     if (current && current.hasOwnProperty(key)) {
                         current = current[key];
                     } else {
                         return defaultValue;
                     }
                 }
                 return current;
             }


            return defaultValue;
        });

        // Mock Date.now() for predictable retrieved timestamps
        jest.spyOn(Date, 'now').mockReturnValue(1678886500000);
        // Mock console.error and console.warn
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore mocks
        jest.restoreAllMocks();
    });

    it('should instantiate correctly and call super', () => {
        expect(getter).toBeInstanceOf(RemoteContextGetter);
        expect(getter).toBeInstanceOf(RemoteContextOperator);
        expect(RemoteContextOperator).toHaveBeenCalledWith({ config: mockConfig, contextRootIdentifier: undefined });
    });

    describe('_getTimestampModified', () => {
        it('should retrieve the timestamp successfully', () => {
            const timestamp = getter._getTimestampModified({});
            expect(timestamp).toBe(1678886400000);
            expect(GetterValidator.validateSource).toHaveBeenCalled();
            expect(GetterValidator.validateLocation).toHaveBeenCalled();
            expect(GetterValidator.validateTimestampKey).toHaveBeenCalled();
            expect(GetterValidator.validateObject).toHaveBeenCalled();
            expect(GetterValidator.validateKeyInObject).toHaveBeenCalled();
            expect(get).toHaveBeenCalledWith(mockContextRootMap.rootMap, 'some.nested.object');
        });

        it('should return null if object not found', () => {
            get.mockReturnValueOnce(undefined);
            const timestamp = getter._getTimestampModified({});
            expect(timestamp).toBeNull();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Object is required and must be a non-null object"), expect.any(String));
        });

         it('should return null if timestamp key not found', () => {
            get.mockReturnValueOnce({ value: 123 }); // No timestamp key
            const timestamp = getter._getTimestampModified({});
            expect(timestamp).toBeNull();
             expect(GetterValidator.validateKeyInObject).toHaveBeenCalled(); // It gets called, but the key isn't there
             expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Key 'timestamp' not found in object"), expect.any(String));
        });

        it('should return the value directly if it is a primitive', () => {
            get.mockReturnValueOnce(1678886400000); // Return primitive directly
            const timestamp = getter._getTimestampModified({});
            expect(timestamp).toBe(1678886400000);
            expect(GetterValidator.validateObject).not.toHaveBeenCalled(); // Skips object validation
        });

        it('should return null on validation error', () => {
            GetterValidator.validateSource.mockImplementation(() => { throw new Error('Invalid source'); });
            const timestamp = getter._getTimestampModified({});
            expect(timestamp).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid source. Returning null.");
        });
    });

    describe('_buildOutput', () => {
        it('should build output with response and both timestamps', () => {
            const response = { data: 'test' };
            const output = getter._buildOutput({ response, timestampModified: true, timestampRetrieved: true });
            expect(output).toEqual({
                response: { data: 'test' },
                modified: 1678886400000,
                retrieved: 1678886500000,
            });
            expect(GetterValidator.validateResponse).toHaveBeenCalledWith(response);
            expect(GetterValidator.validateTimestampFlags).toHaveBeenCalledWith(true, true);
            expect(GetterValidator.validateOutputExists).toHaveBeenCalled();
            expect(GetterValidator.validateOutputHasMinimumKeys).toHaveBeenCalledWith(expect.any(Object), 3);
            expect(Date.now).toHaveBeenCalled();
        });

        it('should build output with only modified timestamp', () => {
            const response = { data: 'test' };
            const output = getter._buildOutput({ response, timestampModified: true, timestampRetrieved: false });
            expect(output).toEqual({
                response: { data: 'test' },
                modified: 1678886400000,
                retrieved: null,
            });
            expect(Date.now).not.toHaveBeenCalled();
        });

        it('should build output with only retrieved timestamp', () => {
            const response = { data: 'test' };
            const output = getter._buildOutput({ response, timestampModified: false, timestampRetrieved: true });
            expect(output).toEqual({
                response: { data: 'test' },
                modified: null,
                retrieved: 1678886500000,
            });
            expect(Date.now).toHaveBeenCalled();
        });

        it('should build output with no timestamps', () => {
            const response = { data: 'test' };
            const output = getter._buildOutput({ response, timestampModified: false, timestampRetrieved: false });
            expect(output).toEqual({
                response: { data: 'test' },
                modified: null,
                retrieved: null,
            });
            expect(Date.now).not.toHaveBeenCalled();
        });

        it('should return null on validation error', () => {
            GetterValidator.validateResponse.mockImplementation(() => { throw new Error('Invalid response'); });
            const output = getter._buildOutput({ response: null, timestampModified: false, timestampRetrieved: false });
            expect(output).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid response. Returning null.");
        });

         it('should return null if _getTimestampModified returns null', () => {
            jest.spyOn(getter, '_getTimestampModified').mockReturnValueOnce(null);
            const response = { data: 'test' };
            const output = getter._buildOutput({ response, timestampModified: true, timestampRetrieved: false });
            // It still builds the output structure, but modified is null
             expect(output).toEqual({
                response: { data: 'test' },
                modified: null,
                retrieved: null,
            });
             expect(getter._getTimestampModified).toHaveBeenCalled();
        });
    });

    describe('_getNestedValue', () => {
        const testObj = { a: { b: { c: 1 } }, d: 2 };

        it('should get a deeply nested value', () => {
            expect(getter._getNestedValue(['a', 'b', 'c'], testObj)).toBe(1);
        });

        it('should get a top-level value', () => {
            expect(getter._getNestedValue(['d'], testObj)).toBe(2);
        });

        it('should return undefined if an intermediate key does not exist', () => {
            expect(getter._getNestedValue(['a', 'x', 'c'], testObj)).toBeUndefined();
        });

        it('should return undefined if the final key does not exist', () => {
            expect(getter._getNestedValue(['a', 'b', 'y'], testObj)).toBeUndefined();
        });

        it('should return undefined if the object is null or undefined', () => {
            expect(getter._getNestedValue(['a'], null)).toBeUndefined();
            expect(getter._getNestedValue(['a'], undefined)).toBeUndefined();
        });

         it('should return the object itself if keys array is empty', () => {
            expect(getter._getNestedValue([], testObj)).toBe(testObj);
        });
    });

    describe('_getItemAtPath', () => {
        const path = 'some.nested.object';
        const itemKey = 'value';
        const nestedItemKey = 'nestedItem.deep';

        beforeEach(() => {
            // Ensure get returns the base object for the path
             get.mockImplementation((obj, p) => {
                 if (obj === mockContextRootMap.rootMap && p === path) {
                     return { value: 123, timestamp: 1678886400000, nestedItem: { deep: 'found' } };
                 }
                 return undefined;
             });
             // Mock _getNestedValue specifically for this test context
             jest.spyOn(getter, '_getNestedValue').mockImplementation((keys, obj) => {
                 if (isEqual(keys, ['value']) && isEqual(obj, { value: 123, timestamp: 1678886400000, nestedItem: { deep: 'found' } })) return 123;
                 if (isEqual(keys, ['nestedItem', 'deep']) && isEqual(obj, { value: 123, timestamp: 1678886400000, nestedItem: { deep: 'found' } })) return 'found';
                 return undefined;
             });
        });


        it('should retrieve an item successfully', () => {
            const value = getter._getItemAtPath({ path, item: itemKey });
            expect(value).toBe(123);
            expect(GetterValidator.validatePath).toHaveBeenCalledWith(path);
            expect(GetterValidator.validateItem).toHaveBeenCalledWith(itemKey);
            expect(getter.parseKeyOrPath).toHaveBeenCalledWith(itemKey);
            expect(get).toHaveBeenCalledWith(mockContextRootMap.rootMap, path);
            expect(getter._getNestedValue).toHaveBeenCalledWith(['value'], expect.any(Object));
        });

        it('should retrieve a nested item successfully', () => {
            const value = getter._getItemAtPath({ path, item: nestedItemKey });
            expect(value).toBe('found');
            expect(getter.parseKeyOrPath).toHaveBeenCalledWith(nestedItemKey);
            expect(getter._getNestedValue).toHaveBeenCalledWith(['nestedItem', 'deep'], expect.any(Object));
        });

        it('should return undefined if base path does not exist', () => {
            get.mockReturnValueOnce(undefined);
            const value = getter._getItemAtPath({ path, item: itemKey });
            expect(value).toBeUndefined();
            expect(console.warn).toHaveBeenCalledWith(`Base value not found at path: ${path}. Cannot retrieve item [${itemKey}].`);
            expect(getter._getNestedValue).not.toHaveBeenCalled();
        });

        it('should return undefined if base value is not an object', () => {
            get.mockReturnValueOnce('not an object');
            const value = getter._getItemAtPath({ path, item: itemKey });
            expect(value).toBeUndefined();
            expect(console.warn).toHaveBeenCalledWith(`Value at path ${path} is not an object. Cannot retrieve item [${itemKey}].`);
            expect(getter._getNestedValue).not.toHaveBeenCalled();
        });

        it('should return undefined if item is not found within the object', () => {
             getter._getNestedValue.mockReturnValueOnce(undefined); // Simulate item not found
            const value = getter._getItemAtPath({ path, item: 'nonexistent.key' });
            expect(value).toBeUndefined();
            expect(console.warn).toHaveBeenCalledWith(`Item [nonexistent.key]: not found at path: ${path}`);
        });

        it('should return null on validation error', () => {
            GetterValidator.validatePath.mockImplementation(() => { throw new Error('Invalid path'); });
            const value = getter._getItemAtPath({ path: null, item: itemKey });
            expect(value).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid path. Returning null.");
        });
    });

    describe('_getValueAtPath', () => {
        const path = 'some.nested.object';
        const itemKey = 'value';

        it('should call _getItemAtPath when item is provided', () => {
            const spy = jest.spyOn(getter, '_getItemAtPath').mockReturnValueOnce('itemValue');
            const value = getter._getValueAtPath({ path, item: itemKey });
            expect(value).toBe('itemValue');
            expect(spy).toHaveBeenCalledWith({ path, item: itemKey });
            expect(get).not.toHaveBeenCalled(); // get is called within _getItemAtPath
            expect(GetterValidator.validatePath).toHaveBeenCalledWith(path);
            expect(GetterValidator.validateItem).toHaveBeenCalledWith(itemKey);
        });

        it('should call lodash.get when item is not provided', () => {
            const expectedValue = { value: 123, timestamp: 1678886400000 };
            get.mockReturnValueOnce(expectedValue);
            const value = getter._getValueAtPath({ path });
            expect(value).toBe(expectedValue);
            expect(get).toHaveBeenCalledWith(mockContextRootMap.rootMap, path);
            expect(getter._getItemAtPath).not.toHaveBeenCalled();
            expect(GetterValidator.validatePath).toHaveBeenCalledWith(path);
            expect(GetterValidator.validateItem).not.toHaveBeenCalled();
        });

        it('should return null if value not found (no item)', () => {
            get.mockReturnValueOnce(undefined);
            const value = getter._getValueAtPath({ path });
            expect(value).toBeNull();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`Value not found at path: ${path}`), expect.any(String));
        });

        it('should return null on validation error', () => {
            GetterValidator.validatePath.mockImplementation(() => { throw new Error('Invalid path'); });
            const value = getter._getValueAtPath({ path: null });
            expect(value).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid path. Returning null.");
        });
    });

    describe('_onlyWriteMissing', () => {
        it('should write key if missing in localState', () => {
            const localState = { a: 1 };
            const pulled = { ...localState };
            const remoteState = { a: 2, b: 3 };
            getter._onlyWriteMissing(localState, 'b', pulled, remoteState);
            expect(pulled).toEqual({ a: 1, b: 3 });
        });

        it('should not write key if present in localState', () => {
            const localState = { a: 1, b: 2 };
            const pulled = { ...localState };
            const remoteState = { a: 10, b: 20 };
            getter._onlyWriteMissing(localState, 'a', pulled, remoteState);
            expect(pulled).toEqual({ a: 1, b: 2 });
        });
    });

    describe('_overwriteIfExists', () => {
        it('should overwrite key if it exists in remoteState', () => {
            const remoteState = { a: 10, b: 20 };
            const overwritten = { a: 1, c: 3 };
            getter._overwriteIfExists(remoteState, 'a', overwritten);
            expect(overwritten).toEqual({ a: 10, c: 3 });
        });

        it('should not overwrite key if it does not exist in remoteState', () => {
            const remoteState = { b: 20 };
            const overwritten = { a: 1, c: 3 };
            getter._overwriteIfExists(remoteState, 'a', overwritten);
            expect(overwritten).toEqual({ a: 1, c: 3 });
        });
    });

    describe('_determinePullBehaviour', () => {
        const localState = { a: 1, b: 2 };
        const remoteState = { b: 20, c: 30 };

        it("should handle 'pull' behaviour", () => {
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'pull' });
            expect(result).toEqual(remoteState);
            expect(result).not.toBe(remoteState); // Should be a copy
            expect(console.warn).toHaveBeenCalledWith('Replacing local state with remote context (behaviour: pull)');
        });

        it("should handle 'replace' behaviour", () => {
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'replace' });
            expect(result).toEqual(remoteState);
            expect(result).not.toBe(remoteState);
            expect(console.warn).toHaveBeenCalledWith('Replacing local state with remote context (behaviour: replace)');
        });

        it("should handle 'merge' behaviour", () => {
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'merge' });
            expect(result).toEqual({ a: 1, b: 20, c: 30 });
            expect(console.warn).toHaveBeenCalledWith('Merging remote context state into local state.');
        });

        it("should handle 'overwriteLocal' behaviour", () => {
            const spyOverwrite = jest.spyOn(getter, '_overwriteIfExists');
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'overwriteLocal' });
            expect(result).toEqual({ a: 1, b: 20 }); // a is kept, b is overwritten
            expect(spyOverwrite).toHaveBeenCalledWith(remoteState, 'a', expect.any(Object));
            expect(spyOverwrite).toHaveBeenCalledWith(remoteState, 'b', expect.any(Object));
            expect(console.warn).toHaveBeenCalledWith('Overwriting local state with remote context state.');
        });

        it("should handle 'pullMissing' behaviour", () => {
            const spyMissing = jest.spyOn(getter, '_onlyWriteMissing');
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'pullMissing' });
            expect(result).toEqual({ a: 1, b: 2, c: 30 }); // a, b kept, c added
            expect(spyMissing).toHaveBeenCalledWith(localState, 'b', expect.any(Object), remoteState);
            expect(spyMissing).toHaveBeenCalledWith(localState, 'c', expect.any(Object), remoteState);
            expect(console.warn).toHaveBeenCalledWith('Pulling only missing keys from remote context into local state.');
        });

        it("should handle 'keep' behaviour", () => {
            const result = getter._determinePullBehaviour({ localState, remoteState, behaviour: 'keep' });
            expect(result).toEqual(localState);
            expect(result).toBe(localState); // Should return the original object
            expect(console.warn).toHaveBeenCalledWith('Keeping local state unchanged.');
        });

        it('should default to pull if localState is invalid', () => {
            const result = getter._determinePullBehaviour({ localState: null, remoteState, behaviour: 'merge' });
            expect(result).toEqual(remoteState);
            expect(console.warn).toHaveBeenCalledWith('Replacing local state with remote context (behaviour: pull)');
        });

        it('should throw error for invalid behaviour', () => {
            expect(() => {
                getter._determinePullBehaviour({ localState, remoteState, behaviour: 'invalid' });
            }).toThrow('Invalid behaviour: invalid.');
        });
    });

    describe('_extractFromOutput', () => {
        const output = { response: 'data', modified: 1, retrieved: 2 };

        beforeEach(() => {
            // Mock validation pass
            GetterValidator.validateOutputExists.mockImplementation(() => {});
            GetterValidator.validateOutputHasMinimumKeys.mockImplementation(() => {});
        });

        it("should return 'all'", () => {
            expect(getter._extractFromOutput({ output, returnValue: 'all' })).toBe(output);
        });

        it("should return 'context'", () => {
            expect(getter._extractFromOutput({ output, returnValue: 'context' })).toBe('data');
        });

        it("should return 'modified'", () => {
            expect(getter._extractFromOutput({ output, returnValue: 'modified' })).toBe(1);
        });

        it("should return 'retrieved'", () => {
            expect(getter._extractFromOutput({ output, returnValue: 'retrieved' })).toBe(2);
        });

        it("should return 'only timestamps'", () => {
            expect(getter._extractFromOutput({ output, returnValue: 'only timestamps' })).toEqual({ modified: 1, retrieved: 2 });
        });

        it('should use default returnValue "context"', () => {
            expect(getter._extractFromOutput({ output })).toBe('data');
        });

        it('should throw error for invalid returnValue', () => {
            expect(() => {
                getter._extractFromOutput({ output, returnValue: 'invalid' });
            }).toThrow("Invalid return value: invalid. Expected 'all', 'context', 'modified', 'retrieved', or 'only timestamps'.");
        });

        it('should throw error if output validation fails', () => {
            GetterValidator.validateOutputExists.mockImplementation(() => { throw new Error('Output missing'); });
            expect(() => {
                getter._extractFromOutput({ output: null });
            }).toThrow('Output missing');
        });
    });

    // Tests for return* methods (simple wrappers around _extractFromOutput)
    describe('return* methods', () => {
        const output = { response: 'data', modified: 1, retrieved: 2 };
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(getter, '_extractFromOutput');
        });

        it('returnAll calls _extractFromOutput correctly', () => {
            getter.returnAll({ output });
            expect(spy).toHaveBeenCalledWith({ output, returnValue: 'all' });
        });
        it('returnContext calls _extractFromOutput correctly', () => {
            getter.returnContext({ output });
            expect(spy).toHaveBeenCalledWith({ output, returnValue: 'context' });
        });
        it('returnModified calls _extractFromOutput correctly', () => {
            getter.returnModified({ output });
            expect(spy).toHaveBeenCalledWith({ output, returnValue: 'modified' });
        });
        it('returnRetrieved calls _extractFromOutput correctly', () => {
            getter.returnRetrieved({ output });
            expect(spy).toHaveBeenCalledWith({ output, returnValue: 'retrieved' });
        });
        it('returnOnlyTimestamps calls _extractFromOutput correctly', () => {
            getter.returnOnlyTimestamps({ output });
            expect(spy).toHaveBeenCalledWith({ output, returnValue: 'only timestamps' });
        });
    });

    describe('get', () => {
        it("should delegate to getObject for mode 'object'", () => {
            const spy = jest.spyOn(getter, 'getObject').mockReturnValue('objectData');
            const args = { timestampModified: true };
            const result = getter.get('object', args);
            expect(result).toBe('objectData');
            expect(spy).toHaveBeenCalledWith(args);
        });

        it("should delegate to getData for mode 'data'", () => {
            const spy = jest.spyOn(getter, 'getData').mockReturnValue('dataData');
            const args = { key: 'someKey' };
            const result = getter.get('data', args);
            expect(result).toBe('dataData');
            expect(spy).toHaveBeenCalledWith(args);
        });

         it("should delegate to getFlags for mode 'flags'", () => {
            const spy = jest.spyOn(getter, 'getFlags').mockReturnValue('flagData');
            const args = { flag: 'someFlag' };
            const result = getter.get('flags', args);
            expect(result).toBe('flagData');
            expect(spy).toHaveBeenCalledWith(args);
        });

         it("should delegate to getSettings for mode 'settings'", () => {
            const spy = jest.spyOn(getter, 'getSettings').mockReturnValue('settingsData');
            const args = { setting: 'someSetting' };
            const result = getter.get('settings', args);
            expect(result).toBe('settingsData');
            expect(spy).toHaveBeenCalledWith(args);
        });

        it("should default to mode 'object'", () => {
            const spy = jest.spyOn(getter, 'getObject').mockReturnValue('objectData');
            getter.get();
            expect(spy).toHaveBeenCalledWith({});
        });

        it('should throw error for unsupported mode', () => {
            expect(() => getter.get('invalidMode')).toThrow('Unsupported mode: invalidMode');
        });

         it('should throw error if mode is invalid', () => {
            expect(() => getter.get(123)).toThrow('Mode must be a valid string, received number instead');
            expect(() => getter.get(null)).toThrow('Mode must be provided');
        });

         it('should throw error if args is invalid', () => {
            expect(() => getter.get('object', null)).toThrow('Arguments object must be provided');
             expect(() => getter.get('object', 'not-an-object')).toThrow('Arguments object must be a valid object, received string instead');
        });
    });

    describe('getObject', () => {
        it('should retrieve the object and build output', () => {
            const expectedObject = { value: 123, timestamp: 1678886400000 };
            const expectedOutput = { response: expectedObject, modified: 1678886400000, retrieved: 1678886500000 };
            const spyBuild = jest.spyOn(getter, '_buildOutput').mockReturnValue(expectedOutput);
            get.mockReturnValueOnce(expectedObject); // Mock lodash.get

            const result = getter.getObject({ timestampModified: true, timestampRetrieved: true });

            expect(result).toBe(expectedOutput);
            expect(getter.getContextObjectPath).toHaveBeenCalledWith({ source: getter.remoteContextRoot, location: getter.contextObjectPath });
            expect(get).toHaveBeenCalledWith(mockContextRootMap.rootMap, getter.contextObjectPath);
            expect(GetterValidator.validateObject).toHaveBeenCalledWith(expectedObject);
            expect(spyBuild).toHaveBeenCalledWith({
                response: expectedObject,
                timestampModified: true,
                timestampRetrieved: true,
                source: getter.remoteContextRoot,
                location: getter.contextObjectPath
            });
        });

        it('should return null if object validation fails', () => {
            get.mockReturnValueOnce({ value: 123 }); // Valid object structure
            GetterValidator.validateObject.mockImplementation(() => { throw new Error('Invalid object'); });
            const result = getter.getObject({});
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid object. Returning null.");
        });

         it('should return null if get returns undefined', () => {
            get.mockReturnValueOnce(undefined);
            const result = getter.getObject({});
            expect(result).toBeNull();
            // The error comes from validateObject in this case
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Object is required"), expect.any(String));
        });

        it('should return null if argument validation fails', () => {
            GetterValidator.validateLocation.mockImplementation(() => { throw new Error('Invalid location'); });
            const result = getter.getObject({ location: null });
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid location. Returning null.");
        });
    });

    describe('getItem', () => {
         const itemKey = 'value';
         const nestedItemKey = 'nestedItem.deep';
         const expectedValue = 123;
         const expectedNestedValue = 'found';
         const expectedOutput = { response: expectedValue, modified: null, retrieved: null };
         const expectedNestedOutput = { response: expectedNestedValue, modified: null, retrieved: null };

         beforeEach(() => {
             // Mock _getValueAtPath to simulate successful item retrieval
             jest.spyOn(getter, '_getValueAtPath')
                 .mockImplementation(({ item }) => {
                     if (item === itemKey) return expectedValue;
                     if (item === nestedItemKey) return expectedNestedValue;
                     return undefined; // Simulate not found for other keys
                 });
             jest.spyOn(getter, '_buildOutput').mockImplementation(({ response, timestampModified, timestampRetrieved }) => ({
                 response,
                 modified: timestampModified ? 1678886400000 : null,
                 retrieved: timestampRetrieved ? 1678886500000 : null,
             }));
         });

        it('should retrieve an item and build output', () => {
            const result = getter.getItem({ key: itemKey });
            expect(result).toEqual(expectedOutput);
            expect(getter._getValueAtPath).toHaveBeenCalledWith({ path: getter.contextObjectPath, item: itemKey });
            expect(getter._buildOutput).toHaveBeenCalledWith({
                response: expectedValue,
                timestampModified: false,
                timestampRetrieved: false,
                source: getter.remoteContextRoot,
                location: getter.contextObjectPath
            });
            expect(GetterValidator.validateKey).toHaveBeenCalledWith(itemKey);
        });

         it('should retrieve a nested item and build output', () => {
            const result = getter.getItem({ key: nestedItemKey, timestampModified: true });
             expect(result).toEqual({ response: expectedNestedValue, modified: 1678886400000, retrieved: null });
            expect(getter._getValueAtPath).toHaveBeenCalledWith({ path: getter.contextObjectPath, item: nestedItemKey });
            expect(getter._buildOutput).toHaveBeenCalledWith({
                response: expectedNestedValue,
                timestampModified: true,
                timestampRetrieved: false,
                source: getter.remoteContextRoot,
                location: getter.contextObjectPath
            });
             expect(GetterValidator.validateKey).toHaveBeenCalledWith(nestedItemKey);
        });

        it('should return null if item validation fails', () => {
            GetterValidator.validateKey.mockImplementation(() => { throw new Error('Invalid key'); });
            const result = getter.getItem({ key: null });
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid key. Returning null.");
            expect(getter._getValueAtPath).not.toHaveBeenCalled();
        });

        it('should return null if _getValueAtPath returns undefined (item not found)', () => {
            getter._getValueAtPath.mockReturnValueOnce(undefined);
            const result = getter.getItem({ key: 'nonexistent' });
            expect(result).toBeNull();
            // The error message comes from the validation within getItem itself
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Item [nonexistent] not found at path:"), expect.any(String));
            expect(getter._buildOutput).not.toHaveBeenCalled();
        });

         it('should return null if _getValueAtPath throws', () => {
            const error = new Error('Internal getValueAtPath error');
            getter._getValueAtPath.mockImplementation(() => { throw error; });
            const result = getter.getItem({ key: itemKey });
            expect(result).toBeNull();
            // Error is caught and logged by getItem
            expect(console.error).toHaveBeenCalledWith("Internal getValueAtPath error. Returning null.");
            expect(getter._buildOutput).not.toHaveBeenCalled();
        });
    });

    // Simplified tests for getData, getFlags, getSettings as they follow the same pattern
    describe.each([
        ['getData', 'getDataPath', 'data.path', { dataValue: 'abc' }, 'key'],
        ['getFlags', 'getFlagsPath', 'flags.path', { flagValue: true }, 'flag'],
        ['getSettings', 'getSettingsPath', 'settings.path', { settingValue: 'xyz' }, 'setting'],
    ])('%s', (methodName, pathMethodName, expectedPath, expectedValue, itemArgName) => {
        let spyGetValueAtPath;
        let spyBuildOutput;

        beforeEach(() => {
            spyGetValueAtPath = jest.spyOn(getter, '_getValueAtPath').mockReturnValue(expectedValue);
            spyBuildOutput = jest.spyOn(getter, '_buildOutput').mockReturnValue({ response: expectedValue, modified: null, retrieved: null });
            getter[pathMethodName].mockReturnValue(expectedPath); // Ensure path method returns expected path
        });

        it('should call path method, _getValueAtPath, and _buildOutput correctly (no item)', () => {
            const result = getter[methodName]({});
            expect(getter[pathMethodName]).toHaveBeenCalled();
            expect(spyGetValueAtPath).toHaveBeenCalledWith({ path: expectedPath, item: null });
            expect(spyBuildOutput).toHaveBeenCalledWith({ response: expectedValue, timestampModified: false, timestampRetrieved: false });
            expect(result).toEqual({ response: expectedValue, modified: null, retrieved: null });
        });

        it('should call path method, _getValueAtPath, and _buildOutput correctly (with item)', () => {
            const itemValue = 'specificValue';
            spyGetValueAtPath.mockReturnValueOnce(itemValue); // Mock specific item return
            spyBuildOutput.mockReturnValueOnce({ response: itemValue, modified: null, retrieved: null });

            const args = { [itemArgName]: 'specificItem', timestampRetrieved: true };
            const result = getter[methodName](args);

            expect(getter[pathMethodName]).toHaveBeenCalled();
            expect(spyGetValueAtPath).toHaveBeenCalledWith({ path: expectedPath, item: 'specificItem' });
            expect(spyBuildOutput).toHaveBeenCalledWith({ response: itemValue, timestampModified: false, timestampRetrieved: true });
            expect(result).toEqual({ response: itemValue, modified: null, retrieved: null }); // Build output mock returns this
        });

        it('should return null if _getValueAtPath returns null', () => {
             spyGetValueAtPath.mockReturnValueOnce(null); // Simulate error in getValueAtPath
             const result = getter[methodName]({});
             // _buildOutput might still be called with null response depending on implementation,
             // but the final result should reflect the failure. Let's assume _buildOutput handles null response gracefully or isn't called.
             // Let's refine: _getValueAtPath returns null, _buildOutput is called with null.
             spyBuildOutput.mockReturnValueOnce({ response: null, modified: null, retrieved: null });
             expect(result).toEqual({ response: null, modified: null, retrieved: null }); // Check the built output
        });
    });

    describe('pullState', () => {
        const localState = { a: 1, b: 2 };
        const remoteObject = { b: 20, c: 30 }; // This is the raw object returned by getObject
        const remoteStateOutput = { response: remoteObject, modified: null, retrieved: null }; // Output of getObject
        let spyGetObject;
        let spyDeterminePull;
        let spyBuildOutput;

        beforeEach(() => {
            spyGetObject = jest.spyOn(getter, 'getObject').mockReturnValue(remoteStateOutput);
            spyDeterminePull = jest.spyOn(getter, '_determinePullBehaviour');
            spyBuildOutput = jest.spyOn(getter, '_buildOutput');
            isEqual.mockReturnValue(false); // Assume states are different by default
        });

        it('should get remote state, determine behaviour, and build output', () => {
            const determinedState = { a: 1, b: 20, c: 30 }; // Example merge result
            spyDeterminePull.mockReturnValue(determinedState);
            spyBuildOutput.mockReturnValue({ response: determinedState, modified: null, retrieved: 1678886500000 });

            const result = getter.pullState({ localState, behaviour: 'merge', timestampRetrieved: true });

            expect(spyGetObject).toHaveBeenCalledWith({ source: getter.remoteContextRoot, location: getter.contextObjectPath });
            expect(GetterValidator.validateObject).toHaveBeenCalledWith(remoteStateOutput); // Validates the *output* of getObject
            expect(isEqual).toHaveBeenCalledWith(localState, remoteStateOutput);
            expect(spyDeterminePull).toHaveBeenCalledWith({ localState, remoteState: remoteStateOutput, behaviour: 'merge' });
            expect(GetterValidator.validatePullBehaviour).toHaveBeenCalledWith('merge', localState);
            expect(spyBuildOutput).toHaveBeenCalledWith({ response: determinedState, timestampModified: false, timestampRetrieved: true });
            expect(result).toEqual({ response: determinedState, modified: null, retrieved: 1678886500000 });
        });

        it('should return localState if local and remote are equal', () => {
            isEqual.mockReturnValue(true);
            const result = getter.pullState({ localState, behaviour: 'pull' });
            expect(result).toBe(localState);
            expect(spyGetObject).toHaveBeenCalled();
            expect(isEqual).toHaveBeenCalledWith(localState, remoteStateOutput);
            expect(spyDeterminePull).not.toHaveBeenCalled();
            expect(spyBuildOutput).not.toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalledWith('Local state is the same as remote state. No changes made.');
        });

        it('should return null if getObject fails', () => {
            spyGetObject.mockReturnValue(null);
            const result = getter.pullState({ localState });
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Object is required"), expect.any(String)); // Error from validateRemoteState
            expect(spyDeterminePull).not.toHaveBeenCalled();
        });

        it('should return null if behaviour determination throws', () => {
            const error = new Error('Invalid behaviour');
            spyDeterminePull.mockImplementation(() => { throw error; });
            const result = getter.pullState({ localState, behaviour: 'invalid' });
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Invalid behaviour. Returning null.");
            expect(spyBuildOutput).not.toHaveBeenCalled();
        });

        it('should return null if argument validation fails', () => {
            GetterValidator.validatePullBehaviour.mockImplementation(() => { throw new Error('Bad behaviour'); });
            const result = getter.pullState({ localState, behaviour: 'bad' });
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Bad behaviour. Returning null.");
        });

         it('should handle pull when localState is null', () => {
            const determinedState = remoteObject; // pull behaviour returns remote
            spyDeterminePull.mockReturnValue(determinedState);
            spyBuildOutput.mockReturnValue({ response: determinedState, modified: null, retrieved: null });

            const result = getter.pullState({ localState: null, behaviour: 'pull' });

            expect(spyGetObject).toHaveBeenCalled();
            expect(isEqual).toHaveBeenCalledWith(null, remoteStateOutput);
            expect(spyDeterminePull).toHaveBeenCalledWith({ localState: null, remoteState: remoteStateOutput, behaviour: 'pull' });
            expect(spyBuildOutput).toHaveBeenCalledWith({ response: determinedState, timestampModified: false, timestampRetrieved: false });
            expect(result).toEqual({ response: determinedState, modified: null, retrieved: null });
        });
    });
});