// ./tests/mocks/mockHooks.js

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
}

export default MockHooks;