import ErrorMessageBuilder from './errorMessageBuilder';

describe('ErrorMessageBuilder', () => {
  describe('buildErrorMessage', () => {
    it('should build message with valueName and errorMessageCore', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage('foo', 'is invalid', 123);
      expect(msg).toMatch(/^'foo' is invalid \(received type: number, value: 123\)$/);
    });

    it('should build message without valueName (capitalize errorMessageCore)', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage('', 'is required', 'bar');
      expect(msg).toMatch(/^Is required \(received type: string, value: bar\)$/);
    });

    it('should handle undefined actualValue', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage('foo', 'is missing', undefined);
      expect(msg).toMatch(/^'foo' is missing \(received: undefined\)$/);
    });

    it('should handle null actualValue', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage('foo', 'is missing', null);
      expect(msg).toMatch(/^'foo' is missing \(received: null\)$/);
    });

    it('should handle object with custom constructor', () => {
      class MyClass { toString() { return 'myclass'; } }
      const obj = new MyClass();
      const msg = ErrorMessageBuilder.buildErrorMessage('bar', 'is not valid', obj);
      expect(msg).toMatch(/\(received type: MyClass, value: myclass\)$/);
    });

    it('should handle plain object', () => {
      const obj = { a: 1, b: 2 };
      const msg = ErrorMessageBuilder.buildErrorMessage('obj', 'is not allowed', obj);
      expect(msg).toMatch(/\(received type: object, value: \[object Object\]\)$/);
    });

    it('should truncate long string values', () => {
      const longStr = 'a'.repeat(40);
      const msg = ErrorMessageBuilder.buildErrorMessage('foo', 'is too long', longStr);
      expect(msg).toContain('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...');
      expect(msg).toMatch(/\(received type: string, value: a{30}\.\.\.\)$/);
    });

    it('should handle boolean values', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage('flag', 'must be true', false);
      expect(msg).toMatch(/\(received type: boolean, value: false\)$/);
    });

    it('should handle symbol values', () => {
      const sym = Symbol('test');
      const msg = ErrorMessageBuilder.buildErrorMessage('sym', 'is not allowed', sym);
      expect(msg).toMatch(/\(received type: symbol, value: Symbol\(test\)\)$/);
    });

    it('should handle function values', () => {
      function fn() {}
      const msg = ErrorMessageBuilder.buildErrorMessage('fn', 'is not allowed', fn);
      expect(msg).toMatch(/\(received type: function, value: function fn\(\)\s*\{\s*\}\)$/);
    });
  });

  describe('private helpers (indirectly via buildErrorMessage)', () => {
    it('should capitalize errorMessageCore if valueName is falsy', () => {
      const msg = ErrorMessageBuilder.buildErrorMessage(null, 'should not be empty', 0);
      expect(msg.startsWith('Should not be empty')).toBe(true);
    });

    it('should use constructor name for objects with custom constructor', () => {
      function Custom() {}
      const obj = new Custom();
      const msg = ErrorMessageBuilder.buildErrorMessage('val', 'is wrong', obj);
      expect(msg).toContain('received type: Custom');
    });
  });
});