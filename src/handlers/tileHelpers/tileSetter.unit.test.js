// ./src/handlers/tileHelpers/tileSetter.test.js

import TileSetter from './tileSetter.js';
import PlaceableHandler from '../placeableHandler.js';

// Mock dependencies
jest.mock('../placeableHandler.js');

describe('TileSetter', () => {
    let tileSetter;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockTile;

    beforeEach(() => {
        // Setup mocks
        mockConfig = {};
        mockContext = {};
        mockUtils = {};
        mockTile = { id: 'mock-tile-id' };

        // Reset PlaceableHandler mock
        PlaceableHandler.mockClear();

        // Create instance with mocks
        tileSetter = new TileSetter(mockConfig, mockContext, mockUtils);
        tileSetter.setCurrentPlaceable = jest.fn();
    });

    describe('setCurrentTile', () => {
        it('should set the current tile and return it when returnValue is true', () => {
            tileSetter.current = mockTile;
            const result = tileSetter.setCurrentTile(mockTile, true);
            
            expect(tileSetter.setCurrentPlaceable).toHaveBeenCalledWith(mockTile);
            expect(result).toBe(mockTile);
        });

        it('should set the current tile and return null when returnValue is false', () => {
            tileSetter.current = mockTile;
            const result = tileSetter.setCurrentTile(mockTile, false);
            
            expect(tileSetter.setCurrentPlaceable).toHaveBeenCalledWith(mockTile);
            expect(result).toBeNull();
        });

        it('should use default returnValue parameter if not provided', () => {
            tileSetter.current = mockTile;
            const result = tileSetter.setCurrentTile(mockTile);
            
            expect(tileSetter.setCurrentPlaceable).toHaveBeenCalledWith(mockTile);
            expect(result).toBe(mockTile);
        });
    });
});