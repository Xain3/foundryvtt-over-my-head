import Context from './context';
import MockConfig from '../../tests/mocks/config';
import Validator from '../utils/validator';

describe('Context', () => {
    let mockConfig;
    let mockUtils;
    let mockData;
    let context;
    let spyExtractor;
    let spyInitializer;
    let initialiseContextWithMocks;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        spyExtractor = jest.spyOn(Context.prototype, 'extractContextInit');
        spyInitializer = jest.spyOn(Context.prototype, 'initializeContext');
        initialiseContextWithMocks = (config, utils) => {
            spyExtractor.mockReturnValue('mockValue1');
            spyInitializer.mockReturnValue('mockValue2');
            context = new Context(config, utils);
        }
        mockConfig = new MockConfig();
        mockUtils = {
            gameManager: jest.fn(),
            remoteContextManager: jest.fn(),
            validator: new Validator(),
        };
        mockData = {
            test: 'test',
        };
        initialiseContextWithMocks(mockConfig, mockUtils);
    });

    describe('constructor', () => {
        
        it('should return a new instance of Context', () => {
            expect(context).toBeInstanceOf(Context);
        });

        it('should set the utility properties to the correct value', () => {
            expect(context.manager).toBe(mockUtils.gameManager);
        });

        it('should set the original config property to the correct value', () => {
            expect(context.originalConfig).toBe(mockConfig);
        });

        it('should set the config property to the correct value', () => {
            expect(context.config).toBe(mockConfig);
        }
        );
        it('should set an empty state if initializeState is false' , () => {
            spyExtractor.mockReturnValue('mockValue1');
            spyInitializer.mockReturnValue('mockValue2');
            mockConfig = new MockConfig();
            context = new Context(mockConfig, mockUtils, false);
            expect(context.state).toEqual({});
        });

        it('should throw an error if config is not defined', () => {
            expect(() => {
                context = new Context(undefined, mockUtils);
            }).toThrow('CONFIG is not defined. Cannot initialize context');
        });

        it('should throw an error if config is not an object', () => {
            mockUtils = {
                validator: {
                    isObject: jest.fn((arg) => typeof arg === 'object' && arg !== null),
                },
            };
            expect(() => {
                context = new Context('string', mockUtils);
            }).toThrow('CONFIG is not an object. Cannot initialize context');
        });

        it('should throw an error if utils is not defined', () => {
            expect(() => {
                context = new Context(mockConfig, undefined);
            }).toThrow('Utils is not defined. Cannot initialize context');
        }
        );

        it('should throw an error if utils is not an object', () => {
            expect(() => {
                context = new Context(mockConfig, 'string');
            }).toThrow('Utils is not an object. Cannot initialize context');
        });

        it('should throw an error if utils does not have a validator property', () => {
            expect(() => {
                context = new Context(mockConfig, {});
            }).toThrow('Validator not found in utilities. Cannot initialize context');
        }
        );

        it('should throw an error if utils does not have a gameManager property', () => {
            expect(() => {
                context = new Context(mockConfig, {validator: {
                    isObject: jest.fn((arg) => typeof arg === 'object' && arg !== null),
                }});
            }).toThrow('Utils does not have a gameManager property. Cannot initialize context');
        }
        );

        it('should throw an error if initializeContext is not a boolean', () => {
            expect(() => {
                context = new Context(mockConfig, mockUtils, 'string');
            }).toThrow('initializeContext is not a boolean. Cannot initialize context');
        }
        );
    });

    describe('extractContextInit', () => {
        let output;
        let expectedOutput;
        let config;

        beforeEach(() => {
            spyExtractor.mockRestore();
            config = {
                CONSTANTS: {
                    CONTEXT_INIT: {
                        test: 'test',
                    },
                    otherConstant: 'otherConstant',
                },
            };
        });

        it('should return both the modified CONFIG and contextInit as separate objects if both is selected as returnmode', () => {
            output = context.extractContextInit(config, 'both');
            expectedOutput = {
                CONFIG: {
                    CONSTANTS: {
                        otherConstant: 'otherConstant',
                    },
                },
                contextInit: {
                    test: 'test',
                },
            };
            expect(output).toEqual(expectedOutput);
        });

        it('should return CONFIG without ContextInit if config is selected as returnmode', () => {
            output = context.extractContextInit(config, 'config');
            expectedOutput = {
                CONSTANTS: {
                    otherConstant: 'otherConstant',
                },
            };
            expect(output).toEqual(expectedOutput);
        });

        it('should return contextInit without CONFIG if contextInit is selected as returnmode', () => {
            output = context.extractContextInit(config, 'contextInit');
            expectedOutput = {
                test: 'test',
            };
            expect(output).toEqual(expectedOutput);
        });

        it('should throw an error if config is not defined', () => {
            expect(() => {
            context.extractContextInit(undefined);
            }).toThrow();
        });

        it('should throw an error if config is not an object', () => {
            expect(() => {
            context.extractContextInit('string');
            }).toThrow();
        });

        it('should throw an error if config does not have a CONSTANTS property', () => {
            expect(() => {
            context.extractContextInit({});
            }).toThrow();
        });

        it('should throw an error if config does not have a CONTEXT_INIT property', () => {
            expect(() => {
            context.extractContextInit({ CONSTANTS: {} });
            }).toThrow();
        });

        it('should throw an error if returnMode is not a string', () => {
            expect(() => {
            context.extractContextInit(config, 123);
            }).toThrow();
        });

        it('should throw an error when an error occurs', () => {
            expect(() => {
                context.extractContextInit(config, 123);
            }).toThrow('Return Mode is not a string. Could not initialize context');
        });

        it('should log a warning if there is an error and the returnMode is "config"', () => {
            console.warn = jest.fn();
            context.extractContextInit('string', 'config');
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Defaulting to CONFIG'),
            );
        });
    });

    describe('initializeContext', () => {
        let mockInitialState;
        let flagsObject;

        beforeEach(() => {
            spyInitializer.mockRestore();
            mockInitialState = mockData;
            flagsObject = { };
            context.initialiseData = jest.fn();
            context.initialiseFlags = jest.fn();
        });

        it('should set the state property correctly', () => {
            context.initializeContext(mockInitialState);
            expect(context.state).toEqual(mockInitialState);
        });

        it('should call initialiseData with the correct arguments', () => {
            context.initializeContext(mockInitialState);
            expect(context.initialiseData).toHaveBeenCalledWith(mockInitialState);
        });

        it('should call initialiseFlags with an empty object', () => {
            context.initializeContext(mockInitialState);
            expect(context.initialiseFlags).toHaveBeenCalledWith(flagsObject);
        });

        it('should set an empty state if state is null or not an object', () => {
            context.initializeContext('string');
            expect(context.state).toEqual({});
            context.initializeContext(123);
            expect(context.state).toEqual({});
            context.initializeContext(null);
            expect(context.state).toEqual({});
            context.initializeContext(true);
            expect(context.state).toEqual({});
            context.initializeContext(false);
            expect(context.state).toEqual({});
        }
        );
    });

    describe('initialiseData', () => {
        it('should set data correctly', () => {
            context.initialiseData(mockData);
            expect(context.state.data).toEqual(mockData);
        });            

        it('should set data to an empty object if no data is provided', () => {
            context.initialiseData();
            expect(context.state.data).toEqual({});
        });

        it('should set dateModified with the time modified', () => {
            const date = new Date();
            context.initialiseData(mockData);
            expect(context.state.dateModified).toBeGreaterThanOrEqual(date.getTime());
        });
    });

    describe('initialiseFlags', () => {
        let mockFlags;

        beforeEach(() => { 
            mockFlags = mockData;
        });

        it('should set data correctly', () => {
            context.initialiseFlags(mockFlags);
            expect(context.state.flags).toEqual(mockFlags);
        });            

        it('should set data to an empty object if no data is provided', () => {
            context.initialiseFlags();
            expect(context.state.flags).toEqual({});
        });

        it('should set dateModified with the time modified', () => {
            const date = new Date();
            context.initialiseFlags(mockFlags);
            expect(context.state.dateModified).toBeGreaterThanOrEqual(date.getTime());
        });
    });

    describe('pushState', () => {
        beforeEach(() => {
            context.remoteContextManager = {
                pushState: jest.fn(),
            };
            context.state = mockData;
        });

        it('should call pushState on the remoteContextManager with the context instance', () => {
            context.pushState();
            expect(context.remoteContextManager.pushState).toHaveBeenCalledWith(context);
        });

        it('should log an error if remoteContextManager.pushState throws an error', () => {
            console.error = jest.fn();
            context.remoteContextManager.pushState.mockImplementation(() => {
                throw new Error('Test error');
            });
            try {
                context.pushState();
            } catch (error) {
                console.error(error.message);
            }
            expect(console.error).toHaveBeenCalledWith('Test error');
            expect(console.error).toHaveBeenCalledWith('Test error');
        });

        it('should not call pushState if remoteContextManager is not defined', () => {
            context.remoteContextManager = undefined;
            expect(() => context.pushState()).toThrow('Cannot read properties of undefined (reading \'pushState\')');
        });
    });

    describe('pullState', () => {
        let mockRemoteState;

        beforeEach(() => {
            context.remoteContextManager = {
                pullState: jest.fn(),
            };
            context.state = {
                test: 'local',
                somethingOnLocal: 'something'
            };
            mockRemoteState = {
                test: 'remote',
                somethingOnRemote: 'something',
            };
        });

        it('should call pullState on the remoteContextManager with the correct arguments', () => {
            context.pullState(mockRemoteState, true);
            expect(context.remoteContextManager.pullState).toHaveBeenCalledWith(context, mockRemoteState, true);
        });

        it('should call pullState with default arguments if none are provided', () => {
            context.pullState();
            expect(context.remoteContextManager.pullState).toHaveBeenCalledWith(context, context.remoteContext, false);
        });

        it('should throw an error if remoteContextManager.pullState throws an error', () => {
            context.remoteContextManager.pullState.mockImplementation(() => {
                throw new Error('Test error');
            });
            expect(() => context.pullState()).toThrow('Test error');
        });
    });

    describe('writeToRemoteContext', () => {
        let mockKey;
        let mockValue

        beforeEach(() => {
            context.remoteContextManager = {
                writeToRemoteContext: jest.fn(),
            };
            mockKey = 'test';
            mockValue = 'test';
        });

        it('should call writeToRemoteContext with the correct arguments', () => {
            context.writeToRemoteContext(mockKey, mockValue);
            expect(context.remoteContextManager.writeToRemoteContext).toHaveBeenCalledWith(mockKey, mockValue);
        });

        it('should log a warning if key and value are not defined', () => {
            console.warn = jest.fn();
            context.writeToRemoteContext();
            expect(console.warn).toHaveBeenCalledWith('Key and value are not defined, remote context not updated');
        });

        it('should log a warning if key is not defined', () => {
            console.warn = jest.fn();
            context.writeToRemoteContext(undefined, mockValue);
            expect(console.warn).toHaveBeenCalledWith('Key is not defined, remote context not updated');
        });

        it('should log a warning if value is not defined', () => {
            console.warn = jest.fn();
            context.writeToRemoteContext(mockKey);
            expect(console.warn).toHaveBeenCalledWith('Value is not defined, remote context not updated');
        });

        it('should log a warning if the key is of the wrong type', () => {
            console.warn = jest.fn();
            context.writeToRemoteContext({bad: 'type'}, mockValue);
            expect(console.warn).toHaveBeenCalledWith('Key is not a string, a symbol, or a number. Remote context not updated');
        }
        );
    });

    describe('readFromRemoteContext', () => {
        let mockKey;

        beforeEach(() => {
            context.remoteContextManager = {
                readFromRemoteContext: jest.fn(),
            };
            mockKey = 'test';
        });

        it('should call readFromRemoteContext with the correct arguments', () => {
            context.readFromRemoteContext(mockKey);
            expect(context.remoteContextManager.readFromRemoteContext).toHaveBeenCalledWith(mockKey);
        });

        it('should log a warning if key is not defined', () => {
            console.warn = jest.fn();
            context.readFromRemoteContext();
            expect(console.warn).toHaveBeenCalledWith('Key is not defined, remote context not read');
        });

        it('should log a warning if the key is of the wrong type', () => {
            console.warn = jest.fn();
            context.readFromRemoteContext({bad: 'type'});
            expect(console.warn).toHaveBeenCalledWith('Key is not a string, a symbol, or a number. Remote context not read');
        });
        
        describe('clearRemoteContext', () => {
            beforeEach(() => {
                context.remoteContextManager = {
                    clearRemoteContext: jest.fn(),
                };
            });
            
            it('should call clearRemoteContext', () => {
                context.clearRemoteContext();
                expect(context.remoteContextManager.clearRemoteContext).toHaveBeenCalledTimes(1);
            }); 
        });

        describe('clearLocalContext', () => {
            beforeEach(() => {
                context.state = mockData;
            });

            it('should clear the local context', () => {
                context.clearLocalContext();
                expect(context.state).toEqual({});
            });

            it('should should log an error if the context is not defined', () => {
                context.state = null;
                console.error = jest.fn();
                context.clearLocalContext();
                expect(console.error).toHaveBeenCalledWith('Local context is not defined. Local context not cleared');
            }
            );

            it('should should log an error if the context is not an object', () => {
                context.state = 'string';
                console.error = jest.fn();
                context.clearLocalContext();
                expect(console.error).toHaveBeenCalledWith('Local context is not an object. Local context not cleared');   }
            );
        });

        describe('clearContext', () => {
            beforeEach(() => {
                context.clearRemoteContext = jest.fn();
                context.clearLocalContext = jest.fn();
                console.error = jest.fn();
            });
    
            it('should throw an error if both clearRemote and clearLocal are false', () => {
                context.clearContext(false, false);
                expect(console.error).toHaveBeenCalledWith('Both clearRemote and clearLocal are false, no context cleared');
            });
    
            it('should call clearRemoteContext if clearRemote is true', () => {
                context.clearContext(true, false);
                expect(context.clearRemoteContext).toHaveBeenCalledTimes(1);
                expect(context.clearLocalContext).not.toHaveBeenCalled();
            });
    
            it('should call clearLocalContext if clearLocal is true', () => {
                context.clearContext(false, true);
                expect(context.clearLocalContext).toHaveBeenCalledTimes(1);
                expect(context.clearRemoteContext).not.toHaveBeenCalled();
            });
    
            it('should call both clearRemoteContext and clearLocalContext if both are true', () => {
                context.clearContext(true, true);
                expect(context.clearRemoteContext).toHaveBeenCalledTimes(1);
                expect(context.clearLocalContext).toHaveBeenCalledTimes(1);
            });
    
            it('should catch and log errors thrown by clearRemoteContext', () => {
                const error = new Error('Remote context error');
                context.clearRemoteContext.mockImplementation(() => {
                    throw error;
                });
                context.clearContext(true, false);
                expect(console.error).toHaveBeenCalledWith(error.message);
            });
    
            it('should catch and log errors thrown by clearLocalContext', () => {
                const error = new Error('Local context error');
                context.clearLocalContext.mockImplementation(() => {
                    throw error;
                });
                context.clearContext(false, true);
                expect(console.error).toHaveBeenCalledWith(error.message);
            });
        });


        describe('syncState', () => {
            let remoteLocation;
    
            beforeEach(() => {
                context.remoteContextManager = {
                    syncState: jest.fn(),
                };
                remoteLocation = {
                    dateModified: Date.now() + 1000,
                    data: { test: 'remote' },
                    flags: { flag: 'remote' }
                };
                context.pullState = jest.fn();
                context.pushState = jest.fn();
            });
    
            it('should call syncState on the remoteContextManager with the correct arguments', () => {
                context.syncState(remoteLocation);
                expect(context.remoteContextManager.syncState).toHaveBeenCalledWith(context, remoteLocation);
            }
            );
        });
        describe('pushKey', () => {
            let mockKey;
            let mockValue;
            let remoteLocation;

            beforeEach(() => {
                context.remoteContextManager = {
                    pushKey: jest.fn(),
                };
                mockKey = 'testKey';
                mockValue = 'testValue';
                remoteLocation = 'remoteLocation';
            });

            it('should call pushKey on the remoteContextManager with the correct arguments', () => {
                context.pushKey(mockKey, mockValue, remoteLocation);
                expect(context.remoteContextManager.pushKey).toHaveBeenCalledWith(context, mockKey, mockValue, remoteLocation);
            });

            it('should call pushKey with the instance\'s remoteLocation if none is provided', () => {
                context.remoteLocation = remoteLocation;
                context.pushKey(mockKey, mockValue);
                expect(context.remoteContextManager.pushKey).toHaveBeenCalledWith(context, mockKey, mockValue, remoteLocation);
            });

            it('should throw an error if remoteContextManager.pushKey throws an error', () => {
                context.remoteContextManager.pushKey.mockImplementation(() => {
                    throw new Error('Test error');
                });
                expect(() => context.pushKey(mockKey, mockValue)).toThrow('Test error');
            });
        });        
   
        describe('get', () => {
            it('should retrieve the value associated with the specified key', () => {
                context.state.testKey = 'testValue';
                expect(context.get('testKey')).toBe('testValue');
            });

            it('should pull the state before retrieving the value if pullAndGet is true', () => {
                context.pullState = jest.fn();
                context.state.testKey = 'testValue';
                context.get('testKey', true);
                expect(context.pullState).toHaveBeenCalled();
            });
        });

        describe('getRemoteLocation', () => {
            it('should retrieve the remote location', () => {
                context.remoteLocation = 'testRemoteLocation';
                expect(context.getRemoteLocation()).toBe('testRemoteLocation');
            });
        });

        describe('getState', () => {
            it('should retrieve the current state', () => {
                expect(context.getState()).toBe(context.state);
            });

            it('should pull the state before retrieving it if pullAndGet is true', () => {
                context.pullState = jest.fn();
                context.getState(true);
                expect(context.pullState).toHaveBeenCalled();
            });
        });

        describe('getConfig', () => {
            it('should retrieve the entire configuration object if no key is provided', () => {
                expect(context.getConfig()).toBe(context.config);
            });

            it('should retrieve the configuration value for the specified key', () => {
                context.config.testKey = 'testValue';
                expect(context.getConfig('testKey')).toBe('testValue');
            });

            it('should pull the state before retrieving the configuration if pullAndGet is true', () => {
                context.pullState = jest.fn();
                context.getConfig(null, true);
                expect(context.pullState).toHaveBeenCalled();
            });
        });

        describe('getFlags', () => {
            it('should retrieve all flags if no key is provided', () => {
                expect(context.getFlags()).toBe(context.state.flags);
            });

            it('should retrieve the flag value for the specified key', () => {
                context.state.flags.testKey = 'testValue';
                expect(context.getFlags('testKey')).toBe('testValue');
            });

            it('should pull the state before retrieving the flags if pullAndGet is true', () => {
                context.pullState = jest.fn();
                context.getFlags(null, true);
                expect(context.pullState).toHaveBeenCalled();
            });
        });

        describe('getData', () => {
            it('should retrieve all data if no key is provided', () => {
                expect(context.getData()).toBe(context.state.data);
            });

            it('should retrieve the data value for the specified key', () => {
                context.state.data.testKey = 'testValue';
                expect(context.getData('testKey')).toBe('testValue');
            });

            it('should pull the state before retrieving the data if pullAndGet is true', () => {
                context.pullState = jest.fn();
                context.getData(null, true);
                expect(context.pullState).toHaveBeenCalled();
            });
        });

        describe('set', () => {
            it('should set the value for the specified key in the state', () => {
                context.set('testKey', 'testValue');
                expect(context.state.data.testKey).toBe('testValue');
            });

            it('should update the dateModified when setting a value', () => {
                const date = Date.now();
                context.set('testKey', 'testValue');
                expect(context.state.dateModified).toBeGreaterThanOrEqual(date);
            });

            it('should push the key-value pair to the remote location if alsoPush is true', () => {
                context.pushKey = jest.fn();
                context.set('testKey', 'testValue', true);
                expect(context.pushKey).toHaveBeenCalledWith('data', context.state.data);
            });

            it('should only push the key-value pair to the remote location if onlyRemote is true', () => {
                context.pushKey = jest.fn();
                context.set('testKey', 'testValue', false, true);
                expect(context.state.data.testKey).toBeUndefined();
                expect(context.pushKey).toHaveBeenCalledWith('data', context.state.data);
            });
        });

        describe('setRemoteLocation', () => {
            it('should set the remote location', () => {
                context.setRemoteLocation('testRemoteLocation');
                expect(context.remoteLocation).toBe('testRemoteLocation');
            });

            it('should update the dateModified when setting the remote location', () => {
                const date = Date.now();
                context.setRemoteLocation('testRemoteLocation');
                expect(context.state.dateModified).toBeGreaterThanOrEqual(date);
            });

            it('should push the state if alsoPush is true', () => {
                context.pushState = jest.fn();
                context.setRemoteLocation('testRemoteLocation', true);
                expect(context.pushState).toHaveBeenCalledWith('testRemoteLocation');
            });
        });

        describe('setFlags', () => {
            it('should set the flag for the specified key in the state', () => {
                context.setFlags('testKey', 'testValue');
                expect(context.state.flags.testKey).toBe('testValue');
            });

            it('should update the dateModified when setting a flag', () => {
                const date = Date.now();
                context.setFlags('testKey', 'testValue');
                expect(context.state.dateModified).toBeGreaterThanOrEqual(date);
            });

            it('should push the flags to the remote location if alsoPush is true', () => {
                context.pushKey = jest.fn();
                context.setFlags('testKey', 'testValue', true);
                expect(context.pushKey).toHaveBeenCalledWith('flags', context.state.flags);
            });

            it('should only push the flags to the remote location if onlyRemote is true', () => {
                context.pushKey = jest.fn();
                context.setFlags('testKey', 'testValue', false, true);
                expect(context.state.flags.testKey).toBeUndefined();
                expect(context.pushKey).toHaveBeenCalledWith('flags', context.state.flags);
            });
        });
    });
})