# Foundry VTT v13 - Developer Quick Reference

**Version:** 13
**Last Updated:** 2024
**Companion to:** [Foundry VTT v13 API Reference](./foundry-vtt-v13-api-reference.md)

---

## Table of Contents

1. [Common Code Patterns](#common-code-patterns)
2. [Document Operations](#document-operations)
3. [Canvas Interactions](#canvas-interactions)
4. [Application Development](#application-development)
5. [Hook System Usage](#hook-system-usage)
6. [Settings Management](#settings-management)
7. [Dice Rolling](#dice-rolling)
8. [Audio/Video Integration](#audiovideo-integration)
9. [Error Handling](#error-handling)
10. [Performance Best Practices](#performance-best-practices)

---

## Common Code Patterns

### Module Initialization

```javascript
/**
 * Module initialization pattern
 */
Hooks.once('init', () => {
  console.log('MyModule | Initializing...');

  // Register settings
  registerSettings();

  // Register custom classes
  registerCustomClasses();

  // Initialize module data
  initializeModuleData();
});

Hooks.once('ready', () => {
  console.log('MyModule | Ready');

  // Perform actions that require the game to be fully loaded
  setupGameReadyFeatures();
});
```

### Safe API Access

```javascript
/**
 * Safe access to game objects with error handling
 */
function safeGetActor(actorId) {
  try {
    if (!game?.actors) {
      throw new Error('Game actors collection not available');
    }

    const actor = game.actors.get(actorId);
    if (!actor) {
      throw new Error(`Actor with ID ${actorId} not found`);
    }

    return actor;
  } catch (error) {
    console.error('MyModule | Error getting actor:', error);
    return null;
  }
}
```

### Async/Await Pattern

```javascript
/**
 * Proper async/await usage for document operations
 */
async function createActorWithItems(actorData, itemsData) {
  try {
    // Create the actor first
    const actor = await Actor.create(actorData);

    // Then create items and add to actor
    const items = await Item.createDocuments(itemsData);
    await actor.createEmbeddedDocuments('Item', items.map(i => i.toObject()));

    return actor;
  } catch (error) {
    console.error('Failed to create actor with items:', error);
    throw error;
  }
}
```

---

## Document Operations

### Reading Documents

```javascript
// Get a single document by ID
const actor = game.actors.get(actorId);
const item = game.items.get(itemId);
const scene = game.scenes.get(sceneId);

// Get documents by name
const actorByName = game.actors.getName("Character Name");
const sceneByName = game.scenes.getName("Scene Name");

// Filter collections
const playerActors = game.actors.filter(a => a.hasPlayerOwner);
const visibleScenes = game.scenes.filter(s => s.visible);

// Find documents with complex criteria
const spellItems = game.items.filter(i =>
  i.type === "spell" &&
  i.system.level <= 3
);
```

### Creating Documents

```javascript
// Create a single document
const actorData = {
  name: "New Character",
  type: "character",
  system: {
    attributes: {
      hp: { value: 10, max: 10 }
    }
  }
};
const actor = await Actor.create(actorData);

// Create multiple documents at once
const itemsData = [
  { name: "Sword", type: "weapon" },
  { name: "Shield", type: "equipment" }
];
const items = await Item.createDocuments(itemsData);

// Create embedded documents
const effectData = {
  name: "Blessing",
  icon: "icons/magic/blessing.jpg",
  duration: { seconds: 3600 }
};
await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
```

### Updating Documents

```javascript
// Update a single field
await actor.update({ "name": "New Name" });

// Update nested system data
await actor.update({
  "system.attributes.hp.value": 15,
  "system.details.biography": "A brave warrior"
});

// Update multiple documents
const updates = actors.map(a => ({
  _id: a.id,
  "system.attributes.hp.value": a.system.attributes.hp.max
}));
await Actor.updateDocuments(updates);

// Update embedded documents
await actor.updateEmbeddedDocuments('Item', [{
  _id: itemId,
  "system.quantity": 5
}]);
```

### Deleting Documents

```javascript
// Delete a single document
await actor.delete();

// Delete multiple documents
const idsToDelete = actors.map(a => a.id);
await Actor.deleteDocuments(idsToDelete);

// Delete embedded documents
await actor.deleteEmbeddedDocuments('Item', [itemId]);
```

---

## Canvas Interactions

### Working with Tokens

```javascript
// Get all tokens on current scene
const tokens = canvas.tokens.placeables;

// Get controlled tokens
const controlled = canvas.tokens.controlled;

// Get token by actor ID
const token = canvas.tokens.placeables.find(t => t.actor.id === actorId);

// Update token position
await token.document.update({
  x: 100,
  y: 100
});

// Animate token movement
await token.animateMovement({ x: 200, y: 200 });

// Get tokens in a specific area
const tokensInArea = canvas.tokens.placeables.filter(t => {
  const bounds = new PIXI.Rectangle(0, 0, 200, 200);
  return bounds.contains(t.x, t.y);
});
```

### Working with Lights

```javascript
// Create ambient light
const lightData = {
  x: 400,
  y: 400,
  config: {
    bright: 30,
    dim: 60,
    color: "#ff6600",
    animation: { type: "torch" }
  }
};
await canvas.scene.createEmbeddedDocuments('AmbientLight', [lightData]);

// Update existing light
const light = canvas.lighting.get(lightId);
await light.document.update({
  "config.bright": 40,
  "config.dim": 80
});
```

### Canvas Layer Management

```javascript
// Switch to a specific layer
canvas.tokens.activate();
canvas.lighting.activate();
canvas.walls.activate();

// Check active layer
if (canvas.activeLayer === canvas.tokens) {
  console.log("Tokens layer is active");
}

// Work with specific layers
const walls = canvas.walls.placeables;
const lights = canvas.lighting.placeables;
const sounds = canvas.sounds.placeables;
```

---

## Application Development

### Basic Application V2

```javascript
class MyApplication extends foundry.applications.api.ApplicationV2 {

  static DEFAULT_OPTIONS = {
    id: "my-application",
    tag: "section",
    window: {
      title: "My Application",
      icon: "fas fa-cog"
    },
    position: {
      width: 400,
      height: 300
    }
  };

  static PARTS = {
    content: {
      template: "modules/my-module/templates/my-app.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Add your data to context
    context.actors = game.actors.contents;
    context.currentUser = game.user;

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // Set up event listeners
    this.element.querySelector('#my-button').addEventListener('click',
      this._onButtonClick.bind(this)
    );
  }

  _onButtonClick(event) {
    event.preventDefault();
    console.log('Button clicked!');
  }
}
```

### Document Sheet V2

```javascript
class MyActorSheet extends foundry.applications.api.DocumentSheetV2 {

  static DEFAULT_OPTIONS = {
    classes: ["my-actor-sheet"],
    position: {
      width: 600,
      height: 800
    },
    window: {
      title: "DOCUMENT.Actor"
    }
  };

  static PARTS = {
    header: {
      template: "modules/my-module/templates/actor-header.hbs"
    },
    tabs: {
      template: "modules/my-module/templates/actor-tabs.hbs"
    },
    content: {
      template: "modules/my-module/templates/actor-content.hbs"
    }
  };

  _prepareContext(options) {
    const context = super._prepareContext(options);

    // Add actor-specific data
    context.actor = this.document;
    context.system = this.document.system;
    context.items = this.document.items;

    return context;
  }
}

// Register the sheet
Actors.registerSheet("my-system", MyActorSheet, {
  types: ["character"],
  makeDefault: true
});
```

### Dialog Creation

```javascript
// Simple dialog with ApplicationV2
const dialog = new foundry.applications.api.DialogV2({
  window: { title: "Confirm Action" },
  content: "<p>Are you sure you want to proceed?</p>",
  buttons: [{
    action: "confirm",
    label: "Yes",
    callback: () => console.log("Confirmed!")
  }, {
    action: "cancel",
    label: "No"
  }]
});

dialog.render(true);

// Legacy Dialog (still commonly used)
new Dialog({
  title: "Choose Option",
  content: "<p>Select an option:</p>",
  buttons: {
    option1: {
      label: "Option 1",
      callback: () => console.log("Option 1 selected")
    },
    option2: {
      label: "Option 2",
      callback: () => console.log("Option 2 selected")
    }
  },
  default: "option1"
}).render(true);
```

---

## Hook System Usage

### Registering Hooks

```javascript
// One-time initialization hooks
Hooks.once('init', () => {
  // Module initialization
});

Hooks.once('ready', () => {
  // Game is ready
});

// Repeating event hooks
Hooks.on('createActor', (actor, options, userId) => {
  console.log(`Actor ${actor.name} was created by ${game.users.get(userId).name}`);
});

Hooks.on('updateToken', (tokenDocument, updates, options, userId) => {
  if ('x' in updates || 'y' in updates) {
    console.log(`Token ${tokenDocument.name} moved`);
  }
});

// Canvas hooks
Hooks.on('canvasReady', (canvas) => {
  console.log('Canvas is ready');
});

// Combat hooks
Hooks.on('combatStart', (combat, updateData) => {
  console.log('Combat started!');
});

Hooks.on('combatTurn', (combat, updateData, options) => {
  console.log(`Turn: ${combat.combatant.name}`);
});
```

### Custom Hooks

```javascript
// Calling custom hooks
Hooks.call('myModule.customEvent', data, moreData);

// Listening for custom hooks
Hooks.on('myModule.customEvent', (data, moreData) => {
  // Handle the custom event
});

// Async hooks
Hooks.callAll('myModule.asyncEvent', data);
```

### Hook Timing and Control

```javascript
// Register hook with specific timing
Hooks.on('preCreateActor', (actor, data, options, userId) => {
  // Modify data before creation
  data.name = data.name.toUpperCase();
  return true; // Allow creation to proceed
});

// Prevent default behavior
Hooks.on('preDeleteActor', (actor, options, userId) => {
  if (actor.getFlag('my-module', 'protected')) {
    ui.notifications.warn('This actor is protected from deletion');
    return false; // Prevent deletion
  }
});
```

---

## Settings Management

### Registering Settings

```javascript
Hooks.once('init', () => {
  // Simple boolean setting
  game.settings.register('my-module', 'enableFeature', {
    name: 'Enable Feature',
    hint: 'Enable this feature for enhanced functionality',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  // Number setting with range
  game.settings.register('my-module', 'maxValue', {
    name: 'Maximum Value',
    hint: 'Set the maximum allowed value',
    scope: 'world',
    config: true,
    type: Number,
    default: 100,
    range: {
      min: 1,
      max: 1000,
      step: 1
    }
  });

  // String setting with choices
  game.settings.register('my-module', 'mode', {
    name: 'Operation Mode',
    hint: 'Select the operation mode',
    scope: 'world',
    config: true,
    type: String,
    default: 'normal',
    choices: {
      'normal': 'Normal Mode',
      'advanced': 'Advanced Mode',
      'expert': 'Expert Mode'
    }
  });

  // Client-side setting
  game.settings.register('my-module', 'uiTheme', {
    name: 'UI Theme',
    scope: 'client',
    config: true,
    type: String,
    default: 'dark',
    choices: {
      'light': 'Light Theme',
      'dark': 'Dark Theme'
    }
  });

  // Hidden setting (not shown in config)
  game.settings.register('my-module', 'internalData', {
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });
});
```

### Using Settings

```javascript
// Get setting value
const isEnabled = game.settings.get('my-module', 'enableFeature');
const maxValue = game.settings.get('my-module', 'maxValue');

// Set setting value
await game.settings.set('my-module', 'enableFeature', false);

// Complex object setting
const data = game.settings.get('my-module', 'internalData');
data.newProperty = 'value';
await game.settings.set('my-module', 'internalData', data);

// Listen for setting changes
Hooks.on('updateSetting', (setting, updates) => {
  if (setting.key === 'my-module.enableFeature') {
    console.log('Feature setting changed:', updates.value);
  }
});
```

### Settings Menu

```javascript
// Register a settings submenu
game.settings.registerMenu('my-module', 'advancedConfig', {
  name: 'Advanced Configuration',
  label: 'Configure Advanced Settings',
  hint: 'Open advanced configuration dialog',
  icon: 'fas fa-cogs',
  type: MyAdvancedConfigApplication,
  restricted: true
});

// The settings application class
class MyAdvancedConfigApplication extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: 'Advanced Settings',
      template: 'modules/my-module/templates/advanced-config.hbs',
      width: 500,
      height: 400
    });
  }

  getData() {
    return {
      setting1: game.settings.get('my-module', 'setting1'),
      setting2: game.settings.get('my-module', 'setting2')
    };
  }

  async _updateObject(event, formData) {
    await game.settings.set('my-module', 'setting1', formData.setting1);
    await game.settings.set('my-module', 'setting2', formData.setting2);
  }
}
```

---

## Dice Rolling

### Basic Roll Creation

```javascript
// Simple roll
const roll = new Roll('1d20');
await roll.evaluate();
console.log('Result:', roll.total);

// Roll with modifiers
const attackRoll = new Roll('1d20 + @mod', { mod: 5 });
await attackRoll.evaluate();

// Damage roll
const damageRoll = new Roll('2d6 + 3');
await damageRoll.evaluate();
```

### Advanced Rolling

```javascript
// Roll with actor data
const actor = game.actors.get(actorId);
const rollData = actor.getRollData();
const roll = new Roll('1d20 + @abilities.str.mod', rollData);
await roll.evaluate();

// Advantage/disadvantage
const advRoll = new Roll('2d20kh1 + @mod', { mod: 3 });
const disRoll = new Roll('2d20kl1 + @mod', { mod: 3 });

// Complex formulas
const critRoll = new Roll('(2d6 + @str) * 2', rollData);
```

### Roll Display

```javascript
// Show roll in chat
const roll = new Roll('1d20 + 5');
await roll.evaluate();

await roll.toMessage({
  speaker: ChatMessage.getSpeaker({ actor: actor }),
  flavor: 'Attack Roll'
});

// Custom chat message
const messageData = {
  user: game.user.id,
  speaker: ChatMessage.getSpeaker({ actor: actor }),
  content: `<div class="dice-roll">
    <div class="dice-result">
      <div class="dice-formula">${roll.formula}</div>
      <div class="dice-total">${roll.total}</div>
    </div>
  </div>`,
  sound: CONFIG.sounds.dice,
  type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  roll: roll
};

await ChatMessage.create(messageData);
```

### Roll Events and Hooks

```javascript
// Listen for dice rolls
Hooks.on('diceSoNice3DAnimationFinished', (messageId) => {
  console.log('Dice animation finished for message:', messageId);
});

// Modify rolls before evaluation
Hooks.on('preCreateChatMessage', (messageData) => {
  if (messageData.roll) {
    // Modify the roll if needed
    console.log('Roll about to be created:', messageData.roll.formula);
  }
});
```

---

## Audio/Video Integration

### Audio Management

```javascript
// Play a sound effect
AudioHelper.play({
  src: 'modules/my-module/sounds/effect.wav',
  volume: 0.5,
  autoplay: true,
  loop: false
});

// Background music
const audio = new Audio('modules/my-module/music/background.mp3');
audio.volume = 0.3;
audio.loop = true;
audio.play();

// Playlist management
const playlist = game.playlists.getName('Combat Music');
if (playlist) {
  await playlist.playAll();
}
```

### Video Integration

```javascript
// Show video in dialog
const videoDialog = new Dialog({
  title: 'Cutscene',
  content: `
    <video width="100%" height="auto" controls autoplay>
      <source src="modules/my-module/videos/intro.mp4" type="video/mp4">
    </video>
  `,
  buttons: {
    close: {
      label: 'Close',
      callback: () => {}
    }
  }
});
videoDialog.render(true);
```

---

## Error Handling

### Try-Catch Patterns

```javascript
// Document operations with error handling
async function safeUpdateActor(actor, updateData) {
  try {
    await actor.update(updateData);
    ui.notifications.info(`Updated ${actor.name}`);
  } catch (error) {
    console.error('Failed to update actor:', error);
    ui.notifications.error(`Failed to update ${actor.name}: ${error.message}`);
  }
}

// API calls with validation
function getActorSafely(actorId) {
  if (!actorId) {
    throw new Error('Actor ID is required');
  }

  if (!game.actors) {
    throw new Error('Actors collection not available');
  }

  const actor = game.actors.get(actorId);
  if (!actor) {
    throw new Error(`Actor with ID ${actorId} not found`);
  }

  return actor;
}
```

### Notification Patterns

```javascript
// Success notifications
ui.notifications.info('Operation completed successfully');

// Warning notifications
ui.notifications.warn('This action may have consequences');

// Error notifications
ui.notifications.error('Something went wrong');

// Custom styled notifications
ui.notifications.notify('Custom message', 'info', { permanent: false });
```

---

## Performance Best Practices

### Efficient Document Queries

```javascript
// Bad: Multiple individual queries
const actors = [];
for (const id of actorIds) {
  actors.push(game.actors.get(id));
}

// Good: Single filter operation
const actors = game.actors.filter(a => actorIds.includes(a.id));

// Better: Use Map for O(1) lookups
const actorMap = new Map(game.actors.map(a => [a.id, a]));
const actors = actorIds.map(id => actorMap.get(id)).filter(Boolean);
```

### Batch Operations

```javascript
// Bad: Multiple update calls
for (const actor of actors) {
  await actor.update({ 'system.hp.value': 10 });
}

// Good: Single batch update
const updates = actors.map(a => ({
  _id: a.id,
  'system.hp.value': 10
}));
await Actor.updateDocuments(updates);
```

### Event Debouncing

```javascript
// Debounce frequent updates
const debouncedUpdate = foundry.utils.debounce(async (data) => {
  await performExpensiveUpdate(data);
}, 300);

// Use in event handlers
Hooks.on('updateToken', (tokenDoc, updates) => {
  debouncedUpdate(updates);
});
```

### Memory Management

```javascript
// Clean up event listeners
class MyModule {
  constructor() {
    this.boundHandlers = {
      onTokenUpdate: this.onTokenUpdate.bind(this)
    };
  }

  initialize() {
    Hooks.on('updateToken', this.boundHandlers.onTokenUpdate);
  }

  cleanup() {
    Hooks.off('updateToken', this.boundHandlers.onTokenUpdate);
  }

  onTokenUpdate(tokenDoc, updates) {
    // Handle update
  }
}
```

---

*This quick reference provides practical code examples for common Foundry VTT development tasks. Use it alongside the [main API reference](./foundry-vtt-v13-api-reference.md) and [class hierarchy guide](./foundry-vtt-v13-class-hierarchy.md) for comprehensive development support.*
