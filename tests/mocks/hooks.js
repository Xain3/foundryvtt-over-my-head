// @mocks/hooks.js

class MockHooks {
    constructor() {
        this.OUT = {
            updateEnabled: "updateEnabled",
            updateDebugMode: "updateDebugMode",
            settingsReady: "settingsReady",
        };
        this.IN = {
            logState: "logState",
            logRemoteState: "logRemoteState",
            getRemoteState: "getRemoteState",
        };
        this.BUILT_IN = {
            ready: "ready",
        };
        this.SETTINGS = {
            NO_PREFIX_GROUPS: ["BUILT_IN"], // Groups that do not require a prefix
            ALLOWED_GROUPS: ["OUT", "IN", "BUILT_IN"], // Allowed groups for hooks
            DEFAULT_GROUP: "BUILT_IN", // Default group for hooks
        };

    }

    getMappings() {
        return {
            groupWithPrefix: {
                hookA: 'HookA',
                hookC: 'HookC',
            },
            groupWithoutPrefix: {
                hookB: 'HookB',
                hookD: 'HookD',
            },
        };
    }

    getSettings() {
        return {
            NO_PREFIX_GROUPS: ['groupWithoutPrefix'],
            ALLOWED_GROUPS: ['groupWithPrefix', 'groupWithoutPrefix'],
            DEFAULT_GROUP: 'groupWithPrefix',
        };
    }
    
    static on(event, callback) {
        jest.fn();
        return {
            event,
            callback,
        };
    }
    static off(event, callback) {
        jest.fn();
        return {
            event,
            callback,
        };
    }
    static once(event, callback) {
        jest.fn();
        return {
            event,
            callback,
        };
    }

    static onError(event, callback) {
        jest.fn();
        return {
            event,
            callback,
        };
    }
    
    static emit(event, ...args) {
        return {
            event,
            args,
        };
    }

    static callAll(event, ...args) {
        return true;
    }

    static callAllAsync(event, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncParallel(event, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncSequential(event, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeout(event, timeout, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutParallel(event, timeout, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutSequential(event, timeout, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutAndDelay(event, timeout, delay, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutAndDelayParallel(event, timeout, delay, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutAndDelaySequential(event, timeout, delay, ...args) {
        return Promise.resolve(true);
    }

    static callAllAsyncWithTimeoutAndDelayAndError(event, timeout, delay, error, ...args) {
        return Promise.reject(error);
    }

    static callAllAsyncWithTimeoutAndDelayAndErrorParallel(event, timeout, delay, error, ...args) {
        return Promise.reject(error);
    }
    
    static callAllAsyncWithTimeoutAndDelayAndErrorSequential(event, timeout, delay, error, ...args) {
        return Promise.reject(error);
    }
    
    static callAllAsyncWithTimeoutAndDelayAndErrorWithLogging(event, timeout, delay, error, ...args) {
        console.error('Error occurred:', error);
        return Promise.reject(error);
    }


    static callAllAsyncWithTimeoutAndDelayAndErrorWithLoggingAndCallback(event, timeout, delay, error, callback, ...args) {
        console.error('Error occurred:', error);
        if (callback) {
            callback(error);
        }
        return Promise.reject(error);
    }
}

export default MockHooks;