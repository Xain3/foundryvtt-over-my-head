import HooksHandler from './hooksHandler';
import Handler from '../baseClasses/handler';


/**
 * Mocks dependencies for testing the hooksHandler module.
 * 
 * This function uses Jest to mock the handler base class, providing a
 * standardized test environment with mock implementations of:
 * - config.HOOKS.buildHook
 * - empty context object
 * - empty utils object
 * 
 * Call this function at the beginning of tests that require these dependencies
 * to be mocked.
 * 
 * @function
 */
function mockDependencies() {
    jest.doMock('../baseClasses/managers/handler', () => {
        return jest.fn().mockImplementation(() => {
            return {
                config: {
                    HOOKS: {
                        buildHook: jest.fn()
                    }
                },
                context: {},
                utils: {}
            };
        });
    });
}

describe('HooksHandler', () => {
    let hooksHandler;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockGlobalHooks;
    
    beforeEach(() => {
        mockGlobalHooks = {
            on: jest.fn().mockReturnValue('onResult'),
            once: jest.fn().mockReturnValue('onceResult'),
            callAll: jest.fn().mockReturnValue('callAllResult')
        };
        
        global.Hooks = mockGlobalHooks;
        
        mockConfig = {
            HOOKS: {
                buildHook: jest.fn((hookName, hookGroup) => {
                    if (hookName === 'validHook') return 'hook:valid';
                    return null;
                })
            }
        };
        mockContext = {};
        mockUtils = {};
        
        hooksHandler = new HooksHandler(mockConfig, mockContext, mockUtils);
    });
    
    afterEach(() => {
        jest.resetAllMocks();
    });
    
    describe('constructor', () => {
        it('should inherit from Handler', () => {
            expect(hooksHandler).toBeInstanceOf(Handler);
        });
        
        it('should set the hooks property from config', () => {
            mockDependencies();
            hooksHandler = new HooksHandler(mockConfig, mockContext, mockUtils);
            expect(hooksHandler.hooks).toBe(mockConfig.HOOKS);
            jest.resetModules();
        });
    });
    
    describe('methods', () => {
        beforeEach(() => {
            mockDependencies();
            // Reset global.Hooks after mocking dependencies
            global.Hooks = mockGlobalHooks;
            hooksHandler = new HooksHandler(mockConfig, mockContext, mockUtils);
        });
        
        afterEach(() => {
            jest.resetModules();
        });

        describe('on', () => {

            it('should call buildHook with correct parameters', () => {
                hooksHandler.on('validHook', 'testGroup', 'arg1');
                expect(mockConfig.HOOKS.buildHook).toHaveBeenCalledWith('validHook', 'testGroup');
            });
            
            it('should call globalHooks.on with correct parameters', () => {
                hooksHandler.on('validHook', 'testGroup', 'arg1', 'arg2');
                expect(mockGlobalHooks.on).toHaveBeenCalledWith('hook:valid', 'arg1', 'arg2');
            });
            
            it('should return the result from globalHooks.on', () => {
                const result = hooksHandler.on('validHook', 'testGroup');
                expect(result).toBe('onResult');
            });
            
            it('should throw an error for invalid hook', () => {
                expect(() => hooksHandler.on('invalidHook', 'testGroup')).toThrow('Hook invalidHook does not exist');
            });
        });
        
        describe('once', () => {
            it('should call buildHook with correct parameters', () => {
                hooksHandler.once('validHook', 'testGroup', 'arg1');
                expect(mockConfig.HOOKS.buildHook).toHaveBeenCalledWith('validHook', 'testGroup');
            });
            
            it('should call globalHooks.once with correct parameters', () => {
                hooksHandler.once('validHook', 'testGroup', 'arg1', 'arg2');
                expect(mockGlobalHooks.once).toHaveBeenCalledWith('hook:valid', 'arg1', 'arg2');
            });
            
            it('should return the result from globalHooks.once', () => {
                const result = hooksHandler.once('validHook', 'testGroup');
                expect(result).toBe('onceResult');
            });
            
            it('should throw an error for invalid hook', () => {
                expect(() => hooksHandler.once('invalidHook', 'testGroup')).toThrow('Hook invalidHook does not exist');
            });
        });
        
        describe('callAll', () => {
            it('should call buildHook with correct parameters', () => {
                hooksHandler.callAll('validHook', 'testGroup', 'arg1');
                expect(mockConfig.HOOKS.buildHook).toHaveBeenCalledWith('validHook', 'testGroup');
            });
            
            it('should call globalHooks.callAll with correct parameters', () => {
                hooksHandler.callAll('validHook', 'testGroup', 'arg1', 'arg2');
                expect(mockGlobalHooks.callAll).toHaveBeenCalledWith('hook:valid', 'arg1', 'arg2');
            });
            
            it('should return the result from globalHooks.callAll', () => {
                const result = hooksHandler.callAll('validHook', 'testGroup');
                expect(result).toBe('callAllResult');
            });
            
            it('should throw an error for invalid hook', () => {
                expect(() => hooksHandler.callAll('invalidHook', 'testGroup')).toThrow('Hook invalidHook does not exist');
            });
        });
    });
});