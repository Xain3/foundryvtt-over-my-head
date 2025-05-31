# Foundry Virtual Tabletop v13 - Complete API Reference

**Version:** 13
**Last Updated:** 2024
**Source:** [Official Foundry VTT API Documentation](https://foundryvtt.com/api/)

---

## Table of Contents

1. [Reading the API Documentation](#reading-the-api-documentation)
2. [Public vs Private API](#public-vs-private-api)
3. [Code Guidelines](#code-guidelines)
4. [Documents and Data](#documents-and-data)
5. [The Game Canvas](#the-game-canvas)
6. [User Interface](#user-interface)
7. [Dice Rolling](#dice-rolling)
8. [Other Major Components](#other-major-components)
9. [Module References](#module-references)

---

## Reading the API Documentation

Welcome to the documentation for the client-side API of Foundry Virtual Tabletop, a JavaScript application for running tabletop role-playing games within a self-hosted web framework. The goal of this documentation is to empower developers to create amazing game systems, add-on modules, and scripts which augment and extend the base functionality of the Foundry Virtual Tabletop platform.

### Key Concepts

- **Document**: A single coherent piece of data representing a specific object within the framework
- **Collection**: A container that holds multiple Documents of the same type
- **Canvas**: The WebGL-powered visual game surface using PixiJS
- **Application**: HTML-based modular interface components

---

## Public vs Private API

### The Public API

The Public API is the set of methods and properties that Foundry officially supports and recommends Package developers to use.

**Foundry's Promises for Public API:**

1. Guidance, documentation, and help with using the Public API
2. Deprecation periods when breaking changes are made when possible
3. Breaking changes only during certain Phases of a Version

**Annotation Example:**

```javascript
/**
 * Part of the Public API, call externally
 * @public
 */
async doThing() {}
```

### The Private API

The Private API is the set of methods and properties that Foundry uses internally but explicitly does not support for external use.

**What to Expect:**

1. No guidance, help, or documentation guarantee
2. No deprecation periods or compatibility layers
3. Breaking changes may occur at any point, including during Stable phase

**Annotation Examples:**

```javascript
/**
 * Part of the Private API, don't call at all
 * @private
 */
async _doThing() {}

/**
 * Part of the Private API, JS prevents you from calling
 * @private
 */
async #doThing() {}

/**
 * Able to be called externally, but treated as part of the private API
 * @internal
 */
async _doThing() {}
```

---

## Code Guidelines

### Annotations

#### `@public`

Methods and properties marked `@public` may be called both externally and internally. They may only be modified within the class that defines them or a subclass of that parent class.

#### `@protected`

Methods and properties marked `@protected` may only be used or modified within the class that defines them or a subclass of that parent class. API users are intended to override `@protected` properties when defining a subclass.

#### `@private`

Methods and properties marked `@private` should not be used or modified except by the class which defined them. Breaking changes may occur without warning.

#### `@internal`

Methods and properties marked `@internal` should only be used by the core Foundry VTT codebase. Similar to `@private` but may be called outside the defining class context.

### Naming Conventions

#### `_` naming

Methods and properties beginning with underscore `_` should be treated as `@private`.

#### `#` naming

Methods and properties beginning with `#` are truly private and cannot be accessed outside their declaring class (enforced by JavaScript).

### FAQ

#### What is a breaking change?

A breaking change makes existing calls to the API incompatible with the new version, such as:

- Change in return type
- Removing a parameter
- Renaming a method without providing an alias

**Not considered breaking:**

- Adding optional parameters
- Updating TypeDocs
- Interior implementation changes
- Behavioral changes (like reordering list elements)

---

## Documents and Data

Data in Foundry Virtual Tabletop is organized around the concept of Documents. Each document represents a single coherent piece of data which represents a specific object within the framework.

### Document Abstraction

- **[foundry.abstract.DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)** - The abstract base class which defines a data model with corresponding schema and state
- **[foundry.abstract.Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)** - The abstract base class shared by both client and server-side which defines the model for a single document type

### Database Operations

- **[foundry.abstract.DatabaseBackend](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html)** - An interface shared by both the client and server-side which defines how creation, update, and deletion operations are transacted
- **[foundry.data.ClientDatabaseBackend](https://foundryvtt.com/api/classes/foundry.data.ClientDatabaseBackend.html)** - An implementation of the abstract backend which performs client-side CRUD operations

### Collections

- **[foundry.documents.abstract.DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)** - An abstract subclass of the Collection container which defines a collection of Document instances
- **[foundry.documents.abstract.WorldCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html)** - A collection of world-level Document objects with a singleton instance per primary Document type
- **[foundry.documents.collections.CompendiumCollection](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumCollection.html)** - A collection of Document objects contained within a specific compendium pack

### Primary Document Types

Foundry Virtual Tabletop includes the following primary Document types, each saved to its own database table within the active World:

#### Actor

- **[foundry.documents.BaseActor](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html)** - Base Actor model definition
- **[foundry.documents.Actor](https://foundryvtt.com/api/classes/foundry.documents.Actor.html)** - Client-side Actor document
- **[foundry.documents.collections.Actors](https://foundryvtt.com/api/classes/foundry.documents.collections.Actors.html)** - Singleton collection of Actor documents
- **[foundry.applications.sheets.ActorSheetV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.ActorSheetV2.html)** - Application for displaying and editing an Actor
- **[foundry.applications.sidebar.tabs.ActorDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ActorDirectory.html)** - Sidebar directory for Actor documents

#### Adventure

- **[foundry.documents.BaseAdventure](https://foundryvtt.com/api/classes/foundry.documents.BaseAdventure.html)** - Base Adventure model definition
- **[foundry.documents.Adventure](https://foundryvtt.com/api/classes/foundry.documents.Adventure.html)** - Client-side Adventure document
- **[foundry.applications.sheets.AdventureExporter](https://foundryvtt.com/api/classes/foundry.applications.sheets.AdventureExporter.html)** - Application for exporting Adventures
- **[foundry.applications.sheets.AdventureImporterV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.AdventureImporterV2.html)** - Application for importing Adventures

#### Cards

- **[foundry.documents.BaseCards](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html)** - Base Cards model definition
- **[foundry.documents.Cards](https://foundryvtt.com/api/classes/foundry.documents.Cards.html)** - Client-side Cards document
- **[foundry.documents.collections.CardStacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CardStacks.html)** - Singleton collection of Cards documents
- **[foundry.applications.sheets.CardsConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardsConfig.html)** - Application for displaying and editing Cards
- **[foundry.applications.sidebar.tabs.CardsDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CardsDirectory.html)** - Sidebar directory for Cards documents

#### Chat Message

- **[foundry.documents.BaseChatMessage](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html)** - Base ChatMessage model definition
- **[foundry.documents.ChatMessage](https://foundryvtt.com/api/classes/foundry.documents.ChatMessage.html)** - Client-side ChatMessage document
- **[foundry.documents.collections.ChatMessages](https://foundryvtt.com/api/classes/foundry.documents.collections.ChatMessages.html)** - Singleton collection of ChatMessage documents
- **[foundry.applications.sidebar.tabs.ChatLog](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ChatLog.html)** - Sidebar directory for ChatMessage documents

#### Combat Encounter

- **[foundry.documents.BaseCombat](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html)** - Base Combat model definition
- **[foundry.documents.Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html)** - Client-side Combat document
- **[foundry.documents.collections.CombatEncounters](https://foundryvtt.com/api/classes/foundry.documents.collections.CombatEncounters.html)** - Singleton collection of Combat documents
- **[foundry.applications.sidebar.tabs.CombatTracker](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CombatTracker.html)** - Sidebar directory for Combat documents
- **[foundry.applications.apps.CombatTrackerConfig](https://foundryvtt.com/api/classes/foundry.applications.apps.CombatTrackerConfig.html)** - Application for configuring CombatTracker

#### Fog Exploration

- **[foundry.documents.BaseFogExploration](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html)** - Base FogExploration model definition
- **[foundry.documents.FogExploration](https://foundryvtt.com/api/classes/foundry.documents.FogExploration.html)** - Client-side FogExploration document
- **[foundry.documents.collections.FogExplorations](https://foundryvtt.com/api/classes/foundry.documents.collections.FogExplorations.html)** - Singleton collection of FogExploration documents

#### Folder

- **[foundry.documents.BaseFolder](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html)** - Base Folder model definition
- **[foundry.documents.Folder](https://foundryvtt.com/api/classes/foundry.documents.Folder.html)** - Client-side Folder document
- **[foundry.documents.collections.Folders](https://foundryvtt.com/api/classes/foundry.documents.collections.Folders.html)** - Singleton collection of Folder documents
- **[foundry.applications.sheets.FolderConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.FolderConfig.html)** - Application for configuring Folders

#### Item

- **[foundry.documents.BaseItem](https://foundryvtt.com/api/classes/foundry.documents.BaseItem.html)** - Base Item model definition
- **[foundry.documents.Item](https://foundryvtt.com/api/classes/foundry.documents.Item.html)** - Client-side Item document
- **[foundry.documents.collections.Items](https://foundryvtt.com/api/classes/foundry.documents.collections.Items.html)** - Singleton collection of Item documents
- **[foundry.applications.sheets.ItemSheetV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.ItemSheetV2.html)** - Application for displaying and editing Items
- **[foundry.applications.sidebar.tabs.ItemDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ItemDirectory.html)** - Sidebar directory for Item documents

#### Journal Entry

- **[foundry.documents.BaseJournalEntry](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntry.html)** - Base JournalEntry model definition
- **[foundry.documents.JournalEntry](https://foundryvtt.com/api/classes/foundry.documents.JournalEntry.html)** - Client-side JournalEntry document
- **[foundry.documents.collections.Journal](https://foundryvtt.com/api/classes/foundry.documents.collections.Journal.html)** - Singleton collection of JournalEntry documents
- **[foundry.applications.sheets.journal.JournalEntrySheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntrySheet.html)** - Application for displaying and editing JournalEntries
- **[foundry.applications.sidebar.tabs.JournalDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.JournalDirectory.html)** - Sidebar directory for JournalEntry documents

#### Macro

- **[foundry.documents.BaseMacro](https://foundryvtt.com/api/classes/foundry.documents.BaseMacro.html)** - Base Macro model definition
- **[foundry.documents.Macro](https://foundryvtt.com/api/classes/foundry.documents.Macro.html)** - Client-side Macro document
- **[foundry.documents.collections.Macros](https://foundryvtt.com/api/classes/foundry.documents.collections.Macros.html)** - Singleton collection of Macro documents
- **[foundry.applications.sheets.MacroConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.MacroConfig.html)** - Application for displaying and editing Macros
- **[foundry.applications.sidebar.tabs.MacroDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.MacroDirectory.html)** - Sidebar directory for Macro documents

#### Playlist

- **[foundry.documents.BasePlaylist](https://foundryvtt.com/api/classes/foundry.documents.BasePlaylist.html)** - Base Playlist model definition
- **[foundry.documents.Playlist](https://foundryvtt.com/api/classes/foundry.documents.Playlist.html)** - Client-side Playlist document
- **[foundry.documents.collections.Playlists](https://foundryvtt.com/api/classes/foundry.documents.collections.Playlists.html)** - Singleton collection of Playlist documents
- **[foundry.applications.sheets.PlaylistConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.PlaylistConfig.html)** - Application for configuring Playlists
- **[foundry.applications.sidebar.tabs.PlaylistDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.PlaylistDirectory.html)** - Sidebar directory for Playlist documents

#### Rollable Table

- **[foundry.documents.BaseRollTable](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html)** - Base RollTable model definition
- **[foundry.documents.RollTable](https://foundryvtt.com/api/classes/foundry.documents.RollTable.html)** - Client-side RollTable document
- **[foundry.documents.collections.RollTables](https://foundryvtt.com/api/classes/foundry.documents.collections.RollTables.html)** - Singleton collection of RollTable documents
- **[foundry.applications.sheets.RollTableSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.RollTableSheet.html)** - Application for displaying and editing RollTables
- **[foundry.applications.sidebar.tabs.RollTableDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.RollTableDirectory.html)** - Sidebar directory for RollTable documents

#### Scene

- **[foundry.documents.BaseScene](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html)** - Base Scene model definition
- **[foundry.documents.Scene](https://foundryvtt.com/api/classes/foundry.documents.Scene.html)** - Client-side Scene document
- **[foundry.documents.collections.Scenes](https://foundryvtt.com/api/classes/foundry.documents.collections.Scenes.html)** - Singleton collection of Scene documents
- **[foundry.applications.sheets.SceneConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.SceneConfig.html)** - Application for configuring Scenes
- **[foundry.applications.sidebar.tabs.SceneDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.SceneDirectory.html)** - Sidebar directory for Scene documents
- **[foundry.applications.ui.SceneNavigation](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneNavigation.html)** - UI element for Scene navigation

#### Setting

- **[foundry.documents.BaseSetting](https://foundryvtt.com/api/classes/foundry.documents.BaseSetting.html)** - Base Setting model definition
- **[foundry.documents.Setting](https://foundryvtt.com/api/classes/foundry.documents.Setting.html)** - Client-side Setting model
- **[foundry.documents.collections.WorldSettings](https://foundryvtt.com/api/classes/foundry.documents.collections.WorldSettings.html)** - Singleton collection of Setting documents
- **[foundry.applications.settings.SettingsConfig](https://foundryvtt.com/api/classes/foundry.applications.settings.SettingsConfig.html)** - Application for displaying and configuring Settings
- **[foundry.applications.sidebar.tabs.Settings](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.Settings.html)** - Sidebar tab for settings and configuration
- **[foundry.helpers.ClientSettings](https://foundryvtt.com/api/classes/foundry.helpers.ClientSettings.html)** - Class responsible for managing defined game settings

#### User

- **[foundry.documents.BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)** - Base User model definition
- **[foundry.documents.User](https://foundryvtt.com/api/classes/foundry.documents.User.html)** - Client-side User document
- **[foundry.documents.collections.Users](https://foundryvtt.com/api/classes/foundry.documents.collections.Users.html)** - Singleton collection of User documents
- **[foundry.applications.sheets.UserConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.UserConfig.html)** - Application for configuring Users
- **[foundry.applications.ui.Players](https://foundryvtt.com/api/classes/foundry.applications.ui.Players.html)** - UI element displaying current players

### Embedded Document Types

These document types exist only as embedded documents within a parent Document and cannot exist independently:

#### Active Effect

- **[foundry.documents.BaseActiveEffect](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html)** - Base ActiveEffect model definition
- **[foundry.documents.ActiveEffect](https://foundryvtt.com/api/classes/foundry.documents.ActiveEffect.html)** - Client-side ActiveEffect document
- **[foundry.applications.sheets.ActiveEffectConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.ActiveEffectConfig.html)** - Application for configuring ActiveEffects

#### Actor Delta

- **[foundry.documents.BaseActorDelta](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html)** - Base ActorDelta model definition

#### Ambient Light

- **[foundry.documents.BaseAmbientLight](https://foundryvtt.com/api/classes/foundry.documents.BaseAmbientLight.html)** - Base AmbientLight model definition
- **[foundry.documents.AmbientLightDocument](https://foundryvtt.com/api/classes/foundry.documents.AmbientLightDocument.html)** - Client-side AmbientLight document
- **[foundry.applications.sheets.AmbientLightConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.AmbientLightConfig.html)** - Application for configuring AmbientLights

#### Ambient Sound

- **[foundry.documents.BaseAmbientSound](https://foundryvtt.com/api/classes/foundry.documents.BaseAmbientSound.html)** - Base AmbientSound model definition
- **[foundry.documents.AmbientSoundDocument](https://foundryvtt.com/api/classes/foundry.documents.AmbientSoundDocument.html)** - Client-side AmbientSound document
- **[foundry.applications.sheets.AmbientSoundConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.AmbientSoundConfig.html)** - Application for configuring AmbientSounds

#### Card

- **[foundry.documents.BaseCard](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html)** - Base Card model definition
- **[foundry.documents.Card](https://foundryvtt.com/api/classes/foundry.documents.Card.html)** - Client-side Card document
- **[foundry.applications.sheets.CardConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardConfig.html)** - Application for configuring Cards

#### Combatant

- **[foundry.documents.BaseCombatant](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html)** - Base Combatant model definition
- **[foundry.documents.Combatant](https://foundryvtt.com/api/classes/foundry.documents.Combatant.html)** - Client-side Combatant document
- **[foundry.applications.sheets.CombatantConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CombatantConfig.html)** - Application for configuring Combatants

#### Combatant Group

- **[foundry.documents.BaseCombatantGroup](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatantGroup.html)** - Base Combatant Group model definition
- **[foundry.documents.CombatantGroup](https://foundryvtt.com/api/classes/foundry.documents.CombatantGroup.html)** - Client-side Combatant Group document

#### Drawing

- **[foundry.documents.BaseDrawing](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html)** - Base Drawing model definition
- **[foundry.documents.DrawingDocument](https://foundryvtt.com/api/classes/foundry.documents.DrawingDocument.html)** - Client-side Drawing document
- **[foundry.applications.sheets.DrawingConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.DrawingConfig.html)** - Application for configuring Drawings

#### Journal Entry Category

- **[foundry.documents.BaseJournalEntryCategory](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryCategory.html)** - Base JournalEntryCategory model definition
- **[foundry.documents.JournalEntryCategory](https://foundryvtt.com/api/classes/foundry.documents.JournalEntryCategory.html)** - Client-side JournalEntryCategory document
- **[foundry.applications.sheets.journal.JournalEntryCategoryConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryCategoryConfig.html)** - Application for configuring JournalEntryCategories

#### Journal Entry Page

- **[foundry.documents.BaseJournalEntryPage](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html)** - Base JournalEntryPage model definition
- **[foundry.documents.JournalEntryPage](https://foundryvtt.com/api/classes/foundry.documents.JournalEntryPage.html)** - Client-side JournalEntryPage document
- **[foundry.applications.sheets.journal.JournalEntryPageSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageSheet.html)** - Application for displaying and editing JournalEntryPages
  - **[foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPageImageSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageImageSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPageMarkdownSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageMarkdownSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPagePDFSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPagePDFSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPageProseMirrorSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageProseMirrorSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPageTextSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html)**
  - **[foundry.applications.sheets.journal.JournalEntryPageVideoSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageVideoSheet.html)**

#### Measured Template

- **[foundry.documents.BaseMeasuredTemplate](https://foundryvtt.com/api/classes/foundry.documents.BaseMeasuredTemplate.html)** - Base MeasuredTemplate model definition
- **[foundry.documents.MeasuredTemplateDocument](https://foundryvtt.com/api/classes/foundry.documents.MeasuredTemplateDocument.html)** - Client-side MeasuredTemplate document
- **[foundry.applications.sheets.MeasuredTemplateConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.MeasuredTemplateConfig.html)** - Application for configuring MeasuredTemplates

#### Note

- **[foundry.documents.BaseNote](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html)** - Base Note model definition
- **[foundry.documents.NoteDocument](https://foundryvtt.com/api/classes/foundry.documents.NoteDocument.html)** - Client-side Note document
- **[foundry.applications.sheets.NoteConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.NoteConfig.html)** - Application for configuring Notes

#### Playlist Sound

- **[foundry.documents.BasePlaylistSound](https://foundryvtt.com/api/classes/foundry.documents.BasePlaylistSound.html)** - Base PlaylistSound model definition
- **[foundry.documents.PlaylistSound](https://foundryvtt.com/api/classes/foundry.documents.PlaylistSound.html)** - Client-side PlaylistSound document
- **[foundry.applications.sheets.PlaylistSoundConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.PlaylistSoundConfig.html)** - Application for configuring PlaylistSounds

#### Region

- **[foundry.documents.BaseRegion](https://foundryvtt.com/api/classes/foundry.documents.BaseRegion.html)** - Base Region model definition
- **[foundry.documents.RegionDocument](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html)** - Client-side Region document
- **[foundry.applications.sheets.RegionConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.RegionConfig.html)** - Application for configuring Regions

#### Region Behavior

- **[foundry.documents.BaseRegionBehavior](https://foundryvtt.com/api/classes/foundry.documents.BaseRegionBehavior.html)** - Base RegionBehavior model definition
- **[foundry.documents.RegionBehavior](https://foundryvtt.com/api/classes/foundry.documents.RegionBehavior.html)** - Client-side RegionBehavior document
- **[foundry.data.regionBehaviors.RegionBehaviorType](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html)** - Base subtype model of RegionBehavior document
- **[foundry.applications.sheets.RegionConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.RegionConfig.html)** - Application for configuring RegionBehaviors

#### Table Result

- **[foundry.documents.BaseTableResult](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html)** - Base TableResult model definition
- **[foundry.documents.TableResult](https://foundryvtt.com/api/classes/foundry.documents.TableResult.html)** - Client-side TableResult document

#### Tile

- **[foundry.documents.BaseTile](https://foundryvtt.com/api/classes/foundry.documents.BaseTile.html)** - Base Tile model definition
- **[foundry.documents.TileDocument](https://foundryvtt.com/api/classes/foundry.documents.TileDocument.html)** - Client-side Tile document
- **[foundry.applications.sheets.TileConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.TileConfig.html)** - Application for configuring Tiles

#### Token

- **[foundry.documents.BaseToken](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html)** - Base Token model definition
- **[foundry.documents.TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)** - Client-side Token document
- **[foundry.applications.sheets.TokenConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.TokenConfig.html)** - Application for configuring Tokens

#### Wall

- **[foundry.documents.BaseWall](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html)** - Base Wall model definition
- **[foundry.documents.WallDocument](https://foundryvtt.com/api/classes/foundry.documents.WallDocument.html)** - Client-side Wall document
- **[foundry.applications.sheets.WallConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.WallConfig.html)** - Application for configuring Walls

---

## The Game Canvas

The visual game surface in Foundry Virtual Tabletop is managed by a WebGL-powered canvas which uses the [PixiJS](https://www.pixijs.com/) library.

### Canvas Building Blocks

The game canvas is constructed using several core building blocks:

- **[foundry.canvas.Canvas](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html)** - The master controller of the canvas element upon which the tabletop is rendered
- **[foundry.canvas.layers.CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)** - An abstract pattern for primary layers of the game canvas to implement
- **[foundry.canvas.layers.InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)** - An extension of CanvasLayer which provides user interactivity for its contained objects
- **[foundry.canvas.layers.PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)** - A subclass of Canvas Layer which is specifically designed to contain multiple PlaceableObject instances
- **[foundry.documents.abstract.CanvasDocumentMixin](https://foundryvtt.com/api/functions/foundry.documents.abstract.CanvasDocumentMixin.html)** - A specialized sub-class of the ClientDocumentMixin used for document types represented on the Canvas
- **[foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)** - Base class for objects that can be placed on the canvas
- **[foundry.canvas.animation.CanvasAnimation](https://foundryvtt.com/api/classes/foundry.canvas.animation.CanvasAnimation.html)** - Canvas animation system

### Canvas Groups

The first level of canvas hierarchy provides top-level containers for various concepts. They are containers that mixin [foundry.canvas.groups.CanvasGroupMixin](https://foundryvtt.com/api/functions/foundry.canvas.groups.CanvasGroupMixin.html):

- **[foundry.canvas.groups.EffectsCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EffectsCanvasGroup.html)** - Visual effects which modify the appearance of objects in the PrimaryCanvasGroup
- **[foundry.canvas.groups.EnvironmentCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EnvironmentCanvasGroup.html)** - The group containing everything that is not an interface element
- **[foundry.canvas.groups.HiddenCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.HiddenCanvasGroup.html)** - A container for objects which are transformed but not rendered
- **[foundry.canvas.groups.InterfaceCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.InterfaceCanvasGroup.html)** - User interface elements which provide interactivity and context but are not tangible objects within the Scene
- **[foundry.canvas.groups.OverlayCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.OverlayCanvasGroup.html)** - The group for elements which are not bound to the stage world transform
- **[foundry.canvas.groups.PrimaryCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.PrimaryCanvasGroup.html)** - Tangible objects which exist within the Scene and are affected by lighting and other effects
- **[foundry.canvas.groups.RenderedCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.RenderedCanvasGroup.html)** - A container for objects which are rendered on the canvas
- **[foundry.canvas.groups.CanvasVisibility](https://foundryvtt.com/api/classes/foundry.canvas.groups.CanvasVisibility.html)** - The group responsible for dynamic vision, lighting, and fog of war

### Canvas Layers

Within each canvas group there are layers that provide specific functionality:

#### Base Layer Classes

- **[foundry.canvas.layers.CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)** - A base class for all canvas layers
- **[foundry.canvas.layers.InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)** - An extension of CanvasLayer which provides user interactivity
- **[foundry.canvas.layers.PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)** - An extension of InteractionLayer specifically designed for drawing Documents to the canvas

#### Within the Effects Canvas Group

- **[foundry.canvas.layers.CanvasBackgroundAlterationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasBackgroundAlterationEffects.html)**
- **[foundry.canvas.layers.CanvasColorationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasColorationEffects.html)**
- **[foundry.canvas.layers.CanvasDarknessEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasDarknessEffects.html)**
- **[foundry.canvas.layers.CanvasIlluminationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasIlluminationEffects.html)**
- **[foundry.canvas.layers.WeatherEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.WeatherEffects.html)**

#### Within the Interface Canvas Group

- **[foundry.canvas.layers.ControlsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.ControlsLayer.html)**
- **[foundry.canvas.layers.DrawingsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.DrawingsLayer.html)**
- **[foundry.canvas.layers.GridLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.GridLayer.html)**
- **[foundry.canvas.layers.LightingLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.LightingLayer.html)**
- **[foundry.canvas.layers.NotesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.NotesLayer.html)**
- **[foundry.canvas.layers.RegionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.RegionLayer.html)**
- **[foundry.canvas.layers.SoundsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.SoundsLayer.html)**
- **[foundry.canvas.layers.TemplateLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TemplateLayer.html)**
- **[foundry.canvas.layers.TilesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TilesLayer.html)**
- **[foundry.canvas.layers.TokenLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TokenLayer.html)**
- **[foundry.canvas.layers.WallsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.WallsLayer.html)**

### Canvas Objects

Canvas layers contain [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) instances which are rendered within that layer:

- **[foundry.canvas.placeables.AmbientLight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.AmbientLight.html)**
- **[foundry.canvas.placeables.AmbientSound](https://foundryvtt.com/api/classes/foundry.canvas.placeables.AmbientSound.html)**
- **[foundry.canvas.placeables.Drawing](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Drawing.html)**
- **[foundry.canvas.placeables.MeasuredTemplate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.MeasuredTemplate.html)**
- **[foundry.canvas.placeables.Region](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Region.html)**
- **[foundry.canvas.placeables.Tile](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Tile.html)**
- **[foundry.canvas.placeables.Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html)**
- **[foundry.canvas.placeables.Note](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Note.html)**
- **[foundry.canvas.placeables.Wall](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Wall.html)**

### HUD Overlay

In addition to WebGL canvas layers, there is support for HTML-based canvas overlay known as "HUD" objects:

- **[foundry.applications.hud.DrawingHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.DrawingHUD.html)**
- **[foundry.applications.hud.TileHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.TileHUD.html)**
- **[foundry.applications.hud.TokenHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.TokenHUD.html)**

---

## User Interface

In addition to the underlying data and the visual representation on the Canvas, Foundry VTT renders many HTML Applications which represent modular interface components for browsing, editing, or configuring elements of the virtual tabletop.

### Application Building Blocks

The following classes provide high-level building blocks for defining HTML applications within Foundry Virtual Tabletop:

- **[foundry.applications.api.ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)**
- **[foundry.applications.api.DialogV2](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html)**
- **[foundry.applications.api.DocumentSheetV2](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html)**
- **[foundry.applications.apps.FilePicker](https://foundryvtt.com/api/classes/foundry.applications.apps.FilePicker.html)**
- **[foundry.applications.ux.ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)**
- **[foundry.applications.ux.DragDrop](https://foundryvtt.com/api/classes/foundry.applications.ux.DragDrop.html)**
- **[foundry.applications.ux.Tabs](https://foundryvtt.com/api/classes/foundry.applications.ux.Tabs.html)**
- **[foundry.applications.ux.TextEditor](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html)**

---

## Dice Rolling

As a developer, you may often want to trigger dice rolls or customize the behavior of dice rolling. Foundry Virtual Tabletop provides a set of API concepts dedicated towards working with dice:

- **[foundry.dice.Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)** - An interface and API for constructing and evaluating dice rolls
- **[foundry.dice.terms.RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)** - An abstract class which represents a single token that can be used as part of a Roll formula
- **[foundry.dice.MersenneTwister](https://foundryvtt.com/api/classes/foundry.dice.MersenneTwister.html)** - A standalone, pure JavaScript implementation of the Mersenne Twister pseudo random number generator

### Roll Term Types

- **[foundry.dice.terms.DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)** - An abstract base class for any type of RollTerm which involves randomized input from dice, coins, or other devices
- **[foundry.dice.terms.FunctionTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.FunctionTerm.html)** - A type of RollTerm used to apply a function
- **[foundry.dice.terms.NumericTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.NumericTerm.html)** - A type of RollTerm used to represent static numbers
- **[foundry.dice.terms.OperatorTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.OperatorTerm.html)** - A type of RollTerm used to denote and perform an arithmetic operation
- **[foundry.dice.terms.ParentheticalTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.ParentheticalTerm.html)** - A type of RollTerm used to enclose a parenthetical expression to be recursively evaluated
- **[foundry.dice.terms.PoolTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.PoolTerm.html)** - A type of RollTerm which encloses a pool of multiple inner Rolls which are evaluated jointly
- **[foundry.dice.terms.StringTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.StringTerm.html)** - A type of RollTerm used to represent strings which have not yet been matched

### Dice Types

- **[foundry.dice.terms.Die](https://foundryvtt.com/api/classes/foundry.dice.terms.Die.html)** - A type of DiceTerm used to represent rolling a fair n-sided die
- **[foundry.dice.terms.Coin](https://foundryvtt.com/api/classes/foundry.dice.terms.Coin.html)** - A type of DiceTerm used to represent flipping a two-sided coin
- **[foundry.dice.terms.FateDie](https://foundryvtt.com/api/classes/foundry.dice.terms.FateDie.html)** - A type of DiceTerm used to represent a three-sided Fate/Fudge die

---

## Other Major Components

In addition to the outlined structure above, there are many additional miscellaneous elements of the Foundry Virtual Tabletop API:

### Audio and Video

- **[foundry.audio.AudioHelper](https://foundryvtt.com/api/classes/foundry.audio.AudioHelper.html)** - Utilities for working with Audio files
- **[foundry.audio.Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html)** - The Sound class is used to control the playback of audio sources using the Web Audio API
- **[foundry.helpers.media.ImageHelper](https://foundryvtt.com/api/classes/foundry.helpers.media.ImageHelper.html)** - Utilities for working with Image files
- **[foundry.helpers.media.VideoHelper](https://foundryvtt.com/api/classes/foundry.helpers.media.VideoHelper.html)** - Utilities for working with Video files

### Game Management

- **[foundry.Game](https://foundryvtt.com/api/classes/foundry.Game.html)** - The master controller for the active game instance
- **[foundry.helpers.GameTime](https://foundryvtt.com/api/classes/foundry.helpers.GameTime.html)** - A singleton class which keeps the official Server and World time stamps

### Video and Voice Chat

- **[foundry.av.AVMaster](https://foundryvtt.com/api/classes/foundry.av.AVMaster.html)** - The master Audio/Video controller instance
- **[foundry.av.AVClient](https://foundryvtt.com/api/classes/foundry.av.AVClient.html)** - An interface for an Audio/Video client which is extended to provide broadcasting functionality
- **[foundry.av.clients.SimplePeerAVClient](https://foundryvtt.com/api/classes/foundry.av.clients.SimplePeerAVClient.html)** - An implementation of the AVClient which uses the simple-peer library and the Foundry socket server for signaling

### Interactivity

- **[foundry.helpers.Hooks](https://foundryvtt.com/api/classes/foundry.helpers.Hooks.html)** - An infrastructure for registering event handlers which fire under specific conditions
- **[foundry.helpers.interaction.KeyboardManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.KeyboardManager.html)** - A set of helpers and management functions for dealing with user input from keyboard events
- **[foundry.helpers.SocketInterface](https://foundryvtt.com/api/classes/foundry.helpers.SocketInterface.html)** - Helper functions for dispatching and receiving socket events in a standardized way

---

## Module References

### Core Modules

- **[CONFIG](https://foundryvtt.com/api/modules/CONFIG.html)** - Configuration module for core system settings
- **[CONST](https://foundryvtt.com/api/modules/CONST.html)** - Constants module containing system-wide constant values
- **[foundry](https://foundryvtt.com/api/modules/foundry.html)** - Main foundry module containing all core classes and functions
- **[hookEvents](https://foundryvtt.com/api/modules/hookEvents.html)** - Module defining hook events throughout the system
- **[primitives](https://foundryvtt.com/api/modules/primitives.html)** - Module containing primitive data types and utilities

### Additional Resources

For a complete listing of all classes and functions, browse the official [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/modules.html).

---

## Quick Reference Guide

### Development Best Practices

1. **Use Public API Only**: Stick to `@public` and `@protected` methods for stability
2. **Check Documentation**: Always verify API status before using methods
3. **Handle Breaking Changes**: Follow deprecation notices and version guidelines
4. **Test Compatibility**: Ensure your code works across supported versions

### Common Use Cases

#### Working with Documents

```javascript
// Access collections
game.actors.get(id)
game.items.get(id)
game.scenes.get(id)

// Create documents
Actor.create(data)
Item.create(data)

// Update documents
actor.update(updateData)
item.update(updateData)
```

#### Canvas Interaction

```javascript
// Access canvas layers
canvas.tokens
canvas.lighting
canvas.walls

// Get canvas objects
canvas.tokens.controlled
canvas.tokens.get(id)
```

#### Hook System

```javascript
// Register hooks
Hooks.on('ready', callback)
Hooks.on('createActor', callback)
Hooks.on('updateToken', callback)

// Call hooks
Hooks.call('customEvent', data)
```

#### Settings Management

```javascript
// Register settings
game.settings.register(module, key, config)

// Get/Set settings
game.settings.get(module, key)
game.settings.set(module, key, value)
```

---

*This reference document is based on the official Foundry Virtual Tabletop v13 API Documentation. For the most up-to-date information, always refer to the [official documentation](https://foundryvtt.com/api/).*
