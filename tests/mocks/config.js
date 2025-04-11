// @mocks/config.js

import MockHooks from './hooks.js';
import MockConstants from './constants.js';

class MockConfig {
    constructor() {
        this.CONSTANTS = new MockConstants();
        this.HOOKS = new MockHooks();
        this.REMOTE_CONTEXT_MANAGER = {
            getRemoteContextPath: jest.fn().mockReturnValue('/mock/remote/context/path'),
            pushToRemoteContext: jest.fn(),
            pullFromRemoteContext: jest.fn().mockResolvedValue({}),
            writeToRemoteContext: jest.fn(),
            readFromRemoteContext: jest.fn().mockReturnValue('mockValue'),
            clearRemoteContext: jest.fn(),
        };
        this.CONTEXT_INIT = {
            getContext: jest.fn().mockReturnValue({
                get: jest.fn(),
                set: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                has: jest.fn(),
                getAll: jest.fn(),
                getAllKeys: jest.fn(),
                getAllValues: jest.fn(),
                getAllEntries: jest.fn(),
                getAllKeysAndValues: jest.fn(),
                getAllEntriesAndValues: jest.fn(),
            })
        };
    };

    getRemoteContextManager() {
        return this.REMOTE_CONTEXT_MANAGER;
    }

    getConfig() {
        return {
            CONSTANTS: this.CONSTANTS,
            HOOKS: this.HOOKS,
            REMOTE_CONTEXT_MANAGER: this.REMOTE_CONTEXT_MANAGER,
        };
    }

    initializeSettings = jest.fn(() => { });
}

export default MockConfig;