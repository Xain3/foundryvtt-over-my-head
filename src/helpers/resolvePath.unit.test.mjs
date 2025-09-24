/**
 * @file resolvePath.unit.test.mjs
 * @description Unit tests for the resolvePath helper function.
 * @path src/helpers/resolvePath.unit.test.mjs
 * @date 25 May 2025
 */

import PathUtils from './pathUtils.mjs';

describe('resolvePath', () => {
  let mockNamespace;

  beforeEach(() => {
    mockNamespace = {
      game: {
        settings: {
          get: jest.fn(),
          set: jest.fn(),
          register: jest.fn()
        },
        modules: new Map([
          ['test-module', { id: 'test-module', active: true }]
        ]),
        user: {
          id: 'user123',
          name: 'TestUser'
        }
      },
      ui: {
        notifications: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn()
        }
      },
      document: {
        getElementById: jest.fn()
      },
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn()
      },
      deeply: {
        nested: {
          property: {
            value: 'found'
          }
        }
      }
    };
  });

  describe('input validation', () => {
    it('should throw TypeError if namespace is not an object', () => {
      expect(() => PathUtils.resolvePath(null, 'test.path')).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(undefined, 'test.path')).toThrow(TypeError);
      expect(() => PathUtils.resolvePath('string', 'test.path')).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(123, 'test.path')).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(true, 'test.path')).toThrow(TypeError);
    });

    it('should throw TypeError if path is not a string', () => {
      expect(() => PathUtils.resolvePath(mockNamespace, null)).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(mockNamespace, undefined)).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(mockNamespace, 123)).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(mockNamespace, {})).toThrow(TypeError);
      expect(() => PathUtils.resolvePath(mockNamespace, [])).toThrow(TypeError);
    });

    it('should provide meaningful error messages', () => {
      expect(() => PathUtils.resolvePath(null, 'test.path')).toThrow('namespace must be an object');
      expect(() => PathUtils.resolvePath(mockNamespace, 123)).toThrow('path must be a string');
    });
  });

  describe('basic path resolution', () => {
    it('should return the namespace itself for empty path', () => {
      expect(PathUtils.resolvePath(mockNamespace, '')).toBe(mockNamespace);
      expect(PathUtils.resolvePath(mockNamespace, '   ')).toBe(mockNamespace);
    });

    it('should resolve single-level paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'game')).toBe(mockNamespace.game);
      expect(PathUtils.resolvePath(mockNamespace, 'ui')).toBe(mockNamespace.ui);
      expect(PathUtils.resolvePath(mockNamespace, 'document')).toBe(mockNamespace.document);
    });

    it('should resolve multi-level paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'game.settings')).toBe(mockNamespace.game.settings);
      expect(PathUtils.resolvePath(mockNamespace, 'ui.notifications')).toBe(mockNamespace.ui.notifications);
      expect(PathUtils.resolvePath(mockNamespace, 'game.user.id')).toBe('user123');
      expect(PathUtils.resolvePath(mockNamespace, 'game.user.name')).toBe('TestUser');
    });

    it('should resolve deeply nested paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'deeply.nested.property.value')).toBe('found');
    });

    it('should return undefined for non-existent paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'nonexistent')).toBeUndefined();
      expect(PathUtils.resolvePath(mockNamespace, 'game.nonexistent')).toBeUndefined();
      expect(PathUtils.resolvePath(mockNamespace, 'game.settings.nonexistent')).toBeUndefined();
      expect(PathUtils.resolvePath(mockNamespace, 'deeply.nested.nonexistent.value')).toBeUndefined();
    });

    it('should handle null/undefined intermediate values gracefully', () => {
      const namespaceWithNulls = {
        valid: {
          nullProp: null,
          undefinedProp: undefined
        }
      };

      expect(PathUtils.resolvePath(namespaceWithNulls, 'valid.nullProp.something')).toBeUndefined();
      expect(PathUtils.resolvePath(namespaceWithNulls, 'valid.undefinedProp.something')).toBeUndefined();
    });
  });

  describe('getter fallback functionality', () => {
    it('should use getter method when property does not exist normally', () => {
      const mockGetter = jest.fn().mockReturnValue('getter-value');
      const objWithGetter = {
        get: mockGetter,
        normalProp: 'normal-value'
      };
      mockNamespace.withGetter = objWithGetter;

      // Normal property access should work without calling getter
      expect(PathUtils.resolvePath(mockNamespace, 'withGetter.normalProp')).toBe('normal-value');
      expect(mockGetter).not.toHaveBeenCalled();

      // Non-existent property should use getter
      expect(PathUtils.resolvePath(mockNamespace, 'withGetter.nonExistentProp')).toBe('getter-value');
      expect(mockGetter).toHaveBeenCalledWith('nonExistentProp');
    });

    it('should work with Map objects', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'game.modules.test-module')).toEqual({
        id: 'test-module',
        active: true
      });
    });

    it('should disable getter fallback when useGetterFallback is false', () => {
      const mockGetter = jest.fn().mockReturnValue('getter-value');
      const objWithGetter = {
        get: mockGetter,
        normalProp: 'normal-value'
      };
      mockNamespace.withGetter = objWithGetter;

      expect(PathUtils.resolvePath(mockNamespace, 'withGetter.nonExistentProp', false)).toBeUndefined();
      expect(mockGetter).not.toHaveBeenCalled();
    });

    it('should handle objects without getter method gracefully', () => {
      const objWithoutGetter = {
        normalProp: 'normal-value'
      };
      mockNamespace.withoutGetter = objWithoutGetter;

      expect(PathUtils.resolvePath(mockNamespace, 'withoutGetter.nonExistentProp')).toBeUndefined();
    });

    it('should prefer normal property access over getter', () => {
      const mockGetter = jest.fn().mockReturnValue('getter-value');
      const objWithBoth = {
        get: mockGetter,
        existingProp: 'existing-value'
      };
      mockNamespace.withBoth = objWithBoth;

      expect(PathUtils.resolvePath(mockNamespace, 'withBoth.existingProp')).toBe('existing-value');
      expect(mockGetter).not.toHaveBeenCalled();
    });

    it('should handle getter that returns undefined', () => {
      const mockGetter = jest.fn().mockReturnValue(undefined);
      const objWithGetter = {
        get: mockGetter
      };
      mockNamespace.withGetter = objWithGetter;

      expect(PathUtils.resolvePath(mockNamespace, 'withGetter.nonExistentProp')).toBeUndefined();
      expect(mockGetter).toHaveBeenCalledWith('nonExistentProp');
    });
  });

  describe('edge cases', () => {
    it('should handle properties with falsy values', () => {
      const namespaceFalsy = {
        zero: 0,
        false: false,
        empty: '',
        nested: {
          zero: 0,
          false: false,
          empty: ''
        }
      };

      expect(PathUtils.resolvePath(namespaceFalsy, 'zero')).toBe(0);
      expect(PathUtils.resolvePath(namespaceFalsy, 'false')).toBe(false);
      expect(PathUtils.resolvePath(namespaceFalsy, 'empty')).toBe('');
      expect(PathUtils.resolvePath(namespaceFalsy, 'nested.zero')).toBe(0);
      expect(PathUtils.resolvePath(namespaceFalsy, 'nested.false')).toBe(false);
      expect(PathUtils.resolvePath(namespaceFalsy, 'nested.empty')).toBe('');
    });

    it('should handle numeric property names', () => {
      const namespaceNumeric = {
        '0': 'zero',
        '123': 'one-two-three',
        nested: {
          '456': 'four-five-six'
        }
      };

      expect(PathUtils.resolvePath(namespaceNumeric, '0')).toBe('zero');
      expect(PathUtils.resolvePath(namespaceNumeric, '123')).toBe('one-two-three');
      expect(PathUtils.resolvePath(namespaceNumeric, 'nested.456')).toBe('four-five-six');
    });

    it('should handle special characters in property names', () => {
      const namespaceSpecial = {
        'prop-with-dash': 'dash-value',
        'prop_with_underscore': 'underscore-value',
        '$pecial': 'special-value'
      };

      expect(PathUtils.resolvePath(namespaceSpecial, 'prop-with-dash')).toBe('dash-value');
      expect(PathUtils.resolvePath(namespaceSpecial, 'prop_with_underscore')).toBe('underscore-value');
      expect(PathUtils.resolvePath(namespaceSpecial, '$pecial')).toBe('special-value');
    });

    it('should handle functions as properties', () => {
      const testFunction = () => 'function-result';
      const namespaceFunc = {
        myFunction: testFunction,
        nested: {
          myFunction: testFunction
        }
      };

      expect(PathUtils.resolvePath(namespaceFunc, 'myFunction')).toBe(testFunction);
      expect(PathUtils.resolvePath(namespaceFunc, 'nested.myFunction')).toBe(testFunction);
    });

    it('should handle arrays as properties', () => {
      const namespaceArray = {
        myArray: [1, 2, 3],
        nested: {
          myArray: ['a', 'b', 'c']
        }
      };

      expect(PathUtils.resolvePath(namespaceArray, 'myArray')).toEqual([1, 2, 3]);
      expect(PathUtils.resolvePath(namespaceArray, 'nested.myArray')).toEqual(['a', 'b', 'c']);
    });

    it('should handle complex object chains', () => {
      const complexNamespace = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep-value'
                }
              }
            }
          }
        }
      };

      expect(PathUtils.resolvePath(complexNamespace, 'level1.level2.level3.level4.level5.value')).toBe('deep-value');
    });
  });

  describe('real-world usage scenarios', () => {
    it('should resolve Foundry VTT-like paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'game.settings.get')).toBe(mockNamespace.game.settings.get);
      expect(PathUtils.resolvePath(mockNamespace, 'ui.notifications.info')).toBe(mockNamespace.ui.notifications.info);
      expect(PathUtils.resolvePath(mockNamespace, 'game.user.id')).toBe('user123');
    });

    it('should handle browser API-like paths', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'document.getElementById')).toBe(mockNamespace.document.getElementById);
      expect(PathUtils.resolvePath(mockNamespace, 'localStorage.getItem')).toBe(mockNamespace.localStorage.getItem);
    });

    it('should work with module registry patterns', () => {
      expect(PathUtils.resolvePath(mockNamespace, 'game.modules.test-module.id')).toBe('test-module');
      expect(PathUtils.resolvePath(mockNamespace, 'game.modules.test-module.active')).toBe(true);
    });
  });

  describe('parameter combinations', () => {
    it('should work with all parameter combinations', () => {
      const result1 = PathUtils.resolvePath(mockNamespace, 'game.user.id', true);
      const result2 = PathUtils.resolvePath(mockNamespace, 'game.user.id', false);

      expect(result1).toBe('user123');
      expect(result2).toBe('user123');
    });

    it('should respect useGetterFallback parameter', () => {
      const mockGetter = jest.fn().mockReturnValue('getter-result');
      const testObj = {
        normalProp: 'normal',
        get: mockGetter
      };
      mockNamespace.testObj = testObj;

      // With getter fallback (default)
      expect(PathUtils.resolvePath(mockNamespace, 'testObj.missingProp')).toBe('getter-result');
      expect(mockGetter).toHaveBeenCalledWith('missingProp');

      mockGetter.mockClear();

      // Without getter fallback
      expect(PathUtils.resolvePath(mockNamespace, 'testObj.missingProp', false)).toBeUndefined();
      expect(mockGetter).not.toHaveBeenCalled();
    });
  });
});
