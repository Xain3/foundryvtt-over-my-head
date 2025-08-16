/**
 * @file flagEvaluator.unit.test.js
 * @description Unit tests for FlagEvaluator class
 * @path src/handlers/settingsHelpers/flagEvaluator.unit.test.js
 */

import FlagEvaluator from './flagEvaluator.js';

describe('FlagEvaluator', () => {
  let testContext;

  beforeEach(() => {
    testContext = {
      manifest: {
        debugMode: true,
        dev: false,
        id: 'test-module'
      },
      config: {
        someFlag: true,
        nested: {
          deep: {
            value: true
          }
        }
      },
      flags: {
        enabled: false,
        feature: true
      }
    };
  });

  describe('evaluate', () => {
    describe('null and undefined flags', () => {
      it('should return true for null flags', () => {
        expect(FlagEvaluator.evaluate(null, testContext)).toBe(true);
      });

      it('should return true for undefined flags', () => {
        expect(FlagEvaluator.evaluate(undefined, testContext)).toBe(true);
      });
    });

    describe('string flags (simple paths)', () => {
      it('should evaluate simple property paths', () => {
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('manifest.dev', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('flags.enabled', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('flags.feature', testContext)).toBe(true);
      });

      it('should evaluate nested property paths', () => {
        expect(FlagEvaluator.evaluate('config.nested.deep.value', testContext)).toBe(true);
      });

      it('should return false for non-existent paths', () => {
        expect(FlagEvaluator.evaluate('manifest.nonExistent', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('nonExistent.path', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('config.nested.deep.nonExistent', testContext)).toBe(false);
      });

      it('should return false for invalid paths', () => {
        expect(FlagEvaluator.evaluate('', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('.', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('..', testContext)).toBe(false);
      });

      it('should handle falsy values correctly', () => {
        const contextWithFalsyValues = {
          test: {
            zero: 0,
            emptyString: '',
            falseValue: false,
            nullValue: null,
            undefinedValue: undefined
          }
        };

        expect(FlagEvaluator.evaluate('test.zero', contextWithFalsyValues)).toBe(false);
        expect(FlagEvaluator.evaluate('test.emptyString', contextWithFalsyValues)).toBe(false);
        expect(FlagEvaluator.evaluate('test.falseValue', contextWithFalsyValues)).toBe(false);
        expect(FlagEvaluator.evaluate('test.nullValue', contextWithFalsyValues)).toBe(false);
        expect(FlagEvaluator.evaluate('test.undefinedValue', contextWithFalsyValues)).toBe(false);
      });
    });

    describe('object flags with logical operators', () => {
      describe('OR operator', () => {
        it('should return true if any condition is true', () => {
          const orFlag = { or: ['manifest.debugMode', 'manifest.dev'] };
          expect(FlagEvaluator.evaluate(orFlag, testContext)).toBe(true);
        });

        it('should return false if all conditions are false', () => {
          const orFlag = { or: ['manifest.dev', 'flags.enabled'] };
          expect(FlagEvaluator.evaluate(orFlag, testContext)).toBe(false);
        });

        it('should return true if at least one condition is true', () => {
          const orFlag = { or: ['manifest.dev', 'flags.feature', 'flags.enabled'] };
          expect(FlagEvaluator.evaluate(orFlag, testContext)).toBe(true);
        });

        it('should handle empty or array', () => {
          const orFlag = { or: [] };
          expect(FlagEvaluator.evaluate(orFlag, testContext)).toBe(false);
        });

        it('should handle non-array or value', () => {
          const orFlag = { or: 'manifest.debugMode' };
          expect(FlagEvaluator.evaluate(orFlag, testContext)).toBe(false);
        });
      });

      describe('AND operator', () => {
        it('should return true if all conditions are true', () => {
          const andFlag = { and: ['manifest.debugMode', 'flags.feature'] };
          expect(FlagEvaluator.evaluate(andFlag, testContext)).toBe(true);
        });

        it('should return false if any condition is false', () => {
          const andFlag = { and: ['manifest.debugMode', 'manifest.dev'] };
          expect(FlagEvaluator.evaluate(andFlag, testContext)).toBe(false);
        });

        it('should return false if all conditions are false', () => {
          const andFlag = { and: ['manifest.dev', 'flags.enabled'] };
          expect(FlagEvaluator.evaluate(andFlag, testContext)).toBe(false);
        });

        it('should handle empty and array', () => {
          const andFlag = { and: [] };
          expect(FlagEvaluator.evaluate(andFlag, testContext)).toBe(true);
        });

        it('should handle non-array and value', () => {
          const andFlag = { and: 'manifest.debugMode' };
          expect(FlagEvaluator.evaluate(andFlag, testContext)).toBe(false);
        });
      });

      it('should return false for objects with unknown operators', () => {
        const unknownFlag = { unknown: ['manifest.debugMode'] };
        expect(FlagEvaluator.evaluate(unknownFlag, testContext)).toBe(false);
      });

      it('should return false for empty objects', () => {
        expect(FlagEvaluator.evaluate({}, testContext)).toBe(false);
      });
    });

    describe('invalid flag types', () => {
      it('should return false for numbers', () => {
        expect(FlagEvaluator.evaluate(123, testContext)).toBe(false);
        expect(FlagEvaluator.evaluate(0, testContext)).toBe(false);
      });

      it('should return false for booleans', () => {
        expect(FlagEvaluator.evaluate(true, testContext)).toBe(false);
        expect(FlagEvaluator.evaluate(false, testContext)).toBe(false);
      });

      it('should return false for arrays', () => {
        expect(FlagEvaluator.evaluate(['manifest.debugMode'], testContext)).toBe(false);
      });

      it('should return false for functions', () => {
        expect(FlagEvaluator.evaluate(() => true, testContext)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle missing context', () => {
        expect(FlagEvaluator.evaluate('manifest.debugMode', null)).toBe(false);
        expect(FlagEvaluator.evaluate('manifest.debugMode', undefined)).toBe(false);
        expect(FlagEvaluator.evaluate('manifest.debugMode', {})).toBe(false);
      });

      it('should handle context with null values in path', () => {
        const contextWithNull = {
          manifest: null
        };
        expect(FlagEvaluator.evaluate('manifest.debugMode', contextWithNull)).toBe(false);
      });
    });
  });

  describe('shouldShow', () => {
    it('should show setting when both flags are null', () => {
      expect(FlagEvaluator.shouldShow(null, null, testContext)).toBe(true);
    });

    it('should show setting when both flags are undefined', () => {
      expect(FlagEvaluator.shouldShow(undefined, undefined, testContext)).toBe(true);
    });

    describe('showOnlyIfFlag behavior', () => {
      it('should show setting when showOnlyIfFlag is true', () => {
        expect(FlagEvaluator.shouldShow('manifest.debugMode', null, testContext)).toBe(true);
      });

      it('should hide setting when showOnlyIfFlag is false', () => {
        expect(FlagEvaluator.shouldShow('manifest.dev', null, testContext)).toBe(false);
      });

      it('should work with complex OR conditions', () => {
        const showFlag = { or: ['manifest.debugMode', 'manifest.dev'] };
        expect(FlagEvaluator.shouldShow(showFlag, null, testContext)).toBe(true);
      });

      it('should work with complex AND conditions', () => {
        const showFlag = { and: ['manifest.debugMode', 'flags.feature'] };
        expect(FlagEvaluator.shouldShow(showFlag, null, testContext)).toBe(true);
        
        const showFlagFalse = { and: ['manifest.debugMode', 'manifest.dev'] };
        expect(FlagEvaluator.shouldShow(showFlagFalse, null, testContext)).toBe(false);
      });
    });

    describe('dontShowIfFlag behavior', () => {
      it('should show setting when dontShowIfFlag is false', () => {
        expect(FlagEvaluator.shouldShow(null, 'manifest.dev', testContext)).toBe(true);
      });

      it('should hide setting when dontShowIfFlag is true', () => {
        expect(FlagEvaluator.shouldShow(null, 'manifest.debugMode', testContext)).toBe(false);
      });

      it('should work with complex OR conditions', () => {
        const dontShowFlag = { or: ['manifest.dev', 'flags.enabled'] };
        expect(FlagEvaluator.shouldShow(null, dontShowFlag, testContext)).toBe(true);
        
        const dontShowFlagTrue = { or: ['manifest.debugMode', 'manifest.dev'] };
        expect(FlagEvaluator.shouldShow(null, dontShowFlagTrue, testContext)).toBe(false);
      });

      it('should work with complex AND conditions', () => {
        const dontShowFlag = { and: ['manifest.debugMode', 'manifest.dev'] };
        expect(FlagEvaluator.shouldShow(null, dontShowFlag, testContext)).toBe(true);
        
        const dontShowFlagTrue = { and: ['manifest.debugMode', 'flags.feature'] };
        expect(FlagEvaluator.shouldShow(null, dontShowFlagTrue, testContext)).toBe(false);
      });
    });

    describe('combined flag behavior', () => {
      it('should show when showOnlyIfFlag is true and dontShowIfFlag is false', () => {
        expect(FlagEvaluator.shouldShow('manifest.debugMode', 'manifest.dev', testContext)).toBe(true);
      });

      it('should hide when showOnlyIfFlag is false regardless of dontShowIfFlag', () => {
        expect(FlagEvaluator.shouldShow('manifest.dev', 'manifest.dev', testContext)).toBe(false);
        expect(FlagEvaluator.shouldShow('manifest.dev', 'flags.enabled', testContext)).toBe(false);
      });

      it('should hide when dontShowIfFlag is true regardless of showOnlyIfFlag', () => {
        expect(FlagEvaluator.shouldShow('manifest.debugMode', 'manifest.debugMode', testContext)).toBe(false);
        expect(FlagEvaluator.shouldShow('flags.feature', 'manifest.debugMode', testContext)).toBe(false);
      });

      it('should work with complex combinations', () => {
        const showFlag = { or: ['manifest.debugMode', 'manifest.dev'] };
        const dontShowFlag = { and: ['flags.enabled', 'manifest.dev'] };
        expect(FlagEvaluator.shouldShow(showFlag, dontShowFlag, testContext)).toBe(true);
      });
    });

    describe('real-world scenarios from constants.yaml', () => {
      it('should handle debugMode setting visibility', () => {
        // debugMode setting: showOnlyIfFlag: {or: ["manifest.debugMode", "manifest.dev"]}
        const showFlag = { or: ['manifest.debugMode', 'manifest.dev'] };
        
        // Should show when debugMode is true
        expect(FlagEvaluator.shouldShow(showFlag, null, testContext)).toBe(true);
        
        // Should not show when both are false
        const prodContext = {
          manifest: { debugMode: false, dev: false }
        };
        expect(FlagEvaluator.shouldShow(showFlag, null, prodContext)).toBe(false);
      });

      it('should handle settings with no flags (always show)', () => {
        // Most settings have both flags as null
        expect(FlagEvaluator.shouldShow(null, null, testContext)).toBe(true);
        expect(FlagEvaluator.shouldShow(undefined, undefined, testContext)).toBe(true);
      });
    });
  });
});