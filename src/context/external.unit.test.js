import ExternalContextManager from './external.js';
import Context from './context.js';
import RootManager from './helpers/externalCtxRootManager.js';
import _ from 'lodash';

/**
 * @file external.test.js
 * @description Unit tests for the ExternalContextManager class.
 * @path /src/context/external.test.js
 */


// Mock dependencies
jest.mock('./context.js');
jest.mock('./helpers/externalCtxRootManager.js');
jest.mock('lodash');

describe('ExternalContextManager', () => {
  let mockContext;
  let mockRootManager;
  let mockRoot;
  let mockConstants;
  let mockDefaults;
  let mockRemoteContext;

  beforeEach(() => {
    // Mock context instance
    mockRemoteContext = {
      schema: { test: 'schema' },
      manifest: { test: 'manifest' },
      flags: { test: 'flags' },
      state: { test: 'state' },
      data: { test: 'data' },
      settings: { test: 'settings' },
      compare: jest.fn(),
      sync: jest.fn(),
      autoSync: jest.fn(),
      updateToMatch: jest.fn(),
      updateTarget: jest.fn(),
      mergeNewerWins: jest.fn(),
      mergeWithPriority: jest.fn(),
      mergeWithTargetPriority: jest.fn(),
      isCompatibleWith: jest.fn(),
      createSnapshot: jest.fn(),
      syncComponent: jest.fn(),
      autoSyncComponent: jest.fn(),
      syncData: jest.fn(),
      syncState: jest.fn(),
      syncFlags: jest.fn(),
      syncComponents: jest.fn()
    };

    mockDefaults = {
      rootIdentifier: 'defaultRoot',
      defaultPathFromRoot: 'defaultPath'
    };

    mockConstants = {
      external: {
        defaults: mockDefaults,
        rootMap: { test: 'rootMap' }
      }
    };

    mockContext = {
      constants: mockConstants
    };

    mockRoot = {};

    // Mock Context constructor
    Context.mockImplementation(() => mockContext);

    // Mock RootManager
    mockRootManager = {
      getRoot: jest.fn().mockReturnValue(mockRoot)
    };
    RootManager.mockImplementation(() => mockRootManager);

    // Mock lodash cloneDeep
    _.cloneDeep.mockReturnValue(mockRemoteContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with default parameters', () => {
      const manager = new ExternalContextManager();

      expect(Context).toHaveBeenCalledTimes(1);
      expect(RootManager).toHaveBeenCalledWith({
        rootMap: mockConstants.external.rootMap,
        rootIdentifier: mockDefaults.rootIdentifier
      });
      expect(mockRootManager.getRoot).toHaveBeenCalledWith({
        rootIdentifier: mockDefaults.rootIdentifier
      });
      expect(_.cloneDeep).toHaveBeenCalledWith(mockContext);
      expect(manager.remoteContext).toBe(mockRemoteContext);
    });

    it('should create an instance with custom rootIdentifier', () => {
      const customRootId = 'customRoot';
      const manager = new ExternalContextManager(customRootId);

      expect(RootManager).toHaveBeenCalledWith({
        rootMap: mockConstants.external.rootMap,
        rootIdentifier: customRootId
      });
      expect(mockRootManager.getRoot).toHaveBeenCalledWith({
        rootIdentifier: customRootId
      });
    });

    it('should create an instance with custom pathFromRoot', () => {
      const customPath = 'customPath';
      const manager = new ExternalContextManager(undefined, customPath);

      expect(mockRoot[customPath]).toBe(mockRemoteContext);
    });

    it('should create an instance with both custom parameters', () => {
      const customRootId = 'customRoot';
      const customPath = 'customPath';
      const manager = new ExternalContextManager(customRootId, customPath);

      expect(RootManager).toHaveBeenCalledWith({
        rootMap: mockConstants.external.rootMap,
        rootIdentifier: customRootId
      });
      expect(mockRoot[customPath]).toBe(mockRemoteContext);
    });
  });

  describe('retrieveRoot', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager();
    });

    it('should retrieve root with default identifier when none provided', () => {
      const result = manager.retrieveRoot();

      expect(mockRootManager.getRoot).toHaveBeenCalledWith({
        rootIdentifier: mockDefaults.rootIdentifier
      });
      expect(result).toBe(mockRoot);
    });

    it('should retrieve root with custom identifier', () => {
      const customRootId = 'customRoot';
      const result = manager.retrieveRoot(customRootId);

      expect(mockRootManager.getRoot).toHaveBeenCalledWith({
        rootIdentifier: customRootId
      });
      expect(result).toBe(mockRoot);
    });
  });

  describe('getters', () => {
    let manager;

    beforeEach(() => {
      manager = new ExternalContextManager();
    });

    it('should return context from remoteContext', () => {
      expect(manager.context).toBe(mockRemoteContext);
    });

    it('should return schema from remoteContext', () => {
      expect(manager.schema).toBe(mockRemoteContext.schema);
    });

    it('should return constants', () => {
      expect(manager.constants).toBe(mockConstants);
    });

    it('should return defaults', () => {
      expect(manager.defaults).toBe(mockDefaults);
    });

    it('should return manifest from remoteContext', () => {
      expect(manager.manifest).toBe(mockRemoteContext.manifest);
    });

    it('should return flags from remoteContext', () => {
      expect(manager.flags).toBe(mockRemoteContext.flags);
    });

    it('should return state from remoteContext', () => {
      expect(manager.state).toBe(mockRemoteContext.state);
    });

    it('should return data from remoteContext', () => {
      expect(manager.data).toBe(mockRemoteContext.data);
    });

    it('should return settings from remoteContext', () => {
      expect(manager.settings).toBe(mockRemoteContext.settings);
    });
  });

  describe('context delegation methods', () => {
    let manager;
    let otherContext;

    beforeEach(() => {
      manager = new ExternalContextManager();
      otherContext = new Context();
    });

    it('should delegate compare to remoteContext', () => {
      const expectedResult = 'compareResult';
      mockRemoteContext.compare.mockReturnValue(expectedResult);

      const result = manager.compare(otherContext);

      expect(mockRemoteContext.compare).toHaveBeenCalledWith(otherContext);
      expect(result).toBe(expectedResult);
    });

    it('should delegate sync to remoteContext', () => {
      const expectedResult = 'syncResult';
      const operation = 'testOperation';
      const options = { test: 'options' };
      mockRemoteContext.sync.mockReturnValue(expectedResult);

      const result = manager.sync(otherContext, operation, options);

      expect(mockRemoteContext.sync).toHaveBeenCalledWith(otherContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSync to remoteContext', () => {
      const expectedResult = 'autoSyncResult';
      const options = { test: 'options' };
      mockRemoteContext.autoSync.mockReturnValue(expectedResult);

      const result = manager.autoSync(otherContext, options);

      expect(mockRemoteContext.autoSync).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateToMatch to remoteContext', () => {
      const expectedResult = 'updateToMatchResult';
      const options = { test: 'options' };
      mockRemoteContext.updateToMatch.mockReturnValue(expectedResult);

      const result = manager.updateToMatch(otherContext, options);

      expect(mockRemoteContext.updateToMatch).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateTarget to remoteContext', () => {
      const expectedResult = 'updateTargetResult';
      const options = { test: 'options' };
      mockRemoteContext.updateTarget.mockReturnValue(expectedResult);

      const result = manager.updateTarget(otherContext, options);

      expect(mockRemoteContext.updateTarget).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeNewerWins to remoteContext', () => {
      const expectedResult = 'mergeNewerWinsResult';
      const options = { test: 'options' };
      mockRemoteContext.mergeNewerWins.mockReturnValue(expectedResult);

      const result = manager.mergeNewerWins(otherContext, options);

      expect(mockRemoteContext.mergeNewerWins).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithPriority to remoteContext', () => {
      const expectedResult = 'mergeWithPriorityResult';
      const options = { test: 'options' };
      mockRemoteContext.mergeWithPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithPriority(otherContext, options);

      expect(mockRemoteContext.mergeWithPriority).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithTargetPriority to remoteContext', () => {
      const expectedResult = 'mergeWithTargetPriorityResult';
      const options = { test: 'options' };
      mockRemoteContext.mergeWithTargetPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithTargetPriority(otherContext, options);

      expect(mockRemoteContext.mergeWithTargetPriority).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate isCompatibleWith to remoteContext', () => {
      const expectedResult = true;
      const options = { test: 'options' };
      mockRemoteContext.isCompatibleWith.mockReturnValue(expectedResult);

      const result = manager.isCompatibleWith(otherContext, options);

      expect(mockRemoteContext.isCompatibleWith).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate createSnapshot to remoteContext', () => {
      const expectedResult = 'snapshotResult';
      const options = { test: 'options' };
      mockRemoteContext.createSnapshot.mockReturnValue(expectedResult);

      const result = manager.createSnapshot(options);

      expect(mockRemoteContext.createSnapshot).toHaveBeenCalledWith(options);
      expect(result).toBe(expectedResult);
    });
  });

  describe('component sync methods', () => {
    let manager;
    let targetContext;
    let targetManager;

    beforeEach(() => {
      manager = new ExternalContextManager();
      targetContext = new Context();
      targetManager = new ExternalContextManager();
      targetManager.remoteContext = { test: 'targetRemoteContext' };
    });

    it('should delegate syncComponent with Context target', () => {
      const expectedResult = 'syncComponentResult';
      const componentKey = 'data';
      const operation = 'merge';
      const options = { test: 'options' };
      mockRemoteContext.syncComponent.mockReturnValue(expectedResult);

      const result = manager.syncComponent(componentKey, targetContext, operation, options);

      expect(mockRemoteContext.syncComponent).toHaveBeenCalledWith(componentKey, targetContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponent with ExternalContextManager target', () => {
      const expectedResult = 'syncComponentResult';
      const componentKey = 'data';
      const operation = 'merge';
      const options = { test: 'options' };
      mockRemoteContext.syncComponent.mockReturnValue(expectedResult);

      const result = manager.syncComponent(componentKey, targetManager, operation, options);

      expect(mockRemoteContext.syncComponent).toHaveBeenCalledWith(componentKey, targetManager.remoteContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSyncComponent with Context target', () => {
      const expectedResult = 'autoSyncComponentResult';
      const componentKey = 'state';
      const options = { test: 'options' };
      mockRemoteContext.autoSyncComponent.mockReturnValue(expectedResult);

      const result = manager.autoSyncComponent(componentKey, targetContext, options);

      expect(mockRemoteContext.autoSyncComponent).toHaveBeenCalledWith(componentKey, targetContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncData with default operation', () => {
      const expectedResult = 'syncDataResult';
      mockRemoteContext.syncData.mockReturnValue(expectedResult);

      const result = manager.syncData(targetContext);

      expect(mockRemoteContext.syncData).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncData with custom operation and options', () => {
      const expectedResult = 'syncDataResult';
      const operation = 'merge';
      const options = { test: 'options' };
      mockRemoteContext.syncData.mockReturnValue(expectedResult);

      const result = manager.syncData(targetManager, operation, options);

      expect(mockRemoteContext.syncData).toHaveBeenCalledWith(targetManager.remoteContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncState with default operation', () => {
      const expectedResult = 'syncStateResult';
      mockRemoteContext.syncState.mockReturnValue(expectedResult);

      const result = manager.syncState(targetContext);

      expect(mockRemoteContext.syncState).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncFlags with default operation', () => {
      const expectedResult = 'syncFlagsResult';
      mockRemoteContext.syncFlags.mockReturnValue(expectedResult);

      const result = manager.syncFlags(targetContext);

      expect(mockRemoteContext.syncFlags).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponents with default operation', () => {
      const expectedResult = 'syncComponentsResult';
      const componentKeys = ['data', 'state'];
      mockRemoteContext.syncComponents.mockReturnValue(expectedResult);

      const result = manager.syncComponents(componentKeys, targetContext);

      expect(mockRemoteContext.syncComponents).toHaveBeenCalledWith(componentKeys, targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponents with custom parameters', () => {
      const expectedResult = 'syncComponentsResult';
      const componentKeys = ['flags', 'settings'];
      const operation = 'merge';
      const options = { test: 'options' };
      mockRemoteContext.syncComponents.mockReturnValue(expectedResult);

      const result = manager.syncComponents(componentKeys, targetManager, operation, options);

      expect(mockRemoteContext.syncComponents).toHaveBeenCalledWith(componentKeys, targetManager.remoteContext, operation, options);
      expect(result).toBe(expectedResult);
    });
  });

  describe('private methods', () => {
    it('should initialize remote context correctly', () => {
      const customRoot = {};
      const customPath = 'customPath';

      new ExternalContextManager();

      // Verify that the cloned context was assigned to the root at the specified path
      expect(_.cloneDeep).toHaveBeenCalledWith(mockContext);
      expect(mockRoot[mockDefaults.defaultPathFromRoot]).toBe(mockRemoteContext);
    });
  });
});