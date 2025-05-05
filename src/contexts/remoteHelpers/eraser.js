import RemoteContextOperator from "./operator";
import { unset, set, get } from 'lodash-es'; // Using lodash for robust path handling

/**
 * @class remoteContextEraser
 * @extends RemoteContextOperator
 * @description Provides functionalities to clear or remove data within a nested object structure,
 * representing a remote context. 
 * It utilizes a central `erase` method to dispatch
 * actions to more specific methods like `clear`, `removeItem`, `removeProperty`, etc.
 * This class operates on a source object and a base location path, allowing targeted
 * modifications within the data structure. It relies on external utility functions
 * (lodash `get`, `set` and `unset`) for manipulating object properties safely.
 *
 * @param {object} config - Configuration object passed to the parent constructor.
 * @param {string} [contextRootIdentifier=undefined] - Identifier for the context root, passed to the parent constructor.
 */
class RemoteContextEraser extends RemoteContextOperator {
    constructor({config, contextRootIdentifier = undefined}) {
        super({config, contextRootIdentifier});
    }

    /**
     * Handles various erase actions by delegating to specific methods based on the provided action type.
     *
     * @param {Object} options - The options for the erase operation.
     * @param {string} [options.action='clear'] - The type of erase action to perform. 
     *     Supported actions include:
     *     - 'clear': Clears all data.
     *     - 'clearItem': Clears a specific item.
     *     - 'clearProperty': Clears a specific property.
     *     - 'clearData': Clears specific data.
     *     - 'clearFlags': Clears specific flags.
     *     - 'clearSettings': Clears specific settings.
     *     - 'remove': Removes all data.
     *     - 'removeItem': Removes a specific item.
     *     - 'removeProperty': Removes a specific property.
     *     - 'removeData': Removes specific data.
     *     - 'removeFlags': Removes specific flags.
     *     - 'removeSettings': Removes specific settings.
     * @param {Object} [options.args={}] - Additional arguments to pass to the specific method handling the action.
     * @throws {Error} Throws an error if the provided action is unsupported.
     * @returns {*} The result of the specific method handling the action.
     */
     erase({ action = 'clear', args = {} }) {
        switch (action) {
            case 'clear':
                return this.clear(args);
            case 'clearItem':
                return this.clearItem(args);
            case 'clearProperty':
                return this.clearProperty(args);
            case 'clearData':
                return this.clearData(args);
            case 'clearFlags':
                return this.clearFlags(args);
            case 'clearSettings':
                return this.clearSettings(args);
            case 'remove':
                return this.remove(args);
            case 'removeItem':
                return this.removeItem(args);
            case 'removeProperty':
                return this.removeProperty(args);
            case 'removeData':
                return this.removeData(args);
            case 'removeFlags':
                return this.removeFlags(args);
            case 'removeSettings':
                return this.removeSettings(args);
            default:
                throw new Error(`Unsupported erase action: ${action}`);
        }
    }

    /**
     * Clears the object at the specified location within the source.
     * Defaults to clearing the main context object at the root.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @returns {object} The cleared object (now {}).
     */
    clear({source = this.remoteContextRoot, location = this.contextObjectPath, key = null}) {
        if (key === null) {    
            // If key is null, clear the entire object at the location
            unset(source, location);
            return get(source, location.split('.')); // Return the actual cleared object
        }
        // If key is provided, clear the specific key within the object at the location
        const fullPath = `${location}.${key}`;
        // Use lodash.set to handle potentially        const fullPath = `${location}.${key}`;
        set(source, fullPath, {});
        return get(source, fullPath.split('.')); // Return the actual cleared objectsplit('.')); // Return the actual cleared objectsplit('.')); // Return the actual cleared objectsplit('.')); // Return the actual cleared objectlit('.')); // Return the actual cleared object
    }

    /**
     * Clears a specific key within the object at the specified location.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @param {string|number|symbol} key - The key within the location object to clear.
     * @returns {object|undefined} The cleared object (now {}) or undefined if the path/key didn't exist.
     */
    clearItem({source = this.remoteContextRoot, location = this.contextObjectPath, key}) {
        const fullPath = `${location}.${key}`;
        // Use lodash.set for safe clearing
        set(source, fullPath, {});
        return get(source, fullPath.split('.'));
    }

    /**
     * Clears a potentially nested property using a full path relative to the location.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @param {string} fullPath - The dot-separated path relative to the location.
     * @returns {object|undefined} The cleared object (now {}) or undefined if the path didn't exist.
     */
    clearProperty({source = this.remoteContextRoot, location = this.contextObjectPath, fullPath}) {
        const completePath = `${location}.${fullPath}`;
        // Use lodash.set for safe clearing
        set(source, completePath, {});
        return get(source, completePath.split('.'));
    }

    /**
     * Clears data at a specific path within a source object.
     * If a key is provided, only that specific key within the path is cleared.
     * Otherwise, the entire object at the path determined by `this.getDataPath()` is cleared.
     *
     * @param {object} options - Configuration options for the clear operation.
     * @param {object} [options.source=this.remoteContextRoot] - The root object from which data should be cleared. Defaults to the instance's remote context root.
     * @param {string|null} [options.key=null] - The specific key within the data path to clear. If null, the entire object at the path is cleared. Defaults to null.
     * @returns {object} The value at the cleared path after the operation (expected to be an empty object `{}`).
     */
    clearData({source = this.remoteContextRoot, key = null}) {
        const path = this.getDataPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        set(source, targetPath, {});
        return get(source, targetPath.split('.'));
    }

