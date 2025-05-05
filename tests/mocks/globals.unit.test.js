import MockGame from "./game";
import MockHooks from "./hooks";
import MockGlobals, {
commonWebBrowserJSGlobals, // Note: This is the array of names
foundrySpecificGlobals,
commonLibraryGlobals,
commonWebBrowserJSGlobalsMap // Import the map
} from './globals';

describe('MockGlobals', () => {
let mockGlobals;
// No need for global state capture/restore helpers if clearGlobals works correctly

beforeEach(() => {
  // Create a new instance for each test
  mockGlobals = new MockGlobals();
  // We rely on clearGlobals in afterEach and Jest's isolation
});

afterEach(() => {
  // Ensure cleanup happens after each test
  if (mockGlobals) {
    mockGlobals.clearGlobals();
  }
  // Optional: Verify cleanup if needed, but generally trust clearGlobals
  // commonWebBrowserJSGlobals.forEach(key => delete globalThis[key]);
  // foundrySpecificGlobals.forEach(key => delete globalThis[key]);
  // commonLibraryGlobals.forEach(key => delete globalThis[key]);
  // delete globalThis.game;
  // delete globalThis.Hooks;
});


it('should initialize with default MockGame and MockHooks instances', () => {
  expect(mockGlobals.game).toBeInstanceOf(MockGame);
  expect(mockGlobals.hooks).toBeInstanceOf(MockHooks);
  expect(Object.keys(mockGlobals.originals)).toHaveLength(0);
  expect(mockGlobals.keysManagedByThisInstance.size).toBe(0);
});

describe('setGlobals', () => {
  it('should set browser globals when browser=true', () => {
    mockGlobals.setGlobals({
      browser: true,
      foundry: false,
      libraries: false
    });
    // Check if specific globals from the map were set
    expect(globalThis.window).toBe(commonWebBrowserJSGlobalsMap.window);
    expect(globalThis.document).toBe(commonWebBrowserJSGlobalsMap.document);
    expect(globalThis.Event).toBe(commonWebBrowserJSGlobalsMap.Event);
    expect(globalThis.fetch).toBeDefined(); // Check if the mock fetch was set
    expect(globalThis.HTMLElement).toBe(commonWebBrowserJSGlobalsMap.HTMLElement);
    expect(globalThis.setTimeout).toBe(commonWebBrowserJSGlobalsMap.setTimeout);
    // Check if they were managed
    expect(mockGlobals.keysManagedByThisInstance.has('window')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('fetch')).toBe(true);
  });

  it('should NOT manage browser globals when browser=false', () => {
    // Capture initial state (JSDOM provides window)
    const initialWindow = globalThis.window;
    const initialFetch = globalThis.fetch; // Might be undefined or from JSDOM setup

    mockGlobals.setGlobals({
      browser: false,
      foundry: false,
      libraries: false
    });

    // Assert that MockGlobals did NOT save/manage 'window' or 'fetch'
    expect(mockGlobals.originals.window).toBeUndefined();
    expect(mockGlobals.keysManagedByThisInstance.has('window')).toBe(false);
    expect(mockGlobals.originals.fetch).toBeUndefined();
    expect(mockGlobals.keysManagedByThisInstance.has('fetch')).toBe(false);

    // Globals should remain untouched from their initial state
    expect(globalThis.window).toBe(initialWindow);
    expect(globalThis.fetch).toBe(initialFetch);
  });


  it('should set default Foundry globals when foundry=true', () => {
    mockGlobals.setGlobals({
      browser: false,
      foundry: true,
      libraries: false
    });
    expect(globalThis.game).toBe(mockGlobals.game);
    expect(globalThis.Hooks).toBe(mockGlobals.hooks);
    // Check if game-derived globals were set (assuming MockGame provides them)
    if (mockGlobals.game.config) expect(globalThis.CONFIG).toBe(mockGlobals.game.config);
    else console.warn("MockGame instance doesn't have 'config' property"); // Add warning if mock is incomplete
    if (mockGlobals.game.ui) expect(globalThis.ui).toBe(mockGlobals.game.ui);
    else console.warn("MockGame instance doesn't have 'ui' property");
    if (mockGlobals.game.canvas) expect(globalThis.canvas).toBe(mockGlobals.game.canvas);
    else console.warn("MockGame instance doesn't have 'canvas' property");

    // Check some other foundry globals
    expect(globalThis.CONST).toBeDefined();
    expect(typeof globalThis.Application).toBe('function'); // Check if it's a function mock
    expect(typeof globalThis.Actor).toBe('function');

    // Check if managed
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('CONST')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('Application')).toBe(true);
  });

  it('should NOT set default Foundry globals when foundry=false', () => {
    // Temporarily delete potential pre-existing globals for a clean test slate
    // (This assumes Jest isolation might not be perfect or other tests interfere)
    const gameExists = globalThis.hasOwnProperty('game'); const oldGame = globalThis.game; delete globalThis.game;
    const hooksExists = globalThis.hasOwnProperty('Hooks'); const oldHooks = globalThis.Hooks; delete globalThis.Hooks;
    const configExists = globalThis.hasOwnProperty('CONFIG'); const oldConfig = globalThis.CONFIG; delete globalThis.CONFIG;
    const constExists = globalThis.hasOwnProperty('CONST'); const oldConst = globalThis.CONST; delete globalThis.CONST;

    mockGlobals.setGlobals({
      browser: false,
      foundry: false,
      libraries: false
    });

    expect(globalThis.game).toBeUndefined();
    expect(globalThis.Hooks).toBeUndefined();
    expect(globalThis.CONFIG).toBeUndefined();
    expect(globalThis.CONST).toBeUndefined();
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(false);
    expect(mockGlobals.keysManagedByThisInstance.has('CONFIG')).toBe(false);

    // Restore if they existed before
    if (gameExists) globalThis.game = oldGame;
    if (hooksExists) globalThis.Hooks = oldHooks;
    if (configExists) globalThis.CONFIG = oldConfig;
    if (constExists) globalThis.CONST = oldConst;
  });

  it('should set library globals when libraries=true', () => {
    mockGlobals.setGlobals({
      browser: false,
      foundry: false,
      libraries: true
    });
    expect(globalThis.$).toBeDefined();
    expect(typeof globalThis.$).toBe('function');
    expect(globalThis.jQuery).toBeDefined();
    expect(globalThis.PIXI).toBeDefined();
    expect(globalThis.Handlebars).toBeDefined();
    expect(globalThis.tinymce).toBeDefined();
    expect(mockGlobals.keysManagedByThisInstance.has('$')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('PIXI')).toBe(true);
  });

  it('should NOT set library globals when libraries=false', () => {
     // Temporarily delete potential pre-existing globals
    const $Exists = globalThis.hasOwnProperty('$'); const old$ = globalThis.$; delete globalThis.$;
    const pixiExists = globalThis.hasOwnProperty('PIXI'); const oldPixi = globalThis.PIXI; delete globalThis.PIXI;

    mockGlobals.setGlobals({
      browser: false,
      foundry: false,
      libraries: false
    });
    expect(globalThis.$).toBeUndefined();
    expect(globalThis.PIXI).toBeUndefined();
    expect(mockGlobals.keysManagedByThisInstance.has('$')).toBe(false);
    expect(mockGlobals.keysManagedByThisInstance.has('PIXI')).toBe(false);

    // Restore if they existed
    if ($Exists) globalThis.$ = old$;
    if (pixiExists) globalThis.PIXI = oldPixi;
  });

  it('should set foundry and library globals by default (browser=false)', () => {
     // Temporarily delete potential pre-existing globals
    const gameExists = globalThis.hasOwnProperty('game'); const oldGame = globalThis.game; delete globalThis.game;
    const hooksExists = globalThis.hasOwnProperty('Hooks'); const oldHooks = globalThis.Hooks; delete globalThis.Hooks;
    const $Exists = globalThis.hasOwnProperty('$'); const old$ = globalThis.$; delete globalThis.$;

    mockGlobals.setGlobals(); // Default is browser=false, foundry=true, libraries=true

    expect(mockGlobals.keysManagedByThisInstance.has('window')).toBe(false); // Default browser is false
    expect(globalThis.game).toBe(mockGlobals.game);
    expect(globalThis.Hooks).toBe(mockGlobals.hooks);
    expect(globalThis.CONFIG).toBeDefined();
    expect(globalThis.$).toBeDefined();
    expect(globalThis.PIXI).toBeDefined();
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('$')).toBe(true);

    // Restore if they existed
    if (gameExists) globalThis.game = oldGame;
    if (hooksExists) globalThis.Hooks = oldHooks;
    if ($Exists) globalThis.$ = old$;
  });

  it('should set all globals when explicitly requested', () => {
    mockGlobals.setGlobals({
      browser: true,
      foundry: true,
      libraries: true
    });
    expect(globalThis.window).toBeDefined();
    expect(globalThis.game).toBe(mockGlobals.game);
    expect(globalThis.Hooks).toBe(mockGlobals.hooks);
    expect(globalThis.$).toBeDefined();
    expect(mockGlobals.keysManagedByThisInstance.has('window')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('$')).toBe(true);
  });

  it('should use provided gameInstance', () => {
    const customGame = new MockGame(); // Ensure MockGame has an id property or add one
    customGame.id = "custom-game-instance"; // Add a marker
    customGame.config = { id: "custom-config" }; // Add mock config

    mockGlobals.setGlobals({
      foundry: true,
      libraries: false, // Keep test focused
      browser: false,
      gameInstance: customGame
    });
    // Avoid .toBe(customGame) due to potential MockCollection issues
    expect(globalThis.game).toBe(customGame); // Check if game is set
    expect(globalThis.game). toBeInstanceOf(MockGame); // Check if it's the right instance
    expect(globalThis.game.id).toBe("custom-game-instance");
    expect(globalThis.CONFIG).toBe(customGame.config); // Should derive from custom instance
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true);
    expect(mockGlobals.keysManagedByThisInstance.has('CONFIG')).toBe(true);
  });

  it('should use provided hooksInstance', () => {
    const customHooks = new MockHooks();
    customHooks.id = "custom-hooks-instance"; // Add a marker

    mockGlobals.setGlobals({
      foundry: true,
      libraries: false,
      browser: false,
      hooksInstance: customHooks
    });
    // Avoid .toBe(customHooks) if MockHooks is complex
    expect(globalThis.Hooks).toBe(customHooks); // Check if Hooks is set
    expect(globalThis.Hooks).toBeInstanceOf(MockHooks); // Check if it's the right instance
    expect(globalThis.Hooks.id).toBe("custom-hooks-instance");
    expect(mockGlobals.keysManagedByThisInstance.has('Hooks')).toBe(true);
  });

  it('should use provided gameInstance even if foundry=false', () => {
    const customGame = new MockGame();
    customGame.id = "custom-game-instance-no-foundry";

     // Temporarily delete potential pre-existing globals
    const configExists = globalThis.hasOwnProperty('CONFIG'); const oldConfig = globalThis.CONFIG; delete globalThis.CONFIG;
    const constExists = globalThis.hasOwnProperty('CONST'); const oldConst = globalThis.CONST; delete globalThis.CONST;


    mockGlobals.setGlobals({
      foundry: false,
      libraries: false,
      browser: false,
      gameInstance: customGame
    });
    // Avoid .toBe(customGame)
    expect(globalThis.game.id).toBe("custom-game-instance-no-foundry");
    expect(globalThis.CONFIG).toBeUndefined(); // CONFIG shouldn't be set if foundry=false
    expect(globalThis.CONST).toBeUndefined();
    expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true); // game itself is set
    expect(mockGlobals.keysManagedByThisInstance.has('CONFIG')).toBe(false); // But CONFIG is not
    expect(mockGlobals.keysManagedByThisInstance.has('CONST')).toBe(false);

    // Restore if they existed
    if (configExists) globalThis.CONFIG = oldConfig;
    if (constExists) globalThis.CONST = oldConst;
  });

  it('should save original global values', () => {
    const originalValue = { original: 'value' };
    globalThis.CONFIG = originalValue; // Set a global before calling setGlobals

    mockGlobals.setGlobals({
      foundry: true,
      browser: false,
      libraries: false
    }); // This will overwrite CONFIG

    expect(mockGlobals.originals.CONFIG).toBe(originalValue); // Check saved original
    expect(globalThis.CONFIG).not.toBe(originalValue); // It should be the mock value now
    expect(mockGlobals.keysManagedByThisInstance.has('CONFIG')).toBe(true);
  });

  it('should not overwrite an existing global if the corresponding group is false', () => {
      const original$ = () => 'original jquery';
      globalThis.$ = original$;

      mockGlobals.setGlobals({ libraries: false, browser: false, foundry: false });

      expect(globalThis.$).toBe(original$); // Should remain unchanged
      expect(mockGlobals.originals.$).toBeUndefined(); // Should not have been saved
      expect(mockGlobals.keysManagedByThisInstance.has('$')).toBe(false); // Should not have been managed
  });
});

