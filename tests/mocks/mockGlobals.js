/**
 * @file mockGlobals.js
 * @description Comprehensive mock globals for Foundry VTT v13 integration testing
 * @path tests/mocks/mockGlobals.js
 * 
 * This file provides a complete mock environment for Foundry VTT integration testing,
 * including all major API components, document types, and UI systems. Based on the
 * official Foundry VTT API v13 documentation.
 * 
 * Features:
 * - Complete Foundry VTT document system (Actor, Item, Scene, Combat, etc.)
 * - Canvas and rendering system with layers and objects
 * - Hooks event system for module communication
 * - Settings management and user permissions
 * - Browser globals via JSDOM (DOM, localStorage, etc.)
 * - Library mocks (PIXI, jQuery, Handlebars)
 * - Test data initialization with sample entities
 * - Easy setup/teardown with MockGlobals class
 * 
 * Usage:
 * ```javascript
 * import MockGlobals from './mocks/mockGlobals.js';
 * 
 * const mockGlobals = new MockGlobals();
 * mockGlobals.setGlobals({ foundry: true, browser: true, libraries: true });
 * 
 * // Your tests here - all Foundry globals are now available
 * expect(game.ready).toBeDefined();
 * expect(game.user.isGM).toBe(true);
 * 
 * mockGlobals.clearGlobals(); // Clean up
 * ```
 */

import { JSDOM } from 'jsdom';

// Create a JSDOM instance for browser-like globals
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { 
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});
const window = dom.window;

/**
 * Mock Collection class that extends Map to simulate Foundry's Collection behavior
 */
class MockCollection extends Map {
  constructor(entries = []) {
    super(entries);
  }

  /**
   * Find an entity by a predicate function
   * @param {Function} predicate - Function to test each element
   * @returns {*} The first element that matches the predicate
   */
  find(predicate) {
    for (const [key, value] of this) {
      if (predicate(value, key)) return value;
    }
    return undefined;
  }

  /**
   * Filter entities by a predicate function
   * @param {Function} predicate - Function to test each element
   * @returns {Array} Array of elements that match the predicate
   */
  filter(predicate) {
    const results = [];
    for (const [key, value] of this) {
      if (predicate(value, key)) results.push(value);
    }
    return results;
  }

  /**
   * Get entity by ID
   * @param {string} id - The entity ID
   * @returns {*} The entity or undefined
   */
  get(id) {
    return super.get(id);
  }

  /**
   * Convert collection to array
   * @returns {Array} Array of collection values
   */
  toArray() {
    return Array.from(this.values());
  }

  /**
   * Get collection contents
   * @returns {Array} Array of collection values
   */
  get contents() {
    return this.toArray();
  }
}

/**
 * Mock Document class representing Foundry Document entities
 */
