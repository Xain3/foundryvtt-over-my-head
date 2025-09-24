/**
 * @file deployer.unit.test.mjs
 * @description Unit tests for ModuleDeployer class
 * @path scripts/dev/deployer.unit.test.mjs
 */

import fs from 'fs';
import path from 'path';
import ModuleDeployer from './deployer.mjs';

// Mock dependencies
jest.mock('fs');
jest.mock('path');

describe('ModuleDeployer', () => {
  let mockFs;
  let mockPath;
  const TO_DEPLOY = ['./dist', './assets', './public', './lang', './packs', './styles', './module.json'];

  beforeEach(() => {
    mockFs = fs;
    mockPath = path;

    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockReturnValue(['main.mjs', 'main.mjs.map']);
    mockFs.statSync.mockReturnValue({
      isFile: () => true,
      isDirectory: () => false,
      size: 1000,
      mtime: new Date('2023-01-01')
    });
    mockFs.copyFileSync.mockImplementation();
    mockFs.mkdirSync.mockImplementation();
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.basename.mockImplementation((filePath) => filePath.split('/').pop());
  });

  describe('constructor', () => {
    it('should create instance with target directory', () => {
      const deployer = new ModuleDeployer('/target/dir');

      expect(deployer).toBeInstanceOf(ModuleDeployer);
    });

    it('should handle missing target directory in constructor', () => {
      const deployer = new ModuleDeployer();

      expect(deployer).toBeInstanceOf(ModuleDeployer);
    });
  });

  describe('deploy', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should throw error when target directory not specified', () => {
      const deployer = new ModuleDeployer();

      expect(() => deployer.deploy()).toThrow('Target directory not specified for deployment');
    });

    it('should throw error when target directory is null', () => {
      const deployer = new ModuleDeployer(null);

      expect(() => deployer.deploy()).toThrow('Target directory not specified for deployment');
    });

    it('should throw error when target directory is empty string', () => {
      const deployer = new ModuleDeployer('');

      expect(() => deployer.deploy()).toThrow('Target directory not specified for deployment');
    });

    it('should create target directory if it does not exist', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === '/target/dir') return false;
        return true;
      });

      deployer.deploy();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/target/dir', { recursive: true });
      expect(consoleSpy).toHaveBeenCalledWith('Created target directory: /target/dir');
    });

    it('should sync all TO_DEPLOY items successfully', () => {
      const deployer = new ModuleDeployer('/target/dir');

      // Mock only module.json as file, skip directories to avoid recursion
      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './module.json') return true;
        if (filePath.startsWith('/target/dir/')) return false;
        return false; // All other TO_DEPLOY items don't exist
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return {
          isFile: () => false,
          isDirectory: () => true,
          size: 0,
          mtime: new Date('2023-01-01')
        };
      });

  // Mock the date string to ensure deterministic assertion
  const dateSpy = jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('TEST_TIME');

  deployer.deploy();

  expect(consoleSpy).toHaveBeenCalledWith('Syncing TO_DEPLOY items to /target/dir at TEST_TIME');
  dateSpy.mockRestore();
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./module.json', '/target/dir/module.json');
      expect(consoleSpy).toHaveBeenCalledWith('Synced: module.json');
    });

    it('should skip non-existent TO_DEPLOY items', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './assets') return false;
        if (filePath === './public') return false;
        return true;
      });

      deployer.deploy();

      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./assets - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./public - does not exist');
    });

    it('should only copy changed files', () => {
      const deployer = new ModuleDeployer('/target/dir');

      // Mock only module.json exists, target exists and is identical
      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './module.json') return true;
        if (filePath === '/target/dir/module.json') return true;
        return false;
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json' || filePath === '/target/dir/module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      deployer.deploy();

      expect(mockFs.copyFileSync).not.toHaveBeenCalledWith('./module.json', '/target/dir/module.json');
      expect(consoleSpy).toHaveBeenCalledWith('Unchanged: module.json');
    });

    it('should copy files when size differs', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './module.json') return true;
        if (filePath === '/target/dir/module.json') return true;
        return false;
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 600, // Different size
            mtime: new Date('2023-01-01')
          };
        }
        if (filePath === '/target/dir/module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      deployer.deploy();

      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./module.json', '/target/dir/module.json');
      expect(consoleSpy).toHaveBeenCalledWith('Synced: module.json');
    });

    it('should copy files when source is newer', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './module.json') return true;
        if (filePath === '/target/dir/module.json') return true;
        return false;
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-02') // Newer
          };
        }
        if (filePath === '/target/dir/module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      deployer.deploy();

      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./module.json', '/target/dir/module.json');
      expect(consoleSpy).toHaveBeenCalledWith('Synced: module.json');
    });
  });

  describe('directory syncing', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should sync directories recursively', () => {
      const deployer = new ModuleDeployer('/target/dir');

      // Only test with dist directory
      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './dist') return true;
        if (filePath === '/target/dir/dist') return false;
        if (filePath.startsWith('./') && filePath !== './dist') return false;
        return true;
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './dist') {
          return { isFile: () => false, isDirectory: () => true };
        }
        return {
          isFile: () => true,
          isDirectory: () => false,
          size: 1000,
          mtime: new Date('2023-01-01')
        };
      });

      mockFs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath === './dist') return ['main.mjs', 'subfolder'];
        return [];
      });

      deployer.deploy();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/target/dir/dist', { recursive: true });
      expect(consoleSpy).toHaveBeenCalledWith('Created directory: dist');
    });

    it('should handle nested directories', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.existsSync.mockImplementation((filePath) => {
        if (filePath === './dist') return true;
        if (filePath.startsWith('./') && filePath !== './dist') return false;
        if (filePath.startsWith('/target/dir/')) return false;
        return true;
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './dist' || filePath === './dist/subfolder') {
          return { isFile: () => false, isDirectory: () => true };
        }
        return {
          isFile: () => true,
          isDirectory: () => false,
          size: 1000,
          mtime: new Date('2023-01-01')
        };
      });

      mockFs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath === './dist') return ['main.mjs', 'subfolder'];
        if (dirPath === './dist/subfolder') return ['nested.mjs'];
        return [];
      });

      deployer.deploy();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/target/dir/dist', { recursive: true });
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/target/dir/dist/subfolder', { recursive: true });
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./dist/main.mjs', '/target/dir/dist/main.mjs');
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./dist/subfolder/nested.mjs', '/target/dir/dist/subfolder/nested.mjs');
    });
  });

  describe('error handling', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle file system errors gracefully', () => {
      const deployer = new ModuleDeployer('/target/dir');

      // Mock only module.json exists
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === './module.json';
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return { isFile: () => true, isDirectory: () => false };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => deployer.deploy()).toThrow('Permission denied');
    });

    it('should handle stat errors', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.statSync.mockImplementation(() => {
        throw new Error('Cannot stat file');
      });

      expect(() => deployer.deploy()).toThrow('Cannot stat file');
    });

    it('should handle readdir errors in directories', () => {
      const deployer = new ModuleDeployer('/target/dir');

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './dist') {
          return { isFile: () => false, isDirectory: () => true };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Cannot read directory');
      });

      expect(() => deployer.deploy()).toThrow('Cannot read directory');
    });
  });

  describe('integration scenarios', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle typical FoundryVTT module deployment', () => {
      const deployer = new ModuleDeployer('/foundry/modules/test-module');

      // Mock only some TO_DEPLOY items exist, skip others to focus on actual test
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === './module.json';
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 1000,
            mtime: new Date('2023-01-01')
          };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

  // Mock the date string to ensure deterministic assertion
  const dateSpy2 = jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('TEST_TIME');

  deployer.deploy();

  expect(consoleSpy).toHaveBeenCalledWith('Syncing TO_DEPLOY items to /foundry/modules/test-module at TEST_TIME');
  dateSpy2.mockRestore();
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./module.json', '/foundry/modules/test-module/module.json');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./dist - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./assets - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./public - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./lang - does not exist');
    });

    it('should handle mixed existing and non-existing TO_DEPLOY items', () => {
      const deployer = new ModuleDeployer('/target');

      // Only module.json exists as a file, dist doesn't exist to avoid recursion
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === './module.json';
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return { isFile: () => true, isDirectory: () => false };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      deployer.deploy();

      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./dist - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./assets - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./public - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./lang - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./packs - does not exist');
      expect(consoleSpy).toHaveBeenCalledWith('Skipping ./styles - does not exist');
    });
  });

  describe('edge cases', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle files with special characters in names', () => {
      const deployer = new ModuleDeployer('/target');

      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === './dist';
      });

      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === './dist') {
          return { isFile: () => false, isDirectory: () => true };
        }
        return {
          isFile: () => true,
          isDirectory: () => false,
          size: 1000,
          mtime: new Date('2023-01-01')
        };
      });

      mockFs.readdirSync.mockReturnValue(['file with spaces.mjs', 'file-with-dashes.css', 'file_with_underscores.json']);

      deployer.deploy();

      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./dist/file with spaces.mjs', '/target/dist/file with spaces.mjs');
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./dist/file-with-dashes.css', '/target/dist/file-with-dashes.css');
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('./dist/file_with_underscores.json', '/target/dist/file_with_underscores.json');
    });

    it('should handle empty directories', () => {
      const deployer = new ModuleDeployer('/target');

      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === './dist';
      });

      mockFs.statSync.mockImplementation((filePath) => {
        return { isFile: () => false, isDirectory: () => true };
      });

      mockFs.readdirSync.mockReturnValue([]);

      deployer.deploy();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/target/dist', { recursive: true });
      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
    });
  });
});