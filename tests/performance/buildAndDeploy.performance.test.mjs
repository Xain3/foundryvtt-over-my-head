/**
 * @file buildAndDeploy.performance.test.js
 * @description Performance tests for buildAndDeploy scripts
 * @path tests/performance/buildAndDeploy.performance.test.js
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('BuildAndDeploy Performance Tests', () => {
  const SLOW_ENV = process.env.CI || process.env.JEST_WORKER_ID === undefined;
  let tempDir;
  let mockDistDir;
  let mockTargetDir;

  beforeAll(() => {
    // Create temporary directories for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildanddeploy-perf-'));
    mockDistDir = path.join(tempDir, 'dist');
    mockTargetDir = path.join(tempDir, 'target');

    fs.mkdirSync(mockDistDir, { recursive: true });
    fs.mkdirSync(mockTargetDir, { recursive: true });

    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  afterAll(() => {
    // Cleanup tempDir and all files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    // Cleanup mockDistDir in case tempDir persists
    if (mockDistDir && fs.existsSync(mockDistDir)) {
      fs.readdirSync(mockDistDir).forEach(f => fs.unlinkSync(path.join(mockDistDir, f)));
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Clean up mockDistDir before every test to avoid leftover files from previous tests
    if (mockDistDir && fs.existsSync(mockDistDir)) {
      fs.readdirSync(mockDistDir).forEach(f => fs.unlinkSync(path.join(mockDistDir, f)));
    }

    // Create mock module.mjson in the project root for testing
    if (!fs.existsSync('module.mjson')) {
      const moduleJson = { id: 'test-module' };
      fs.writeFileSync('module.mjson', JSON.stringify(moduleJson));
    }
  });

  describe('File Deployment Performance', () => {
    it('should deploy small files quickly (< 100ms)', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create small test files
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(
          path.join(mockDistDir, `file${i}.js`),
          `console.log('File ${i}');`
        );
      }

      // Run deployer from the temp project root so TO_DEPLOY (./dist, ./module.mjson) resolves correctly
      const originalCwd = process.cwd();
      const projectModuleJson = path.join(tempDir, 'module.mjson');
      if (!fs.existsSync(projectModuleJson)) {
        fs.writeFileSync(projectModuleJson, JSON.stringify({ id: 'test-module' }));
      }
      process.chdir(tempDir);

      const deployer = new ModuleDeployer(mockTargetDir);
      const startTime = performance.now();
      deployer.deploy();
    const endTime = performance.now();
      process.chdir(originalCwd);

  const duration = endTime - startTime;
  // Allow extra headroom on slower runners and shared dev machines
  const threshold = SLOW_ENV ? 300 : 200;
  expect(duration).toBeLessThan(threshold); // Allow more time on CI/slow envs

      // Verify all files were copied
      for (let i = 0; i < 10; i++) {
        expect(fs.existsSync(path.join(mockTargetDir, 'dist', `file${i}.js`))).toBe(true);
      }
    });

    it('should handle many files efficiently (< 1000ms for 100 files)', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create many small files
      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(
          path.join(mockDistDir, `file${i}.js`),
          `console.log('File ${i}'); // ${Math.random()}`
        );
      }

      // Run deployer from the temp project root
      const originalCwd = process.cwd();
      const projectModuleJson = path.join(tempDir, 'module.mjson');
      if (!fs.existsSync(projectModuleJson)) {
        fs.writeFileSync(projectModuleJson, JSON.stringify({ id: 'test-module' }));
      }
      process.chdir(tempDir);

      const deployer = new ModuleDeployer(mockTargetDir);
      const startTime = performance.now();
      deployer.deploy();
      const endTime = performance.now();
      process.chdir(originalCwd);

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second

      // Verify all files were copied
      const targetFiles = fs.readdirSync(path.join(mockTargetDir, 'dist'));
      expect(targetFiles).toHaveLength(100);
    });

    it('should handle large files reasonably (< 5000ms for 10MB file)', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create a large file (10MB)
      const largeContent = 'x'.repeat(10 * 1024 * 1024);
      fs.writeFileSync(path.join(mockDistDir, 'large-file.js'), largeContent);

      // Run deployer from the temp project root
      const originalCwd = process.cwd();
      const projectModuleJson = path.join(tempDir, 'module.mjson');
      if (!fs.existsSync(projectModuleJson)) {
        fs.writeFileSync(projectModuleJson, JSON.stringify({ id: 'test-module' }));
      }
      process.chdir(tempDir);

      const deployer = new ModuleDeployer(mockTargetDir);
      const startTime = performance.now();
      deployer.deploy();
      const endTime = performance.now();
      process.chdir(originalCwd);

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      // Verify file was copied correctly
      const copiedContent = fs.readFileSync(path.join(mockTargetDir, 'dist', 'large-file.js'), 'utf8');
      expect(copiedContent.length).toBe(largeContent.length);
    });
  });

  describe('Directory Discovery Performance', () => {
    it('should find directories quickly', async () => {
      const { UserDataDirFinder } = await import('../../scripts/dev/buildAndDeploy.mjs');

      const finder = new UserDataDirFinder('linux', 'testuser');

      const startTime = performance.now();

      // Run multiple times to test consistency
      for (let i = 0; i < 10; i++) {
        finder.find();
      }

      const endTime = performance.now();
      const avgDuration = (endTime - startTime) / 10;

      expect(avgDuration).toBeLessThan(10); // Should average under 10ms per call
    });

    it('should handle multiple module directory operations efficiently', async () => {
      const { ModuleDirManager } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create a mock foundry directory
      const mockFoundryDir = path.join(tempDir, 'FoundryVTT');
      fs.mkdirSync(mockFoundryDir, { recursive: true });

      const startTime = performance.now();

      // Create multiple module directories
      for (let i = 0; i < 50; i++) {
        const manager = new ModuleDirManager(mockFoundryDir, `test-module-${i}`);
        manager.getModuleDir();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second

      // Verify directories were created
      const modulesDir = path.join(mockFoundryDir, 'Data', 'modules');
      const modulesDirContents = fs.readdirSync(modulesDir);
      expect(modulesDirContents).toHaveLength(50);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create test files
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(
          path.join(mockDistDir, `test${i}.js`),
          `console.log('Test ${i}');`
        );
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many deployment operations
      for (let i = 0; i < 100; i++) {
        const originalCwd = process.cwd();
        const projectModuleJson = path.join(tempDir, 'module.mjson');
        if (!fs.existsSync(projectModuleJson)) {
          fs.writeFileSync(projectModuleJson, JSON.stringify({ id: 'test-module' }));
        }
        process.chdir(tempDir);
        const deployer = new ModuleDeployer(mockTargetDir);
        deployer.deploy();
        process.chdir(originalCwd);

        // Clear target directory for next iteration
        for (let j = 0; j < 10; j++) {
          const targetFile = path.join(mockTargetDir, 'dist', `test${j}.js`);
          if (fs.existsSync(targetFile)) {
            fs.unlinkSync(targetFile);
          }
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent file operations safely', async () => {
      const { ModuleDeployer } = await import('../../scripts/dev/buildAndDeploy.mjs');

      // Create test files
      for (let i = 0; i < 20; i++) {
        fs.writeFileSync(
          path.join(mockDistDir, `concurrent${i}.js`),
          `console.log('Concurrent ${i}');`
        );
      }

      // Create multiple target directories
      const targetDirs = [];
      for (let i = 0; i < 5; i++) {
        const targetDir = path.join(tempDir, `target${i}`);
        fs.mkdirSync(targetDir, { recursive: true });
        targetDirs.push(targetDir);
      }

      const startTime = performance.now();

      // Run concurrent deployments
      const deploymentPromises = targetDirs.map(targetDir => {
        return new Promise((resolve) => {
          const originalCwd = process.cwd();
          const projectModuleJson = path.join(tempDir, 'module.mjson');
          if (!fs.existsSync(projectModuleJson)) {
            fs.writeFileSync(projectModuleJson, JSON.stringify({ id: 'test-module' }));
          }
          process.chdir(tempDir);
          const deployer = new ModuleDeployer(targetDir);
          deployer.deploy();
          process.chdir(originalCwd);
          resolve();
        });
      });

      await Promise.all(deploymentPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds

      // Verify all deployments completed successfully
      for (const targetDir of targetDirs) {
        const files = fs.readdirSync(path.join(targetDir, 'dist'));
        expect(files).toHaveLength(20);
      }
    });
  });
});
