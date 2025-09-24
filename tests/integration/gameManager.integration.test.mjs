/**
 * @file gameManager.integration.test.mjs
 * @description Integration tests for GameManager with real manifest and module.json files.
 * @path src/utils/static/gameManager.integration.test.mjs
 */

import GameManager from '../../src/utils/static/gameManager.mjs';
import config from '../../src/config/config.mjs';

import moduleJson from '../../module.json';

describe('GameManager Integration Tests', () => {
    let originalGame;
    let mockModule;

    beforeEach(() => {
        originalGame = globalThis.game;
        mockModule = {
            id: 'foundryvtt-over-my-head',
            name: 'OverMyHead',
            customData: { integration: 'test' }
        };

        globalThis.game = {
            modules: {
                get: jest.fn((id) => {
                    if (id === 'foundryvtt-over-my-head') {
                        return mockModule;
                    }
                    return null;
                })
            }
        };
    });

    afterEach(() => {
        globalThis.game = originalGame;
        jest.clearAllMocks();
    });

    describe('Real manifest.mjs integration', () => {
        it('should work with imported manifest.mjs', () => {
            const result = GameManager.getModuleObject(config.manifest);

            expect(globalThis.game.modules.get).toHaveBeenCalledWith('foundryvtt-over-my-head');
            expect(result).toBe(mockModule);
        });

        it('should be able to write and read data using manifest', () => {
            const testData = { manifestTest: true, timestamp: Date.now() };

            const writeResult = GameManager.writeToModuleObject(config.manifest, 'manifestData', testData);
            expect(writeResult).toBe(true);

            const readResult = GameManager.readFromModuleObject(config.manifest, 'manifestData');
            expect(readResult).toEqual(testData);
        });
    });

    describe('Real module.json integration', () => {
        it('should work with imported module.json', () => {
            const result = GameManager.getModuleObject(moduleJson);

            expect(globalThis.game.modules.get).toHaveBeenCalledWith('foundryvtt-over-my-head');
            expect(result).toBe(mockModule);
        });

        it('should be able to write and read data using module.json', () => {
            const testData = { moduleJsonTest: true, version: moduleJson.version };

            const writeResult = GameManager.writeToModuleObject(moduleJson, 'moduleJsonData', testData);
            expect(writeResult).toBe(true);

            const readResult = GameManager.readFromModuleObject(moduleJson, 'moduleJsonData');
            expect(readResult).toEqual(testData);
        });

        it('should extract correct module ID from module.json structure', () => {
            // Verify the module.json has the expected structure
            expect(moduleJson).toHaveProperty('id');
            expect(moduleJson.id).toBe('foundryvtt-over-my-head');

            // Test that GameManager correctly uses the ID
            GameManager.getModuleObject(moduleJson);
            expect(globalThis.game.modules.get).toHaveBeenCalledWith('foundryvtt-over-my-head');
        });
    });

    describe('Cross-compatibility tests', () => {
        it('should treat manifest.mjs and module.json the same when they have the same ID', () => {
            const manifestResult = GameManager.getModuleObject(config.manifest);
            const moduleJsonResult = GameManager.getModuleObject(moduleJson);

            expect(manifestResult).toBe(moduleJsonResult);
            expect(manifestResult).toBe(mockModule);
        });

        it('should work with mixed usage patterns', () => {
            // Write using manifest, read using module.json
            GameManager.writeToModuleObject(config.manifest, 'crossTest', 'written-with-manifest');
            const result1 = GameManager.readFromModuleObject(moduleJson, 'crossTest');
            expect(result1).toBe('written-with-manifest');

            // Write using module.json, read using manifest
            GameManager.writeToModuleObject(moduleJson, 'crossTest2', 'written-with-modulejson');
            const result2 = GameManager.readFromModuleObject(config.manifest, 'crossTest2');
            expect(result2).toBe('written-with-modulejson');
        });
    });

    describe('Error handling with real files', () => {
        it('should handle module not found gracefully with real manifest', () => {
            globalThis.game.modules.get.mockReturnValue(null);

            const result = GameManager.getModuleObject(config.manifest);
            expect(result).toBeNull();
        });

        it('should handle module not found gracefully with real module.json', () => {
            globalThis.game.modules.get.mockReturnValue(null);

            const result = GameManager.getModuleObject(moduleJson);
            expect(result).toBeNull();
        });
    });    describe('Static class behavior verification', () => {
        it('should work without instantiation', () => {
            // No need to create an instance
            expect(() => {
                GameManager.getModuleObject(manifest);
                GameManager.writeToModuleObject(moduleJson, 'test', 'value');
                GameManager.readFromModuleObject(manifest, 'test');
            }).not.toThrow();
        });

        it('should maintain state between calls via the game object', () => {
            // Write some data
            GameManager.writeToModuleObject(manifest, 'persistentData', 'test-value');

            // Read it back in a different call
            const result = GameManager.readFromModuleObject(manifest, 'persistentData');
            expect(result).toBe('test-value');

            // Verify it's still there
            expect(mockModule.persistentData).toBe('test-value');
        });
    });
});
