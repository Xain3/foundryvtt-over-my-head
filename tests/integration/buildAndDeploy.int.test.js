/**
 * @file buildAndDeploy.int.test.js
 * @description Integration tests for buildAndDeploy scripts
 * @path tests/integration/buildAndDeploy.int.test.js
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

// Mock external dependencies but allow real file operations for testing
jest.mock('child_process');

describe('BuildAndDeploy Integration Tests', () => {
  let tempDir;
  let mockFoundryDir;
  let mockModulesDir;
  let mockModuleDir;
  let mockDistDir;
  let originalCwd;

  beforeAll(() => {
    // Save original working directory
    originalCwd = process.cwd();
    
    // Create temporary directories for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildanddeploy-test-'));
    mockFoundryDir = path.join(tempDir, 'FoundryVTT');
    mockModulesDir = path.join(mockFoundryDir, 'Data', 'modules');
    mockModuleDir = path.join(mockModulesDir, 'test-module');
    mockDistDir = path.join(tempDir, 'project', 'dist');

  // Create directory structure
    fs.mkdirSync(mockModuleDir, { recursive: true });
    fs.mkdirSync(mockDistDir, { recursive: true });

    // Create test files in dist
    fs.writeFileSync(path.join(mockDistDir, 'main.js'), 'console.log("test");');
    fs.writeFileSync(path.join(mockDistDir, 'style.css'), 'body { color: red; }');

    // Create mock module.json
    const moduleJson = {
      id: 'test-module',
      name: 'Test Module',
      version: '1.0.0'
    };
    fs.writeFileSync(
      path.join(tempDir, 'project', 'module.json'),
      JSON.stringify(moduleJson, null, 2)
    );

    // Change cwd to the temp project so ModuleDeployer picks up TO_DEPLOY (./dist, ./module.json)
    process.chdir(path.join(tempDir, 'project'));
  });

  afterAll(() => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock spawn to return a mock process
    const mockProcess = {
      stdout: {
        setEncoding: jest.fn(),
        on: jest.fn()
      },
      stderr: {
        setEncoding: jest.fn(),
        on: jest.fn()
      },
      on: jest.fn(),
      kill: jest.fn()
    };
    spawn.mockReturnValue(mockProcess);

    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Create mock module.json in the project root for testing
    if (!fs.existsSync('module.json')) {
      const moduleJson = {
        id: 'test-module',
        name: 'Test Module',
        version: '1.0.0'
      };
      fs.writeFileSync('module.json', JSON.stringify(moduleJson, null, 2));
    }
  });

  describe('ModuleDeployer Integration', () => {
    it('should actually copy files from source to target', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.js');

  const deployer = new ModuleDeployer(mockModuleDir);
  expect(() => deployer.deploy()).not.toThrow();

  // Verify files were copied under preserved directory structure (dist)
  expect(fs.existsSync(path.join(mockModuleDir, 'dist', 'main.js'))).toBe(true);
  expect(fs.existsSync(path.join(mockModuleDir, 'dist', 'style.css'))).toBe(true);

      // Verify file contents
  const mainJs = fs.readFileSync(path.join(mockModuleDir, 'dist', 'main.js'), 'utf8');
  const styleCss = fs.readFileSync(path.join(mockModuleDir, 'dist', 'style.css'), 'utf8');

      expect(mainJs).toBe('console.log("test");');
      expect(styleCss).toBe('body { color: red; }');
    });

    it('should handle non-existent source directory gracefully', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.js');
  // Remove dist so it's missing from TO_DEPLOY
  if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });

  const deployer = new ModuleDeployer(mockModuleDir);
  expect(() => deployer.deploy()).not.toThrow();
  // New behavior logs skipping missing sources to console.log
  expect(console.log).toHaveBeenCalledWith('Skipping ./dist - does not exist');
    });
  });

  describe('ModuleDirManager Integration', () => {
    it('should create real directories when they do not exist', async () => {
      const { ModuleDirManager } = await import('../../scripts/dev/buildAndDeploy.js');

      const newModuleDir = path.join(mockModulesDir, 'new-test-module');
      
      // Ensure directory doesn't exist
      if (fs.existsSync(newModuleDir)) {
        fs.rmSync(newModuleDir, { recursive: true });
      }

      const manager = new ModuleDirManager(mockFoundryDir, 'new-test-module');
      const result = manager.getModuleDir();

      expect(result).toBe(newModuleDir);
      expect(fs.existsSync(newModuleDir)).toBe(true);
      expect(fs.statSync(newModuleDir).isDirectory()).toBe(true);
    });
  });

  describe('File System Integration', () => {
    it('should handle large files', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.js');

      // Create a larger test file
      const largeContent = 'x'.repeat(1024 * 100); // 100KB file (reduced for faster tests)
      const largeFilePath = path.join(mockDistDir, 'large-file.js');
      // The previous test may remove the `dist` directory; recreate it if needed
      if (!fs.existsSync(mockDistDir)) {
        fs.mkdirSync(mockDistDir, { recursive: true });
      }
      fs.writeFileSync(largeFilePath, largeContent);

  const deployer = new ModuleDeployer(mockModuleDir);
  expect(() => deployer.deploy()).not.toThrow();

      // Verify large file was copied correctly
  const copiedFilePath = path.join(mockModuleDir, 'dist', 'large-file.js');
      expect(fs.existsSync(copiedFilePath)).toBe(true);
      
      const copiedContent = fs.readFileSync(copiedFilePath, 'utf8');
      expect(copiedContent).toBe(largeContent);
      expect(copiedContent.length).toBe(1024 * 100);
    });

    it('should handle empty directories', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.js');

  // Create empty source directory that is in TO_DEPLOY list, e.g., ./assets
  const emptyAssetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(emptyAssetsDir)) fs.mkdirSync(emptyAssetsDir);

  const deployer = new ModuleDeployer(mockModuleDir);
  expect(() => deployer.deploy()).not.toThrow();
  // Expect that the empty directory is created at target
  expect(fs.existsSync(path.join(mockModuleDir, 'assets'))).toBe(true);
  // And log mentions syncing
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Syncing TO_DEPLOY items to'));
    });
  });
});
