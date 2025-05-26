/**
 * @file resolvePath.unit.test.js
 * @description Unit tests for the resolvePath helper function.
 * @path src/helpers/resolvePath.unit.test.js
 * @date 25 May 2025
 */

import { resolvePath } from './resolvePath.js';

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
      expect(() => resolvePath(null, 'test.path')).toThrow(TypeError);
      expect(() => resolvePath(undefined, 'test.path')).toThrow(TypeError);
      expect(() => resolvePath('string', 'test.path')).toThrow(TypeError);
      expect(() => resolvePath(123, 'test.path')).toThrow(TypeError);
      expect(() => resolvePath(true, 'test.path')).toThrow(TypeError);
    });

    it('should throw TypeError if path is not a string', () => {
      expect(() => resolvePath(mockNamespace, null)).toThrow(TypeError);
      expect(() => resolvePath(mockNamespace, undefined)).toThrow(TypeError);
      expect(() => resolvePath(mockNamespace, 123)).toThrow(TypeError);
      expect(() => resolvePath(mockNamespace, {})).toThrow(TypeError);
      expect(() => resolvePath(mockNamespace, [])).toThrow(TypeError);
    });

    it('should provide meaningful error messages', () => {
      expect(() => resolvePath(null, 'test.path')).toThrow('namespace must be an object');
      expect(() => resolvePath(mockNamespace, 123)).toThrow('path must be a string');
    });
  });

  describe('basic path resolution', () => {
    it('should return the namespace itself for empty path', () => {
      expect(resolvePath(mockNamespace, '')).toBe(mockNamespace);
      expect(resolvePath(mockNamespace, '   ')).toBe(mockNamespace);
    });

    it('should resolve single-level paths', () => {
      expect(resolvePath(mockNamespace, 'game')).toBe(mockNamespace.game);
      expect(resolvePath(mockNamespace, 'ui')).toBe(mockNamespace.ui);
      expect(resolvePath(mockNamespace, 'document')).toBe(mockNamespace.document);
    });

    it('should resolve multi-level paths', () => {
      expect(resolvePath(mockNamespace, 'game.settings')).toBe(mockNamespace.game.settings);
      expect(resolvePath(mockNamespace, 'ui.notifications')).toBe(mockNamespace.ui.notifications);
      expect(resolvePath(mockNamespace, 'game.user.id')).toBe('user123');
      expect(resolvePath(mockNamespace, 'game.user.name')).toBe('TestUser');
    });

    it('should resolve deeply nested paths', () => {
      expect(resolvePath(mockNamespace, 'deeply.nested.property.value')).toBe('found');
    });

    it('should return undefined for non-existent paths', () => {
      expect(resolvePath(mockNamespace, 'nonexistent')).toBeUndefined();
      expect(resolvePath(mockNamespace, 'game.nonexistent')).toBeUndefined();
      expect(resolvePath(mockNamespace, 'game.settings.nonexistent')).toBeUndefined();
      expect(resolvePath(mockNamespace, 'deeply.nested.nonexistent.value')).toBeUndefined();
    });

    it('should handle null/undefined intermediate values gracefully', () => {
      const namespaceWithNulls = {
        valid: {
          nullProp: null,
          undefinedProp: undefined
        }
      };

      expect(resolvePath(namespaceWithNulls, 'valid.nullProp.something')).toBeUndefined();
      expect(resolvePath(namespaceWithNulls, 'valid.undefinedProp.something')).toBeUndefined();
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
      expect(resolvePath(mockNamespace, 'withGetter.normalProp')).toBe('normal-value');
      expect(mockGetter).not.toHaveBeenCalled();

      // Non-existent property should use getter
      expect(resolvePath(mockNamespace, 'withGetter.nonExistentProp')).toBe('getter-value');
      expect(mockGetter).toHaveBeenCalledWith('nonExistentProp');
    });

    it('should work with Map objects', () => {
      expect(resolvePath(mockNamespace, 'game.modules.test-module')).toEqual({
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

      expect(resolvePath(mockNamespace, 'withGetter.nonExistentProp', false)).toBeUndefined();
      expect(mockGetter).not.toHaveBeenCalled();
    });

    it('should handle objects without getter method gracefully', () => {
      const objWithoutGetter = {
        normalProp: 'normal-value'
      };
      mockNamespace.withoutGetter = objWithoutGetter;

      expect(resolvePath(mockNamespace, 'withoutGetter.nonExistentProp')).toBeUndefined();
    });

    it('should prefer normal property access over getter', () => {
      const mockGetter = jest.fn().mockReturnValue('getter-value');
      const objWithBoth = {
        get: mockGetter,
        existingProp: 'existing-value'
      };
      mockNamespace.withBoth = objWithBoth;

      expect(resolvePath(mockNamespace, 'withBoth.existingProp')).toBe('existing-value');
      expect(mockGetter).not.toHaveBeenCalled();
    });

    it('should handle getter that returns undefined', () => {
      const mockGetter = jest.fn().mockReturnValue(undefined);
      const objWithGetter = {
        get: mockGetter
      };
      mockNamespace.withGetter = objWithGetter;

      expect(resolvePath(mockNamespace, 'withGetter.nonExistentProp')).toBeUndefined();
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

      expect(resolvePath(namespaceFalsy, 'zero')).toBe(0);
      expect(resolvePath(namespaceFalsy, 'false')).toBe(false);
      expect(resolvePath(namespaceFalsy, 'empty')).toBe('');
      expect(resolvePath(namespaceFalsy, 'nested.zero')).toBe(0);
      expect(resolvePath(namespaceFalsy, 'nested.false')).toBe(false);
      expect(resolvePath(namespaceFalsy, 'nested.empty')).toBe('');
    });

    it('should handle numeric property names', () => {
      const namespaceNumeric = {
        '0': 'zero',
        '123': 'one-two-three',
        nested: {
          '456': 'four-five-six'
        }
      };

      expect(resolvePath(namespaceNumeric, '0')).toBe('zero');
      expect(resolvePath(namespaceNumeric, '123')).toBe('one-two-three');
      expect(resolvePath(namespaceNumeric, 'nested.456')).toBe('four-five-six');
    });

    it('should handle special characters in property names', () => {
      const namespaceSpecial = {
        'prop-with-dash': 'dash-value',
        'prop_with_underscore': 'underscore-value',
        '$pecial': 'special-value'
      };

      expect(resolvePath(namespaceSpecial, 'prop-with-dash')).toBe('dash-value');
      expect(resolvePath(namespaceSpecial, 'prop_with_underscore')).toBe('underscore-value');
      expect(resolvePath(namespaceSpecial, '$pecial')).toBe('special-value');
    });

    it('should handle functions as properties', () => {
      const testFunction = () => 'function-result';
      const namespaceFunc = {
        myFunction: testFunction,
        nested: {
          myFunction: testFunction
        }
      };

      expect(resolvePath(namespaceFunc, 'myFunction')).toBe(testFunction);
      expect(resolvePath(namespaceFunc, 'nested.myFunction')).toBe(testFunction);
    });

    it('should handle arrays as properties', () => {
      const namespaceArray = {
        myArray: [1, 2, 3],
        nested: {
          myArray: ['a', 'b', 'c']
        }
      };

      expect(resolvePath(namespaceArray, 'myArray')).toEqual([1, 2, 3]);
      expect(resolvePath(namespaceArray, 'nested.myArray')).toEqual(['a', 'b', 'c']);
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

      expect(resolvePath(complexNamespace, 'level1.level2.level3.level4.level5.value')).toBe('deep-value');
    });
  });

  describe('real-world usage scenarios', () => {
    it('should resolve Foundry VTT-like paths', () => {
      expect(resolvePath(mockNamespace, 'game.settings.get')).toBe(mockNamespace.game.settings.get);
      expect(resolvePath(mockNamespace, 'ui.notifications.info')).toBe(mockNamespace.ui.notifications.info);
      expect(resolvePath(mockNamespace, 'game.user.id')).toBe('user123');
    });

    it('should handle browser API-like paths', () => {
      expect(resolvePath(mockNamespace, 'document.getElementById')).toBe(mockNamespace.document.getElementById);
      expect(resolvePath(mockNamespace, 'localStorage.getItem')).toBe(mockNamespace.localStorage.getItem);
    });

    it('should work with module registry patterns', () => {
      expect(resolvePath(mockNamespace, 'game.modules.test-module.id')).toBe('test-module');
      expect(resolvePath(mockNamespace, 'game.modules.test-module.active')).toBe(true);
    });
  });

  describe('parameter combinations', () => {
    it('should work with all parameter combinations', () => {
      const result1 = resolvePath(mockNamespace, 'game.user.id', true);
      const result2 = resolvePath(mockNamespace, 'game.user.id', false);

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
      expect(resolvePath(mockNamespace, 'testObj.missingProp')).toBe('getter-result');
      expect(mockGetter).toHaveBeenCalledWith('missingProp');

      mockGetter.mockClear();

      // Without getter fallback
      expect(resolvePath(mockNamespace, 'testObj.missingProp', false)).toBeUndefined();
      expect(mockGetter).not.toHaveBeenCalled();
    });
  });
});
