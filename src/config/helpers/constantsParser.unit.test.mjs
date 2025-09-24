/**
 * @file constantsParser.unit.test.mjs
 * @description Unit tests for the ConstantsParser class.
 * @path src/constants/helpers/constantsParser.unit.test.mjs
 * @date 26 May 2025
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import yaml from 'js-yaml';
import ConstantsParser from './constantsParser.mjs';
import PathUtils from '@helpers/pathUtils.mjs';

vi.mock('js-yaml', () => {
  const loadFunction = vi.fn();
  return {
    default: {
      load: loadFunction
    },
    load: loadFunction
  };
});
vi.mock('@helpers/pathUtils.mjs', () => ({
  default: {
    resolvePath: vi.fn(),
  },
}));

describe('ConstantsParser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parseConstants', () => {
    const yamlString = 'fake: yaml';
    const parsedYaml = {
      context: {
        schema: { foo: 'string', bar: 'number' },
      },
      other: 42,
    };

    beforeEach(() => {
      yaml.load.mockReturnValue(JSON.parse(JSON.stringify(parsedYaml)));
    });

    it('parses YAML and returns the parsed structure', () => {
      const result = ConstantsParser.parseConstants(yamlString);

      expect(yaml.load).toHaveBeenCalledWith(yamlString);
      expect(result.context.schema).toEqual(parsedYaml.context.schema);
      expect(result.other).toBe(42);
    });

    it('throws if constants is not a string', () => {
      expect(() => ConstantsParser.parseConstants(123)).toThrow(TypeError);
    });

    it('throws and logs error if YAML parsing fails', () => {
      yaml.load.mockImplementation(() => { throw new Error('bad yaml'); });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => ConstantsParser.parseConstants(yamlString)).toThrow('Failed to parse constants');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createRootMapFromYaml', () => {
    const mockGlobalNamespace = { game: { system: 'dnd5e' } };
    const mockModule = { id: 'my-module', api: {} };

    beforeEach(() => {
      // Set up PathUtils mock
      PathUtils.resolvePath = vi.fn();
      PathUtils.resolvePath.mockClear();
    });

    it('should create a root map function that correctly resolves paths', () => {
      const config = {
        rootMap: {
          systemName: 'game.system',
          moduleApi: 'module.api',
        },
      };
      PathUtils.resolvePath
        .mockReturnValueOnce(mockGlobalNamespace.game.system) // for 'game.system'
        .mockReturnValueOnce(mockModule.api); // for 'module.api'

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.systemName).toBe('dnd5e');
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.system');
      expect(rootMap.moduleApi).toBe(mockModule.api);
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'module.api');
    });

    it('should handle "module" keyword correctly', () => {
      const config = {
        rootMap: {
          currentModule: 'module',
        },
      };
      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.currentModule).toBe(mockModule);
      expect(PathUtils.resolvePath).not.toHaveBeenCalled();
    });

    it('should handle null values correctly', () => {
      const config = {
        rootMap: {
          optionalFeature: null,
        },
      };
      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.optionalFeature).toBeNull();
      expect(PathUtils.resolvePath).not.toHaveBeenCalled();
    });

    it('should handle a mix of path resolutions, "module", and null values', () => {
      const config = {
        rootMap: {
          system: 'game.system',
          self: 'module',
          nothing: null,
        },
      };
      PathUtils.resolvePath.mockReturnValueOnce(mockGlobalNamespace.game.system);

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.system).toBe('dnd5e');
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.system');
      expect(rootMap.self).toBe(mockModule);
      expect(rootMap.nothing).toBeNull();
      expect(PathUtils.resolvePath).toHaveBeenCalledTimes(1);
    });

    it('should return an empty object if config.rootMap is empty', () => {
      const config = {
        rootMap: {},
      };
      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap).toEqual({});
      expect(PathUtils.resolvePath).not.toHaveBeenCalled();
    });

    it('should assign undefined if resolvePath returns undefined for a path', () => {
      const config = {
        rootMap: {
          nonExistent: 'path.to.nothing',
        },
      };
      PathUtils.resolvePath.mockReturnValueOnce(undefined);

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.nonExistent).toBeUndefined();
      expect(PathUtils.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'path.to.nothing');
    });
  });
});