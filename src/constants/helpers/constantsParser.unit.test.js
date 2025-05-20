import { z } from 'zod';
import yaml from 'js-yaml';
import ConstantsParser from './constantsParser';
import * as stringToZodTypeModule from '@maps/stringToZodType';

jest.mock('js-yaml', () => ({
  load: jest.fn(),
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
});