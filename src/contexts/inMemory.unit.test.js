/**
 * @file inMemory.unit.test.js
 * @description Unit tests for the InMemoryContextManager class.
 * @path /src/contexts/inMemory.unit.test.js
 */

import InMemoryContextManager from './inMemory.js';
import Context from './context.js';

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
      compare: jest.fn()
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

  describe('compare method', () => {
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
  });
});