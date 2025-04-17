import TileChecker from './tileChecker.js';
import Mocks from '@mocks/mocks.js';

describe('TileChecker', () => {
    let tileChecker, config, context, utils;
    let mockTile, mockToken, mockTokenHandler, mockTileGetter;
    
    beforeEach(() => {
        // Set up the mock arguments
        config = Mocks.config;
        context = Mocks.context;
        utils = Mocks.utils;
        
        // Create the TileChecker instance
        tileChecker = new TileChecker(config, context, utils);
        
        // Mock handlers object needed by isTokenUnderTile
        tileChecker.handlers = {
            token: {}
        };
        
        // Create mock objects
        mockTile = {
            document: {
                isOwner: false
            },
            isSelected: false
        };
        
        mockToken = {};
        
        mockTokenHandler = {};
        
        mockTileGetter = {
            getAlsoFadeFlag: jest.fn().mockReturnValue(false)
        };
    });
    
    describe('isControlled', () => {
        it('should return true if tile document is owner', () => {
            mockTile.document.isOwner = true;
            expect(tileChecker.isControlled(mockTile)).toBe(true);
        });
        
        it('should return false if tile document is not owner', () => {
            mockTile.document.isOwner = false;
            expect(tileChecker.isControlled(mockTile)).toBe(false);
        });
    });
    
    describe('isSelected', () => {
        it('should return true if tile is selected', () => {
            mockTile.isSelected = true;
            expect(tileChecker.isSelected(mockTile)).toBe(true);
        });
        
        it('should return false if tile is not selected', () => {
            mockTile.isSelected = false;
            expect(tileChecker.isSelected(mockTile)).toBe(false);
        });
    });
    
    describe('isControlledAndSelected', () => {
        it('should return true if tile is both controlled and selected', () => {
            mockTile.document.isOwner = true;
            mockTile.isSelected = true;
            expect(tileChecker.isControlledAndSelected(mockTile)).toBe(true);
        });
        
        it('should return false if tile is controlled but not selected', () => {
            mockTile.document.isOwner = true;
            mockTile.isSelected = false;
            expect(tileChecker.isControlledAndSelected(mockTile)).toBe(false);
        });
        
        it('should return false if tile is selected but not controlled', () => {
            mockTile.document.isOwner = false;
            mockTile.isSelected = true;
            expect(tileChecker.isControlledAndSelected(mockTile)).toBe(false);
        });
    });
    
    describe('isTokenUnderTile', () => {
        it('should call isUnder with correct parameters', () => {
            // Mock the isUnder method
            tileChecker.isUnder = jest.fn().mockReturnValue(true);
            
            const result = tileChecker.isTokenUnderTile(mockTile, mockToken, mockTokenHandler);
            
            expect(tileChecker.isUnder).toHaveBeenCalledWith(
                mockToken,
                mockTile,
                mockTokenHandler,
                tileChecker,
                'center',
                'rectangle'
            );
            expect(result).toBe(true);
        });
        
        it('should use handlers.token if no tokenHandler is provided', () => {
            tileChecker.isUnder = jest.fn().mockReturnValue(false);
            
            const result = tileChecker.isTokenUnderTile(mockTile, mockToken);
            
            expect(tileChecker.isUnder).toHaveBeenCalledWith(
                mockToken,
                mockTile,
                tileChecker.handlers.token,
                tileChecker,
                'center',
                'rectangle'
            );
            expect(result).toBe(false);
        });
    });
    
    describe('hasAlsoFadeFlag', () => {
        it('should return true if the tile has the alsoFade flag', () => {
            mockTileGetter.getAlsoFadeFlag = jest.fn().mockReturnValue(true);
            expect(tileChecker.hasAlsoFadeFlag(mockTile, mockTileGetter)).toBe(true);
            expect(mockTileGetter.getAlsoFadeFlag).toHaveBeenCalledWith(mockTile);
        });
        
        it('should return false if the tile does not have the alsoFade flag', () => {
            mockTileGetter.getAlsoFadeFlag = jest.fn().mockReturnValue(false);
            expect(tileChecker.hasAlsoFadeFlag(mockTile, mockTileGetter)).toBe(false);
            expect(mockTileGetter.getAlsoFadeFlag).toHaveBeenCalledWith(mockTile);
        });
        
        it('should handle null or undefined values', () => {
            mockTileGetter.getAlsoFadeFlag = jest.fn().mockReturnValue(null);
            expect(tileChecker.hasAlsoFadeFlag(mockTile, mockTileGetter)).toBe(false);
            
            mockTileGetter.getAlsoFadeFlag = jest.fn().mockReturnValue(undefined);
            expect(tileChecker.hasAlsoFadeFlag(mockTile, mockTileGetter)).toBe(false);
        });
    });
});