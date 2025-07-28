/**
 * @file contextManagementSuite.int.test.js
 * @description Comprehensive integration test for the core context management functionality.
 * Tests Context, ContextFactory, ExternalContextManager, and StorageAdapter working together.
 * @path tests/integration/contextManagementSuite.int.test.js
 */

import Context from '../../src/contexts/context.js';
import ContextFactory from '../../src/contexts/contextFactory.js';
import ExternalContextManager from '../../src/contexts/external.js';
import StorageAdapter from '../../src/contexts/storageAdapter.js';
import { ContextContainer } from '../../src/contexts/helpers/contextContainer.js';
import { ContextItem } from '../../src/contexts/helpers/contextItem.js';
import RootMapParser from '../../src/helpers/rootMapParser.js';

// Mock global objects that would exist in FoundryVTT
global.window = {
  localStorage: new Map(),
  sessionStorage: new Map()
};

global.game = {
  modules: new Map([
    ['test-module', {
      data: new Map(),
      flags: new Map()
    }]
  ]),
  user: {
    id: 'testUser',
    data: new Map(),
    flags: new Map()
  },
  world: {
    id: 'testWorld',
    data: new Map(),
    flags: new Map()
  },
  settings: new Map()
};

// Mock RootMapParser
jest.mock('../../src/helpers/rootMapParser.js', () => ({
  parse: jest.fn()
}));

