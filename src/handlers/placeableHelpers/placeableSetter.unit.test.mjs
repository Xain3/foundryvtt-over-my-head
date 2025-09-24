/**
 * @file placeableSetter.unit.test.js
 * @description Unit tests for PlaceableSetter helper.
 * @path src/handlers/placeableHelpers/placeableSetter.unit.test.js
 */

import PlaceableSetter from './placeableSetter.mjs';

describe('PlaceableSetter', () => {
    let placeableSetter;
    let mockConfig;
    let mockContext;
    let mockUtils;
    
    beforeEach(() => {
        mockConfig = {};
        mockContext = {};
        mockUtils = {};
        placeableSetter = new PlaceableSetter(mockConfig, mockContext, mockUtils);
    });
    
    describe('constructor', () => {
        it('should initialize with current set to null', () => {
            expect(placeableSetter.current).toBeNull();
        });
        
        it('should extend Handler class', () => {
            expect(placeableSetter.config).toBe(mockConfig);
            expect(placeableSetter.context).toBe(mockContext);
            expect(placeableSetter.utils).toBe(mockUtils);
        });
    });
    
    describe('setCurrentPlaceable', () => {
        it('should set the current placeable', () => {
            const mockPlaceable = { id: 'test-placeable' };
            placeableSetter.setCurrentPlaceable(mockPlaceable);
            expect(placeableSetter.current).toBe(mockPlaceable);
        });
        
        it('should return the current placeable when returnValue is true', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const result = placeableSetter.setCurrentPlaceable(mockPlaceable, true);
            expect(result).toBe(mockPlaceable);
        });
        
        it('should return the current placeable by default (when returnValue is not specified)', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const result = placeableSetter.setCurrentPlaceable(mockPlaceable);
            expect(result).toBe(mockPlaceable);
        });
        
        it('should not return anything when returnValue is false', () => {
            const mockPlaceable = { id: 'test-placeable' };
            const result = placeableSetter.setCurrentPlaceable(mockPlaceable, false);
            expect(result).toBeUndefined();
        });
        
        it('should update current placeable when called multiple times', () => {
            const mockPlaceable1 = { id: 'placeable-1' };
            const mockPlaceable2 = { id: 'placeable-2' };
            
            placeableSetter.setCurrentPlaceable(mockPlaceable1);
            expect(placeableSetter.current).toBe(mockPlaceable1);
            
            placeableSetter.setCurrentPlaceable(mockPlaceable2);
            expect(placeableSetter.current).toBe(mockPlaceable2);
        });
    });
});