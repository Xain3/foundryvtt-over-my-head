/**
 * @file positionChecker.unit.test.mjs
 * @description Unit tests for PositionChecker.
 * @path src/handlers/placeableHelpers/positionChecker.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import PositionChecker from './positionChecker.mjs';

describe('PositionChecker', () => {
    let positionChecker;
    let mockUtils;
    let mockConfig;
    let mockContext;
    let mockLogger;

    beforeEach(() => {
    mockLogger = { warn: vi.fn() };
    mockUtils = { logger: mockLogger };
    mockConfig = { constants: {} };
    mockContext = {};
    positionChecker = new PositionChecker({ config: mockConfig, context: mockContext, utils: mockUtils });
        // Add logger for testing warning messages
        positionChecker.logger = mockLogger;
    });

    describe('constructor', () => {
        it('should initialize with utils and check methods', () => {
            expect(positionChecker.utils).toBe(mockUtils);
            expect(positionChecker.checkMethods).toBeDefined();
            expect(Object.keys(positionChecker.checkMethods).length).toBe(4);
        });
    });

    describe('returnCheckMethod', () => {
        it('should return the correct check method for valid key', () => {
            const method = positionChecker.returnCheckMethod(positionChecker.METHOD_KEYS.CENTER_RECTANGLE);
            expect(typeof method).toBe('function');
            expect(method.name).toContain('isCenterRelativeToRect');
        });
        it('should return null and log warning for invalid key', () => {
            const method = positionChecker.returnCheckMethod('invalid-key');
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey invalid-key');
        });
        it('should return null for undefined key', () => {
            const method = positionChecker.returnCheckMethod(undefined);
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey undefined');
        });
        it('should return null for empty string key', () => {
            const method = positionChecker.returnCheckMethod('');
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey ');
        });
        it('should return null for null key', () => {
            const method = positionChecker.returnCheckMethod(null);
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey null');
        });
        it('should return null for non-string key', () => {
            const method = positionChecker.returnCheckMethod(123);
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey 123');
        });
        it('should return null for boolean key', () => {
            const method = positionChecker.returnCheckMethod(true);
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey true');
        });
        it('should return null for object key', () => {
            const method = positionChecker.returnCheckMethod({ key: 'value' });
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey [object Object]');
        });
        it('should return null for array key', () => {
            const method = positionChecker.returnCheckMethod(['key1', 'key2']);
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey key1,key2');
        });
        it('should return null for function key', () => {
            const method = positionChecker.returnCheckMethod(() => {});
            expect(method).toBe(null);
            expect(mockLogger.warn).toHaveBeenCalledWith('Invalid methodKey () => {}');
        });
    });

    describe('check', () => {
        it('should call a function named checkMethod with correct parameters', () => {
            const mockCheckMethod = vi.fn();
            positionChecker.checkMethods[positionChecker.METHOD_KEYS.RECTANGLE_RECTANGLE] = mockCheckMethod;

            // Call check with valid parameters
            positionChecker.check({}, 1, {}, 2, positionChecker.POSITION_USES.RECTANGLE, positionChecker.POSITION_USES.RECTANGLE, positionChecker.CHECK_TYPES.UNDER);

            // Verify that the correct method was called with the right parameters
            expect(mockCheckMethod).toHaveBeenCalledWith(
                {}, 1, {}, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it('should return false and log warning for invalid combination', () => {
            // Call check with invalid combination
            const result = positionChecker.check({}, 1, {}, 2, 'invalid', 'use', positionChecker.CHECK_TYPES.UNDER);

            // Verify warning was logged and false returned
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Invalid combination of targetUse invalid and referenceUse use'
            );
            expect(result).toBe(false);
        });
    });

    describe('elevationCheck', () => {
        it('should return true when target is under reference for "under" check', () => {
            const result = positionChecker.elevationCheck(1, 2, positionChecker.CHECK_TYPES.UNDER);
            expect(result).toBe(true);
        });

        it('should return false when target is over reference for "under" check', () => {
            const result = positionChecker.elevationCheck(3, 2, positionChecker.CHECK_TYPES.UNDER);
            expect(result).toBe(false);
        });

        it('should return true when target is over reference for non-"under" check', () => {
            const result = positionChecker.elevationCheck(3, 2, positionChecker.CHECK_TYPES.OVER);
            expect(result).toBe(true);
        });

        it('should return false when target is under reference for non-"under" check', () => {
            const result = positionChecker.elevationCheck(1, 2, positionChecker.CHECK_TYPES.OVER);
            expect(result).toBe(false);
        });
    });

    describe('isCenterRelativeToRect', () => {
        it('should return true when center is within rectangle and elevation check passes', () => {
            const targetCenter = { x: 5, y: 5 };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isCenterRelativeToRect(
                targetCenter, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(true);
        });

        it('should return false when center is outside rectangle', () => {
            const targetCenter = { x: 15, y: 15 };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isCenterRelativeToRect(
                targetCenter, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(false);
        });

    it('should return false when elevation check fails', () => {
            const targetCenter = { x: 5, y: 5 };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isCenterRelativeToRect(
                targetCenter, 3, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });
        it('should be false when center is exactly on left edge (exclusive)', () => {
            const targetCenter = { x: 0, y: 5 };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const result = positionChecker.isCenterRelativeToRect(
                targetCenter, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });

        it('should be false when center is exactly on top edge (exclusive)', () => {
            const targetCenter = { x: 5, y: 10 };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const result = positionChecker.isCenterRelativeToRect(
                targetCenter, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });
    });

    describe('configuration overrides via config.constants.positionChecker', () => {
        it('should respect overridden POSITION_USES and METHOD_KEYS', () => {
            const overrideConfig = {
                constants: {
                    positionChecker: {
                        positionUses: { CENTER: 'ctr', RECTANGLE: 'rect' }
                    }
                }
            };
            const pc = new PositionChecker({ config: overrideConfig, context: {}, utils: mockUtils });
            expect(pc.POSITION_USES.CENTER).toBe('ctr');
            expect(pc.POSITION_USES.RECTANGLE).toBe('rect');
            const key = `${pc.POSITION_USES.CENTER}-${pc.POSITION_USES.RECTANGLE}`;
            const method = pc.returnCheckMethod(key);
            expect(typeof method).toBe('function');
        });

        it('should respect overridden CHECK_TYPES for elevationCheck', () => {
            const overrideConfig = {
                constants: {
                    positionChecker: {
                        checkTypes: { UNDER: 'below', OVER: 'above' }
                    }
                }
            };
            const pc = new PositionChecker({ config: overrideConfig, context: {}, utils: mockUtils });
            expect(pc.elevationCheck(1, 2, 'below')).toBe(true);
            expect(pc.elevationCheck(3, 2, 'below')).toBe(false);
            expect(pc.elevationCheck(3, 2, 'above')).toBe(true);
            expect(pc.elevationCheck(1, 2, 'above')).toBe(false);
        });
    });

    describe('invalid inputs and self-comparison', () => {
        it('should warn and return false for invalid rect input', () => {
            const result = positionChecker.isRectRelativeToRect(
                { BottomLeft: { x: 0, y: 0 } },
                1,
                { BottomLeft: { x: 0, y: 0 }, TopRight: { x: 10, y: 10 } },
                2,
                positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should handle self-comparison for rectangles (overlap true if elevation passes)', () => {
            const rect = { BottomLeft: { x: 0, y: 0 }, TopRight: { x: 10, y: 10 } };
            expect(positionChecker.isRectRelativeToRect(rect, 1, rect, 2, positionChecker.CHECK_TYPES.UNDER)).toBe(true);
            expect(positionChecker.isRectRelativeToRect(rect, 2, rect, 2, positionChecker.CHECK_TYPES.UNDER)).toBe(false);
        });

        it('should handle self-comparison for centers (true if same and elevation passes)', () => {
            const ctr = { x: 5, y: 5 };
            expect(positionChecker.isCenterRelativeToCenter(ctr, 1, ctr, 2, positionChecker.CHECK_TYPES.UNDER)).toBe(true);
            expect(positionChecker.isCenterRelativeToCenter(ctr, 2, ctr, 2, positionChecker.CHECK_TYPES.UNDER)).toBe(false);
        });
    });

    describe('isRectRelativeToCenter', () => {
        it('should return true when rectangle contains center and elevation check passes', () => {
            const targetPosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const referenceCenter = { x: 5, y: 5 };

            const result = positionChecker.isRectRelativeToCenter(
                targetPosition, 1, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(true);
        });

        it('should return false when rectangle does not contain center', () => {
            const targetPosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const referenceCenter = { x: 15, y: 15 };

            const result = positionChecker.isRectRelativeToCenter(
                targetPosition, 1, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(false);
        });

        it('should return false when elevation check fails', () => {
            const targetPosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const referenceCenter = { x: 5, y: 5 };

            const result = positionChecker.isRectRelativeToCenter(
                targetPosition, 3, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });

        it('should be false when center lies exactly on rectangle edge (exclusive)', () => {
            const targetPosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const referenceCenter = { x: 10, y: 5 };
            const result = positionChecker.isRectRelativeToCenter(
                targetPosition, 1, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });
    });

    describe('isRectRelativeToRect', () => {
        it('should return true when rectangles overlap and elevation check passes', () => {
            const targetPosition = {
                BottomLeft: { x: 5, y: 5 },
                TopRight: { x: 15, y: 15 }
            };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isRectRelativeToRect(
                targetPosition, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(true);
        });

        it('should return false when rectangles do not overlap', () => {
            const targetPosition = {
                BottomLeft: { x: 20, y: 20 },
                TopRight: { x: 30, y: 30 }
            };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isRectRelativeToRect(
                targetPosition, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(false);
        });

        it('should return false when elevation check fails', () => {
            const targetPosition = {
                BottomLeft: { x: 5, y: 5 },
                TopRight: { x: 15, y: 15 }
            };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };

            const result = positionChecker.isRectRelativeToRect(
                targetPosition, 3, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });

        it('should be false when rectangles touch at an edge (exclusive overlap)', () => {
            const targetPosition = {
                BottomLeft: { x: 10, y: 0 },
                TopRight: { x: 20, y: 10 }
            };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const result = positionChecker.isRectRelativeToRect(
                targetPosition, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });

        it('should be false when rectangles touch at a corner (exclusive overlap)', () => {
            const targetPosition = {
                BottomLeft: { x: 10, y: 10 },
                TopRight: { x: 20, y: 20 }
            };
            const referencePosition = {
                BottomLeft: { x: 0, y: 0 },
                TopRight: { x: 10, y: 10 }
            };
            const result = positionChecker.isRectRelativeToRect(
                targetPosition, 1, referencePosition, 2, positionChecker.CHECK_TYPES.UNDER
            );
            expect(result).toBe(false);
        });
    });

    describe('isCenterRelativeToCenter', () => {
        it('should return true when centers are at the same position and elevation check passes', () => {
            const targetCenter = { x: 5, y: 5 };
            const referenceCenter = { x: 5, y: 5 };

            const result = positionChecker.isCenterRelativeToCenter(
                targetCenter, 1, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(true);
        });

        it('should return false when centers are at different positions', () => {
            const targetCenter = { x: 5, y: 5 };
            const referenceCenter = { x: 10, y: 10 };

            const result = positionChecker.isCenterRelativeToCenter(
                targetCenter, 1, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(false);
        });

        it('should return false when elevation check fails', () => {
            const targetCenter = { x: 5, y: 5 };
            const referenceCenter = { x: 5, y: 5 };

            const result = positionChecker.isCenterRelativeToCenter(
                targetCenter, 3, referenceCenter, 2, positionChecker.CHECK_TYPES.UNDER
            );

            expect(result).toBe(false);
        });
    });
});