class MockDocument {
  constructor(data = {}, options = {}) {
    this.id = data.id || `mock-${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name || 'Mock Document';
    this.data = { ...data };
    this.flags = data.flags || {};
    this.permission = data.permission || 3; // OWNER permission
    this.sort = data.sort || 0;
    this.folder = data.folder || null;
    this._source = { ...data };
  }

  /**
   * Get a flag value
   * @param {string} scope - The flag scope
   * @param {string} key - The flag key
   * @returns {*} The flag value
   */
  getFlag(scope, key) {
    return this.flags[scope]?.[key];
  }

  /**
   * Set a flag value
   * @param {string} scope - The flag scope
   * @param {string} key - The flag key
   * @param {*} value - The flag value
   * @returns {Promise<MockDocument>} Updated document
   */
  async setFlag(scope, key, value) {
    if (!this.flags[scope]) this.flags[scope] = {};
    this.flags[scope][key] = value;
    return this;
  }

  /**
   * Update the document
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<MockDocument>} Updated document
   */
  async update(data, options = {}) {
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Delete the document
   * @param {Object} options - Delete options
   * @returns {Promise<MockDocument>} Deleted document
   */
  async delete(options = {}) {
    return this;
  }
}

/**
 * Mock Actor class
 */
class MockActor extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 'character';
    this.system = data.system || {};
    this.items = new MockCollection();
    this.effects = new MockCollection();
  }

  /**
   * Get actor items by type
   * @param {string} type - Item type
   * @returns {Array} Array of items
   */
  itemTypes(type) {
    return this.items.filter(item => item.type === type);
  }
}

/**
 * Mock Item class
 */
class MockItem extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 'equipment';
    this.system = data.system || {};
  }
}

/**
 * Mock User class
 */
class MockUser extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.role = data.role || 4; // GAMEMASTER
    this.active = data.active ?? true;
    this.character = data.character || null;
  }

  get isGM() {
    return this.role >= 4;
  }
}

/**
 * Mock Application class for UI applications
 */
class MockApplication {
  constructor(options = {}) {
    this.options = options;
    this.rendered = false;
    this.element = null;
  }

  async render(force = false) {
    this.rendered = true;
    return this;
  }

  async close() {
    this.rendered = false;
    return this;
  }
}

/**
 * Mock Dialog class
 */
class MockDialog extends MockApplication {
  static async wait(config) {
    return new Promise(resolve => {
      setTimeout(() => resolve(config.default || 'ok'), 10);
    });
  }

  static async confirm(config) {
    return Promise.resolve(true);
  }

  static async prompt(config) {
    return Promise.resolve(config.default || '');
  }
}

/**
 * Mock Roll class for dice rolling
 */
class MockRoll {
  constructor(formula, data = {}) {
    this.formula = formula;
    this.data = data;
    this.total = Math.floor(Math.random() * 20) + 1; // Simple random result
    this.dice = [];
    this.terms = [];
  }

  async evaluate() {
    return this;
  }

  async render() {
    return `<div class="dice-roll">${this.formula} = ${this.total}</div>`;
  }

  static create(formula, data = {}) {
    return new MockRoll(formula, data);
  }
}

/**
 * Mock Settings class for game settings
 */
class MockSettings {
  constructor() {
    this.storage = new Map();
  }

  register(module, key, data) {
    const settingKey = `${module}.${key}`;
    this.storage.set(settingKey, { ...data, value: data.default });
  }

  get(module, key) {
    const settingKey = `${module}.${key}`;
    const setting = this.storage.get(settingKey);
    return setting ? setting.value : undefined;
  }

  async set(module, key, value) {
    const settingKey = `${module}.${key}`;
    const setting = this.storage.get(settingKey);
    if (setting) {
      setting.value = value;
    }
    return value;
  }
}

/**
 * Mock Hooks system for event handling
 */
class MockHooks {
  constructor() {
    this.events = new Map();
  }

  static on(event, callback) {
    if (!this._instance) this._instance = new MockHooks();
    if (!this._instance.events.has(event)) {
      this._instance.events.set(event, []);
    }
    this._instance.events.get(event).push(callback);
  }

  static off(event, callback) {
    if (!this._instance) return;
    const callbacks = this._instance.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  static call(event, ...args) {
    if (!this._instance) return true;
    const callbacks = this._instance.events.get(event) || [];
    for (const callback of callbacks) {
      try {
        const result = callback(...args);
        if (result === false) return false;
      } catch (error) {
        console.error(`Hook error in ${event}:`, error);
      }
    }
    return true;
  }

  static callAll(event, ...args) {
    return this.call(event, ...args);
  }
}

/**
 * Mock Game class representing the main game instance
 */
class MockGame {
  constructor() {
    // Core properties
    this.ready = false;
    this.userId = 'mock-user-id';
    this.worldId = 'mock-world';
    this.systemId = 'mock-system';
    this.version = '11.315';
    this.release = { generation: 11, build: 315 };
    
    // Collections
    this.actors = new MockCollection();
    this.items = new MockCollection();
    this.scenes = new MockCollection();
    this.users = new MockCollection();
    this.modules = new MockCollection();
    this.packs = new MockCollection();
    this.folders = new MockCollection();
    this.playlists = new MockCollection();
    this.tables = new MockCollection();
    this.macros = new MockCollection();
    this.cards = new MockCollection();
    this.combats = new MockCollection();
    this.journal = new MockCollection();
    this.messages = new MockCollection();

    // Current document references
    this.scene = null;
    this.combat = null;

    // Systems and managers
    this.settings = new MockSettings();
    this.keyboard = { isDown: jest.fn(() => false) };
    this.socket = { emit: jest.fn(), on: jest.fn(), off: jest.fn() };
    this.time = { worldTime: 0, advance: jest.fn() };
    this.paused = false;

    // User and permissions
    this.user = new MockUser({ 
      id: this.userId, 
      name: 'Mock User', 
      role: 4,
      active: true 
    });

    // Canvas and rendering
    this.canvas = {
      ready: false,
      scene: null,
      dimensions: { width: 1920, height: 1080 },
      stage: {},
      app: {
        renderer: {
          width: 1920,
          height: 1080,
          resolution: 1
        }
      },
      grid: { 
        size: 100, 
        type: 1,
        distance: 5,
        units: 'ft'
      },
      // Canvas layers
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
      controls: { render: jest.fn() },
      // Canvas groups
      primary: {},
      effects: {},
      interface: {},
      overlay: {},
      environment: {},
      visibility: {},
      // Methods
      draw: jest.fn(),
      pan: jest.fn(),
      animatePan: jest.fn(),
      tear: jest.fn()
    };

    // Audio system
    this.audio = {
      playing: new Map(),
      locked: false,
      unlock: jest.fn()
    };

    // Video system  
    this.video = {
      settings: {},
      getTexture: jest.fn()
    };

    // Localization
    this.i18n = {
      lang: 'en',
      translations: {},
      localize: (key) => {
        const defaultTranslations = {
          'SETTINGS.Configure': 'Configure Settings',
          'FOLDER.Create': 'Create Folder',
          'ENTITY.Create': 'Create Entity',
          'ENTITY.Update': 'Update Entity',
          'ENTITY.Delete': 'Delete Entity'
        };
        return defaultTranslations[key] || key;
      },
      format: (key, data) => {
        const str = this.i18n.localize(key);
        return str.replace(/{(\w+)}/g, (match, prop) => data[prop] || match);
      }
    };

    // Tooltip system
    this.tooltip = {
      activate: jest.fn(),
      deactivate: jest.fn()
    };

    // Add some default entities for testing
    this._initializeDefaultEntities();
  }

  /**
   * Initialize some default entities for testing purposes
   */
  _initializeDefaultEntities() {
    // Add a test user
    this.users.set(this.userId, this.user);

    // Add a test module
    const testModule = {
      id: 'test-module',
      title: 'Test Module',
      active: true,
      api: {},
      flags: {}
    };
    this.modules.set('test-module', testModule);

    // Add test scene
    const testScene = new MockScene({
      id: 'test-scene',
      name: 'Test Scene',
      active: true,
      navigation: true
    });
    this.scenes.set('test-scene', testScene);
    this.scene = testScene;
    this.canvas.scene = testScene;

    // Add test actor
    const testActor = new MockActor({
      id: 'test-actor',
      name: 'Test Character',
      type: 'character'
    });
    this.actors.set('test-actor', testActor);

    // Add test item
    const testItem = new MockItem({
      id: 'test-item',
      name: 'Test Sword',
      type: 'weapon'
    });
    this.items.set('test-item', testItem);

    // Add test folder
    const testFolder = new MockFolder({
      id: 'test-folder',
      name: 'Test Folder',
      type: 'Actor'
    });
    this.folders.set('test-folder', testFolder);
  }

  /**
   * Get current user
   * @returns {MockUser} Current user
   */
  get currentUser() {
    return this.user;
  }

  /**
   * Check if current user is GM
   * @returns {boolean} True if user is GM
   */
  get isGM() {
    return this.user.isGM;
  }
}

/**
 * Mock Scene class
 */
class MockScene extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.width = data.width || 4000;
    this.height = data.height || 3000;
    this.padding = data.padding || 0.25;
    this.backgroundColor = data.backgroundColor || '#999999';
    this.gridType = data.gridType || 1; // SQUARE
    this.gridSize = data.gridSize || 100;
    this.active = data.active || false;
    this.navigation = data.navigation || false;
    this.foreground = data.foreground || null;
    this.thumb = data.thumb || null;
    this.tokens = new MockCollection();
    this.lights = new MockCollection();
    this.sounds = new MockCollection();
    this.notes = new MockCollection();
    this.drawings = new MockCollection();
    this.walls = new MockCollection();
    this.tiles = new MockCollection();
    this.templates = new MockCollection();
    this.regions = new MockCollection();
  }

  /**
   * View this scene
   * @returns {Promise<MockScene>} This scene
   */
  async view() {
    this.active = true;
    if (globalThis.game) globalThis.game.canvas.scene = this;
    return this;
  }

  /**
   * Activate this scene
   * @returns {Promise<MockScene>} This scene
   */
  async activate() {
    this.active = true;
    return this;
  }
}

/**
 * Mock ChatMessage class
 */
class MockChatMessage extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.content = data.content || '';
    this.speaker = data.speaker || {};
    this.type = data.type || 0; // OTHER
    this.whisper = data.whisper || [];
    this.blind = data.blind || false;
    this.timestamp = data.timestamp || Date.now();
    this.flavor = data.flavor || '';
    this.sound = data.sound || null;
    this.roll = data.roll || null;
  }

  /**
   * Get the alias for the speaker
   * @returns {string} Speaker alias
   */
  get alias() {
    return this.speaker.alias || this.speaker.name || 'Unknown';
  }

  /**
   * Check if message is visible to user
   * @param {MockUser} user - User to check
   * @returns {boolean} True if visible
   */
  isContentVisible(user = null) {
    const currentUser = user || globalThis.game?.user;
    if (!currentUser) return true;
    
    // GM can see everything
    if (currentUser.isGM) return true;
    
    // Check whispers
    if (this.whisper.length > 0) {
      return this.whisper.includes(currentUser.id);
    }
    
    return true;
  }
}

/**
 * Mock Combat class
 */
class MockCombat extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.scene = data.scene || null;
    this.round = data.round || 0;
    this.turn = data.turn || 0;
    this.started = data.started || false;
    this.combatants = new MockCollection();
    this.current = null;
  }

  /**
   * Start combat
   * @returns {Promise<MockCombat>} This combat
   */
  async startCombat() {
    this.started = true;
    this.round = 1;
    this.turn = 0;
    return this;
  }

  /**
   * Next turn
   * @returns {Promise<MockCombat>} This combat
   */
  async nextTurn() {
    this.turn++;
    if (this.turn >= this.combatants.size) {
      this.turn = 0;
      this.round++;
    }
    return this;
  }

  /**
   * End combat
   * @returns {Promise<MockCombat>} This combat
   */
  async endCombat() {
    this.started = false;
    this.round = 0;
    this.turn = 0;
    return this;
  }
}

/**
 * Mock Token class
 */
class MockToken extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.width = data.width || 1;
    this.height = data.height || 1;
    this.scale = data.scale || 1;
    this.hidden = data.hidden || false;
    this.actorId = data.actorId || null;
    this.actorLink = data.actorLink || false;
    this.texture = data.texture || { src: null };
    this.vision = data.vision || false;
    this.brightSight = data.brightSight || 0;
    this.dimSight = data.dimSight || 0;
  }

  /**
   * Get the actor this token represents
   * @returns {MockActor|null} The actor
   */
  get actor() {
    if (!this.actorId || !globalThis.game) return null;
    return globalThis.game.actors.get(this.actorId);
  }
}

/**
 * Mock Folder class
 */
class MockFolder extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 'Item';
    this.parent = data.parent || null;
    this.color = data.color || null;
    this.sorting = data.sorting || 'a';
    this.depth = data.depth || 1;
    this.children = new MockCollection();
    this.contents = new MockCollection();
  }
}

/**
 * Foundry VTT Constants mock
 */
const mockCONST = {
  // User roles
  USER_ROLES: {
    NONE: 0,
    PLAYER: 1,
    TRUSTED: 2,
    ASSISTANT: 3,
    GAMEMASTER: 4
  },

  // Document permissions
  DOCUMENT_PERMISSION_LEVELS: {
    INHERIT: -1,
    NONE: 0,
    LIMITED: 1,
    OBSERVER: 2,
    OWNER: 3
  },

  // Grid types
  GRID_TYPES: {
    SQUARE: 1,
    HEXAGONAL_COLUMNS_ODD: 2,
    HEXAGONAL_COLUMNS_EVEN: 3,
    HEXAGONAL_ROWS_ODD: 4,
    HEXAGONAL_ROWS_EVEN: 5,
    GRIDLESS: 0
  },

  // Chat message types
  CHAT_MESSAGE_TYPES: {
    OTHER: 0,
    OOC: 1,
    IC: 2,
    EMOTE: 3,
    WHISPER: 4,
    ROLL: 5
  },

  // Active effect modes
  ACTIVE_EFFECT_MODES: {
    CUSTOM: 0,
    MULTIPLY: 1,
    ADD: 2,
    DOWNGRADE: 3,
    UPGRADE: 4,
    OVERRIDE: 5
  }
};

/**
 * Mock CONFIG object
 */
const mockCONFIG = {
  debug: false,
  time: {
    turnTime: 0,
    worldTime: 0
  },
  Actor: {
    documentClass: MockActor,
    collection: MockCollection,
    sidebarIcon: 'fas fa-user'
  },
  Item: {
    documentClass: MockItem,
    collection: MockCollection,
    sidebarIcon: 'fas fa-suitcase'
  },
  Scene: {
    documentClass: MockScene,
    collection: MockCollection,
    sidebarIcon: 'fas fa-map'
  },
  ChatMessage: {
    documentClass: MockChatMessage,
    collection: MockCollection,
    sidebarIcon: 'fas fa-comments'
  },
  Combat: {
    documentClass: MockCombat,
    collection: MockCollection,
    sidebarIcon: 'fas fa-sword'
  },
  Token: {
    documentClass: MockToken,
    collection: MockCollection
  },
  Folder: {
    documentClass: MockFolder,
    collection: MockCollection,
    sidebarIcon: 'fas fa-folder'
  },
  User: {
    documentClass: MockUser,
    collection: MockCollection
  },
  ui: {
    notifications: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      notify: jest.fn()
    }
  },
  Canvas: {
    blurStrength: 8,
    darknessColor: 0x242448,
    dispositionColors: {
      HOSTILE: 0xe72124,
      NEUTRAL: 0xf1d836,
      FRIENDLY: 0x43dfdf,
      PARTY: 0x33bc4e,
      CONTROLLED: 0xff9829
    }
  },
  controlIcons: {
    effects: 'modules/foundryvtt-over-my-head/assets/icons/effect.svg'
  }
};

/**
 * Mock UI object
 */
const mockUI = {
  notifications: {
    info: jest.fn((message) => console.log(`INFO: ${message}`)),
    warn: jest.fn((message) => console.warn(`WARN: ${message}`)),
    error: jest.fn((message) => console.error(`ERROR: ${message}`)),
    notify: jest.fn((message) => console.log(`NOTIFY: ${message}`))
  },
  sidebar: {
    tabs: {},
    activeTab: 'chat',
    render: jest.fn()
  },
  nav: {
    render: jest.fn()
  },
  controls: {
    render: jest.fn()
  },
  hotbar: {
    render: jest.fn()
  },
  chat: {
    render: jest.fn(),
    scrollBottom: jest.fn()
  },
  players: {
    render: jest.fn()
  },
  webrtc: {
    render: jest.fn()
  }
};

/**
 * Browser globals from JSDOM
 */
const browserGlobals = {
  window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  EventTarget: window.EventTarget,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  File: window.File,
  FileReader: window.FileReader,
  FormData: window.FormData,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  setInterval: window.setInterval,
  clearInterval: window.clearInterval,
  fetch: window.fetch || jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })),
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  console: window.console
};

/**
 * Library globals commonly used with Foundry
 */
const libraryGlobals = {
  PIXI: {
    Application: jest.fn(),
    Container: jest.fn(),
    Graphics: jest.fn(),
    Text: jest.fn(),
    Texture: {
      from: jest.fn(() => ({})),
      EMPTY: {}
    },
    utils: {
      TextureCache: {},
      BaseTextureCache: {}
    },
    settings: {
      RESOLUTION: 1
    }
  },
  $: jest.fn((selector) => ({
    addClass: jest.fn(),
    removeClass: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    find: jest.fn(() => ({ length: 0 })),
    length: 0
  })),
  jQuery: jest.fn((selector) => libraryGlobals.$(selector)),
  Handlebars: {
    compile: jest.fn(() => jest.fn()),
    registerHelper: jest.fn(),
    registerPartial: jest.fn()
  }
};

/**
 * Main MockGlobals class for managing test environment
 */
class MockGlobals {
  constructor() {
    this.game = new MockGame();
    this.hooks = MockHooks;
    this.originals = new Map();
    this.managedKeys = new Set();
  }

  /**
   * Save original global value
   * @param {string} key - Global key
   */
  _saveOriginal(key) {
    if (key in globalThis && !this.originals.has(key)) {
      this.originals.set(key, globalThis[key]);
    }
  }

  /**
   * Set up mock globals for testing
   * @param {Object} options - Configuration options
   * @param {boolean} options.browser - Include browser globals
   * @param {boolean} options.foundry - Include Foundry globals  
   * @param {boolean} options.libraries - Include library globals
   * @param {MockGame} options.gameInstance - Custom game instance
   * @param {MockHooks} options.hooksInstance - Custom hooks instance
   */
  setGlobals({ 
    browser = true, 
    foundry = true, 
    libraries = true, 
    gameInstance = null, 
    hooksInstance = null 
  } = {}) {
    this.managedKeys.clear();

    // Set browser globals
    if (browser) {
      Object.entries(browserGlobals).forEach(([key, value]) => {
        this._saveOriginal(key);
        globalThis[key] = value;
        this.managedKeys.add(key);
      });
    }

    // Set Foundry globals
    if (foundry) {
      const game = gameInstance || this.game;
      const hooks = hooksInstance || this.hooks;

      // Core Foundry objects
      this._saveOriginal('game');
      globalThis.game = game;
      this.managedKeys.add('game');

      this._saveOriginal('Hooks');
      globalThis.Hooks = hooks;
      this.managedKeys.add('Hooks');

      this._saveOriginal('CONFIG');
      globalThis.CONFIG = mockCONFIG;
      this.managedKeys.add('CONFIG');

      this._saveOriginal('CONST');
      globalThis.CONST = mockCONST;
      this.managedKeys.add('CONST');

      this._saveOriginal('ui');
      globalThis.ui = mockUI;
      this.managedKeys.add('ui');

      this._saveOriginal('canvas');
      globalThis.canvas = game.canvas;
      this.managedKeys.add('canvas');

      // Foundry classes
      this._saveOriginal('Application');
      globalThis.Application = MockApplication;
      this.managedKeys.add('Application');

      this._saveOriginal('Dialog');
      globalThis.Dialog = MockDialog;
      this.managedKeys.add('Dialog');

      this._saveOriginal('Roll');
      globalThis.Roll = MockRoll;
      this.managedKeys.add('Roll');

      this._saveOriginal('Actor');
      globalThis.Actor = MockActor;
      this.managedKeys.add('Actor');

      this._saveOriginal('Item');
      globalThis.Item = MockItem;
      this.managedKeys.add('Item');

      this._saveOriginal('User');
      globalThis.User = MockUser;
      this.managedKeys.add('User');

      this._saveOriginal('Scene');
      globalThis.Scene = MockScene;
      this.managedKeys.add('Scene');

      this._saveOriginal('ChatMessage');
      globalThis.ChatMessage = MockChatMessage;
      this.managedKeys.add('ChatMessage');

      this._saveOriginal('Combat');
      globalThis.Combat = MockCombat;
      this.managedKeys.add('Combat');

      this._saveOriginal('Token');
      globalThis.Token = MockToken;
      this.managedKeys.add('Token');

      this._saveOriginal('Folder');
      globalThis.Folder = MockFolder;
      this.managedKeys.add('Folder');

      // Set foundry namespace if not present
      this._saveOriginal('foundry');
      globalThis.foundry = {
        utils: {
          mergeObject: jest.fn((target, source) => ({ ...target, ...source })),
          duplicate: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
          randomID: jest.fn(() => Math.random().toString(36).substr(2, 9))
        }
      };
      this.managedKeys.add('foundry');
    }

    // Set library globals
    if (libraries) {
      Object.entries(libraryGlobals).forEach(([key, value]) => {
        this._saveOriginal(key);
        globalThis[key] = value;
        this.managedKeys.add(key);
      });
    }
  }

  /**
   * Clear all mock globals and restore originals
   */
  clearGlobals() {
    // Restore original values
    this.originals.forEach((value, key) => {
      if (this.managedKeys.has(key)) {
        globalThis[key] = value;
      }
    });

    // Delete globals that didn't exist originally
    this.managedKeys.forEach(key => {
      if (!this.originals.has(key) && key in globalThis) {
        delete globalThis[key];
      }
    });

    // Reset tracking
    this.originals.clear();
    this.managedKeys.clear();
  }

  /**
   * Get the mock game instance
   * @returns {MockGame} Mock game instance
   */
  getGame() {
    return this.game;
  }

  /**
   * Get mock hooks instance
   * @returns {MockHooks} Mock hooks instance
   */
  getHooks() {
    return this.hooks;
  }

  /**
   * Reset all mocks to their initial state
   */
  reset() {
    this.game = new MockGame();
    MockHooks._instance = new MockHooks();
    
    // Reset all jest mocks
    jest.clearAllMocks();
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
  browserGlobals,
  libraryGlobals,
  mockCONST as CONST,
  mockCONFIG as CONFIG,
  mockUI as UI
};

export default MockGlobals;
