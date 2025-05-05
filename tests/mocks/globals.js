import { JSDOM } from 'jsdom'; // Import the public JSDOM API
import MockGame from "./game";
import MockHooks from "./hooks";
// --- Remove this deep import ---
// import { CustomEvent, DOMException, DOMParser, DataTransfer, DragEvent, Element, ErrorEvent, Event, EventTarget, File, FileList, FileReader, FocusEvent, FormData, Function, HTMLElement } from "jsdom/lib/jsdom/living/generated";

// Create a JSDOM instance to safely access browser-like globals
const dom = new JSDOM('', { url: 'http://localhost' });
const window = dom.window;

// Define the browser globals using the created JSDOM window object
// Using an object map for easier assignment later
const commonWebBrowserJSGlobalsMap = {
  // Core window/document
  window: window,
  document: window.document,
  navigator: window.navigator,
  location: window.location, // Often needed
  // Event related
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  EventTarget: window.EventTarget,
  ErrorEvent: window.ErrorEvent,
  FocusEvent: window.FocusEvent,
  MouseEvent: window.MouseEvent, // Common event type
  KeyboardEvent: window.KeyboardEvent, // Common event type
  DragEvent: window.DragEvent,
  // DOM related
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  HTMLDivElement: window.HTMLDivElement, // Example specific element
  DOMParser: window.DOMParser,
  DOMException: window.DOMException,
  Node: window.Node, // Base node type
  // File/Data related
  File: window.File,
  FileList: window.FileList,
  FileReader: window.FileReader,
  FormData: window.FormData,
  DataTransfer: window.DataTransfer,
  // Timers/Async
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  setInterval: window.setInterval,
  clearInterval: window.clearInterval,
  fetch: window.fetch || (() => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') })), // Common async operation - Added basic mock
  // Other common globals
  alert: window.alert, // Use the jsdom provided ones
  confirm: window.confirm,
  prompt: window.prompt,
  // Add other globals your application might need from the browser environment
};

// Keep an array of names if needed elsewhere (e.g., for cleanup)
const commonWebBrowserJSGlobalNames = Object.keys(commonWebBrowserJSGlobalsMap);

const foundrySpecificGlobals = [
  'CONFIG',
  'CONST',
  'Hooks',
  'game',
  'ui',
  'canvas',
  'Dialog',
  'Application',
  'FormApplication',
  'Actor',
  'Item',
  'ChatMessage',
  'foundry', // Added 'foundry' as it's common
  'Roll',
  "AmbientLightConfig",
  "AmbientSoundConfig",
  "AudioHelper",
  "BaseCanvasMixin",
  "BaseGrid",
  "BitMask",
  "Coin",
  "DarknessSource",
  "DiceTerm",
  "Die",
  "EventEmitterMixin",
  "FateDie",
  "GlobalLightSource",
  "GridHex",
  'vtt',
];
const commonLibraryGlobals = [
  'PIXI',
  '$',
  'jQuery',
  'showdown',
  'tinymce',
  'tinyMCE',
  'Handlebars',
  'HandlebarsIntl',
  'markdownit',
  'sparkMD5',
];
const gameSystemSpecificGlobals = [
  // Add any game system specific globals here
  "GURPS",
];




class MockGlobals {
  constructor() {
    this.game = new MockGame();
    this.hooks = new MockHooks();
    this.originals = {}; // Store original global values
    this.keysManagedByThisInstance = new Set(); // Track keys managed by this instance
  }

  _saveOriginal(key) {
    // Save only if the key exists on globalThis and hasn't been saved already *by this instance*
    if (globalThis.hasOwnProperty(key) && !this.originals.hasOwnProperty(key)) {
      this.originals[key] = globalThis[key];
    }
  }

  setGlobals({ browser = false, foundry = true, libraries = true, gameInstance = null, hooksInstance = null } = {}) {
    // Intentionally do NOT clear globals here - rely on external cleanup (like afterEach)
    // Reset the tracking set for this call
    this.keysManagedByThisInstance = new Set();

    // Determine which game/hooks instances to use
    const currentGame = gameInstance !== null ? gameInstance : (foundry ? this.game : null);
    const currentHooks = hooksInstance !== null ? hooksInstance : (foundry ? this.hooks : null);

    if (browser) {
      Object.keys(commonWebBrowserJSGlobalsMap).forEach(key => {
        this._saveOriginal(key);
        globalThis[key] = commonWebBrowserJSGlobalsMap[key];
        this.keysManagedByThisInstance.add(key);
      });
    }

    // Assign Foundry globals
    if (foundry) {
      // Assign game and Hooks first if available
      if (currentGame) {
        this._saveOriginal('game');
        globalThis.game = currentGame;
        this.keysManagedByThisInstance.add('game');
        // Assign globals typically provided *by* game (like CONFIG, ui, canvas)
        // Ensure MockGame provides these properties
        if (currentGame.config) { this._saveOriginal('CONFIG'); globalThis.CONFIG = currentGame.config; this.keysManagedByThisInstance.add('CONFIG'); }
        if (currentGame.ui) { this._saveOriginal('ui'); globalThis.ui = currentGame.ui; this.keysManagedByThisInstance.add('ui'); }
        if (currentGame.canvas) { this._saveOriginal('canvas'); globalThis.canvas = currentGame.canvas; this.keysManagedByThisInstance.add('canvas'); }
        // Add other game-derived globals...
      }
      if (currentHooks) {
        this._saveOriginal('Hooks');
        globalThis.Hooks = currentHooks;
        this.keysManagedByThisInstance.add('Hooks');
      }

      // Assign other specified Foundry globals (that aren't game/Hooks directly)
      foundrySpecificGlobals.forEach(key => {
        // Avoid double assignment and only set if not already handled by currentGame/currentHooks logic above
        if (!this.keysManagedByThisInstance.has(key)) {
             this._saveOriginal(key);
             // Use simple mocks; enhance as needed for specific types (e.g., CONST, Dialog)
             // Check if it should be a function mock or object mock
             const isFunctionLike = ['Dialog', 'Application', 'FormApplication', 'Actor', 'Item', 'ChatMessage', 'Roll'].includes(key);
             globalThis[key] = isFunctionLike ? (() => {}) : {}; // Basic mock
             this.keysManagedByThisInstance.add(key);
        }
      });

    } else {
      // If foundry is false, but specific instances were passed, set them
      if (gameInstance !== null) {
        this._saveOriginal('game');
        globalThis.game = gameInstance;
        this.keysManagedByThisInstance.add('game');
        // Do NOT set game-derived globals like CONFIG if foundry=false
      }
      if (hooksInstance !== null) {
        this._saveOriginal('Hooks');
        globalThis.Hooks = hooksInstance;
        this.keysManagedByThisInstance.add('Hooks');
      }
    }

    if (libraries) {
      commonLibraryGlobals.forEach(key => {
        this._saveOriginal(key);
        if (key === '$' || key === 'jQuery') {
          globalThis[key] = () => ({}); // Mock jQuery/$ to return a mock object
        } else if (key === 'PIXI') {
          globalThis[key] = { utils: { TextureCache: {}, BaseTextureCache: {} } }; // Mock PIXI structure needed by Foundry
        } else {
          globalThis[key] = {}; // Default mock for other libraries
        }
        this.keysManagedByThisInstance.add(key);
      });
    }
  }

  clearGlobals() {
    // Restore original values for keys that were managed AND had an original saved
    Object.keys(this.originals).forEach(key => {
        // Only restore if this instance actually managed the key in the last setGlobals call
        if (this.keysManagedByThisInstance.has(key)) {
            globalThis[key] = this.originals[key];
        }
    });

    // Delete globals that were added by this instance (managed but didn't have an original)
    this.keysManagedByThisInstance.forEach(key => {
      if (!this.originals.hasOwnProperty(key)) {
          // Check if it still exists (it might have been deleted by restoring an original undefined)
          if (globalThis.hasOwnProperty(key)) {
              delete globalThis[key];
          }
      }
    });

    // Reset instance state AFTER cleanup
    this.originals = {};
    this.keysManagedByThisInstance = new Set();
  }
}

// Export the necessary items for the tests and potentially other mocks
export {
  commonWebBrowserJSGlobalNames as commonWebBrowserJSGlobals, // Export names array
  foundrySpecificGlobals,
  commonLibraryGlobals,
  commonWebBrowserJSGlobalsMap // Export map if needed directly
};
export default MockGlobals; // Export the class for use in tests