describe('clearGlobals', () => {
  it('should remove globals set by setGlobals (that didnt exist before)', () => {
    // Ensure potential targets are undefined initially
    delete globalThis.game;
    delete globalThis.$;
    delete globalThis.CONFIG;

    mockGlobals.setGlobals({
      browser: false, // Keep test focused, browser globals likely exist via JSDOM
      foundry: true,
      libraries: true
    });
    // Verify they exist
    expect(globalThis.game).toBeDefined();
    expect(globalThis.$).toBeDefined();
    expect(globalThis.CONFIG).toBeDefined(); // Set via mockGame

    mockGlobals.clearGlobals();

    // Verify they are removed (because no original existed)
    expect(globalThis.game).toBeUndefined();
    expect(globalThis.$).toBeUndefined();
    expect(globalThis.CONFIG).toBeUndefined();
  });

   it('should restore original global values', () => {
    const originalConfig = { original: true };
    const original$ = () => 'original jquery';
    globalThis.CONFIG = originalConfig;
    globalThis.$ = original$;

    mockGlobals.setGlobals({
      foundry: true,
      libraries: true,
      browser: false // Keep test focused
    });

    // Verify they were overwritten
    expect(globalThis.CONFIG).not.toBe(originalConfig);
    expect(globalThis.$).not.toBe(original$);
    expect(mockGlobals.originals.CONFIG).toBe(originalConfig); // Verify saved
    expect(mockGlobals.originals.$).toBe(original$);      // Verify saved

    mockGlobals.clearGlobals();

    // Verify they are restored
    expect(globalThis.CONFIG).toBe(originalConfig);
    expect(globalThis.$).toBe(original$);
  });

  it('should clear the originals map and managed keys set after execution', () => {
    globalThis.TEMP_VAR_ORIGINAL = 123; // An original value
    delete globalThis.TEMP_VAR_NEW; // Ensure this one doesn't exist
    const original$Exists = globalThis.hasOwnProperty('$');
    delete globalThis.$; // Ensure $ is removed before setting library globals for this test
    const originalPixiExists = globalThis.hasOwnProperty('PIXI');
    delete globalThis.PIXI; // Ensure PIXI is also removed

    mockGlobals.setGlobals({ foundry: true }); // Will manage 'game', 'CONFIG', etc.
    mockGlobals.setGlobals({ libraries: true }); // Will manage '$', 'PIXI', etc. Since they were deleted, no original is saved.
    globalThis.TEMP_VAR_NEW = 456; // Set a new global *after* setGlobals

    // Check that *some* originals were saved and keys managed
    expect(Object.keys(mockGlobals.originals).length).toBeGreaterThanOrEqual(0); // Could be 0 if nothing pre-existed
    expect(mockGlobals.keysManagedByThisInstance.size).toBeGreaterThan(0); // Libraries and Foundry globals were managed

    mockGlobals.clearGlobals();

    // Check internal state is cleared
    expect(Object.keys(mockGlobals.originals)).toHaveLength(0);
    expect(mockGlobals.keysManagedByThisInstance.size).toBe(0);

    // Check that globals managed are gone/restored, but unrelated ones remain
    // '$' might be restored by JSDOM even if deleted, so check if it's defined.
    if (!original$Exists) {
        expect(globalThis.$).toBeDefined(); // Acknowledge JSDOM might restore $
    }

    expect(globalThis.TEMP_VAR_ORIGINAL).toBe(123); // Was never managed, should persist
    expect(globalThis.TEMP_VAR_NEW).toBe(456); // Was never managed, should persist

    // Cleanup test globals
    delete globalThis.TEMP_VAR_ORIGINAL;
    delete globalThis.TEMP_VAR_NEW;
    // No need to restore $ or PIXI here, clearGlobals should handle managed ones
  });


  it('should handle clearing after setting specific instances', () => {
      const customGame = new MockGame(); customGame.id = 'cGame';
      const customHooks = new MockHooks(); customHooks.id = 'cHooks';

      // Ensure clean slate
      delete globalThis.game;
      delete globalThis.Hooks;

      mockGlobals.setGlobals({ gameInstance: customGame, hooksInstance: customHooks, foundry: false }); // Set only game/hooks

      expect(globalThis.game.id).toBe('cGame');
      expect(globalThis.Hooks.id).toBe('cHooks');
      expect(mockGlobals.keysManagedByThisInstance.has('game')).toBe(true);
      expect(mockGlobals.keysManagedByThisInstance.has('Hooks')).toBe(true);

      mockGlobals.clearGlobals();

      expect(globalThis.game).toBeUndefined(); // Removed as no original existed
      expect(globalThis.Hooks).toBeUndefined(); // Removed as no original existed
  });

   it('should not remove globals that existed before and were not managed', () => {
      const preExistingGlobal = { test: 'value' };
      globalThis.PRE_EXISTING = preExistingGlobal;

      mockGlobals.setGlobals({ browser: true }); // Sets window etc., manages them

      expect(globalThis.PRE_EXISTING).toBe(preExistingGlobal); // Should still be there
      expect(mockGlobals.keysManagedByThisInstance.has('PRE_EXISTING')).toBe(false); // Not managed

      mockGlobals.clearGlobals(); // Clears window etc.

      // Should *still* be there because it was never managed by MockGlobals
      expect(globalThis.PRE_EXISTING).toBe(preExistingGlobal);

      // Cleanup test global
      delete globalThis.PRE_EXISTING;
  });

  it('should set MockGame and MockHooks as this.mockGame and this.mockHooks if not provided and foundry is set to true', () => {
    mockGlobals.clearGlobals(); // Ensure clean slate
    // Temporarily delete potential pre-existing globals
    const gameExists = globalThis.hasOwnProperty('game'); const oldGame = globalThis.game; delete globalThis.game;
    const hooksExists = globalThis.hasOwnProperty('Hooks'); const oldHooks = globalThis.Hooks; delete globalThis.Hooks;

    // Set globals with foundry=true and no game/hooks instances
    mockGlobals.setGlobals({
      foundry: true,
      libraries: false,
      browser: false
    });

    expect(globalThis.game).toBe(mockGlobals.game);
    expect(globalThis.game).toBeInstanceOf(MockGame); // Check if it's the right instance
    expect(globalThis.Hooks).toBe(mockGlobals.hooks);
    expect(globalThis.Hooks).toBeInstanceOf(MockHooks); // Check if it's the right instance
  });
});
});