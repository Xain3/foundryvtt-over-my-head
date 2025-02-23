import GameManager from './gameManager';

describe("GameManager", () => {
    let config, remoteContextManager, gameManager, fakeModule;

    beforeEach(() => {
        fakeModule = {};
        config = {
            CONSTANTS: {
                CONTEXT_INIT: { init: true },
                MODULE: { ID: 'module1', CONTEXT_REMOTE: '/remote' }
            }
        };
        remoteContextManager = {
            getRemoteContextPath: jest.fn(() => 'fakeRemoteContext'),
            pushToRemoteContext: jest.fn(),
            pullFromRemoteContext: jest.fn(() => Promise.resolve('remoteData')),
            writeToRemoteContext: jest.fn(),
            readFromRemoteContext: jest.fn(() => 'remoteVal'),
            clearRemoteContext: jest.fn()
        };
        gameManager = new GameManager(config, remoteContextManager);
        // Set up a valid game object so that getModuleObject works correctly.
        gameManager.game = { modules: { get: jest.fn(() => fakeModule) } };
        gameManager.updateConfig(config);
    });

    test("updateConfig assigns correct properties and sets remoteContext", () => {
        expect(gameManager.const).toEqual(config.CONSTANTS);
        expect(gameManager.contextInit).toEqual(config.CONSTANTS.CONTEXT_INIT);
        expect(gameManager.moduleConfig).toEqual(config.CONSTANTS.MODULE);
        expect(gameManager.contextPath).toEqual(config.CONSTANTS.MODULE.CONTEXT_REMOTE);
        expect(remoteContextManager.getRemoteContextPath).toHaveBeenCalledWith(
            fakeModule,
            config.CONSTANTS.MODULE.CONTEXT_REMOTE,
            config.CONSTANTS.CONTEXT_INIT
        );
        expect(gameManager.remoteContext).toEqual('fakeRemoteContext');
    });

    test("writeToModuleObject and readFromModuleObject work correctly", () => {
        gameManager.moduleObject = {};
        gameManager.writeToModuleObject('key1', 'value1');
        expect(gameManager.moduleObject.key1).toEqual('value1');
        expect(gameManager.readFromModuleObject('key1')).toEqual('value1');
    });

    test("pushToRemoteContext calls remoteContextManager.pushToRemoteContext", () => {
        const data = { test: 123 };
        gameManager.pushToRemoteContext(data);
        expect(remoteContextManager.pushToRemoteContext).toHaveBeenCalledWith(data);
    });

    test("pullFromRemoteContext returns correct data", async () => {
        const data = await gameManager.pullFromRemoteContext();
        expect(remoteContextManager.pullFromRemoteContext).toHaveBeenCalled();
        expect(data).toEqual('remoteData');
    });

    test("writeToRemoteContext calls remoteContextManager.writeToRemoteContext", () => {
        gameManager.writeToRemoteContext('key2', 'value2');
        expect(remoteContextManager.writeToRemoteContext).toHaveBeenCalledWith('key2', 'value2');
    });

    test("readFromRemoteContext returns correct value", () => {
        const value = gameManager.readFromRemoteContext('key3');
        expect(remoteContextManager.readFromRemoteContext).toHaveBeenCalledWith('key3');
        expect(value).toEqual('remoteVal');
    });

    test("clearRemoteContext calls remoteContextManager.clearRemoteContext", () => {
        gameManager.clearRemoteContext();
        expect(remoteContextManager.clearRemoteContext).toHaveBeenCalled();
    });

    test("getModuleObject logs error when game is undefined", () => {
        console.error = jest.fn();
        const configObj = { ID: 'any' };
        delete gameManager.game;
        const result = gameManager.getModuleObject(configObj);
        expect(console.error).toHaveBeenCalledWith('game is undefined.');
        expect(result).toBeNull();
    });

    test("getModuleObject logs error when game.modules is undefined", () => {
        console.error = jest.fn();
        gameManager.game = {};
        const configObj = { ID: 'any' };
        const result = gameManager.getModuleObject(configObj);
        expect(console.error).toHaveBeenCalledWith('game.modules is undefined.');
        expect(result).toBeNull();
    });

    test("getModuleObject logs error when game.modules.get is not a function", () => {
        console.error = jest.fn();
        gameManager.game = { modules: { get: 'notAFunction' } };
        const configObj = { ID: 'any' };
        const result = gameManager.getModuleObject(configObj);
        expect(console.error).toHaveBeenCalledWith('game.modules.get is not a function.');
        expect(result).toBeNull();
    });
});