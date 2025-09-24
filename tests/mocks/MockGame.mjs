/**
 * @file MockGame.js
 * @description Mock Game class representing the main game instance
 * @path tests/mocks/MockGame.js
 */

/**
 * Create a mock function that uses jest.fn() when available, otherwise a regular function
 * @param {Function} implementation - The function implementation
 * @returns {Function} Mock function or jest spy
 */
const createMockFunction = (implementation = () => {}) => {
  if (typeof jest !== 'undefined' && jest.fn) {
    return jest.fn(implementation);
  }
  return implementation;
};

import MockCollection from './MockCollection.mjs';
import MockSettings from './MockSettings.mjs';
import MockUser from './MockUser.mjs';
import MockActor from './MockActor.mjs';
import MockItem from './MockItem.mjs';

// Additional mock classes needed for MockGame
class MockScene {
  constructor(data = {}) {
    this.id = data.id || `scene-${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name || 'Mock Scene';
    this.active = data.active || false;
    this.navigation = data.navigation || false;
  }
}

class MockFolder {
  constructor(data = {}) {
    this.id = data.id || `folder-${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name || 'Mock Folder';
    this.type = data.type || 'Actor';
  }
}

const createDefaultTranslations = () => ({
  'SETTINGS.Configure': 'Configure Settings',
  'FOLDER.Create': 'Create Folder',
  'ENTITY.Create': 'Create Entity',
  'ENTITY.Update': 'Update Entity',
  'ENTITY.Delete': 'Delete Entity'
});

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

const createCanvasLayers = () => {
  return {
    background: { render: createMockFunction() },
    drawings: { render: createMockFunction(), objects: new MockCollection() },
    grid: { render: createMockFunction() },
    walls: { render: createMockFunction(), objects: new MockCollection() },
    templates: { render: createMockFunction(), objects: new MockCollection() },
    notes: { render: createMockFunction(), objects: new MockCollection() },
    tokens: { render: createMockFunction(), objects: new MockCollection() },
    foreground: { render: createMockFunction() },
    lighting: { render: createMockFunction(), objects: new MockCollection() },
    sounds: { render: createMockFunction(), objects: new MockCollection() },
    controls: { render: createMockFunction() }
  };
};

/**
 * Mock Game class representing the main game instance
 */
class MockGame {
  // Private methods at top
  #initializeCoreProperties() {
    this.ready = false;
    this.userId = 'mock-user-id';
    this.worldId = 'mock-world';
    this.systemId = 'mock-system';
    this.version = '11.315';
    this.release = { generation: 11, build: 315 };
    this.paused = false;
  }

  #initializeCollections() {
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
  }

  #initializeSystems() {
    this.settings = new MockSettings();
    this.keyboard = { isDown: createMockFunction(() => false) };
    this.socket = {
      emit: createMockFunction(),
      on: createMockFunction(),
      off: createMockFunction()
    };
    this.time = { worldTime: 0, advance: createMockFunction() };
    this.audio = {
      playing: new Map(),
      locked: false,
      unlock: createMockFunction()
    };
    this.video = { settings: {}, getTexture: createMockFunction() };
    this.tooltip = {
      activate: createMockFunction(),
      deactivate: createMockFunction()
    };
  }

  #initializeCanvas() {
    const baseCanvas = createCanvasConfiguration();
    const layers = createCanvasLayers();
    const canvasGroups = {
      primary: {}, effects: {}, interface: {},
      overlay: {}, environment: {}, visibility: {}
    };
    const canvasMethods = {
      draw: createMockFunction(),
      pan: createMockFunction(({ x, y }) => {
        console.log(`Panning to ${x || 0}, ${y || 0}`);
      }),
      animatePan: createMockFunction(),
      tear: createMockFunction()
    };

    this.canvas = { ...baseCanvas, ...layers, ...canvasGroups, ...canvasMethods };
  }

  #initializeLocalization() {
    this.i18n = {
      lang: 'en',
      translations: {},
      localize: (key) => {
        const translations = createDefaultTranslations();
        return translations[key] || key;
      },
      format: (key, data) => {
        const str = this.i18n.localize(key);
        return str.replace(/{(\w+)}/g, (match, prop) => data[prop] || match);
      }
    };
  }

  #createTestUser() {
    return new MockUser({
      id: this.userId,
      name: 'Mock User',
      role: 4,
      active: true
    });
  }

  #createTestModule() {
    return {
      id: 'test-module',
      title: 'Test Module',
      active: true,
      api: {},
      flags: {}
    };
  }

  #createTestScene() {
    return new MockScene({
      id: 'test-scene',
      name: 'Test Scene',
      active: true,
      navigation: true
    });
  }

  #createTestActor() {
    return new MockActor({
      id: 'test-actor',
      name: 'Test Character',
      type: 'character'
    });
  }

  #createTestItem() {
    return new MockItem({
      id: 'test-item',
      name: 'Test Sword',
      type: 'weapon'
    });
  }

  #createTestFolder() {
    return new MockFolder({
      id: 'test-folder',
      name: 'Test Folder',
      type: 'Actor'
    });
  }

  #populateCollections() {
    this.users.set(this.userId, this.user);
    this.modules.set('test-module', this.#createTestModule());

    const testScene = this.#createTestScene();
    this.scenes.set('test-scene', testScene);
    this.scene = testScene;
    // Note: canvas.scene remains null as per Foundry's initial state

    this.actors.set('test-actor', this.#createTestActor());
    this.items.set('test-item', this.#createTestItem());
    this.folders.set('test-folder', this.#createTestFolder());
  }

  // Public constructor
  constructor() {
    this.#initializeCoreProperties();
    this.#initializeCollections();
    this.#initializeSystems();
    this.#initializeCanvas();
    this.#initializeLocalization();

    this.user = this.#createTestUser();
    this.scene = null;
    this.combat = null;

    this.#populateCollections();
  }

  // Public methods at bottom
  get currentUser() {
    return this.user;
  }

  get isGM() {
    return this.user.isGM;
  }
}

export default MockGame;
export { MockScene, MockFolder };
