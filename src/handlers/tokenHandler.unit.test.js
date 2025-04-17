import TokenHandler from './tokenHandler.js';
import TokenGetter from './tokenHelpers/tokenGetter.js';
import TokenSetter from './tokenHelpers/tokenSetter.js';
import TokenChecker from './tokenHelpers/tokenChecker.js';

// Mock the dependencies
jest.mock('./tokenHelpers/tokenGetter.js');
jest.mock('./tokenHelpers/tokenSetter.js');
jest.mock('./tokenHelpers/tokenChecker.js');

describe('TokenHandler', () => {
    let handler, config, context, utils;
    let mockGetter, mockSetter, mockChecker;

    beforeEach(() => {
        // Create mocks for the dependencies
        config = { /* mock config */ };
        context = { /* mock context */ };
        utils = { /* mock utils */ };

        // Setup mock implementations
        mockGetter = {
            all: ['token1'],
            selected: ['token2'],
            getTokens: jest.fn(),
            getSelectedTokens: jest.fn()
        };

        mockSetter = {
            current: { id: 'currentToken' },
            setCurrentToken: jest.fn()
        };

        mockChecker = {
            isControlled: jest.fn(),
            isSelected: jest.fn(),
            isControlledAndSelected: jest.fn(),
            isUnderReference: jest.fn(),
            isUnderTile: jest.fn()
        };

        // Set up mock constructors
        TokenGetter.mockImplementation(() => mockGetter);
        TokenSetter.mockImplementation(() => mockSetter);
        TokenChecker.mockImplementation(() => mockChecker);

        // Create instance of TokenHandler
        handler = new TokenHandler(config, context, utils);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the correct dependencies', () => {
            expect(TokenGetter).toHaveBeenCalledWith(config, context, utils);
            expect(TokenSetter).toHaveBeenCalledWith(config, context, utils);
            expect(TokenChecker).toHaveBeenCalledWith(config, context, utils);
            expect(handler.getter).toBe(mockGetter);
            expect(handler.setter).toBe(mockSetter);
            expect(handler.checker).toBe(mockChecker);
        });

        it('should copy properties from dependencies', () => {
            expect(handler.all).toBe(mockGetter.all);
            expect(handler.selected).toBe(mockGetter.selected);
            expect(handler.current).toBe(mockSetter.current);
        });
    });

    describe('getTokens', () => {
        it('should call getter.getTokens with the correct parameters', () => {
            const mockTokens = ['token1', 'token2'];
            mockGetter.getTokens.mockReturnValue(mockTokens);
            
            const result = handler.getTokens(true, true);
            
            expect(mockGetter.getTokens).toHaveBeenCalledWith(true, true);
            expect(result).toBe(mockTokens);
            expect(handler.all).toBe(mockTokens);
        });

        it('should not update all property when updateProperty is false', () => {
            const originalAll = handler.all;
            mockGetter.getTokens.mockReturnValue(['token1', 'token2']);
            
            handler.getTokens(false, true);
            
            expect(handler.all).toBe(originalAll);
        });

        it('should return empty array when returnValue is false', () => {
            mockGetter.getTokens.mockReturnValue(['token1', 'token2']);
            
            const result = handler.getTokens(true, false);
            
            expect(result).toEqual([]);
        });
    });

    describe('getSelectedTokens', () => {
        // Note: There's a bug in the original code that would cause infinite recursion
        // This test assumes the method should call this.getter.getSelectedTokens
        it('should call getter.getSelectedTokens with the correct parameters', () => {
            const mockTokens = ['token3', 'token4'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            const result = handler.getSelectedTokens(['token1'], true, true);
            
            expect(mockGetter.getSelectedTokens).toHaveBeenCalledWith(['token1'], true, true);
            expect(result).toBe(mockTokens);
        });

        it('should call getter.getSelectedTokens with the correct parameters', () => {
            const mockTokens = ['token3', 'token4'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            const result = handler.getSelectedTokens(['token1'], true, true);
            
            expect(mockGetter.getSelectedTokens).toHaveBeenCalledWith(['token1'], true, true);
            expect(result).toBe(mockTokens);
            expect(handler.selected).toBe(mockTokens);
        });
    
        it('should not update selected property when updateProperty is false', () => {
            const originalSelected = handler.selected;
            const mockTokens = ['newToken1', 'newToken2'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            handler.getSelectedTokens(null, false, true);
            
            expect(handler.selected).toBe(originalSelected);
            expect(handler.selected).not.toBe(mockTokens);
        });
    
        it('should return selected tokens when returnValue is true', () => {
            const mockTokens = ['token5', 'token6'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            const result = handler.getSelectedTokens(null, true, true);
            
            expect(result).toBe(mockTokens);
            expect(handler.selected).toBe(mockTokens);
        });
    
        it('should return empty array when returnValue is false', () => {
            const mockTokens = ['token7', 'token8'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            const result = handler.getSelectedTokens(null, true, false);
            
            expect(result).toEqual([]);
            expect(handler.selected).toBe(mockTokens);
        });
    
        it('should use null as default tokens parameter', () => {
            const mockTokens = ['defaultTokens'];
            mockGetter.getSelectedTokens.mockReturnValue(mockTokens);
            
            handler.getSelectedTokens();
            
            expect(mockGetter.getSelectedTokens).toHaveBeenCalledWith(null, true, true);
        });
    });

    describe('setCurrentToken', () => {
        it('should call setter.setCurrentToken and update current property', () => {
            const mockToken = { id: 'token5' };
            mockSetter.setCurrentToken.mockReturnValue(mockToken);
            
            const result = handler.setCurrentToken(mockToken, true);
            
            expect(mockSetter.setCurrentToken).toHaveBeenCalledWith(mockToken, true);
            expect(result).toBe(mockToken);
            expect(handler.current).toBe(mockToken);
        });
    });

    describe('checker methods', () => {
        it('should delegate isControlled to checker.isControlled', () => {
            const mockToken = { id: 'token6' };
            mockChecker.isControlled.mockReturnValue(true);
            
            const result = handler.isControlled(mockToken);
            
            expect(mockChecker.isControlled).toHaveBeenCalledWith(mockToken);
            expect(result).toBe(true);
        });

        it('should delegate isSelected to checker.isSelected', () => {
            const mockToken = { id: 'token7' };
            mockChecker.isSelected.mockReturnValue(false);
            
            const result = handler.isSelected(mockToken);
            
            expect(mockChecker.isSelected).toHaveBeenCalledWith(mockToken);
            expect(result).toBe(false);
        });

        it('should delegate isControlledAndSelected to checker.isControlledAndSelected', () => {
            const mockToken = { id: 'token8' };
            mockChecker.isControlledAndSelected.mockReturnValue(true);
            
            const result = handler.isControlledAndSelected(mockToken);
            
            expect(mockChecker.isControlledAndSelected).toHaveBeenCalledWith(mockToken);
            expect(result).toBe(true);
        });

        it('should delegate isUnderReference to checker.isUnderReference', () => {
            const mockToken = { id: 'token9' };
            const mockReference = { id: 'ref1' };
            const mockRefManager = {};
            
            mockChecker.isUnderReference.mockReturnValue(true);
            
            const result = handler.isUnderReference(
                mockToken, mockReference, mockRefManager, 'target', 'reference'
            );
            
            expect(mockChecker.isUnderReference).toHaveBeenCalledWith(
                mockToken, mockReference, mockRefManager, 'target', 'reference'
            );
            expect(result).toBe(true);
        });

        it('should delegate isUnderTile to checker.isUnderTile', () => {
            const mockToken = { id: 'token10' };
            const mockTile = { id: 'tile1' };
            const mockTileManager = {};
            
            mockChecker.isUnderTile.mockReturnValue(false);
            
            const result = handler.isUnderTile(mockToken, mockTile, mockTileManager);
            
            expect(mockChecker.isUnderTile).toHaveBeenCalledWith(mockToken, mockTile, mockTileManager);
            expect(result).toBe(false);
        });
    });
});