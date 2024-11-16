// ./src/utils/remoteContextManager.js

/**
 * A centralized manager for handling remote context operations.
 */
class RemoteContextManager {
    constructor() {
                this.remoteContext = {}; // Initialize as needed
    }

    pushToRemoteContext(data) {
        Object.assign(this.remoteContext, data);
    }

    pullFromRemoteContext() {
        return this.remoteContext;
    }
    
    writeToRemoteContext(key, value) {
        this.remoteContext[key] = value;
    }

    readFromRemoteContext(key) {
        return this.remoteContext[key];
    }

    clearRemoteContext() {
        Object.keys(this.remoteContext).forEach(key => delete this.remoteContext[key]);
    }

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