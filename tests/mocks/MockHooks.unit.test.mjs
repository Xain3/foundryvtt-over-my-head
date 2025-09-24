/**
 * @file MockHooks.unit.test.js
 * @description Unit tests for MockHooks class
 * @path tests/mocks/MockHooks.unit.test.js
 */

import MockHooks from './MockHooks.mjs';

describe('MockHooks', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    MockHooks._instance = undefined;
  });

  afterEach(() => {
    // Clean up after tests
    MockHooks._instance = undefined;
  });

  describe('static on', () => {
    it('should create instance and register callback', () => {
      const callback = jest.fn();
      MockHooks.on('testEvent', callback);

      expect(MockHooks._instance).toBeDefined();
      expect(MockHooks._instance.events.has('testEvent')).toBe(true);
      expect(MockHooks._instance.events.get('testEvent')).toContain(callback);
    });

    it('should register multiple callbacks for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      MockHooks.on('testEvent', callback1);
      MockHooks.on('testEvent', callback2);

      const callbacks = MockHooks._instance.events.get('testEvent');
      expect(callbacks).toHaveLength(2);
      expect(callbacks).toContain(callback1);
      expect(callbacks).toContain(callback2);
    });

    it('should register callbacks for different events', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      MockHooks.on('event1', callback1);
      MockHooks.on('event2', callback2);

      expect(MockHooks._instance.events.get('event1')).toContain(callback1);
      expect(MockHooks._instance.events.get('event2')).toContain(callback2);
    });
  });

  describe('static off', () => {
    it('should remove callback from event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      MockHooks.on('testEvent', callback1);
      MockHooks.on('testEvent', callback2);
      MockHooks.off('testEvent', callback1);

      const callbacks = MockHooks._instance.events.get('testEvent');
      expect(callbacks).toHaveLength(1);
      expect(callbacks).toContain(callback2);
      expect(callbacks).not.toContain(callback1);
    });

    it('should handle removing non-existent callback', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      MockHooks.on('testEvent', callback1);
      MockHooks.off('testEvent', callback2);

      const callbacks = MockHooks._instance.events.get('testEvent');
      expect(callbacks).toHaveLength(1);
      expect(callbacks).toContain(callback1);
    });

    it('should handle removing from non-existent event', () => {
      const callback = jest.fn();
      MockHooks.off('nonExistentEvent', callback);
      // Should not throw error
    });

    it('should handle no instance', () => {
      const callback = jest.fn();
      expect(() => MockHooks.off('testEvent', callback)).not.toThrow();
    });
  });

  describe('static call', () => {
    it('should call all registered callbacks', () => {
      const callback1 = jest.fn(() => true);
      const callback2 = jest.fn(() => true);
      
      MockHooks.on('testEvent', callback1);
      MockHooks.on('testEvent', callback2);
      
      const result = MockHooks.call('testEvent', 'arg1', 'arg2');

      expect(callback1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(callback2).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe(true);
    });

    it('should return false if any callback returns false', () => {
      const callback1 = jest.fn(() => true);
      const callback2 = jest.fn(() => false);
      const callback3 = jest.fn(() => true);
      
      MockHooks.on('testEvent', callback1);
      MockHooks.on('testEvent', callback2);
      MockHooks.on('testEvent', callback3);
      
      const result = MockHooks.call('testEvent');

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle callback errors', () => {
      const errorCallback = jest.fn(() => { throw new Error('Test error'); });
      const normalCallback = jest.fn(() => true);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      MockHooks.on('testEvent', errorCallback);
      MockHooks.on('testEvent', normalCallback);
      
      const result = MockHooks.call('testEvent');

      expect(consoleSpy).toHaveBeenCalledWith('Hook error in testEvent:', expect.any(Error));
      expect(normalCallback).toHaveBeenCalled();
      expect(result).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should return true for non-existent event', () => {
      const result = MockHooks.call('nonExistentEvent');
      expect(result).toBe(true);
    });

    it('should return true with no instance', () => {
      const result = MockHooks.call('testEvent');
      expect(result).toBe(true);
    });
  });

  describe('static callAll', () => {
    it('should alias to call method', () => {
      const callback = jest.fn(() => true);
      MockHooks.on('testEvent', callback);
      
      const result = MockHooks.callAll('testEvent', 'arg1');

      expect(callback).toHaveBeenCalledWith('arg1');
      expect(result).toBe(true);
    });
  });

  describe('instance behavior', () => {
    it('should maintain singleton pattern', () => {
      MockHooks.on('event1', jest.fn());
      const instance1 = MockHooks._instance;
      
      MockHooks.on('event2', jest.fn());
      const instance2 = MockHooks._instance;

      expect(instance1).toBe(instance2);
    });

    it('should preserve events across method calls', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      MockHooks.on('event1', callback1);
      MockHooks.on('event2', callback2);
      MockHooks.call('event1');

      expect(MockHooks._instance.events.get('event1')).toContain(callback1);
      expect(MockHooks._instance.events.get('event2')).toContain(callback2);
    });
  });
});
