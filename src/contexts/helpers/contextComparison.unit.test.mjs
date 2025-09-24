/**
 * @file contextComparison.unit.test.mjs
 * @description Comprehensive unit tests for the ContextComparison class functionality including enhanced timestamp format support and dayjs integration.
 * @path src/contexts/helpers/contextComparison.unit.test.mjs

 */

import ContextComparison from './contextComparison.mjs';

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

  describe('timestamp type validation', () => {
    it('should handle string timestamps correctly', () => {
      const containerA = { modifiedAt: '2024-01-02T00:00:00.000Z' };
      const containerB = { modifiedAt: '2024-01-01T00:00:00.000Z' };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.containerATimestamp).toEqual(new Date('2024-01-02T00:00:00.000Z'));
      expect(result.containerBTimestamp).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.timeDifference).toBeGreaterThan(0);
    });

    it('should handle number timestamps correctly', () => {
      const time1 = mockDate1.getTime();
      const time2 = mockDate2.getTime();
      const containerA = { modifiedAt: time2 };
      const containerB = { modifiedAt: time1 };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
      expect(result.containerATimestamp).toEqual(new Date(time2));
      expect(result.containerBTimestamp).toEqual(new Date(time1));
      expect(result.timeDifference).toBe(time2 - time1);
    });

    it('should handle mixed timestamp types (Date and string)', () => {
      const containerA = { modifiedAt: mockDate1 };
      const containerB = { modifiedAt: '2024-01-01T00:00:00.000Z' };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.timeDifference).toBeDefined();
    });

    it('should handle mixed timestamp types (Date and number)', () => {
      const containerA = { modifiedAt: mockDate1 };
      const containerB = { modifiedAt: mockDate1.getTime() };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result).toBeDefined();
      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.EQUAL);
      expect(result.timeDifference).toBe(0);
    });

    it('should handle mixed timestamp types (string and number)', () => {
      const containerA = { modifiedAt: '2024-01-01T00:00:00.000Z' };
      const containerB = { modifiedAt: mockDate1.getTime() };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.timeDifference).toBeDefined();
    });

    it('should throw error for unsupported timestamp types', () => {
      const containerA = { modifiedAt: true };
      const containerB = { modifiedAt: false };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow('Invalid timestamp types or mixed types provided');
    });

    it('should throw error for invalid string dates that result in NaN', () => {
      const containerA = { modifiedAt: 'invalid-date-string' };
      const containerB = { modifiedAt: 'also-invalid' };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow('Invalid timestamp values provided');
    });

    it('should throw error for NaN number timestamps', () => {
      const containerA = { modifiedAt: NaN };
      const containerB = { modifiedAt: NaN };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow('Invalid timestamp values provided');
    });

    it('should throw error when one string timestamp is invalid', () => {
      const containerA = { modifiedAt: '2024-01-01T00:00:00.000Z' };
      const containerB = { modifiedAt: 'invalid-date' };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow('Invalid timestamp values provided');
    });

    it('should throw error when one number timestamp is NaN', () => {
      const containerA = { modifiedAt: mockDate1.getTime() };
      const containerB = { modifiedAt: NaN };

      expect(() => {
        ContextComparison.compare(containerA, containerB);
      }).toThrow('Invalid timestamp values provided');
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

  describe('Enhanced Timestamp Format Support', () => {
    describe('various timestamp formats', () => {
      it('should handle GMT format timestamps like "Sun Jul 20 2025 10:17:49 GMT+0000 (Coordinated Universal Time)"', () => {
        const containerA = { modifiedAt: 'Sun Jul 20 2025 10:17:49 GMT+0000 (Coordinated Universal Time)' };
        const containerB = { modifiedAt: 'Sun Jul 20 2025 10:17:48 GMT+0000 (Coordinated Universal Time)' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBe(1000); // 1 second difference
        expect(result.containerATimestamp).toBeInstanceOf(Date);
        expect(result.containerBTimestamp).toBeInstanceOf(Date);
      });

      it('should handle ISO 8601 format timestamps', () => {
        const containerA = { modifiedAt: '2025-07-20T10:17:49.000Z' };
        const containerB = { modifiedAt: '2025-07-20T10:17:48.000Z' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBe(1000); // 1 second difference
      });

      it('should handle Unix timestamps (numbers)', () => {
        const timestampA = 1721472469000; // July 20, 2025 10:17:49 UTC
        const timestampB = 1721472468000; // July 20, 2025 10:17:48 UTC

        const containerA = { modifiedAt: timestampA };
        const containerB = { modifiedAt: timestampB };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBe(1000); // 1 second difference
      });

      it('should handle Date objects', () => {
        const dateA = new Date('2025-07-20T10:17:49.000Z');
        const dateB = new Date('2025-07-20T10:17:48.000Z');

        const containerA = { modifiedAt: dateA };
        const containerB = { modifiedAt: dateB };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBe(1000); // 1 second difference
      });

      it('should handle mixed timestamp types correctly', () => {
        // Use a consistent base timestamp for both containers
        const baseDate = new Date('2025-07-20T10:17:48.000Z');
        const oneSecondLater = new Date('2025-07-20T10:17:49.000Z');

        const containerA = { modifiedAt: oneSecondLater.toString() }; // This will be in GMT format
        const containerB = { modifiedAt: baseDate.getTime() }; // Unix timestamp

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        // We expect about 1 second difference, allowing for some parsing variation
        expect(result.timeDifference).toBeGreaterThan(500);
        expect(result.timeDifference).toBeLessThan(1500);
      });

      it('should handle US date format', () => {
        const containerA = { modifiedAt: '07/20/2025 10:17:49' };
        const containerB = { modifiedAt: '07/20/2025 10:17:48' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBeGreaterThan(0);
      });

      it('should handle common string date formats', () => {
        const containerA = { modifiedAt: 'July 20, 2025 10:17:49' };
        const containerB = { modifiedAt: 'July 20, 2025 10:17:48' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBeGreaterThan(0);
      });
    });

    describe('edge cases with enhanced parsing', () => {
      it('should handle timezone differences correctly', () => {
        const containerA = { modifiedAt: 'Sun Jul 20 2025 10:17:49 GMT+0200 (Central European Time)' };
        const containerB = { modifiedAt: 'Sun Jul 20 2025 10:17:49 GMT+0000 (Coordinated Universal Time)' };

        const result = ContextComparison.compare(containerA, containerB);

        // A should be 2 hours earlier than B when both are converted to UTC
        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);
        expect(result.timeDifference).toBe(-2 * 60 * 60 * 1000); // -2 hours in milliseconds
      });

      it('should still throw errors for completely invalid timestamps', () => {
        const containerA = { modifiedAt: 'this-is-not-a-date-at-all' };
        const containerB = { modifiedAt: '2025-07-20T10:17:49.000Z' };

        expect(() => {
          ContextComparison.compare(containerA, containerB);
        }).toThrow('Invalid timestamp values provided');
      });

      it('should still throw errors for unsupported types', () => {
        const containerA = { modifiedAt: true };
        const containerB = { modifiedAt: [] };

        expect(() => {
          ContextComparison.compare(containerA, containerB);
        }).toThrow('Invalid timestamp types or mixed types provided');
      });
    });

    describe('precision and accuracy', () => {
      it('should maintain millisecond precision', () => {
        const containerA = { modifiedAt: '2025-07-20T10:17:49.123Z' };
        const containerB = { modifiedAt: '2025-07-20T10:17:49.124Z' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER);
        expect(result.timeDifference).toBe(-1); // 1 millisecond difference
      });

      it('should handle very large timestamp differences', () => {
        const containerA = { modifiedAt: '2025-07-20T10:17:49.000Z' };
        const containerB = { modifiedAt: '1970-01-01T00:00:00.000Z' };

        const result = ContextComparison.compare(containerA, containerB);

        expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER);
        expect(result.timeDifference).toBeGreaterThan(1000000000000); // Very large positive number
      });
    });
  });
});