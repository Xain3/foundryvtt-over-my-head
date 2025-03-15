import Base from './base';

describe('Base class tests', () => {
  let mockConfig;
  let mockContext;
  let mockGlobalContext;
  let mockGlobal;
  let mockGameObject;


  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = { CONSTANTS: { DEFAULTS: {} } };
    mockContext = { getFlag: jest.fn() };
    mockGlobalContext = { game: { name: 'mockGame' } };
    mockGameObject = { name: 'mockGame' };
    mockGlobal = { game: mockGameObject };
  });


  test('should throw error if config is required but missing', () => {
    expect(() => new Base({ shouldLoadConfig: true })).toThrow('Config is set up to be loaded');
  });

  test('should throw error if context is required but missing', () => {
    expect(() => new Base({ shouldLoadContext: true })).toThrow('Context is set up to be loaded');
  });

  test('should fallback to globalThis if no global context is provided', () => {
    const instance = new Base({ config: mockConfig, globalContext: null });
    expect(instance.global).toEqual(globalThis);
  });

  test('should create an instance if config and context are provided', () => {
    const instance = new Base({ config: mockConfig, context: mockContext });
    expect(instance).toBeInstanceOf(Base);
  });

  test('getDebugMode should return default fallback if no context or module constants are provided', () => {
    const instance = new Base({ mockConfig, shouldLoadDebugMode: true });
    expect(instance.getDebugMode()).toBe(true);
  });

  test('getDebugMode should return context flag if available', () => {
    const mockContext = { getFlag: jest.fn().mockReturnValue(false) };
    const mockConfig = { CONSTANTS: { DEFAULTS: { DEBUG_MODE: true } } };
    const instance = new Base({ 
      config: mockConfig, 
      context: mockContext, 
      shouldLoadConfig: true,
      shouldLoadContext: true,
      shouldLoadDebugMode: true 
    });
    expect(instance.getDebugMode()).toBe(false);
    expect(mockContext.getFlag).toHaveBeenCalledWith('debugMode');
  });

  test('getGameObject should return global game if available', () => {
    const instance = new Base({ globalContext: mockGlobal, shouldLoadGame: true });
    const result = instance.getGameObject();
    expect(result).toEqual(mockGlobal.game);
  });

  test('getGameObject should return null if game is not available', () => {
    const instance = new Base({ shouldLoadGame: true });
    const result = instance.getGameObject();
    expect(result).toBeNull();
  });

  test('getGameObject should log an error if game is not available', () => {
    console.error = jest.fn();
    const instance = new Base({ shouldLoadGame: true });
    const result = instance.getGameObject();
    expect(console.error).toHaveBeenCalled();
  });

  test('getConstants should warn if no constants provided', () => {
    console.warn = jest.fn();
    const instance = new Base({});
    const result = instance.getConstants();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('No constants object found.');
  });

  test('getModuleConstants should warn if no module constants provided', () => {
    console.warn = jest.fn();
    const instance = new Base({ config: { CONSTANTS: {} } });
    const result = instance.getModuleConstants();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('No module constants object found.');
  });

  test('getModuleConstants should return module constants if available', () => {
    const mockConfig = { CONSTANTS: { MODULE: { prop: true } } };
    const instance = new Base({ config: mockConfig, shouldLoadConfig: true });
    expect(instance.getModuleConstants()).toEqual({ prop: true });
  });
  test('validateLoadParameters should throw error if config is required but missing', () => {
      const base = new Base();
      expect(() => base.validateLoadParameters(true, null, false, null))
          .toThrow('Config is set up to be loaded, but no config was provided.');
  });
  
  test('validateLoadParameters should throw error if config is not an object', () => {
      const base = new Base();
      expect(() => base.validateLoadParameters(true, 'string', false, null))
          .toThrow('Config is set up to be loaded, but config is not an object.');
  });
  
  test('validateLoadParameters should throw error if context is required but missing', () => {
      const base = new Base();
      expect(() => base.validateLoadParameters(false, null, true, null))
          .toThrow('Context is set up to be loaded, but no context was provided.');
  });
  
  test('validateLoadParameters should throw error if context is not an object', () => {
      const base = new Base();
      expect(() => base.validateLoadParameters(false, null, true, 'string'))
          .toThrow('Context is set up to be loaded, but context is not an object.');
  });
  
  test('validateLoadParameters should not throw error when parameters are valid', () => {
      const base = new Base();
      expect(() => base.validateLoadParameters(true, {}, true, {})).not.toThrow();
      expect(() => base.validateLoadParameters(false, null, false, null)).not.toThrow();
      expect(() => base.validateLoadParameters(true, {}, false, null)).not.toThrow();
      expect(() => base.validateLoadParameters(false, null, true, {})).not.toThrow();
  });
});