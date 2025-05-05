import RemoteContextEraser from './eraser';
import { get } from 'lodash-es';

// Mock the parent class RemoteContextOperator or provide necessary properties/methods
// For simplicity, we'll assume the constructor sets up paths correctly
// and we'll manually set the source object (remoteContextRoot).

describe('RemoteContextEraser', () => {
    let eraser;
    let source;
    const contextRootIdentifier = 'testEntity';
    const baseLocation = `contexts.${contextRootIdentifier}`; // Example path structure
    const dataPath = `${baseLocation}.data`;
    const flagsPath = `${baseLocation}.flags`;
    const settingsPath = `${baseLocation}.settings`;

    beforeEach(() => {
        // Initialize a complex source object for each test
        source = {
            contexts: {
                testEntity: {
                    id: 'test-id',
                    data: {
                        key1: 'value1',
                        nested: {
                            deepKey: 'deepValue',
                            anotherLevel: { final: 123 }
                        },
                        arr: [1, 2, 3]
                    },
                    flags: {
                        core: { flag1: true },
                        moduleX: { flag2: false, nestedFlag: { active: true } }
                    },
                    settings: {
                        settingA: 'A',
                        nestedSetting: { option: 'B', config: { enabled: false } }
                    },
                    otherProp: 'keep me'
                }
            },
            otherRootData: { info: 'global info' }
        };

        // Create eraser instance
        // We pass a dummy config and the identifier.
        // We'll manually assign remoteContextRoot and mock path methods.
        eraser = new RemoteContextEraser({ config: {}, contextRootIdentifier });

        // Manually set the root object the eraser operates on
        eraser.remoteContextRoot = source;

        // Manually set the base path for the context object
        eraser.contextObjectPath = baseLocation;

        // Mock the path getter methods to return predictable paths for testing
        // These would normally be provided by the parent class or configuration
        jest.spyOn(eraser, 'getDataPath').mockReturnValue(dataPath);
        jest.spyOn(eraser, 'getFlagsPath').mockReturnValue(flagsPath);
        jest.spyOn(eraser, 'getSettingsPath').mockReturnValue(settingsPath);
    });

    afterEach(() => {
        // Restore any mocks after each test
        jest.restoreAllMocks();
    });

    // Test erase dispatcher
    describe('erase method', () => {
        it('should call the correct clear method based on action', () => {
            const clearSpy = jest.spyOn(eraser, 'clear');
            const clearItemSpy = jest.spyOn(eraser, 'clearItem');
            const clearPropertySpy = jest.spyOn(eraser, 'clearProperty');
            const clearDataSpy = jest.spyOn(eraser, 'clearData');
            const clearFlagsSpy = jest.spyOn(eraser, 'clearFlags');
            const clearSettingsSpy = jest.spyOn(eraser, 'clearSettings');
            const args = { someArg: 1 };

            eraser.erase({ action: 'clear', args });
            expect(clearSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'clearItem', args });
            expect(clearItemSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'clearProperty', args });
            expect(clearPropertySpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'clearData', args });
            expect(clearDataSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'clearFlags', args });
            expect(clearFlagsSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'clearSettings', args });
            expect(clearSettingsSpy).toHaveBeenCalledWith(args);
        });

        it('should call the correct remove method based on action', () => {
            const removeSpy = jest.spyOn(eraser, 'remove');
            const removeItemSpy = jest.spyOn(eraser, 'removeItem');
            const removePropertySpy = jest.spyOn(eraser, 'removeProperty');
            const removeDataSpy = jest.spyOn(eraser, 'removeData');
            const removeFlagsSpy = jest.spyOn(eraser, 'removeFlags');
            const removeSettingsSpy = jest.spyOn(eraser, 'removeSettings');
            const args = { someArg: 1 };

            eraser.erase({ action: 'remove', args });
            expect(removeSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'removeItem', args });
            expect(removeItemSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'removeProperty', args });
            expect(removePropertySpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'removeData', args });
            expect(removeDataSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'removeFlags', args });
            expect(removeFlagsSpy).toHaveBeenCalledWith(args);

            eraser.erase({ action: 'removeSettings', args });
            expect(removeSettingsSpy).toHaveBeenCalledWith(args);
        });

        it('should use default action "clear" if none provided', () => {
            const clearSpy = jest.spyOn(eraser, 'clear');
            eraser.erase({}); // No action specified
            expect(clearSpy).toHaveBeenCalledWith({}); // Default args is {}
        });

        it('should throw an error for an unsupported action', () => {
            expect(() => eraser.erase({ action: 'invalidAction' }))
                .toThrow('Unsupported erase action: invalidAction');
        });
    });

    // Test clear methods
    describe('clear operations', () => {
        it('clear() should clear the entire object at the default location', () => {
            const result = eraser.clear({});
            expect(result).toEqual({}); // Should return the cleared object (now empty)
            expect(get(source, baseLocation)).toBeUndefined(); // The location itself is removed by unset
            // To check if it was set to {}, we'd need to inspect the parent before unset
            // Let's refine the test based on implementation: unset removes the path
            expect(source.contexts.testEntity).toBeUndefined();
        });

         it('clear() should clear a specific key within the default location', () => {
            const result = eraser.clear({ key: 'otherProp' });
            expect(result).toEqual({});
            expect(get(source, `${baseLocation}.otherProp`)).toEqual({});
            expect(get(source, `${baseLocation}.id`)).toBe('test-id'); // Other props remain
        });

        it('clearItem() should clear a specific key', () => {
            const result = eraser.clearItem({ key: 'otherProp' });
            expect(result).toEqual({});
            expect(get(source, `${baseLocation}.otherProp`)).toEqual({});
            expect(get(source, `${baseLocation}.id`)).toBe('test-id'); // Other props remain
        });

        it('clearProperty() should clear a nested property', () => {
            const result = eraser.clearProperty({ fullPath: 'data.nested.deepKey' });
            expect(result).toEqual({});
            expect(get(source, `${baseLocation}.data.nested.deepKey`)).toEqual({});
            expect(get(source, `${baseLocation}.data.key1`)).toBe('value1'); // Sibling props remain
        });

        it('clearData() should clear the entire data object', () => {
            const result = eraser.clearData({});
            expect(result).toEqual({});
            expect(get(source, dataPath)).toEqual({});
            expect(get(source, flagsPath)).toBeDefined(); // Other sections remain
        });

        it('clearData() should clear a specific key within data', () => {
            const result = eraser.clearData({ key: 'nested.deepKey' });
            expect(result).toEqual({});
            expect(get(source, `${dataPath}.nested.deepKey`)).toEqual({});
            expect(get(source, `${dataPath}.key1`)).toBe('value1'); // Sibling props remain
        });

        it('clearFlags() should clear the entire flags object', () => {
            const result = eraser.clearFlags({});
            expect(result).toEqual({});
            expect(get(source, flagsPath)).toEqual({});
            expect(get(source, dataPath)).toBeDefined(); // Other sections remain
        });

        it('clearFlags() should clear a specific key within flags', () => {
            const result = eraser.clearFlags({ key: 'moduleX.nestedFlag' });
            expect(result).toEqual({});
            expect(get(source, `${flagsPath}.moduleX.nestedFlag`)).toEqual({});
            expect(get(source, `${flagsPath}.core.flag1`)).toBe(true); // Sibling props remain
        });

        it('clearSettings() should clear the entire settings object', () => {
            const result = eraser.clearSettings({});
            expect(result).toEqual({});
            expect(get(source, settingsPath)).toEqual({});
            expect(get(source, dataPath)).toBeDefined(); // Other sections remain
        });

        it('clearSettings() should clear a specific key within settings', () => {
            const result = eraser.clearSettings({ key: 'nestedSetting.config' });
            expect(result).toEqual({});
            expect(get(source, `${settingsPath}.nestedSetting.config`)).toEqual({});
            expect(get(source, `${settingsPath}.settingA`)).toBe('A'); // Sibling props remain
        });
    });

    // Test remove methods
    describe('remove operations', () => {
        it('remove() should remove the entire object at the default location', () => {
            const result = eraser.remove({});
            expect(result).toBe(source); // Returns the modified source
            expect(get(source, baseLocation)).toBeUndefined();
            expect(source.contexts.testEntity).toBeUndefined();
            expect(source.otherRootData).toBeDefined(); // Other parts of source remain
        });

        it('removeItem() should remove a specific key', () => {
            const result = eraser.removeItem({ key: 'otherProp' });
            expect(result).toBe(source);
            expect(get(source, `${baseLocation}.otherProp`)).toBeUndefined();
            expect(get(source, `${baseLocation}.id`)).toBe('test-id'); // Other props remain
        });

        it('removeProperty() should remove a nested property', () => {
            const result = eraser.removeProperty({ fullPath: 'data.nested.deepKey' });
            expect(result).toBe(source);
            expect(get(source, `${baseLocation}.data.nested.deepKey`)).toBeUndefined();
            expect(get(source, `${baseLocation}.data.nested.anotherLevel`)).toBeDefined(); // Sibling props remain
        });

        it('removeData() should remove the entire data object', () => {
            const result = eraser.removeData({});
            expect(result).toBe(source);
            expect(get(source, dataPath)).toBeUndefined();
            expect(get(source, flagsPath)).toBeDefined(); // Other sections remain
        });

        it('removeData() should remove a specific key within data', () => {
            const result = eraser.removeData({ key: 'nested.deepKey' });
            expect(result).toBe(source);
            expect(get(source, `${dataPath}.nested.deepKey`)).toBeUndefined();
            expect(get(source, `${dataPath}.nested.anotherLevel`)).toBeDefined(); // Sibling props remain
        });

        it('removeFlags() should remove the entire flags object', () => {
            const result = eraser.removeFlags({});
            expect(result).toBe(source);
            expect(get(source, flagsPath)).toBeUndefined();
            expect(get(source, dataPath)).toBeDefined(); // Other sections remain
        });

        it('removeFlags() should remove a specific key within flags', () => {
            const result = eraser.removeFlags({ key: 'moduleX.nestedFlag' });
            expect(result).toBe(source);
            expect(get(source, `${flagsPath}.moduleX.nestedFlag`)).toBeUndefined();
            expect(get(source, `${flagsPath}.moduleX.flag2`)).toBe(false); // Sibling props remain
        });

        it('removeSettings() should remove the entire settings object', () => {
            const result = eraser.removeSettings({});
            expect(result).toBe(source);
            expect(get(source, settingsPath)).toBeUndefined();
            expect(get(source, dataPath)).toBeDefined(); // Other sections remain
        });

        it('removeSettings() should remove a specific key within settings', () => {
            const result = eraser.removeSettings({ key: 'nestedSetting.config' });
            expect(result).toBe(source);
            expect(get(source, `${settingsPath}.nestedSetting.config`)).toBeUndefined();
            expect(get(source, `${settingsPath}.nestedSetting.option`)).toBe('B'); // Sibling props remain
        });
    });
});