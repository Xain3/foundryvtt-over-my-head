/**
 * @file buildUtils.unit.test.mjs
 * @description Unit tests for build utility functions
 * @path .dev/scripts/build/buildUtils.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs', () => {
  const existsSync = vi.fn();
  const unlinkSync = vi.fn();
  return {
    default: {
      existsSync,
      unlinkSync
    },
    existsSync,
    unlinkSync
  };
});

vi.mock('path', () => {
  const resolve = vi.fn();
  return {
    default: {
      resolve
    },
    resolve
  };
});

let mockFs;
let mockPath;
let removeRootBuildArtifacts;
let processCwdSpy;

describe('buildUtils', () => {
  beforeEach(async () => {
    vi.resetModules();

    ({ default: mockFs } = await import('fs'));
    ({ default: mockPath } = await import('path'));
    ({ removeRootBuildArtifacts } = await import('./buildUtils.mjs'));

    mockFs.existsSync.mockReset();
    mockFs.unlinkSync.mockReset();
    mockPath.resolve.mockReset();

    mockFs.existsSync.mockReturnValue(false);
    mockFs.unlinkSync.mockImplementation(() => {});
    mockPath.resolve.mockImplementation((...args) => args.join('/'));

    processCwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/project/root');
  });

  afterEach(() => {
    processCwdSpy?.mockRestore();
  });

  describe('removeRootBuildArtifacts', () => {
    let consoleSpy;
    let consoleWarnSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should remove main.mjs when it exists', () => {
      mockFs.existsSync.mockImplementation((file) => file === '/project/root/main.mjs');

      removeRootBuildArtifacts();

      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.mjs');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.mjs');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs');
    });

    it('should remove main.mjs.map when it exists', () => {
      mockFs.existsSync.mockImplementation((file) => file === '/project/root/main.mjs.map');

      removeRootBuildArtifacts();

      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.mjs.map');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.mjs.map');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs.map');
    });

    it('should remove both files when both exist', () => {
      mockFs.existsSync.mockReturnValue(true);

      removeRootBuildArtifacts();

      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.mjs');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.mjs.map');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs, main.mjs.map');
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
        throw new Error('Cannot remove main.mjs');
      });

      removeRootBuildArtifacts();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Cleanup of root artifacts failed:', expect.any(Error));
    });

    it('should use correct file paths', () => {
      mockFs.existsSync.mockReturnValue(true);

      removeRootBuildArtifacts();

      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.mjs');
      expect(mockPath.resolve).toHaveBeenCalledWith('/project/root', 'main.mjs.map');
      expect(mockPath.resolve).toHaveBeenCalledTimes(2);
    });

    it('should work with different working directories', () => {
      processCwdSpy.mockReturnValue('/different/project/path');
      mockFs.existsSync.mockReturnValue(true);

      removeRootBuildArtifacts();

      expect(mockPath.resolve).toHaveBeenCalledWith('/different/project/path', 'main.mjs');
      expect(mockPath.resolve).toHaveBeenCalledWith('/different/project/path', 'main.mjs.map');
    });
  });

  describe('logging behavior', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log only when files are actually removed', () => {
      mockFs.existsSync.mockReturnValue(false);

      removeRootBuildArtifacts();

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log with correct file names when main.mjs is removed', () => {
      mockFs.existsSync.mockImplementation((file) => file === '/project/root/main.mjs');

      removeRootBuildArtifacts();

      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs');
    });

    it('should log with correct file names when main.mjs.map is removed', () => {
      mockFs.existsSync.mockImplementation((file) => file === '/project/root/main.mjs.map');

      removeRootBuildArtifacts();

      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs.map');
    });

    it('should log with comma-separated list when multiple files removed', () => {
      mockFs.existsSync.mockReturnValue(true);

      removeRootBuildArtifacts();

      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs, main.mjs.map');
    });
  });

  describe('error scenarios', () => {
    let consoleWarnSpy;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
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
      // Simulate typical scenario where main.mjs exists but main.mjs.map doesn't
      mockFs.existsSync.mockImplementation((file) => file === '/project/root/main.mjs');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      removeRootBuildArtifacts();

      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(1);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/project/root/main.mjs');
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs');

      consoleSpy.mockRestore();
    });

    it('should work in build tool cleanup scenario', () => {
      // Simulate scenario where build tool leaves both artifacts
      mockFs.existsSync.mockReturnValue(true);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      removeRootBuildArtifacts();

      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('Removed root artifacts: main.mjs, main.mjs.map');

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
