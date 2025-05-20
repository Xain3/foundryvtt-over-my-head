import fs from 'fs';
import path from 'path';
import ConstantsGetter from './constantsGetter';

jest.mock('fs');
jest.mock('path');

describe('ConstantsGetter', () => {
  const mockYamlContent = 'foo: bar\nbaz: qux';
  const mockConstantsFile = 'constants.yaml';
  const mockCustomFile = 'custom.yaml';
  const mockResolvedPath = '/mocked/path/constants.yaml';
  const mockCustomResolvedPath = '/mocked/path/custom.yaml';

  beforeEach(() => {
    jest.clearAllMocks();
    path.resolve.mockImplementation((...args) => {
      // Simulate path resolution for both default and custom file names
      if (args.includes(mockCustomFile)) {
        return mockCustomResolvedPath;
      }
      return mockResolvedPath;
    });
  });

  it('reads constants.yaml and returns its content as a string', () => {
    fs.readFileSync.mockReturnValueOnce(mockYamlContent);

    const result = ConstantsGetter.getConstantsYaml();

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), 'src', 'constants', mockConstantsFile);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockResolvedPath, 'utf8');
    expect(result).toBe(mockYamlContent);
  });

  it('reads a custom yaml file if provided', () => {
    fs.readFileSync.mockReturnValueOnce('custom: value');

    const result = ConstantsGetter.getConstantsYaml(mockCustomFile);

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), 'src', 'constants', mockCustomFile);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockCustomResolvedPath, 'utf8');
    expect(result).toBe('custom: value');
  });

  it('throws an error if reading the file fails', () => {
    const error = new Error('File not found');
    fs.readFileSync.mockImplementationOnce(() => { throw error; });

    expect(() => ConstantsGetter.getConstantsYaml()).toThrow(error);
    expect(path.resolve).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
  });
});
