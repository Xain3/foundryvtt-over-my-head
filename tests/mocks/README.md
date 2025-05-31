# Enhanced MockGlobals System for Foundry VTT Integration Testing

## Overview

The Enhanced MockGlobals System provides a comprehensive mock environment for Foundry VTT v13 integration testing. It creates a complete simulation of the Foundry VTT runtime environment, allowing developers to write robust integration tests for modules, systems, and macros without requiring a full Foundry VTT instance.

## Features

### 🎯 **Complete Foundry VTT v13 API Coverage**

- **Document System**: All primary and embedded document types
- **Canvas System**: Complete WebGL canvas with layers and objects
- **Event System**: Full Hooks implementation for module communication
- **Settings Management**: Game and module settings with persistence
- **User Interface**: Applications, dialogs, and UI components
- **Collections**: Enhanced Map-based collections with Foundry methods

### 🌐 **Browser Environment Simulation**

- **DOM Implementation**: Complete browser DOM via JSDOM
- **Storage APIs**: localStorage, sessionStorage, IndexedDB simulation
- **Network APIs**: fetch, XMLHttpRequest mocking
- **File APIs**: File, FileReader, Blob support
- **Timing APIs**: setTimeout, setInterval, requestAnimationFrame

### 📚 **Library Integrations**

- **PIXI.js**: Graphics rendering library mocks
- **jQuery**: DOM manipulation and utilities
- **Handlebars**: Template compilation and rendering

## Quick Start

### Basic Setup

```javascript
import MockGlobals, {
  MockActor,
  MockItem,
  MockUser,
  MockScene,
  createMockFunction,
  createSpy
} from '../mocks/mockGlobals.js';

describe('My Foundry Module Tests', () => {
  let mockGlobals;

  beforeAll(() => {
    // Initialize complete Foundry environment
    mockGlobals = new MockGlobals();
    mockGlobals.setGlobals({
      foundry: true,    // Foundry VTT APIs
      browser: true,    // Browser globals
      libraries: true   // External libraries
    });
  });

  afterAll(() => {
    // Clean up global namespace
    mockGlobals.clearGlobals();
  });

  beforeEach(() => {
    // Reset mocks between tests
    mockGlobals.reset();
  });

  it('should work with Foundry APIs', () => {
    // All Foundry globals are now available
    expect(game.ready).toBeDefined();
    expect(game.user.isGM).toBe(true);
    expect(game.scenes.size).toBeGreaterThan(0);
  });
});
```

### Selective Setup

```javascript
// Only mock specific components
mockGlobals.setGlobals({
  foundry: true,    // Only Foundry APIs
  browser: false,   // Skip browser globals
  libraries: false  // Skip library mocks
});
```

### Custom Game Instance

```javascript
// Use your own mock game instance
const customGame = new MockGame();
customGame.worldId = 'my-test-world';

mockGlobals.setGlobals({
  foundry: true,
  gameInstance: customGame
});
```

## API Reference

### MockGlobals Class

#### Constructor
```javascript
const mockGlobals = new MockGlobals();
```

#### Methods

##### `setGlobals(options)`
Sets up the mock environment with specified components.

**Parameters:**
- `options.foundry` (boolean): Include Foundry VTT globals
- `options.browser` (boolean): Include browser globals
- `options.libraries` (boolean): Include library globals
- `options.gameInstance` (MockGame): Custom game instance
- `options.hooksInstance` (MockHooks): Custom hooks instance

##### `clearGlobals()`
Removes all mock globals and restores original values.

##### `reset()`
Resets all mocks to their initial state while keeping them active.

##### `getGame()`
Returns the current mock game instance.

##### `getHooks()`
Returns the current mock hooks instance.

## Utility Functions

### `createMockFunction(implementation)`
Creates a Jest mock function when Jest is available, otherwise returns a regular function.

```javascript
// With Jest available
const mockFn = createMockFunction(() => 'test result');
expect(jest.isMockFunction(mockFn)).toBe(true);

// Without Jest
const regularFn = createMockFunction(() => 'test result');
expect(typeof regularFn).toBe('function');
```

### `createSpy(object, methodName)`
Creates a Jest spy when Jest is available, otherwise returns the original method.

```javascript
const obj = { method: () => 'original' };
const spy = createSpy(obj, 'method');

// With Jest, spy tracks calls
if (jest.isMockFunction(spy)) {
  obj.method();
  expect(spy).toHaveBeenCalled();
}
```

### `createBrowserGlobals()`
Returns an object containing browser globals for manual setup.

```javascript
const browserGlobals = createBrowserGlobals();
// Contains: window, document, navigator, localStorage, fetch, etc.
```

### `createLibraryGlobals()`
Returns an object containing library globals for manual setup.

```javascript
const libraryGlobals = createLibraryGlobals();
// Contains: PIXI, $, jQuery, Handlebars, io, dragula
```

