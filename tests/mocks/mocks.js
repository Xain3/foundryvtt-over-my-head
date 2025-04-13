// @mocks/mocks.js

import MockConfig from './config.js';
import MockContext from './context.js';
import MockConstants from './constants.js';
import MockUtilities from './utils.js';
import MockHooks from './hooks.js';
import MockObjects from './objects.js';
// import MockTokens from './mockTokens.js';
// import MockTiles from './mockTiles.js';

export const config = new MockConfig();
export const context = new MockContext();
export const constants = new MockConstants();
export const utils = new MockUtilities();
export const hooks = new MockHooks();
export const mockObjects = new MockObjects();

/**
 * @class Mocks
 * @description A utility class for managing and accessing mock objects during testing for FoundryVTT.
 * @static
 * 
 * @property {MockConfig} config - Configuration mocks container.
 * @property {MockContext} context - Context mocks container.
 * @property {MockConstants} constants - Constants mocks container.
 * @property {MockUtilities} utils - Utility mocks container.
 * @property {MockHooks} hooks - Hooks mocks container.
 * @property {MockObjects} mockObjects - Mock objects container.
 * 
 * @example
 * // Get all mock objects
 * const allMocks = Mocks.getAllMocks();
 * 
 * // Get specific mock category
 * const configMocks = Mocks.getConfig();
 */
class Mocks {
    /** @type {MockConfig} Configuration mock object */
    static config = config;
    
    /** @type {MockContext} Context mock object */
    static context = context;
    
    /** @type {MockConstants} Constants mock object */
    static constants = constants;
    
    /** @type {MockUtilities} Utility mock object */
    static utils = utils;
    
    /** @type {MockHooks} Hooks mock object */
    static hooks = hooks;

    /** @type {MockObjects} Mock objects container */
    static objects = mockObjects;

    /**
     * Returns all mock objects in a consolidated object
     * @returns {Object} Object containing all mock categories
     * @property {MockConfig} config - Configuration mocks
     * @property {MockContext} context - Context mocks
     * @property {MockConstants} constants - Constants mocks
     * @property {MockUtilities} utils - Utility mocks
     * @property {MockHooks} hooks - Hooks mocks
     * @property {MockObjects} objects - Mock objects
     */
    static getAllMocks() {
        return {
            config: this.config,
            context: this.context,
            constants: this.constants,
            utils: this.utils,
            hooks: this.hooks,
            objects: this.objects,
        };
    }

    /**
     * Returns the configuration mock object
     * @returns {MockConfig} The configuration mock
     */
    static getMockConfig() {
        return this.config;
    }

    /**
     * Returns the context mock object
     * @returns {MockContext} The context mock
     */
    static getMockContext() {
        return this.context;
    }

    /**
     * Returns the constants mock object
     * @returns {MockConstants} The constants mock
     */
    static getMockConstants() {
        return this.constants;
    }

    /**
     * Returns the utilities mock object
     * @returns {MockUtilities} The utilities mock
     */
    static getMockUtils() {
        return this.utils;
    }

    /**
     * Returns the hooks mock object
     * @returns {MockHooks} The hooks mock
     */
    static getMockHooks() {
        return this.hooks;
    }

    /**
     * Returns the mock objects
     * @returns {MockObjects} The mock objects
     */
    static getMockObjects() {
        return this.objects;
    }

    
    /**
     * Sets global objects required for the testing environment.
     * Delegates the setup to `this.objects.setMockGlobals()`.
     * @returns {*} The result returned by `this.objects.setMockGlobals()`.
     */
    static setGlobals() {
        return this.objects.setMockGlobals();
    }
}

export default Mocks;