import OcclusionHandler from './occlusionHandler';

// Mock dependencies
jest.mock('../baseClasses/managers/handler', () => {
    return class Handler {
        constructor() {}
    };
});
jest.mock('../config/config');
jest.mock('../contexts/context');
jest.mock('../utils/utils');
jest.mock('./tokenHandler');
jest.mock('./tileHandler');

describe('OcclusionHandler', () => {
    let occlusionHandler;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockTokenHandler;
    let mockTileHandler;

    beforeEach(() => {
        mockConfig = {};
        mockContext = {};
        mockUtils = {};
        mockTokenHandler = {
            updateOcclusionForTokens: jest.fn()
        };
        mockTileHandler = {
            updateOcclusionForTiles: jest.fn(),
            updateAlsoFadeTilesOcclusion: jest.fn()
        };

        occlusionHandler = new OcclusionHandler(
            mockConfig, 
            mockContext, 
            mockUtils, 
            mockTokenHandler, 
            mockTileHandler
        );
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(occlusionHandler.currentOcclusion).toBeNull();
            expect(occlusionHandler.tokenHandler).toBe(mockTokenHandler);
            expect(occlusionHandler.tileHandler).toBe(mockTileHandler);
        });
    });

    describe('updateOcclusionForTiles', () => {
        it('should call tileHandler.updateOcclusionForTiles with correct parameters', () => {
            // Arrange
            const mockTiles = [{ id: 'tile1' }, { id: 'tile2' }];
            const mockToken = { id: 'token1' };

            // Act
            occlusionHandler.updateOcclusionForTiles(mockTiles, mockToken);

            // Assert
            expect(mockTileHandler.updateOcclusionForTiles).toHaveBeenCalledWith(mockTiles, mockToken);
            expect(mockTileHandler.updateOcclusionForTiles).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateAlsoFadeTilesOcclusion', () => {
        it('should call tileHandler.updateAlsoFadeTilesOcclusion with correct parameter', () => {
            // Arrange
            const mockToken = { id: 'token1' };

            // Act
            occlusionHandler.updateAlsoFadeTilesOcclusion(mockToken);

            // Assert
            expect(mockTileHandler.updateAlsoFadeTilesOcclusion).toHaveBeenCalledWith(mockToken);
            expect(mockTileHandler.updateAlsoFadeTilesOcclusion).toHaveBeenCalledTimes(1);
        });
    });
});