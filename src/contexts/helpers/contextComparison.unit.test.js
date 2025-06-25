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

  let mockSourceContext;
  let mockTargetContext;

  beforeEach(() => {
    mockSourceContext = {
      modifiedAt: mockDate1,
      createdAt: mockDate1
    };

    mockTargetContext = {
      modifiedAt: mockDate2,
      createdAt: mockDate2
    };
  });

  describe('COMPARISON_RESULTS constants', () => {
    it('should have all expected comparison result constants', () => {
      expect(ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER).toBe('sourceNewer');
      expect(ContextComparison.COMPARISON_RESULTS.TARGET_NEWER).toBe('targetNewer');
      expect(ContextComparison.COMPARISON_RESULTS.EQUAL).toBe('equal');
      expect(ContextComparison.COMPARISON_RESULTS.SOURCE_MISSING).toBe('sourceMissing');
      expect(ContextComparison.COMPARISON_RESULTS.TARGET_MISSING).toBe('targetMissing');
      expect(ContextComparison.COMPARISON_RESULTS.BOTH_MISSING).toBe('bothMissing');
    });
  });

  describe('compare', () => {
    it('should return BOTH_MISSING when both source and target are null', () => {
      const result = ContextComparison.compare(null, null);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        sourceTimestamp: null,
        targetTimestamp: null,
        timeDifference: 0
      });
    });

    it('should return BOTH_MISSING when both source and target are undefined', () => {
      const result = ContextComparison.compare(undefined, undefined);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        sourceTimestamp: null,
        targetTimestamp: null,
        timeDifference: 0
      });
    });

    it('should return SOURCE_MISSING when source is null', () => {
      const result = ContextComparison.compare(null, mockTargetContext);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.SOURCE_MISSING,
        sourceTimestamp: null,
        targetTimestamp: mockDate2,
        timeDifference: null
      });
    });

    it('should return SOURCE_MISSING when source is undefined', () => {
      const result = ContextComparison.compare(undefined, mockTargetContext);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.SOURCE_MISSING,
        sourceTimestamp: null,
        targetTimestamp: mockDate2,
        timeDifference: null
      });
    });

    it('should return TARGET_MISSING when target is null', () => {
      const result = ContextComparison.compare(mockSourceContext, null);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.TARGET_MISSING,
        sourceTimestamp: mockDate1,
        targetTimestamp: null,
        timeDifference: null
      });
    });

    it('should return TARGET_MISSING when target is undefined', () => {
      const result = ContextComparison.compare(mockSourceContext, undefined);

      expect(result).toEqual({
        result: ContextComparison.COMPARISON_RESULTS.TARGET_MISSING,
        sourceTimestamp: mockDate1,
        targetTimestamp: null,
        timeDifference: null
      });
    });

    it('should return TARGET_NEWER when target has newer modifiedAt', () => {
      const result = ContextComparison.compare(mockSourceContext, mockTargetContext);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.TARGET_NEWER);
      expect(result.sourceTimestamp).toBe(mockDate1);
      expect(result.targetTimestamp).toBe(mockDate2);
      expect(result.timeDifference).toBe(mockDate1.getTime() - mockDate2.getTime());
      expect(result.timeDifference).toBeLessThan(0);
    });

    it('should return SOURCE_NEWER when source has newer modifiedAt', () => {
      mockSourceContext.modifiedAt = mockDate2;
      mockTargetContext.modifiedAt = mockDate1;

      const result = ContextComparison.compare(mockSourceContext, mockTargetContext);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER);
      expect(result.sourceTimestamp).toBe(mockDate2);
      expect(result.targetTimestamp).toBe(mockDate1);
      expect(result.timeDifference).toBe(mockDate2.getTime() - mockDate1.getTime());
      expect(result.timeDifference).toBeGreaterThan(0);
    });

    it('should return EQUAL when timestamps are identical', () => {
      mockSourceContext.modifiedAt = mockDate3; // Same as mockDate1
      mockTargetContext.modifiedAt = mockDate1;

      const result = ContextComparison.compare(mockSourceContext, mockTargetContext);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.EQUAL);
      expect(result.sourceTimestamp).toBe(mockDate3);
      expect(result.targetTimestamp).toBe(mockDate1);
      expect(result.timeDifference).toBe(0);
    });

    it('should use default compareBy option (modifiedAt)', () => {
      const result = ContextComparison.compare(mockSourceContext, mockTargetContext);

      expect(result.sourceTimestamp).toBe(mockSourceContext.modifiedAt);
      expect(result.targetTimestamp).toBe(mockTargetContext.modifiedAt);
    });

    it('should use custom compareBy option', () => {
      const result = ContextComparison.compare(
        mockSourceContext,
        mockTargetContext,
        { compareBy: 'createdAt' }
      );

      expect(result.sourceTimestamp).toBe(mockSourceContext.createdAt);
      expect(result.targetTimestamp).toBe(mockTargetContext.createdAt);
    });

    it('should handle empty options object', () => {
      const result = ContextComparison.compare(mockSourceContext, mockTargetContext, {});

      expect(result.sourceTimestamp).toBe(mockSourceContext.modifiedAt);
      expect(result.targetTimestamp).toBe(mockTargetContext.modifiedAt);
    });

    it('should work with Context-like objects', () => {
      const contextA = { modifiedAt: mockDate1, id: 'context-a' };
      const contextB = { modifiedAt: mockDate2, id: 'context-b' };

      const result = ContextComparison.compare(contextA, contextB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.TARGET_NEWER);
      expect(result.sourceTimestamp).toBe(mockDate1);
      expect(result.targetTimestamp).toBe(mockDate2);
    });

    it('should work with ContextContainer-like objects', () => {
      const containerA = { modifiedAt: mockDate2, name: 'container-a' };
      const containerB = { modifiedAt: mockDate1, name: 'container-b' };

      const result = ContextComparison.compare(containerA, containerB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER);
      expect(result.sourceTimestamp).toBe(mockDate2);
      expect(result.targetTimestamp).toBe(mockDate1);
    });

    it('should work with ContextItem-like objects', () => {
      const itemA = { modifiedAt: mockDate1, key: 'item-a' };
      const itemB = { modifiedAt: mockDate1, key: 'item-b' };

      const result = ContextComparison.compare(itemA, itemB);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.EQUAL);
      expect(result.sourceTimestamp).toBe(mockDate1);
      expect(result.targetTimestamp).toBe(mockDate1);
    });

    it('should handle millisecond precision in time differences', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:00.001Z'); // 1ms difference

      const sourceContext = { modifiedAt: date1 };
      const targetContext = { modifiedAt: date2 };

      const result = ContextComparison.compare(sourceContext, targetContext);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.TARGET_NEWER);
      expect(result.timeDifference).toBe(-1);
    });

    it('should handle large time differences', () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:00.000Z');

      const sourceContext = { modifiedAt: date2 };
      const targetContext = { modifiedAt: date1 };

      const result = ContextComparison.compare(sourceContext, targetContext);

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER);
      expect(result.timeDifference).toBeGreaterThan(0);
      expect(result.timeDifference).toBe(date2.getTime() - date1.getTime());
    });

    it('should handle custom timestamp properties', () => {
      const sourceContext = { customTimestamp: mockDate2 };
      const targetContext = { customTimestamp: mockDate1 };

      const result = ContextComparison.compare(
        sourceContext,
        targetContext,
        { compareBy: 'customTimestamp' }
      );

      expect(result.result).toBe(ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER);
      expect(result.sourceTimestamp).toBe(mockDate2);
      expect(result.targetTimestamp).toBe(mockDate1);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with missing timestamp properties gracefully', () => {
      const sourceContext = {};
      const targetContext = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(sourceContext, targetContext);
      }).toThrow();
    });

    it('should handle invalid timestamp values', () => {
      const sourceContext = { modifiedAt: 'invalid-date' };
      const targetContext = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(sourceContext, targetContext);
      }).toThrow();
    });

    it('should handle null timestamp values', () => {
      const sourceContext = { modifiedAt: null };
      const targetContext = { modifiedAt: mockDate1 };

      expect(() => {
        ContextComparison.compare(sourceContext, targetContext);
      }).toThrow();
    });
  });
});