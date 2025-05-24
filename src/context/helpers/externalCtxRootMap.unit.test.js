import ExternalContextRootMap from './externalCtxRootMap';
import RootMapValidator from './validators/rootMapValidator';

/**
 * @file externalCtxRootMap.test.js
 * @description Unit tests for the ExternalContextRootMap class.
 * @path src/context/helpers/externalCtxRootMap.test.js
 */


jest.mock('./validators/rootMapValidator');

describe('ExternalContextRootMap', () => {
    let mockGlobalNamespace;
    let mockModule;
    let mockRootMapBuilder;
    let mockRootMap;

    beforeEach(() => {
        mockGlobalNamespace = 'testGlobal';
        mockModule = 'testModule';
        mockRootMap = { test: 'value' };
        mockRootMapBuilder = jest.fn().mockReturnValue(mockRootMap);

        RootMapValidator.validateArgs.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create an instance with provided parameters', () => {
            const externalCtxRootMap = new ExternalContextRootMap(
                mockGlobalNamespace,
                mockModule,
                mockRootMapBuilder
            );

            expect(externalCtxRootMap).toBeInstanceOf(ExternalContextRootMap);
            expect(externalCtxRootMap.globalNamespace).toBe(mockGlobalNamespace);
            expect(externalCtxRootMap.module).toBe(mockModule);
            expect(externalCtxRootMap.rootMapBuilder).toBe(mockRootMapBuilder);
        });

        it('should validate arguments during construction', () => {
            new ExternalContextRootMap(
                mockGlobalNamespace,
                mockModule,
                mockRootMapBuilder
            );

            expect(RootMapValidator.validateArgs).toHaveBeenCalledTimes(1);
        });

        it('should initialize rootMap using getMap method', () => {
            const externalCtxRootMap = new ExternalContextRootMap(
                mockGlobalNamespace,
                mockModule,
                mockRootMapBuilder
            );

            expect(mockRootMapBuilder).toHaveBeenCalledWith(mockGlobalNamespace, mockModule);
            expect(externalCtxRootMap.rootMap).toBe(mockRootMap);
        });
    });

    describe('getMap', () => {
        let externalCtxRootMap;

        beforeEach(() => {
            externalCtxRootMap = new ExternalContextRootMap(
                mockGlobalNamespace,
                mockModule,
                mockRootMapBuilder
            );
            mockRootMapBuilder.mockClear();
        });

        it('should call rootMapBuilder with default parameters when no arguments provided', () => {
            const result = externalCtxRootMap.getMap();

            expect(mockRootMapBuilder).toHaveBeenCalledWith(mockGlobalNamespace, mockModule);
            expect(result).toBe(mockRootMap);
        });

        it('should call rootMapBuilder with provided globalNamespace parameter', () => {
            const newGlobalNamespace = 'newGlobal';

            const result = externalCtxRootMap.getMap(newGlobalNamespace);

            expect(mockRootMapBuilder).toHaveBeenCalledWith(newGlobalNamespace, mockModule);
            expect(result).toBe(mockRootMap);
        });

        it('should call rootMapBuilder with provided module parameter', () => {
            const newModule = 'newModule';

            const result = externalCtxRootMap.getMap(undefined, newModule);

            expect(mockRootMapBuilder).toHaveBeenCalledWith(mockGlobalNamespace, newModule);
            expect(result).toBe(mockRootMap);
        });

        it('should call rootMapBuilder with both provided parameters', () => {
            const newGlobalNamespace = 'newGlobal';
            const newModule = 'newModule';

            const result = externalCtxRootMap.getMap(newGlobalNamespace, newModule);

            expect(mockRootMapBuilder).toHaveBeenCalledWith(newGlobalNamespace, newModule);
            expect(result).toBe(mockRootMap);
        });

        it('should return the result from rootMapBuilder', () => {
            const customRootMap = { custom: 'map' };
            mockRootMapBuilder.mockReturnValue(customRootMap);

            const result = externalCtxRootMap.getMap();

            expect(result).toBe(customRootMap);
        });
    });

    describe('integration', () => {
        it('should work with different rootMapBuilder implementations', () => {
            const customBuilder = jest.fn().mockReturnValue({ custom: 'result' });

            const externalCtxRootMap = new ExternalContextRootMap(
                'global',
                'module',
                customBuilder
            );

            expect(customBuilder).toHaveBeenCalledWith('global', 'module');
            expect(externalCtxRootMap.rootMap).toEqual({ custom: 'result' });
        });

        it('should maintain state correctly across multiple getMap calls', () => {
            const externalCtxRootMap = new ExternalContextRootMap(
                mockGlobalNamespace,
                mockModule,
                mockRootMapBuilder
            );

            const firstCall = externalCtxRootMap.getMap();
            const secondCall = externalCtxRootMap.getMap('different', 'params');

            expect(firstCall).toBe(mockRootMap);
            expect(secondCall).toBe(mockRootMap);
            expect(mockRootMapBuilder).toHaveBeenCalledTimes(3); // Constructor + 2 getMap calls
        });
    });
});