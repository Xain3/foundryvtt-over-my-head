import ParentObjectValidator from './parentObjectValidator';
import { z } from 'zod';

describe('ParentObjectValidator', () => {
  it('should validate a correct parent object', () => {
    const validParent = {
      prototype: {
        name: 'ParentName'
      }
    };
    expect(() => ParentObjectValidator.validateParentObject(validParent)).not.toThrow();
  });

  it('should throw if parent is null', () => {
    expect(() => ParentObjectValidator.validateParentObject(null)).toThrow(/Expected object, received null/);
  });

  it('should throw if parent is not an object', () => {
    expect(() => ParentObjectValidator.validateParentObject('string')).toThrow(/Expected object, received string/);
    expect(() => ParentObjectValidator.validateParentObject(123)).toThrow(/Expected object, received number/);
    expect(() => ParentObjectValidator.validateParentObject(undefined)).toThrow(/Invalid parent object/);
  });

  it('should throw if prototype is missing', () => {
    const parent = {};
    expect(() => ParentObjectValidator.validateParentObject(parent)).toThrow(/Invalid parent object/);
  });

  it('should throw if prototype.name is missing', () => {
    const parent = { prototype: {} };
    expect(() => ParentObjectValidator.validateParentObject(parent)).toThrow(/name/);
  });

  it('should throw if prototype.name is empty', () => {
    const parent = { prototype: { name: '' } };
    expect(() => ParentObjectValidator.validateParentObject(parent)).toThrow(/cannot be empty/);
  });

  it('should throw if prototype.name is not a string', () => {
    const parent = { prototype: { name: 123 } };
    expect(() => ParentObjectValidator.validateParentObject(parent)).toThrow(/Expected string, received number/);
  });

  it('should throw a ZodError for invalid types', () => {
    const parent = { prototype: { name: [] } };
    expect(() => ParentObjectValidator.validateParentObject(parent)).toThrow(Error);
  });

  it('should throw a formatted error message with all issues', () => {
    const parent = {};
    try {
      ParentObjectValidator.validateParentObject(parent);
    } catch (e) {
      expect(e.message).toMatch(/prototype/);
    }
  });
});