    /**
     * Clears flags stored within a source object at a specific path.
     *
     * This function removes either all flags under the path determined by `getFlagsPath()`
     * or a specific flag identified by the `key` within that path by setting the target
     * property to an empty object.
     *
     * @param {object} [options={}] - Configuration options.
     * @param {object} [options.source=this.remoteContextRoot] - The object from which to clear the flags. Defaults to the context's root object.
     * @param {string | null} [options.key=null] - The specific key within the flags path to clear. If null, clears all flags at the base path.
     * @returns {object} The value at the cleared path within the source object (which will be an empty object `{}`).
     */
    clearFlags({source = this.remoteContextRoot, key = null}) {
        const path = this.getFlagsPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        set(source, targetPath, {});
        return get(source, targetPath.split('.'));
    }

    /**
     * Clears settings at the specified path within the source object.
     *
     * @param {object} [options={}] - Options for clearing settings.
     * @param {object} [options.source=this.remoteContextRoot] - The root object from which to retrieve and clear settings. Defaults to `this.remoteContextRoot`.
     * @param {string|null} [options.key=null] - An optional key specifying a sub-path within the settings to clear. If null, clears all settings at the root path determined by `getSettingsPath()`. Defaults to `null`.
     * @returns {object} The newly cleared settings object (an empty object `{}`).
     */
    clearSettings({source = this.remoteContextRoot, key = null}) {
        const path = this.getSettingsPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        set(source, targetPath, {});
        return get(source, targetPath.split('.'));
    }

    /**
     * Removes the object at the specified location from the source.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @returns {object} The modified source object.
     */
    remove({ source = this.remoteContextRoot, location = this.contextObjectPath }) {
        // Use lodash.unset for safe removal
        unset(source, location);
        return source;
    }

    /**
     * Removes a specific key from the object at the specified location.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @param {string|number|symbol} key - The key within the location object to remove.
     * @returns {object} The modified source object.
     */
    removeItem({ source = this.remoteContextRoot, location = this.contextObjectPath, key }) {
        const fullPath = `${location}.${key}`;
        // Use lodash.unset for safe removal
        unset(source, fullPath);
        return source;
    }

    /**
     * Removes a potentially nested property using a full path relative to the location.
     * @param {object} [source=this.remoteContextRoot] - The root object to operate on.
     * @param {string} [location=this.contextObjectPath] - The base path string.
     * @param {string} fullPath - The dot-separated path relative to the location.
     * @returns {object} The modified source object.
     */
    removeProperty({ source = this.remoteContextRoot, location = this.contextObjectPath, fullPath }) {
        const completePath = `${location}.${fullPath}`;
        // Use lodash.unset for safe removal
        unset(source, completePath);
        return source;
    }

    /**
     * Removes data from the source object at the specified key within the context's data path.
     * If no key is provided, it removes the entire data structure at the context's path.
     * Uses an external `unset` function to perform the removal.
     *
     * @param {object} options - The options for removing data.
     * @param {object} [options.source=this.remoteContextRoot] - The source object from which to remove data. Defaults to the context's root object.
     * @param {string | null} [options.key=null] - The specific key within the data path (obtained via `this.getDataPath()`) to remove. If null, the entire data at the path is removed.
     * @returns {object} The modified source object after the data has been removed.
     */
    removeData({ source = this.remoteContextRoot, key = null }) {
        const path = this.getDataPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        unset(source, targetPath);
        return source;
    }

    /**
     * Removes flags from a source object.
     * If a key is provided, only the flag at that specific key is removed.
     * Otherwise, all flags under the base flag path are removed.
     * Uses the `unset` utility function internally.
     *
     * @param {object} options - The options for removing flags.
     * @param {object} [options.source=this.remoteContextRoot] - The object from which to remove flags. Defaults to the context's root object.
     * @param {string|null} [options.key=null] - The specific flag key to remove. If null, removes all flags under the base path determined by `this.getFlagsPath()`.
     * @returns {object} The source object with the specified flags removed.
     */
    removeFlags({ source = this.remoteContextRoot, key = null }) {
        const path = this.getFlagsPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        unset(source, targetPath);
        return source;
    }

    /**
     * Removes settings from a specified source object.
     * It can remove either the entire settings object defined by `this.getSettingsPath()`
     * or a specific key within that object.
     *
     * @param {object} [options={}] - The options for removing settings.
     * @param {object} [options.source=this.remoteContextRoot] - The object from which to remove settings. Defaults to the remote context root.
     * @param {string|null} [options.key=null] - The specific key to remove within the settings path. If null, removes the entire settings path identified by `this.getSettingsPath()`.
     * @returns {object} The modified source object with the specified settings removed.
     */
    removeSettings({ source = this.remoteContextRoot, key = null }) {
        const path = this.getSettingsPath();
        const targetPath = key === null ? path : `${path}.${key}`;
        unset(source, targetPath);
        return source;
    }
}

export default RemoteContextEraser;