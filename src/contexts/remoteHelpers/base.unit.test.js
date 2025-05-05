import { before } from 'lodash';
import { VALID_CONFIG } from './validators/baseValidator.unit.test';
import RemoteContextBase, { BaseValidator } from './base';

            

describe('RemoteContextBase', () => {
    // Minimal valid config for tests
    const validConfig = VALID_CONFIG

    it('should construct with valid config and default options', () => {
        const instance = new RemoteContextBase({ config: validConfig });
        expect(instance.configArgs).toBe(validConfig);
        expect(instance.remoteContextDefaults).toEqual(validConfig.CONSTANTS.CONTEXT.DEFAULTS.REMOTE);
        expect(instance.rootIdentifier).toBe('module');
        expect(instance.globalNamespace).toBe(global);
        expect(instance.overrideGlobal).toBeNull();
        expect(instance.overrideModule).toBeNull();
        expect(instance.contextRootMap).toBeDefined();
    });

    it('should use contextRootIdentifier if provided and valid', () => {
        const instance = new RemoteContextBase({ config: validConfig, contextRootIdentifier: 'customRoot' });
        expect(instance.rootIdentifier).toBe('customRoot');
    });

    it('should fallback to default root if contextRootIdentifier is not a string', () => {
        const instance = new RemoteContextBase({ config: validConfig, contextRootIdentifier: 123 });
        expect(instance.rootIdentifier).toBe('module');
    });

    it('should fallback to "module" if no root is provided in config', () => {
        const configWithoutRoot = {...validConfig};
        delete configWithoutRoot.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT;
        const instance = new RemoteContextBase({ config: configWithoutRoot });
        expect(instance.rootIdentifier).toBe('module');
    });

    it('should use overrideGlobal and overrideModule if provided', () => {
        const fakeGlobal = { foo: 1 };
        const fakeModule = { bar: 2 };
        const instance = new RemoteContextBase({
            config: validConfig,
            overrideGlobal: fakeGlobal,
            overrideModule: fakeModule
        });
        expect(instance.globalNamespace).toBe(fakeGlobal);
        expect(instance.overrideGlobal).toBe(fakeGlobal);
        expect(instance.module).toBe(fakeModule);
        expect(instance.overrideModule).toBe(fakeModule);
    });

    it('should call resetBase and update properties', () => {
        const instance = new RemoteContextBase({ config: validConfig, contextRootIdentifier: 'root1' });
        const newConfig = {...validConfig };
        newConfig.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT = 'root2';
        instance.resetBase({ config: newConfig, contextRootIdentifier: 'root2' });
        expect(instance.configArgs).toBe(newConfig);
        expect(instance.rootIdentifier).toBe('root2');
    });

    it('should throw if config is missing', () => {
        expect(() => new RemoteContextBase({})).toThrow(/Config is required/);
    });

    it('should throw if config is not an object', () => {
        expect(() => new RemoteContextBase({ config: 'not an object' })).toThrow(/Config must be a valid object/);
        expect(() => new RemoteContextBase({ config: 123 })).toThrow(/Config must be a valid object/);
    });

    it('should throw if config is missing required structure', () => {
        expect(() => new RemoteContextBase({ config: {} })).toThrow(/Config must contain a CONSTANTS object/);
        expect(() => new RemoteContextBase({ config: { CONSTANTS: {} } })).toThrow(/Config must contain a CONTEXT object/);
        expect(() => new RemoteContextBase({ config: { CONSTANTS: { CONTEXT: {} } } })).toThrow(/Config must contain a CONTEXT.DEFAULTS object/);
        expect(() => new RemoteContextBase({ config: { CONSTANTS: { CONTEXT: { DEFAULTS: {} } } } })).toThrow(/Config must contain a CONTEXT.DEFAULTS.REMOTE object/);
    });

    it('should NOT throw if ROOT is missing as it will fallback to "module', () => {
        expect(() => new RemoteContextBase({ config: { CONSTANTS: { CONTEXT: { DEFAULTS: { REMOTE: {} } } } } })).not.toThrow(/Config must contain a CONTEXT.DEFAULTS.REMOTE.ROOT string/);
    });

    it('should throw if overrideGlobal is not an object', () => {
        const badOverride = 123;
        expect(() => new RemoteContextBase({ config: validConfig, overrideGlobal: badOverride })).toThrow(/Override global should be an object/);
    });

    it('should throw if overrideModule is not an object', () => {
        const badOverride = 123;
        expect(() => new RemoteContextBase({ config: validConfig, overrideModule: badOverride })).toThrow(/Override module should be an object/);
    });
});