// @mocks/config.js

import MockHooks from './hooks.js';
import MockConstants from './constants.js';

class MockConfig {
    constructor() {
        this.CONSTANTS = new MockConstants();
        this.HOOKS = new MockHooks();
    }

    getConfig() {
        return {
            CONSTANTS: this.CONSTANTS,
            HOOKS: this.HOOKS,
        };
    }

    initializeSettings = jest.fn(() => { });
}

export default MockConfig;