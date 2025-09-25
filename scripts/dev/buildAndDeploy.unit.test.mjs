/**
 * @file buildAndDeploy.unit.test.mjs
 * @description Unit tests for buildAndDeploy classes
 * @path scripts/dev/buildAndDeploy.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock dependencies first
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  copyFileSync: vi.fn()
}));
vi.mock('os');
vi.mock('path');

// Import mocked modules
import fs from 'fs';
import os from 'os';
import path from 'path';

// Set up fs mock return values before any imports
const mockModuleJson = { id: 'test-module' };
fs.readFileSync.mockReturnValue(JSON.stringify(mockModuleJson));

// Mock ViteRunner
const mockViteRunner = {
  start: vi.fn().mockResolvedValue()
};
vi.mock('../build/runViteWIthAction.mjs', () => ({
  default: vi.fn().mockImplementation(() => mockViteRunner)
}));

// Import after mocking
import {
  UserDataDirFinder,
  ModuleDirManager,
  ModuleBuilder,
  ModuleDeployer,
  BuildAndDeploy
} from './buildAndDeploy.mjs';

describe('UserDataDirFinder', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup fs mocks with proper return values
    fs.readFileSync.mockReturnValue(JSON.stringify(mockModuleJson));
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ isDirectory: () => true });
    fs.mkdirSync.mockImplementation(() => {});
    fs.readdirSync.mockReturnValue([]);
    fs.copyFileSync.mockImplementation(() => {});

    // Setup console mocks
    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with default platform and user', () => {
      os.platform.mockReturnValue('linux');
      os.userInfo.mockReturnValue({ username: 'testuser' });

      const finder = new UserDataDirFinder();

      expect(finder).toBeDefined();
    });

    it('should initialize with custom platform and user', () => {
      const finder = new UserDataDirFinder('darwin', 'customuser');

      expect(finder).toBeDefined();
    });
  });

  describe('find()', () => {
    it('should find FoundryVTT directory on Linux', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');

      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = finder.find();

      expect(result).toBe('/home/testuser/.local/share/FoundryVTT');
      expect(console.log).toHaveBeenCalledWith(
        'Found FoundryVTT user data directory: /home/testuser/.local/share/FoundryVTT'
      );
    });

    it('should find FoundryVTT directory on macOS', () => {
      const finder = new UserDataDirFinder('darwin', 'testuser');

      os.homedir.mockReturnValue('/Users/testuser');
      path.join.mockReturnValue('/Users/testuser/Library/Application Support/FoundryVTT');
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = finder.find();

      expect(result).toBe('/Users/testuser/Library/Application Support/FoundryVTT');
    });

    it('should find FoundryVTT directory on Windows', () => {
      const finder = new UserDataDirFinder('win32', 'testuser');

      process.env.LOCALAPPDATA = 'C:\\Users\\testuser\\AppData\\Local';
      path.join.mockReturnValue('C:\\Users\\testuser\\AppData\\Local\\FoundryVTT');
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = finder.find();

      expect(result).toBe('C:\\Users\\testuser\\AppData\\Local\\FoundryVTT');
    });

    it('should return empty string when no directory found', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');

      fs.existsSync.mockReturnValue(false);

      const result = finder.find();

      expect(result).toBe('');
      expect(console.warn).toHaveBeenCalledWith('No FoundryVTT user data directory found');
    });

    it('should return empty array for unknown platform', () => {
      const finder = new UserDataDirFinder('unknown', 'testuser');

      const result = finder.find();

      expect(result).toBe('');
    });

    it('should try multiple paths on Linux', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');

      fs.existsSync
        .mockReturnValueOnce(false) // First path doesn't exist
        .mockReturnValueOnce(true); // Second path exists
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = finder.find();

      expect(result).toBe('/home/testuser/FoundryVTT');
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
    });
  });
});

describe('ModuleDirManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with user data directory and default module ID', () => {
      const manager = new ModuleDirManager('/path/to/foundry');

      expect(manager).toBeDefined();
    });

    it('should initialize with custom module ID', () => {
      const manager = new ModuleDirManager('/path/to/foundry', 'custom-module');

      expect(manager).toBeDefined();
    });
  });

  describe('getModulesDir()', () => {
    it('should throw error when user data directory not found', () => {
      const manager = new ModuleDirManager('');

      expect(() => manager.getModulesDir()).toThrow('User data directory not found');
    });

    it('should return existing modules directory', () => {
      const manager = new ModuleDirManager('/path/to/foundry');

      path.join.mockReturnValue('/path/to/foundry/Data/modules');
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = manager.getModulesDir();

      expect(result).toBe('/path/to/foundry/Data/modules');
      expect(console.log).toHaveBeenCalledWith(
        'Found FoundryVTT modules directory: /path/to/foundry/Data/modules'
      );
    });

    it('should create modules directory if it does not exist', () => {
      const manager = new ModuleDirManager('/path/to/foundry');

      path.join.mockReturnValue('/path/to/foundry/Data/modules');
      fs.existsSync.mockReturnValue(false);

      const result = manager.getModulesDir();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        '/path/to/foundry/Data/modules',
        { recursive: true }
      );
      expect(console.log).toHaveBeenCalledWith(
        'Creating FoundryVTT modules directory: /path/to/foundry/Data/modules'
      );
    });
  });

  describe('getModuleDir()', () => {
    it('should return module directory path', () => {
      const manager = new ModuleDirManager('/path/to/foundry', 'test-module');

      // Mock getModulesDir to return modules path
      path.join
        .mockReturnValueOnce('/path/to/foundry/Data/modules') // For getModulesDir
        .mockReturnValueOnce('/path/to/foundry/Data/modules/test-module'); // For getModuleDir

      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = manager.getModuleDir();

      expect(result).toBe('/path/to/foundry/Data/modules/test-module');
    });

    it('should create module directory if it does not exist', () => {
      const manager = new ModuleDirManager('/path/to/foundry', 'test-module');

      path.join
        .mockReturnValueOnce('/path/to/foundry/Data/modules')
        .mockReturnValueOnce('/path/to/foundry/Data/modules/test-module');

      fs.existsSync
        .mockReturnValueOnce(true) // modules dir exists
        .mockReturnValueOnce(false); // module dir doesn't exist
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const result = manager.getModuleDir();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        '/path/to/foundry/Data/modules/test-module',
        { recursive: true }
      );
    });
  });
});

describe('ModuleBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const builder = new ModuleBuilder();

      expect(builder).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const preBuildAction = vi.fn();
      const postBuildAction = vi.fn();

      const builder = new ModuleBuilder({
        watch: true,
        preBuildAction,
        postBuildAction
      });

      expect(builder).toBeDefined();
    });
  });

  describe('build()', () => {
    it('should start the vite runner', async () => {
      const builder = new ModuleBuilder();

      await builder.build();

      expect(console.log).toHaveBeenCalledWith('Starting module build...');
      expect(mockViteRunner.start).toHaveBeenCalledWith({});
    });
  });

  describe('buildWithWatch()', () => {
    it('should start vite runner with watch mode', async () => {
      const builder = new ModuleBuilder();
      const postBuildAction = vi.fn();

      await builder.buildWithWatch(postBuildAction);

      expect(console.log).toHaveBeenCalledWith('Starting module build with watch mode...');
      expect(mockViteRunner.start).toHaveBeenCalledWith({});
    });
  });
});

describe('ModuleDeployer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with target directory', () => {
      const deployer = new ModuleDeployer('/target');

      expect(deployer).toBeDefined();
    });

    it('should handle missing target directory in constructor', () => {
      const deployer = new ModuleDeployer();

      expect(deployer).toBeDefined();
    });
  });

  describe('deploy()', () => {
    it('should throw error when target directory not specified', () => {
      const deployer = new ModuleDeployer();


      expect(() => deployer.deploy()).toThrow('Target directory not specified for deployment');
    });

    it('should sync TO_DEPLOY items when they exist', () => {
      const deployer = new ModuleDeployer('/target');

      // Mock only module.json exists from TO_DEPLOY array
      fs.existsSync.mockImplementation((filePath) => {
        if (filePath === '/target') return true; // Target directory exists
        if (filePath === '/target/module.json') return false; // Target file doesn't exist yet
        return filePath === './module.json'; // Only source module.json exists
      });
      fs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return { isFile: () => false, isDirectory: () => true };
      });

      // Mock path.join and path.basename
      path.join.mockImplementation((dir, file) => `${dir}/${file}`);
      path.basename.mockImplementation((filePath) => filePath.split('/').pop());

      // Mock Date.prototype.toLocaleString to pass an arbitrary value
      const dateSpy = vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('TEST_TIME');

      deployer.deploy();

      expect(console.log).toHaveBeenCalledWith('Syncing TO_DEPLOY items to /target at TEST_TIME');
      expect(fs.copyFileSync).toHaveBeenCalledWith('./module.json', '/target/module.json');
      expect(console.log).toHaveBeenCalledWith('Synced: module.json');

      dateSpy.mockRestore();
    });

    it('should skip non-existent TO_DEPLOY items', () => {
      const deployer = new ModuleDeployer('/target');

      // Mock no TO_DEPLOY items exist
      fs.existsSync.mockReturnValue(false);

      deployer.deploy();

      expect(console.log).toHaveBeenCalledWith('Skipping ./dist - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./assets - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./public - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./lang - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./packs - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./styles - does not exist');
      expect(console.log).toHaveBeenCalledWith('Skipping ./module.json - does not exist');
    });
  });
});

describe('BuildAndDeploy', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful directory finding
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ isDirectory: () => true });
    os.platform.mockReturnValue('linux');
    os.userInfo.mockReturnValue({ username: 'testuser' });
    path.join.mockImplementation((...parts) => parts.join('/'));

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize successfully when FoundryVTT directory found', () => {
      const buildAndDeploy = new BuildAndDeploy();

      expect(buildAndDeploy).toBeDefined();
    });

    it('should throw error when FoundryVTT directory not found', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => new BuildAndDeploy()).toThrow('Could not find FoundryVTT user data directory');
    });
  });

  describe('start()', () => {
    it('should start build and deploy process', async () => {
      const buildAndDeploy = new BuildAndDeploy();

      await buildAndDeploy.start();

      expect(console.log).toHaveBeenCalledWith('Starting build and deploy process...');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Target module directory:')
      );
      expect(mockViteRunner.start).toHaveBeenCalled();
    });
  });

  describe('Static methods', () => {
    it('should build only without watch', async () => {
      await BuildAndDeploy.buildOnly();

      expect(mockViteRunner.start).toHaveBeenCalledWith({});
    });

    it('should build only with watch', async () => {
      await BuildAndDeploy.buildOnly(true);

      expect(mockViteRunner.start).toHaveBeenCalledWith({});
    });

    it('should deploy only', () => {
  // Ensure consistent platform/user mocks
  os.platform.mockReturnValue('linux');
  os.userInfo.mockReturnValue({ username: 'testuser' });

  // Bypass import-time platform caching by stubbing the finder result directly
  const finderSpy = vi.spyOn(UserDataDirFinder.prototype, 'find').mockReturnValue('/home/testuser/.local/share/FoundryVTT');

      // Setup fs mocks to ensure directory finding works
      fs.existsSync.mockImplementation((filePath) => {
        // Console.log to debug what paths are being checked
        // console.log('Checking path:', filePath);

        // Mock FoundryVTT directory finding (match the exact paths the finder will check)
        if (filePath === '/home/testuser/.local/share/FoundryVTT') return true;
        if (filePath === '/home/testuser/.local/share/FoundryVTT/Data/modules') return true;
        if (filePath === '/home/testuser/.local/share/FoundryVTT/Data/modules/test-module') return true;
        // Mock only module.json exists from TO_DEPLOY array
        if (filePath === './module.json') return true;
        return false;
      });

      fs.statSync.mockImplementation((filePath) => {
        if (filePath === './module.json') {
          return {
            isFile: () => true,
            isDirectory: () => false,
            size: 500,
            mtime: new Date('2023-01-01')
          };
        }
        return { isDirectory: () => true };
      });

      // Ensure readFileSync works for module.json reading
      fs.readFileSync.mockReturnValue(JSON.stringify({ id: 'test-module' }));

      // Mock path operations
      path.join.mockImplementation((...parts) => parts.join('/'));
      path.basename.mockImplementation((filePath) => filePath.split('/').pop());

      BuildAndDeploy.deployOnly();

      expect(fs.copyFileSync).toHaveBeenCalledWith('./module.json', expect.stringContaining('module.json'));

  // cleanup
  finderSpy.mockRestore();
    });

    it('should throw error in deployOnly when directory not found', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => BuildAndDeploy.deployOnly()).toThrow(
        'Could not find FoundryVTT user data directory'
      );
    });
  });
});

describe('Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup successful mocks
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ isDirectory: () => true });
    fs.readdirSync.mockReturnValue(['main.mjs']);
    os.platform.mockReturnValue('linux');
    os.userInfo.mockReturnValue({ username: 'testuser' });
    path.join.mockImplementation((...parts) => parts.join('/'));

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  it('should complete full build and deploy workflow', async () => {
    const buildAndDeploy = new BuildAndDeploy();

    await buildAndDeploy.start();

    // Verify that the process was started
    expect(mockViteRunner.start).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Starting build and deploy process...');
  });

  it('should handle errors gracefully', async () => {
    mockViteRunner.start.mockRejectedValue(new Error('Build failed'));

    const buildAndDeploy = new BuildAndDeploy();

    await expect(buildAndDeploy.start()).rejects.toThrow('Build failed');
  });
});
