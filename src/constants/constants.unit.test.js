/**
 * @file constants.unit.test.js
 * @description Test file for the constants module.
 * @path src/constants/constants.unit.test.js
 */

const mockObject = { testKey: 'testValue' };

// Create mock function that we can track
const mockConstructor = jest.fn();

jest.mock('./helpers/constantsBuilder.js', () => ({
  __esModule: true,
  default: mockConstructor,
}));

describe('constants module', () => {
  let constantsModule;

  beforeEach(() => {
    jest.resetModules();
    mockConstructor.mockClear();
    mockConstructor.mockImplementation(() => ({
      asObject: mockObject,
    }));
    // Import the module after setting up mocks
    constantsModule = require('./constants.js').default;
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