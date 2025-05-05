import RootManager from './rootManager';
import RootManagerValidator from './validators/rootManagerValidator';
import RemoteContextBase from './base'; // Assuming base exists for constructor call

// Mock the validator
jest.mock('./validators/rootManagerValidator');
// Mock the base class if needed, though simple constructor call might not require it
// jest.mock('./base');

describe('RootManager', () => {
    let mockConfig;
    let consoleErrorSpy;
    let consoleWarnSpy;
    let consoleDebugSpy;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock config object
        mockConfig = {
            contextRootMap: {
                rootMap: {
                    'validKey': { id: 'root1', data: 'some data' },
                    'anotherKey': { id: 'root2', data: 'other data' }
                }
            }
        };

        // Spy on console methods
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

        // Default mock implementations for validator
        RootManagerValidator.validateSourceString.mockReturnValue(true);
        RootManagerValidator.validateManageRootArgs.mockReturnValue(true);
    });

    afterEach(() => {
        // Restore console spies
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleDebugSpy.mockRestore();
    });

    // --- Constructor Tests ---
    describe('Constructor', () => {
        it('should initialize with config and call _determineRoot with contextRootIdentifier', () => {
            const identifier = 'validKey';
            const manager = new RootManager({ config: mockConfig, contextRootIdentifier: identifier });
            expect(manager.config).toBe(mockConfig);
            expect(manager.contextRootIdentifier).toBe(identifier);
            expect(manager.root).toEqual(mockConfig.contextRootMap.rootMap[identifier]);
            // Check if _determineRoot was effectively called (by checking the result on this.root)
        });

        it('should initialize with undefined root if contextRootIdentifier is not provided', () => {
            RootManagerValidator.validateSourceString.mockReturnValue(false); // Simulate invalid undefined input
            const manager = new RootManager({ config: mockConfig });
            expect(manager.config).toBe(mockConfig);
            expect(manager.contextRootIdentifier).toBeUndefined();
            expect(manager.root).toBeNull(); // Because validation fails for undefined sourceString
        });

        it('should initialize with null root if _determineRoot returns null', () => {
            const identifier = 'invalidKey';
            RootManagerValidator.validateSourceString.mockReturnValue(true); // Assume key format is valid
            const manager = new RootManager({ config: mockConfig, contextRootIdentifier: identifier });
            expect(manager.root).toBeNull(); // Key not found in map
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`Source string '${identifier}' is not a valid key`));
        });

         it('should throw error during construction if _determineRoot throws', () => {
            const identifier = 'invalidKey';
            const errorMsg = `Could not determine remote context root. Source string '${identifier}' is not a valid key in the context root map`;
            // Mock _determineRoot to throw (simulated via map lookup failure with throwError=true implicitly in constructor)
             expect(() => new RootManager({ config: mockConfig, contextRootIdentifier: identifier })).toThrow(errorMsg);
        });
    });

    // --- _determineRoot Tests ---
    describe('_determineRoot', () => {
        let manager;
        beforeEach(() => {
            // Create instance without initial root determination for isolated testing
            manager = new RootManager({ config: mockConfig });
            manager.root = undefined; // Reset root potentially set by constructor
            consoleErrorSpy.mockClear(); // Clear logs from constructor
        });

        it('should return the correct root object for a valid source string', () => {
            const source = 'validKey';
            const expectedRoot = mockConfig.contextRootMap.rootMap[source];
            const root = manager._determineRoot(source);
            expect(root).toEqual(expectedRoot);
            expect(RootManagerValidator.validateSourceString).toHaveBeenCalledWith(source, 'determine', true, true);
            expect(consoleDebugSpy).toHaveBeenCalledWith(`[DEBUG] determineContextRoot called with: ${source}`);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return null and log error if source string is not in the map (throwError=true)', () => {
            const source = 'notFoundKey';
            RootManagerValidator.validateSourceString.mockReturnValue(true); // Assume format is valid
            expect(() => manager._determineRoot(source, true, true)).toThrow(`Could not determine remote context root. Source string '${source}' is not a valid key in the context root map`);
            // Error is thrown, so it doesn't return null directly, but the caller would catch it.
            // Let's test the non-throwing case for null return.
        });

         it('should return null and log error if source string is not in the map (throwError=false, logError=true)', () => {
            const source = 'notFoundKey';
            RootManagerValidator.validateSourceString.mockReturnValue(true); // Assume format is valid
            const root = manager._determineRoot(source, false, true);
            expect(root).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`Source string '${source}' is not a valid key`));
        });

        it('should return null and not log error if source string is not in the map (throwError=false, logError=false)', () => {
            const source = 'notFoundKey';
            RootManagerValidator.validateSourceString.mockReturnValue(true); // Assume format is valid
            const root = manager._determineRoot(source, false, false);
            expect(root).toBeNull();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return null if validator fails and throwError is false', () => {
            const source = 'invalidFormat';
            RootManagerValidator.validateSourceString.mockReturnValue(false);
            const root = manager._determineRoot(source, false, true);
            expect(root).toBeNull();
            // Validator mock should handle logging if logError is true
            expect(RootManagerValidator.validateSourceString).toHaveBeenCalledWith(source, 'determine', false, true);
        });

        it('should throw error if validator fails and throwError is true', () => {
            const source = 'invalidFormat';
            const validationError = new Error("Validation failed");
            RootManagerValidator.validateSourceString.mockImplementation(() => { throw validationError; });
            expect(() => manager._determineRoot(source, true, true)).toThrow(validationError);
            expect(RootManagerValidator.validateSourceString).toHaveBeenCalledWith(source, 'determine', true, true);
        });
    });

    // --- _setRootProperty Tests ---
    describe('_setRootProperty', () => {
         let manager;
         beforeEach(() => {
            manager = new RootManager({ config: mockConfig });
            consoleWarnSpy.mockClear();
         });

        it('should set the root property on a valid target object', () => {
            const target = {};
            const rootValue = { id: 'testRoot' };
            manager._setRootProperty(target, rootValue, 'testSource');
            expect(target.root).toEqual(rootValue);
            expect(manager.root).toBeUndefined(); // Should not set on instance if target is different
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should set the root property on the instance if target is this', () => {
            const rootValue = { id: 'instanceRoot' };
            manager._setRootProperty(manager, rootValue, 'instanceSource');
            expect(manager.root).toEqual(rootValue);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should log a warning if the target is invalid (null)', () => {
            const target = null;
            const rootValue = { id: 'testRoot' };
            manager._setRootProperty(target, rootValue, 'nullTargetSource');
            expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] _manageRootInternal: Cannot set root property on invalid target for source 'nullTargetSource'.");
        });

        it('should log a warning if the target is invalid (not an object)', () => {
            const target = 'not_an_object';
            const rootValue = { id: 'testRoot' };
            manager._setRootProperty(target, rootValue, 'stringTargetSource');
            expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] _manageRootInternal: Cannot set root property on invalid target for source 'stringTargetSource'.");
        });
    });

    // --- _manageRootInternal Tests ---
    describe('_manageRootInternal', () => {
        let manager;
        const source = 'validKey';
        const expectedRoot = mockConfig.contextRootMap.rootMap[source];

        beforeEach(() => {
            manager = new RootManager({ config: mockConfig });
            // Clear potential root set by constructor and logs
            manager.root = undefined;
            consoleErrorSpy.mockClear();
            consoleDebugSpy.mockClear();
            RootManagerValidator.validateManageRootArgs.mockReturnValue(true); // Assume valid args by default
            RootManagerValidator.validateSourceString.mockReturnValue(true); // Assume valid source by default
        });

        it('should return null if argument validation fails (throwError=false)', () => {
            RootManagerValidator.validateManageRootArgs.mockReturnValue(false);
            const result = manager._manageRootInternal({ source, throwError: false, logError: true });
            expect(result).toBeNull();
            expect(RootManagerValidator.validateManageRootArgs).toHaveBeenCalledWith(expect.any(Object), false, true);
            // Validator mock should handle logging
        });

        it('should throw error if argument validation fails (throwError=true)', () => {
            const validationError = new Error("Arg validation failed");
            RootManagerValidator.validateManageRootArgs.mockImplementation(() => { throw validationError; });
            expect(() => manager._manageRootInternal({ source, throwError: true, logError: true })).toThrow(validationError);
            expect(RootManagerValidator.validateManageRootArgs).toHaveBeenCalledWith(expect.any(Object), true, true);
        });

        it('should determine root, set property on target (default=this), and return undefined (default)', () => {
            const result = manager._manageRootInternal({ source });
            expect(result).toBeUndefined();
            expect(manager.root).toEqual(expectedRoot); // Property set on instance
            expect(consoleDebugSpy).toHaveBeenCalledWith(`[DEBUG] determineContextRoot called with: ${source}`);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should determine root, set property on target, and return root (returnValue=true)', () => {
            const result = manager._manageRootInternal({ source, returnValue: true });
            expect(result).toEqual(expectedRoot);
            expect(manager.root).toEqual(expectedRoot); // Property set on instance
        });

        it('should determine root, NOT set property (setProperty=false), and return undefined (default)', () => {
            const result = manager._manageRootInternal({ source, setProperty: false });
            expect(result).toBeUndefined();
            expect(manager.root).toBeUndefined(); // Property NOT set on instance
        });

        it('should determine root, NOT set property (setProperty=false), and return root (returnValue=true)', () => {
            const result = manager._manageRootInternal({ source, setProperty: false, returnValue: true });
            expect(result).toEqual(expectedRoot);
            expect(manager.root).toBeUndefined(); // Property NOT set on instance
        });

        it('should set property on a specified target object', () => {
            const target = {};
            const result = manager._manageRootInternal({ source, target, setProperty: true });
            expect(result).toBeUndefined();
            expect(target.root).toEqual(expectedRoot);
            expect(manager.root).toBeUndefined(); // Not set on instance
        });

        it('should return null if _determineRoot returns null (e.g., key not found, throwError=false)', () => {
            const invalidSource = 'notFound';
            // Mock _determineRoot directly for simplicity, or rely on its tested behavior
            jest.spyOn(manager, '_determineRoot').mockReturnValue(null);
            const result = manager._manageRootInternal({ source: invalidSource, throwError: false, logError: true });
            expect(result).toBeNull();
            expect(manager._determineRoot).toHaveBeenCalledWith(invalidSource, false, true);
            // Logging should happen within _determineRoot if logError is true
        });

        it('should throw error if _determineRoot throws (throwError=true)', () => {
            const invalidSource = 'notFound';
            const determinationError = new Error("Determination failed");
            jest.spyOn(manager, '_determineRoot').mockImplementation(() => { throw determinationError; });
            expect(() => manager._manageRootInternal({ source: invalidSource, throwError: true, logError: true })).toThrow(determinationError);
            expect(manager._determineRoot).toHaveBeenCalledWith(invalidSource, true, true);
        });

        it('should catch and log unexpected errors within the try block (logError=true)', () => {
            const unexpectedError = new Error("Unexpected");
            jest.spyOn(manager, '_determineRoot').mockReturnValue(expectedRoot); // Assume determination works
            jest.spyOn(manager, '_setRootProperty').mockImplementation(() => { throw unexpectedError; }); // Error during setProperty

            const result = manager._manageRootInternal({ source, setProperty: true, throwError: false, logError: true, operationName: 'customOp' });

            expect(result).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(`Error during customOp root: ${unexpectedError.message}`);
        });

         it('should return null and not log unexpected errors if logError is false', () => {
            const unexpectedError = new Error("Unexpected");
            jest.spyOn(manager, '_determineRoot').mockReturnValue(expectedRoot);
            jest.spyOn(manager, '_setRootProperty').mockImplementation(() => { throw unexpectedError; });

            const result = manager._manageRootInternal({ source, setProperty: true, throwError: false, logError: false });

            expect(result).toBeNull();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    // --- setRoot Tests ---
    describe('setRoot', () => {
        let manager;
        let manageInternalSpy;

        beforeEach(() => {
            manager = new RootManager({ config: mockConfig });
            manageInternalSpy = jest.spyOn(manager, '_manageRootInternal');
        });

        it('should call _manageRootInternal with correct defaults', () => {
            const source = 'validKey';
            manager.setRoot({ source });
            expect(manageInternalSpy).toHaveBeenCalledWith({
                source,
                target: manager, // Default target is 'this'
                returnValue: false, // Default
                setProperty: true, // Default for setRoot
                operationName: 'set', // Specific to setRoot
                throwError: true, // Default
                logError: true // Default
            });
        });

        it('should pass through all arguments to _manageRootInternal', () => {
            const source = 'anotherKey';
            const target = {};
            const returnValue = true;
            const setProperty = false; // Overriding default
            const throwError = false;
            const logError = false;

            manager.setRoot({ source, target, returnValue, setProperty, throwError, logError });

            expect(manageInternalSpy).toHaveBeenCalledWith({
                source,
                target,
                returnValue,
                setProperty,
                operationName: 'set',
                throwError,
                logError
            });
        });

        it('should return the result of _manageRootInternal', () => {
            const expectedResult = { status: 'set success' };
            manageInternalSpy.mockReturnValue(expectedResult);
            const result = manager.setRoot({ source: 'validKey' });
            expect(result).toBe(expectedResult);
        });
    });

    // --- getRoot Tests ---
    describe('getRoot', () => {
        let manager;
        let manageInternalSpy;

        beforeEach(() => {
            manager = new RootManager({ config: mockConfig });
            manageInternalSpy = jest.spyOn(manager, '_manageRootInternal');
        });

        it('should call _manageRootInternal with correct defaults', () => {
            const source = 'validKey';
            manager.getRoot({ source });
            expect(manageInternalSpy).toHaveBeenCalledWith({
                source,
                target: manager, // Default target is 'this'
                returnValue: true, // Default for getRoot
                setProperty: false, // Default for getRoot
                operationName: 'get', // Specific to getRoot
                throwError: true, // Default
                logError: true // Default
            });
        });

        it('should pass through all arguments to _manageRootInternal', () => {
            const source = 'anotherKey';
            const target = {};
            const returnValue = false; // Overriding default
            const setProperty = true; // Overriding default
            const throwError = false;
            const logError = false;

            manager.getRoot({ source, target, returnValue, setProperty, throwError, logError });

            expect(manageInternalSpy).toHaveBeenCalledWith({
                source,
                target,
                returnValue,
                setProperty,
                operationName: 'get',
                throwError,
                logError
            });
        });

        it('should return the result of _manageRootInternal', () => {
            const expectedResult = mockConfig.contextRootMap.rootMap['validKey'];
            manageInternalSpy.mockReturnValue(expectedResult);
            const result = manager.getRoot({ source: 'validKey' });
            expect(result).toBe(expectedResult);
        });
    });
});