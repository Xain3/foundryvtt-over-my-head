import Listeners from './listeners';
import StateListener from './stateListener';
import TokenListener from './tokenListener';
import TileListener from './tileListener';
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Utilities from "../utils/utils.js";
import Handlers from "../handlers/handlers.js";

// Mock the dependencies
jest.mock('./stateListener');
jest.mock('./tokenListener');
jest.mock('./tileListener');
jest.mock('../baseClasses/managers/listener', () => {
    return jest.fn().mockImplementation(function() {
        this.config = arguments[0];
        this.context = arguments[1];
        this.utils = arguments[2];
        this.handlers = arguments[3];
    });
});
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

describe('Listeners', () => {
    let mockConfig, mockContext, mockUtils, mockHandlers;
    let stateRunMock, tokenRunMock, tileRunMock;
    let listeners;
    
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Create separate run mocks for each listener
        stateRunMock = jest.fn();
        tokenRunMock = jest.fn();
        tileRunMock = jest.fn();
        
        // Setup mock implementations
        StateListener.mockImplementation(() => ({
            run: stateRunMock
        }));
        
        TokenListener.mockImplementation(() => ({
            run: tokenRunMock
        }));
        
        TileListener.mockImplementation(() => ({
            run: tileRunMock
        }));

        
        // Initialize mock dependencies
        mockConfig = { test: 'config' };
        mockContext = { test: 'context' };
        mockUtils = { test: 'utils' };
        mockHandlers = { test: 'handlers' };
        
        // Create instance for testing
        listeners = new Listeners(mockConfig, mockContext, mockUtils, mockHandlers);
    });
    
    it('should initialize state, token, and tile listeners in constructor', () => {
        expect(StateListener).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, mockHandlers);
        expect(TokenListener).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, mockHandlers);
        expect(TileListener).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, mockHandlers);
        
        expect(listeners.state).toBeDefined();
        expect(listeners.token).toBeDefined();
        expect(listeners.tile).toBeDefined();
    });
    
    it('should call run method on all listeners when run is called', () => {
        listeners.run();
        
        expect(stateRunMock).toHaveBeenCalled();
        expect(tileRunMock).toHaveBeenCalled();
        expect(tokenRunMock).toHaveBeenCalled();
    });
});