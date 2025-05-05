// Simple mock for Foundry VTT collections
class MockCollection extends Map {
  constructor(...args) {
    super(...args);
  }
  get(key) {
    return super.get(key);
  }
  // Add other methods like find, filter, etc. as needed for tests
}

// Mock for helper classes/managers
const mockHelper = (name) => ({
  _mockName: name,
  // Add common methods/properties if needed across helpers
});

class MockGame {
  constructor() {
    // Core properties observed in the game object
    this.actors = new MockCollection();
    this.audio = mockHelper('AudioHelper'); // Mock AudioHelper
    this.canvas = {
      ready: false,
      // Add mock canvas properties/methods as needed (layers, stage, dimensions, etc.)
      layers: {}, // Example: Add layers property if needed by code under test
      stage: {}, // Example: Add stage property
      // ... other canvas properties
    };
    this.cards = new MockCollection(); // Mock CardStacks
    this.clipboard = mockHelper('ClipboardHelper'); // Mock ClipboardHelper
    // this.collections is implicitly represented by the individual collection properties (actors, items, etc.)
    this.combats = new MockCollection(); // Mock CombatEncounters
    this.compendiumArt = mockHelper('CompendiumArt'); // Mock CompendiumArt
    this.compendiumUUIDRedirects = mockHelper('StringTree'); // Mock StringTree
    // this.data is defined later, ensure userId is set correctly
    this.debug = false; // Mock debug flag
    this.documentIndex = mockHelper('DocumentIndex'); // Mock DocumentIndex
    this.folders = new MockCollection();
    this.gamepad = mockHelper('GamepadManager'); // Mock GamepadManager
    this.i18n = { // Mock Localization (already existed)
      lang: 'en',
      translations: {},
      localize: (key) => {
        const translations = {
          'game.start': 'Game started',
          'game.end': 'Game ended',
          'game.pause': 'Game paused',
          // Add other mock translations as needed
        };
        return translations[key] || key;
      },
      format: (key, data) => {
        let localized = this.i18n.localize(key);
        for (const k in data) {
          localized = localized.replace(`{${k}}`, data[k]);
        }
        return localized;
      }
      // Add other i18n methods like has as needed
    };
    this.issues = mockHelper('ClientIssues'); // Mock ClientIssues
    this.items = new MockCollection();
    this.journal = new MockCollection();
    this.keybindings = mockHelper('ClientKeybindings'); // Mock ClientKeybindings
    this.keyboard = mockHelper('KeyboardManager'); // Mock KeyboardManager
    this.loading = false; // Mock loading flag
    this.macros = new MockCollection();
    this.messages = new MockCollection();
    this.modules = new Map([ // Mock Modules Collection (already existed)
      ['test-module', {
        id: 'test-module',
        title: 'Test Module',
        active: true,
        api: {}, // For exposed module APIs
        // Add other module properties as needed
      }],
      ['foundryvtt-over-my-head', { // Add the module being tested
        id: 'foundryvtt-over-my-head',
        title: 'Over My Head',
        active: true,
        api: {},
      }]
    ]);
    this.mouse = mockHelper('MouseManager'); // Mock MouseManager
    this.nue = mockHelper('NewUserExperience'); // Mock NewUserExperience
    this.packs = new MockCollection(); // Mock CompendiumPacks (already existed)
    this.permissions = {}; // Mock permissions object (add specific permissions if needed)
    this.playlists = new MockCollection();
    this.ready = true; // Mock ready flag (already existed)
    this.release = { // Mock ReleaseData (already existed)
      generation: 12,
      number: 12,
      channel: 'stable',
      // ... other release properties
    };
    this.scenes = new MockCollection();
    this.sessionId = "mock-session-id-" + Math.random().toString(36).substring(2); // Mock sessionId
    this.settings = { // Mock ClientSettings (already existed, ensure methods match)
      settings: new Map(), // Store registered settings
      menus: new Map(), // Store registered menus
      storage: new Map(), // Mock storage backend
      get: (module, key) => {
        const setting = this.settings.settings.get(`${module}.${key}`);
        // Fallback to internal data for compatibility if needed, but prefer settings map
        return setting?.default ?? this.settingsData[`${module}.${key}`]?.default;
      },
      register: (module, key, data) => {
        this.settings.settings.set(`${module}.${key}`, data);
        // Keep internal data for compatibility if needed
        this.settingsData[`${module}.${key}`] = data;
      },
      registerMenu: (module, key, data) => {
        this.settings.menus.set(`${module}.${key}`, data);
      },
      set: async (module, key, value) => {
          const settingKey = `${module}.${key}`;
          const setting = this.settings.settings.get(settingKey);
          if (setting) {
              setting.currentValue = value; // Simulate setting the value
              this.settings.storage.set(settingKey, value); // Simulate storage
              if (setting.onChange) {
                  setting.onChange(value);
              }
          }
          return value;
      }
      // Add other methods like set, registerMenu as needed
    };
    this.settingsData = { // Keep for potential backward compatibility or simple tests
      'test-module.test-setting': {
        name: 'Test Setting',
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
        onChange: () => {},
      }
    };
    // Initialize settings map from settingsData
    Object.entries(this.settingsData).forEach(([key, data]) => {
        this.settings.settings.set(key, data);
    });

    this.socket = { // Mock Socket (already existed)
      connected: true,
      emit: (event, ...args) => { console.log('Mock Socket Emit:', event, args); },
      on: (event, handler) => { console.log('Mock Socket On:', event); },
      off: (event, handler) => { console.log('Mock Socket Off:', event); },
      // Add other socket properties/methods as needed
    };
    this.system = { // Mock System (already existed)
      id: 'mock-system',
      title: 'Mock System',
      version: '1.0.0',
      // Add other system properties as needed
    };
    this.tables = new MockCollection(); // Mock RollTables
    this.time = { // Mock GameTime (already existed)
      worldTime: 0,
      advance: (ms) => { this.time.worldTime += ms; },
      // Add other time properties if needed
    };
    this.tooltip = mockHelper('TooltipManager'); // Mock TooltipManager
    this.tours = new MockCollection(); // Mock Tours
    this.userId = 'test-user-id'; // Mock userId (ensure consistency with user object)
    this.users = new MockCollection(); // Mock Users collection (already existed)
    this.user = { // Mock User object (already existed)
      id: this.userId, // Use the same ID
      name: 'Test User',
      active: true,
      isGM: true,
      character: null,
      permissions: {},
      // Add other user properties as needed (e.g., role)
    };
    // Add the mock user to the users collection
    this.users.set(this.user.id, this.user);

    this.video = mockHelper('VideoHelper'); // Mock VideoHelper
    this.view = "game"; // Mock view
    this.webrtc = mockHelper('AVMaster'); // Mock AVMaster
    this.workers = mockHelper('WorkerManager'); // Mock WorkerManager
    this.world = { // Mock World (already existed)
      id: 'mock-world',
      title: 'Mock World',
      system: this.system.id,
      // Add other world properties as needed
    };

    // Mock internal/private-like properties if strictly necessary
    this._documentsReady = true; // Mock _documentsReady
    // this.#documentTypes = {}; // Avoid mocking private fields unless essential
    // this.#model = {};
    // this.#template = {};

    // Ensure this.data is populated correctly after other properties are set
    this.data = { // Mock game data (already existed)
        userId: this.userId, // Use consistent userId
        release: this.release,
        world: this.world,
        system: this.system,
        modules: Array.from(this.modules.values()), // Populate from modules Map
        // ... other data properties
    };


    // Other common game properties (already existed)
    this.activeEditor = null; // Mock TinyMCE editor
    this.paused = false;

    // Deprecated/Removed properties from original mock are handled by the new structure
  }

