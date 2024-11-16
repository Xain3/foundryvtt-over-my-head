// ./src/utils/remoteContextManager.js

/**
 * A centralized manager for handling remote context operations.
 * @property {Object} remoteContext - The remote context object.
 */
class RemoteContextManager {
    constructor() {
        this.remoteContext = {}; // Initialize as needed
    }

    /**
     * Merges the provided data into the existing remote context.
     *
     * @param {Object} data - The data to be merged into the remote context.
     */
    pushToRemoteContext(data) {
        Object.assign(this.remoteContext, data);
    }

    /**
     * Retrieves the current remote context.
     *
     * @returns {Object} The remote context.
     */
    pullFromRemoteContext() {
        return this.remoteContext;
    }
    
    /**
     * Writes a key-value pair to the remote context.
     *
     * @param {string} key - The key to be added or updated in the remote context.
     * @param {*} value - The value to be associated with the key in the remote context.
     */
    writeToRemoteContext(key, value) {
        this.remoteContext[key] = value;
    }

    /**
     * Reads a value from the remote context using the provided key.
     *
     * @param {string} key - The key to look up in the remote context.
     * @returns {*} The value associated with the provided key in the remote context.
     */
    readFromRemoteContext(key) {
        return this.remoteContext[key];
    }

    /**
     * Clears all properties from the remoteContext object.
     * Iterates over each key in the remoteContext object and deletes it.
     */
    clearRemoteContext() {
        Object.keys(this.remoteContext).forEach(key => delete this.remoteContext[key]);
    }

    /**
     * Retrieves the remote context path from the given module object.
     *
     * @param {Object} moduleObject - The module object containing the context.
     * @param {string} contextPath - The path to the specific context within the module.
     * @param {Object} [initData={}] - Optional initial data to set if the module context is not defined.
     * @returns {*} The value at the specified context path within the module context.
     * @throws {Error} If the moduleObject is undefined.
     */
    getRemoteContextPath(moduleObject, contextPath, initData = {}) {
        if (!moduleObject) {
            throw new Error('moduleObject is undefined');
        }
        if (!moduleObject.moduleContext) {
            moduleObject.moduleContext = initData;
        }
        return moduleObject.moduleContext[contextPath];
    }
}

export default RemoteContextManager;