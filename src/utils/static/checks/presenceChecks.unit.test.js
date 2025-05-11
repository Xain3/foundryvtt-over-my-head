import PresenceChecks from './presenceChecks';

describe('PresenceChecks', () => {
  describe('isDefined', () => {
    it('returns false for undefined', () => {
      expect(PresenceChecks.isDefined(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(PresenceChecks.isDefined(null)).toBe(false);
    });

    it('returns true for 0', () => {
      expect(PresenceChecks.isDefined(0)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(PresenceChecks.isDefined('')).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(PresenceChecks.isDefined([])).toBe(true);
    });

    it('returns true for empty object', () => {
      expect(PresenceChecks.isDefined({})).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('returns true for undefined (default considerUndefinedAsEmpty)', () => {
      expect(PresenceChecks.isEmpty(undefined)).toBe(true);
    });

    it('returns true for null (default considerUndefinedAsEmpty)', () => {
      expect(PresenceChecks.isEmpty(null)).toBe(true);
    });

    it('returns false for undefined if considerUndefinedAsEmpty is false', () => {
      expect(PresenceChecks.isEmpty(undefined, false)).toBe(false);
    });

    it('returns true for empty string', () => {
      expect(PresenceChecks.isEmpty('')).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(PresenceChecks.isEmpty('abc')).toBe(false);
    });

    it('returns true for empty array', () => {
      expect(PresenceChecks.isEmpty([])).toBe(true);
    });

    it('returns false for non-empty array', () => {
      expect(PresenceChecks.isEmpty([1, 2, 3])).toBe(false);
    });

    it('returns true for empty object', () => {
      expect(PresenceChecks.isEmpty({})).toBe(true);
    });

    it('returns false for non-empty object', () => {
      expect(PresenceChecks.isEmpty({ a: 1 })).toBe(false);
    });

    it('returns false for number 0', () => {
      expect(PresenceChecks.isEmpty(0)).toBe(false);
    });

    it('returns false for boolean false', () => {
      expect(PresenceChecks.isEmpty(false)).toBe(false);
    });

    it('returns false for function', () => {
      expect(PresenceChecks.isEmpty(() => {})).toBe(false);
    });

    it('returns false for class instance', () => {
      class MyClass {}
      expect(PresenceChecks.isEmpty(new MyClass())).toBe(false);
    });
  });

  describe('isDefinedAndNotEmpty', () => {
    it('returns false for undefined', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty(null)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty('')).toBe(false);
    });

    it('returns true for non-empty string', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty('abc')).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty([])).toBe(false);
    });

    it('returns true for non-empty array', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty([1])).toBe(true);
    });

    it('returns false for empty object', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty({})).toBe(false);
    });

    it('returns true for non-empty object', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty({ a: 1 })).toBe(true);
    });

    it('returns true for 0', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty(0)).toBe(true);
    });

    it('returns true for false', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty(false)).toBe(true);
    });

    it('returns true for function', () => {
      expect(PresenceChecks.isDefinedAndNotEmpty(() => {})).toBe(true);
    });

    it('returns true for class instance', () => {
      class MyClass {}
      expect(PresenceChecks.isDefinedAndNotEmpty(new MyClass())).toBe(true);
    });
  });
});