  // Method to update the static properties based on an instance (useful in tests)
  static updateStatic(instance) {
    // Update existing static mocks
    MockGame.module = instance.modules;
    MockGame.ui = instance.ui; // Ensure ui is defined in constructor
    MockGame.settings = instance.settings;
    MockGame.user = instance.user;
    MockGame.world = instance.world;
    MockGame.i18n = instance.i18n;

    // Add new static mocks corresponding to instance properties if needed
    MockGame.actors = instance.actors;
    MockGame.items = instance.items;
    MockGame.scenes = instance.scenes;
    MockGame.users = instance.users;
    MockGame.messages = instance.messages;
    MockGame.canvas = instance.canvas;
    MockGame.socket = instance.socket;
    // Add others as necessary for static access patterns in the code under test
  }

  getGame() {
    // Return the current instance of the game object
    return this;
  }

  // Initialize static properties (can be updated by updateStatic)
  static actors = new MockCollection();
  static audio = mockHelper('StaticAudioHelper');
  static canvas = { ready: false };
  static cards = new MockCollection();
  static clipboard = mockHelper('StaticClipboardHelper');
  static combats = new MockCollection();
  static compendiumArt = mockHelper('StaticCompendiumArt');
  static compendiumUUIDRedirects = mockHelper('StaticStringTree');
  static debug = false;
  static documentIndex = mockHelper('StaticDocumentIndex');
  static folders = new MockCollection();
  static gamepad = mockHelper('StaticGamepadManager');
  static i18n = { localize: key => key, format: key => key };
  static issues = mockHelper('StaticClientIssues');
  static items = new MockCollection();
  static journal = new MockCollection();
  static keybindings = mockHelper('StaticClientKeybindings');
  static keyboard = mockHelper('StaticKeyboardManager');
  static loading = false;
  static macros = new MockCollection();
  static messages = new MockCollection();
  static modules = new Map();
  static mouse = mockHelper('StaticMouseManager');
  static packs = new MockCollection();
  static playlists = new MockCollection();
  static ready = false;
  static release = { generation: 12, number: 12, channel: 'stable' };
  static scenes = new MockCollection();
  static sessionId = "static-mock-session-id-" + Math.random().toString(36).substring(2);
  static settings = { get: () => undefined, register: () => {}, set: async () => {}, registerMenu: () => {} };
  static socket = { emit: () => {}, on: () => {}, off: () => {} };
  static system = { id: 'static-mock-system' };
  static tables = new MockCollection();
  static time = { worldTime: 0 };
  static tooltip = mockHelper('StaticTooltipManager');
  static tours = new MockCollection();
  static ui = { notifications: { info: () => {}, warn: () => {}, error: () => {} } }; // Ensure static ui exists
  static user = { id: 'static-test-user-id', isGM: true };
  static users = new MockCollection();
  static world = { id: 'static-mock-world' };

}

export default MockGame;