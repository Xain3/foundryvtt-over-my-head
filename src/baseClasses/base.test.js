import Base from './base';



describe('Base class tests', () => {
  test('should throw error if config is required but missing', () => {
    expect(() => new Base(null, {}, globalThis, true)).toThrow('Config is set up to be loaded');
  });

  test('should throw error if context is required but missing', () => {
    expect(() => new Base({}, null, globalThis, true, true)).toThrow('Context is set up to be loaded');
  });

  test('should fallback to globalThis if no global context is provided', () => {
    const instance = new Base({ CONSTANTS: {} }, {}, null, true, true, true, true);
    expect(instance.global).toEqual(globalThis);
  });

  test('should create an instance if config and context are provided', () => {
    const instance = new Base({ CONSTANTS: {} }, {}, globalThis);
    expect(instance).toBeInstanceOf(Base);
  });

  test('getDebugMode should return default fallback if no context or module constants are provided', () => {
    const instance = new Base({ CONSTANTS: {} }, null, globalThis, false, false);
    expect(instance.getDebugMode()).toBe(true);
  });

  test('getDebugMode should return context flag if available', () => {
    const mockContext = { getFlag: jest.fn().mockReturnValue(false) };
    const instance = new Base({ CONSTANTS: { MODULE: { DEFAULTS: { DEBUG_MODE: false } } } }, mockContext, globalThis);
    expect(instance.getDebugMode()).toBe(false);
    expect(mockContext.getFlag).toHaveBeenCalledWith('debugMode');
  });

  test('getGameObject should return global game if available', () => {
    const mockGlobal = { game: { name: 'mockGame' } };
    const instance = new Base({}, {}, mockGlobal);
    const result = instance.getGameObject();
    expect(result).toEqual(mockGlobal.game);
  });

  test('getGameObject should return null if game is not available', () => {
    const instance = new Base({}, {}, {});
    const result = instance.getGameObject();
    expect(result).toBeNull();
  });

  test('getGameObject should log an error if game is not available', () => {
    console.error = jest.fn();
    const instance = new Base({}, {}, {});
    const result = instance.getGameObject();
    expect(console.error).toHaveBeenCalled();
  });

  test('getConstants should warn if no constants provided', () => {
    console.warn = jest.fn();
    const instance = new Base({}, {}, globalThis);
    const result = instance.getConstants();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('No constants object found.');
  });

  test('getModuleConstants should warn if no module constants provided', () => {
    console.warn = jest.fn();
    const instance = new Base({ CONSTANTS: {} }, {}, globalThis);
    const result = instance.getModuleConstants();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('No module constants object found.');
  });

  test('getModuleConstants should return module constants if available', () => {
    const instance = new Base({ CONSTANTS: { MODULE: { prop: true } } }, {}, globalThis);
    expect(instance.getModuleConstants()).toEqual({ prop: true });
  });
});