import GameManager from './gameManager';
import Utility from '../baseClasses/utility';

jest.mock('../baseClasses/utility');

describe("GameManager", () => {
    let mockConfig, gameManager, fakeModule, spyUpdateConfig;

    beforeEach(() => {
        // Mocking the Utility class
        Utility.mockClear();
        fakeModule = {};
        mockConfig = {
            CONSTANTS: {
                CONTEXT_INIT: { init: true },
                MODULE: { ID: 'module1', CONTEXT_REMOTE: '/remote' }
            }
        };
        
        // Creating a spy for the updateConfig method
        spyUpdateConfig = jest.spyOn(GameManager.prototype, 'updateConfig');
        // Creating an instance of GameManager
        gameManager = new GameManager(mockConfig);
        // Set up a valid game object so that getModuleObject works correctly.
        gameManager.game = { modules: { get: jest.fn(() => fakeModule) } };
    });
    
    describe('constructor', () => {
         it('should extend Utility class', () => {
            expect(gameManager).toBeInstanceOf(Utility);
        }
        );
        it('should call super constructor with correct arguments', () => {
            expect(Utility).toHaveBeenCalledWith(mockConfig, { shouldLoadConfig: true, shouldLoadGame: true });
        });
        it('should call updateConfig with config when initialised', () => { 
            expect(spyUpdateConfig).toHaveBeenCalledWith(mockConfig);
        });
    });

    describe('updateConfig', () => {
        it('should update config and constants', () => {
            const newConfig = {
                CONSTANTS: {
                    CONTEXT_INIT: { init: false },
                    MODULE: { ID: 'module2', CONTEXT_REMOTE: '/newRemote' }
                }
            };
            gameManager.updateConfig(newConfig);
            expect(gameManager.const).toEqual(newConfig.CONSTANTS);
            expect(gameManager.moduleConstants).toEqual(newConfig.CONSTANTS.MODULE);
        });
        
        it('should call getModuleObject with the new module ID', () => {
            const newModuleConfig = { ID: 'module2' };
            gameManager.getModuleObject = jest.fn();
            gameManager.updateConfig({ CONSTANTS: { MODULE: newModuleConfig } });
            expect(gameManager.getModuleObject).toHaveBeenCalledWith(newModuleConfig);
        });
    });

    it('should retrieve the correct module object using getModuleObject', () => {
        const moduleConfig = { ID: 'module1' };
        const result = gameManager.getModuleObject(moduleConfig);
        expect(gameManager.game.modules.get).toHaveBeenCalledWith(moduleConfig.ID);
        expect(result).toBe(fakeModule);
    });
    
    it('should return null and log errors if game object is unavailable in getModuleObject', () => {
        gameManager.game = null;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const result = gameManager.getModuleObject({ ID: 'module1' });
    
        expect(consoleErrorSpy).toHaveBeenCalledWith('Game object is not available in instance or global scope.');
        expect(result).toBeNull();
        consoleErrorSpy.mockRestore();
    });
    
    it('should write key-value pairs to the module object using writeToModuleObject', () => {
        gameManager.moduleObject = {};
        gameManager.writeToModuleObject('key1', 'value1');
        expect(gameManager.moduleObject.key1).toBe('value1');
    });
    
    it('should read values from the module object using readFromModuleObject', () => {
        gameManager.moduleObject = { key1: 'value1' };
        const result = gameManager.readFromModuleObject('key1');
        expect(result).toBe('value1');
    });
    
    describe('getModuleObject', () => {
        it('should return module object from instance game.modules if available', () => {
            const moduleConfig = { ID: 'module1' };
            const result = gameManager.getModuleObject(moduleConfig);
            
            expect(gameManager.game.modules.get).toHaveBeenCalledWith(moduleConfig.ID);
            expect(result).toBe(fakeModule);
        });
    
        it('should try global game.modules if instance property fails', () => {
            // Remove instance game property
            gameManager.game.modules = null;
            
            // Mock global game object
            const originalGlobalGame = globalThis.game;
            const mockGlobalModule = { name: 'globalModule' };
            globalThis.game = {
                modules: {
                    get: jest.fn(() => mockGlobalModule)
                }
            };
    
            const moduleConfig = { ID: 'module2' };
            const result = gameManager.getModuleObject(moduleConfig);
            
            expect(globalThis.game.modules.get).toHaveBeenCalledWith(moduleConfig.ID);
            expect(result).toBe(mockGlobalModule);
            
            // Restore global game
            globalThis.game = originalGlobalGame;
        });
    
        it('should log error if game object is not available', () => {
            gameManager.game = null;
            const originalGlobalGame = globalThis.game;
            globalThis.game = undefined;
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const result = gameManager.getModuleObject({ ID: 'module3' });
            
            expect(consoleSpy).toHaveBeenCalledWith('Game object is not available in instance or global scope.');
            expect(result).toBeNull();
            
            consoleSpy.mockRestore();
            globalThis.game = originalGlobalGame;
        });
    
        it('should log error if modules collection is not available', () => {
            gameManager.game = {};
            const originalGlobalGame = globalThis.game;
            globalThis.game = {};
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const result = gameManager.getModuleObject({ ID: 'module4' });
            
            expect(consoleSpy).toHaveBeenCalledWith('Game modules collection is not available.');
            expect(result).toBeNull();
            
            consoleSpy.mockRestore();
            globalThis.game = originalGlobalGame;
        });
    
        it('should log error if modules collection does not have get function', () => {
            gameManager.game = { modules: {} };
            const originalGlobalGame = globalThis.game;
            globalThis.game = { modules: {} };
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const result = gameManager.getModuleObject({ ID: 'module5' });
            
            expect(consoleSpy).toHaveBeenCalledWith('Game modules collection does not have a get function.');
            expect(result).toBeNull();
            
            consoleSpy.mockRestore();
            globalThis.game = originalGlobalGame;
        });
    });
});