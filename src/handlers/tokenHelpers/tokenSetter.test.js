import TokenSetter from './tokenSetter';
import MockConfig from '../../../tests/mocks/mockConfig';

describe('TokenSetter', () => {
    let tokenSetter;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockToken;

    beforeEach(() => {
        mockConfig = new MockConfig();
        mockContext = { canvas: {} };
        mockUtils = { logger: { log: jest.fn() } };
        mockToken = { id: 'token1', name: 'Test Token' };
        
        tokenSetter = new TokenSetter(mockConfig, mockContext, mockUtils);
        // Mock the parent class method
        tokenSetter.setCurrentPlaceable = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with null current token', () => {
            expect(tokenSetter.current).toBeNull();
        });

        it('should inherit from PlaceableHandler', () => {
            expect(tokenSetter.config).toBe(mockConfig);
            expect(tokenSetter.context).toBe(mockContext);
            expect(tokenSetter.utils).toBe(mockUtils);
        });
    });

    describe('setCurrentToken', () => {
        it('should call setCurrentPlaceable with the provided token', () => {
            tokenSetter.setCurrentToken(mockToken);
            expect(tokenSetter.setCurrentPlaceable).toHaveBeenCalledWith(mockToken);
        });

        it('should return the current token when returnValue is true', () => {
            // Setup current to be returned
            tokenSetter.current = mockToken;
            const result = tokenSetter.setCurrentToken(mockToken, true);
            expect(result).toBe(mockToken);
        });

        it('should return null when returnValue is false', () => {
            tokenSetter.current = mockToken;
            const result = tokenSetter.setCurrentToken(mockToken, false);
            expect(result).toBeNull();
        });

        it('should default returnValue to true when not provided', () => {
            tokenSetter.current = mockToken;
            const result = tokenSetter.setCurrentToken(mockToken);
            expect(result).toBe(mockToken);
        });
    });
});