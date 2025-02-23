// ./config/mockConfig.js

import MockHooks from './mockHooks.js';
import MockConstants from './mockConstants.js';

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
    };

    getRemoteContextManager() {
        return this.REMOTE_CONTEXT_MANAGER;
    }
}

export default MockConfig;