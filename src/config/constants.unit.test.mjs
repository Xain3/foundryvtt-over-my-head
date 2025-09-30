/**
 * @file constants.unit.test.mjs
 * @description Test file for the constants module.
 * @path src/config/constants.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
const mockObject = { testKey: 'testValue' };

// Create mock function that we can track
const mockConstructor = vi.fn();

// Mock the YAML import
vi.mock('../../../constants.yaml?raw', () => ({
  default: 'test: value'
}), { virtual: true });

vi.mock('./helpers/constantsBuilder.mjs', () => ({
  __esModule: true,
  default: mockConstructor
}));

describe('constants module', () => {
  let constantsModule;

  beforeEach(async () => {
    vi.resetModules();
    mockConstructor.mockReset();
    mockConstructor.mockImplementation(() => ({
      asObject: mockObject
    }));

    constantsModule = (await import('./constants.mjs')).default;
  });

  it('should call ConstantsBuilder once and return a frozen object', () => {
    expect(mockConstructor).toHaveBeenCalledTimes(1);
    expect(constantsModule).toBe(mockObject);
    expect(Object.isFrozen(constantsModule)).toBe(true);
  });

  it('should not allow modification of the constants object', () => {
    expect(Object.isFrozen(constantsModule)).toBe(true);
    expect(() => {
      constantsModule.newKey = 'value';
    }).toThrow();
    expect(constantsModule.newKey).toBeUndefined();
  });

  it('should return the asObject property from ConstantsBuilder', () => {
    expect(constantsModule).toEqual(mockObject);
    expect(constantsModule.testKey).toBe('testValue');
  });
});