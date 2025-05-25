import fs from 'fs';
import path from 'path';
import ConstantsGetter from './constantsGetter.js';

jest.mock('fs');
jest.mock('path');

describe('ConstantsGetter', () => {
  const mockYamlContent = 'foo: bar\nbaz: qux';
  const mockConstantsFile = 'constants.yaml';
  const mockCustomFile = 'custom.yaml';
  const mockResolvedPath = '/mocked/path/constants.yaml'; // This will be process.cwd() + constantsFile
  const mockCustomResolvedPath = '/mocked/path/custom.yaml'; // This will be process.cwd() + mockCustomFile

  beforeEach(() => {
    jest.clearAllMocks();
    path.resolve.mockImplementation((cwd, fileName) => {
      // Simulate path resolution for both default and custom file names from root
      if (fileName === mockCustomFile) {
        return `${cwd}/${mockCustomFile}`; // Simplified mock, actual resolve is more complex
      }
      return `${cwd}/${mockConstantsFile}`; // Simplified mock
    });
  });

  it('reads constants.yaml and returns its content as a string', () => {
    fs.readFileSync.mockReturnValueOnce(mockYamlContent);
    // Update expected path.resolve arguments
    const expectedResolvedPath = `${process.cwd()}/${mockConstantsFile}`;
    path.resolve.mockReturnValueOnce(expectedResolvedPath);


    const result = ConstantsGetter.getConstantsYaml();

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), mockConstantsFile);
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedResolvedPath, 'utf8');
    expect(result).toBe(mockYamlContent);
  });

  it('reads a custom yaml file if provided', () => {
    fs.readFileSync.mockReturnValueOnce('custom: value');
    // Update expected path.resolve arguments
    const expectedCustomResolvedPath = `${process.cwd()}/${mockCustomFile}`;
    path.resolve.mockReturnValueOnce(expectedCustomResolvedPath);

    const result = ConstantsGetter.getConstantsYaml(mockCustomFile);

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), mockCustomFile);
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedCustomResolvedPath, 'utf8');
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
