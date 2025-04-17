import Setting from './setting.js';
import MockConfig from '../../tests/mocks/config.js';

describe('Setting', () => {
    let config;
    let setting;
    let mockSetting;

    beforeEach(() => {
        jest.clearAllMocks();
        config = new MockConfig();
        setting = new Setting(config);
        mockSetting = setting.moduleSettings.mockSetting;
    })

    describe('constructor', () => {
        it('should initialize properties correctly from Base', () => {
            expect(setting.moduleConstants).toBe(config.CONSTANTS.MODULE);
            expect(setting.moduleShortName).toBe(config.CONSTANTS.MODULE.SHORT_NAME);
            expect(setting.moduleSettings).toBe(config.CONSTANTS.MODULE.SETTINGS);
        });
    });

    describe('selectSetting', () => {
        it('should set the setting property to the selected setting', () => {
            const selectedSetting = "mockSetting"
            jest.spyOn(setting, 'checkSetting').mockReturnValue(true);
            setting.selectSetting(selectedSetting);
            expect(setting.selectedSetting).toBe(setting.moduleSettings[selectedSetting]);
        });
    });


    describe('ensureIsObject', () => {
        it('should return true if the setting is an object', () => {
            const settingToCheck = mockSetting;
            expect(setting.ensureIsObject(settingToCheck)).toBe(true);
        });
        it('should return false if the setting is not an object', () => {
            const settingToCheck = "notAnObject";
            expect(setting.ensureIsObject(settingToCheck)).toBe(false);
        });
        it('should output a console error if the setting is not an object', () => {
            const settingToCheck = "notAnObject";
            const expectedMessage = `Setting must be an object, received ${typeof settingToCheck}`;
            console.error = jest.fn();
            setting.ensureIsObject(settingToCheck);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage));
        });
    });

    describe('ensureEssentialProperties', () => {
        it('should return true if all essential properties are present', () => {
            const settingToCheck = mockSetting;
            expect(setting.ensureEssentialProperties(settingToCheck.props)).toBe(true);
        });
        it('should return false if an essential property is missing', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            delete settingProps.name;
            expect(setting.ensureEssentialProperties(settingProps)).toBe(false);
        });
        it('should output a console error if an essential property is missing', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            delete settingProps.name;
            const expectedMessage = `${setting.moduleShortName} | Missing essential property: name`;
            console.error = jest.fn();
            setting.ensureEssentialProperties(settingProps);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage));
        });
    });

    describe('ensureValidProperties', () => {
        it('should return true if all properties are valid', () => {
            const settingToCheck = mockSetting;
            expect(setting.ensureValidProperties(settingToCheck.props)).toBe(true);
        });
        it('should return false if an invalid property is present', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            settingProps.invalidProperty = "invalid";
            expect(setting.ensureValidProperties(settingProps)).toBe(false);
        });
        it('should output a console error if an invalid property is present', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            settingProps.invalidProperty = "invalid";
            const expectedMessage = `${setting.moduleShortName} | Invalid property: invalidProperty`;
            console.error = jest.fn();
            setting.ensureValidProperties(settingProps);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage));
        });
    });

    describe('ensureValidPropertyTypes', () => {
        it('should return true if all property types are valid', () => {
            const settingToCheck = mockSetting;
            expect(setting.ensureValidPropertyTypes(settingToCheck.props)).toBe(true);
        });
        it('should return false if an invalid property type is present', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            settingProps.name = 1;
            expect(setting.ensureValidPropertyTypes(settingProps)).toBe(false);
        });
        it('should output a console error if an invalid property type is present', () => {
            const settingToCheck = mockSetting;
            const settingProps = { ...settingToCheck.props };
            settingProps.name = 1;
            const expectedMessage = `${setting.moduleShortName} | Invalid type for property`;
            console.error = jest.fn();
            setting.ensureValidPropertyTypes(settingProps);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage));
        });
    });

    describe('checkSetting', () => {
        it('should call ensureIsObject', () => {
            const settingToCheck = mockSetting;
            jest.spyOn(setting, 'ensureIsObject').mockReturnValue(true);
            setting.checkSetting(settingToCheck);
            expect(setting.ensureIsObject).toHaveBeenCalledWith(settingToCheck);
        });
        it('should call ensureValidProperties', () => {
            const settingToCheck = mockSetting;
            jest.spyOn(setting, 'ensureValidProperties').mockReturnValue(true);
            setting.checkSetting(settingToCheck);
            expect(setting.ensureValidProperties).toHaveBeenCalledWith(settingToCheck.props);
        });
        it('should call ensureValidPropertyTypes', () => {
            const settingToCheck = mockSetting;
            jest.spyOn(setting, 'ensureValidPropertyTypes').mockReturnValue(true);
            setting.checkSetting(settingToCheck);
            expect(setting.ensureValidPropertyTypes).toHaveBeenCalledWith(settingToCheck.props);
        });
        it('should call ensureEssentialProperties', () => {
            const settingToCheck = mockSetting;
            jest.spyOn(setting, 'ensureEssentialProperties').mockReturnValue(true);
            setting.checkSetting(settingToCheck);
            expect(setting.ensureEssentialProperties).toHaveBeenCalledWith(settingToCheck.props);
        });
        it ('should return true if all checks pass', () => {
            const settingToCheck = mockSetting;
            expect(setting.checkSetting(settingToCheck)).toBe(true);
        });

        it('should return false if any check fails', () => {
            const settingToCheck = mockSetting;
            jest.spyOn(setting, 'ensureIsObject').mockReturnValue(false);
            expect(setting.checkSetting(settingToCheck)).toBe(false);
        });

        it('should log an error if any check fails', () => {
            const settingToCheck = mockSetting;
            console.error = jest.fn();
            jest.spyOn(setting, 'ensureIsObject').mockReturnValue(false);
            setting.checkSetting(settingToCheck);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('updateContextFlags', () => {
        let mockContext;
        let flags;
        let value;

        beforeEach(() => {
            mockContext = { setFlags: jest.fn() };
            flags = ['mockFlag'];
            value = true;
        });

        it('should call context.setFlag with the setting flag', () => {
            setting.updateContextFlags(mockContext, value, flags, flags);
            expect(mockContext.setFlags).toHaveBeenCalledWith('mockFlag', value, true);
        });

        it('should log a debug message if the operation is successful', () => {
            console.debug = jest.fn();
            setting.updateContextFlags(mockContext, value, flags, flags);
            expect(console.debug).toHaveBeenCalledWith(`Setting ${flags[0]} to ${value}`);
        });
    });

    describe('onChangeCallHook', () => {
        let hook;
        let hookGroup;
        let hookFunction;
        let value;
        let formatter;
        let formattedHook;

        beforeEach(() => {
            hook = 'mockHook';
            hookGroup = 'mockGroup';
            hookFunction = jest.fn();
            value = true;
            formatter = { formatHook: jest.fn() };
            formattedHook = 'formattedHook';
        });

        it('should call the hook function', () => {
            formatter.formatHook.mockReturnValue(formattedHook);
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect((formatter.formatHook)).toHaveBeenCalledWith(hook, hookGroup);
            expect(hookFunction).toHaveBeenCalledWith(formattedHook, value);
        });

        it('should log a debug message if the operation is successful', () => {
            console.debug = jest.fn();
            formatter.formatHook.mockReturnValue(formattedHook);
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.debug).toHaveBeenCalledWith(`${hook}.onChange: ${value}`);
        });

        it('should log an error if the hook function is not a function', () => {
            console.error = jest.fn();
            hookFunction = 'notAFunction';
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });
        
        it('should log an error if the hook is not defined', () => {
            console.error = jest.fn();
            hook = undefined;
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });

        it('should log an error if the value is not defined', () => {
            console.error = jest.fn();
            value = undefined;
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });

        it('should log an error if the formatter is not defined', () => {
            console.error = jest.fn();
            formatter = undefined;
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });

        it('should log an error if the formatter.formatHook function is not defined', () => {
            console.error = jest.fn();
            formatter.formatHook = undefined;
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });
        
        it('should log an error if the formatter.formatHook function is not a function', () => {
            console.error = jest.fn();
            formatter.formatHook = 'notAFunction';
            setting.onChangeCallHook(hook, value, formatter, hookGroup, hookFunction);
            expect(console.error).toHaveBeenCalled();
        });

    });

    describe('onChangeUpdateFlags', () => {
        let context;
        let value;
        let selectedSetting;

        beforeEach(() => {
            context = {
                setFlags: (flag, value, update) => {
                    jest.fn();
                },
                update: () => {
                    jest.fn();
                }
            };
            setting.updateContextFlags = jest.fn();
            selectedSetting = {
                contextFlags: ['mockFlag'],
                nameKey: 'mockSetting'
            };
            value = true;
        });

        it('should call updateContextFlags with the correct arguments' , () => {
            setting.onChangeUpdateFlags(context, value, selectedSetting);
            expect(setting.updateContextFlags).toHaveBeenCalledWith(context, value);
        });

        it('should log a debug message if the operation is successful', () => {
            console.debug = jest.fn();
            setting.onChangeUpdateFlags(context, value, selectedSetting);
            expect(console.debug).toHaveBeenCalledWith(`${selectedSetting.nameKey}.onChange: ${value}`);
        });

        describe('Validation tests', () => {
            it('should log an error if the context is not defined', () => {
                console.error = jest.fn();
                context = undefined;
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });

            it('should log an error if the context is not an object', () => {
                console.error = jest.fn();
                context = 'notAnObject';
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });

            it('should log an error if the setting is not defined', () => {
                console.error = jest.fn();
                selectedSetting = null;
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });

            it('should log an error if setting.contextFlags is not defined', () => {
                console.error = jest.fn();
                selectedSetting.contextFlags = null;
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });

            it('should log an error if value is not defined', () => {
                console.error = jest.fn();
                value = null;
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });

            it('should log an error if value is not a boolean', () => {
                console.error = jest.fn();
                value = 'notABoolean';
                setting.onChangeUpdateFlags(context, value, selectedSetting);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe('onChangeFunction', () => {
        let context;
        let value;
        let formatter;
        let selectedSetting;

        beforeEach(() => {
            context = {
                setFlags: (flag, value, update) => {
                    jest.fn();
                },
                update: () => {
                    jest.fn();
                }
            };
            setting.onChangeCallHook = jest.fn();
            setting.onChangeUpdateFlags = jest.fn();
            selectedSetting = {
                props: { 
                    hooksCalled: ['mockHook'],
                    contextFlags: ['mockFlag']
                }
            };
            value = true;
            formatter = { formatHook: jest.fn() };
        });
        
        it('should call onChangeCallHook with the correct arguments', () => {
            setting.onChangeFunction(value, context, formatter, selectedSetting);
            expect(setting.onChangeCallHook).toHaveBeenCalledWith('mockHook', value, formatter);
        });

        it('should call onChangeCallHook more than once if multiple hooks are called', () => {
            selectedSetting.props.hooksCalled.push('mockHook2');
            setting.onChangeFunction(value, context, formatter, selectedSetting);
            expect(setting.onChangeCallHook).toHaveBeenCalledTimes(2);
        });

        it('should call onChangeUpdateFlags with the correct arguments', () => {
            setting.onChangeFunction(value, context, formatter, selectedSetting);
            expect(setting.onChangeUpdateFlags).toHaveBeenCalledWith(context, value);
        });

        it('should call onChangeUpdateFlags more than once if multiple flags are updated', () => {
            selectedSetting.props.contextFlags.push('mockFlag2');
            setting.onChangeFunction(value, context, formatter, selectedSetting);
            expect(setting.onChangeUpdateFlags).toHaveBeenCalledTimes(2);
        });
    });
});