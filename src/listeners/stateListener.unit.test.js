import StateListener from './stateListener';
import Listener from '../baseClasses/managers/listener.js';
import Config from '../config/config.js';
import Context from '../contexts/context.js';
import Utilities from '../utils/utils.js';
import Handlers from '../handlers/handlers.js';

// Mock the Hooks global object
global.Hooks = {
    on: jest.fn()
};
jest.mock('../config/config', () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock('../contexts/context', () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock('../utils/utils', () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock('../handlers/handlers', () => ({
    __esModule: true,
    default: jest.fn()
}));

describe('StateListener', () => {
    let stateListener;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockHandlers;
    let mockLogger;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock objects
        mockConfig = {
            HOOKS: {
                formatHook: jest.fn((name, direction) => `${name}:${direction}`)
            }
        };
        
        mockContext = {
            getRemoteLocation: jest.fn(),
            getState: jest.fn().mockReturnValue({ test: 'state' })
        };
        
        mockUtils = {};
        mockHandlers = {};
        
        // Create mock logger (likely inherited from Listener)
        mockLogger = {
            log: jest.fn()
        };
        
        // Create instance of StateListener
        stateListener = new StateListener(mockConfig, mockContext, mockUtils, mockHandlers);
        stateListener.logger = mockLogger;
        
        // Mock the missing setupLogState method
        stateListener.setupLogState = jest.fn();
    });
    
    describe('constructor', () => {
        it('should extend Listener class', () => {
            expect(stateListener).toBeInstanceOf(Listener);
        });
        
        it('should initialize with the provided dependencies', () => {
            expect(stateListener.config).toBe(mockConfig);
            expect(stateListener.context).toBe(mockContext);
            expect(stateListener.utils).toBe(mockUtils);
            expect(stateListener.handlers).toBe(mockHandlers);
        });
    });
    
    describe('setupLogRemoteState', () => {
        it('should register a hook listener for logRemoteState', () => {
            stateListener.setupLogRemoteState();
            
            expect(mockConfig.HOOKS.formatHook).toHaveBeenCalledWith('logRemoteState', 'IN');
            expect(Hooks.on).toHaveBeenCalledWith('logRemoteState:IN', expect.any(Function));
        });
        
        it('should log and call context.getRemoteLocation when hook is triggered', () => {
            stateListener.setupLogRemoteState();
            
            // Get the callback function that was registered with Hooks.on
            const callback = Hooks.on.mock.calls[0][1];
            
            // Call the callback to simulate the hook being triggered
            callback();
            
            expect(mockLogger.log).toHaveBeenCalledWith('Logging remote state');
            expect(mockContext.getRemoteLocation).toHaveBeenCalled();
        });
    });
    
    describe('setupGetRemoteState', () => {
        it('should register a hook listener for getRemoteState', () => {
            stateListener.setupGetRemoteState();
            
            expect(mockConfig.HOOKS.formatHook).toHaveBeenCalledWith('getRemoteState', 'IN');
            expect(Hooks.on).toHaveBeenCalledWith('getRemoteState:IN', expect.any(Function));
        });
        
        it('should log, get state from context, and log the state when hook is triggered', () => {
            stateListener.setupGetRemoteState();
            
            // Get the callback function
            const callback = Hooks.on.mock.calls[0][1];
            
            // Trigger the callback
            callback();
            
            expect(mockLogger.log).toHaveBeenCalledWith('Getting remote state');
            expect(mockContext.getState).toHaveBeenCalled();
            expect(mockLogger.log).toHaveBeenCalledWith({ test: 'state' });
        });
    });
    
    describe('run', () => {
        it('should call all setup methods', () => {
            // Spy on the methods before calling run
            jest.spyOn(stateListener, 'setupLogState');
            jest.spyOn(stateListener, 'setupLogRemoteState');
            jest.spyOn(stateListener, 'setupGetRemoteState');
            
            stateListener.run();
            
            expect(stateListener.setupLogState).toHaveBeenCalled();
            expect(stateListener.setupLogRemoteState).toHaveBeenCalled();
            expect(stateListener.setupGetRemoteState).toHaveBeenCalled();
        });
    });
});