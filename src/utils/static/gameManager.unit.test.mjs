/**
 * @file gameManager.unit.test.js
 * @description Unit tests for the static GameManager utility class.
 * @path src/utils/static/gameManager.unit.test.js
 */

import GameManager from './gameManager.mjs';

describe('GameManager (Static)', () => {
    let originalGame;
    let mockModule;

    beforeEach(() => {
        // Store original game object
        originalGame = globalThis.game;

        // Create mock module
        mockModule = {
            id: 'test-module',
            name: 'Test Module',
            customData: { setting: true },
            status: 'active'
        };

        // Setup mock game object
        globalThis.game = {
            modules: {
                get: jest.fn((id) => {
                    if (id === 'test-module' || id === 'foundryvtt-over-my-head') {
                        return mockModule;
                    }
                    return null;
                })
            }
        };
    });

    afterEach(() => {
        // Restore original game object
        globalThis.game = originalGame;
        jest.clearAllMocks();
    });

    describe('getModuleObject', () => {
        describe('with string identifier', () => {
            it('should retrieve module object using string identifier', () => {
                const result = GameManager.getModuleObject('test-module');

                expect(globalThis.game.modules.get).toHaveBeenCalledWith('test-module');
                expect(result).toBe(mockModule);
            });

            it('should return null for non-existent module', () => {
                const result = GameManager.getModuleObject('non-existent-module');

                expect(globalThis.game.modules.get).toHaveBeenCalledWith('non-existent-module');
                expect(result).toBeNull();
            });
        });

        describe('with manifest object (id property)', () => {
            it('should retrieve module object using manifest with id property', () => {
                const manifest = { id: 'test-module', name: 'Test Module' };
                const result = GameManager.getModuleObject(manifest);

                expect(globalThis.game.modules.get).toHaveBeenCalledWith('test-module');
                expect(result).toBe(mockModule);
            });

            it('should work with module.mjson format', () => {
                const moduleJson = {
                    id: 'foundryvtt-over-my-head',
                    name: 'foundryvtt-over-my-head',
                    title: 'OverMyHead',
                    version: '12.0.1-alpha1'
                };
                const result = GameManager.getModuleObject(moduleJson);

                expect(globalThis.game.modules.get).toHaveBeenCalledWith('foundryvtt-over-my-head');
                expect(result).toBe(mockModule);
            });
        });

        describe('with manifest object (name property fallback)', () => {
            it('should retrieve module object using manifest with name property when id is missing', () => {
                const manifest = { name: 'test-module', title: 'Test Module' };
                const result = GameManager.getModuleObject(manifest);

                expect(globalThis.game.modules.get).toHaveBeenCalledWith('test-module');
                expect(result).toBe(mockModule);
            });
        });

        describe('error handling', () => {
            it('should return null and log error for invalid object without id or name', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                const invalidObject = { title: 'Test', version: '1.0.0' };

                const result = GameManager.getModuleObject(invalidObject);

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Module identifier object must have either "id" or "name" property.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });

            it('should return null and log error for invalid input type', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const result = GameManager.getModuleObject(123);

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Module identifier must be a string or an object with "id" or "name" property.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });

            it('should return null and log error when game object is not available', () => {
                globalThis.game = undefined;
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const result = GameManager.getModuleObject('test-module');

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Game object is not available in global scope.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });

            it('should return null and log error when modules collection is not available', () => {
                globalThis.game = {};
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const result = GameManager.getModuleObject('test-module');

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Game modules collection is not available.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });

            it('should return null and log error when modules collection does not have get function', () => {
                globalThis.game = { modules: {} };
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const result = GameManager.getModuleObject('test-module');

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Game modules collection does not have a get function.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });

            it('should handle null input gracefully', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const result = GameManager.getModuleObject(null);

                expect(consoleSpy).toHaveBeenCalledWith(
                    'GameManager.getModuleObject: Module identifier must be a string or an object with "id" or "name" property.'
                );
                expect(result).toBeNull();

                consoleSpy.mockRestore();
            });
        });
    });

    describe('writeToModuleObject', () => {
        it('should write key-value pair to module object using string identifier', () => {
            const result = GameManager.writeToModuleObject('test-module', 'newKey', 'newValue');

            expect(result).toBe(true);
            expect(mockModule.newKey).toBe('newValue');
        });

        it('should write key-value pair to module object using manifest object', () => {
            const manifest = { id: 'test-module' };
            const result = GameManager.writeToModuleObject(manifest, 'anotherKey', { complex: 'data' });

            expect(result).toBe(true);
            expect(mockModule.anotherKey).toEqual({ complex: 'data' });
        });

        it('should return false and log error when module object cannot be retrieved', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = GameManager.writeToModuleObject('non-existent-module', 'key', 'value');

            expect(consoleSpy).toHaveBeenCalledWith(
                'GameManager.writeToModuleObject: Could not retrieve module object.'
            );
            expect(result).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle write errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Create a read-only property that will throw when trying to write
            Object.defineProperty(mockModule, 'readOnlyProp', {
                value: 'readonly',
                writable: false,
                configurable: false
            });

            const result = GameManager.writeToModuleObject('test-module', 'readOnlyProp', 'newValue');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('GameManager.writeToModuleObject: Failed to write to module object. Error:')
            );
            expect(result).toBe(false);

            consoleSpy.mockRestore();
        });
    });

    describe('readFromModuleObject', () => {
        it('should read value from module object using string identifier', () => {
            const result = GameManager.readFromModuleObject('test-module', 'status');

            expect(result).toBe('active');
        });

        it('should read value from module object using manifest object', () => {
            const manifest = { id: 'test-module' };
            const result = GameManager.readFromModuleObject(manifest, 'customData');

            expect(result).toEqual({ setting: true });
        });

        it('should return undefined for non-existent key', () => {
            const result = GameManager.readFromModuleObject('test-module', 'nonExistentKey');

            expect(result).toBeUndefined();
        });

        it('should return undefined and log error when module object cannot be retrieved', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = GameManager.readFromModuleObject('non-existent-module', 'key');

            expect(consoleSpy).toHaveBeenCalledWith(
                'GameManager.readFromModuleObject: Could not retrieve module object.'
            );
            expect(result).toBeUndefined();

            consoleSpy.mockRestore();
        });
    });

    describe('moduleExists', () => {
        it('should return true for existing module using string identifier', () => {
            const result = GameManager.moduleExists('test-module');

            expect(result).toBe(true);
        });

        it('should return true for existing module using manifest object', () => {
            const manifest = { id: 'test-module' };
            const result = GameManager.moduleExists(manifest);

            expect(result).toBe(true);
        });

        it('should return false for non-existent module', () => {
            const result = GameManager.moduleExists('non-existent-module');

            expect(result).toBe(false);
        });

        it('should return false when game is not available', () => {
            globalThis.game = undefined;
            const result = GameManager.moduleExists('test-module');

            expect(result).toBe(false);
        });
    });

    describe('getUtilityInfo', () => {
        it('should return utility information', () => {
            const info = GameManager.getUtilityInfo();

            expect(info).toEqual({
                name: 'GameManager',
                type: 'static',
                description: 'Static utility class for managing game modules and remote contexts',
                version: '2.0.0',
                methods: ['getModuleObject', 'writeToModuleObject', 'readFromModuleObject', 'moduleExists']
            });
        });
    });

    describe('class structure', () => {
        it('should be a static class (no constructor)', () => {
            // Trying to instantiate should work but not be necessary
            expect(() => new GameManager()).not.toThrow();
        });

        it('should have all static methods', () => {
            expect(typeof GameManager.getModuleObject).toBe('function');
            expect(typeof GameManager.writeToModuleObject).toBe('function');
            expect(typeof GameManager.readFromModuleObject).toBe('function');
            expect(typeof GameManager.moduleExists).toBe('function');
            expect(typeof GameManager.getUtilityInfo).toBe('function');
        });
    });
});
