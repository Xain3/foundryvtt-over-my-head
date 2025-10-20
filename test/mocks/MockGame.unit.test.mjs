/**
 * @file MockGame.unit.test.mjs
 * @description Unit tests for MockGame class and related components
 * @path tests/mocks/MockGame.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockGame, { MockScene, MockFolder } from './MockGame.mjs';
import MockCollection from './MockCollection.mjs';
import MockSettings from './MockSettings.mjs';

describe('MockGame', () => {
  let game;

  beforeEach(() => {
    game = new MockGame();
  });

  describe('constructor', () => {
    it('should initialize core properties', () => {
      expect(game.ready).toBe(false);
      expect(game.userId).toBe('mock-user-id');
      expect(game.worldId).toBe('mock-world');
      expect(game.systemId).toBe('mock-system');
      expect(game.version).toBe('11.315');
      expect(game.release).toEqual({ generation: 11, build: 315 });
      expect(game.paused).toBe(false);
    });

    it('should initialize collections', () => {
      expect(game.actors).toBeInstanceOf(MockCollection);
      expect(game.items).toBeInstanceOf(MockCollection);
      expect(game.scenes).toBeInstanceOf(MockCollection);
      expect(game.users).toBeInstanceOf(MockCollection);
      expect(game.modules).toBeInstanceOf(MockCollection);
      expect(game.packs).toBeInstanceOf(MockCollection);
      expect(game.folders).toBeInstanceOf(MockCollection);
      expect(game.playlists).toBeInstanceOf(MockCollection);
      expect(game.tables).toBeInstanceOf(MockCollection);
      expect(game.macros).toBeInstanceOf(MockCollection);
      expect(game.cards).toBeInstanceOf(MockCollection);
      expect(game.combats).toBeInstanceOf(MockCollection);
      expect(game.journal).toBeInstanceOf(MockCollection);
      expect(game.messages).toBeInstanceOf(MockCollection);
    });

    it('should initialize systems', () => {
      expect(game.settings).toBeInstanceOf(MockSettings);
      expect(typeof game.keyboard.isDown).toBe('function');
      expect(typeof game.socket.emit).toBe('function');
      expect(typeof game.time.advance).toBe('function');
      expect(typeof game.audio.unlock).toBe('function');
      expect(typeof game.video.getTexture).toBe('function');
      expect(typeof game.tooltip.activate).toBe('function');
    });

    it('should initialize canvas', () => {
      expect(game.canvas.ready).toBe(false);
      expect(game.canvas.scene).toBeNull();
      expect(game.canvas.dimensions).toEqual({ width: 1920, height: 1080 });
      expect(typeof game.canvas.draw).toBe('function');
      expect(game.canvas.tokens.objects).toBeInstanceOf(MockCollection);
    });

    it('should initialize localization', () => {
      expect(game.i18n.lang).toBe('en');
      expect(game.i18n.localize).toBeInstanceOf(Function);
      expect(game.i18n.format).toBeInstanceOf(Function);
    });

    it('should create user and add to collection', () => {
      expect(game.user).toBeDefined();
      expect(game.user.id).toBe('mock-user-id');
      expect(game.user.role).toBe(4);
      expect(game.users.get('mock-user-id')).toBe(game.user);
    });
  });

  describe('localization', () => {
    it('should localize known keys', () => {
      expect(game.i18n.localize('SETTINGS.Configure')).toBe('Configure Settings');
      expect(game.i18n.localize('FOLDER.Create')).toBe('Create Folder');
    });

    it('should return key for unknown translations', () => {
      expect(game.i18n.localize('UNKNOWN.KEY')).toBe('UNKNOWN.KEY');
    });

    it('should format strings with data', () => {
      const result = game.i18n.format('Hello {name}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should handle missing format data', () => {
      const result = game.i18n.format('Hello {name}!', {});
      expect(result).toBe('Hello {name}!');
    });
  });

  describe('keyboard system', () => {
    it('should have isDown method', () => {
      expect(game.keyboard.isDown('Shift')).toBe(false);
      // Note: Mock function call tracking works differently in Vitest
      expect(game.keyboard.isDown).toBeTypeOf('function');
    });
  });

  describe('canvas layers', () => {
    it('should have all required layers', () => {
      const expectedLayers = [
        'background', 'drawings', 'grid', 'walls', 'templates',
        'notes', 'tokens', 'foreground', 'lighting', 'sounds', 'controls'
      ];

      expectedLayers.forEach(layer => {
        expect(game.canvas[layer]).toBeDefined();
        expect(typeof game.canvas[layer].render).toBe('function');
      });
    });

    it('should have object collections for relevant layers', () => {
      const layersWithObjects = ['drawings', 'walls', 'templates', 'notes', 'tokens', 'lighting', 'sounds'];
      
      layersWithObjects.forEach(layer => {
        expect(game.canvas[layer].objects).toBeInstanceOf(MockCollection);
      });
    });
  });
});

describe('MockScene', () => {
  let scene;

  beforeEach(() => {
    scene = new MockScene();
  });

  describe('constructor', () => {
    it('should create scene with default values', () => {
      expect(scene.id).toMatch(/^scene-/);
      expect(scene.name).toBe('Mock Scene');
      expect(scene.active).toBe(false);
      expect(scene.navigation).toBe(false);
    });

    it('should create scene with provided data', () => {
      const data = {
        id: 'custom-scene',
        name: 'Custom Scene',
        active: true,
        navigation: true
      };
      const customScene = new MockScene(data);

      expect(customScene.id).toBe('custom-scene');
      expect(customScene.name).toBe('Custom Scene');
      expect(customScene.active).toBe(true);
      expect(customScene.navigation).toBe(true);
    });
  });
});

describe('MockFolder', () => {
  let folder;

  beforeEach(() => {
    folder = new MockFolder();
  });

  describe('constructor', () => {
    it('should create folder with default values', () => {
      expect(folder.id).toMatch(/^folder-/);
      expect(folder.name).toBe('Mock Folder');
      expect(folder.type).toBe('Actor');
    });

    it('should create folder with provided data', () => {
      const data = {
        id: 'custom-folder',
        name: 'Custom Folder',
        type: 'Item'
      };
      const customFolder = new MockFolder(data);

      expect(customFolder.id).toBe('custom-folder');
      expect(customFolder.name).toBe('Custom Folder');
      expect(customFolder.type).toBe('Item');
    });
  });
});
