import { z } from 'zod';
import { stringToZodType, typeMap } from './stringToZodType';

describe('stringToZodType', () => {
  it('returns z.string() for "string"', () => {
    const schema = stringToZodType('string');
    expect(schema).toBe(typeMap.string);
    expect(schema.safeParse('foo').success).toBe(true);
    expect(schema.safeParse(123).success).toBe(false);
  });

  it('returns z.number() for "number"', () => {
    const schema = stringToZodType('number');
    expect(schema).toBe(typeMap.number);
    expect(schema.safeParse(42).success).toBe(true);
    expect(schema.safeParse('42').success).toBe(false);
  });

  it('returns z.boolean() for "boolean"', () => {
    const schema = stringToZodType('boolean');
    expect(schema).toBe(typeMap.boolean);
    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse(false).success).toBe(true);
    expect(schema.safeParse('true').success).toBe(false);
  });

  it('returns z.object({}) for "object"', () => {
    const schema = stringToZodType('object');
    expect(schema).toBe(typeMap.object);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse([]).success).toBe(false);
  });

  it('returns z.array(z.any()) for "array"', () => {
    const schema = stringToZodType('array');
    expect(schema).toBe(typeMap.array);
    expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    expect(schema.safeParse('not an array').success).toBe(false);
  });

  it('returns correct zod schema for "datetime"', () => {
    const schema = stringToZodType('datetime');
    expect(schema).toBe(typeMap.datetime);
    expect(schema.safeParse(Date.now()).success).toBe(true);
    expect(schema.safeParse(-100).success).toBe(false);
    expect(schema.safeParse('not a timestamp').success).toBe(false);
    expect(schema.safeParse(0.5).success).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(stringToZodType('STRING')).toBe(typeMap.string);
    expect(stringToZodType('Number')).toBe(typeMap.number);
    expect(stringToZodType('BoOlEaN')).toBe(typeMap.boolean);
  });

  it('returns z.any() for unknown types', () => {
    const schema = stringToZodType('unknownType');
    expect(schema).not.toBe(typeMap.string);
    expect(schema).not.toBe(typeMap.number);
    expect(schema.safeParse('anything').success).toBe(true);
    expect(schema.safeParse(123).success).toBe(true);
    expect(schema.safeParse({ foo: 'bar' }).success).toBe(true);
  });

  it('uses custom map if provided', () => {
    const customMap = { foo: z.literal('bar') };
    const schema = stringToZodType('foo', customMap);
    expect(schema).toBe(customMap.foo);
    expect(schema.safeParse('bar').success).toBe(true);
    expect(schema.safeParse('baz').success).toBe(false);
  });
});