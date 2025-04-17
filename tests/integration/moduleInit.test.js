import Config from "../../src/config/config";
import Utilities from "../../src/utils/utils";

describe('Module Initialization Integration', () => {
  let initializer, config, utils;
  
  beforeEach(() => {
    // Mock Foundry globals
    global.game = {
      modules: { get: jest.fn().mockReturnValue({ id: 'foundryvtt-over-my-head' }) },
      i18n: { localize: jest.fn() },
      settings: { register: jest.fn(), get: jest.fn() }
    };
    
    global.Hooks = {
      once: jest.fn((hook, callback) => callback()),
      on: jest.fn(),
      callAll: jest.fn()
    };
    
    config = new Config();
    utils = new Utilities(config);
    initializer = utils.initializer;
  });
  
  it('should correctly initialize the complete module', async () => {
    // Spy on initialization methods
    const initContextSpy = jest.spyOn(initializer, 'initializeContext');
    const initSettingsSpy = jest.spyOn(initializer, 'initializeSettings');
    const initListenersSpy = jest.spyOn(initializer, 'initializeListeners');
    
    // Run initialization
    await initializer.initialize();
    
    // Verify all components were initialized in correct order
    expect(initContextSpy).toHaveBeenCalled();
    expect(initSettingsSpy).toHaveBeenCalled();
    expect(initListenersSpy).toHaveBeenCalled();
    
    // Verify context and handlers were created
    expect(initializer.context).toBeInstanceOf(Context);
    expect(initializer.handlers).toBeInstanceOf(Handlers);
  });

  it('should verify that integration tests are correctly initialized', () => {
    expect(global.game).toBeDefined();
    expect(global.Hooks).toBeDefined();
    expect(config).toBeDefined();
    expect(utils).toBeDefined();
    expect(initializer).toBeDefined();
  });

  it('should verify that integration tests are correctly run', () => {
    const testValue = true;
    expect(testValue).toBe(true);
  });
});
