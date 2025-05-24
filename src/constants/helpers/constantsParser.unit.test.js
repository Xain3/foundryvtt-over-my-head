import { z } from 'zod';
import yaml from 'js-yaml';
import ConstantsParser from './constantsParser';
import * as stringToZodTypeModule from '@maps/stringToZodType';
import * as resolvePathModule from '@helpers/resolvePath';

jest.mock('js-yaml', () => ({
  load: jest.fn(),
}));
jest.mock('@helpers/resolvePath', () => ({
  resolvePath: jest.fn(),
}));

describe('ConstantsParser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildContextSchema', () => {
    it('builds a Zod schema from a valid schema definition', () => {
      const schemaDef = { foo: 'string', bar: 'number' };
      const mockTypeMap = {
        string: z.string(),
        number: z.number(),
      };
      jest.spyOn(stringToZodTypeModule, 'stringToZodType')
        .mockImplementation(type => mockTypeMap[type]);

      const schema = ConstantsParser.buildContextSchema(schemaDef);

      expect(schema).toBeInstanceOf(z.ZodObject);
      expect(schema.shape.foo).toBe(mockTypeMap.string);
      expect(schema.shape.bar).toBe(mockTypeMap.number);

      expect(schema.safeParse({ foo: 'abc', bar: 123 }).success).toBe(true);
      expect(schema.safeParse({ foo: 123, bar: 'abc' }).success).toBe(false);
    });

    it('throws if schemaDefinition is not an object', () => {
      expect(() => ConstantsParser.buildContextSchema(null)).toThrow(TypeError);
      expect(() => ConstantsParser.buildContextSchema('not an object')).toThrow(TypeError);
    });

    it('throws and logs error if stringToZodType throws', () => {
      const schemaDef = { foo: 'string' };
      jest.spyOn(stringToZodTypeModule, 'stringToZodType').mockImplementation(() => {
        throw new Error('bad type');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => ConstantsParser.buildContextSchema(schemaDef)).toThrow('Failed to build context schema');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
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

    it('parses YAML and builds context.schema as Zod schema by default', () => {
      const mockZodSchema = z.object({ foo: z.string(), bar: z.number() });
      jest.spyOn(ConstantsParser, 'buildContextSchema').mockReturnValue(mockZodSchema);

      const result = ConstantsParser.parseConstants(yamlString);

      expect(yaml.load).toHaveBeenCalledWith(yamlString);
      expect(ConstantsParser.buildContextSchema).toHaveBeenCalledWith(parsedYaml.context.schema);
      expect(result.context.schema).toBe(mockZodSchema);
      expect(result.other).toBe(42);
    });

    it('parses YAML and does not build context.schema if buildContextSchema is false', () => {
      const result = ConstantsParser.parseConstants(yamlString, false);
      expect(yaml.load).toHaveBeenCalledWith(yamlString);
      expect(result.context.schema).toEqual(parsedYaml.context.schema);
    });

    it('throws if constants is not a string', () => {
      expect(() => ConstantsParser.parseConstants(123)).toThrow(TypeError);
    });

    it('throws if buildContextSchema is not a boolean', () => {
      expect(() => ConstantsParser.parseConstants(yamlString, 'yes')).toThrow(TypeError);
    });

    it('throws and logs error if YAML parsing fails', () => {
      yaml.load.mockImplementation(() => { throw new Error('bad yaml'); });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => ConstantsParser.parseConstants(yamlString)).toThrow('Failed to parse constants');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('throws and logs error if buildContextSchema throws', () => {
      jest.spyOn(ConstantsParser, 'buildContextSchema').mockImplementation(() => { throw new Error('fail'); });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => ConstantsParser.parseConstants(yamlString)).toThrow('Failed to parse constants');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createRootMapFromYaml', () => {
    const mockGlobalNamespace = { game: { system: 'dnd5e' } };
    const mockModule = { id: 'my-module', api: {} };

    beforeEach(() => {
      resolvePathModule.resolvePath.mockClear();
    });

    it('should create a root map function that correctly resolves paths', () => {
      const config = {
        rootMap: {
          systemName: 'game.system',
          moduleApi: 'module.api',
        },
      };
      resolvePathModule.resolvePath
        .mockReturnValueOnce(mockGlobalNamespace.game.system) // for 'game.system'
        .mockReturnValueOnce(mockModule.api); // for 'module.api'

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.systemName).toBe('dnd5e');
      expect(resolvePathModule.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.system');
      expect(rootMap.moduleApi).toBe(mockModule.api);
      expect(resolvePathModule.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'module.api');
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
      expect(resolvePathModule.resolvePath).not.toHaveBeenCalled();
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
      expect(resolvePathModule.resolvePath).not.toHaveBeenCalled();
    });

    it('should handle a mix of path resolutions, "module", and null values', () => {
      const config = {
        rootMap: {
          system: 'game.system',
          self: 'module',
          nothing: null,
        },
      };
      resolvePathModule.resolvePath.mockReturnValueOnce(mockGlobalNamespace.game.system);

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.system).toBe('dnd5e');
      expect(resolvePathModule.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'game.system');
      expect(rootMap.self).toBe(mockModule);
      expect(rootMap.nothing).toBeNull();
      expect(resolvePathModule.resolvePath).toHaveBeenCalledTimes(1);
    });

    it('should return an empty object if config.rootMap is empty', () => {
      const config = {
        rootMap: {},
      };
      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap).toEqual({});
      expect(resolvePathModule.resolvePath).not.toHaveBeenCalled();
    });

    it('should assign undefined if resolvePath returns undefined for a path', () => {
      const config = {
        rootMap: {
          nonExistent: 'path.to.nothing',
        },
      };
      resolvePathModule.resolvePath.mockReturnValueOnce(undefined);

      const rootMapFn = ConstantsParser.createRootMapFromYaml(config);
      const rootMap = rootMapFn(mockGlobalNamespace, mockModule);

      expect(rootMap.nonExistent).toBeUndefined();
      expect(resolvePathModule.resolvePath).toHaveBeenCalledWith(mockGlobalNamespace, 'path.to.nothing');
    });
  });
});