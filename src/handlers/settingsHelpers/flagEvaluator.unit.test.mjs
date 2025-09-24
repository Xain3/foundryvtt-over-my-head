/**
 * @file flagEvaluator.unit.test.js
 * @description Unit tests for FlagEvaluator class
 * @path src/handlers/settingsHelpers/flagEvaluator.unit.test.js
 */

import FlagEvaluator from './flagEvaluator.mjs';

describe('FlagEvaluator', () => {
  let testContext;
  let contextMapping;

  beforeEach(() => {
    testContext = {
      manifest: {
        debugMode: true,
        dev: false,
        id: 'test-module'
      },
      constants: {
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

    // Default context mapping configuration for tests
    contextMapping = {
      game: {
        globalPath: "globalThis.game",
        pathAdjustment: "removePrefix"
      },
      user: {
        globalPath: "globalThis.game.user",
        pathAdjustment: "removePrefix"
      },
      world: {
        globalPath: "globalThis.game.world",
        pathAdjustment: "removePrefix"
      },
      manifest: {
        globalPath: "config.manifest",
        pathAdjustment: "removePrefix"
      },
      constants: {
        globalPath: "config.constants",
        pathAdjustment: "removePrefix"
      },
      config: {
        globalPath: "config",
        pathAdjustment: "keepFull"
      },
      defaults: {
        globalPath: "config",
        pathAdjustment: "keepFull"
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

      describe('Combined AND + OR operators', () => {
        it('should return true when both AND and OR conditions are true', () => {
          const combinedFlag = {
            and: ['manifest.debugMode', 'flags.feature'], // both true
            or: ['manifest.debugMode', 'manifest.dev']    // at least one true
          };
          expect(FlagEvaluator.evaluate(combinedFlag, testContext)).toBe(true);
        });

        it('should return false when AND is true but OR is false', () => {
          const combinedFlag = {
            and: ['manifest.debugMode', 'flags.feature'], // both true
            or: ['manifest.dev', 'flags.enabled']         // both false
          };
          expect(FlagEvaluator.evaluate(combinedFlag, testContext)).toBe(false);
        });

        it('should return false when OR is true but AND is false', () => {
          const combinedFlag = {
            and: ['manifest.debugMode', 'manifest.dev'],  // one false
            or: ['manifest.debugMode', 'flags.feature']   // at least one true
          };
          expect(FlagEvaluator.evaluate(combinedFlag, testContext)).toBe(false);
        });

        it('should return false when both AND and OR conditions are false', () => {
          const combinedFlag = {
            and: ['manifest.dev', 'flags.enabled'],       // both false
            or: ['manifest.dev', 'flags.enabled']         // both false
          };
          expect(FlagEvaluator.evaluate(combinedFlag, testContext)).toBe(false);
        });

        it('should handle complex nested conditions', () => {
          // Mock globalThis.game for context resolution
          const originalGame = globalThis.game;
          globalThis.game = {
            user: {
              isAdmin: true,
              isDeveloper: false
            }
          };

          const complexContext = {
            ...testContext,
            features: {
              advanced: true,
              experimental: false
            }
          };

          const combinedFlag = {
            and: ['manifest.debugMode', 'features.advanced'], // all true
            or: ['features.experimental', 'user.isDeveloper']                 // both false (user.isDeveloper = false)
          };
          expect(FlagEvaluator.evaluate(combinedFlag, complexContext)).toBe(false);

          const combinedFlag2 = {
            and: ['manifest.debugMode', 'features.advanced'], // both true
            or: ['features.experimental', 'user.isAdmin']     // at least one true (user.isAdmin = true)
          };
          expect(FlagEvaluator.evaluate(combinedFlag2, complexContext)).toBe(true);

          // Restore original globalThis.game
          globalThis.game = originalGame;
        });

        it('should handle empty arrays in combined conditions', () => {
          const combinedFlag1 = {
            and: [],                                    // empty array (true)
            or: ['manifest.debugMode']                  // true
          };
          expect(FlagEvaluator.evaluate(combinedFlag1, testContext)).toBe(true);

          const combinedFlag2 = {
            and: ['manifest.debugMode'],                // true
            or: []                                      // empty array (false)
          };
          expect(FlagEvaluator.evaluate(combinedFlag2, testContext)).toBe(false);

          const combinedFlag3 = {
            and: [],                                    // empty array (true)
            or: []                                      // empty array (false)
          };
          expect(FlagEvaluator.evaluate(combinedFlag3, testContext)).toBe(false);
        });

        it('should handle invalid array values in combined conditions', () => {
          const combinedFlag1 = {
            and: 'manifest.debugMode',                  // invalid (false)
            or: ['manifest.debugMode']                  // true
          };
          expect(FlagEvaluator.evaluate(combinedFlag1, testContext)).toBe(false);

          const combinedFlag2 = {
            and: ['manifest.debugMode'],                // true
            or: 'manifest.debugMode'                    // invalid (false)
          };
          expect(FlagEvaluator.evaluate(combinedFlag2, testContext)).toBe(false);
        });
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

      it('should handle combined AND + OR conditions in showOnlyIfFlag', () => {
        const combinedShowFlag = {
          and: ['manifest.debugMode', 'flags.feature'], // both true
          or: ['manifest.debugMode', 'manifest.dev']    // at least one true
        };
        expect(FlagEvaluator.shouldShow(combinedShowFlag, null, testContext)).toBe(true);

        const combinedShowFlagFalse = {
          and: ['manifest.debugMode', 'flags.feature'], // both true
          or: ['manifest.dev', 'flags.enabled']         // both false
        };
        expect(FlagEvaluator.shouldShow(combinedShowFlagFalse, null, testContext)).toBe(false);
      });

      it('should handle combined AND + OR conditions in dontShowIfFlag', () => {
        const combinedDontShowFlag = {
          and: ['manifest.debugMode', 'flags.feature'], // both true
          or: ['manifest.debugMode', 'manifest.dev']    // at least one true
        };
        expect(FlagEvaluator.shouldShow(null, combinedDontShowFlag, testContext)).toBe(false);

        const combinedDontShowFlagFalse = {
          and: ['manifest.debugMode', 'flags.feature'], // both true
          or: ['manifest.dev', 'flags.enabled']         // both false
        };
        expect(FlagEvaluator.shouldShow(null, combinedDontShowFlagFalse, testContext)).toBe(true);
      });

      it('should handle complex real-world combined flag scenarios', () => {
        // Scenario: Show setting only in debug mode AND when user is admin, 
        // OR when in development mode
        const complexShowFlag = {
          and: ['manifest.debugMode', 'config.someFlag'], // debug + admin
          or: ['manifest.dev']                             // or dev mode
        };
        
        // Current context: debugMode=true, someFlag=true, dev=false
        // AND: true && true = true, OR: false = false
        // Combined: true && false = false
        expect(FlagEvaluator.shouldShow(complexShowFlag, null, testContext)).toBe(false);

        // Update context to make OR condition true
        const devContext = {
          ...testContext,
          manifest: { ...testContext.manifest, dev: true }
        };
        // AND: true && true = true, OR: true = true
        // Combined: true && true = true
        expect(FlagEvaluator.shouldShow(complexShowFlag, null, devContext)).toBe(true);
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

    describe('multi-context support', () => {
      let originalGame;

      beforeEach(() => {
        originalGame = globalThis.game;
        globalThis.game = {
          user: {
            isAdmin: true,
            isGM: false,
            name: 'testuser'
          },
          version: '10.0.0',
          world: {
            id: 'test-world',
            title: 'Test World',
            system: 'dnd5e'
          },
          settings: {
            get: () => 'test'
          }
        };
      });

      afterEach(() => {
        globalThis.game = originalGame;
      });

      it('should resolve game.* paths to globalThis.game', () => {
        expect(FlagEvaluator.evaluate('game.version', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('game.nonexistent', testContext)).toBe(false);
      });

      it('should resolve user.* paths to globalThis.game.user', () => {
        expect(FlagEvaluator.evaluate('user.isAdmin', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('user.isGM', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('user.name', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('user.nonexistent', testContext)).toBe(false);
      });

      it('should resolve world.* paths to globalThis.game.world', () => {
        expect(FlagEvaluator.evaluate('world.id', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('world.title', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('world.system', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('world.nonexistent', testContext)).toBe(false);
      });

      it('should resolve constants.* paths to config.manifest (same as manifest.*)', () => {
        expect(FlagEvaluator.evaluate('constants.debugMode', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('constants.dev', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('constants.id', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('constants.nonexistent', testContext)).toBe(false);
      });

      it('should handle mixed contexts in OR conditions', () => {
        const flag = {
          or: ['manifest.dev', 'user.isAdmin'] // false, true
        };
        expect(FlagEvaluator.evaluate(flag, testContext)).toBe(true);
      });

      it('should handle mixed contexts in AND conditions', () => {
        const flag = {
          and: ['manifest.debugMode', 'user.isAdmin'] // true, true
        };
        expect(FlagEvaluator.evaluate(flag, testContext)).toBe(true);

        const flag2 = {
          and: ['manifest.dev', 'user.isAdmin'] // false, true
        };
        expect(FlagEvaluator.evaluate(flag2, testContext)).toBe(false);
      });

      it('should handle mixed contexts in combined AND + OR conditions', () => {
        const flag = {
          and: ['manifest.debugMode', 'user.isAdmin'], // both true
          or: ['manifest.dev', 'user.isGM'] // both false
        };
        expect(FlagEvaluator.evaluate(flag, testContext)).toBe(false);

        const flag2 = {
          and: ['manifest.debugMode'], // true
          or: ['user.isAdmin'] // true
        };
        expect(FlagEvaluator.evaluate(flag2, testContext)).toBe(true);
      });

      it('should handle mixed contexts including constants and world', () => {
        const flag = {
          or: ['constants.debugMode', 'world.id', 'user.isGM'] // true, true, false
        };
        expect(FlagEvaluator.evaluate(flag, testContext)).toBe(true);

        const flag2 = {
          and: ['world.system', 'constants.dev'] // true, false
        };
        expect(FlagEvaluator.evaluate(flag2, testContext)).toBe(false);
      });

      it('should gracefully handle missing globalThis.game', () => {
        globalThis.game = null;
        expect(FlagEvaluator.evaluate('user.isAdmin', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('game.version', testContext)).toBe(false);
      });

      it('should gracefully handle missing globalThis.game.user', () => {
        globalThis.game = { version: '10.0.0' }; // no user property
        expect(FlagEvaluator.evaluate('user.isAdmin', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('game.version', testContext)).toBe(true);
      });

      it('should gracefully handle missing globalThis.game.world', () => {
        globalThis.game = { version: '10.0.0', user: { isAdmin: true } }; // no world property
        expect(FlagEvaluator.evaluate('world.id', testContext)).toBe(false);
        expect(FlagEvaluator.evaluate('game.version', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('user.isAdmin', testContext)).toBe(true);
      });

      it('should work in shouldShow with mixed contexts', () => {
        const showFlag = {
          or: ['manifest.debugMode', 'user.isAdmin'] // both true
        };
        const dontShowFlag = {
          and: ['manifest.dev', 'user.isGM'] // both false
        };
        expect(FlagEvaluator.shouldShow(showFlag, dontShowFlag, testContext)).toBe(true);

        const showFlag2 = {
          and: ['manifest.dev', 'user.isAdmin'] // false, true = false
        };
        expect(FlagEvaluator.shouldShow(showFlag2, null, testContext)).toBe(false);
      });
    });

    describe('configurable context mapping', () => {
      let customContextMapping;

      beforeEach(() => {
        // Create a custom context mapping for testing
        customContextMapping = {
          // Custom prefix mapping to different context
          customPrefix: {
            globalPath: "config",
            pathAdjustment: "removePrefix"
          },
          // Override existing mapping
          manifest: {
            globalPath: "config",
            pathAdjustment: "mapToManifest"  // Different from default
          },
          // New path adjustment strategy
          prefixMap: {
            globalPath: "config",
            pathAdjustment: "customMapping"
          },
          defaults: {
            globalPath: "config",
            pathAdjustment: "keepFull"
          }
        };
      });

      it('should use custom context mapping when provided', () => {
        // Test custom prefix
        testContext.someFlag = true;
        expect(FlagEvaluator.evaluate('customPrefix.someFlag', testContext, customContextMapping)).toBe(true);
      });

      it('should override default mappings with custom ones', () => {
        // With custom mapping, manifest.* should map to manifest.manifest.*
        // This tests the pathAdjustment override
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext, customContextMapping)).toBe(true);
      });

      it('should fallback to defaults when prefix not found in custom mapping', () => {
        // unknownPrefix should use defaults (keepFull, config context)
        testContext.unknownPrefix = { test: true };
        expect(FlagEvaluator.evaluate('unknownPrefix.test', testContext, customContextMapping)).toBe(true);
      });

      it('should work with logical operators and custom mapping', () => {
        testContext.customValue = true;
        testContext.anotherValue = false;
        
        const orFlag = { 
          or: ['customPrefix.customValue', 'customPrefix.anotherValue'] 
        };
        expect(FlagEvaluator.evaluate(orFlag, testContext, customContextMapping)).toBe(true);

        const andFlag = { 
          and: ['customPrefix.customValue', 'customPrefix.anotherValue'] 
        };
        expect(FlagEvaluator.evaluate(andFlag, testContext, customContextMapping)).toBe(false);
      });

      it('should work with shouldShow and custom mapping', () => {
        testContext.showFlag = true;
        testContext.hideFlag = false;

        expect(FlagEvaluator.shouldShow(
          'customPrefix.showFlag', 
          'customPrefix.hideFlag', 
          testContext, 
          customContextMapping
        )).toBe(true);

        expect(FlagEvaluator.shouldShow(
          'customPrefix.hideFlag', 
          null, 
          testContext, 
          customContextMapping
        )).toBe(false);
      });

      it('should handle path adjustment strategies correctly', () => {
        // Test removePrefix strategy
        testContext.nested = { value: true };
        expect(FlagEvaluator.evaluate('customPrefix.nested.value', testContext, customContextMapping)).toBe(true);
        
        // Test mapToManifest strategy with overridden manifest mapping
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext, customContextMapping)).toBe(true);
      });

      it('should gracefully handle invalid custom mappings', () => {
        const invalidMapping = {
          badMapping: {
            // Missing required properties
          },
          defaults: {
            globalPath: "config",
            pathAdjustment: "keepFull"
          }
        };

        // Should fallback gracefully
        expect(FlagEvaluator.evaluate('badMapping.test', testContext, invalidMapping)).toBe(false);
      });

      it('should preserve backward compatibility when no custom mapping provided', () => {
        // These should work exactly as before
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext)).toBe(true);
        expect(FlagEvaluator.evaluate('constants.debugMode', testContext)).toBe(true);
        expect(FlagEvaluator.shouldShow('manifest.debugMode', null, testContext)).toBe(true);
      });

      it('should handle empty or null custom mapping gracefully', () => {
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext, null)).toBe(true);
        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext, {})).toBe(true);
        expect(FlagEvaluator.shouldShow('manifest.debugMode', null, testContext, null)).toBe(true);
      });
    });

    describe('integration with constants.yaml structure', () => {
      let constantsLikeMapping;

      beforeEach(() => {
        // Simulate the structure that would come from constants.yaml
        constantsLikeMapping = {
          contextMapping: {
            game: {
              globalPath: "globalThis.game",
              pathAdjustment: "removePrefix",
              description: "Global Foundry game object"
            },
            user: {
              globalPath: "globalThis.game.user",
              pathAdjustment: "removePrefix",
              description: "Current user object"
            },
            world: {
              globalPath: "globalThis.game.world",
              pathAdjustment: "removePrefix",
              description: "Foundry world object"
            },
            manifest: {
              globalPath: "config",
              pathAdjustment: "keepFull",
              description: "Module manifest data"
            },
            constants: {
              globalPath: "config",
              pathAdjustment: "mapToManifest",
              description: "Module constants (same as manifest, for backward compatibility)"
            },
            config: {
              globalPath: "config",
              pathAdjustment: "keepFull",
              description: "Module configuration object"
            }
          },
          defaults: {
            globalPath: "config",
            pathAdjustment: "keepFull",
            description: "Default fallback context for backward compatibility"
          }
        };
      });

      it('should work with nested contextMapping structure from constants', () => {
        // Extract the contextMapping part as would be done in real usage
        const mapping = constantsLikeMapping.contextMapping;
        mapping.defaults = constantsLikeMapping.defaults;

        expect(FlagEvaluator.evaluate('manifest.debugMode', testContext, mapping)).toBe(true);
        expect(FlagEvaluator.evaluate('constants.debugMode', testContext, mapping)).toBe(true);
        expect(FlagEvaluator.shouldShow('manifest.debugMode', null, testContext, mapping)).toBe(true);
      });

      it('should ignore description fields and work with configuration data', () => {
        const mapping = constantsLikeMapping.contextMapping;
        mapping.defaults = constantsLikeMapping.defaults;

        // The presence of description fields shouldn't affect functionality
        expect(FlagEvaluator.evaluate('config.someFlag', testContext, mapping)).toBe(true);
      });
    });
  });
});