## Document Types

### Primary Documents

#### MockActor
Represents characters, NPCs, and other actors in the game.

```javascript
const actor = new MockActor({
  name: 'Test Hero',
  type: 'character',
  system: { attributes: { hp: { value: 100 } } }
});

// Access items and effects
actor.items.set('sword', new MockItem({ name: 'Magic Sword' }));
actor.effects.set('blessing', new MockActiveEffect());

// Get items by type
const weapons = actor.itemTypes('weapon');
```

#### MockItem
Represents equipment, spells, features, and other items.

```javascript
const item = new MockItem({
  name: 'Healing Potion',
  type: 'consumable',
  system: { uses: { value: 3, max: 3 } }
});
```

#### MockScene
Represents game scenes with canvas objects.

```javascript
const scene = new MockScene({
  name: 'Dungeon Level 1',
  width: 4000,
  height: 3000,
  gridSize: 100
});

// Activate the scene
await scene.activate();
expect(scene.active).toBe(true);
```

#### MockUser
Represents players and game masters.

```javascript
const user = new MockUser({
  name: 'Player One',
  role: 1, // PLAYER role
  active: true
});

expect(user.isGM).toBe(false);
```

#### MockChatMessage
Represents chat messages and dice rolls.

```javascript
const message = new MockChatMessage({
  content: 'Hello world!',
  speaker: { alias: 'Test Character' },
  type: 0 // OTHER type
});

expect(message.alias).toBe('Test Character');
expect(message.isContentVisible(game.user)).toBe(true);
```

#### MockCombat
Represents combat encounters.

```javascript
const combat = new MockCombat({
  scene: 'scene-id',
  round: 1,
  turn: 0
});

await combat.startCombat();
await combat.nextTurn();
```

### Embedded Documents

#### MockToken
Represents actor tokens on the canvas.

```javascript
const token = new MockToken({
  x: 100,
  y: 200,
  actorId: 'actor-id',
  hidden: false
});

const actor = token.actor; // Gets linked actor
```

#### MockFolder
Represents organizational folders.

```javascript
const folder = new MockFolder({
  name: 'NPCs',
  type: 'Actor',
  parent: null
});
```

## Game Systems

### MockGame
The central game instance containing all collections and systems.

```javascript
// Access collections
game.actors.set('hero', new MockActor({ name: 'Hero' }));
game.scenes.set('dungeon', new MockScene({ name: 'Dungeon' }));

// Current references
const currentScene = game.scene;
const currentCombat = game.combat;

// Canvas system
const canvas = game.canvas;
const tokens = canvas.tokens.objects; // Token layer objects
```

### MockHooks
Event system for module communication.

```javascript
// Register event listeners
Hooks.on('ready', () => {
  console.log('Game ready!');
});

Hooks.on('createActor', (actor, options, userId) => {
  console.log(`Actor ${actor.name} created`);
});

// Trigger events
Hooks.call('ready');
Hooks.callAll('createActor', actor, {}, 'user-id');
```

### MockSettings
Game and module settings management.

```javascript
// Register settings
game.settings.register('my-module', 'setting-key', {
  name: 'My Setting',
  hint: 'Description of setting',
  scope: 'world',
  config: true,
  default: false,
  type: Boolean
});

// Get/set values
const value = game.settings.get('my-module', 'setting-key');
await game.settings.set('my-module', 'setting-key', true);
```

### MockCanvas
Complete canvas system with layers and rendering.

```javascript
// Access layers
const tokenLayer = game.canvas.tokens;
const lightingLayer = game.canvas.lighting;
const wallsLayer = game.canvas.walls;

// Layer objects
tokenLayer.objects.set('token-1', mockToken);
lightingLayer.objects.set('light-1', mockLight);

// Canvas methods
game.canvas.draw();
game.canvas.pan({ x: 100, y: 100 });
```

## UI Components

### MockApplication
Base class for UI applications.

```javascript
const app = new MockApplication({
  title: 'My Application',
  width: 400,
  height: 300
});

await app.render();
expect(app.rendered).toBe(true);

await app.close();
expect(app.rendered).toBe(false);
```

### MockDialog
Modal dialogs and confirmations.

```javascript
// Confirmation dialog
const confirmed = await Dialog.confirm({
  title: 'Confirm Action',
  content: 'Are you sure?',
  yes: () => true,
  no: () => false,
  defaultYes: false
});

// Wait for dialog result
const result = await Dialog.wait({
  title: 'Choose Option',
  buttons: {
    option1: { label: 'Option 1', callback: () => 'option1' },
    option2: { label: 'Option 2', callback: () => 'option2' }
  },
  default: 'option1'
});
```

### UI Notifications

```javascript
ui.notifications.info('Information message');
ui.notifications.warn('Warning message');
ui.notifications.error('Error message');
ui.notifications.notify('General notification');
```

