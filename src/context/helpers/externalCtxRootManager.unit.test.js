/**
 * @file externalCtxRootManager.test.js
 * @description Unit tests for the RootManager class.
 * @path src/context/helpers/externalCtxRootManager.test.js
*/

import RootManager from './externalCtxRootManager.js';
import RootManagerValidator from './validators/rootManagerValidator.js';

// Mock the validator
jest.mock('./validators/rootManagerValidator.js');

describe('RootManager', () => {
  let mockRootMap;
  let mockRootMapEntry;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRootMapEntry = { type: 'global', path: 'window.testObject' };
    mockRootMap = {
      rootMap: {
        'validSource': mockRootMapEntry,
        'anotherSource': { type: 'module', path: 'someModule' }
      }
    };

    // Default mock implementations
    RootManagerValidator.validateSourceString.mockReturnValue(true);
    RootManagerValidator.validateManageRootArgs.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should create a RootManager instance with provided rootMap and rootIdentifier', () => {
      const rootManager = new RootManager({
        rootMap: mockRootMap,
        rootIdentifier: 'validSource'
      });

      expect(rootManager.rootMap).toBe(mockRootMap);
      expect(rootManager.rootIdentifier).toBe('validSource');
      expect(rootManager.root).toBe(mockRootMapEntry);
    });

    it('should create a RootManager instance with undefined rootIdentifier', () => {
      const rootManager = new RootManager({ rootMap: mockRootMap });

      expect(rootManager.rootMap).toBe(mockRootMap);
      expect(rootManager.rootIdentifier).toBeUndefined();
      expect(rootManager.root).toBeNull();
    });
  });

  describe('_determineRoot', () => {
    let rootManager;

    beforeEach(() => {
      rootManager = new RootManager({ rootMap: mockRootMap });
    });

    it('should return root map entry for valid source string', () => {
      const result = rootManager._determineRoot('validSource');

      expect(RootManagerValidator.validateSourceString).toHaveBeenCalledWith('validSource', 'determine', true, true);
      expect(result).toBe(mockRootMapEntry);
    });

    it('should return null when validation fails with throwError false', () => {
      RootManagerValidator.validateSourceString.mockReturnValue(false);

      const result = rootManager._determineRoot('invalidSource', false, true);

      expect(result).toBeNull();
    });

    it('should log error when source string not found in root map with throwError true', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      rootManager._determineRoot('nonExistentSource');

      expect(consoleSpy).toHaveBeenCalledWith('Could not determine remote context root. Source string \'nonExistentSource\' is not a valid key in the root map');

      consoleSpy.mockRestore();
    });

    it('should return null when source string not found in root map with throwError false', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = rootManager._determineRoot('nonExistentSource', false, true);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Could not determine remote context root. Source string \'nonExistentSource\' is not a valid key in the root map');

      consoleSpy.mockRestore();
    });

    it('should not log error when logError is false', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = rootManager._determineRoot('nonExistentSource', false, false);

      expect(result).toBeNull();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log debug message for valid source', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      rootManager._determineRoot('validSource');

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] determineContextRoot called with: validSource');

      consoleSpy.mockRestore();
    });
  });

  describe('_setRootProperty', () => {
    let rootManager;

    beforeEach(() => {
      rootManager = new RootManager({ rootMap: mockRootMap });
    });

    it('should set root property on valid target object', () => {
      const target = {};
      const root = { test: 'value' };

      rootManager._setRootProperty(target, root, 'testSource');

      expect(target.root).toBe(root);
    });

    it('should update instance root when target is the instance itself', () => {
      const root = { test: 'value' };

      rootManager._setRootProperty(rootManager, root, 'testSource');

      expect(rootManager.root).toBe(root);
    });

    it('should log warning for invalid target', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      rootManager._setRootProperty(null, {}, 'testSource');

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] _manageRootInternal: Cannot set root property on invalid target for source \'testSource\'.');

      consoleSpy.mockRestore();
    });

    it('should log warning for non-object target', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      rootManager._setRootProperty('string', {}, 'testSource');

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] _manageRootInternal: Cannot set root property on invalid target for source \'testSource\'.');

      consoleSpy.mockRestore();
    });
  });

  describe('_manageRootInternal', () => {
    let rootManager;

    beforeEach(() => {
      rootManager = new RootManager({ rootMap: mockRootMap });
    });

    it('should return null when validation fails', () => {
      RootManagerValidator.validateManageRootArgs.mockReturnValue(false);

      const result = rootManager._manageRootInternal({ source: 'validSource' });

      expect(result).toBeNull();
    });

    it('should return null when _determineRoot returns null', () => {
      jest.spyOn(rootManager, '_determineRoot').mockReturnValue(null);

      const result = rootManager._manageRootInternal({ source: 'validSource' });

      expect(result).toBeNull();
    });

    it('should set property and return undefined by default', () => {
      jest.spyOn(rootManager, '_determineRoot').mockReturnValue(mockRootMapEntry);
      jest.spyOn(rootManager, '_setRootProperty');

      const result = rootManager._manageRootInternal({ source: 'validSource' });

      expect(rootManager._setRootProperty).toHaveBeenCalledWith(rootManager, mockRootMapEntry, 'validSource');
      expect(result).toBeUndefined();
    });

    it('should return root value when returnValue is true', () => {
      jest.spyOn(rootManager, '_determineRoot').mockReturnValue(mockRootMapEntry);

      const result = rootManager._manageRootInternal({
        source: 'validSource',
        returnValue: true
      });

      expect(result).toBe(mockRootMapEntry);
    });

    it('should not set property when setProperty is false', () => {
      jest.spyOn(rootManager, '_determineRoot').mockReturnValue(mockRootMapEntry);
      jest.spyOn(rootManager, '_setRootProperty');

      rootManager._manageRootInternal({
        source: 'validSource',
        setProperty: false
      });

      expect(rootManager._setRootProperty).not.toHaveBeenCalled();
    });

    it('should handle errors and return null', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(rootManager, '_determineRoot').mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = rootManager._manageRootInternal({ source: 'validSource' });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error during manage root: Test error');

      consoleSpy.mockRestore();
    });

    it('should not log errors when logError is false', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(rootManager, '_determineRoot').mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = rootManager._manageRootInternal({
        source: 'validSource',
        logError: false
      });

      expect(result).toBeNull();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setRoot', () => {
    let rootManager;

    beforeEach(() => {
      rootManager = new RootManager({ rootMap: mockRootMap });
    });

    it('should call _manageRootInternal with correct parameters for set operation', () => {
      jest.spyOn(rootManager, '_manageRootInternal').mockReturnValue(undefined);

      const params = {
        source: 'validSource',
        target: rootManager,
        returnValue: false,
        setProperty: true,
        throwError: true,
        logError: true
      };

      rootManager.setRoot(params);

      expect(rootManager._manageRootInternal).toHaveBeenCalledWith({
        ...params,
        operationName: 'set'
      });
    });

    it('should use default parameters when not provided', () => {
      jest.spyOn(rootManager, '_manageRootInternal').mockReturnValue(undefined);

      rootManager.setRoot({ source: 'validSource' });

      expect(rootManager._manageRootInternal).toHaveBeenCalledWith({
        source: 'validSource',
        target: rootManager,
        returnValue: false,
        setProperty: true,
        operationName: 'set',
        throwError: true,
        logError: true
      });
    });
  });

  describe('getRoot', () => {
    let rootManager;

    beforeEach(() => {
      rootManager = new RootManager({ rootMap: mockRootMap });
    });

    it('should call _manageRootInternal with correct parameters for get operation', () => {
      jest.spyOn(rootManager, '_manageRootInternal').mockReturnValue(mockRootMapEntry);

      const params = {
        source: 'validSource',
        target: rootManager,
        returnValue: true,
        setProperty: false,
        throwError: true,
        logError: true
      };

      rootManager.getRoot(params);

      expect(rootManager._manageRootInternal).toHaveBeenCalledWith({
        ...params,
        operationName: 'get'
      });
    });

    it('should use default parameters when not provided', () => {
      jest.spyOn(rootManager, '_manageRootInternal').mockReturnValue(mockRootMapEntry);

      rootManager.getRoot({ source: 'validSource' });

      expect(rootManager._manageRootInternal).toHaveBeenCalledWith({
        source: 'validSource',
        target: rootManager,
        returnValue: true,
        setProperty: false,
        operationName: 'get',
        throwError: true,
        logError: true
      });
    });

    it('should return the root value', () => {
      jest.spyOn(rootManager, '_manageRootInternal').mockReturnValue(mockRootMapEntry);

      const result = rootManager.getRoot({ source: 'validSource' });

      expect(result).toBe(mockRootMapEntry);
    });
  });
});