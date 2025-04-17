import TokenListener from './tokenListener';
import Listener from '../baseClasses/managers/listener';
import Config from '../config/config';
import Context from '../contexts/context';
import Utilities from '../utils/utils';
import Handlers from '../handlers/handlers';

// Mock dependencies
jest.mock('../baseClasses/managers/listener');
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
    default: jest.fn().mockImplementation(() => ({
        token: {isControlledAndSelected: jest.fn(), setCurrentToken: jest.fn()},
        tile: {},
        occlusion: {
            updateOcclusionForTiles: jest.fn()
        }
    }))
}));

// Mock global Hooks object
global.Hooks = {
    on: jest.fn()
};

describe('TokenListener', () => {
    let tokenListener;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockHandlers;
    let mockTokenHandler;
    let mockTileHandler;
    let mockOcclusionHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTokenHandler = {
            isControlledAndSelected: jest.fn(),
            setCurrentToken: jest.fn()
        };
        
        mockTileHandler = {
            alsoFadeTiles: ['fadeTile1', 'fadeTile2']
        };

        mockOcclusionHandler = {
            updateOcclusionForTiles: jest.fn()
        };
        
        mockHandlers = {
            token: mockTokenHandler,
            tile: mockTileHandler,
            occlusion: mockOcclusionHandler
        };
        
        mockConfig = {};
        mockContext = {};
        mockUtils = {};
        
        // Make Handlers.default return our mock handlers
        Handlers.mockImplementation(() => mockHandlers);
        
        tokenListener = new TokenListener(mockConfig, mockContext, mockUtils, mockHandlers);
        tokenListener.handlers = {token: mockTokenHandler, tile: mockTileHandler, occlusion: mockOcclusionHandler};
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(tokenListener.handler).toBe(mockTokenHandler);
            expect(tokenListener.handlers.token).toBe(mockTokenHandler);
            expect(tokenListener.handlers.tile).toBe(mockTileHandler);
            expect(tokenListener.handlers.occlusion).toBe(mockOcclusionHandler);
        });

        it('should call parent constructor with correct arguments', () => {
            expect(Listener).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, mockHandlers);
        });
    });

    describe('startOcclusionUpdateOnTokenRefresh', () => {
        it('should register a hook for refreshToken event', () => {
            tokenListener.startOcclusionUpdateOnTokenRefresh();
            expect(Hooks.on).toHaveBeenCalledWith('refreshToken', expect.any(Function));
        });

        it('should update occlusion when token is controlled and selected', () => {
            // Setup
            tokenListener.startOcclusionUpdateOnTokenRefresh();
            
            // Get the callback function registered with Hooks.on
            const refreshTokenCallback = Hooks.on.mock.calls[0][1];
            
            // Mock controlled and selected token
            const mockToken = { id: 'someTokenId' };
            const mockCurrentToken = { id: 'someTokenId', isControlled: true };
            
            mockTokenHandler.isControlledAndSelected.mockReturnValue(true);
            mockTokenHandler.setCurrentToken.mockReturnValue(mockCurrentToken);
            
            // Simulate hook being triggered
            refreshTokenCallback(mockToken);
            
            // Assertions
            expect(mockTokenHandler.isControlledAndSelected).toHaveBeenCalledWith(mockToken);
            expect(mockTokenHandler.setCurrentToken).toHaveBeenCalledWith(mockToken);
            expect(mockOcclusionHandler.updateOcclusionForTiles).toHaveBeenCalledWith(
                mockTileHandler.alsoFadeTiles,
                mockCurrentToken
            );
        });

        it('should not update occlusion when token is not controlled or selected', () => {
            // Setup
            tokenListener.startOcclusionUpdateOnTokenRefresh();
            
            // Get the callback function registered with Hooks.on
            const refreshTokenCallback = Hooks.on.mock.calls[0][1];
            
            // Mock uncontrolled or unselected token
            const mockToken = { id: 'someTokenId' };
            
            mockTokenHandler.isControlledAndSelected.mockReturnValue(false);
            
            // Simulate hook being triggered
            refreshTokenCallback(mockToken);
            
            // Assertions
            expect(mockTokenHandler.isControlledAndSelected).toHaveBeenCalledWith(mockToken);
            expect(mockTokenHandler.setCurrentToken).not.toHaveBeenCalled();
            expect(mockOcclusionHandler.updateOcclusionForTiles).not.toHaveBeenCalled();
        });
    });

    describe('run', () => {
        it('should call startOcclusionUpdateOnTokenRefresh', () => {
            jest.spyOn(tokenListener, 'startOcclusionUpdateOnTokenRefresh');
            
            tokenListener.run();
            
            expect(tokenListener.startOcclusionUpdateOnTokenRefresh).toHaveBeenCalledTimes(1);
        });
    });
});