## Dice Rolling

### MockRoll
Dice rolling system with formula parsing.

```javascript
const roll = new Roll('1d20 + 5', { bonus: 3 });
await roll.evaluate();

console.log(roll.total); // Random result
console.log(roll.formula); // "1d20 + 5"

const rendered = await roll.render();
console.log(rendered); // HTML representation
```

## Browser Globals

When `browser: true` is enabled, the following globals are available:

### DOM & Window
```javascript
// JSDOM-powered browser environment
const element = document.createElement('div');
element.textContent = 'Hello World';
document.body.appendChild(element);

// Window properties
console.log(window.location.href);
console.log(navigator.userAgent);
```

### Storage APIs
```javascript
// Local storage
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');

// Session storage
sessionStorage.setItem('temp', 'data');
```

### Network APIs
```javascript
// Fetch API (mocked)
const response = await fetch('/api/data');
const data = await response.json();
```

### File APIs
```javascript
// File handling
const file = new File(['content'], 'test.txt', { type: 'text/plain' });
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result);
reader.readAsText(file);
```

### Library Globals

When `libraries: true` is enabled, the following globals are available:

### PIXI.js Mocks

```javascript
// Graphics rendering
const app = new PIXI.Application();
const container = new PIXI.Container();
const graphics = new PIXI.Graphics();
const sprite = new PIXI.Sprite();
const texture = PIXI.Texture.from('image.png');
```

### jQuery

```javascript
// DOM manipulation
const $element = $('#my-element');
$element.addClass('active');
$element.on('click', handler);

// Chaining support
$element.find('.child').removeClass('hidden');
```

### Handlebars

```javascript
// Template compilation
const template = Handlebars.compile('<div>{{message}}</div>');
const html = template({ message: 'Hello World' });

// Helper registration
Handlebars.registerHelper('upper', (str) => str.toUpperCase());
Handlebars.registerPartial('myPartial', '<span>{{text}}</span>');
```

### Socket.io

```javascript
// Socket connection mock
const socket = io();
socket.on('connect', () => console.log('Connected'));
socket.emit('message', { data: 'test' });
socket.disconnect();
```

### Dragula

```javascript
// Drag and drop mock
const drake = dragula();
drake.on('drop', (el, target) => console.log('Dropped'));
drake.destroy();
```

## Exported Constants and Classes

The mock system exports the following constants and classes for direct use:

### Exported Constants

```javascript
import { CONST, CONFIG, UI } from '../mocks/mockGlobals.js';

// User roles
console.log(CONST.USER_ROLES.PLAYER); // 1
console.log(CONST.USER_ROLES.GAMEMASTER); // 4

// Document classes
console.log(CONFIG.Actor.documentClass); // MockActor
console.log(CONFIG.Item.documentClass); // MockItem

// UI notifications
UI.notifications.info('Test message');
```

### Exported Mock Classes

```javascript
import {
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
  MockFolder
} from '../mocks/mockGlobals.js';

// Use directly without global setup
const actor = new MockActor({ name: 'Direct Actor' });
const collection = new MockCollection();
collection.set('actor1', actor);
```

## Test Data

The mock system automatically creates sample test data:

### Pre-populated Entities
- **Test User**: GM user with ID 'mock-user-id'
- **Test Scene**: 'Test Scene' with ID 'test-scene'
- **Test Actor**: 'Test Character' with ID 'test-actor'
- **Test Item**: 'Test Sword' with ID 'test-item'
- **Test Folder**: 'Test Folder' with ID 'test-folder'

### Accessing Test Data
```javascript
const testUser = game.users.get('mock-user-id');
const testScene = game.scenes.get('test-scene');
const testActor = game.actors.get('test-actor');
const testItem = game.items.get('test-item');
```

## Configuration Objects

### CONFIG
Global configuration object with document classes and settings.

```javascript
// Document classes
const ActorClass = CONFIG.Actor.documentClass;
const ItemClass = CONFIG.Item.documentClass;

// Canvas configuration
const darknessColor = CONFIG.Canvas.darknessColor;
const dispositionColors = CONFIG.Canvas.dispositionColors;

// UI configuration
CONFIG.ui.notifications.info('Message');
```

### CONST
Global constants matching Foundry VTT values.

```javascript
// User roles
const isGM = user.role >= CONST.USER_ROLES.GAMEMASTER;

// Document types
const actorType = CONST.DOCUMENT_TYPES.ACTOR;

// Permission levels
const hasOwnership = document.permission >= CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
```

## Advanced Usage

### Custom Document Classes

```javascript
import { MockActor, CONFIG } from '../mocks/mockGlobals.js';

// Extend mock documents
class CustomActor extends MockActor {
  get customProperty() {
    return this.system.customValue || 0;
  }
}

// Use in CONFIG
CONFIG.Actor.documentClass = CustomActor;
```

