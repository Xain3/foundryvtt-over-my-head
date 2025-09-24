/**
 * @file mockGlobals.mjs
 * @description Comprehensive mock globals for Foundry VTT v13 integration testing
 * @path tests/mocks/mockGlobals.mjs
 * @date 29 May 2025
 */

/**
 * Create a mock function that uses jest.fn() when available, otherwise a regular function
 * @param {Function} implementation - The function implementation
 * @returns {Function} Mock function or jest spy
 */
export const createMockFunction = (implementation = () => {}) => {
  if (typeof jest !== 'undefined' && jest.fn) {
    return jest.fn(implementation);
  }
  return implementation;
};

/**
 * Create a spy function that tracks calls when jest is available
 * @param {Object} object - Object to spy on
 * @param {string} methodName - Method name to spy on
 * @returns {Function} Spy function or original method
 */
export const createSpy = (object, methodName) => {
  if (typeof jest !== 'undefined' && jest.spyOn) {
    return jest.spyOn(object, methodName);
  }
  return object[methodName];
};

import { JSDOM } from 'jsdom';
import MockCollection from './MockCollection.mjs';
import MockDocument from './MockDocument.mjs';
import MockActor from './MockActor.mjs';
import MockItem from './MockItem.mjs';
import MockUser from './MockUser.mjs';
import MockApplication from './MockApplication.mjs';
import MockDialog from './MockDialog.mjs';
import MockRoll from './MockRoll.mjs';
import MockSettings from './MockSettings.mjs';
import MockHooks from './MockHooks.mjs';
import MockGame, { MockScene, MockFolder } from './MockGame.mjs';

/**
 * Create JSDOM instance for simulating browser environment
 * @returns {JSDOM} Configured JSDOM instance
 */
const createJSDOMInstance = () => new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

/**
 * Create default translations for the i18n system
 * @returns {Object} Translations object
 */
const createDefaultTranslations = () => ({
  'SETTINGS.Configure': 'Configure Settings',
  'FOLDER.Create': 'Create Folder',
  'ENTITY.Create': 'Create Entity',
  'ENTITY.Update': 'Update Entity',
  'ENTITY.Delete': 'Delete Entity'
});

/**
 * Create default canvas configuration
 * @returns {Object} Canvas configuration object
 */
const createCanvasConfiguration = () => ({
  ready: false,
  scene: null,
  dimensions: { width: 1920, height: 1080 },
  stage: {},
  app: {
    renderer: { width: 1920, height: 1080, resolution: 1 }
  },
  grid: { size: 100, type: 1, distance: 5, units: 'ft' }
});

/**
 * Create default canvas layers
 * @returns {Object} Canvas layers object
 */
const createCanvasLayers = () => ({
  background: { render: jest.fn() },
  drawings: { render: jest.fn(), objects: new MockCollection() },
  grid: { render: jest.fn() },
  walls: { render: jest.fn(), objects: new MockCollection() },
  templates: { render: jest.fn(), objects: new MockCollection() },
  notes: { render: jest.fn(), objects: new MockCollection() },
  tokens: { render: jest.fn(), objects: new MockCollection() },
  foreground: { render: jest.fn() },
  lighting: { render: jest.fn(), objects: new MockCollection() },
  sounds: { render: jest.fn(), objects: new MockCollection() },
  controls: { render: jest.fn() }
});

// Create JSDOM instance at module level
const dom = createJSDOMInstance();
const window = dom.window;

/**
 * Create browser globals configuration
 * @returns {Object} Browser globals object
 */
const createBrowserGlobals = () => {
  const jsdom = createJSDOMInstance();
  const { window } = jsdom;

  return {
    window: window,
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    console: window.console,
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    fetch: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('')
    }),
    XMLHttpRequest: window.XMLHttpRequest,
    Event: window.Event,
    CustomEvent: window.CustomEvent
  };
};

// Library globals configuration
/**
 * Create library globals configuration
 * @returns {Object} Library globals object
 */
const createLibraryGlobals = () => {
  const $ = () => ({
    on: () => {},
    off: () => {},
    trigger: () => {},
    addClass: () => {},
    removeClass: () => {},
    css: () => {},
    attr: () => {},
    prop: () => {},
    val: () => {},
    text: () => {},
    html: () => {},
    append: () => {},
    prepend: () => {},
    remove: () => {},
    find: () => $()
  });

  return {
    PIXI: {
      Application: class { constructor() {} },
      Container: class { constructor() {} },
      Graphics: class { constructor() {} },
      Sprite: class { constructor() {} },
      Texture: { from: () => {} },
      Loader: { shared: { add: () => {}, load: () => {} } }
    },
    $: $,
    jQuery: $,
    Handlebars: {
      compile: () => () => '',
      registerHelper: () => {},
      registerPartial: () => {}
    },
    io: () => ({
      on: () => {},
      emit: () => {},
      disconnect: () => {}
    }),
    dragula: () => ({
      on: () => {},
      destroy: () => {}
    })
  };
};

// Mock Foundry constants
const mockCONST = {
  USER_ROLES: { PLAYER: 1, TRUSTED: 2, ASSISTANT: 3, GAMEMASTER: 4 },
  ENTITY_PERMISSIONS: { NONE: 0, LIMITED: 1, OBSERVER: 2, OWNER: 3 },
  CHAT_MESSAGE_TYPES: { OTHER: 0, OOC: 1, IC: 2, EMOTE: 3, WHISPER: 4, ROLL: 5 }
};

// Mock Foundry configuration
const mockCONFIG = {
  Actor: { documentClass: MockActor },
  Item: { documentClass: MockItem },
  User: { documentClass: MockUser },
  debug: { hooks: false }
};

