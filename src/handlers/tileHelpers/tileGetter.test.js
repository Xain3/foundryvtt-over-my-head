import PlaceableHandler from '../placeableHandler.js';
import TileGetter from './tileGetter.js';
import Mocks from '@mocks/mocks.js';

// Mock the PlaceableHandler class
jest.mock('../placeableHandler.js');

describe('TileGetter', () => {
    let tileGetter, config, context, utils, constants;
    let mockTile1, mockTile2, mockTile3, mockTiles, mockSelectedTiles;
    
    beforeEach(() => {
        // Set up mocks
        config = Mocks.config;
        context = Mocks.context;
        utils = Mocks.utils;
        constants = Mocks.constants;
        
        // Create mock tiles
        mockTile1 = {
            document: {
                getFlag: jest.fn().mockReturnValue(true),
                isOwner: true
            },
            isSelected: true
        };
        
        mockTile2 = {
            document: {
                getFlag: jest.fn().mockReturnValue(false),
                isOwner: true
            },
            isSelected: false
        };
        
        mockTile3 = {
            document: {
                getFlag: jest.fn().mockReturnValue(null),
                isOwner: false
            },
            isSelected: false
        };

        // Create mock tiles array
        mockTiles = [mockTile1, mockTile2, mockTile3];
        mockSelectedTiles = [mockTile1];

        // Configure constants
        config.MODULE = { ID: 'test-module' };
        config.FLAGS = { ALSOFADE: 'also-fade-flag' };
        constants.PLACEABLE_TYPES = { TILE: 'Tile' };

        // Mock the necessary methods in PlaceableHandler
        PlaceableHandler.prototype.getPlaceables = jest.fn().mockReturnValue(mockTiles);
        PlaceableHandler.prototype.getSelectedPlaceables = jest.fn().mockReturnValue(mockSelectedTiles);
        PlaceableHandler.prototype.logger = {
            warn: jest.fn(),
            error: jest.fn()
        };
        PlaceableHandler.prototype.utils = utils;
        PlaceableHandler.prototype.config = config;
        PlaceableHandler.prototype.context = context;
        PlaceableHandler.prototype.const = constants;

        
        // Create the TileGetter instance
        tileGetter = new TileGetter(config, context, utils);
    });
    
    describe('getPlaceableType', () => {
        it('should return the correct placeable type for tiles', () => {
            expect(tileGetter.getPlaceableType()).toBe('Tile');
        });
        
        it('should use provided constants if provided', () => {
            const customConstants = { PLACEABLE_TYPES: { TILE: 'CustomTile' } };
            expect(tileGetter.getPlaceableType(customConstants)).toBe('CustomTile');
        });
    });
    
    describe('getTiles', () => {
        it('should get all tiles and update the property', () => {
            tileGetter.getPlaceables.mockReturnValue(mockTiles);
            
            const result = tileGetter.getTiles();
            
            expect(tileGetter.getPlaceables).toHaveBeenCalledWith('Tile', true, true);
            expect(result).toEqual(mockTiles);
            expect(tileGetter.all).toEqual(mockTiles);
        });
        
        it('should not update the property if updateProperty is false', () => {
            mockTiles = [mockTile1, mockTile2];
            tileGetter.getPlaceables.mockReturnValue(mockTiles);
            tileGetter.all = [mockTile3];
            
            const result = tileGetter.getTiles(false, true);
            
            expect(tileGetter.getPlaceables).toHaveBeenCalledWith('Tile', false, true);
            expect(result).toEqual(mockTiles);
            expect(tileGetter.all).toEqual([mockTile3]); // Should remain unchanged
        });
        
        it('should not return tiles if returnValue is false', () => {
            mockTiles = [mockTile1, mockTile2];
            tileGetter.getPlaceables.mockReturnValue(mockTiles);
            
            const result = tileGetter.getTiles(true, false);
            
            expect(tileGetter.getPlaceables).toHaveBeenCalledWith('Tile', true, false);
            expect(result).toEqual([]);
            expect(tileGetter.all).toEqual(mockTiles);
        });
        
        it('should handle errors gracefully', () => {
            tileGetter.getPlaceables.mockImplementation(() => {
                throw new Error('Test error');
            });
            
            const result = tileGetter.getTiles();
            
            expect(tileGetter.logger.warn).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
    
    describe('getSelectedTiles', () => {
        it('should get selected tiles and update the property', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const selectedTiles = [mockTile1];
            tileGetter.getSelectedPlaceables.mockReturnValue(selectedTiles);
            
            const result = tileGetter.getSelectedTiles(allTiles);
            
            expect(tileGetter.getSelectedPlaceables).toHaveBeenCalledWith(allTiles);
            expect(result).toEqual(selectedTiles);
            expect(tileGetter.selected).toEqual(selectedTiles);
        });
        
        it('should not update the property if updateProperty is false', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const selectedTiles = [mockTile1];
            tileGetter.getSelectedPlaceables.mockReturnValue(selectedTiles);
            tileGetter.selected = [mockTile2];
            
            const result = tileGetter.getSelectedTiles(allTiles, false, true);
            
            expect(result).toEqual(selectedTiles);
            expect(tileGetter.selected).toEqual([mockTile2]); // Should remain unchanged
        });
        
        it('should not return tiles if returnValue is false', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const selectedTiles = [mockTile1];
            tileGetter.getSelectedPlaceables.mockReturnValue(selectedTiles);
            
            const result = tileGetter.getSelectedTiles(allTiles, true, false);
            
            expect(result).toEqual([]);
            expect(tileGetter.selected).toEqual(selectedTiles);
        });
    });
    
    describe('getAlsoFadeFlag', () => {
        it('should get the alsoFade flag from the tile document', () => {
            const result = tileGetter.getAlsoFadeFlag(mockTile1);
            
            expect(mockTile1.document.getFlag).toHaveBeenCalledWith('test-module', 'also-fade-flag');
            expect(result).toBe(true);
        });
        
        it('should return false if the flag is not set', () => {
            const result = tileGetter.getAlsoFadeFlag(mockTile2);
            
            expect(mockTile2.document.getFlag).toHaveBeenCalledWith('test-module', 'also-fade-flag');
            expect(result).toBe(false);
        });
        
        it('should return null if the flag is null', () => {
            const result = tileGetter.getAlsoFadeFlag(mockTile3);
            
            expect(mockTile3.document.getFlag).toHaveBeenCalledWith('test-module', 'also-fade-flag');
            expect(result).toBe(null);
        });
    });
    
    describe('getAlsoFadeTiles', () => {
        it('should filter tiles with alsoFade flag and update the property', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const alsoFadeTiles = [mockTile1];
            
            jest.spyOn(tileGetter, 'getAlsoFadeFlag').mockImplementation((tile) => {
                return tile === mockTile1;
            });
            
            const result = tileGetter.getAlsoFadeTiles(allTiles);
            
            expect(tileGetter.getAlsoFadeFlag).toHaveBeenCalledTimes(3);
            expect(result).toEqual(alsoFadeTiles);
            expect(tileGetter.alsoFade).toEqual(alsoFadeTiles);
        });
        
        it('should get tiles first if none are provided', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const alsoFadeTiles = [mockTile1];
            
            jest.spyOn(tileGetter, 'getTiles').mockReturnValue(allTiles);
            jest.spyOn(tileGetter, 'getAlsoFadeFlag').mockImplementation((tile) => {
                return tile === mockTile1;
            });
            
            const result = tileGetter.getAlsoFadeTiles();
            
            expect(tileGetter.getTiles).toHaveBeenCalled();
            expect(tileGetter.getAlsoFadeFlag).toHaveBeenCalledTimes(3);
            expect(result).toEqual(alsoFadeTiles);
            expect(tileGetter.alsoFade).toEqual(alsoFadeTiles);
        });
        
        it('should not update the property if updateProperty is false', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const alsoFadeTiles = [mockTile1];
            tileGetter.alsoFade = [mockTile2];
            
            jest.spyOn(tileGetter, 'getAlsoFadeFlag').mockImplementation((tile) => {
                return tile === mockTile1;
            });
            
            const result = tileGetter.getAlsoFadeTiles(allTiles, false, true);
            
            expect(result).toEqual(alsoFadeTiles);
            expect(tileGetter.alsoFade).toEqual([mockTile2]); // Should remain unchanged
        });
        
        it('should not return tiles if returnValue is false', () => {
            const allTiles = [mockTile1, mockTile2, mockTile3];
            const alsoFadeTiles = [mockTile1];
            
            jest.spyOn(tileGetter, 'getAlsoFadeFlag').mockImplementation((tile) => {
                return tile === mockTile1;
            });
            
            const result = tileGetter.getAlsoFadeTiles(allTiles, true, false);
            
            expect(result).toEqual([]);
            expect(tileGetter.alsoFade).toEqual(alsoFadeTiles);
        });
        
        it('should handle errors gracefully', () => {
            jest.spyOn(tileGetter, 'getAlsoFadeFlag').mockImplementation(() => {
                throw new Error('Test error');
            });
            
            const result = tileGetter.getAlsoFadeTiles([mockTile1]);
            
            expect(tileGetter.logger.warn).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
});