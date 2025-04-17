import Handlers from './handlers';
import HooksHandler from './hooksHandler';
import OcclusionHandler from './occlusionHandler';
import PlaceableHandler from './placeableHandler';
import SettingsHandler from './settingsHandler';
import TileHandler from './tileHandler';
import TokenHandler from './tokenHandler';
import UserInterfaceHandler from './userInterfaceHandler';
import MockConfig from '../../tests/mocks/config';

jest.mock('./hooksHandler');
jest.mock('./occlusionHandler');
jest.mock('./placeableHandler');
jest.mock('./settingsHandler');
jest.mock('./tileHandler');
jest.mock('./tokenHandler');
jest.mock('./userInterfaceHandler');

describe('Handlers', () => {
    let handlers;
    let mockConfig;
    let mockContext;
    let mockUtils;

    beforeEach(() => {
        mockConfig = new MockConfig();
        mockContext = { canvas: {} };
        mockUtils = { logger: { log: jest.fn() } };

        // Clear all mocks before each test
        jest.clearAllMocks();
        
        handlers = new Handlers(mockConfig, mockContext, mockUtils);
    });

    describe('constructor', () => {
        it('should initialize with the provided config, context, and utils', () => {
            expect(handlers.config).toBe(mockConfig);
            expect(handlers.context).toBe(mockContext);
            expect(handlers.utils).toBe(mockUtils);
        });

        it('should create instances of all handler classes', () => {
            expect(HooksHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(SettingsHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(PlaceableHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(TokenHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, handlers.placeable);
            expect(TileHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, handlers.token, handlers.placeable);
            expect(OcclusionHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, handlers.token, handlers.tile);
            expect(UserInterfaceHandler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
        });

        it('should correctly assign handler instances to properties', () => {
            expect(handlers.hooks).toBeInstanceOf(HooksHandler);
            expect(handlers.settings).toBeInstanceOf(SettingsHandler);
            expect(handlers.placeable).toBeInstanceOf(PlaceableHandler);
            expect(handlers.token).toBeInstanceOf(TokenHandler);
            expect(handlers.tile).toBeInstanceOf(TileHandler);
            expect(handlers.occlusion).toBeInstanceOf(OcclusionHandler);
            expect(handlers.ui).toBeInstanceOf(UserInterfaceHandler);
        });
                    
        describe('validateHandlerParameters', () => {
            it('should throw error when config is missing', () => {
                expect(() => new Handlers(null, mockContext, mockUtils))
                    .toThrow('Config is required for Handlers');
            });
        
            it('should throw error when context is missing', () => {
                expect(() => new Handlers(mockConfig, null, mockUtils))
                    .toThrow('Context is required for Handlers');
            });
        
            it('should throw error when utils is missing', () => {
                expect(() => new Handlers(mockConfig, mockContext, null))
                    .toThrow('Utils is required for Handlers');
            });
        
            it('should throw error when config is not an object', () => {
                expect(() => new Handlers('invalid', mockContext, mockUtils))
                    .toThrow('Config must be an object');
            });
        
            it('should throw error when context is not an object', () => {
                expect(() => new Handlers(mockConfig, 'invalid', mockUtils))
                    .toThrow('Context must be an object');
            });
        
            it('should throw error when utils is not an object', () => {
                expect(() => new Handlers(mockConfig, mockContext, 'invalid'))
                    .toThrow('Utils must be an object');
            });
        });
    });
})

            