describe('Context Management Suite Integration Tests', () => {
  let mockConfiguration;

  beforeEach(() => {
    // Reset all mocks and storage
    jest.clearAllMocks();
    global.window.localStorage.clear();
    global.window.sessionStorage.clear();
    global.game.modules.get('test-module').data.clear();
    global.game.modules.get('test-module').flags.clear();
    global.game.user.data.clear();
    global.game.user.flags.clear();
    global.game.world.data.clear();
    global.game.world.flags.clear();
    global.game.settings.clear();

    // Setup comprehensive mock configuration
    mockConfiguration = {
      defaults: {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'overMyHead.context'
      },
      rootMap: {
        localStorage: 'window.localStorage',
        sessionStorage: 'window.sessionStorage',
        'game.modules': 'game.modules',
        'game.user': 'game.user',
        'game.world': 'game.world',
        'game.settings': 'game.settings'
      }
    };

    // Setup RootMapParser mock
    RootMapParser.parse.mockImplementation(({ key }) => {
      switch (key) {
        case 'localStorage':
          return global.window.localStorage;
        case 'sessionStorage':
          return global.window.sessionStorage;
        case 'game.modules':
          return global.game.modules;
        case 'game.user':
          return global.game.user;
        case 'game.world':
          return global.game.world;
        case 'game.settings':
          return global.game.settings;
        default:
          throw new Error(`Unknown root identifier: ${key}`);
      }
    });
  });

  describe('Core Context Functionality Integration', () => {
    it('should create and manage basic Context instances', () => {
      const context = new Context({
        initializationParams: {
          data: { user: 'testUser', count: 5 },
          settings: { theme: 'dark', language: 'en' },
          flags: { isReady: true }
        }
      });

      expect(context).toBeInstanceOf(Context);
      expect(context.data.getItem('user')).toBe('testUser');
      expect(context.data.getItem('count')).toBe(5);
      expect(context.settings.getItem('theme')).toBe('dark');
      expect(context.flags.getItem('isReady')).toBe(true);

      // Test data manipulation
      context.data.setItem('newField', 'newValue');
      expect(context.data.getItem('newField')).toBe('newValue');

      // Test nested data access
      context.data.setItem('nested.deep.path', 'deepValue');
      expect(context.data.getItem('nested.deep.path')).toBe('deepValue');
    });

    it('should support ContextContainer and ContextItem operations', () => {
      const container = new ContextContainer({
        users: { alice: { role: 'admin' }, bob: { role: 'user' } },
        settings: { theme: 'dark' }
      });

      expect(container.getItem('users.alice.role')).toBe('admin');
      expect(container.getItem('settings.theme')).toBe('dark');

      const item = new ContextItem({ count: 5, updated: Date.now() });
      expect(item.value.count).toBe(5);
      expect(item.value.updated).toBeDefined();

      // Test item modification
      item.value = { count: 10, updated: Date.now() };
      expect(item.value.count).toBe(10);
    });

    it('should handle complex nested data structures', () => {
      const context = new Context({
        initializationParams: {
          data: {
            userProfiles: {
              admin: {
                permissions: ['read', 'write', 'delete'],
                settings: { theme: 'dark', notifications: true }
              },
              user: {
                permissions: ['read'],
                settings: { theme: 'light', notifications: false }
              }
            },
            gameState: {
              level: 1,
              score: 1000,
              inventory: ['sword', 'shield', 'potion']
            }
          }
        }
      });

      // Test deep nested access
      expect(context.data.getItem('userProfiles.admin.permissions.0')).toBe('read');
      expect(context.data.getItem('userProfiles.admin.settings.theme')).toBe('dark');
      expect(context.data.getItem('gameState.inventory.2')).toBe('potion');

      // Test deep nested modification
      context.data.setItem('userProfiles.admin.settings.fontSize', 14);
      expect(context.data.getItem('userProfiles.admin.settings.fontSize')).toBe(14);

      context.data.setItem('gameState.inventory.3', 'key');
      expect(context.data.getItem('gameState.inventory.3')).toBe('key');
    });
  });

  describe('Context Factory Integration', () => {
    beforeEach(() => {
      // Mock Context constants for external configuration
      jest.spyOn(Context.prototype, 'constants', 'get').mockReturnValue({
        value: {
          context: {
            external: mockConfiguration
          }
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create different types of contexts through factory', () => {
      // Create in-memory context
      const inMemoryContext = ContextFactory.create('inMemory', {
        data: { source: 'memory' }
      });

      expect(inMemoryContext).toBeInstanceOf(Context);
      expect(inMemoryContext.data.getItem('source')).toBe('memory');

      // Create external context
      const externalContext = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'test.context',
        initializationParams: {
          data: { source: 'localStorage' }
        }
      });

      expect(externalContext).toBeInstanceOf(ExternalContextManager);
      expect(externalContext.data.getItem('source')).toBe('localStorage');
    });

    it('should create multiple contexts at once', () => {
      const contexts = ContextFactory.createMultiple({
        inMemory: {
          data: { temp: true }
        },
        localStorage: {
          rootIdentifier: 'localStorage',
          pathFromRoot: 'app.context',
          initializationParams: {
            data: { persistent: true }
          }
        }
      });

      expect(contexts.inMemory).toBeInstanceOf(Context);
      expect(contexts.localStorage).toBeInstanceOf(ExternalContextManager);

      expect(contexts.inMemory.data.getItem('temp')).toBe(true);
      expect(contexts.localStorage.data.getItem('persistent')).toBe(true);
    });

    it('should handle factory error cases gracefully', () => {
      // Test with invalid type
      const invalidContext = ContextFactory.create('invalidType');
      expect(invalidContext).toBeNull();

      // Test createMultiple with mixed valid/invalid types
      const mixedConfig = {
        inMemory: { data: { test: true } },
        invalid: { type: 'unknownType' }
      };

      const contexts = ContextFactory.createMultiple(mixedConfig);
      expect(contexts.inMemory).toBeInstanceOf(Context);
      expect(contexts.invalid).toBeNull();
    });
  });

  describe('External Storage Integration', () => {
    beforeEach(() => {
      jest.spyOn(Context.prototype, 'constants', 'get').mockReturnValue({
        value: {
          context: {
            external: mockConfiguration
          }
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle external context storage operations', () => {
      const externalManager = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'testApp.context',
        initializationParams: {
          data: { user: 'testUser' },
          settings: { theme: 'dark' }
        }
      });

      expect(externalManager).toBeInstanceOf(ExternalContextManager);
      expect(externalManager.data.getItem('user')).toBe('testUser');
      expect(externalManager.settings.getItem('theme')).toBe('dark');

      // Test storage operations
      expect(externalManager.existsInStorage()).toBe(true);

      const storageInfo = externalManager.getStorageInfo();
      expect(storageInfo.source).toBe('localStorage');
      expect(storageInfo.pathFromRoot).toBe('testApp.context');

      // Test data manipulation through external manager
      externalManager.data.setItem('newData', 'newValue');
      expect(externalManager.data.getItem('newData')).toBe('newValue');

      externalManager.flags.setItem('isActive', true);
      expect(externalManager.flags.getItem('isActive')).toBe(true);
    });

    it('should support StorageAdapter operations', () => {
      const storageAdapter = new StorageAdapter({
        source: 'localStorage',
        configuration: mockConfiguration,
        rootIdentifier: 'localStorage',
        rootMap: mockConfiguration.rootMap,
        pathFromRoot: 'adapter.test',
        mergeStrategy: 'mergeNewerWins'
      });

      const context = new Context({
        initializationParams: {
          data: { test: 'value', timestamp: Date.now() }
        }
      });

      // Store context
      const storedContext = storageAdapter.store(context);
      expect(storedContext).toStrictEqual(context);

      // Check existence
      expect(storageAdapter.exists()).toBe(true);

      // Retrieve context
      const retrievedContext = storageAdapter.retrieve();
      expect(retrievedContext.data.getItem('test')).toBe('value');
      expect(retrievedContext.data.getItem('timestamp')).toBeDefined();

      // Remove context
      expect(storageAdapter.remove()).toBe(true);
      expect(storageAdapter.exists()).toBe(false);
    });

    it('should handle multiple storage backends', () => {
      // Create contexts with different storage backends
      const localStorageContext = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'app.localStorage',
        initializationParams: {
          data: { backend: 'localStorage' }
        }
      });

      const sessionStorageContext = ContextFactory.create('sessionStorage', {
        rootIdentifier: 'sessionStorage',
        pathFromRoot: 'app.sessionStorage',
        initializationParams: {
          data: { backend: 'sessionStorage' }
        }
      });

      // Verify each has correct data and storage info
      expect(localStorageContext.data.getItem('backend')).toBe('localStorage');
      expect(sessionStorageContext.data.getItem('backend')).toBe('sessionStorage');

      const localInfo = localStorageContext.getStorageInfo();
      const sessionInfo = sessionStorageContext.getStorageInfo();

      expect(localInfo.source).toBe('localStorage');
      expect(sessionInfo.source).toBe('sessionStorage');
      expect(localInfo.pathFromRoot).toBe('app.localStorage');
      expect(sessionInfo.pathFromRoot).toBe('app.sessionStorage');
    });
  });

  describe('Real-World Integration Scenarios', () => {
    beforeEach(() => {
      jest.spyOn(Context.prototype, 'constants', 'get').mockReturnValue({
        value: {
          context: {
            external: mockConfiguration
          }
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should support a complete module workflow', () => {
      // Create in-memory context for temporary state
      const gameSession = ContextFactory.create('inMemory', {
        data: {
          sessionId: 'session-123',
          players: ['alice', 'bob'],
          gameState: 'active'
        },
        flags: { isReady: true }
      });

      // Create persistent context for user settings
      const userSettings = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'foundryModule.userSettings',
        initializationParams: {
          settings: {
            theme: 'dark',
            autoSave: true,
            notifications: true
          },
          data: { lastLogin: Date.now() }
        }
      });

      // Create world-specific context
      const worldData = ContextFactory.create('sessionStorage', {
        rootIdentifier: 'sessionStorage',
        pathFromRoot: 'foundryModule.worldData',
        initializationParams: {
          data: {
            worldId: 'world-456',
            difficulty: 'normal',
            customRules: ['rule1', 'rule2']
          }
        }
      });

      // Verify all contexts are working
      expect(gameSession.data.getItem('sessionId')).toBe('session-123');
      expect(gameSession.flags.getItem('isReady')).toBe(true);

      expect(userSettings.settings.getItem('theme')).toBe('dark');
      expect(userSettings.data.getItem('lastLogin')).toBeDefined();

      expect(worldData.data.getItem('worldId')).toBe('world-456');
      expect(worldData.data.getItem('customRules.0')).toBe('rule1');

      // Simulate runtime operations
      gameSession.data.setItem('currentTurn', 1);
      userSettings.settings.setItem('lastSessionId', gameSession.data.getItem('sessionId'));
      worldData.data.setItem('activeSession', gameSession.data.getItem('sessionId'));

      // Verify cross-context data flow
      expect(gameSession.data.getItem('currentTurn')).toBe(1);
      expect(userSettings.settings.getItem('lastSessionId')).toBe('session-123');
      expect(worldData.data.getItem('activeSession')).toBe('session-123');

      // Verify persistence
      expect(userSettings.existsInStorage()).toBe(true);
      expect(worldData.existsInStorage()).toBe(true);
    });

    it('should handle data migration between contexts', () => {
      // Create source context with old data format
      const oldContext = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'migration.old',
        initializationParams: {
          data: {
            version: '1.0',
            userList: { alice: 'admin', bob: 'user' }
          }
        }
      });

      // Create target context for new data format
      const newContext = ContextFactory.create('localStorage', {
        rootIdentifier: 'localStorage',
        pathFromRoot: 'migration.new'
      });

      // Simulate data migration
      const oldData = oldContext.retrieveFromStorage();
      const oldUserList = oldData.data.getItem('userList');

      // Transform data to new format
      const newUsers = Object.entries(oldUserList).map(([name, role], index) => ({
        id: index + 1,
        name,
        role,
        migrated: true
      }));

      // Store in new context
      newContext.context.data.setItem('version', '2.0');
      newContext.context.data.setItem('users', newUsers);
      newContext.context.data.setItem('migrationDate', Date.now());

      // Verify migration
      expect(newContext.data.getItem('version')).toBe('2.0');
      expect(Array.isArray(newContext.data.getItem('users'))).toBe(true);
      expect(newContext.data.getItem('users.0.name')).toBe('alice');
      expect(newContext.data.getItem('users.0.migrated')).toBe(true);
      expect(newContext.data.getItem('migrationDate')).toBeDefined();

      // Cleanup old context
      expect(oldContext.removeFromStorage()).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid context creation efficiently', () => {
      const startTime = Date.now();
      const contexts = [];

      // Create multiple contexts rapidly
      for (let i = 0; i < 20; i++) {
        const context = new Context({
          initializationParams: {
            data: { id: i, itemValue: `data-${i}` }
          }
        });
        contexts.push(context);
      }

      // Verify all contexts
      expect(contexts).toHaveLength(20);
      contexts.forEach((context, index) => {
        expect(context.data.getItem('id')).toBe(index);
        expect(context.data.getItem('itemValue')).toBe(`data-${index}`);
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large data sets efficiently', () => {
      const context = new Context();

      // Create large data set
      const largeData = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`key${i}`] = { content: `value${i}`, index: i };
      }

      context.data.setItem('largeDataSet', largeData);

      // Verify data integrity
      const retrievedData = context.data.getItem('largeDataSet');
      expect(Object.keys(retrievedData)).toHaveLength(1000);
      expect(retrievedData.key0.content).toBe('value0');
      expect(retrievedData.key999.index).toBe(999);

      // Test nested access on large data
      expect(context.data.getItem('largeDataSet.key500.content')).toBe('value500');
    });

    it('should handle external storage cleanup properly', () => {
      jest.spyOn(Context.prototype, 'constants', 'get').mockReturnValue({
        value: {
          context: {
            external: mockConfiguration
          }
        }
      });

      const contexts = [];

      // Create multiple external contexts
      for (let i = 0; i < 5; i++) {
        const context = ContextFactory.create('localStorage', {
          rootIdentifier: 'localStorage',
          pathFromRoot: `cleanup.test${i}`,
          initializationParams: {
            data: { testId: i, cleanup: true }
          }
        });
        contexts.push(context);
      }

      // Verify all exist
      contexts.forEach(context => {
        expect(context.existsInStorage()).toBe(true);
      });

      // Cleanup all contexts
      const cleanupResults = contexts.map(context => {
        return context.removeFromStorage();
      });

      // Verify cleanup
      expect(cleanupResults.every(result => result === true)).toBe(true);
      contexts.forEach(context => {
        expect(context.existsInStorage()).toBe(false);
      });

      jest.restoreAllMocks();
    });

    it('should handle concurrent data operations', async () => {
      const context = new Context({
        initializationParams: {
          data: { counter: 0, operations: [] }
        }
      });

      // Simulate concurrent operations
      const operations = Array.from({ length: 10 }, (_, i) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const currentCounter = context.data.getItem('counter') || 0;
            context.data.setItem('counter', currentCounter + 1);

            const operations = context.data.getItem('operations') || [];
            operations.push(`operation-${i}`);
            context.data.setItem('operations', operations);

            resolve(i);
          }, Math.random() * 50);
        });
      });

      await Promise.all(operations);

      // Verify final state
      expect(context.data.getItem('counter')).toBe(10);
      expect(context.data.getItem('operations')).toHaveLength(10);
    });
  });
});
