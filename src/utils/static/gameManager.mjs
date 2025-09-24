/**
 * @file gameManager.mjs
 * @description A static utility class for managing game modules and remote contexts.
 * @path src/utils/static/gameManager.mjs
 */

/**
 * A static utility class for managing game modules and remote contexts.
 * GameManager provides static methods to interact with module objects,
 * acting as a bridge between the game system and module configurations.
 *
 * @class GameManager
 * @static
 */
class GameManager {

    /**
     * Retrieves a module object by its identifier from the game modules collection.
     * Accepts either a manifest object containing an 'id' property, or a string module name.
     *
     * @static
     * @method getModuleObject
     * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name).
     * @returns {Object|null} The module object or null if not found.
     *
     * @example
     * // Using a string identifier
     * const module = GameManager.getModuleObject('my-module-id');
     *
     * @example
     * // Using a manifest object
     * const manifest = { id: 'my-module-id', name: 'My Module' };
     * const module = GameManager.getModuleObject(manifest);
     *
     * @example
     * // Using a module.json object
     * import moduleJson from './module.json';
     * const module = GameManager.getModuleObject(moduleJson);
     */
    static getModuleObject(moduleIdentifier) {
        // Extract module ID from different input types
        let moduleId;

        if (typeof moduleIdentifier === 'string') {
            moduleId = moduleIdentifier;
        } else if (typeof moduleIdentifier === 'object' && moduleIdentifier !== null) {
            // Check for 'id' property (manifest.mjs format)
            if (moduleIdentifier.id) {
                moduleId = moduleIdentifier.id;
            }
            // Check for 'name' property (alternative format)
            else if (moduleIdentifier.name) {
                moduleId = moduleIdentifier.name;
            }
            else {
                console.error('GameManager.getModuleObject: Module identifier object must have either "id" or "name" property.');
                return null;
            }
        } else {
            console.error('GameManager.getModuleObject: Module identifier must be a string or an object with "id" or "name" property.');
            return null;
        }

        // Try to get module from global game object first
        if (globalThis.game && globalThis.game.modules && typeof globalThis.game.modules.get === 'function') {
            return globalThis.game.modules.get(moduleId);
        }

        // Error handling
        if (!globalThis.game) {
            console.error('GameManager.getModuleObject: Game object is not available in global scope.');
        } else if (!globalThis.game.modules) {
            console.error('GameManager.getModuleObject: Game modules collection is not available.');
        } else {
            console.error('GameManager.getModuleObject: Game modules collection does not have a get function.');
        }

        return null;
    }

    static getSetting(moduleId, key) {
        return globalThis.game?.settings.get(moduleId, key);
    }

    /**
     * Writes a key-value pair to a module object.
     *
     * @static
     * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name).
     * @param {string} key - The key to be added or updated in the module object.
     * @param {*} value - The value to be associated with the key in the module object.
     * @returns {boolean} True if the operation was successful, false otherwise.
     *
     * @example
     * // Write to module using string identifier
     * GameManager.writeToModuleObject('my-module', 'customData', { setting: true });
     *
     * @example
     * // Write to module using manifest object
     * const manifest = { id: 'my-module' };
     * GameManager.writeToModuleObject(manifest, 'status', 'active');
     */
    static writeToModuleObject(moduleIdentifier, key, value) {
        const moduleObject = this.getModuleObject(moduleIdentifier);

        if (!moduleObject) {
            console.error('GameManager.writeToModuleObject: Could not retrieve module object.');
            return false;
        }

        try {
            moduleObject[key] = value;
            return true;
        } catch (error) {
            console.error(`GameManager.writeToModuleObject: Failed to write to module object. Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Reads a value from a module object using the provided key.
     *
     * @static
     * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name).
     * @param {string} key - The key to look up in the module object.
     * @returns {*} The value associated with the provided key, or undefined if not found.
     *
     * @example
     * // Read from module using string identifier
     * const data = GameManager.readFromModuleObject('my-module', 'customData');
     *
     * @example
     * // Read from module using manifest object
     * const manifest = { id: 'my-module' };
     * const status = GameManager.readFromModuleObject(manifest, 'status');
     */
    static readFromModuleObject(moduleIdentifier, key) {
        const moduleObject = this.getModuleObject(moduleIdentifier);

        if (!moduleObject) {
            console.error('GameManager.readFromModuleObject: Could not retrieve module object.');
            return undefined;
        }

        return moduleObject[key];
    }

    /**
     * Checks if a module exists in the game modules collection.
     *
     * @static
     * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name).
     * @returns {boolean} True if the module exists, false otherwise.
     *
     * @example
     * // Check if module exists using string identifier
     * const exists = GameManager.moduleExists('my-module');
     *
     * @example
     * // Check if module exists using manifest object
     * const manifest = { id: 'my-module' };
     * const exists = GameManager.moduleExists(manifest);
     */
    static moduleExists(moduleIdentifier) {
        return this.getModuleObject(moduleIdentifier) !== null;
    }

    /**
     * Gets utility information about the GameManager.
     *
     * @static
     * @returns {Object} Object containing utility information.
     *
     * @example
     * const info = GameManager.getUtilityInfo();
     * console.log(info.name); // 'GameManager'
     */
    static getUtilityInfo() {
        return {
            name: 'GameManager',
            type: 'static',
            description: 'Static utility class for managing game modules and remote contexts',
            version: '2.0.0',
            methods: ['getModuleObject', 'writeToModuleObject', 'readFromModuleObject', 'moduleExists']
        };
    }
}

export default GameManager;
export { GameManager };
