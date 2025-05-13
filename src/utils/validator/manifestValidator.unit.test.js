import ManifestValidator from './manifestValidator';
import { z } from 'zod';

describe('ManifestValidator', () => {
  const validManifest = {
    constants: {
      validatorSeparator: ',',
      referToModuleBy: 'name'
    },
    title: 'Test Module',
    name: 'test-module',
    shortName: 'tm',
    id: 'test-id'
  };

  it('should validate a manifest with all required fields', () => {
    expect(() => ManifestValidator.validateManifest(validManifest)).not.toThrow();
  });

  it('should validate a manifest with only one of title, name, shortName, or id', () => {
    const minimalManifest = {
      constants: {
        validatorSeparator: '|',
        referToModuleBy: 'id'
      },
      name: 'only-name'
    };
    expect(() => ManifestValidator.validateManifest(minimalManifest)).not.toThrow();
  });

  it('should throw if constants is missing', () => {
    const manifest = { title: 'No Constants' };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/constants/);
  });

  it('should throw if validatorSeparator is missing', () => {
    const manifest = {
      constants: { referToModuleBy: 'id' },
      name: 'missing-separator'
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/validatorSeparator/);
  });

  it('should throw if referToModuleBy is missing', () => {
    const manifest = {
      constants: { validatorSeparator: ';' },
      name: 'missing-refer'
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/referToModuleBy/);
  });

  it('should throw if validatorSeparator is empty', () => {
    const manifest = {
      constants: { validatorSeparator: '', referToModuleBy: 'id' },
      name: 'empty-separator'
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/validatorSeparator cannot be empty/);
  });

  it('should throw if referToModuleBy is empty', () => {
    const manifest = {
      constants: { validatorSeparator: ',', referToModuleBy: '' },
      name: 'empty-refer'
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/referToModuleBy cannot be empty/);
  });

  it('should throw if none of title, name, shortName, or id are present', () => {
    const manifest = {
      constants: { validatorSeparator: ',', referToModuleBy: 'id' }
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/at least one of 'title', 'name', 'shortName', or 'id'/);
  });

  it('should throw a ZodError for invalid types', () => {
    const manifest = {
      constants: { validatorSeparator: 123, referToModuleBy: false },
      name: 42
    };
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/constants.validatorSeparator: Expected string/);
    expect(() => ManifestValidator.validateManifest(manifest)).toThrow(/constants.referToModuleBy: Expected string/);
  });
});