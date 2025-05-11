import CheckOutput from './checkOutput';

describe('CheckOutput', () => {
  // Helper functions for checks
  const passingCheck = jest.fn(() => true);
  const failingCheck = jest.fn(() => { throw new Error('fail'); });

  describe('constructor and initialization', () => {
    it('should initialize with a single check function', () => {
      const co = new CheckOutput({ checks: passingCheck });
      expect(co.checks).toEqual([passingCheck]);
      expect(co.successful).toEqual([]);
      expect(co.failed).toEqual([]);
      expect(co.errors).toEqual([]);
      expect(co.args).toEqual([]);
      expect(co.values).toEqual([]);
      expect(co.containers).toEqual([]);
      expect(co.allowedTypes).toEqual([]);
      expect(co.results).toEqual([]);
      expect(co.outcome).toBeUndefined();
      expect(co.initializationErrors).toEqual([]);
    });

    it('should initialize with an array of check functions', () => {
      const checks = [passingCheck, failingCheck];
      const co = new CheckOutput({ checks });
      expect(co.checks).toEqual(checks);
      expect(co.initializationErrors).toEqual([]);
    });

    it('should record InitializationError for invalid checks', () => {
      expect(() => new CheckOutput({ checks: 123, ifInitializationErrors: 'throw' })).toThrow();
      const co = new CheckOutput({ checks: 123, ifInitializationErrors: 'return' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
    });

    it('should record InitializationError for empty checks array', () => {
      expect(() => new CheckOutput({ checks: [], ifInitializationErrors: 'throw' })).toThrow();
      const co = new CheckOutput({ checks: [], ifInitializationErrors: 'return' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
    });

    it('should wrap single object/primitive values for args, values, containers, allowedTypes', () => {
      const co = new CheckOutput({
        checks: passingCheck,
        args: { foo: 1 },
        values: 42,
        containers: { bar: 2 },
        allowedTypes: 'number'
      });
      expect(co.args).toEqual([{ foo: 1 }]);
      expect(co.values).toEqual([42]);
      expect(co.containers).toEqual([{ bar: 2 }]);
      expect(co.allowedTypes).toEqual(['number']);
    });

    it('should throw an InitializationError for invalid types in args, values, containers, allowedTypes', () => {
      const co = () => new CheckOutput({
        checks: passingCheck,
        args: 123,
        values: Symbol('bad'),
        containers: 123,
        allowedTypes: 123
      });
      expect(() => co()).toThrow(/InitializationError/);
    });

        it('should record InitializationError for invalid types in args, values, containers, allowedTypes if behaviour set to "return"', () => {
      const co = new CheckOutput({
        checks: passingCheck,
        args: 123,
        values: Symbol('bad'),
        containers: 123,
        allowedTypes: 123
      });
      expect(co.args).toEqual([]);
      expect(co.values).toEqual([]);
      expect(co.containers).toEqual([]);
      expect(co.allowedTypes).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
    });

    it('should record InitializationError for non-array successful, failed, errors, results', () => {
      const co = new CheckOutput({
        checks: passingCheck,
        successful: 1,
        failed: 2,
        errors: 3,
        results: 4
      });
      expect(co.successful).toEqual([]);
      expect(co.failed).toEqual([]);
      expect(co.errors).toEqual([]);
      expect(co.results).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
    });

    it('should warn on console and record InitializationError if ifInitializationErrors is "warn"', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const co = new CheckOutput({ checks: 123, ifInitializationErrors: 'warn' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should log on console and record InitializationError if ifInitializationErrors is "log"', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const co = new CheckOutput({ checks: 123, ifInitializationErrors: 'log' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should be silent and record InitializationError if ifInitializationErrors is "silent"', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const co = new CheckOutput({ checks: 123, ifInitializationErrors: 'silent' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should log to console.error and record InitializationError for an invalid ifInitializationErrors option', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const co = new CheckOutput({ checks: 123, ifInitializationErrors: 'invalidOption' });
      expect(co.checks).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('addChecks', () => {
    it('should add a single check', () => {
      const co = new CheckOutput({ checks: passingCheck });
      const newCheck = jest.fn();
      co.addChecks(newCheck);
      expect(co.checks).toContain(newCheck);
    });

    it('should add multiple checks', () => {
      const co = new CheckOutput({ checks: passingCheck });
      const checks = [jest.fn(), jest.fn()];
      co.addChecks(checks);
      expect(co.checks).toEqual([passingCheck, ...checks]);
    });

    it('should throw if non-function is added', () => {
      const co = new CheckOutput({ checks: passingCheck });
      expect(() => co.addChecks(123)).toThrow(/Check must be a function/);
    });
  });

  describe('runChecks', () => {
    it('should run all checks and update successful/failed/errors/outcome', () => {
      const co = new CheckOutput({ checks: [passingCheck, failingCheck] });
      const result = co.runChecks();
      expect(passingCheck).toHaveBeenCalled();
      expect(failingCheck).toHaveBeenCalled();
      expect(co.successful).toContain(passingCheck);
      expect(co.failed).toContain(failingCheck);
      expect(co.errors.length).toBe(1);
      expect(co.outcome).toBe(false);
      expect(result).toBe(false);
    });

    it('should set outcome true if all checks pass', () => {
      const check1 = jest.fn();
      const check2 = jest.fn();
      const co = new CheckOutput({ checks: [check1, check2] });
      const result = co.runChecks();
      expect(co.successful).toEqual([check1, check2]);
      expect(co.failed).toEqual([]);
      expect(co.errors).toEqual([]);
      expect(co.outcome).toBe(true);
      expect(result).toBe(true);
    });

    it('should set outcome undefined and return false if no checks', () => {
      const co = new CheckOutput({ checks: passingCheck });
      co.checks = [];
      const result = co.runChecks();
      expect(co.outcome).toBeUndefined();
      expect(result).toBe(false);
    });
  });

  describe('addSuccessful, addFailed, addValue, addResult, addArg, addError', () => {
    let co;
    beforeEach(() => {
      co = new CheckOutput({ checks: passingCheck });
    });

    it('addSuccessful should add to successful', () => {
      co.addSuccessful('foo');
      expect(co.successful).toContain('foo');
    });

    it('addFailed should add to failed', () => {
      co.addFailed('bar');
      expect(co.failed).toContain('bar');
    });

    it('addValue should add single and array values', () => {
      co.addValue(1);
      expect(co.values).toContain(1);
      co.addValue([2, 3]);
      expect(co.values).toEqual([1, 2, 3]);
    });

    it('addResult should add single and array results', () => {
      co.addResult('a');
      expect(co.results).toContain('a');
      co.addResult(['b', 'c']);
      expect(co.results).toEqual(['a', 'b', 'c']);
    });

    it('addArg should add single and array args', () => {
      co.addArg('x');
      expect(co.args).toContain('x');
      co.addArg(['y', 'z']);
      expect(co.args).toEqual(['x', 'y', 'z']);
    });

    it('addError should add single and array errors', () => {
      const err1 = new Error('err1');
      const err2 = new Error('err2');
      co.addError(err1);
      expect(co.errors).toContain(err1);
      co.addError([err2]);
      expect(co.errors).toContain(err2);
    });
  });

  describe('setOutcome, success, failure', () => {
    let co;
    beforeEach(() => {
      co = new CheckOutput({ checks: passingCheck });
    });

    it('setOutcome sets outcome', () => {
      co.setOutcome('foo');
      expect(co.outcome).toBe('foo');
    });

    it('success sets outcome to true', () => {
      co.success();
      expect(co.outcome).toBe(true);
    });

    it('failure sets outcome to false', () => {
      co.failure();
      expect(co.outcome).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all properties', () => {
      const co = new CheckOutput({ checks: passingCheck });
      co.successful = [1];
      co.failed = [2];
      co.errors = [3];
      co.args = [4];
      co.values = [5];
      co.containers = [6];
      co.allowedTypes = [7];
      co.results = [8];
      co.outcome = true;
      co.reset([failingCheck], [], [], [], [], [], [], [], []);
      expect(co.checks).toEqual([failingCheck]);
      expect(co.successful).toEqual([]);
      expect(co.failed).toEqual([]);
      expect(co.errors).toEqual([]);
      expect(co.args).toEqual([]);
      expect(co.values).toEqual([]);
      expect(co.containers).toEqual([]);
      expect(co.allowedTypes).toEqual([]);
      expect(co.results).toEqual([]);
      expect(co.outcome).toBeUndefined();
    });

    it('should record InitializationError on bad reset', () => {
      const co = new CheckOutput({ checks: passingCheck });
      const mockValue = 'mockValue'; // InitialiseValue does not check for type
      co.reset(123, 1, 2, 3, 4, mockValue, 6, 7, 8);
      expect(co.checks).toEqual([]);
      expect(co.successful).toEqual([]);
      expect(co.failed).toEqual([]);
      expect(co.errors).toEqual([]);
      expect(co.args).toEqual([]);
      expect(co.values).toEqual([mockValue]);
      expect(co.containers).toEqual([]);
      expect(co.allowedTypes).toEqual([]);
      expect(co.results).toEqual([]);
      expect(co.initializationErrors.length).toBeGreaterThan(0);
    });
  });
});