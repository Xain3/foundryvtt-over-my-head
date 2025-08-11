/**
 * @file buildAndDeploy.js
 * @description Separates module directory finding, building, and deployment logic
 * @path scripts/dev/buildAndDeploy.js
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

import module from "@module" with { type: "json" };

import ViteRunner from "../build/runViteWIthAction.js";

const PLATFORM = os.platform();
const USER = os.userInfo().username;
const MODULE_DEFAULT_PATH = '/Data/modules';
const MODULE_ID = module.id;
const DIST_PATH = './dist';

/**
 * @class UserDataDirFinder
 * @description Finds the FoundryVTT user data directory across platforms
 */
class UserDataDirFinder {
  #platform;
  #user;

  constructor(platform = PLATFORM, user = USER) {
    this.#platform = platform;
    this.#user = user;
  }

  find() {
    return this.#getUserDataDir();
  }

  #getUserDataDir() {
    const foundryUserdataDirs = this.#getPlatformPaths();

    for (const dir of foundryUserdataDirs) {
      if (this.#dirExists(dir)) {
        console.log(`Found FoundryVTT user data directory: ${dir}`);
        return dir;
      }
    }

    console.warn('No FoundryVTT user data directory found');
    return '';
  }

  #getPlatformPaths() {
    const { #platform: platform, #user: user } = this;

    switch (platform) {
      case 'linux':
        return [
          `/home/${user}/.local/share/FoundryVTT`,
          `/home/${user}/FoundryVTT`,
          `/local/FoundryVTT`
        ];
      case 'darwin':
        return [path.join(os.homedir(), 'Library/Application Support/FoundryVTT')];
      case 'win32':
        return [path.join(process.env.LOCALAPPDATA || '', 'FoundryVTT')];
      default:
        return [];
    }
  }

  #dirExists(dir) {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  }
}

/**
 * @class ModuleDirManager
 * @description Manages module directory creation and validation
 */
class ModuleDirManager {
  #userDataDir;
  #moduleId;

  constructor(userDataDir, moduleId = MODULE_ID) {
    this.#userDataDir = userDataDir;
    this.#moduleId = moduleId;
  }

  getModulesDir() {
    if (!this.#userDataDir) {
      throw new Error('User data directory not found');
    }

    const moduleDirPath = path.join(this.#userDataDir, MODULE_DEFAULT_PATH);
    return this.#ensureDirectory(moduleDirPath, 'modules');
  }

  getModuleDir() {
    const modulesDir = this.getModulesDir();
    const moduleDirPath = path.join(modulesDir, this.#moduleId);
    return this.#ensureDirectory(moduleDirPath, `module '${this.#moduleId}'`);
  }

  #ensureDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      console.log(`Found FoundryVTT ${description} directory: ${dirPath}`);
      return dirPath;
    }

    console.log(`Creating FoundryVTT ${description} directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }
}

/**
 * @class ModuleBuilder
 * @description Handles the building process using ViteRunner
 */
class ModuleBuilder {
  #runner;

  constructor(options = {}) {
    this.#runner = new ViteRunner({
      watch: options.watch || false,
      preBuildAction: options.preBuildAction,
      postBuildAction: options.postBuildAction
    });
  }

  async build() {
    console.log('Starting module build...');
    await this.#runner.start({});
  }

  async buildWithWatch(postBuildAction) {
    console.log('Starting module build with watch mode...');
    const runner = new ViteRunner({
      watch: true,
      postBuildAction
    });
    await runner.start({});
  }
}

/**
 * @class ModuleDeployer
 * @description Handles deployment of built files to the FoundryVTT module directory
 */
class ModuleDeployer {
  #sourceDir;
  #targetDir;

  constructor(sourceDir = DIST_PATH, targetDir) {
    this.#sourceDir = sourceDir;
    this.#targetDir = targetDir;
  }

  deploy() {
    if (!this.#targetDir) {
      throw new Error('Target directory not specified for deployment');
    }

    console.log(`Deploying from ${this.#sourceDir} to ${this.#targetDir}`);
    this.#copyFiles();
  }

  #copyFiles() {
    // Simple file copying - could be enhanced with more sophisticated deployment logic
    if (!fs.existsSync(this.#sourceDir)) {
      console.warn(`Source directory ${this.#sourceDir} does not exist`);
      return;
    }

    // Copy dist files to target directory
    const files = fs.readdirSync(this.#sourceDir);
    for (const file of files) {
      const sourcePath = path.join(this.#sourceDir, file);
      const targetPath = path.join(this.#targetDir, file);

      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied: ${file}`);
      }
    }
  }
}

/**
 * @class BuildAndDeploy
 * @description Orchestrates the build and deployment process
 */
class BuildAndDeploy {
  #userDataDir;
  #moduleDir;
  #builder;
  #deployer;

  constructor() {
    this.#setupDirectories();
    this.#setupComponents();
  }

  #setupDirectories() {
    const userDataFinder = new UserDataDirFinder();
    this.#userDataDir = userDataFinder.find();

    if (!this.#userDataDir) {
      throw new Error('Could not find FoundryVTT user data directory');
    }

    const moduleDirManager = new ModuleDirManager(this.#userDataDir);
    this.#moduleDir = moduleDirManager.getModuleDir();
  }

  #setupComponents() {
    // Create deployer function to be used as post-build action
    this.#deployer = new ModuleDeployer(DIST_PATH, this.#moduleDir);
    const deployAction = () => this.#deployer.deploy();

    // Create builder with deployment as post-build action
    this.#builder = new ModuleBuilder({
      watch: true,
      postBuildAction: deployAction
    });
  }

  async start() {
    console.log('Starting build and deploy process...');
    console.log(`Target module directory: ${this.#moduleDir}`);
    await this.#builder.build();
  }

  // Static methods for individual operations
  static async buildOnly(watch = false) {
    const builder = new ModuleBuilder({ watch });
    await builder.build();
  }

  static deployOnly() {
    const userDataFinder = new UserDataDirFinder();
    const userDataDir = userDataFinder.find();

    if (!userDataDir) {
      throw new Error('Could not find FoundryVTT user data directory');
    }

    const moduleDirManager = new ModuleDirManager(userDataDir);
    const moduleDir = moduleDirManager.getModuleDir();

    const deployer = new ModuleDeployer(DIST_PATH, moduleDir);
    deployer.deploy();
  }
}

// Export classes for individual use
export { UserDataDirFinder, ModuleDirManager, ModuleBuilder, ModuleDeployer, BuildAndDeploy };

// CLI usage if called as main
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--build-only')) {
      await BuildAndDeploy.buildOnly(args.includes('--watch'));
    } else if (args.includes('--deploy-only')) {
      BuildAndDeploy.deployOnly();
    } else {
      const buildAndDeploy = new BuildAndDeploy();
      await buildAndDeploy.start();
    }
  } catch (error) {
    console.error('Failed to execute:', error);
    process.exit(1);
  }
}
