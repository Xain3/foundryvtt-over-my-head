import Unpacker from './unpacker.mjs';

/**
 * @file unpacker.test.js
 * @description This file contains unit tests for the Unpacker class.
 * @path src/utils/static/unpacker.test.js
 */


describe('Unpacker', () => {
  let unpacker;
  let instance;

  beforeEach(() => {
    unpacker = new Unpacker();
    instance = {};
  });

  describe('Input Validation', () => {
    it('should throw if object is null', () => {
      expect(() => unpacker.unpack(null, instance)).toThrow();
    });

    it('should throw if instance is null', () => {
      expect(() => unpacker.unpack({ a: 1 }, null)).toThrow();
    });

    it('should not throw if object is empty', () => {
      expect(() => unpacker.unpack({}, instance)).not.toThrow();
    });

    it('should not throw if objectName is omitted', () => {
      expect(() => unpacker.unpack({ a: 1 }, instance)).not.toThrow();
    });
  });

  describe('Successful Cases', () => {
    it('should unpack properties onto the instance', () => {
      const obj = { title: 'Test', version: '1.0.0', active: true };
      unpacker.unpack(obj, instance);
      expect(instance.title).toBe('Test');
      expect(instance.version).toBe('1.0.0');
      expect(instance.active).toBe(true);
    });

    it('should overwrite existing properties on the instance', () => {
      instance.title = 'Old';
      unpacker.unpack({ title: 'New' }, instance);
      expect(instance.title).toBe('New');
    });

    it('should handle non-string keys', () => {
      const sym = Symbol('sym');
      const obj = { [sym]: 42 };
      unpacker.unpack(obj, instance);
      expect(instance[sym]).toBe(42);
    });

    it('should handle objectName argument', () => {
      const obj = { foo: 'bar' };
      expect(() => unpacker.unpack(obj, instance, 'customObject')).not.toThrow();
      expect(instance.foo).toBe('bar');
    });
  });

  describe('Edge Cases', () => {
    it('should not copy inherited properties', () => {
      function Parent() {}
      Parent.prototype.inherited = 'inherited';
      const obj = Object.create(new Parent());
      obj.own = 'own';
      unpacker.unpack(obj, instance);
      expect(instance.own).toBe('own');
      expect(instance.inherited).toBeUndefined();
    });

    it('should handle empty object', () => {
      unpacker.unpack({}, instance);
      expect(Object.keys(instance)).toHaveLength(0);
    });

    it('should handle object with undefined values', () => {
      unpacker.unpack({ foo: undefined }, instance);
      expect(instance.foo).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    it('should throw and log error if instance is frozen', () => {
      const frozen = Object.freeze({});
      const obj = { foo: 'bar' };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => unpacker.unpack(obj, frozen, 'frozenObject')).toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error unpacking frozenObject'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should throw and log error if object is not iterable', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => unpacker.unpack(42, instance, 'notIterable')).toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error unpacking notIterable'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should unpack module-like object onto a class instance', () => {
      class Module {}
      const mod = new Module();
      const data = { id: 'mod1', title: 'Module 1', enabled: true };
      unpacker.unpack(data, mod, 'module');
      expect(mod.id).toBe('mod1');
      expect(mod.title).toBe('Module 1');
      expect(mod.enabled).toBe(true);
    });

    it('should unpack deeply nested objects as references', () => {
      const nested = { config: { a: 1 } };
      unpacker.unpack(nested, instance);
      expect(instance.config).toBe(nested.config);
    });
  });
});