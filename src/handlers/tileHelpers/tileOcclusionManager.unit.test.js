// ./src/handlers/tileHelpers/tileOcclusionManager.test.js

import TileOcclusionManager from './tileOcclusionManager.js';
import PlaceableHandler from '../placeableHandler.js';

// Mock dependencies
jest.mock('../placeableHandler.js');

describe('TileOcclusionManager', () => {
    let tileOcclusionManager;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockTile;
    let mockToken;
    let mockChecker;
    let mockGetter;

    beforeEach(() => {
        // Setup mocks
        mockConfig = {
            constants: {
                TILE_OCCLUSION_MODES: {
                    FADE: { mode: 1 },
                    VISION: { mode: 2 }
                }
            }
        };
        mockContext = {};
        mockUtils = {};
        mockTile = {
            document: {
                update: jest.fn()
            }
        };
        mockToken = {};
        mockChecker = {
            isTokenUnderTile: jest.fn()
        };
        mockGetter = {
            getAlsoFadeTiles: jest.fn(),
            getAlsoFadeFlag: jest.fn()
        };

        // Reset PlaceableHandler mock
        PlaceableHandler.mockClear();

        // Create instance with mocks
        tileOcclusionManager = new TileOcclusionManager(mockConfig, mockContext, mockUtils);
        tileOcclusionManager.const = mockConfig.constants;
    });

    describe('updateOcclusion', () => {
        it('should update the tile document with the provided occlusion mode', () => {
            const occlusionMode = { mode: 1 };
            tileOcclusionManager.updateOcclusion(mockTile, occlusionMode);
            expect(mockTile.document.update).toHaveBeenCalledWith({ occlusion: occlusionMode });
        });
    });

    describe('setAlsoFadeTileOcclusion', () => {
        it('should set fade occlusion mode when token is under tile', () => {
            mockChecker.isTokenUnderTile.mockReturnValue(true);
            tileOcclusionManager.updateOcclusion = jest.fn();

            tileOcclusionManager.setAlsoFadeTileOcclusion(mockTile, mockToken, mockChecker);
            
            expect(mockChecker.isTokenUnderTile).toHaveBeenCalledWith(mockTile, mockToken);
            expect(tileOcclusionManager.updateOcclusion).toHaveBeenCalledWith(
                mockTile, 
                { mode: mockConfig.constants.TILE_OCCLUSION_MODES.FADE }
            );
        });

        it('should set vision occlusion mode when token is not under tile', () => {
            mockChecker.isTokenUnderTile.mockReturnValue(false);
            tileOcclusionManager.updateOcclusion = jest.fn();

            tileOcclusionManager.setAlsoFadeTileOcclusion(mockTile, mockToken, mockChecker);
            
            expect(mockChecker.isTokenUnderTile).toHaveBeenCalledWith(mockTile, mockToken);
            expect(tileOcclusionManager.updateOcclusion).toHaveBeenCalledWith(
                mockTile, 
                { mode: mockConfig.constants.TILE_OCCLUSION_MODES.VISION }
            );
        });
    });

    describe('updateOcclusionForTiles', () => {
        it('should update occlusion only for tiles with alsoFade flag', () => {
            const mockTiles = [mockTile, { ...mockTile }];
            mockGetter.getAlsoFadeFlag.mockReturnValueOnce(true).mockReturnValueOnce(false);
            tileOcclusionManager.setAlsoFadeTileOcclusion = jest.fn();

            tileOcclusionManager.updateOcclusionForTiles(mockTiles, mockToken, mockGetter, mockChecker);
            
            expect(mockGetter.getAlsoFadeFlag).toHaveBeenCalledTimes(2);
            expect(tileOcclusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledTimes(1);
            expect(tileOcclusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledWith(
                mockTiles[0], mockToken, mockChecker
            );
        });
    });

    describe('updateAlsoFadeTilesOcclusion', () => {
        it('should update occlusion for all alsoFade tiles', () => {
            const mockAlsoFadeTiles = [mockTile, { ...mockTile }];
            mockGetter.getAlsoFadeTiles.mockReturnValue(mockAlsoFadeTiles);
            tileOcclusionManager.setAlsoFadeTileOcclusion = jest.fn();

            tileOcclusionManager.updateAlsoFadeTilesOcclusion(mockToken, mockGetter, mockChecker);
            
            expect(mockGetter.getAlsoFadeTiles).toHaveBeenCalled();
            expect(tileOcclusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledTimes(2);
            expect(tileOcclusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledWith(
                mockAlsoFadeTiles[0], mockToken, mockChecker
            );
            expect(tileOcclusionManager.setAlsoFadeTileOcclusion).toHaveBeenCalledWith(
                mockAlsoFadeTiles[1], mockToken, mockChecker
            );
        });
    });
});