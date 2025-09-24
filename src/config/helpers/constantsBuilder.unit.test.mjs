/**
 * @file constantsBuilder.unit.test.mjs
 * @description Test file for the ConstantsBuilder class functionality.
 * @path src/constants/helpers/constantsBuilder.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ConstantsBuilder from './constantsBuilder.mjs';
import ConstantsParser from './constantsParser.mjs';
import ConstantsGetter from './constantsGetter.mjs';


// Mock the dependencies
vi.mock('./constantsParser.mjs');
vi.mock('./constantsGetter.mjs');

describe('ConstantsBuilder', () => {
  const mockYamlString = 'testConstant: testValue\ncontext:\n  schema: test';
  const mockParsedObject = {
    testConstant: 'testValue',
    context: {
      schema: 'test'
    }
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    ConstantsGetter.getConstantsYaml.mockReturnValue(mockYamlString);
    ConstantsParser.parseConstants.mockReturnValue(mockParsedObject);
  });

  it('should create an instance and fetch constants during construction', () => {
    const builder = new ConstantsBuilder();

    expect(ConstantsGetter.getConstantsYaml).toHaveBeenCalledTimes(1);
    expect(ConstantsParser.parseConstants).toHaveBeenCalledTimes(1);
    expect(ConstantsParser.parseConstants).toHaveBeenCalledWith(mockYamlString, globalThis, true, null);
  });

  it('should return the YAML string via asString getter', () => {
    const builder = new ConstantsBuilder();

    expect(builder.asString).toBe(mockYamlString);
  });

  it('should return the parsed object via asObject getter', () => {
    const builder = new ConstantsBuilder();

    expect(builder.asObject).toBe(mockParsedObject);
    expect(builder.asObject).toEqual({
      testConstant: 'testValue',
      context: {
        schema: 'test'
      }
    });
  });

  it('should cache results and not call helpers multiple times', () => {
    const builder = new ConstantsBuilder();

    // Access properties multiple times
    const string1 = builder.asString;
    const string2 = builder.asString;
    const object1 = builder.asObject;
    const object2 = builder.asObject;

    // Helpers should only be called once during construction
    expect(ConstantsGetter.getConstantsYaml).toHaveBeenCalledTimes(1);
    expect(ConstantsParser.parseConstants).toHaveBeenCalledTimes(1);

    // Results should be consistent
    expect(string1).toBe(string2);
    expect(object1).toBe(object2);
  });

  it('should handle empty YAML string', () => {
    const emptyYaml = '';
    const emptyObject = {};

    ConstantsGetter.getConstantsYaml.mockReturnValue(emptyYaml);
    ConstantsParser.parseConstants.mockReturnValue(emptyObject);

    const builder = new ConstantsBuilder();

    expect(builder.asString).toBe(emptyYaml);
    expect(builder.asObject).toBe(emptyObject);
  });

  it('should handle parser errors gracefully', () => {
    const errorMessage = 'Parse error';
    ConstantsParser.parseConstants.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => new ConstantsBuilder()).toThrow(errorMessage);
  });
});