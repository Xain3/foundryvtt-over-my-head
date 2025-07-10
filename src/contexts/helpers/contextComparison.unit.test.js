import ContextComparison from './contextComparison.js';

/**
 * @file contextComparison.test.js
 * @description Test file for the ContextComparison class functionality.
 * @path src/contexts/helpers/contextComparison.test.js
 * @date 2025-06-18
 */

describe('ContextComparison', () => {
  const mockDate1 = new Date('2024-01-01T00:00:00.000Z');
  const mockDate2 = new Date('2024-01-02T00:00:00.000Z');
  const mockDate3 = new Date('2024-01-01T00:00:00.000Z'); // Same as mockDate1

  let mockContainerA;
  let mockContainerB;

  beforeEach(() => {
    mockContainerA = {
      modifiedAt: mockDate1,
      createdAt: mockDate1
    };

    mockContainerB = {
      modifiedAt: mockDate2,
      createdAt: mockDate2
    };
  });

  describe('COMPARISON_RESULTS constants', () => {
    it('should have all expected comparison result constants', () => {
      expect(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER).toBe('containerANewer');
      expect(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER).toBe('containerBNewer');
      expect(ContextComparison.COMPARISON_RESULTS.EQUAL).toBe('equal');
      expect(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_MISSING).toBe('containerAMissing');
      expect(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_MISSING).toBe('containerBMissing');
      expect(ContextComparison.COMPARISON_RESULTS.BOTH_MISSING).toBe('bothMissing');
    });
  });

  describe('compare', () => {
    it('should return BOTH_MISSING when both containerA and containerB are null', () => {
      const result = ContextComparison.compare(null, null);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        containerATimestamp: null,
        containerBTimestamp: null,
        timeDifference: 0
      });
    });

    it('should return BOTH_MISSING when both containerA and containerB are undefined', () => {
      const result = ContextComparison.compare(undefined, undefined);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        containerATimestamp: null,
        containerBTimestamp: null,
        timeDifference: 0
      });
    });

    it('should return CONTAINER_A_MISSING when containerA is null', () => {
      const result = ContextComparison.compare(null, mockContainerB);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_MISSING,
        containerATimestamp: null,
        containerBTimestamp: mockDate2,
        timeDifference: null
      });
    });

    it('should return CONTAINER_A_MISSING when containerA is undefined', () => {
      const result = ContextComparison.compare(undefined, mockContainerB);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_MISSING,
        containerATimestamp: null,
        containerBTimestamp: mockDate2,
        timeDifference: null
      });
    });

    it('should return CONTAINER_B_MISSING when containerB is null', () => {
      const result = ContextComparison.compare(mockContainerA, null);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_B_MISSING,
        containerATimestamp: mockDate1,
        containerBTimestamp: null,
        timeDifference: null
      });
    });

    it('should return CONTAINER_B_MISSING when containerB is undefined', () => {
      const result = ContextComparison.compare(mockContainerA, undefined);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_B_MISSING,
        containerATimestamp: mockDate1,
        containerBTimestamp: null,
        timeDifference: null
      });
    });

    it('should return CONTAINER_B_NEWER when containerB has newer modifiedAt', () => {
      const result = ContextComparison.compare(mockContainerA, mockContainerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);
      expect(result.containerATimestamp).toEqual(mockDate1);
      expect(result.containerBTimestamp).toEqual(mockDate2);
      expect(result.timeDifference).toBe(mockDate1.getTime() - mockDate2.getTime());
      expect(result.timeDifference).toBeLessThan(0);
    });

    it('should return CONTAINER_A_NEWER when containerA has newer modifiedAt', () => {
      mockContainerA.modifiedAt = mockDate2;
      mockContainerB.modifiedAt = mockDate1;

      const result = ContextComparison.compare(mockContainerA, mockContainerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.containerATimestamp).toEqual(mockDate2);
      expect(result.containerBTimestamp).toEqual(mockDate1);
      expect(result.timeDifference).toBe(mockDate2.getTime() - mockDate1.getTime());
      expect(result.timeDifference).toBeGreaterThan(0);
    });

    it('should return EQUAL when timestamps are identical', () => {
      mockContainerA.modifiedAt = mockDate3; // Same as mockDate1
      mockContainerB.modifiedAt = mockDate1;

      const result = ContextComparison.compare(mockContainerA, mockContainerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.EQUAL);
      expect(result.containerATimestamp).toEqual(mockDate3);
      expect(result.containerBTimestamp).toEqual(mockDate1);
      expect(result.timeDifference).toBe(0);
    });

    it('should use default compareBy option (modifiedAt)', () => {
      const result = ContextComparison.compare(mockContainerA, mockContainerB);

      expect(result.containerATimestamp).toEqual(mockContainerA.modifiedAt);
      expect(result.containerBTimestamp).toEqual(mockContainerB.modifiedAt);
    });

    it('should use custom compareBy option', () => {
      const result = ContextComparison.compare(
        mockContainerA,
        mockContainerB,
        { compareBy: 'createdAt' }
      );

      expect(result.containerATimestamp).toEqual(mockContainerA.createdAt);
      expect(result.containerBTimestamp).toEqual(mockContainerB.createdAt);
    });

    it('should handle empty options object', () => {
      const result = ContextComparison.compare(mockContainerA, mockContainerB, {});

      expect(result.containerATimestamp).toEqual(mockContainerA.modifiedAt);
      expect(result.containerBTimestamp).toEqual(mockContainerB.modifiedAt);
    });

    it('should work with Context-like objects', () => {
      const contextA = { modifiedAt: mockDate1, id: 'context-a' };
      const contextB = { modifiedAt: mockDate2, id: 'context-b' };

      const result = ContextComparison.compare(contextA, contextB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);
      expect(result.containerATimestamp).toEqual(mockDate1);
      expect(result.containerBTimestamp).toEqual(mockDate2);
    });

    it('should work with ContextContainer-like objects', () => {
      const containerA = { modifiedAt: mockDate2, name: 'container-a' };
      const containerB = { modifiedAt: mockDate1, name: 'container-b' };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.containerATimestamp).toEqual(mockDate2);
      expect(result.containerBTimestamp).toEqual(mockDate1);
    });

    it('should work with ContextItem-like objects', () => {
      const itemA = { modifiedAt: mockDate1, key: 'item-a' };
      const itemB = { modifiedAt: mockDate1, key: 'item-b' };

      const result = ContextComparison.compare(itemA, itemB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.EQUAL);
      expect(result.containerATimestamp).toEqual(mockDate1);
      expect(result.containerBTimestamp).toEqual(mockDate1);
    });

    it('should handle millisecond precision in time differences', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:00.001Z'); // 1ms difference

      const containerA = { modifiedAt: date1 };
      const containerB = { modifiedAt: date2 };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);
      expect(result.timeDifference).toBe(-1);
    });

    it('should handle large time differences', () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:00.000Z');

      const containerA = { modifiedAt: date2 };
      const containerB = { modifiedAt: date1 };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.timeDifference).toBeGreaterThan(0);
      expect(result.timeDifference).toBe(date2.getTime() - date1.getTime());
    });

    it('should handle custom timestamp properties', () => {
      const containerA = { customTimestamp: mockDate2 };
      const containerB = { customTimestamp: mockDate1 };

      const result = ContextComparison.compare(
        containerA,
        containerB,
        { compareBy: 'customTimestamp' }
      );

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.containerATimestamp).toEqual(mockDate2);
      expect(result.containerBTimestamp).toEqual(mockDate1);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with missing timestamp properties gracefully', () => {
      const containerA = {};
      const containerB = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow();
    });

    it('should handle invalid timestamp values', () => {
      const containerA = { modifiedAt: 'invalid-date' };
      const containerB = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow();
    });

    it('should handle null timestamp values', () => {
      const containerA = { modifiedAt: null };
      const containerB = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow();
    });
  });
});