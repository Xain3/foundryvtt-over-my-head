/**
 * @file buildUtils.unit.test.js
 * @description Unit tests for build utility functions
 * @path scripts/dev/buildUtils.unit.test.js
 */

import fs from 'fs';
import path from 'path';
import { removeRootBuildArtifacts } from './buildUtils.js';

// Mock dependencies
jest.mock('fs');
jest.mock('path');

describe('buildUtils', () => {
  let mockFs;
  let mockPath;

  beforeEach(() => {
    mockFs = fs;
    mockPath = path;
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockFs.existsSync.mockReturnValue(false);
    mockFs.unlinkSync.mockImplementation();
    mockPath.resolve.mockImplementation((...args) => args.join('/'));
    
    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/project/root');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('removeRootBuildArtifacts', () => {
    let consoleSpy;
    let consoleWarnSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should remove main.js when it exists', () => {
      mockFs.existsSync.mockImplementation(file => file.includes('main.js') && !file.includes('.map'));
      
      removeRootBuildArtifacts();
      
      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.js');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.js');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js');
    });

    it('should remove main.js.map when it exists', () => {
      mockFs.existsSync.mockImplementation(file => file.includes('main.js.map'));
      
      removeRootBuildArtifacts();
      
      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.js.map');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.js.map');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js.map');
    });

    it('should remove both files when both exist', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      removeRootBuildArtifacts();
      
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.js');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.js.map');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js, main.js.map');
    });

    it('should do nothing when no files exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      removeRootBuildArtifacts();
      
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle file removal errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', expect.any(Error));
    });

    it('should handle existsSync errors gracefully', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', expect.any(Error));
    });

    it('should handle path.resolve errors gracefully', () => {
      mockPath.resolve.mockImplementation(() => {
        throw new Error('Path resolution error');
      });
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', expect.any(Error));
    });

    it('should handle partial removal failures', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementationOnce(() => {
        throw new Error('Cannot remove main.js');
      });
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', expect.any(Error));
    });

    it('should use correct file paths', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      removeRootBuildArtifacts();
      
      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.js');
      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.js.map');
      expect(mockPath.resolve).toHaveBeenCalledTimes(2);
    });

    it('should work with different working directories', () => {
      process.cwd.mockReturnValue('/different/project/path');
      mockFs.existsSync.mockReturnValue(true);
      
      removeRootBuildArtifacts();
      
      expect(mockPath.resolve).toHaveBeenCalledWith('/different/project/path', 'main.js');
      expect(mockPath.resolve).toHaveBeenCalledWith('/different/project/path', 'main.js.map');
    });
  });

  describe('logging behavior', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log only when files are actually removed', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      removeRootBuildArtifacts();
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log with correct file names when main.js is removed', () => {
      mockFs.existsSync.mockImplementation(file => file.includes('main.js') && !file.includes('.map'));
      
      removeRootBuildArtifacts();
      
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js');
    });

    it('should log with correct file names when main.js.map is removed', () => {
      mockFs.existsSync.mockImplementation(file => file.includes('main.js.map'));
      
      removeRootBuildArtifacts();
      
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js.map');
    });

    it('should log with comma-separated list when multiple files removed', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      removeRootBuildArtifacts();
      
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js, main.js.map');
    });
  });

  describe('error scenarios', () => {
    let consoleWarnSpy;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should warn with specific error when unlinkSync fails', () => {
      const specificError = new Error('EACCES: permission denied');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw specificError;
      });
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', specificError);
    });

    it('should continue execution after error', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('File locked');
      });
      
      // Should not throw
      expect(() => removeRootBuildArtifacts()).not.toThrow();
    });

    it('should handle errors in the middle of removal process', () => {
      const error = new Error('Disk full');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementationOnce(() => undefined) // First call succeeds
                      .mockImplementationOnce(() => { throw error; }); // Second call fails
      
      removeRootBuildArtifacts();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', error);
    });
  });

  describe('integration scenarios', () => {
    it('should work in typical development scenario', () => {
      // Simulate typical scenario where main.js exists but main.js.map doesn't
      mockFs.existsSync.mockImplementation(file => file.includes('main.js') && !file.includes('.map'));
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      removeRootBuildArtifacts();
      
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(1);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.js');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js');
      
      consoleSpy.mockRestore();
    });

    it('should work in build tool cleanup scenario', () => {
      // Simulate scenario where build tool leaves both artifacts
      mockFs.existsSync.mockReturnValue(true);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      removeRootBuildArtifacts();
      
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.js, main.js.map');
      
      consoleSpy.mockRestore();
    });

    it('should work when called multiple times', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      // First call
      removeRootBuildArtifacts();
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2);
      
      // Reset and call again
      mockFs.unlinkSync.mockClear();
      mockFs.existsSync.mockReturnValue(false); // Files already removed
      
      removeRootBuildArtifacts();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
