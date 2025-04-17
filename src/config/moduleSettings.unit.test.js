import MODULE_SETTINGS, { MODULE_SETTINGS_INTERFACE } from './moduleSettings.js';

describe('MODULE_SETTINGS_INTERFACE', () => {
    describe('ALLOWED_SETTING_PROPS', () => {
        let allowedSettingsProps = MODULE_SETTINGS_INTERFACE.ALLOWED_SETTING_PROPS;
        it('should be an object', () => {
            expect(allowedSettingsProps).toBeInstanceOf(Object);
        });

        it('should not be empty', () => {
            expect(Object.keys(allowedSettingsProps).length).toBeGreaterThan(0);
        });

        it('all the vaules should be strings', () => {
            for (const key in allowedSettingsProps) {
                expect(typeof allowedSettingsProps[key]).toBe('string');
            }
        });
    });

    describe('ESSENTIAL_SETTING_PROPS', () => {
        let essentialSettingsProps = MODULE_SETTINGS_INTERFACE.ESSENTIAL_SETTING_PROPS;
        it('should be an array', () => {
            expect(essentialSettingsProps).toBeInstanceOf(Array);
        });

        it('if the array is not empty, all the values should be strings', () => {
            if (essentialSettingsProps.length > 0) {
                for (const value of essentialSettingsProps) {
                    expect(typeof value).toBe('string');
                }
            }
        });
    });
});

describe('MODULE_SETTINGS', () => {
        it('should be an object', () => {
        expect(MODULE_SETTINGS).toBeInstanceOf(Object);
    });

    describe('if the object is not empty', () => {
        let ifNotEmpty;
        let check;
        let allowedSettingsProps = MODULE_SETTINGS_INTERFACE.ALLOWED_SETTING_PROPS;
        let essentialSettingsProps = MODULE_SETTINGS_INTERFACE.ESSENTIAL_SETTING_PROPS;

        beforeEach(() => {
            const isEmpty = Object.keys(MODULE_SETTINGS).length === 0;
            ifNotEmpty = (check) => {
                if (!isEmpty) {
                    check();
                } else {
                    expect(isEmpty).toBe(true);
                }
            }
        });
        
        it('all the values should be objects', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    expect(MODULE_SETTINGS[key]).toBeInstanceOf(Object);
                }
            }
            ifNotEmpty(check);
        });

        it('all the objects should have a props property', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    expect(MODULE_SETTINGS[key].props).toBeDefined();
                }
            }
            ifNotEmpty(check);
        });

        it('all the objects should have a onChangeActions property', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    expect(MODULE_SETTINGS[key].onChangeActions).toBeDefined();
                }
            }
            ifNotEmpty(check);
        });

        it('all the objects props should have the essential properties', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    let props = MODULE_SETTINGS[key].props;
                    for (const prop of essentialSettingsProps) {
                        expect(props[prop]).toBeDefined();
                    }
                }
            }
            ifNotEmpty(check);
        });

        it('no object props should have a property that is not in the allowed settings props', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    let props = MODULE_SETTINGS[key].props;
                    for (const prop in props) {
                        expect(allowedSettingsProps[prop]).toBeDefined();
                    }
                }
            }
            ifNotEmpty(check);
        });

        it('all the objects props must be of the type defined in the allowed settings props', () => {
            check = () => {
                for (const key in MODULE_SETTINGS) {
                    let props = MODULE_SETTINGS[key].props;
                    for (const prop in props) {
                        if(allowedSettingsProps[prop] === 'CustomFormInput'){
                            expect(props[prop].prototype.constructor.name).toBe('CustomFormInput');
                        }
                        if(allowedSettingsProps[prop] === 'Function'){
                            expect(typeof props[prop]).toBe('function');
                        }
                        if(allowedSettingsProps[prop] === 'Object'){
                            expect(props[prop]).toBeInstanceOf(Object);
                        }
                        if(allowedSettingsProps[prop] === 'any'){
                            expect(props[prop]).toBeDefined();
                        } else {
                            expect(typeof props[prop]).toBe(allowedSettingsProps[prop]);
                        }
                    }
                }
            }
            ifNotEmpty(check);
        });
    });
});