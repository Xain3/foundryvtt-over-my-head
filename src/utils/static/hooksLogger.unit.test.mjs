/**
 * @file hooksLogger.unit.test.js
 * @description Unit tests for the HooksLogger class that provides hook logging and debugging utilities.
 * @path src/utils/static/hooksLogger.unit.test.js
 */

import HooksLogger from './hooksLogger.mjs';

describe('HooksLogger', () => {
  let originalConsole;
  let mockConsole;

  beforeEach(() => {
    // Mock console methods
    originalConsole = { ...console };
    mockConsole = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    // Restore original console
    Object.assign(console, originalConsole);
    jest.clearAllMocks();
  });

  describe('createHookProxy', () => {
    it('should create a proxy that logs hook calls and modifies object in-place', () => {
      const mockObject = {
        mockHookFunction: jest.fn((hookName, ...args) => `result-${hookName}`)
      };
      
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      const result = mockObject.mockHookFunction('testHook', 'arg1', 'arg2');

      expect(result).toBe('result-testHook');
      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered: testHook',
        ['arg1', 'arg2']
      );
    });

    it('should return proxy when returnProxy is true', () => {
      const mockObject = {
        mockHookFunction: jest.fn((hookName, ...args) => `result-${hookName}`)
      };
      const originalFunction = mockObject.mockHookFunction;
      
      const proxy = HooksLogger.createHookProxy(mockObject, 'mockHookFunction', { returnProxy: true });

      // Original function should be unchanged
      expect(mockObject.mockHookFunction).toBe(originalFunction);
      
      // But proxy should work
      const result = proxy('testHook', 'arg1', 'arg2');
      expect(result).toBe('result-testHook');
      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered: testHook',
        ['arg1', 'arg2']
      );
    });

    it('should use specified log level', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        logLevel: 'debug'
      });

      mockObject.mockHookFunction('testHook', 'arg1');

      expect(mockConsole.debug).toHaveBeenCalledWith(
        'Hook triggered: testHook',
        ['arg1']
      );
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should use custom prefix', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        prefix: 'Custom Hook'
      });

      mockObject.mockHookFunction('testHook');

      expect(mockConsole.log).toHaveBeenCalledWith('Custom Hook: testHook');
    });

    it('should hide arguments when logArgs is false', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        logArgs: false
      });

      mockObject.mockHookFunction('testHook', 'arg1', 'arg2');

      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: testHook (args hidden)');
    });

    it('should log results when logResult is true', () => {
      const mockObject = { mockHookFunction: jest.fn(() => 'test-result') };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        logResult: true
      });

      mockObject.mockHookFunction('testHook');

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered result for testHook:',
        'test-result'
      );
    });

    it('should apply filter when provided', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      const filterFn = jest.fn((hookName) => hookName.startsWith('OMH.'));
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        filter: filterFn
      });

      // This should be logged
      mockObject.mockHookFunction('OMH.ready', 'arg1');
      expect(filterFn).toHaveBeenCalledWith('OMH.ready');
      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered: OMH.ready',
        ['arg1']
      );

      // Reset mocks
      jest.clearAllMocks();

      // This should not be logged
      mockObject.mockHookFunction('someOtherHook', 'arg2');
      expect(filterFn).toHaveBeenCalledWith('someOtherHook');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should handle hooks with no arguments', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      mockObject.mockHookFunction('testHook');

      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: testHook');
    });

    it('should preserve this context', () => {
      const mockThis = { value: 'test' };
      const mockObject = {
        mockHookFunction: jest.fn(function() {
          return this.value;
        })
      };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      const result = mockObject.mockHookFunction.call(mockThis, 'testHook');

      expect(result).toBe('test');
    });

    it('should throw TypeError for null hookObject', () => {
      expect(() => {
        HooksLogger.createHookProxy(null, 'someFunction');
      }).toThrow(TypeError);
      expect(() => {
        HooksLogger.createHookProxy(null, 'someFunction');
      }).toThrow("HooksLogger.createHookProxy: hookObject must have a function property 'someFunction'");
    });

    it('should throw TypeError for non-function property', () => {
      const mockObject = { notAFunction: 'string' };
      expect(() => {
        HooksLogger.createHookProxy(mockObject, 'notAFunction');
      }).toThrow(TypeError);
      expect(() => {
        HooksLogger.createHookProxy(mockObject, 'notAFunction');
      }).toThrow("HooksLogger.createHookProxy: hookObject must have a function property 'notAFunction'");
    });

    it('should handle complex return values', () => {
      const complexResult = { data: [1, 2, 3], status: 'success' };
      const mockObject = { mockHookFunction: jest.fn(() => complexResult) };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      const result = mockObject.mockHookFunction('testHook');

      expect(result).toEqual(complexResult);
      expect(result).toBe(complexResult); // Same reference
    });

    it('should handle thrown exceptions', () => {
      const mockError = new Error('Test error');
      const mockObject = {
        mockHookFunction: jest.fn(() => {
          throw mockError;
        })
      };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      expect(() => {
        mockObject.mockHookFunction('testHook');
      }).toThrow(mockError);

      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: testHook');
    });
  });

  describe('createHookLogger', () => {
    it('should create a logger function that logs hook calls', () => {
      const logger = HooksLogger.createHookLogger();

      logger('testHook', 'arg1', 'arg2');

      expect(mockConsole.debug).toHaveBeenCalledWith(
        'Hook Call: testHook',
        ['arg1', 'arg2']
      );
    });

    it('should use custom log level and prefix', () => {
      const logger = HooksLogger.createHookLogger('warn', 'Custom Logger');

      logger('testHook', 'arg1');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Custom Logger: testHook',
        ['arg1']
      );
    });

    it('should apply filter when provided', () => {
      const filterFn = jest.fn((hookName) => hookName.includes('test'));
      const logger = HooksLogger.createHookLogger('debug', 'Filtered', filterFn);

      // This should be logged
      logger('testHook');
      expect(filterFn).toHaveBeenCalledWith('testHook');
      expect(mockConsole.debug).toHaveBeenCalledWith('Filtered: testHook');

      // Reset mocks
      jest.clearAllMocks();

      // This should not be logged
      logger('otherHook');
      expect(filterFn).toHaveBeenCalledWith('otherHook');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should handle hooks with no arguments', () => {
      const logger = HooksLogger.createHookLogger();

      logger('testHook');

      expect(mockConsole.debug).toHaveBeenCalledWith('Hook Call: testHook');
    });

    it('should fallback to console.log for invalid log levels', () => {
      const logger = HooksLogger.createHookLogger('invalidLevel');

      logger('testHook', 'arg1');

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook Call: testHook',
        ['arg1']
      );
    });
  });

  describe('proxyFoundryHooks', () => {
    let mockHooks;

    beforeEach(() => {
      // Mock global Hooks object with duck typing
      mockHooks = {
        call: jest.fn((hookName, ...args) => `foundry-result-${hookName}`),
        callAll: jest.fn((hookName, ...args) => `foundry-all-${hookName}`),
        on: jest.fn(),
        once: jest.fn()
      };
      global.Hooks = mockHooks;
    });

    afterEach(() => {
      delete global.Hooks;
    });

    it('should proxy Foundry Hooks functions in-place and return true', () => {
      const result = HooksLogger.proxyFoundryHooks();

      expect(result).toBe(true);

      // Test that Hooks.call has been proxied
      const callResult = Hooks.call('testHook', 'arg1');
      expect(callResult).toBe('foundry-result-testHook');
      expect(mockConsole.debug).toHaveBeenCalledWith('Foundry Hook: testHook', ['arg1']);

      // Test that Hooks.callAll has been proxied
      const callAllResult = Hooks.callAll('allHook', 'x');
      expect(callAllResult).toBe('foundry-all-allHook');
      expect(mockConsole.debug).toHaveBeenCalledWith('Foundry Hook: allHook', ['x']);
    });

    it('should apply module filter when provided', () => {
      HooksLogger.proxyFoundryHooks({ moduleFilter: 'OMH.' });

      // This should be logged
      Hooks.call('OMH.ready');
      expect(mockConsole.debug).toHaveBeenCalledWith('Foundry Hook: OMH.ready');

      // Reset mocks
      jest.clearAllMocks();

      // This should not be logged
      Hooks.call('someOtherHook');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should use custom log level', () => {
      HooksLogger.proxyFoundryHooks({ logLevel: 'info' });
      Hooks.call('testHook');
      expect(mockConsole.info).toHaveBeenCalledWith('Foundry Hook: testHook');
    });

    it('should return false when disabled', () => {
      const result = HooksLogger.proxyFoundryHooks({ enabled: false });

      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalledWith('HooksLogger: Hook logging is disabled.');
    });

    it('should return false when Hooks is undefined', () => {
      delete global.Hooks;

      const result = HooksLogger.proxyFoundryHooks();

      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalledWith('HooksLogger: Hooks object is not available.');
    });

    it('should return false when Hooks is missing required methods', () => {
      global.Hooks = { call: jest.fn() }; // Missing 'on', 'once'
      
      const result = HooksLogger.proxyFoundryHooks();
      
      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalledWith('HooksLogger: Hooks object is missing required methods (on, once, call).');
    });

    it('should return false when no functions are specified', () => {
      const result = HooksLogger.proxyFoundryHooks({ functions: {} });

      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalledWith('HooksLogger: No functions specified for proxying.');
    });

    it('should proxy only specified functions', () => {
      const result = HooksLogger.proxyFoundryHooks({ 
        functions: { call: true, callAll: false } 
      });

      expect(result).toBe(true);

      // call should be proxied
      Hooks.call('testHook');
      expect(mockConsole.debug).toHaveBeenCalledWith('Foundry Hook: testHook');

      // callAll should not be proxied (but should still work)
      jest.clearAllMocks();
      const originalCallAll = mockHooks.callAll;
      Hooks.callAll('allHook');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should handle proxy creation errors gracefully', () => {
      // Mock createHookProxy to throw
      const originalCreateHookProxy = HooksLogger.createHookProxy;
      HooksLogger.createHookProxy = jest.fn().mockImplementation(() => {
        throw new Error('Proxy creation failed');
      });

      const result = HooksLogger.proxyFoundryHooks();

      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalledWith(
        'HooksLogger: Failed to proxy Hooks.call:',
        expect.any(Error)
      );

      // Restore original method
      HooksLogger.createHookProxy = originalCreateHookProxy;
    });
  });

  describe('getUtilityInfo', () => {
    it('should return utility information', () => {
      const info = HooksLogger.getUtilityInfo();

      expect(info).toEqual({
        name: 'HooksLogger',
        version: '1.0.0',
        description: 'Hook logging and debugging utilities for Foundry VTT',
        methods: ['createHookProxy', 'createHookLogger', 'proxyFoundryHooks', 'isHooksAvailable', 'getUtilityInfo']
      });
    });

    it('should return consistent information', () => {
      const info1 = HooksLogger.getUtilityInfo();
      const info2 = HooksLogger.getUtilityInfo();

      expect(info1).toEqual(info2);
    });
  });

  describe('isHooksAvailable', () => {
    it('should return true when Hooks has required methods', () => {
      global.Hooks = {
        on: jest.fn(),
        once: jest.fn(),
        call: jest.fn()
      };

      expect(HooksLogger.isHooksAvailable()).toBe(true);
      
      delete global.Hooks;
    });

    it('should return false when Hooks is undefined', () => {
      delete global.Hooks;
      expect(HooksLogger.isHooksAvailable()).toBe(false);
    });

    it('should return false when Hooks is null', () => {
      global.Hooks = null;
      expect(HooksLogger.isHooksAvailable()).toBe(false);
      delete global.Hooks;
    });

    it('should return false when Hooks is missing required methods', () => {
      global.Hooks = { call: jest.fn() }; // Missing 'on', 'once'
      expect(HooksLogger.isHooksAvailable()).toBe(false);
      delete global.Hooks;
    });
  });

  describe('Integration scenarios', () => {
    it('should work with complex hook scenarios', () => {
      const mockObject = {
        mockHooksCall: jest.fn((hookName, data) => {
          if (hookName === 'ready') return true;
          if (hookName === 'error') throw new Error('Hook error');
          return `processed-${data}`;
        })
      };

      HooksLogger.createHookProxy(mockObject, 'mockHooksCall', {
        logLevel: 'debug',
        logResult: true,
        filter: (hookName) => !hookName.startsWith('internal.')
      });

      // Normal hook
      const result1 = mockObject.mockHooksCall('processData', { value: 'test' });
      expect(result1).toBe('processed-[object Object]');
      expect(mockConsole.debug).toHaveBeenCalledWith(
        'Hook triggered: processData',
        [{ value: 'test' }]
      );

      // Filtered hook (should not be logged)
      jest.clearAllMocks();
      mockObject.mockHooksCall('internal.secret');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      // Hook that throws
      jest.clearAllMocks();
      expect(() => {
        mockObject.mockHooksCall('error');
      }).toThrow('Hook error');
      expect(mockConsole.debug).toHaveBeenCalledWith('Hook triggered: error');
    });

    it('should handle multiple proxied functions independently', () => {
      const obj1 = { func1: jest.fn(() => 'result1') };
      const obj2 = { func2: jest.fn(() => 'result2') };

      HooksLogger.createHookProxy(obj1, 'func1', { prefix: 'Proxy1' });
      HooksLogger.createHookProxy(obj2, 'func2', { prefix: 'Proxy2' });

      obj1.func1('hook1');
      obj2.func2('hook2');

      expect(mockConsole.log).toHaveBeenCalledWith('Proxy1: hook1');
      expect(mockConsole.log).toHaveBeenCalledWith('Proxy2: hook2');
      expect(obj1.func1).toHaveBeenCalledWith('hook1');
      expect(obj2.func2).toHaveBeenCalledWith('hook2');
    });

    it('should work with Foundry VTT integration scenario', () => {
      // Setup mock Hooks like Foundry VTT
      global.Hooks = {
        call: jest.fn((hookName, ...args) => true),
        callAll: jest.fn((hookName, ...args) => []),
        on: jest.fn(),
        once: jest.fn()
      };

      // Use the utility in a realistic way
      const success = HooksLogger.proxyFoundryHooks({
        moduleFilter: 'myModule.',
        logLevel: 'debug'
      });

      expect(success).toBe(true);

      // Test filtered logging
      Hooks.call('myModule.ready', { data: 'test' });
      expect(mockConsole.debug).toHaveBeenCalledWith('Foundry Hook: myModule.ready', [{ data: 'test' }]);

      // Test non-filtered (should not log)
      jest.clearAllMocks();
      Hooks.call('someOtherHook');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      delete global.Hooks;
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined return values', () => {
      const mockObject = { mockHookFunction: jest.fn() }; // Returns undefined
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        logResult: true
      });

      const result = mockObject.mockHookFunction('testHook');

      expect(result).toBeUndefined();
      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered result for testHook:',
        undefined
      );
    });

    it('should handle null arguments', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      mockObject.mockHookFunction('testHook', null, undefined, 0, false, '');

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Hook triggered: testHook',
        [null, undefined, 0, false, '']
      );
    });

    it('should handle non-string hook names', () => {
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction');

      mockObject.mockHookFunction(123, 'arg1');
      mockObject.mockHookFunction({ type: 'hook' }, 'arg2');

      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: 123', ['arg1']);
      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: [object Object]', ['arg2']);
    });

    it('should handle filter function that throws', () => {
      const badFilter = jest.fn(() => {
        throw new Error('Filter error');
      });
      const mockObject = { mockHookFunction: jest.fn() };
      HooksLogger.createHookProxy(mockObject, 'mockHookFunction', {
        filter: badFilter
      });

      // Should throw the filter error
      expect(() => {
        mockObject.mockHookFunction('testHook', 'arg1');
      }).toThrow('Filter error');
    });

    it('should handle objects with non-enumerable properties', () => {
      const mockObject = {};
      Object.defineProperty(mockObject, 'hiddenFunction', {
        value: jest.fn(),
        enumerable: false,
        writable: true
      });

      HooksLogger.createHookProxy(mockObject, 'hiddenFunction');
      mockObject.hiddenFunction('testHook');
      
      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: testHook');
    });

    it('should handle functions that modify their arguments', () => {
      const mockObject = {
        modifyingFunction: jest.fn((hookName, data) => {
          if (data && typeof data === 'object') {
            data.modified = true;
          }
          return data;
        })
      };
      
      HooksLogger.createHookProxy(mockObject, 'modifyingFunction');
      
      const testData = { original: true };
      const result = mockObject.modifyingFunction('testHook', testData);
      
      expect(result.modified).toBe(true);
      expect(testData.modified).toBe(true); // Original object should be modified
      expect(mockConsole.log).toHaveBeenCalledWith('Hook triggered: testHook', [testData]);
    });
  });
});
