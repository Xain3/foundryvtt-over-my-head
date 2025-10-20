# Foundry VTT v13 - Developer Quick Reference & Code Examples

**Version:** 13
**Target Audience:** Module and System Developers
**Complementary to:** [Complete API Reference](./foundry-vtt-v13-api-reference.md) | [Class Hierarchy](./foundry-vtt-v13-class-hierarchy.md)

---

## Essential Development Patterns

### 1. Module Initialization

```javascript
// Basic module initialization
Hooks.once("init", () => {
  console.log("My Module | Initializing");

  // Register settings
  game.settings.register("my-module", "enabled", {
    name: "Enable Module",
    hint: "Enable or disable module functionality",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
});

// Ready hook - all data loaded
Hooks.once("ready", () => {
  console.log("My Module | Ready");

  if (!game.user.isGM) return;

  // GM-only initialization
  initializeGMFeatures();
});
```

### 2. Document CRUD Operations

```javascript
// Create Actor
const actorData = {
  name: "Test Actor",
  type: "character",
  img: "path/to/image.jpg",
  system: {
    attributes: {
      hp: { value: 10, max: 10 },
    },
  },
};
const actor = await Actor.create(actorData);

// Create Item
const itemData = {
  name: "Magic Sword",
  type: "weapon",
  img: "path/to/sword.jpg",
  system: {
    damage: "1d8+2",
    properties: ["magical", "versatile"],
  },
};
const item = await Item.create(itemData);

// Update Document
await actor.update({
  "system.attributes.hp.value": 8,
});

// Delete Document
await actor.delete();

// Batch Operations
const updates = [
  { _id: actor1.id, "system.attributes.hp.value": 5 },
  { _id: actor2.id, "system.attributes.hp.value": 3 },
];
await Actor.updateDocuments(updates);
```

### 3. Working with Collections

```javascript
// Filter collections
const playerCharacters = game.actors.filter(
  (a) => a.type === "character" && a.hasPlayerOwner,
);

// Find specific documents
const actor = game.actors.find((a) => a.name === "Hero");
const scene = game.scenes.find((s) => s.name === "Tavern");

// Collection iteration
game.actors.forEach((actor) => {
  if (actor.type === "npc") {
    console.log(`NPC: ${actor.name}`);
  }
});

// Convert to array
const actorArray = Array.from(game.actors);

// Map collection data
const actorNames = game.actors.map((a) => a.name);
```

### 4. Canvas and Token Management

```javascript
// Get controlled tokens
const controlled = canvas.tokens.controlled;

// Get token by ID
const token = canvas.tokens.get(tokenId);

// Update token position
await token.document.update({
  x: 100,
  y: 100,
});

// Animate token movement
await token.animateMovement({
  x: 200,
  y: 200,
  duration: 1000,
});

// Create measured template
const templateData = {
  t: "circle",
  x: 100,
  y: 100,
  distance: 20,
  angle: 0,
  fillColor: "#ff0000",
};
await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);

// Work with vision and lighting
await token.document.update({
  "sight.enabled": true,
  "sight.range": 60,
  "light.bright": 20,
  "light.dim": 40,
});
```

### 5. Chat Messages and Dice Rolling

```javascript
// Simple chat message
ChatMessage.create({
  content: "Hello, world!",
  speaker: ChatMessage.getSpeaker({ actor: actor }),
});

// Dice roll with chat output
const roll = new Roll("1d20+5");
await roll.evaluate();
await roll.toMessage({
  speaker: ChatMessage.getSpeaker({ actor: actor }),
  flavor: "Attack Roll",
});

// Complex roll formula
const formula = "2d6 + @abilities.str.mod + @prof";
const roll = new Roll(formula, actor.getRollData());
await roll.evaluate();

// Roll table
const table = game.tables.get(tableId);
const result = await table.roll();
await result.toMessage();

// Whisper to GM
ChatMessage.create({
  content: "Secret message",
  whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
});
```

### 6. Application and Dialog Creation

```javascript
// Simple dialog
new Dialog({
  title: "Confirmation",
  content: "<p>Are you sure?</p>",
  buttons: {
    yes: {
      icon: '<i class="fas fa-check"></i>',
      label: "Yes",
      callback: () => console.log("Yes clicked"),
    },
    no: {
      icon: '<i class="fas fa-times"></i>',
      label: "No",
      callback: () => console.log("No clicked"),
    },
  },
  default: "yes",
}).render(true);

// Custom Application
class MyApplication extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "my-app",
      title: "My Application",
      template: "modules/my-module/templates/app.hbs",
      width: 400,
      height: 300,
      resizable: true,
    });
  }

  getData() {
    return {
      actors: game.actors.contents,
      user: game.user,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".my-button").click(this._onButtonClick.bind(this));
  }

  _onButtonClick(event) {
    event.preventDefault();
    console.log("Button clicked");
  }
}
```

### 7. Hooks and Event Handling

