import PlaceableHandler from './placeableHandler.js';
import PlaceableGetter from './placeableHelpers/placeableGetter.js';
import PlaceableChecker from './placeableHelpers/placeableChecker.js';
import PlaceableSetter from './placeableHelpers/placeableSetter.js';
import Handler from '../baseClasses/handler.js';

/**
 * @file placeableHandler.unit.test.js
 * @description Unit tests for PlaceableHandler.
 * @path src/handlers/placeableHandler.unit.test.js
 */

// Mock the dependencies
jest.mock('./placeableHelpers/placeableGetter.js');
jest.mock('./placeableHelpers/placeableChecker.js');
jest.mock('./placeableHelpers/placeableSetter.js');
jest.mock('../baseClasses/handler.js');

describe('PlaceableHandler', () => {
    let placeableHandler;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockGetter;
    let mockSetter;
    let mockChecker;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup mocks
        mockConfig = { someConfig: 'value' };
        mockContext = { someContext: 'value' };
        mockUtils = { someUtil: jest.fn() };
        
        mockGetter = {
            getAllPlaceables: jest.fn().mockReturnValue([]),
            getCorner: jest.fn(),
            getCenter: jest.fn(),
            getElevation: jest.fn(),
            getRectBounds: jest.fn(),
            getPosition: jest.fn()
        };
        
        mockSetter = {
            setCurrentPlaceable: jest.fn()
        };
        
        mockChecker = {
            isSelected: jest.fn(),
            isUnder: jest.fn(),
            isOver: jest.fn()
        };
        
        // Setup mock implementations
        PlaceableGetter.mockImplementation(() => mockGetter);
        PlaceableSetter.mockImplementation(() => mockSetter);
        PlaceableChecker.mockImplementation(() => mockChecker);
        
        placeableHandler = new PlaceableHandler(mockConfig, mockContext, mockUtils);
        placeableHandler.getter = mockGetter;
        placeableHandler.setter = mockSetter;
        placeableHandler.checker = mockChecker;
    });

    describe('constructor', () => {
        it('should initialize with the provided parameters', () => {
            expect(Handler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(PlaceableGetter).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(PlaceableSetter).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
            expect(PlaceableChecker).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils, expect.any(Object));
            expect(placeableHandler.placeableType).toBeNull();
            expect(placeableHandler.all).toEqual([]);
            expect(placeableHandler.current).toBeNull();
        });
    });

    describe('setCurrent', () => {
        it('should call setter.setCurrentPlaceable with the provided placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            mockSetter.setCurrentPlaceable.mockReturnValue(mockPlaceable);
            
            const result = placeableHandler.setCurrent(mockPlaceable);
            
            expect(mockSetter.setCurrentPlaceable).toHaveBeenCalledWith(mockPlaceable);
            expect(result).toBe(mockPlaceable);
        });
    });
    
    describe('getCurrent', () => {
        it('should return the current placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            placeableHandler.current = mockPlaceable;
            
            const result = placeableHandler.getCurrent();
            
            expect(result).toBe(mockPlaceable);
        });
    });
    
    describe('getAll', () => {
        it('should call getter.getAllPlaceables and update internal list when updateProperty is true', () => {
            const mockPlaceables = [{ id: 'placeable1' }, { id: 'placeable2' }];
            mockGetter.getAllPlaceables.mockReturnValue(mockPlaceables);
            placeableHandler.placeableType = 'testType';
            
            const result = placeableHandler.getAll();
            
            expect(mockGetter.getAllPlaceables).toHaveBeenCalledWith('testType', false, true);
            expect(placeableHandler.all).toEqual(mockPlaceables);
            expect(result).toEqual(mockPlaceables);
        });
        
        it('should not update internal list when updateProperty is false', () => {
            const mockPlaceables = [{ id: 'placeable1' }, { id: 'placeable2' }];
            mockGetter.getAllPlaceables.mockReturnValue(mockPlaceables);
            placeableHandler.all = [];
            
            const result = placeableHandler.getAll('testType', false, true);
            
            expect(mockGetter.getAllPlaceables).toHaveBeenCalledWith('testType', false, true);
            expect(placeableHandler.all).toEqual([]);
            expect(result).toEqual(mockPlaceables);
        });
        
        it('should not return value when returnValue is false', () => {
            const mockPlaceables = [{ id: 'placeable1' }, { id: 'placeable2' }];
            mockGetter.getAllPlaceables.mockReturnValue(mockPlaceables);
            
            const result = placeableHandler.getAll('testType', true, false);
            
            expect(mockGetter.getAllPlaceables).toHaveBeenCalledWith('testType', false, true);
            expect(placeableHandler.all).toEqual(mockPlaceables);
            expect(result).toBeUndefined();
        });
    });
    
    describe('getCorner', () => {
        it('should call getter.getCorner with the provided parameters', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const mockCorner = { x: 10, y: 20 };
            mockGetter.getCorner.mockReturnValue(mockCorner);
            
            const result = placeableHandler.getCorner('topLeft', mockPlaceable);
            
            expect(mockGetter.getCorner).toHaveBeenCalledWith('topLeft', mockPlaceable);
            expect(result).toBe(mockCorner);
        });
    });
    
    describe('getCenter', () => {
        it('should call getter.getCenter with the provided placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const mockCenter = { x: 50, y: 50 };
            mockGetter.getCenter.mockReturnValue(mockCenter);
            
            const result = placeableHandler.getCenter(mockPlaceable);
            
            expect(mockGetter.getCenter).toHaveBeenCalledWith(mockPlaceable);
            expect(result).toBe(mockCenter);
        });
    });
    
    describe('getElevation', () => {
        it('should call getter.getElevation with the provided placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            mockGetter.getElevation.mockReturnValue(10);
            
            const result = placeableHandler.getElevation(mockPlaceable);
            
            expect(mockGetter.getElevation).toHaveBeenCalledWith(mockPlaceable);
            expect(result).toBe(10);
        });
    });
    
    describe('getRectBounds', () => {
        it('should call getter.getRectBounds with the provided placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const mockBounds = { x: 0, y: 0, width: 100, height: 100 };
            mockGetter.getRectBounds.mockReturnValue(mockBounds);
            
            const result = placeableHandler.getRectBounds(mockPlaceable);
            
            expect(mockGetter.getRectBounds).toHaveBeenCalledWith(mockPlaceable);
            expect(result).toBe(mockBounds);
        });
    });
    
    describe('getPosition', () => {
        it('should call getter.getPosition with the provided parameters', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const mockManager = { id: 'test-manager' };
            const mockPosition = { x: 25, y: 25 };
            mockGetter.getPosition.mockReturnValue(mockPosition);
            
            const result = placeableHandler.getPosition(mockPlaceable, mockManager, 'corner');
            
            expect(mockGetter.getPosition).toHaveBeenCalledWith(mockPlaceable, mockManager, 'corner');
            expect(result).toBe(mockPosition);
        });
        
        it('should use default use parameter if not provided', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const mockManager = { id: 'test-manager' };
            
            placeableHandler.getPosition(mockPlaceable, mockManager);
            
            expect(mockGetter.getPosition).toHaveBeenCalledWith(mockPlaceable, mockManager, 'center');
        });
    });
    
    describe('isSelected', () => {
        it('should call checker.isSelected with the provided placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            mockChecker.isSelected.mockReturnValue(true);
            
            const result = placeableHandler.isSelected(mockPlaceable);
            
            expect(mockChecker.isSelected).toHaveBeenCalledWith(mockPlaceable);
            expect(result).toBe(true);
        });
    });
    
    describe('isUnder', () => {
        it('should call checker.isUnder with the provided parameters', () => {
            const mockTarget = { id: 'target' };
            const mockReference = { id: 'reference' };
            const mockTargetManager = { id: 'targetManager' };
            const mockReferenceManager = { id: 'referenceManager' };
            mockChecker.isUnder.mockReturnValue(true);
            
            const result = placeableHandler.isUnder(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'customTarget', 'customReference', 'customCheck'
            );
            
            expect(mockChecker.isUnder).toHaveBeenCalledWith(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'customTarget', 'customReference', 'customCheck'
            );
            expect(result).toBe(true);
        });
        
        it('should use default parameters if not provided', () => {
            const mockTarget = { id: 'target' };
            const mockReference = { id: 'reference' };
            const mockTargetManager = { id: 'targetManager' };
            const mockReferenceManager = { id: 'referenceManager' };
            
            placeableHandler.isUnder(mockTarget, mockReference, mockTargetManager, mockReferenceManager);
            
            expect(mockChecker.isUnder).toHaveBeenCalledWith(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'center', 'rectangle', 'under'
            );
        });
    });
    
    describe('isOver', () => {
        it('should call checker.isOver with the provided parameters', () => {
            const mockTarget = { id: 'target' };
            const mockReference = { id: 'reference' };
            const mockTargetManager = { id: 'targetManager' };
            const mockReferenceManager = { id: 'referenceManager' };
            mockChecker.isOver.mockReturnValue(true);
            
            const result = placeableHandler.isOver(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'customTarget', 'customReference', 'customCheck'
            );
            
            expect(mockChecker.isOver).toHaveBeenCalledWith(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'customTarget', 'customReference', 'customCheck'
            );
            expect(result).toBe(true);
        });
        
        it('should use default parameters if not provided', () => {
            const mockTarget = { id: 'target' };
            const mockReference = { id: 'reference' };
            const mockTargetManager = { id: 'targetManager' };
            const mockReferenceManager = { id: 'referenceManager' };
            
            placeableHandler.isOver(mockTarget, mockReference, mockTargetManager, mockReferenceManager);
            
            expect(mockChecker.isOver).toHaveBeenCalledWith(
                mockTarget, mockReference, mockTargetManager, mockReferenceManager,
                'center', 'rectangle', 'above'
            );
        });
    });
});