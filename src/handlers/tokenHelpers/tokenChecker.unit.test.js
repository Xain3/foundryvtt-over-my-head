import TokenChecker from './tokenChecker';
import MockConfig from "../../../tests/mocks/config";
import MockContext from "../../../tests/mocks/context";
import mockUtilities from '../../../tests/mocks/utils';

describe('TokenChecker', () => {
    let tokenChecker;
    let mockConfig;
    let mockContext;
    let mockUtils;

    beforeEach(() => {
        // Mock the parameters
        mockConfig = new MockConfig();
        mockContext = new MockContext();
        mockUtils = mockUtilities;
        tokenChecker = new TokenChecker(mockConfig, mockContext, mockUtils);
    });

    describe('isControlled', () => {
        it('should return true if token is owned by user', () => {
            const mockToken = {
                document: {
                    isOwner: true
                }
            };
            expect(tokenChecker.isControlled(mockToken)).toBe(true);
        });

        it('should return false if token is not owned by user', () => {
            const mockToken = {
                document: {
                    isOwner: false
                }
            };
            expect(tokenChecker.isControlled(mockToken)).toBe(false);
        });
    });

    describe('isSelected', () => {
        it('should return true if token is selected', () => {
            const mockToken = {
                isSelected: true
            };
            expect(tokenChecker.isSelected(mockToken)).toBe(true);
        });

        it('should return false if token is not selected', () => {
            const mockToken = {
                isSelected: false
            };
            expect(tokenChecker.isSelected(mockToken)).toBe(false);
        });
    });

    describe('isControlledAndSelected', () => {
        it('should return true if token is both controlled and selected', () => {
            const mockToken = {
                document: {
                    isOwner: true
                },
                isSelected: true
            };
            
            // Mock the individual check methods
            jest.spyOn(tokenChecker, 'isControlled').mockReturnValue(true);
            jest.spyOn(tokenChecker, 'isSelected').mockReturnValue(true);
            
            expect(tokenChecker.isControlledAndSelected(mockToken)).toBe(true);
            expect(tokenChecker.isControlled).toHaveBeenCalledWith(mockToken);
            expect(tokenChecker.isSelected).toHaveBeenCalledWith(mockToken);
        });

        it('should return false if token is controlled but not selected', () => {
            const mockToken = {};
            
            jest.spyOn(tokenChecker, 'isControlled').mockReturnValue(true);
            jest.spyOn(tokenChecker, 'isSelected').mockReturnValue(false);
            
            expect(tokenChecker.isControlledAndSelected(mockToken)).toBe(false);
        });

        it('should return false if token is selected but not controlled', () => {
            const mockToken = {};
            
            jest.spyOn(tokenChecker, 'isControlled').mockReturnValue(false);
            jest.spyOn(tokenChecker, 'isSelected').mockReturnValue(true);
            
            expect(tokenChecker.isControlledAndSelected(mockToken)).toBe(false);
        });
    });

    describe('isUnderReference', () => {
        it('should call isUnder with the correct parameters and return its result', () => {
            const mockToken = {};
            const mockReference = {};
            const mockReferenceManager = {};
            
            tokenChecker.isUnder = jest.fn().mockReturnValue(true);
            
            const result = tokenChecker.isUnderReference(
                mockToken, 
                mockReference, 
                mockReferenceManager, 
                'center', 
                'rectangle'
            );
            
            expect(tokenChecker.isUnder).toHaveBeenCalledWith(
                mockToken, 
                mockReference, 
                tokenChecker, 
                mockReferenceManager, 
                'center', 
                'rectangle'
            );
            expect(result).toBe(true);
        });

        it('should use default parameters when not provided', () => {
            const mockToken = {};
            const mockReference = {};
            const mockReferenceManager = {};
            
            tokenChecker.isUnder = jest.fn().mockReturnValue(false);
            
            const result = tokenChecker.isUnderReference(
                mockToken, 
                mockReference, 
                mockReferenceManager
            );
            
            expect(tokenChecker.isUnder).toHaveBeenCalledWith(
                mockToken, 
                mockReference, 
                tokenChecker, 
                mockReferenceManager, 
                'center', 
                'rectangle'
            );
            expect(result).toBe(false);
        });
    });

    describe('isUnderTile', () => {
        it('should call isUnder with the correct parameters and return its result', () => {
            const mockToken = {};
            const mockTile = {};
            const mockTileManager = {};
            
            tokenChecker.isUnder = jest.fn().mockReturnValue(true);
            
            const result = tokenChecker.isUnderTile(mockToken, mockTile, mockTileManager);
            
            expect(tokenChecker.isUnder).toHaveBeenCalledWith(
                mockToken, 
                mockTile, 
                tokenChecker, 
                mockTileManager
            );
            expect(result).toBe(true);
        });
    });
});