```javascript
// Document hooks
Hooks.on("createActor", (actor, options, userId) => {
  console.log(`Actor created: ${actor.name}`);
});

Hooks.on("updateToken", (token, update, options, userId) => {
  if ("x" in update || "y" in update) {
    console.log("Token moved");
  }
});

// Canvas hooks
Hooks.on("canvasReady", (canvas) => {
  console.log("Canvas is ready");
});

// Combat hooks
Hooks.on("combatStart", (combat) => {
  ChatMessage.create({
    content: "Combat has begun!",
    speaker: { alias: "System" },
  });
});

// Custom hooks
Hooks.on("myModule.customEvent", (data) => {
  console.log("Custom event triggered", data);
});

// Call custom hooks
Hooks.call("myModule.customEvent", { message: "Hello" });
```

### 8. Settings and Configuration

```javascript
// Register different setting types
game.settings.register("my-module", "textSetting", {
  name: "Text Setting",
  hint: "Enter some text",
  scope: "world",
  config: true,
  type: String,
  default: "default value",
});

game.settings.register("my-module", "numberSetting", {
  name: "Number Setting",
  scope: "client",
  config: true,
  type: Number,
  default: 10,
  range: { min: 1, max: 100, step: 1 },
});

game.settings.register("my-module", "choiceSetting", {
  name: "Choice Setting",
  scope: "world",
  config: true,
  type: String,
  choices: {
    option1: "Option 1",
    option2: "Option 2",
    option3: "Option 3",
  },
  default: "option1",
});

// Use settings
const textValue = game.settings.get("my-module", "textSetting");
await game.settings.set("my-module", "textSetting", "new value");

// Settings menu
game.settings.registerMenu("my-module", "config", {
  name: "Configuration",
  label: "Configure Module",
  hint: "Open configuration dialog",
  icon: "fas fa-cog",
  type: MyConfigApplication,
  restricted: true,
});
```

### 9. Combat and Initiative

```javascript
// Create combat encounter
const combatData = {
  scene: canvas.scene.id,
  active: true,
};
const combat = await Combat.create(combatData);

// Add combatants
const combatantData = {
  tokenId: token.id,
  actorId: token.actor.id,
  initiative: 15,
};
await combat.createEmbeddedDocuments("Combatant", [combatantData]);

// Roll initiative for all
await combat.rollAll();

// Start combat
await combat.startCombat();

// Next turn
await combat.nextTurn();

// End combat
await combat.endCombat();

// Combat state checks
if (game.combat?.started) {
  const currentCombatant = game.combat.combatant;
  const isCurrentTurn = currentCombatant?.token?.id === token.id;
}
```

### 10. Journal and Compendium Management

```javascript
// Create journal entry
const journalData = {
  name: "Adventure Log",
  pages: [
    {
      name: "Page 1",
      type: "text",
      text: {
        content: "<h1>Chapter 1</h1><p>The adventure begins...</p>",
      },
    },
  ],
};
const journal = await JournalEntry.create(journalData);

// Work with compendiums
const pack = game.packs.get("world.my-compendium");
const documents = await pack.getDocuments();

// Import from compendium
const packActor = await pack.getDocument(documentId);
const importedActor = await Actor.create(packActor.toObject());

// Export to compendium
await pack.importDocument(actor);
```

### 11. Active Effects and Automation

```javascript
// Create active effect
const effectData = {
  label: "Blessing",
  icon: "icons/magic/holy/angel-wings-gray.webp",
  duration: {
    seconds: 3600, // 1 hour
  },
  changes: [
    {
      key: "system.attributes.ac.bonus",
      mode: 2, // ADD
      value: "2",
    },
  ],
  disabled: false,
  transfer: false,
};

await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

// Toggle effect
const effect = actor.effects.find((e) => e.label === "Blessing");
await effect.update({ disabled: !effect.disabled });

// Remove effect
await effect.delete();

// Temporary effects on tokens
await token.document.update({
  effects: [...token.document.effects, "path/to/effect.webp"],
});
```

### 12. File and Asset Management

```javascript
// File picker dialog
new FilePicker({
  type: "image",
  callback: (path) => {
    console.log("Selected image:", path);
  },
}).render(true);

// Upload file
const file = event.target.files[0];
const response = await FilePicker.upload("data", "uploads/", file);
console.log("Uploaded to:", response.path);

// Browse files
const result = await FilePicker.browse("data", "assets/");
console.log("Files:", result.files);
```

## Advanced Patterns

### 1. Custom Data Models

```javascript
class MyCustomData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      name: new fields.StringField({ required: true }),
      value: new fields.NumberField({ initial: 0 }),
      enabled: new fields.BooleanField({ initial: true }),
      tags: new fields.ArrayField(new fields.StringField()),
    };
  }

  prepareDerivedData() {
    this.displayValue = this.enabled ? this.value : 0;
  }
}
```

### 2. Keybinding Integration

```javascript
// Register keybindings
game.keybindings.register("my-module", "toggleFeature", {
  name: "Toggle Feature",
  hint: "Toggle the module feature on/off",
  editable: [{ key: "KeyT", modifiers: ["Control"] }],
  onDown: () => {
    console.log("Feature toggled");
    return true; // Prevent default behavior
  },
});
```

