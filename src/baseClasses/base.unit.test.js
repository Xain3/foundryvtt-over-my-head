import Base, {DEFAULT_ARGS, REQUIRED_KEYS, ORDERED_KEYS} from './base';

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

  describe('parseArgs function', () => {
    test('should throw an error if no arguments are provided', () => {
      expect(() => new Base()).toThrow('No arguments provided');
    });

    test('should throw an error if the first argument is not an object', () => {
      expect(() => new Base('string')).toThrow('First argument should be an object');
    });

    test('should throw an error if the first argument is an empty object', () => {
      expect(() => new Base({})).toThrow('First argument should not be an empty object');
    }
    );

    test('should deconstruct and map properties if first argument is an object containing required keys', () => {
      const instance = new Base({ config: mockConfig, context: mockContext});
      expect(instance.parsedArgs).toEqual({
        config: mockConfig,
        context: mockContext,
        globalContext: DEFAULT_ARGS.globalContext,
        shouldLoadConfig: DEFAULT_ARGS.shouldLoadConfig,
        shouldLoadContext: DEFAULT_ARGS.shouldLoadContext,
        shouldLoadGame: DEFAULT_ARGS.shouldLoadGame,
        shouldLoadDebugMode: DEFAULT_ARGS.shouldLoadDebugMode,
      });
    });

    test('should treat the first argument as a config object if it is an object but does not contain any required keys', () => {
      const instance = new Base({ someOtherKey: 'value' });
      expect(instance.parsedArgs.config).toEqual({ someOtherKey: 'value' });
    });

    test('should map the other arguments to the default parameters if only a valid first positional argument', () => {
      const instance = new Base({someOtherKey: 'value'});
      expect(instance.parsedArgs.config).toEqual({ someOtherKey: 'value' });
      expect(instance.parsedArgs.context).toEqual(DEFAULT_ARGS.context);
      expect(instance.parsedArgs.globalContext).toEqual(DEFAULT_ARGS.globalContext);
      expect(instance.parsedArgs.shouldLoadConfig).toEqual(DEFAULT_ARGS.shouldLoadConfig);
      expect(instance.parsedArgs.shouldLoadContext).toEqual(DEFAULT_ARGS.shouldLoadContext);
      expect(instance.parsedArgs.shouldLoadGame).toEqual(DEFAULT_ARGS.shouldLoadGame);
      expect(instance.parsedArgs.shouldLoadDebugMode).toEqual(DEFAULT_ARGS.shouldLoadDebugMode);
    });
    
    test('should map positional arguments correctly when they are all provided', () => {
      const instance = new Base(mockConfig, mockContext, 'I am global!', false, true, true, true);
      expect(instance.parsedArgs.config).toEqual(mockConfig);
      expect(instance.parsedArgs.context).toEqual(mockContext);
      expect(instance.parsedArgs.globalContext).toEqual('I am global!');
      expect(instance.parsedArgs.shouldLoadConfig).toBe(false);
      expect(instance.parsedArgs.shouldLoadContext).toBe(true);
      expect(instance.parsedArgs.shouldLoadGame).toBe(true);
      expect(instance.parsedArgs.shouldLoadDebugMode).toBe(true);
    });

    test('should map provided positional arguments correctly and fallback to default values for missing ones', () => {
      const instance = new Base(mockConfig, mockContext, 'I am global!', false);
      expect(instance.parsedArgs.config).toEqual(mockConfig);
      expect(instance.parsedArgs.context).toEqual(mockContext);
      expect(instance.parsedArgs.globalContext).toEqual('I am global!');
      expect(instance.parsedArgs.shouldLoadConfig).toBe(false);
      expect(instance.parsedArgs.shouldLoadContext).toBe(DEFAULT_ARGS.shouldLoadContext);
      expect(instance.parsedArgs.shouldLoadGame).toBe(DEFAULT_ARGS.shouldLoadGame);
      expect(instance.parsedArgs.shouldLoadDebugMode).toBe(DEFAULT_ARGS.shouldLoadDebugMode);
    });
  });

  describe('validateLoadParameters function', () => {
    test('should throw error if config is required but missing', () => {
      expect(() => new Base({ shouldLoadConfig: true })).toThrow('Config is set up to be loaded');
      expect(() => new Base(null, null, null, true )).toThrow();
    });

    test('should throw error if config is required but is not an object', () => {
      expect(() => new Base({config: 'string', shouldLoadConfig: true})).toThrow('Config is set up to be loaded');
    });

    test('should throw error if context is required but missing', () => {
      expect(() => new Base({ shouldLoadContext: true, shouldLoadConfig:false })).toThrow('Context is set up to be loaded');
      expect(() => new Base(mockConfig, null, null, false, true)).toThrow('Context is set up to be loaded');
    });

    test('should throw error if context is required but is not an object', () => {
      expect(() => new Base({ context: 'string', shouldLoadContext: true, shouldLoadConfig:false })).toThrow('Context is set up to be loaded');
    });

    test('should throw an error if shouldLoadConfig is not a boolean', () => {
      expect(() => new Base({ config: mockConfig, shouldLoadConfig: 'string' })).toThrow('shouldLoadConfig should be a boolean');
      expect(() => new Base(mockConfig, mockContext, null, 'string')).toThrow('shouldLoadConfig should be a boolean');
    }
    );

    test('should throw an error if shouldLoadContext is not a boolean', () => {
      expect(() => new Base({ config: mockConfig, context: mockContext, shouldLoadContext: 'string' })).toThrow('shouldLoadContext should be a boolean');
      expect(() => new Base(mockConfig, mockContext, null, false, 'string')).toThrow('shouldLoadContext should be a boolean');
    }
    );

    test('should throw an error if shouldLoadGame is not a boolean', () => {
      expect(() => new Base({ config: mockConfig, context: mockContext, shouldLoadGame: 'string' })).toThrow('shouldLoadGame should be a boolean');
      expect(() => new Base(mockConfig, mockContext, null, false, false, 'string')).toThrow('shouldLoadGame should be a boolean');
    }
    );

    test('should throw an error if shouldLoadDebugMode is not a boolean', () => {
      expect(() => new Base({ config: mockConfig, context: mockContext, shouldLoadDebugMode: 'string' })).toThrow('shouldLoadDebugMode should be a boolean');
      expect(() => new Base(mockConfig, mockContext, null, false, false, false, 'string')).toThrow('shouldLoadDebugMode should be a boolean');
    }
    );
  });

  test('should fallback to globalThis if no global context is provided', () => {
    const instance = new Base({ config: mockConfig, globalContext: null });
    expect(instance.globalContext).toEqual(globalThis);
    const instancePositional = new Base(mockConfig, mockContext, null);
    expect(instance.globalContext).toEqual(globalThis); // Fix: was incorrectly using 'global' property
  });

  test('should create an instance if config and context are provided', () => {
    const instance = new Base({ config: mockConfig, context: mockContext });
    expect(instance).toBeInstanceOf(Base);
  });

  test('getDebugMode should return default fallback if no context or module constants are provided', () => {
    const instance = new Base({ mockConfig, shouldLoadDebugMode: true, shouldLoadConfig:false });
    expect(instance.getDebugMode()).toBe(false);
    const instancePositional = new Base(mockConfig, mockContext, null, false, false, false, true);
    expect(instancePositional.getDebugMode()).toBe(false);
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
    const instance = new Base({ globalContext: mockGlobal, shouldLoadGame: true, shouldLoadConfig: false });
    const result = instance.getGameObject();
    expect(result).toEqual(mockGlobal.game);
  });

  test('getGameObject should return null if game is not available', () => {
    const instance = new Base({ shouldLoadGame: true, shouldLoadConfig: false });
    const result = instance.getGameObject();
    expect(result).toBeNull();
  });

  test('getGameObject should log an error if game is not available', () => {
    console.error = jest.fn();
    const instance = new Base({ shouldLoadGame: true, shouldLoadConfig: false });
    const result = instance.getGameObject();
    expect(console.error).toHaveBeenCalled();
  });

  test('getConstants should warn if no constants provided', () => {
    console.warn = jest.fn();
    const instance = new Base({config: {}, shouldLoadConfig: true });
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
});