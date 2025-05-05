import RemoteContextRootMap from './rootMap';
import RootMapValidator from './validators/rootMapValidator';

describe('RemoteContextRootMap', () => {
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
        jest.spyOn(RootMapValidator, 'validateArgs').mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('calls RootMapValidator.validateArgs on construction', () => {
        new RemoteContextRootMap(globalNamespace, manager);
        expect(RootMapValidator.validateArgs).toHaveBeenCalled();
    });

    it('sets instance properties correctly', () => {
        const instance = new RemoteContextRootMap(globalNamespace, manager);
        expect(instance.globalNamespace).toBe(globalNamespace);
        expect(instance.manager).toBe(manager);
        expect(instance.module).toBe(moduleObj);
        expect(instance.mapConstructor).toBe(manager.remoteContextDefaults.ROOT_MAP);
        expect(instance.rootMap).toEqual(rootMapResult);
    });

    it('calls mapConstructor with globalNamespace and module on construction', () => {
        new RemoteContextRootMap(globalNamespace, manager);
        expect(manager.remoteContextDefaults.ROOT_MAP).toHaveBeenCalledWith(globalNamespace, moduleObj);
    });

    it('getMap uses default instance properties if no args provided', () => {
        const instance = new RemoteContextRootMap(globalNamespace, manager);
        manager.remoteContextDefaults.ROOT_MAP.mockClear();
        instance.getMap();
        expect(manager.remoteContextDefaults.ROOT_MAP).toHaveBeenCalledWith(globalNamespace, moduleObj);
    });

    it('getMap uses provided arguments if given', () => {
        const instance = new RemoteContextRootMap(globalNamespace, manager);
        const otherNamespace = { bar: 'baz' };
        const otherModule = { name: 'otherModule' };
        instance.getMap(otherNamespace, otherModule);
        expect(manager.remoteContextDefaults.ROOT_MAP).toHaveBeenCalledWith(otherNamespace, otherModule);
    });

    it('rootMap is set to the result of getMap', () => {
        const instance = new RemoteContextRootMap(globalNamespace, manager);
        expect(instance.rootMap).toEqual(rootMapResult);
    });

    it('throws if mapConstructor throws', () => {
        manager.remoteContextDefaults.ROOT_MAP = jest.fn(() => { throw new Error('fail!'); });
        jest.spyOn(RootMapValidator, 'validateArgs').mockImplementation(() => true);
        expect(() => new RemoteContextRootMap(globalNamespace, manager)).toThrow('fail!');
    });
});