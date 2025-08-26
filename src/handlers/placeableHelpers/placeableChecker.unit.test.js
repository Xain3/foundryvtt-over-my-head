import PlaceableChecker from './placeableChecker';
import PositionChecker from './positionChecker';
import { CHECK_TYPES } from './positionChecker.fallbacks.js';
import MockConfig from '../../../tests/mocks/config';

/**
 * @file placeableChecker.unit.test.js
 * @description Unit tests for PlaceableChecker.
 * @path src/handlers/placeableHelpers/placeableChecker.unit.test.js
 */

// Mock dependencies
jest.mock('./positionChecker.js');

describe('PlaceableChecker', () => {
    let placeableChecker;
    let mockConfig;
    let mockContext;
    let mockUtils;
    let mockPlaceableGetter;
    let mockPositionChecker;
    let mockLogger;

    beforeEach(() => {
        mockConfig = new MockConfig();
        mockContext = {};
        
        mockLogger = {
            warn: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };
        
        mockUtils = {
            logger: mockLogger
        };
        
        mockPlaceableGetter = {
            getPosition: jest.fn(),
            getElevation: jest.fn()
        };
        
        mockPositionChecker = {
            check: jest.fn()
        };
        
    PositionChecker.mockImplementation(() => mockPositionChecker);
        
        placeableChecker = new PlaceableChecker(mockConfig, mockContext, mockUtils, mockPlaceableGetter);
        placeableChecker.logger = mockLogger;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkPosition', () => {
        it('should delegate to positionChecker.check with the correct parameters', () => {
            const targetPosition = { x: 10, y: 20 };
            const targetElevation = 5;
            const referencePosition = { x: 15, y: 25 };
            const referenceElevation = 10;
            const targetUse = 'center';
            const referenceUse = 'rectangle';
            const checkType = CHECK_TYPES.UNDER;
            
            mockPositionChecker.check.mockReturnValue(true);
            
            const result = placeableChecker.checkPosition(
                targetPosition,
                targetElevation,
                referencePosition,
                referenceElevation,
                targetUse,
                referenceUse,
                checkType
            );
            
            expect(mockPositionChecker.check).toHaveBeenCalledWith(
                targetPosition,
                targetElevation,
                referencePosition,
                referenceElevation,
                targetUse,
                referenceUse,
                checkType
            );
            expect(result).toBe(true);
        });
    });

    describe('isSelected', () => {
        it('should return true if placeable is controlled', () => {
            const placeable = { controlled: true };
            const result = placeableChecker.isSelected(placeable);
            expect(result).toBe(true);
        });
        
        it('should return false if placeable is not controlled', () => {
            const placeable = { controlled: false };
            const result = placeableChecker.isSelected(placeable);
            expect(result).toBe(false);
        });
    });

    describe('isUnder', () => {
        it('should return true when target is under reference', () => {
            const target = { id: 'target' };
            const reference = { id: 'reference' };
            const targetManager = { id: 'targetManager' };
            const referenceManager = { id: 'referenceManager' };
            const targetUse = 'center';
            const referenceUse = 'rectangle';
            
            mockPlaceableGetter.getPosition.mockImplementation((obj) => {
                if (obj.id === 'target') return { x: 10, y: 20 };
                if (obj.id === 'reference') return { x: 15, y: 25 };
                return null;
            });
            
            mockPlaceableGetter.getElevation.mockImplementation((obj) => {
                if (obj.id === 'target') return 5;
                if (obj.id === 'reference') return 10;
                return null;
            });
            
            mockPositionChecker.check.mockReturnValue(true);
            
            const result = placeableChecker.isUnder(
                target,
                reference,
                targetManager,
                referenceManager,
                targetUse,
                referenceUse
            );
            
            expect(mockPlaceableGetter.getPosition).toHaveBeenCalledWith(target, targetManager, targetUse);
            expect(mockPlaceableGetter.getPosition).toHaveBeenCalledWith(reference, referenceManager, referenceUse);
            expect(mockPlaceableGetter.getElevation).toHaveBeenCalledWith(target, targetManager);
            expect(mockPlaceableGetter.getElevation).toHaveBeenCalledWith(reference, referenceManager);
            expect(mockPositionChecker.check).toHaveBeenCalledWith(
                { x: 10, y: 20 },
                5,
                { x: 15, y: 25 },
                10,
                targetUse,
                referenceUse,
                CHECK_TYPES.UNDER
            );
            expect(result).toBe(true);
        });
        
        it('should return false when any position or elevation is invalid', () => {
            const target = { id: 'target' };
            const reference = { id: 'reference' };
            const targetManager = { id: 'targetManager' };
            const referenceManager = { id: 'referenceManager' };
            
            mockPlaceableGetter.getPosition.mockReturnValue(null);
            mockPlaceableGetter.getElevation.mockReturnValue(5);
            
            const result = placeableChecker.isUnder(
                target,
                reference,
                targetManager,
                referenceManager
            );
            
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid target or reference');
            expect(result).toBe(false);
        });
        
        it('should log debug message if debug mode is enabled', () => {
            const target = { id: 'target' };
            const reference = { id: 'reference' };
            const targetManager = { id: 'targetManager' };
            const referenceManager = { id: 'referenceManager' };
            
            mockPlaceableGetter.getPosition.mockReturnValue({ x: 10, y: 20 });
            mockPlaceableGetter.getElevation.mockReturnValue(5);
            
            // Mock the debug mode check in utils.logger
            const mockLoggerWithDebug = {
                ...mockLogger,
                isDebugMode: jest.fn().mockReturnValue(true)
            };
            
            placeableChecker.utils = {
                logger: mockLoggerWithDebug
            };
            
            placeableChecker.isUnder(
                target,
                reference,
                targetManager,
                referenceManager
            );
            
            expect(mockLoggerWithDebug.isDebugMode).toHaveBeenCalled();
            expect(mockLoggerWithDebug.log).toHaveBeenCalledWith(`Checking if target ${target} is under reference ${reference}`);
        });
    });

    describe('isOver', () => {
        it('should call isUnder with the checkType "over"', () => {
            const target = { id: 'target' };
            const reference = { id: 'reference' };
            const targetManager = { id: 'targetManager' };
            const referenceManager = { id: 'referenceManager' };
            const targetUse = 'center';
            const referenceUse = 'rectangle';
            
            jest.spyOn(placeableChecker, 'isUnder').mockReturnValue(true);
            
            const result = placeableChecker.isOver(
                target,
                reference,
                targetManager,
                referenceManager,
                targetUse,
                referenceUse
            );
            
            expect(placeableChecker.isUnder).toHaveBeenCalledWith(
                target,
                reference,
                targetManager,
                referenceManager,
                targetUse,
                referenceUse,
                CHECK_TYPES.OVER
            );
            expect(result).toBe(true);
        });
    });
});