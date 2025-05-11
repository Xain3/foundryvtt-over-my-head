import InclusionChecks from './inclusionChecks';

describe('InclusionChecks', () => {
  describe('checkArrayContents', () => {
    it('returns allFound true and empty missing when all values are present', () => {
      const arr = [1, 2, 3];
      const valuesToCheck = [1, 2];
      expect(InclusionChecks.checkArrayContents(arr, valuesToCheck)).toEqual({ allFound: true, missing: [] });
    });

    it('returns allFound false and missing values when some values are absent', () => {
      const arr = [1, 2];
      const valuesToCheck = [1, 3];
      expect(InclusionChecks.checkArrayContents(arr, valuesToCheck)).toEqual({ allFound: false, missing: ['3'] });
    });

    it('returns allFound true for empty valuesToCheck', () => {
      expect(InclusionChecks.checkArrayContents([1, 2], [])).toEqual({ allFound: true, missing: [] });
    });
  });

  describe('checkObjectKeyContents', () => {
    it('returns allFound true and empty missing when all keys are present', () => {
      const obj = { a: 1, b: 2 };
      const keysToCheck = ['a'];
      expect(InclusionChecks.checkObjectKeyContents(obj, keysToCheck)).toEqual({ allFound: true, missing: [] });
    });

    it('returns allFound false and missing keys when some keys are absent', () => {
      const obj = { a: 1 };
      const keysToCheck = ['a', 'b'];
      expect(InclusionChecks.checkObjectKeyContents(obj, keysToCheck)).toEqual({ allFound: false, missing: ['b'] });
    });

    it('returns allFound true for empty keysToCheck', () => {
      expect(InclusionChecks.checkObjectKeyContents({ a: 1 }, [])).toEqual({ allFound: true, missing: [] });
    });
  });

  describe('checkObjectValueContents', () => {
    it('returns allFound true and empty missing when all values are present', () => {
      const obj = { a: 1, b: 2 };
      const valuesToCheck = [1];
      expect(InclusionChecks.checkObjectValueContents(obj, valuesToCheck)).toEqual({ allFound: true, missing: [] });
    });

    it('returns allFound false and missing values when some values are absent', () => {
      const obj = { a: 1 };
      const valuesToCheck = [1, 2];
      expect(InclusionChecks.checkObjectValueContents(obj, valuesToCheck)).toEqual({ allFound: false, missing: ['2'] });
    });

    it('returns allFound true for empty valuesToCheck', () => {
      expect(InclusionChecks.checkObjectValueContents({ a: 1 }, [])).toEqual({ allFound: true, missing: [] });
    });
  });

  describe('objectIncludes', () => {
    it('returns true when all keys are present', () => {
      expect(InclusionChecks.objectIncludes({ a: 1, b: 2 }, ['a', 'b'])).toBeTruthy();
    });

    it('returns false when some keys are missing', () => {
      expect(InclusionChecks.objectIncludes({ a: 1 }, ['a', 'b'])).toBeFalsy();
    });

    it('returns true when all values are present (checkType=values)', () => {
      expect(InclusionChecks.objectIncludes({ a: 1, b: 2 }, [1, 2], 'values')).toBeTruthy();
    });

    it('returns false when some values are missing (checkType=values)', () => {
      expect(InclusionChecks.objectIncludes({ a: 1 }, [1, 2], 'values')).toBeFalsy();
    });

    it('throws when obj is not a valid object', () => {
      expect(() => InclusionChecks.objectIncludes(null, ['a'])).toThrow();
      expect(() => InclusionChecks.objectIncludes([], ['a'])).toThrow();
      expect(() => InclusionChecks.objectIncludes(123, ['a'])).toThrow();
    });

    it('throws when items is not an array', () => {
      expect(() => InclusionChecks.objectIncludes({ a: 1 }, 'a')).toThrow();
      expect(() => InclusionChecks.objectIncludes({ a: 1 }, null)).toThrow();
    });

    it('returns error (not throw) for invalid checkType', () => {
      // Should not throw, but return false (default behaviour)
      expect(InclusionChecks.objectIncludes({ a: 1 }, ['a'], 'invalidType').outcome).toBe(false);
    });
  });

  describe('arrayIncludes', () => {
    it('returns true when all values are present', () => {
      expect(InclusionChecks.arrayIncludes([1, 2, 3], [1, 2])).toBeTruthy();
    });

    it('returns false when some values are missing', () => {
      expect(InclusionChecks.arrayIncludes([1, 2], [1, 3])).toBeFalsy();
    });

    it('throws when arr is not an array', () => {
      expect(() => InclusionChecks.arrayIncludes(null, [1])).toThrow();
      expect(() => InclusionChecks.arrayIncludes({}, [1])).toThrow();
      expect(() => InclusionChecks.arrayIncludes(123, [1])).toThrow();
    });

    it('throws when valuesToCheck is not an array', () => {
      expect(() => InclusionChecks.arrayIncludes([1, 2], 1)).toThrow();
      expect(() => InclusionChecks.arrayIncludes([1, 2], null)).toThrow();
    });
  });
});