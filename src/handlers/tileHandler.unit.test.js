import TileHandler from './tileHandler.js';
import TileGetter from './tileHelpers/tileGetter.js';
import TileSetter from './tileHelpers/tileSetter.js';
import TileChecker from './tileHelpers/tileChecker.js';
import TileOcclusionManager from './tileHelpers/tileOcclusionManager.js';
import Mocks from '@mocks/mocks.js';
import PlaceableHandler from './placeableHandler.js';

// Mock dependencies
jest.mock('./placeableHandler.js');
jest.mock('./tileHelpers/tileGetter.js');
jest.mock('./tileHelpers/tileSetter.js');
jest.mock('./tileHelpers/tileChecker.js');
jest.mock('./tileHelpers/tileOcclusionManager.js');


describe('TileHandler', () => {
    let tileHandler;
    let mockConfig, mockContext, mockUtils, mockConstants;
    let mockTiles, mockToken;
    
    beforeEach(() => {
        // Mock constants
        global.CONSTANTS = {
            TILE_OCCLUSION_MODES: {
                FADE: 'fade',
                VISION: 'vision'
            }
        };
        
        // Create mock tile objects
        mockTiles = [
            {
                document: {
                    getFlag: jest.fn(),
                    update: jest.fn()
                }
            },
            {
                document: {
                    getFlag: jest.fn(),
                    update: jest.fn()
                }
            }
        ];
        
        mockToken = { id: 'token1' };
        
        mockConfig = Mocks.getMockConfig();
        mockContext = Mocks.getMockContext();
        mockUtils = Mocks.getMockUtils();
        mockConstants = Mocks.getMockConstants();
        
        // Setup PlaceableHandler
        PlaceableHandler.prototype.getPlaceables = jest.fn().mockReturnValue(mockTiles);  
        PlaceableHandler.prototype.logger = mockUtils.logger;
        PlaceableHandler.prototype.utils = mockUtils;
        PlaceableHandler.prototype.config = mockConfig;
        PlaceableHandler.prototype.context = mockContext;
        PlaceableHandler.prototype.const = mockConstants;
        PlaceableHandler.prototype.game = {
            canvas: {
                tokens: {
                    controlled: [mockToken]
                },
            },
            i18n: jest.fn(),
            modules: {
                get: jest.fn(),

                someModule: {
                    someMethod: jest.fn()
                }
            }
        };

    
        // Initialize TileHandler
        tileHandler = new TileHandler(mockConfig, mockContext, mockUtils);
        
        // Add necessary properties for testing
        tileHandler.handlers = { token: {} };
        tileHandler.isUnder = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTiles', () => {
        it('should get tiles and update property when updateProperty is true', () => {
            const mockReturnTiles = ['tile1', 'tile2'];
            tileHandler.getter.getTiles = jest.fn().mockReturnValue(mockReturnTiles);
            
            const result = tileHandler.getTiles(true, true);
            
            expect(tileHandler.getter.getTiles).toHaveBeenCalledWith(true, true);
            expect(tileHandler.tiles).toBe(mockReturnTiles);
            expect(result).toBe(mockReturnTiles);
        });
        
        it('should get tiles without updating property when updateProperty is false', () => {
            const originalTiles = tileHandler.tiles;
            const mockReturnTiles = ['tile1', 'tile2'];
            tileHandler.getter.getTiles = jest.fn().mockReturnValue(mockReturnTiles);
            
            const result = tileHandler.getTiles(false, true);
            
            expect(tileHandler.getter.getTiles).toHaveBeenCalledWith(false, true);
            expect(tileHandler.tiles).toBe(originalTiles);
            expect(result).toBe(mockReturnTiles);
        });
        
        it('should return empty array when returnValue is false', () => {
            tileHandler.getter.getTiles = jest.fn().mockReturnValue(['tile1', 'tile2']);
            
            const result = tileHandler.getTiles(true, false);
            
            expect(tileHandler.getter.getTiles).toHaveBeenCalledWith(true, false);
            expect(result).toEqual([]);
        });
    });

    describe('getAlsoFadeFlag', () => {
        it('should call getter.getAlsoFadeFlag with the provided tile', () => {
            const mockTile = { id: 'tile1' };
            tileHandler.getter.getAlsoFadeFlag = jest.fn().mockReturnValue(true);
            
            const result = tileHandler.getAlsoFadeFlag(mockTile);
            
            expect(tileHandler.getter.getAlsoFadeFlag).toHaveBeenCalledWith(mockTile);
            expect(result).toBe(true);
        });
    });

    describe('filterAlsoFadeTiles', () => {
        it('should filter tiles and update property when updateProperty is true', () => {
            const mockTiles = ['tile1', 'tile2'];
            const mockAlsoFadeTiles = ['tile1'];
            tileHandler.getter.getAlsoFadeTiles = jest.fn().mockReturnValue(mockAlsoFadeTiles);
            
            const result = tileHandler.filterAlsoFadeTiles(mockTiles, true, true);
            
            expect(tileHandler.getter.getAlsoFadeTiles).toHaveBeenCalledWith(mockTiles, true, true);
            expect(tileHandler.alsoFadeTiles).toBe(mockAlsoFadeTiles);
            expect(result).toBe(mockAlsoFadeTiles);
        });
        
        it('should filter tiles without updating property when updateProperty is false', () => {
            const originalAlsoFadeTiles = tileHandler.alsoFadeTiles;
            const mockTiles = ['tile1', 'tile2'];
            const mockAlsoFadeTiles = ['tile1'];
            tileHandler.getter.getAlsoFadeTiles = jest.fn().mockReturnValue(mockAlsoFadeTiles);
            
            const result = tileHandler.filterAlsoFadeTiles(mockTiles, false, true);
            
            expect(tileHandler.getter.getAlsoFadeTiles).toHaveBeenCalledWith(mockTiles, false, true);
            expect(tileHandler.alsoFadeTiles).toBe(originalAlsoFadeTiles);
            expect(result).toBe(mockAlsoFadeTiles);
        });
        
        it('should return empty array when returnValue is false', () => {
            const mockTiles = ['tile1', 'tile2'];
            tileHandler.getter.getAlsoFadeTiles = jest.fn().mockReturnValue(['tile1']);
            
            const result = tileHandler.filterAlsoFadeTiles(mockTiles, true, false);
            
            expect(tileHandler.getter.getAlsoFadeTiles).toHaveBeenCalledWith(mockTiles, true, false);
            expect(result).toEqual([]);
        });
    });

    describe('updateOcclusion', () => {
        it('should call occlusionManager.updateOcclusion with the provided parameters', () => {
            const mockTile = { id: 'tile1' };
            const mockOcclusionMode = 'fade';
            tileHandler.occlusionManager.updateOcclusion = jest.fn();
            
            tileHandler.updateOcclusion(mockTile, mockOcclusionMode);
            
            expect(tileHandler.occlusionManager.updateOcclusion).toHaveBeenCalledWith(mockTile, mockOcclusionMode);
        });
    });

    describe('setAlsoFadeTileOcclusion', () => {
        it('should call occlusionManager.setAlsoFadeTileOcclusion with the provided parameters', () => {
            const mockTile = { id: 'tile1' };
            tileHandler.occlusionManager.setAlsoFadeTileOcclusion = jest.fn();
            
            tileHandler.setAlsoFadeTileOcclusion(mockTile, mockToken);
            
            expect(tileHandler.occlusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledWith(
                mockTile, mockToken, tileHandler.checker
            );
        });
    });

    describe('updateOcclusionForTiles', () => {
        it('should call occlusionManager.updateOcclusionForTiles with the provided parameters', () => {
            const mockTiles = ['tile1', 'tile2'];
            tileHandler.occlusionManager.updateOcclusionForTiles = jest.fn();
            
            tileHandler.updateOcclusionForTiles(mockTiles, mockToken);
            
            expect(tileHandler.occlusionManager.updateOcclusionForTiles).toHaveBeenCalledWith(
                mockTiles, mockToken, tileHandler.getter, tileHandler.checker
            );
        });
    });

    describe('updateAlsoFadeTilesOcclusion', () => {
        it('should call occlusionManager.updateAlsoFadeTilesOcclusion with the provided parameters', () => {
            tileHandler.occlusionManager.updateAlsoFadeTilesOcclusion = jest.fn();
            
            tileHandler.updateAlsoFadeTilesOcclusion(mockToken);
            
            expect(tileHandler.occlusionManager.updateAlsoFadeTilesOcclusion).toHaveBeenCalledWith(
                mockToken, tileHandler.getter, tileHandler.checker
            );
        });
    });

    describe('isTokenUnderTile', () => {
        it('should call checker.isTokenUnderTile with the provided parameters', () => {
            const mockTile = { id: 'tile1' };
            tileHandler.checker.isTokenUnderTile = jest.fn().mockReturnValue(true);
            
            const result = tileHandler.isTokenUnderTile(mockTile, mockToken);
            
            expect(tileHandler.checker.isTokenUnderTile).toHaveBeenCalledWith(mockTile, mockToken);
            expect(result).toBe(true);
        });
    });
});