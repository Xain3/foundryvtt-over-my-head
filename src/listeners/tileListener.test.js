import TileListener from './tileListener';
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
    default: jest.fn()
}));

// Mock global Hooks object
global.Hooks = {
    on: jest.fn()
};

describe('TileListener', () => {
    let tileListener;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockHandlers;
    let mockTileHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTileHandler = {
            getTiles: jest.fn().mockReturnValue(['tile1', 'tile2']),
            getAlsoFadeTiles: jest.fn().mockReturnValue(['fadeTile1'])
        };
        
        mockHandlers = {
            tile: mockTileHandler
        };
        
        mockConfig = {};
        mockContext = {};
        mockUtils = {};
        
        tileListener = new TileListener(mockConfig, mockContext, mockUtils, mockHandlers);
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(tileListener.handler).toBe(mockTileHandler);
        });

        it('should call parent constructor with correct arguments', () => {
            expect(Listener).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, mockHandlers);
        });
    });

    describe('getTilesOnRefreshTile', () => {
        it('should register a hook for refreshTile event', () => {
            tileListener.getTilesOnRefreshTile();
            expect(Hooks.on).toHaveBeenCalledWith('refreshTile', expect.any(Function));
        });

        it('should update handler properties when refreshTile hook is triggered', () => {
            tileListener.getTilesOnRefreshTile();
            
            // Get the callback function registered with Hooks.on
            const refreshTileCallback = Hooks.on.mock.calls[0][1];
            
            // Simulate hook being triggered
            const mockTile = { id: 'someTileId' };
            refreshTileCallback(mockTile);
            
            expect(mockTileHandler.getTiles).toHaveBeenCalled();
            expect(mockTileHandler.getAlsoFadeTiles).toHaveBeenCalled();
            expect(mockTileHandler.tiles).toEqual(['tile1', 'tile2']);
            expect(mockTileHandler.alsoFadeTiles).toEqual(['fadeTile1']);
        });
    });

    describe('run', () => {
        it('should call getTilesOnRefreshTile', () => {
            jest.spyOn(tileListener, 'getTilesOnRefreshTile');
            
            tileListener.run();
            
            expect(tileListener.getTilesOnRefreshTile).toHaveBeenCalledTimes(1);
        });
    });
});