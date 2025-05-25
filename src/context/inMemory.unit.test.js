import InMemoryContextManager from './inMemory.js';
import Context from './context.js';

/**
 * @file memory.test.js
 * @description Unit tests for the InMemoryContextManager class.
 * @path /src/context/memory.test.js
 */


// Mock dependencies
jest.mock('./context.js');

describe('InMemoryContextManager', () => {
  let mockContext;

  beforeEach(() => {
    // Mock context instance with all required properties and methods
    mockContext = {
      schema: { test: 'schema' },
      constants: { test: 'constants' },
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
      syncComponent: jest.fn(),
      autoSyncComponent: jest.fn(),
      syncSchema: jest.fn(),
      syncData: jest.fn(),
      syncState: jest.fn(),
      syncFlags: jest.fn(),
      syncSettings: jest.fn(),
      syncComponents: jest.fn()
    };

    // Mock Context constructor
    Context.mockImplementation(() => mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with a new Context', () => {
      const manager = new InMemoryContextManager();

      expect(Context).toHaveBeenCalledTimes(1);
      expect(manager.context).toBe(mockContext);
    });
  });

  describe('getters', () => {
    let manager;

    beforeEach(() => {
      manager = new InMemoryContextManager();
    });

    it('should return context', () => {
      expect(manager.context).toBe(mockContext);
    });

    it('should return schema from context', () => {
      expect(manager.schema).toBe(mockContext.schema);
    });

    it('should return constants from context', () => {
      expect(manager.constants).toBe(mockContext.constants);
    });

    it('should return manifest from context', () => {
      expect(manager.manifest).toBe(mockContext.manifest);
    });

    it('should return flags from context', () => {
      expect(manager.flags).toBe(mockContext.flags);
    });

    it('should return state from context', () => {
      expect(manager.state).toBe(mockContext.state);
    });

    it('should return data from context', () => {
      expect(manager.data).toBe(mockContext.data);
    });

    it('should return settings from context', () => {
      expect(manager.settings).toBe(mockContext.settings);
    });
  });

  describe('context delegation methods', () => {
    let manager;
    let otherContext;

    beforeEach(() => {
      manager = new InMemoryContextManager();
      otherContext = new Context();
    });

    it('should delegate compare to context', () => {
      const expectedResult = 'compareResult';
      mockContext.compare.mockReturnValue(expectedResult);

      const result = manager.compare(otherContext);

      expect(mockContext.compare).toHaveBeenCalledWith(otherContext);
      expect(result).toBe(expectedResult);
    });

    it('should delegate sync to context', () => {
      const expectedResult = 'syncResult';
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.sync.mockReturnValue(expectedResult);

      const result = manager.sync(otherContext, operation, options);

      expect(mockContext.sync).toHaveBeenCalledWith(otherContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate sync with default options', () => {
      const expectedResult = 'syncResult';
      const operation = 'merge';
      mockContext.sync.mockReturnValue(expectedResult);

      const result = manager.sync(otherContext, operation);

      expect(mockContext.sync).toHaveBeenCalledWith(otherContext, operation, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSync to context', () => {
      const expectedResult = 'autoSyncResult';
      const options = { test: 'options' };
      mockContext.autoSync.mockReturnValue(expectedResult);

      const result = manager.autoSync(otherContext, options);

      expect(mockContext.autoSync).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSync with default options', () => {
      const expectedResult = 'autoSyncResult';
      mockContext.autoSync.mockReturnValue(expectedResult);

      const result = manager.autoSync(otherContext);

      expect(mockContext.autoSync).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateToMatch to context', () => {
      const expectedResult = 'updateToMatchResult';
      const options = { test: 'options' };
      mockContext.updateToMatch.mockReturnValue(expectedResult);

      const result = manager.updateToMatch(otherContext, options);

      expect(mockContext.updateToMatch).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateToMatch with default options', () => {
      const expectedResult = 'updateToMatchResult';
      mockContext.updateToMatch.mockReturnValue(expectedResult);

      const result = manager.updateToMatch(otherContext);

      expect(mockContext.updateToMatch).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateTarget to context', () => {
      const expectedResult = 'updateTargetResult';
      const options = { test: 'options' };
      mockContext.updateTarget.mockReturnValue(expectedResult);

      const result = manager.updateTarget(otherContext, options);

      expect(mockContext.updateTarget).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate updateTarget with default options', () => {
      const expectedResult = 'updateTargetResult';
      mockContext.updateTarget.mockReturnValue(expectedResult);

      const result = manager.updateTarget(otherContext);

      expect(mockContext.updateTarget).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeNewerWins to context', () => {
      const expectedResult = 'mergeNewerWinsResult';
      const options = { test: 'options' };
      mockContext.mergeNewerWins.mockReturnValue(expectedResult);

      const result = manager.mergeNewerWins(otherContext, options);

      expect(mockContext.mergeNewerWins).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeNewerWins with default options', () => {
      const expectedResult = 'mergeNewerWinsResult';
      mockContext.mergeNewerWins.mockReturnValue(expectedResult);

      const result = manager.mergeNewerWins(otherContext);

      expect(mockContext.mergeNewerWins).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithPriority to context', () => {
      const expectedResult = 'mergeWithPriorityResult';
      const options = { test: 'options' };
      mockContext.mergeWithPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithPriority(otherContext, options);

      expect(mockContext.mergeWithPriority).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithPriority with default options', () => {
      const expectedResult = 'mergeWithPriorityResult';
      mockContext.mergeWithPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithPriority(otherContext);

      expect(mockContext.mergeWithPriority).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithTargetPriority to context', () => {
      const expectedResult = 'mergeWithTargetPriorityResult';
      const options = { test: 'options' };
      mockContext.mergeWithTargetPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithTargetPriority(otherContext, options);

      expect(mockContext.mergeWithTargetPriority).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate mergeWithTargetPriority with default options', () => {
      const expectedResult = 'mergeWithTargetPriorityResult';
      mockContext.mergeWithTargetPriority.mockReturnValue(expectedResult);

      const result = manager.mergeWithTargetPriority(otherContext);

      expect(mockContext.mergeWithTargetPriority).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate isCompatibleWith to context', () => {
      const expectedResult = true;
      const options = { test: 'options' };
      mockContext.isCompatibleWith.mockReturnValue(expectedResult);

      const result = manager.isCompatibleWith(otherContext, options);

      expect(mockContext.isCompatibleWith).toHaveBeenCalledWith(otherContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate isCompatibleWith with default options', () => {
      const expectedResult = false;
      mockContext.isCompatibleWith.mockReturnValue(expectedResult);

      const result = manager.isCompatibleWith(otherContext);

      expect(mockContext.isCompatibleWith).toHaveBeenCalledWith(otherContext, {});
      expect(result).toBe(expectedResult);
    });
  });

  describe('component sync methods', () => {
    let manager;
    let targetContext;
    let targetManager;

    beforeEach(() => {
      manager = new InMemoryContextManager();
      targetContext = new Context();
      targetManager = new InMemoryContextManager();
    });

    it('should delegate syncComponent with Context target', () => {
      const expectedResult = 'syncComponentResult';
      const componentKey = 'data';
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.syncComponent.mockReturnValue(expectedResult);

      const result = manager.syncComponent(componentKey, targetContext, operation, options);

      expect(mockContext.syncComponent).toHaveBeenCalledWith(componentKey, targetContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponent with InMemoryContextManager target', () => {
      const expectedResult = 'syncComponentResult';
      const componentKey = 'state';
      const operation = 'replace';
      const options = { test: 'options' };
      mockContext.syncComponent.mockReturnValue(expectedResult);

      const result = manager.syncComponent(componentKey, targetManager, operation, options);

      expect(mockContext.syncComponent).toHaveBeenCalledWith(componentKey, targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponent with default options', () => {
      const expectedResult = 'syncComponentResult';
      const componentKey = 'flags';
      const operation = 'update';
      mockContext.syncComponent.mockReturnValue(expectedResult);

      const result = manager.syncComponent(componentKey, targetContext, operation);

      expect(mockContext.syncComponent).toHaveBeenCalledWith(componentKey, targetContext, operation, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSyncComponent with Context target', () => {
      const expectedResult = 'autoSyncComponentResult';
      const componentKey = 'settings';
      const options = { test: 'options' };
      mockContext.autoSyncComponent.mockReturnValue(expectedResult);

      const result = manager.autoSyncComponent(componentKey, targetContext, options);

      expect(mockContext.autoSyncComponent).toHaveBeenCalledWith(componentKey, targetContext, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSyncComponent with InMemoryContextManager target', () => {
      const expectedResult = 'autoSyncComponentResult';
      const componentKey = 'schema';
      const options = { test: 'options' };
      mockContext.autoSyncComponent.mockReturnValue(expectedResult);

      const result = manager.autoSyncComponent(componentKey, targetManager, options);

      expect(mockContext.autoSyncComponent).toHaveBeenCalledWith(componentKey, targetManager.context, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate autoSyncComponent with default options', () => {
      const expectedResult = 'autoSyncComponentResult';
      const componentKey = 'data';
      mockContext.autoSyncComponent.mockReturnValue(expectedResult);

      const result = manager.autoSyncComponent(componentKey, targetContext);

      expect(mockContext.autoSyncComponent).toHaveBeenCalledWith(componentKey, targetContext, {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncSchema with Context target', () => {
      const expectedResult = 'syncSchemaResult';
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.syncSchema.mockReturnValue(expectedResult);

      const result = manager.syncSchema(targetContext, operation, options);

      expect(mockContext.syncSchema).toHaveBeenCalledWith(targetContext, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncSchema with InMemoryContextManager target', () => {
      const expectedResult = 'syncSchemaResult';
      const operation = 'replace';
      const options = { test: 'options' };
      mockContext.syncSchema.mockReturnValue(expectedResult);

      const result = manager.syncSchema(targetManager, operation, options);

      expect(mockContext.syncSchema).toHaveBeenCalledWith(targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncSchema with default parameters', () => {
      const expectedResult = 'syncSchemaResult';
      mockContext.syncSchema.mockReturnValue(expectedResult);

      const result = manager.syncSchema(targetContext);

      expect(mockContext.syncSchema).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncData with default parameters', () => {
      const expectedResult = 'syncDataResult';
      mockContext.syncData.mockReturnValue(expectedResult);

      const result = manager.syncData(targetContext);

      expect(mockContext.syncData).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncData with custom parameters', () => {
      const expectedResult = 'syncDataResult';
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.syncData.mockReturnValue(expectedResult);

      const result = manager.syncData(targetManager, operation, options);

      expect(mockContext.syncData).toHaveBeenCalledWith(targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncState with default parameters', () => {
      const expectedResult = 'syncStateResult';
      mockContext.syncState.mockReturnValue(expectedResult);

      const result = manager.syncState(targetContext);

      expect(mockContext.syncState).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncState with custom parameters', () => {
      const expectedResult = 'syncStateResult';
      const operation = 'update';
      const options = { test: 'options' };
      mockContext.syncState.mockReturnValue(expectedResult);

      const result = manager.syncState(targetManager, operation, options);

      expect(mockContext.syncState).toHaveBeenCalledWith(targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncFlags with default parameters', () => {
      const expectedResult = 'syncFlagsResult';
      mockContext.syncFlags.mockReturnValue(expectedResult);

      const result = manager.syncFlags(targetContext);

      expect(mockContext.syncFlags).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncFlags with custom parameters', () => {
      const expectedResult = 'syncFlagsResult';
      const operation = 'replace';
      const options = { test: 'options' };
      mockContext.syncFlags.mockReturnValue(expectedResult);

      const result = manager.syncFlags(targetManager, operation, options);

      expect(mockContext.syncFlags).toHaveBeenCalledWith(targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncSettings with default parameters', () => {
      const expectedResult = 'syncSettingsResult';
      mockContext.syncSettings.mockReturnValue(expectedResult);

      const result = manager.syncSettings(targetContext);

      expect(mockContext.syncSettings).toHaveBeenCalledWith(targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncSettings with custom parameters', () => {
      const expectedResult = 'syncSettingsResult';
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.syncSettings.mockReturnValue(expectedResult);

      const result = manager.syncSettings(targetManager, operation, options);

      expect(mockContext.syncSettings).toHaveBeenCalledWith(targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponents with default parameters', () => {
      const expectedResult = 'syncComponentsResult';
      const componentKeys = ['data', 'state'];
      mockContext.syncComponents.mockReturnValue(expectedResult);

      const result = manager.syncComponents(componentKeys, targetContext);

      expect(mockContext.syncComponents).toHaveBeenCalledWith(componentKeys, targetContext, 'auto', {});
      expect(result).toBe(expectedResult);
    });

    it('should delegate syncComponents with custom parameters', () => {
      const expectedResult = 'syncComponentsResult';
      const componentKeys = ['flags', 'settings', 'data'];
      const operation = 'merge';
      const options = { test: 'options' };
      mockContext.syncComponents.mockReturnValue(expectedResult);

      const result = manager.syncComponents(componentKeys, targetManager, operation, options);

      expect(mockContext.syncComponents).toHaveBeenCalledWith(componentKeys, targetManager.context, operation, options);
      expect(result).toBe(expectedResult);
    });
  });
});