// Mock UI elements
const mockUI = {
  chat: { render: jest.fn() },
  combat: { render: jest.fn() },
  players: { render: jest.fn() },
  hotbar: { render: jest.fn() },
  sidebar: { render: jest.fn() },
  notifications: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
};

// Additional mock classes referenced in exports
class MockChatMessage extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 0;
    this.content = data.content || '';
    this.speaker = data.speaker || {};
  }
}

class MockCombat extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.round = data.round || 1;
    this.turn = data.turn || 0;
    this.combatants = new MockCollection();
  }
}

class MockToken extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.actor = data.actor || null;
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.elevation = data.elevation || 0;
  }
}

/**
 * Main MockGlobals class for managing test environment
 */
class MockGlobals {
  // Private methods at top
  #saveOriginal(key) {
    if (key in globalThis && !this.originals.has(key)) {
      this.originals.set(key, globalThis[key]);
    }
  }

  #initializeLibraryGlobals() {
    const libraryGlobals = createLibraryGlobals();
    Object.entries(libraryGlobals).forEach(([key, value]) => {
      this.#saveOriginal(key);
      globalThis[key] = value;
      this.managedKeys.add(key);
    });
  }

  #initializeFoundryNamespace() {
    this.#saveOriginal('foundry');
    globalThis.foundry = {
      utils: {
        mergeObject: (target, source) => ({ ...target, ...source }),
        duplicate: (obj) => JSON.parse(JSON.stringify(obj)),
        randomID: () => Math.random().toString(36).substr(2, 9)
      }
    };
    this.managedKeys.add('foundry');
  }

  #getFoundryClassesMap() {
    return {
      'Application': MockApplication,
      'Dialog': MockDialog,
      'Roll': MockRoll,
      'Actor': MockActor,
      'Item': MockItem,
      'User': MockUser,
      'Scene': MockScene,
      'ChatMessage': MockChatMessage,
      'Combat': MockCombat,
      'Token': MockToken,
      'Folder': MockFolder
    };
  }

  #getCoreFoundryObjectMap(game, hooks) {
    return {
      'game': game,
      'Hooks': hooks,
      'CONFIG': mockCONFIG,
      'CONST': mockCONST,
      'ui': mockUI,
      'canvas': game.canvas
    };
  }

  #assignMockClass(map, backupOriginal = true) {
    for (const [key, MockClass] of Object.entries(map)) {
      if (backupOriginal) this.#saveOriginal(key);
      globalThis[key] = MockClass;
      this.managedKeys.add(key);
    }
  }

  #initializeFoundryClasses() {
    const foundryClassesMap = this.#getFoundryClassesMap();
    this.#assignMockClass(foundryClassesMap);
  }

  #initializeCoreFoundryObjects(game, hooks) {
    const coreFoundryObjectMap = this.#getCoreFoundryObjectMap(game, hooks);
    this.#assignMockClass(coreFoundryObjectMap, false);
  }

  #setupFoundryGlobals(gameInstance, hooksInstance) {
    const game = gameInstance || this.game;
    const hooks = hooksInstance || this.hooks;

    this.#initializeCoreFoundryObjects(game, hooks);
    this.#initializeFoundryClasses();
    this.#initializeFoundryNamespace();
  }

  #restoreOriginalValues() {
    this.originals.forEach((value, key) => {
      if (this.managedKeys.has(key)) {
        globalThis[key] = value;
      }
    });
  }

  #deleteNonOriginalGlobals() {
    this.managedKeys.forEach(key => {
      if (!this.originals.has(key) && key in globalThis) {
        delete globalThis[key];
      }
    });
  }

  // Public constructor
  constructor() {
    this.game = new MockGame();
    this.hooks = MockHooks;
    this.originals = new Map();
    this.managedKeys = new Set();
  }

  // Public methods at bottom
  setGlobals({
    browser = true,
    foundry = true,
    libraries = true,
    gameInstance = null,
    hooksInstance = null
  } = {}) {
    this.managedKeys.clear();

    // Create fresh instances if not provided to ensure test isolation
    if (foundry && !gameInstance) {
      this.game = new MockGame();
    }
    if (foundry && !hooksInstance) {
      this.hooks = new MockHooks();
      MockHooks._instance = this.hooks;
    }

    if (browser) this.initializeBrowserGlobals();
    if (foundry) this.#setupFoundryGlobals(gameInstance, hooksInstance);
    if (libraries) this.#initializeLibraryGlobals();
  }

  initializeBrowserGlobals() {
    const browserGlobals = createBrowserGlobals();
    Object.entries(browserGlobals).forEach(([key, value]) => {
      this.#saveOriginal(key);
      globalThis[key] = value;
      this.managedKeys.add(key);
    });
  }

  clearGlobals() {
    this.#restoreOriginalValues();
    this.#deleteNonOriginalGlobals();
    this.originals.clear();
    this.managedKeys.clear();
  }

  getGame() {
    return this.game;
  }

  getHooks() {
    return this.hooks;
  }

  reset() {
    this.game = new MockGame();
    MockHooks._instance = new MockHooks();

    // Only clear jest mocks if jest is available
    if (typeof jest !== 'undefined' && jest.clearAllMocks) {
      jest.clearAllMocks();
    }
  }
}

// Export mock classes and the main MockGlobals class
export {
  MockCollection,
  MockDocument,
  MockActor,
  MockItem,
  MockUser,
  MockApplication,
  MockDialog,
  MockRoll,
  MockSettings,
  MockHooks,
  MockGame,
  MockScene,
  MockChatMessage,
  MockCombat,
  MockToken,
  MockFolder,
  createBrowserGlobals,
  createLibraryGlobals,
  mockCONST as CONST,
  mockCONFIG as CONFIG,
  mockUI as UI
};

export default MockGlobals;
