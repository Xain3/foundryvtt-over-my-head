import HookRegistry, {HooksRegistryGetter, HooksRegistryChecker, HookBuilder} from './hooksRegistry';

// src/baseClasses/hooksRegistry.test.js

describe('HookRegistry Tests', () => {
    const moduleShortName = "OverMyHead";
    let mockHookGroups;
    let standardGroups;
    let mockSettings;
    let mockGetterInstance;
    let mockCheckerInstance;
    let mockBuilderInstance;
    let mockPrefix;
    let mockModuleShortName;
    let hookRegistry;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockHookGroups = {
            groupA: {
                hook1: 'hook1',
                hook2: 'hook2',
            },
            groupB: {
                hook3: 'hook3',
            },
            hookDefault: {
                hookBuiltIn: 'hookBuiltIn',
                hookDefault: 'hookDefault',
            },
        };

        standardGroups = {
            OUT: mockHookGroups.groupA,
            IN: mockHookGroups.groupB,
            BUILT_IN: mockHookGroups.hookDefault,
        };

        mockSettings = {
            ALLOWED_GROUPS: ['groupA', 'groupB'],
            DEFAULT_PREFIX: 'default_',
            NO_PREFIX_GROUPS: ['groupB'],
            DEFAULT_GROUP: {
                hookDefault: 'hookDefault',
            },
        };
        mockPrefix = mockSettings.DEFAULT_PREFIX;
        mockModuleShortName = 'HooksRegistryGettermodule short name';

         // Mock instances for getter, checker, and builder
         mockGetterInstance = {
            mappings: jest.fn(),
        };
    
        mockCheckerInstance = {
            groupIsAllowed: jest.fn(),
        };
    
        mockBuilderInstance = {
            hook: jest.fn(),
        };
    });

    describe('HooksRegistryGetter', () => {
        let getter;

        beforeEach(() => {
            getter = {
                custom: new HooksRegistryGetter(mockSettings, mockHookGroups, mockModuleShortName),
                standard: new HooksRegistryGetter(mockSettings, standardGroups, mockModuleShortName),
            };
        });

        describe('constructor', () => {
            it('should set settings correctly', () => {
                expect(getter.custom.settings).toEqual(mockSettings);
            });

            it('should set the registry correctly', () => {
                expect(getter.custom.registry).toEqual(mockHookGroups);
            })

            it('should set module short name to default if not provided', () => {
                let getterWithDefault = new HooksRegistryGetter(mockSettings, mockHookGroups);
                expect(getterWithDefault.moduleShortName).toBe(moduleShortName);
            })

            it('should set module short name correctly', () => {
                expect(getter.custom.moduleShortName).toBe(mockModuleShortName);
            });
        });
            
        describe('mappings', () => {   
            it('should log an error message if an error is thrown', () => {
                console.error = jest.fn();
                getter.custom.throwError = true;
                getter.custom.mappings();
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unable to retrieve mappings'));
            });

            it('should return empty registry id an error is thrown', () => {
                getter.custom.throwError = true;
                expect(getter.custom.mappings()).toEqual({});
            });

            it('should set mappings correctly with standard groups in UPPERCASE', () => {
                expect(getter.standard.mappings().OUT).toEqual(standardGroups.OUT);
                expect(getter.standard.mappings().IN).toEqual(standardGroups.IN);
                expect(getter.standard.mappings().BUILT_IN).toEqual(standardGroups.BUILT_IN);
            });

            it('should set mappings correctly with standard groups in camelCase', () => {
                let standardGroupsCamelCase = {
                    out: standardGroups.OUT,
                    in: standardGroups.IN,
                    builtIn: standardGroups.BUILT_IN,
                };
                getter.standard.registry = standardGroupsCamelCase;
                expect(getter.standard.mappings().OUT).toEqual(standardGroupsCamelCase.out);
                expect(getter.standard.mappings().IN).toEqual(standardGroupsCamelCase.in);
                expect(getter.standard.mappings().BUILT_IN).toEqual(standardGroupsCamelCase.builtIn);
            });

            it('should set mappings correctly with nonstandard groups if allowed', () => {
                expect(getter.custom.mappings(true)).toEqual(mockHookGroups);
            });

            it('should log a warning with nonstandard groups if allowed', () => {
                console.warn = jest.fn();
                getter.custom.mappings(true);
                expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Nonstandard hook groups detected'));
            });

            it('should log an error if nonstandard groups are not allowed', () => {
                console.error = jest.fn();
                getter.custom.mappings();
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Nonstandard hook groups detected'));
            });

            it('should return an empty registry if no mappings are found', () => {
                getter.custom.registry = {};
                expect(getter.custom.mappings()).toEqual({});
            });

            it('should log an error if an error is thrown', () => {
                console.error = jest.fn();
                getter.throwError = true;
                getter.custom.mappings();
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unable to retrieve mappings'));
            });
        });

        describe('hookCandidates', () => {
            it('should return null if no hook candidates are provided', () => {
            expect(getter.custom.hookCandidates([], 'all')).toBeNull();
            });

            it('should return the single hook candidate when only one is provided', () => {
            const candidates = ['hook1'];
            expect(getter.custom.hookCandidates(candidates, 'all')).toEqual('hook1');
            });

            it('should return all hook candidates when mode is "all"', () => {
            const candidates = ['hook1', 'hook2', 'hook3'];
            expect(getter.custom.hookCandidates(candidates, 'all')).toEqual(candidates);
            });

            it('should return the first hook candidate when mode is "first"', () => {
            const candidates = ['hook1', 'hook2', 'hook3'];
            expect(getter.custom.hookCandidates(candidates, 'first')).toEqual('hook1');
            });

            it('should return the last hook candidate when mode is "last"', () => {
            const candidates = ['hook1', 'hook2', 'hook3'];
            expect(getter.custom.hookCandidates(candidates, 'last')).toEqual('hook3');
            });

            it('should return null for an unrecognized mode', () => {
            const candidates = ['hook1', 'hook2'];
            expect(getter.custom.hookCandidates(candidates, 'unknown')).toBeNull();
            });
        })

        describe('hook', () => {
            it('should return null if hook does not exist in any group', () => {
                expect(getter.custom.hook('nonExistentHook')).toBeNull();
            });

            it('should return a single hook when it exists in one group', () => {
                const result = getter.custom.hook('hook1', 'groupA');
                expect(result).toBe('groupA.hook1');
            });

            it('should return null if no hooks are found in the specified group', () => {
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('nonExistentHook', 'groupB');
                expect(result).toBeNull();
            });

            it('should return formatted hooks based on returnMode "group.name"', () => {
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('hook1', null, 'all', false, 'group.name');
                expect(result).toEqual('groupA.hook1');
            });

            it('should return a single formatted hook within a list when returnMode is "group.name" and force array is true', (
            ) => {
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('hook1', null, 'all', true, 'group.name');
                expect(result).toEqual(['groupA.hook1']);
            });

            it('should return only the first matching hook when selectionMode is "first"', () => {
                mockHookGroups.groupB.hook1 = 'hook1';
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('hook1', null, 'first');
                expect(result).toBe('groupA.hook1');
            });

            it('should return only the last matching hook when mode is "last"', () => {
                mockHookGroups.groupB.hook1 = 'hook1';
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('hook1', null, 'last');
                expect(result).toBe('groupB.hook1');
            });

            it('should return all matching hooks when mode is "all"', () => {
                mockHookGroups.groupB.hook1 = 'hook1';
                getter.custom.mappings = jest.fn().mockReturnValue(mockHookGroups);
                const result = getter.custom.hook('hook1', null, 'all');
                expect(result).toEqual(['groupA.hook1', 'groupB.hook1']);
            });

            it('should return hooks as an array when forceArray is true', () => {
                const result = getter.custom.hook('hook1', 'groupA', 'all', true);
                expect(result).toEqual(['groupA.hook1']);
            });

            it('should return hooks in the specified returnMode "name"', () => {
                const result = getter.custom.hook('hook1', 'groupA', 'all', false, 'name');
                expect(result).toBe('hook1');
            });

            it('should return hooks in the specified returnMode "group"', () => {
                const result = getter.custom.hook('hook1', 'groupA', 'all', false, 'group');
                expect(result).toBe('groupA');
            });

            it('should return hooks in the specified returnMode "object"', () => {
                const result = getter.custom.hook('hook1', 'groupA', 'all', false, 'object');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });

            it('should handle hooks without a group correctly if they are in the default group', () => {
                const result = getter.standard.hook('hookBuiltIn');
                expect(result).toBe('BUILT_IN.hookBuiltIn');
            });

            it('should return an array of hooks when multiple matches are found and mode is "all"', () => {
                mockHookGroups.groupB.hook1 = 'hook1';
                const result = getter.custom.hook('hook1', null, 'all', false, 'group.name', true);
                expect(result).toEqual(['groupA.hook1', 'groupB.hook1']);
            });

            it('should return null for unrecognized returnMode', () => {
                const result = getter.custom.hook('hook1', 'groupA', 'all', false, 'unknownMode');
                expect(result).toBe('groupA.hook1');
            });
        });

        describe('hookParts', () => {
            it('should return the correct group and name for a hook', () => {
                const result = getter.custom.hookParts('groupA.hook1');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });

            it('should return the correct group and name for a hook in the default group', () => {
                const result = getter.standard.hookParts('BUILT_IN.hookBuiltIn');
                expect(result).toEqual({ grp: 'BUILT_IN', name: 'hookBuiltIn' });
            });

            it('should log an error if the hook is not a string', () => {
                console.error = jest.fn();
                const result = getter.custom.hookParts(['groupA.hook1']);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('The hook must be a string'));
            });
            
            it('should return both group and name as undefined if the hook is not a string', () => {
                const result = getter.custom.hookParts(['groupA.hook1']);
                expect(result).toEqual({grp: undefined, name: undefined});
            });

            it('should log an error if the hook is not passed', () => {
                console.error = jest.fn();
                const result = getter.custom.hookParts();
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('The hook cannot be empty'));
            });

            it('should return both group and name as undefined if the hook is not passed', () => {
                const result = getter.custom.hookParts();
                expect(result).toEqual({grp: undefined, name: undefined});
            });

            it('should log an error if the separator is not a string', () => {
                console.error = jest.fn();
                const result = getter.custom.hookParts('groupA.hook1', 123);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('The separator must be a string'));
            });

            it('should return both group and name as undefined if the separator is not a string', () => {
                const result = getter.custom.hookParts('groupA.hook1', 123);
                expect(result).toEqual({grp: undefined, name: undefined});
            });

            it('should log an error if the separator is not passed', () => {
                console.error = jest.fn();
                const result = getter.custom.hookParts('groupA.hook1', null);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('The separator cannot be empty'));
            });

            it('should return both group and name as undefined if the separator is not passed', () => {
                const result = getter.custom.hookParts('groupA.hook1', null);
                expect(result).toEqual({grp: undefined, name: undefined});
            });

            it('should log an error if the separator if there are more than one separators (except for leading and trailing ones)', () => {
                console.error = jest.fn();
                const result = getter.custom.hookParts('groupA.hook1.groupA.hook1', '.');
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Only one separator is allowed'));
            });

            it('should return both group and name as undefined if there are more than one separators (except for leading and trailing ones)', () => {
                const result = getter.custom.hookParts('groupA.hook1.groupA.hook1', '.');
                expect(result).toEqual({ grp: undefined, name: undefined});
            });

            it('should handle a custom separator correctly', () => {
                const result = getter.custom.hookParts('groupA-hook1', '-');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });

            it('should handle hooks with no separator correctly', () => {
                const result = getter.custom.hookParts('groupAhook1');
                expect(result).toEqual({ grp: undefined, name: 'groupAhook1' });
            });

            it('should handle hooks with leading separator correctly', () => {
                const result = getter.custom.hookParts('.groupA.hook1', '.');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });
            
            it('should handle hooks with trailing separator correctly', () => {
                const result = getter.custom.hookParts('groupA.hook1.', '.');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });

            it('should handle hooks with both leading and trailing separators correctly', () => {
                const result = getter.custom.hookParts('.groupA.hook1.', '.');
                expect(result).toEqual({ grp: 'groupA', name: 'hook1' });
            });
        });

        describe('hookPrefix', () => {
            let getter;

            beforeEach(() => {
                getter = new HooksRegistryGetter(mockSettings, mockHookGroups, mockModuleShortName);
                getter.prefix = 'testPrefix_';
            });

            it('should return prefix if hookGroup is not in noPrefixGroups', () => {
                const prefix = getter.hookPrefix('groupA');
                expect(prefix).toBe('testPrefix_');
            });

            it('should return empty string if hookGroup is in noPrefixGroups', () => {
                const prefix = getter.hookPrefix('groupB');
                expect(prefix).toBe('');
            });

            it('should use default prefix if no prefix is provided', () => {
                const prefix = getter.hookPrefix('groupA');
                expect(prefix).toBe('testPrefix_');
            });

            it('should use provided prefix if given', () => {
                const prefix = getter.hookPrefix('groupA', 'customPrefix_');
                expect(prefix).toBe('customPrefix_');
            });

            it('should use provided noPrefixGroups if given', () => {
                const prefix = getter.hookPrefix('groupB', 'customPrefix_', ['groupB', 'groupC']);
                expect(prefix).toBe('');
            });

            it('should return default prefix when noPrefixGroups is not provided', () => {
                const prefix = getter.hookPrefix('groupA', 'defaultPrefix_');
                expect(prefix).toBe('defaultPrefix_');
            });

            it('should return prefix when noPrefixGroups does not include the hookGroup', () => {
                const prefix = getter.hookPrefix('groupC', 'anotherPrefix_', ['groupB']);
                expect(prefix).toBe('anotherPrefix_');
            });
        });
    });

    describe('HooksRegistryChecker', () => {
        let checker;

        beforeEach(() => {
            checker = new HooksRegistryChecker(mockSettings, mockHookGroups, mockGetterInstance);
        });

        describe('constructor', () => {
            it('should set settings correctly', () => {
                expect(checker.settings).toEqual(mockSettings);
            });

            it('should set the registry correctly', () => {
                expect(checker.registry).toEqual(mockHookGroups);
            })

            it('should set the getter correctly', () => {
                expect(checker.get).toBe(mockGetterInstance);
            });
        });

        describe('groupIsAllowed', () => {                
            it('should return true if group is allowed', () => {
                expect(checker.groupIsAllowed('groupA')).toBe(true);
            });

            it('should throw an error if group is not allowed', () => {
                expect(() => checker.groupIsAllowed('groupC')).toThrowError('Group groupC is not allowed');
                });
        });

        describe('hookIsAllowed', () => {

            beforeEach(() => {
                checker.get.mappings = jest.fn().mockReturnValue({
                    groupA: ['hook1', 'hook2'],
                    groupB: ['hook3'],
                });
            });
            
            it('should return true if hookGroup is allowed', () => {
                expect(checker.hookIsAllowed('hook1', 'groupA')).toBe(true);
            });

            it('should return false if hookGroup is not allowed', () => {
                expect(checker.hookIsAllowed('hook1', 'groupC')).toBe(false);
            });

            it('should return true if hook exists in any allowed group when hookGroup is not provided', () => {
                expect(checker.hookIsAllowed('hook3')).toBe(true);
            });

            it('should return false if hook does not exist in any allowed group', () => {
                expect(checker.hookIsAllowed('hookNonExistent')).toBe(false);
            });
        });
    });

    describe('HookBuilder', () => {
        let builder;

        beforeEach(() => {
            mockGetterInstance = {
                hookPrefix: jest.fn((hookGroup, prefix) => {
                    if (mockSettings.NO_PREFIX_GROUPS.includes(hookGroup)) {
                        return '';
                    }
                    return prefix;
                }),
                hookParts: jest.fn((hook) => {
                    const [grp, name] = hook.split('.');
                    return { grp, name };
                }),
                hook: jest.fn((hookName, hookGroup, mode, forceArray, returnMode) => {
                    // Mock implementation as needed
                    return `${hookGroup || 'hookDefault'}.${hookName}`;
                }),
            };

            mockPrefix = mockSettings.DEFAULT_PREFIX;
            builder = new HookBuilder(mockSettings, mockHookGroups, mockGetterInstance, mockPrefix);
        });

        describe('constructor', () => {
            it('should set settings correctly', () => {
                expect(builder.settings).toEqual(mockSettings);
            });

            it('should set mappings correctly', () => {
                expect(builder.registry).toEqual(mockHookGroups);
            });

            it('should set prefix correctly', () => {
                    expect(builder.prefix).toBe(mockPrefix);
            });

            it('should set the prefix correctly to the default if prefix is not specified', () => {
                let builderWithDefault = new HookBuilder(mockSettings, mockHookGroups, mockGetterInstance);
                expect(builderWithDefault.prefix).toBe(mockSettings.DEFAULT_PREFIX);
            });
        });

        describe('hook', () => {            
            it('should build hook with group correctly', () => {
            const result = builder.hook('hook1', 'groupA');
            expect(result).toBe('default_hook1');
            });
    
            it('should build hook without group using default group', () => {
            const result = builder.hook('hookDefault');
            expect(result).toBe('default_hookDefault');
            });
    
            it('should return null if hook cannot be built', () => {
            const result = builder.hook('nonExistentHook');
            expect(result).toBeNull();
            });
    
            it('should log a warning when multiple hooks are found and returnMode triggers a warning', () => {
            // Add 'hook1' to groupB for multiple matches
            mockHookGroups.groupB.hook1 = 'hook1';
            console.warn = jest.fn();
            const result = builder.hook('hook1');
            expect(console.warn).toHaveBeenCalledWith('Multiple hooks found for hook1.');
            expect(result).toBe(null);
            });
    
            it('should log a warning when hook cannot be built', () => {
            console.warn = jest.fn();
            const result = builder.hook('invalidHook');
            expect(console.warn).toHaveBeenCalledWith('Hook invalidHook cannot be built.');
            expect(result).toBeNull();
            });

            it ('should return a formatted hook if a valid hook is found', () => {
                const result = builder.hook('hook1', 'groupA', 'prefix_', false, false);
                expect(result).toBe('prefix_hook1');
            });

            it ('should return a formatted hook if a valid hook is found and returnMode is set to true', () => {
                const result = builder.hook('hook1', 'groupA', 'prefix_', false, true);
                expect(result).toBe('prefix_hook1');
            });

            it ('should return null if hook does not exist', () => {
                const result = builder.hook('doesNotExist', 'groupA', 'prefix_', false, false);
                expect(result).toBeNull();
            });
        });
    });
    
    describe('HookRegistry', () => {
        let hookRegistry;
    
        beforeEach(() => {
        // Create instance of HookRegistry with mocked dependencies
        hookRegistry = new HookRegistry(
            mockHookGroups,
            mockSettings,
            'customPrefix_',
            jest.fn().mockReturnValue(mockGetterInstance),
            jest.fn().mockReturnValue(mockCheckerInstance),
            jest.fn().mockReturnValue(mockBuilderInstance)
            );
        });

        describe('constructor', () => {
            it('should set the registry correctly', () => {
                expect(hookRegistry.collection).toEqual(mockHookGroups);
            });

            it('should set the settings correctly', () => {
                expect(hookRegistry.settings).toEqual(mockSettings);
            });

            it('should set the prefix correctly', () => {
                expect(hookRegistry.prefix).toBe('customPrefix_');
            });

            it('should set the getter correctly', () => {
                expect(hookRegistry.get).toBe(mockGetterInstance);
            });

            it('should set the checker correctly', () => {
                expect(hookRegistry.check).toBe(mockCheckerInstance);
            });

            it('should set the builder correctly', () => {
                expect(hookRegistry.build).toBe(mockBuilderInstance);
            });

            it('should set the prefix correctly to the default if prefix is not specified', () => {
                let hookRegistryWithDefault = new HookRegistry(
                        mockHookGroups,
                        mockSettings,
                        null,
                        jest.fn().mockReturnValue(mockGetterInstance),
                        jest.fn().mockReturnValue(mockCheckerInstance),
                        jest.fn().mockReturnValue(mockBuilderInstance)
                    );
                expect(hookRegistryWithDefault.prefix).toBe(mockSettings.DEFAULT_PREFIX);
            });
        });

        describe('get', () => {
            it('should return the getter instance', () => {
                expect(hookRegistry.get).toBe(mockGetterInstance);
            });
        });

        describe('check', () => {
            it('should return the checker instance', () => {
                expect(hookRegistry.check).toBe(mockCheckerInstance);
            });
        });

        describe('build', () => {
            it('should return the builder instance', () => {
                expect(hookRegistry.build).toBe(mockBuilderInstance);
            });
        });

        describe('unpackGroups', () => {
            it('should return the correct group when provided', () => {
                const alternativeGroupsToUnpack = {
                    groupC: {
                        hook4: 'hook4',
                    },
                };
                hookRegistry.unpackCollection(alternativeGroupsToUnpack);
                expect(Object.keys(hookRegistry)).toEqual(expect.arrayContaining(Object.keys(mockHookGroups)));
            });

            it('should log an error message when a croup name corresponds to a reserved name', () => {
                const invalidCollection = {
                    get: {
                        hook4: 'hook4',
                    },
                };
                console.error = jest.fn();
                hookRegistry.unpackCollection(invalidCollection);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Group get's name conflicts with a property of the same name."));
            });
        });

        describe('formatHook', () => {
            it('should call the builder with the correct default arguments', () => {
                hookRegistry.formatHook('hook1', 'groupA');
                expect(mockBuilderInstance.hook).toHaveBeenCalledWith('hook1', 'groupA', 'customPrefix_', true, true);
            });

            it('should call the builder with the correct arguments when provided', () => {
                hookRegistry.formatHook('hook1', 'groupA', 'prefix_', false, false);
                expect(mockBuilderInstance.hook).toHaveBeenCalledWith('hook1', 'groupA', 'prefix_', false, false);
            });


        });
    });
});

