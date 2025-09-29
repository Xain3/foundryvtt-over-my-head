import TokenGetter from './tokenGetter.js';
import PlaceableHandler from '../placeableHandler.js';

// Mock the PlaceableHandler class
jest.mock('../placeableHandler.js');

describe('TokenGetter', () => {
    let tokenGetter;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockTokens;
    let mockSelectedTokens;
    
    beforeEach(() => {
        // Setup mock data
        mockTokens = [{ id: 'token1' }, { id: 'token2' }];
        mockSelectedTokens = [{ id: 'token1' }];
        
        mockConfig = {
            // Mock config properties
        };
        
        mockContext = {
            // Mock context properties
        };
        
        mockUtils = {
            // Mock utils properties
        };
        
        // Mock the necessary methods in PlaceableHandler
        PlaceableHandler.prototype.getPlaceables = jest.fn().mockReturnValue(mockTokens);
        PlaceableHandler.prototype.getSelectedPlaceables = jest.fn().mockReturnValue(mockSelectedTokens);
        
        // Setup a mock const property
        PlaceableHandler.prototype.const = {
            PLACEABLE_TYPES: { TOKEN: 'TOKEN' }
        };
        
        // Create the instance with mocked dependencies
        tokenGetter = new TokenGetter(mockConfig, mockContext, mockUtils);
    });

    describe('constructor', () => {
        it('should initialize properties correctly', () => {
            expect(tokenGetter.placeableType).toBe('TOKEN');
            expect(tokenGetter.all).toEqual(mockTokens);
            expect(tokenGetter.selected).toEqual(mockSelectedTokens);
        });
    });

    describe('getPlaceableType', () => {
        it('should return the correct placeable type from constants', () => {
            const result = tokenGetter.getPlaceableType();
            expect(result).toBe('TOKEN');
        });

        it('should use provided constants if given', () => {
            const customConstants = { PLACEABLE_TYPES: { TOKEN: 'CUSTOM_TOKEN' } };
            const result = tokenGetter.getPlaceableType(customConstants);
            expect(result).toBe('CUSTOM_TOKEN');
        });
    });

    describe('getTokens', () => {
        it('should call getPlaceables with correct parameters', () => {
            tokenGetter.getTokens();
            expect(PlaceableHandler.prototype.getPlaceables).toHaveBeenCalledWith('TOKEN', true, true);
        });

        it('should update the all property when updateProperty is true', () => {
            const newTokens = [{ id: 'newToken' }];
            PlaceableHandler.prototype.getPlaceables.mockReturnValueOnce(newTokens);
            tokenGetter.getTokens(true, true);
            expect(tokenGetter.all).toEqual(newTokens);
        });

        it('should not update the all property when updateProperty is false', () => {
            const originalTokens = [...tokenGetter.all];
            const newTokens = [{ id: 'newToken' }];
            PlaceableHandler.prototype.getPlaceables.mockReturnValueOnce(newTokens);
            tokenGetter.getTokens(false, true);
            expect(tokenGetter.all).toEqual(originalTokens);
        });

        it('should return tokens when returnValue is true', () => {
            const result = tokenGetter.getTokens(false, true);
            expect(result).toEqual(mockTokens);
        });

        it('should return empty array when returnValue is false', () => {
            const result = tokenGetter.getTokens(false, false);
            expect(result).toEqual([]);
        });
    });

    describe('getSelectedTokens', () => {
        it('should call getSelectedPlaceables with correct parameters', () => {
            tokenGetter.getSelectedTokens();
            expect(PlaceableHandler.prototype.getSelectedPlaceables).toHaveBeenCalledWith(mockTokens);
        });

        it('should update the selected property when updateProperty is true', () => {
            const newSelected = [{ id: 'newSelectedToken' }];
            PlaceableHandler.prototype.getSelectedPlaceables.mockReturnValueOnce(newSelected);
            tokenGetter.getSelectedTokens(undefined, true, true);
            expect(tokenGetter.selected).toEqual(newSelected);
        });

        it('should not update the selected property when updateProperty is false', () => {
            const originalSelected = [...tokenGetter.selected];
            const newSelected = [{ id: 'newSelectedToken' }];
            PlaceableHandler.prototype.getSelectedPlaceables.mockReturnValueOnce(newSelected);
            tokenGetter.getSelectedTokens(undefined, false, true);
            expect(tokenGetter.selected).toEqual(originalSelected);
        });

        it('should return selected tokens when returnValue is true', () => {
            const result = tokenGetter.getSelectedTokens(undefined, false, true);
            expect(result).toEqual(mockSelectedTokens);
        });

        it('should return empty array when returnValue is false', () => {
            const result = tokenGetter.getSelectedTokens(undefined, false, false);
            expect(result).toEqual([]);
        });

        it('should use provided tokens if given', () => {
            const customTokens = [{ id: 'customToken' }];
            tokenGetter.getSelectedTokens(customTokens);
            expect(PlaceableHandler.prototype.getSelectedPlaceables).toHaveBeenCalledWith(customTokens);
        });
    });
});