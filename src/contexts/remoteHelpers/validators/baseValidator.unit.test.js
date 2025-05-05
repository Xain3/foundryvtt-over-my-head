import BaseValidator from "./baseValidator";

export const VALID_CONFIG = {
    CONSTANTS: {
        CONTEXT: {
            DEFAULTS: {
                REMOTE: {
                    ROOT: "module", // Root of the remote context
                    PATH: "moduleContext", // Path to the remote context
                    DATA_PATH: 'data', // Path to the data
                    FLAGS_PATH: 'flags', // Path to the flags
                    SETTINGS_PATH: 'settings', // Path to the settings
                    TIMESTAMP_KEY: 'timestamp', // Key for the timestamp
                    ROOT_MAP: (globalNamespace, module) => {
                        return {
                            window: globalNamespace.window,
                            document: globalNamespace.document,
                            game: globalNamespace.game,
                            user: globalNamespace.game?.user,
                            world: globalNamespace.game?.world,
                            canvas: globalNamespace.canvas,
                            ui: globalNamespace.ui,
                            local: globalNamespace.localStorage,
                            session: globalNamespace.sessionStorage,
                            module: module,
                            invalid: null, // Example of an invalid source
                        }
                    
                    }
                }
            }
        }
    }
};

describe('BaseValidator', () => {
    let validConfig;
    beforeEach(() => {
        jest.clearAllMocks();
        validConfig = VALID_CONFIG;
    });
    
    describe('validateConfig', () => {
        describe('ensureConfigIsProvided', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureConfigIsProvided(validConfig)).toBe(true);
            });
            it('throws if config is falsy and throwError=true', () => {
                expect(() => BaseValidator.ensureConfigIsProvided(null)).toThrow(/Config is required/);
            });
            it('logs warning and returns false if config is falsy and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConfigIsProvided(null, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should be provided'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConfigIsProvided(null, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureConfigIsObject', () => {
            it('returns true for valid object', () => {
                expect(BaseValidator.ensureConfigIsObject(validConfig)).toBe(true);
            });
            it('throws if not object and throwError=true', () => {
                expect(() => BaseValidator.ensureConfigIsObject('str')).toThrow(/Config must be a valid object/);
            });
            it('logs warning and returns false if not object and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConfigIsObject('str', false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should be a valid object'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConfigIsObject('str', false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureConstantsInConfig', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureConstantsInConfig(validConfig)).toBe(true);
            });
            it('throws if CONSTANTS missing and throwError=true', () => {
                expect(() => BaseValidator.ensureConstantsInConfig({})).toThrow(/Config must contain a CONSTANTS object/);
            });
            it('logs warning and returns false if CONSTANTS missing and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConstantsInConfig({}, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should contain a CONSTANTS object'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureConstantsInConfig({}, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureContextInConstants', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureContextInConstants(validConfig)).toBe(true);
            });
            it('throws if CONTEXT missing and throwError=true', () => {
                expect(() => BaseValidator.ensureContextInConstants({ CONSTANTS: {} })).toThrow(/Config must contain a CONTEXT object/);
            });
            it('logs warning and returns false if CONTEXT missing and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureContextInConstants({ CONSTANTS: {} }, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should contain a CONTEXT object'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureContextInConstants({ CONSTANTS: {} }, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureDefaultsInContext', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureDefaultsInContext(validConfig)).toBe(true);
            });
            it('throws if DEFAULTS missing and throwError=true', () => {
                expect(() => BaseValidator.ensureDefaultsInContext({ CONSTANTS: { CONTEXT: {} } })).toThrow(/Config must contain a CONTEXT.DEFAULTS object/);
            });
            it('logs warning and returns false if DEFAULTS missing and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureDefaultsInContext({ CONSTANTS: { CONTEXT: {} } }, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should contain a CONTEXT.DEFAULTS object'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureDefaultsInContext({ CONSTANTS: { CONTEXT: {} } }, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureRemoteDefaults', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureRemoteDefaults(validConfig)).toBe(true);
            });
            it('throws if REMOTE missing and throwError=true', () => {
                expect(() => BaseValidator.ensureRemoteDefaults({ CONSTANTS: { CONTEXT: { DEFAULTS: {} } } })).toThrow(/Config must contain a CONTEXT.DEFAULTS.REMOTE object/);
            });
            it('logs warning and returns false if REMOTE missing and throwError=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureRemoteDefaults({ CONSTANTS: { CONTEXT: { DEFAULTS: {} } } }, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should contain a CONTEXT.DEFAULTS.REMOTE object'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureRemoteDefaults({ CONSTANTS: { CONTEXT: { DEFAULTS: {} } } }, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('ensureRootInRemoteDefaults', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.ensureRootInRemoteDefaults(validConfig)).toBe(true);
            });
            it('throws if ROOT missing and throwError=true', () => {
                const badConfig = JSON.parse(JSON.stringify(validConfig));
                delete badConfig.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT;
                expect(() => BaseValidator.ensureRootInRemoteDefaults(badConfig, true)).toThrow(/Config must contain a CONTEXT.DEFAULTS.REMOTE.ROOT string/);
            });
            it('logs warning and returns false if ROOT missing and throwError=false', () => {
                const badConfig = JSON.parse(JSON.stringify(validConfig));
                delete badConfig.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT;
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureRootInRemoteDefaults(badConfig, false)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Config should contain a CONTEXT.DEFAULTS.REMOTE.ROOT string'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const badConfig = JSON.parse(JSON.stringify(validConfig));
                delete badConfig.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT;
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.ensureRootInRemoteDefaults(badConfig, false, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
        });

        describe('validateConfig', () => {
            it('returns true for valid config', () => {
                expect(BaseValidator.validateConfig(validConfig)).toBe(true);
            });
            it('throws for missing config', () => {
                expect(() => BaseValidator.validateConfig(null)).toThrow();
            });
            it('throws for missing CONSTANTS', () => {
                const badConfig = {};
                expect(() => BaseValidator.validateConfig(badConfig)).toThrow();
            });
            it('throws for missing CONTEXT', () => {
                const badConfig = { CONSTANTS: {} };
                expect(() => BaseValidator.validateConfig(badConfig)).toThrow();
            });
            it('throws for missing DEFAULTS', () => {
                const badConfig = { CONSTANTS: { CONTEXT: {} } };
                expect(() => BaseValidator.validateConfig(badConfig)).toThrow();
            });
            it('throws for missing REMOTE', () => {
                const badConfig = { CONSTANTS: { CONTEXT: { DEFAULTS: {} } } };
                expect(() => BaseValidator.validateConfig(badConfig)).toThrow();
            });
            it('should not throw for missing Root as default is revert to fallback', () => {
                const badConfig = { CONSTANTS: { CONTEXT: { DEFAULTS: { REMOTE: {} } } } };
                expect(() => BaseValidator.validateConfig(badConfig)).not.toThrow();
            });
        });

        describe('validateContextRootIdentifier', () => {
            it('returns true for valid string', () => {
                expect(BaseValidator.validateContextRootIdentifier('root')).toBe(true);
            });
            it('returns false and logs for non-string', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.validateContextRootIdentifier(123)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Context root identifier should be a string'));
                spy.mockRestore();
            });
            it('returns false and logs for undefined', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.validateContextRootIdentifier(undefined)).toBe(false);
                expect(spy).toHaveBeenCalledWith(expect.stringContaining('Context root identifier is not provided'));
                spy.mockRestore();
            });
            it('returns false and does not log if consoleLog=false', () => {
                const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                expect(BaseValidator.validateContextRootIdentifier(123, false)).toBe(false);
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
            it('throws if throwError=true for non-string', () => {
                expect(() => BaseValidator.validateContextRootIdentifier(123, true, true)).toThrow(BaseValidator.ConfigError);
            });
            it('throws if throwError=true for falsy', () => {
                expect(() => BaseValidator.validateContextRootIdentifier(undefined, true, true)).toThrow(BaseValidator.ConfigError);
            });
        });

        describe('validateOverrideGlobal', () => {
            it('does not throw for undefined', () => {
                expect(() => BaseValidator.validateOverrideGlobal(undefined)).not.toThrow();
            });
            it('does not throw for null', () => {
                expect(() => BaseValidator.validateOverrideGlobal(null)).not.toThrow();
            });
            it('does not throw for object', () => {
                expect(() => BaseValidator.validateOverrideGlobal({})).not.toThrow();
            });
            it('throws for non-object', () => {
                expect(() => BaseValidator.validateOverrideGlobal(123)).toThrow(BaseValidator.OverrideGlobalError);
            });
        });

        describe('validateOverrideModule', () => {
            it('does not throw for undefined', () => {
                expect(() => BaseValidator.validateOverrideModule(undefined)).not.toThrow();
            });
            it('does not throw for null', () => {
                expect(() => BaseValidator.validateOverrideModule(null)).not.toThrow();
            });
            it('does not throw for object', () => {
                expect(() => BaseValidator.validateOverrideModule({})).not.toThrow();
            });
            it('throws for non-object', () => {
                expect(() => BaseValidator.validateOverrideModule(123)).toThrow(BaseValidator.OverrideModuleError);
            });
        });

        describe('validateArgs', () => {
            it('does not throw for valid args', () => {
                expect(() => BaseValidator.validateArgs({ config: validConfig, contextRootIdentifier: 'root', overrideGlobal: {}, overrideModule: {} })).not.toThrow();
            });
            it('throws for invalid config', () => {
                expect(() => BaseValidator.validateArgs({ config: null })).toThrow();
            });
            it('throws for invalid overrideGlobal', () => {
                expect(() => BaseValidator.validateArgs({ config: validConfig, overrideGlobal: 123 })).toThrow(BaseValidator.OverrideGlobalError);
            });
            it('throws for invalid overrideModule', () => {
                expect(() => BaseValidator.validateArgs({ config: validConfig, overrideModule: 123 })).toThrow(BaseValidator.OverrideModuleError);
            });
        });
    });
});
