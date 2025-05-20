import constants from '@constants';

describe('Constants Integration Test', () => {
  it('should correctly load and parse constants.yaml', () => {
    // Check if the testConstant exists and has the correct value
    expect(constants.testConstant).toBeDefined();
    expect(constants.testConstant).toBe('testValue');
  });

  it('should have the context schema parsed as a Zod schema', () => {
    expect(constants.context).toBeDefined();
    expect(constants.context.schema).toBeDefined();
    // Check if it's a Zod schema by looking for a known Zod method, e.g., safeParse
    expect(typeof constants.context.schema.safeParse).toBe('function');
  });

  it('should load other values from constants.yaml', () => {
    expect(constants.referToModuleBy).toBeDefined();
    expect(constants.errors).toBeDefined();
    expect(constants.errors.separator).toBeDefined();
    expect(constants.placeables).toBeDefined();
    expect(constants.placeables.token).toBeDefined();
    expect(constants.placeables.token.name).toBe('Token');
  });
});