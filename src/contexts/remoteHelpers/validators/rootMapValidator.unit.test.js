import RootMapValidator from './rootMapValidator';

describe('RootMapValidator', () => {
  let globalNamespace;
  let manager;
  let moduleObj;
  let rootMapResult;

  beforeEach(() => {
    globalNamespace = { foo: 'bar' };
    moduleObj = { name: 'testModule' };
    rootMapResult = { a: 1 };
    manager = {
      module: moduleObj,
      remoteContextDefaults: {
        ROOT_MAP: jest.fn(() => rootMapResult)
      }
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true for valid arguments', () => {
    expect(RootMapValidator.validateArgs(globalNamespace, manager)).toBe(true);
    expect(manager.remoteContextDefaults.ROOT_MAP).toHaveBeenCalledWith(globalNamespace, moduleObj);
  });

  it('throws if globalNamespace is missing', () => {
    expect(() => RootMapValidator.validateArgs(undefined, manager)).toThrow(
      /Global namespace must be provided/
    );
  });

  it('logs error and returns false if globalNamespace is missing and throwError=false', () => {
    expect(RootMapValidator.validateArgs(undefined, manager, false, true)).toBe(false);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Global namespace must be provided'));
  });

  it('throws if globalNamespace is not an object', () => {
    expect(() => RootMapValidator.validateArgs('notAnObject', manager)).toThrow(
      /Global namespace must be an object/
    );
  });

  it('throws if manager is missing', () => {
    expect(() => RootMapValidator.validateArgs(globalNamespace, undefined)).toThrow(
      /Manager must be provided/
    );
  });

  it('throws if manager is not an object', () => {
    expect(() => RootMapValidator.validateArgs(globalNamespace, 'notAnObject')).toThrow(
      /Manager must be an object/
    );
  });

  it('throws if manager.module is missing', () => {
    delete manager.module;
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /Module must be defined in parent manager/
    );
  });

  it('throws if manager.module is not an object', () => {
    manager.module = 'notAnObject';
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /Module must be an object/
    );
  });

  it('throws if manager.remoteContextDefaults is missing', () => {
    delete manager.remoteContextDefaults;
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /remoteContextDefaults must be defined in parent manager/
    );
  });

  it('throws if manager.remoteContextDefaults is not an object', () => {
    manager.remoteContextDefaults = 'notAnObject';
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /remoteContextDefaults must be an object/
    );
  });

  it('throws if ROOT_MAP is missing', () => {
    delete manager.remoteContextDefaults.ROOT_MAP;
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP must be defined in remoteContextDefaults/
    );
  });

  it('throws if ROOT_MAP is not a function', () => {
    manager.remoteContextDefaults.ROOT_MAP = 123;
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP must be a function/
    );
  });

  it('throws if ROOT_MAP throws an error', () => {
    manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => {
      throw new Error('fail!');
    });
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP function threw an error during execution: fail!/
    );
  });

  it('throws if ROOT_MAP returns null', () => {
    manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => null);
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP must return a non-null object/
    );
  });

  it('throws if ROOT_MAP returns non-object', () => {
    manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => 123);
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP must return a non-null object/
    );
  });

  it('throws if ROOT_MAP returns empty object', () => {
    manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => ({}));
    expect(() => RootMapValidator.validateArgs(globalNamespace, manager)).toThrow(
      /ROOT_MAP must not return an empty object/
    );
  });

  it('logs error and returns false if ROOT_MAP returns empty object and throwError=false', () => {
    manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => ({}));
    expect(RootMapValidator.validateArgs(globalNamespace, manager, false, true)).toBe(false);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ROOT_MAP must not return an empty object'));
  });

  it('returns false and does not throw if consoleLog=false and throwError=false', () => {
    expect(RootMapValidator.validateArgs(undefined, manager, false, false)).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
  });
});