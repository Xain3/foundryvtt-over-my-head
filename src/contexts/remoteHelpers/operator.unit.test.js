import RemoteContextOperator from './operator';
import RemoteContextBase from './base';
import KeyPathParser from './parser';
import RootManager from './rootManager';

// Mock dependencies
jest.mock('./base');
jest.mock('./parser');
jest.mock('./rootManager');

describe('RemoteContextOperator', () => {
    let config, contextRootIdentifier, remoteContextDefaults, rootManagerInstance, parserInstance;

    beforeEach(() => {
        config = { foo: 'bar' };
        contextRootIdentifier = 'testRoot';

        // Mock remoteContextDefaults on base class
        remoteContextDefaults = {
            PATH: 'mockObject',
            DATA_PATH: '.data',
            FLAGS_PATH: '.flags',
            SETTINGS_PATH: '.settings',
            TIMESTAMP_KEY: 'ts'
        };

        // Mock RootManager
        rootManagerInstance = { root: 'rootValue' };
        RootManager.mockImplementation(() => rootManagerInstance);

        // Mock KeyPathParser
        parserInstance = { parse: jest.fn((x) => `parsed:${x}`) };
        KeyPathParser.mockImplementation(() => parserInstance);

        // Mock RemoteContextBase to set remoteContextDefaults
        RemoteContextBase.mockImplementation(function ({ config, contextRootIdentifier }) {
            this.remoteContextDefaults = remoteContextDefaults;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize properties correctly', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });

        expect(operator.validKeyTypes).toEqual(['string', 'number', 'symbol']);
        expect(RootManager).toHaveBeenCalledWith({ config, contextRootIdentifier });
        expect(operator.rootManager).toBe(rootManagerInstance);
        expect(operator.remoteContextRoot).toBe('rootValue');
        expect(operator.remoteObjectName).toBe(remoteContextDefaults.PATH);
        expect(operator.contextObjectPath).toBe('rootValue.mockObject');
        expect(operator.defaultDataPath).toBe('.data');
        expect(operator.defaultFlagsPath).toBe('.flags');
        expect(operator.defaultSettingsPath).toBe('.settings');
        expect(operator.defaultTimestampKey).toBe('ts');
        expect(operator.dataPath).toBe('rootValue.mockObject.data');
        expect(operator.flagsPath).toBe('rootValue.mockObject.flags');
        expect(operator.settingsPath).toBe('rootValue.mockObject.settings');
        expect(KeyPathParser).toHaveBeenCalled();
        expect(operator.parser).toBe(parserInstance);
    });

    it('should allow overriding validKeyTypes', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier, validKeyTypes: ['foo'] });
        expect(operator.validKeyTypes).toEqual(['foo']);
    });

    it('parseKeyOrPath should delegate to parser', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        expect(operator.parseKeyOrPath('abc')).toBe('parsed:abc');
        expect(parserInstance.parse).toHaveBeenCalledWith('abc');
    });

    it('getContextObjectPath should return correct path', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        expect(operator.getContextObjectPath({ root: 'r', objectName: 'o' })).toBe('r.o');
        // Defaults
        expect(operator.getContextObjectPath({})).toBe('rootValue.mockObject');
    });

    it('getDataPath should return correct path', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        expect(operator.getDataPath({ root: 'r', objectName: 'o', path: '.d' })).toBe('r.o.d');
        expect(operator.getDataPath({})).toBe('rootValue.mockObject.data');
    });

    it('getFlagsPath should return correct path', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        expect(operator.getFlagsPath({ root: 'r', objectName: 'o', path: '.f' })).toBe('r.o.f');
        expect(operator.getFlagsPath({})).toBe('rootValue.mockObject.flags');
    });

    it('getSettingsPath should return correct path', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        expect(operator.getSettingsPath({ root: 'r', objectName: 'o', path: '.s' })).toBe('r.o.s');
        expect(operator.getSettingsPath({})).toBe('rootValue.mockObject.settings');
    });

    it('updateContextObjectPath should update contextObjectPath', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        operator.updateContextObjectPath({ root: 'newRoot', objectName: 'newObj' });
        expect(operator.contextObjectPath).toBe('newRoot.newObj');
    });

    it('updateDataPath should update dataPath', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        operator.updateDataPath({ root: 'r', objectName: 'o', path: '.d' });
        expect(operator.dataPath).toBe('r.o.d');
    });

    it('updateFlagsPath should update flagsPath', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        operator.updateFlagsPath({ root: 'r', objectName: 'o', path: '.f' });
        expect(operator.flagsPath).toBe('r.o.f');
    });

    it('updateSettingsPath should update settingsPath', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        operator.updateSettingsPath({ root: 'r', objectName: 'o', path: '.s' });
        expect(operator.settingsPath).toBe('r.o.s');
    });

    it('updateAllPaths should update all paths', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        operator.updateAllPaths({
            root: 'r',
            objectName: 'o',
            dataPath: '.d',
            flagsPath: '.f',
            settingsPath: '.s'
        });
        expect(operator.contextObjectPath).toBe('r.o');
        expect(operator.dataPath).toBe('r.o.d');
        expect(operator.flagsPath).toBe('r.o.f');
        expect(operator.settingsPath).toBe('r.o.s');
    });

    it('update should update contextObjectPath and all paths', () => {
        const operator = new RemoteContextOperator({ config, contextRootIdentifier });
        // Spy on updateAllPaths
        const spy = jest.spyOn(operator, 'updateAllPaths');
        operator.update({
            root: 'r',
            objectName: 'o',
            dataPath: '.d',
            flagsPath: '.f',
            settingsPath: '.s'
        });
        expect(operator.contextObjectPath).toBe('r.o');
        expect(spy).toHaveBeenCalledWith({
            root: 'r',
            objectName: 'o',
            dataPath: '.d',
            flagsPath: '.f',
            settingsPath: '.s'
        });
    });
});