### Event Testing

```javascript
import { createMockFunction } from '../mocks/mockGlobals.js';

// Test hook interactions
const handler = createMockFunction();
Hooks.on('myModule.customEvent', handler);

// Trigger from your code
Hooks.call('myModule.customEvent', { test: true });

// Verify in tests
if (jest.isMockFunction(handler)) {
  expect(handler).toHaveBeenCalledWith({ test: true });
}
```

### Async Operations

```javascript
// Test async document operations
const actor = new MockActor({ name: 'Test' });
await actor.update({ name: 'Updated' });
expect(actor.name).toBe('Updated');

await actor.setFlag('my-module', 'flag-key', 'flag-value');
const flagValue = actor.getFlag('my-module', 'flag-key');
expect(flagValue).toBe('flag-value');
```

### Collection Operations

```javascript
// Test collection methods
const actors = game.actors;

// Add multiple actors
actors.set('hero', new MockActor({ name: 'Hero' }));
actors.set('villain', new MockActor({ name: 'Villain' }));

// Find operations
const hero = actors.find(a => a.name === 'Hero');
const npcs = actors.filter(a => a.type === 'npc');
const actorArray = actors.toArray();
```

## Best Practices

### 1. **Proper Setup/Teardown**

```javascript
describe('Module Tests', () => {
  let mockGlobals;

  beforeAll(() => {
    mockGlobals = new MockGlobals();
    mockGlobals.setGlobals({ foundry: true });
  });

  afterAll(() => {
    mockGlobals.clearGlobals();
  });

  beforeEach(() => {
    mockGlobals.reset();
  });
});
```

### 2. **Isolated Test Data**

```javascript
beforeEach(() => {
  // Create fresh test data for each test
  game.actors.clear();
  game.scenes.clear();

  // Add only what you need
  game.actors.set('test-actor', new MockActor({ name: 'Test' }));
});
```

### 3. **Mock Verification**

```javascript
it('should call the correct methods', () => {
  const mockMethod = jest.spyOn(game.canvas, 'draw');

  // Your code that should call canvas.draw()
  myModule.redrawCanvas();

  expect(mockMethod).toHaveBeenCalled();
  mockMethod.mockRestore();
});

it('should verify mock functions', () => {
  // Use Jest-specific checks for mock functions
  expect(jest.isMockFunction(UI.notifications.info)).toBe(true);

  // Test mock calls
  UI.notifications.info('Test message');
  expect(UI.notifications.info).toHaveBeenCalledWith('Test message');
});
```

### 4. **Event Testing**

```javascript
it('should handle hook events', () => {
  const handler = jest.fn();
  Hooks.on('myModule.event', handler);

  // Trigger event
  Hooks.call('myModule.event', { data: 'test' });

  expect(handler).toHaveBeenCalledWith({ data: 'test' });
});
```

## Troubleshooting

### Common Issues

1. **Global Conflicts**: Always call `clearGlobals()` in `afterAll()` to prevent test contamination.

2. **Mock Persistence**: Use `reset()` in `beforeEach()` to ensure clean state between tests.

3. **Async Operations**: Remember to `await` mock operations that return promises.

4. **Collection Modifications**: Mock collections behave like Maps - use `set()`, `get()`, `delete()` methods.

5. **Jest Mock Functions**: Use `jest.isMockFunction()` to check if a function is a Jest mock rather than `toBeInstanceOf(Function)`.

6. **Browser Environment Issues**: Some JSDOM operations may cause stack overflow. Skip problematic tests or use simpler alternatives.

### Jest Integration

```javascript
// Check if Jest is available
if (typeof jest !== 'undefined') {
  // Use Jest-specific features
  const mockFn = createMockFunction();
  expect(jest.isMockFunction(mockFn)).toBe(true);
} else {
  // Fallback for non-Jest environments
  const regularFn = createMockFunction();
  expect(typeof regularFn).toBe('function');
}
```

### Debug Mode

```javascript
// Enable debug logging
CONFIG.debug = { hooks: true };

// Check mock state
console.log('Game ready:', game.ready);
console.log('User role:', game.user.role);
console.log('Actors:', game.actors.size);

// Verify exports
import { CONST, CONFIG } from '../mocks/mockGlobals.js';
console.log('CONST exported:', typeof CONST);
console.log('CONFIG exported:', typeof CONFIG);
```

## Contributing

To extend the mock system:

1. **Add New Document Types**: Create new mock classes extending `MockDocument`
2. **Enhance Existing Mocks**: Add missing methods or properties to existing classes
3. **Update Configuration**: Add new document types to `CONFIG` object
4. **Add Test Coverage**: Write tests for new mock functionality

## License

This mock system is part of the "Over My Head" Foundry VTT module and follows the same licensing terms.
