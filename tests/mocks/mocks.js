// @mocks/mocks.js

import MockConfig from './config.js';
import MockContext from './context.js';
import MockConstants from './constants.js';
import MockUtilities from './utils.js';
import MockHooks from './hooks.js';
import MockObjects from './objects.js';
import MockGame from './game.js';
import MockGlobals from './globals.js';
// import MockTokens from './mockTokens.js';
// import MockTiles from './mockTiles.js';

export const config = new MockConfig();
export const context = new MockContext();
export const constants = new MockConstants();
export const utils = new MockUtilities();
export const mockObjects = new MockObjects();
export const mockGlobals = new MockGlobals();
export const hooks = mockGlobals.hooks;
export const mockGame = mockGlobals.game;

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

    /** @type {MockGame} Game mock object */
    static game = mockGame;

    /** @type {MockGlobals} Globals mock object */
    static globals = mockGlobals;

    /**
     * Returns all mock objects in a consolidated object
     * @returns {Object} Object containing all mock categories
     * @property {MockConfig} config - Configuration mocks
     * @property {MockContext} context - Context mocks
     * @property {MockConstants} constants - Constants mocks
     * @property {MockUtilities} utils - Utility mocks
     * @property {MockHooks} hooks - Hooks mocks
     * @property {MockObjects} objects - Mock objects
     * @property {MockGame} game - Game mock
     * @property {MockGlobals} globals - Globals mock
     */
    static getAllMocks() {
        return {
            config: this.config,
            context: this.context,
            constants: this.constants,
            game: this.game,
            utils: this.utils,
            hooks: this.hooks,
            globals: this.globals,  
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
     * Returns the game mock object
     * @returns {MockGame} The game mock
     */
    static getMockGame() {
        return this.game;
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
     * Sets the global mock objects for testing.
     * @param {Object} [options] - Options for setting globals.
     * @param {boolean} [options.includeBrowserGlobals=false] - Whether to include browser globals.
     * @param {boolean} [options.includeFoundryGlobals=true] - Whether to include FoundryVTT globals.
     * @param {boolean} [options.includeLibraryGlobals=true] - Whether to include library globals.
     * @param {MockGame} [options.mockGame] - Custom mock game object.
     * @param {MockHooks} [options.mockHooks] - Custom mock hooks object.
     * @returns {void}
     * 
     * @example
     * // Set globals with custom options
     * Mocks.setGlobals({
     *   includeBrowserGlobals: true,
     *   includeFoundryGlobals: false,
     *   includeLibraryGlobals: true,
     *   mockGame: new MockGame(),
     *   mockHooks: new MockHooks()
     * });
     * 
     * // Set globals with default options
     * Mocks.setGlobals();
     */
    static setGlobals(options = {}) {
        const {
            includeBrowserGlobals, // Defaults handled by the underlying method
            includeFoundryGlobals, // Defaults handled by the underlying method
            includeLibraryGlobals, // Defaults handled by the underlying method
            mockGame,              // Defaults handled by the underlying method
            mockHooks              // Defaults handled by the underlying method
        } = options;

        // Call the underlying method with individual arguments
        this.globals.setGlobals(
            includeBrowserGlobals,
            includeFoundryGlobals,
            includeLibraryGlobals,
            mockGame,
            mockHooks
        );
    }
}

export default Mocks;