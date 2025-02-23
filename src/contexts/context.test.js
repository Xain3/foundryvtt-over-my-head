import Context from './context';
import MockConfig from '../../tests/mocks/mockConfig';
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
            expect(context.remoteContextManager).toBe(mockUtils.remoteContextManager);
        });

        it('should set the original config property to the correct value', () => {
            expect(context.originalConfig).toBe(mockConfig);
        });

        it('should set the state property to an empty object', () => {
            expect(context.state).toEqual({});
        });

        it('should call extractContextInit twice', () => {
            expect(context.extractContextInit).toHaveBeenCalledTimes(2);
        });

        it('should call initializeContext', () => {
            expect(context.initializeContext).toHaveBeenCalledTimes(1);
        });
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
                pushToRemoteContext: jest.fn(),
            };
            context.state = mockData;
        });

        it('should call pushToRemoteContext with the correct arguments', () => {
            context.pushState();
            expect(context.remoteContextManager.pushToRemoteContext).toHaveBeenCalledWith(context.state);
        });

        it('should pass an empty object if state is an empty object', () => {
            context.state = {};
            context.pushState();
            expect(context.remoteContextManager.pushToRemoteContext).toHaveBeenCalledWith({});
        });

        it('should log a warning and default to an empty object if context.state is not defined', () => {
            console.warn = jest.fn();
            context.state = undefined;
            context.pushState();
            expect(console.warn).toHaveBeenCalledWith('Context state is not defined, defaulting to an empty object');
            expect(context.remoteContextManager.pushToRemoteContext).toHaveBeenCalledWith({});
        });

        it('should throw an error if state is not an object', () => {
            context.state = 'test';
            expect(() => context.pushState()).toThrow('Context state is not an object');
        });
    });

    describe('pullState', () => {
        let mockRemoteState;

        beforeEach(() => {
            context.remoteContextManager = {
                pullFromRemoteContext: jest.fn(),
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

        it('should call pullFromRemoteContext', () => {
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue(mockRemoteState);
            context.pullState();
            expect(context.remoteContextManager.pullFromRemoteContext).toHaveBeenCalledTimes(1);
        });

        it ('should set the state to the remote state if present and overwrite is set to true', () => {
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue(mockRemoteState);
            context.pullState(undefined, true);
            expect(context.state).toEqual(mockRemoteState);
        });

        it('should merge the local state with the remote state if overwrite is set to false', () => {
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue(mockRemoteState);
            context.pullState(undefined, false);
            let expectedState = {
                test: 'remote',
                somethingOnLocal: 'something',
                somethingOnRemote: 'something',
            }
            expect(context.state).toEqual(expectedState);
        });

        it('should not change the state if the remote state is not present', () => {
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue(undefined);
            let startingState = context.state;
            context.pullState();
            expect(context.state).toEqual(startingState);
        });

        it('should log a warning if the remote state is not defined', () => {
            console.warn = jest.fn();
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue(undefined);
            context.pullState();
            expect(console.warn).toHaveBeenCalledWith('Remote state is not defined, context state not updated');
        });

        it('should log a warning if the remote state is not an object', () => {
            console.warn = jest.fn();
            context.remoteContextManager.pullFromRemoteContext.mockReturnValue('test');
            context.pullState();
            expect(console.warn).toHaveBeenCalledWith('Remote state is not an object, context state not updated');
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
        });

        describe('clearContext', () => {

        });


        describe('syncState', () => {
            let remoteLocation;

            beforeEach(() => {
                remoteLocation = mockData;
                remoteLocation.dateModified = 2;
            });
            
            it('should log an error if the remote location is not defined nor passed as an argument', () => {
                console.error = jest.fn();
                context.syncState();
                expect(console.error).toHaveBeenCalledWith('Remote location is not defined, state not synced');
            });

            it('should call pullState if the remote location is defined and the remote location is newer', () => {
                context.pullState = jest.fn();
                context.state.dateModified = 1;
                context.syncState(remoteLocation);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });

            it('should not call pushState if the remote location is defined and the remote location is older', () => {
                context.pushState = jest.fn();
                context.state.dateModified = 3;
                context.syncState(remoteLocation);
                expect(context.pushState).toHaveBeenCalledTimes(1);
            });              
        });

        describe('pushKey)', () => {
            let mockKey;
            let mockValue;
            let remoteLocation

            beforeEach(() => {
                mockKey = 'test';
                mockValue = 'test';
                remoteLocation = mockData;
                remoteLocation.dateModified = 2;
            });

            it('should call writeToRemoteContext with the correct arguments', () => {
                context.writeToRemoteContext = jest.fn();
                context.pushKey(mockKey, mockValue, remoteLocation);
                expect(context.writeToRemoteContext).toHaveBeenCalledTimes(2);
                expect(context.writeToRemoteContext).toHaveBeenNthCalledWith(1, mockKey, mockValue);
                expect(context.writeToRemoteContext).toHaveBeenNthCalledWith(2, 'dateModified', expect.any(Number));
                expect(context.writeToRemoteContext.mock.calls[1][1]).toBeGreaterThan(2);
            });

            it('should log an error if the remote location is not defined', () => {
                console.error = jest.fn();
                context.remoteLocation = undefined;
                context.pushKey(mockKey, mockValue);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Key-value pair not pushed to remote context'));
            });

            it('should log an error if the remote location is not an object', () => {
                console.error = jest.fn();
                context.remoteLocation = 'test';
                context.pushKey(mockKey, mockValue);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Key-value pair not pushed to remote context'));
            });

            it ('should log an error if the key is not one of the allowed types', () => {
                console.error = jest.fn();
                context.pushKey({bad: 'type'}, mockValue, remoteLocation);
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Key-value pair not pushed to remote context'));
            });
        });
    });
});