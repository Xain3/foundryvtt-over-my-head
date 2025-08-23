<!-- markdownlint-disable MD040 -->
# Foundry VTT v13 - Class Hierarchy Reference

**Version:** 13
**Last Updated:** 2024
**Companion to:** [Foundry VTT v13 API Reference](./foundry-vtt-v13-api-reference.md)

---

## Table of Contents

1. [Document Class Hierarchy](#document-class-hierarchy)
2. [Canvas System Hierarchy](#canvas-system-hierarchy)
3. [Application System Hierarchy](#application-system-hierarchy)
4. [Dice System Hierarchy](#dice-system-hierarchy)
5. [Helper Classes](#helper-classes)
6. [Quick Class Lookup](#quick-class-lookup)

---

## Document Class Hierarchy

### Abstract Base Classes

```
foundry.abstract.DataModel
├── foundry.abstract.Document
    ├── Primary Documents (extend BaseDocument)
    └── Embedded Documents (extend BaseDocument)
```

### Primary Document Inheritance Tree

```
foundry.abstract.Document
├── foundry.documents.BaseActor → foundry.documents.Actor
├── foundry.documents.BaseAdventure → foundry.documents.Adventure
├── foundry.documents.BaseCards → foundry.documents.Cards
├── foundry.documents.BaseChatMessage → foundry.documents.ChatMessage
├── foundry.documents.BaseCombat → foundry.documents.Combat
├── foundry.documents.BaseFogExploration → foundry.documents.FogExploration
├── foundry.documents.BaseFolder → foundry.documents.Folder
├── foundry.documents.BaseItem → foundry.documents.Item
├── foundry.documents.BaseJournalEntry → foundry.documents.JournalEntry
├── foundry.documents.BaseMacro → foundry.documents.Macro
├── foundry.documents.BasePlaylist → foundry.documents.Playlist
├── foundry.documents.BaseRollTable → foundry.documents.RollTable
├── foundry.documents.BaseScene → foundry.documents.Scene
├── foundry.documents.BaseSetting → foundry.documents.Setting
└── foundry.documents.BaseUser → foundry.documents.User
```

### Embedded Document Inheritance Tree

```
foundry.abstract.Document
├── foundry.documents.BaseActiveEffect → foundry.documents.ActiveEffect
├── foundry.documents.BaseActorDelta → foundry.documents.ActorDelta
├── foundry.documents.BaseAmbientLight → foundry.documents.AmbientLightDocument
├── foundry.documents.BaseAmbientSound → foundry.documents.AmbientSoundDocument
├── foundry.documents.BaseCard → foundry.documents.Card
├── foundry.documents.BaseCombatant → foundry.documents.Combatant
├── foundry.documents.BaseCombatantGroup → foundry.documents.CombatantGroup
├── foundry.documents.BaseDrawing → foundry.documents.DrawingDocument
├── foundry.documents.BaseJournalEntryCategory → foundry.documents.JournalEntryCategory
├── foundry.documents.BaseJournalEntryPage → foundry.documents.JournalEntryPage
├── foundry.documents.BaseMeasuredTemplate → foundry.documents.MeasuredTemplateDocument
├── foundry.documents.BaseNote → foundry.documents.NoteDocument
├── foundry.documents.BasePlaylistSound → foundry.documents.PlaylistSound
├── foundry.documents.BaseRegion → foundry.documents.RegionDocument
├── foundry.documents.BaseRegionBehavior → foundry.documents.RegionBehavior
├── foundry.documents.BaseTableResult → foundry.documents.TableResult
├── foundry.documents.BaseTile → foundry.documents.TileDocument
├── foundry.documents.BaseToken → foundry.documents.TokenDocument
└── foundry.documents.BaseWall → foundry.documents.WallDocument
```

### Collection Classes

```
Collection (base class)
├── foundry.documents.abstract.DocumentCollection
    ├── foundry.documents.abstract.WorldCollection
    │   ├── foundry.documents.collections.Actors
    │   ├── foundry.documents.collections.CardStacks
    │   ├── foundry.documents.collections.ChatMessages
    │   ├── foundry.documents.collections.CombatEncounters
    │   ├── foundry.documents.collections.FogExplorations
    │   ├── foundry.documents.collections.Folders
    │   ├── foundry.documents.collections.Items
    │   ├── foundry.documents.collections.Journal
    │   ├── foundry.documents.collections.Macros
    │   ├── foundry.documents.collections.Playlists
    │   ├── foundry.documents.collections.RollTables
    │   ├── foundry.documents.collections.Scenes
    │   ├── foundry.documents.collections.Users
    │   └── foundry.documents.collections.WorldSettings
    └── foundry.documents.collections.CompendiumCollection
```

---

## Canvas System Hierarchy

### Canvas Groups Hierarchy

```
PIXI.Container
├── foundry.canvas.groups.CanvasGroupMixin (mixin)
    ├── foundry.canvas.groups.RenderedCanvasGroup
    │   ├── foundry.canvas.groups.EnvironmentCanvasGroup
    │   │   ├── foundry.canvas.groups.PrimaryCanvasGroup
    │   │   ├── foundry.canvas.groups.EffectsCanvasGroup
    │   │   └── foundry.canvas.groups.CanvasVisibility
    │   ├── foundry.canvas.groups.InterfaceCanvasGroup
    │   └── foundry.canvas.groups.OverlayCanvasGroup
    └── foundry.canvas.groups.HiddenCanvasGroup
```

### Canvas Layers Hierarchy

```
PIXI.Container
├── foundry.canvas.layers.CanvasLayer
    ├── foundry.canvas.layers.InteractionLayer
    │   └── foundry.canvas.layers.PlaceablesLayer
    │       ├── foundry.canvas.layers.DrawingsLayer
    │       ├── foundry.canvas.layers.LightingLayer
    │       ├── foundry.canvas.layers.NotesLayer
    │       ├── foundry.canvas.layers.RegionLayer
    │       ├── foundry.canvas.layers.SoundsLayer
    │       ├── foundry.canvas.layers.TemplateLayer
    │       ├── foundry.canvas.layers.TilesLayer
    │       ├── foundry.canvas.layers.TokenLayer
    │       └── foundry.canvas.layers.WallsLayer
    ├── foundry.canvas.layers.ControlsLayer
    ├── foundry.canvas.layers.GridLayer
    └── Effect Layers
        ├── foundry.canvas.layers.CanvasBackgroundAlterationEffects
        ├── foundry.canvas.layers.CanvasColorationEffects
        ├── foundry.canvas.layers.CanvasDarknessEffects
        ├── foundry.canvas.layers.CanvasIlluminationEffects
        └── foundry.canvas.layers.WeatherEffects
```

### Placeable Objects Hierarchy

```
PIXI.Container
├── foundry.canvas.placeables.PlaceableObject
    ├── foundry.canvas.placeables.AmbientLight
    ├── foundry.canvas.placeables.AmbientSound
    ├── foundry.canvas.placeables.Drawing
    ├── foundry.canvas.placeables.MeasuredTemplate
    ├── foundry.canvas.placeables.Note
    ├── foundry.canvas.placeables.Region
    ├── foundry.canvas.placeables.Tile
    ├── foundry.canvas.placeables.Token
    └── foundry.canvas.placeables.Wall
```

---

## Application System Hierarchy

### Application V2 Hierarchy

```
EventTarget
├── foundry.applications.api.ApplicationV2
    ├── foundry.applications.api.DialogV2
    └── foundry.applications.api.DocumentSheetV2
        ├── foundry.applications.sheets.ActorSheetV2
        ├── foundry.applications.sheets.ItemSheetV2
        └── Other Document Sheets
```

### Legacy Application Hierarchy

```
Application (legacy)
├── FormApplication
│   ├── DocumentSheet
│   │   ├── ActorSheet
│   │   ├── ItemSheet
│   │   ├── JournalSheet
│   │   └── Various Config Sheets
│   └── BaseEntitySheet
├── SidebarTab
│   ├── foundry.applications.sidebar.tabs.ActorDirectory
│   ├── foundry.applications.sidebar.tabs.CardsDirectory
│   ├── foundry.applications.sidebar.tabs.ChatLog
│   ├── foundry.applications.sidebar.tabs.CombatTracker
│   ├── foundry.applications.sidebar.tabs.ItemDirectory
│   ├── foundry.applications.sidebar.tabs.JournalDirectory
│   ├── foundry.applications.sidebar.tabs.MacroDirectory
│   ├── foundry.applications.sidebar.tabs.PlaylistDirectory
│   ├── foundry.applications.sidebar.tabs.RollTableDirectory
│   ├── foundry.applications.sidebar.tabs.SceneDirectory
│   └── foundry.applications.sidebar.tabs.Settings
└── Dialog
```

### Configuration Applications

```
FormApplication
├── foundry.applications.sheets.ActiveEffectConfig
├── foundry.applications.sheets.AmbientLightConfig
├── foundry.applications.sheets.AmbientSoundConfig
├── foundry.applications.sheets.CardConfig
├── foundry.applications.sheets.CardsConfig
├── foundry.applications.sheets.CombatantConfig
├── foundry.applications.sheets.DrawingConfig
├── foundry.applications.sheets.FolderConfig
├── foundry.applications.sheets.MacroConfig
├── foundry.applications.sheets.MeasuredTemplateConfig
├── foundry.applications.sheets.NoteConfig
├── foundry.applications.sheets.PlaylistConfig
├── foundry.applications.sheets.PlaylistSoundConfig
├── foundry.applications.sheets.RegionConfig
├── foundry.applications.sheets.RollTableSheet
├── foundry.applications.sheets.SceneConfig
├── foundry.applications.sheets.TileConfig
├── foundry.applications.sheets.TokenConfig
├── foundry.applications.sheets.UserConfig
└── foundry.applications.sheets.WallConfig
```

### Journal Applications

```
DocumentSheet
├── foundry.applications.sheets.journal.JournalEntrySheet
└── foundry.applications.sheets.journal.JournalEntryPageSheet
    ├── foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet
    ├── foundry.applications.sheets.journal.JournalEntryPageImageSheet
    ├── foundry.applications.sheets.journal.JournalEntryPageMarkdownSheet
    ├── foundry.applications.sheets.journal.JournalEntryPagePDFSheet
    ├── foundry.applications.sheets.journal.JournalEntryPageProseMirrorSheet
    ├── foundry.applications.sheets.journal.JournalEntryPageTextSheet
    └── foundry.applications.sheets.journal.JournalEntryPageVideoSheet
```

### HUD Applications

```
Application
├── foundry.applications.hud.DrawingHUD
├── foundry.applications.hud.TileHUD
└── foundry.applications.hud.TokenHUD
```

### UI Components

```
Application
├── foundry.applications.ui.Players
└── foundry.applications.ui.SceneNavigation
```

### UX Helper Classes

```
Object
├── foundry.applications.ux.ContextMenu
├── foundry.applications.ux.DragDrop
├── foundry.applications.ux.Tabs
└── foundry.applications.ux.TextEditor
```

---

## Dice System Hierarchy

### Roll System

```
foundry.dice.Roll
└── Various Roll Implementations
```

### Roll Terms Hierarchy

```
foundry.dice.terms.RollTerm
├── foundry.dice.terms.DiceTerm
│   ├── foundry.dice.terms.Die
│   ├── foundry.dice.terms.Coin
│   └── foundry.dice.terms.FateDie
├── foundry.dice.terms.FunctionTerm
├── foundry.dice.terms.NumericTerm
├── foundry.dice.terms.OperatorTerm
├── foundry.dice.terms.ParentheticalTerm
├── foundry.dice.terms.PoolTerm
└── foundry.dice.terms.StringTerm
```

---

## Helper Classes

### Core Helpers

```
Object
├── foundry.helpers.ClientSettings
├── foundry.helpers.GameTime
├── foundry.helpers.Hooks
├── foundry.helpers.SocketInterface
└── foundry.helpers.interaction.KeyboardManager
```

### Media Helpers

```
Object
├── foundry.helpers.media.ImageHelper
└── foundry.helpers.media.VideoHelper
```

### Audio/Video System

```
Object
├── foundry.audio.AudioHelper
├── foundry.audio.Sound
├── foundry.av.AVMaster
├── foundry.av.AVClient
└── foundry.av.clients.SimplePeerAVClient
```

### Game Management

```
Object
├── foundry.Game
├── foundry.canvas.Canvas
├── foundry.canvas.animation.CanvasAnimation
└── foundry.dice.MersenneTwister
```

### Data Helpers

```
Object
├── foundry.data.ClientDatabaseBackend
├── foundry.data.regionBehaviors.RegionBehaviorType
└── foundry.abstract.DatabaseBackend
```

---

## Quick Class Lookup

### By Functionality

#### Document Management

- **Creation/Reading**: `Document.create()`, `Collection.get()`
- **Updates**: `Document.update()`, `Document.delete()`
- **Collections**: `WorldCollection`, `CompendiumCollection`

#### Canvas Rendering

- **Main Controller**: `foundry.canvas.Canvas`
- **Layer Management**: `CanvasLayer`, `PlaceablesLayer`
- **Object Placement**: `PlaceableObject` subclasses
- **Grouping**: Canvas groups (Primary, Effects, Interface, etc.)

#### User Interface

- **Applications**: `ApplicationV2`, `DocumentSheetV2`
- **Dialogs**: `DialogV2`
- **HUD Elements**: HUD classes for canvas objects
- **Sidebar**: Directory tabs and settings

#### Dice & Randomization

- **Rolling**: `foundry.dice.Roll`
- **Terms**: `RollTerm` subclasses
- **RNG**: `MersenneTwister`

#### Audio/Video

- **Audio**: `AudioHelper`, `Sound`
- **Video**: `VideoHelper`
- **AV Chat**: `AVMaster`, `AVClient`

#### System Integration

- **Hooks**: `foundry.helpers.Hooks`
- **Settings**: `ClientSettings`
- **Game State**: `foundry.Game`
- **Time**: `GameTime`

### By Module Namespace

#### `foundry.documents.*`

Primary and embedded documents, collections

#### `foundry.canvas.*`

Canvas system, layers, groups, placeable objects

#### `foundry.applications.*`

UI applications, sheets, HUDs, dialogs

#### `foundry.dice.*`

Dice rolling system and terms

#### `foundry.helpers.*`

Utility classes and helper functions

#### `foundry.audio.*` / `foundry.av.*`

Audio and video functionality

#### `foundry.data.*`

Data models and database backends

---

*This class hierarchy reference is designed to help developers understand the inheritance relationships and organizational structure of the Foundry VTT v13 API. Use it alongside the [main API reference](./foundry-vtt-v13-api-reference.md) for comprehensive development guidance.*