### 3. Socket Communication

```javascript
// Register socket events
game.socket.on("module.my-module", (data) => {
  console.log("Socket data received:", data);
  handleSocketData(data);
});

// Emit socket events
game.socket.emit("module.my-module", {
  type: "update",
  userId: game.user.id,
  data: { message: "Hello, world!" },
});

// GM-only socket handling
if (game.user.isGM) {
  game.socket.on("module.my-module", (data) => {
    if (data.type === "request") {
      // Handle request and respond
      game.socket.emit("module.my-module", {
        type: "response",
        data: processRequest(data.data),
      });
    }
  });
}
```

### 4. Handlebars Helpers

```javascript
// Register custom Handlebars helpers
Handlebars.registerHelper("myHelper", function (value, options) {
  return value.toUpperCase();
});

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

// Use in templates
// {{myHelper actor.name}}
// {{#ifEquals actor.type "character"}}...{{/ifEquals}}
```

## Debugging and Development Tools

### 1. Console Utilities

```javascript
// Debug helpers
console.log("Game object:", game);
console.log("Canvas object:", canvas);
console.log("Current scene:", canvas.scene);
console.log("Controlled tokens:", canvas.tokens.controlled);

// Access collections
console.log("Actors:", game.actors.contents);
console.log("Items:", game.items.contents);
console.log("Scenes:", game.scenes.contents);

// Check user permissions
console.log("Is GM:", game.user.isGM);
console.log("User role:", game.user.role);
```

### 2. Error Handling

```javascript
try {
  await someAsyncOperation();
} catch (error) {
  console.error("Operation failed:", error);
  ui.notifications.error("Operation failed. Check console for details.");
}

// Graceful degradation
if (game.modules.get("some-dependency")?.active) {
  // Use dependency features
  useDependencyFeatures();
} else {
  // Fallback behavior
  useFallbackFeatures();
}
```

### 3. Performance Monitoring

```javascript
// Time operations
console.time("Operation");
await performExpensiveOperation();
console.timeEnd("Operation");

// Debounce frequent operations
const debouncedFunction = foundry.utils.debounce(expensiveFunction, 250);

// Throttle operations
const throttledFunction = foundry.utils.throttle(frequentFunction, 100);
```

## Common Gotchas and Best Practices

### 1. Timing Issues

```javascript
// ❌ Wrong - Data might not be ready
Hooks.once("init", () => {
  const actor = game.actors.get(id); // Might be undefined
});

// ✅ Correct - Wait for ready
Hooks.once("ready", () => {
  const actor = game.actors.get(id); // Data is loaded
});
```

### 2. Async/Await Usage

```javascript
// ❌ Wrong - Not awaiting async operations
function updateActor() {
  actor.update(data); // Fire and forget - might cause issues
  doSomethingElse();
}

// ✅ Correct - Proper async handling
async function updateActor() {
  await actor.update(data);
  doSomethingElse(); // Runs after update completes
}
```

### 3. Data Mutation

```javascript
// ❌ Wrong - Mutating original data
const actorData = actor.toObject();
actorData.system.hp.value = 10; // Mutates original

// ✅ Correct - Deep cloning
const actorData = foundry.utils.deepClone(actor.toObject());
actorData.system.hp.value = 10; // Safe mutation
```

### 4. Memory Management

```javascript
// Clean up event listeners
class MyApplication extends Application {
  close(options = {}) {
    // Remove custom event listeners
    this.element.off(".my-namespace");
    return super.close(options);
  }
}

// Remove hooks when no longer needed
const hookId = Hooks.on("updateActor", callback);
Hooks.off("updateActor", hookId);
```

---

## Quick API Reference

### Global Objects

- `game` - Main game instance
- `canvas` - Canvas controller
- `ui` - UI manager
- `CONFIG` - Configuration object
- `CONST` - Constants object

### Collections

- `game.actors` - Actor documents
- `game.items` - Item documents
- `game.scenes` - Scene documents
- `game.users` - User documents
- `game.macros` - Macro documents
- `game.playlists` - Playlist documents
- `game.tables` - RollTable documents
- `game.journal` - JournalEntry documents
- `game.folders` - Folder documents
- `game.packs` - Compendium packs

### Canvas Layers

- `canvas.tokens` - Token layer
- `canvas.lighting` - Lighting layer
- `canvas.walls` - Walls layer
- `canvas.sounds` - Sounds layer
- `canvas.templates` - Template layer
- `canvas.tiles` - Tiles layer
- `canvas.drawings` - Drawings layer
- `canvas.notes` - Notes layer

### Utilities

- `foundry.utils.mergeObject()` - Deep merge objects
- `foundry.utils.duplicate()` - Deep clone objects
- `foundry.utils.randomID()` - Generate random ID
- `foundry.utils.debounce()` - Debounce function calls
- `foundry.utils.throttle()` - Throttle function calls

---

_This quick reference complements the complete API documentation. For detailed class information and method signatures, refer to the [Complete API Reference](./foundry-vtt-v13-api-reference.md)._
