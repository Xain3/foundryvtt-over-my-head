/**
 * @file buildAndDeploy.mjs
 * @description Orchestrates module directory finding, building, and deployment logic
 * @path .dev/scripts/deployment/buildAndDeploy.mjs
 */

import UserDataDirFinder from '../utilities/userDataDirFinder.mjs';
import ModuleDirManager from '../utilities/moduleDirManager.mjs';
import ModuleBuilder from '../build/moduleBuilder.mjs';
import ModuleDeployer from './deployer.mjs';
import { removeRootBuildArtifacts } from '../build/buildUtils.mjs';

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
    this.#deployer = new ModuleDeployer(this.#moduleDir);
    const deployAction = async () => {
      // Ensure no duplicate root artifacts linger between builds in dev
      removeRootBuildArtifacts();
      this.#deployer.deploy();
      // Run a delayed cleanup in case any late writes occurred
      setTimeout(() => removeRootBuildArtifacts(), 250);
    };

    // Create builder with deployment as post-build action
    this.#builder = new ModuleBuilder({
      watch: true,
      preBuildAction: removeRootBuildArtifacts,
      postBuildAction: deployAction,
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

    const deployer = new ModuleDeployer(moduleDir);
    deployer.deploy();
  }
}

// Export main orchestrator class and re-export individual classes for convenience
export {
  UserDataDirFinder,
  ModuleDirManager,
  ModuleBuilder,
  ModuleDeployer,
  BuildAndDeploy,
};

// CLI usage if called as main
const isMain =
  process.argv[1] && process.argv[1].endsWith('buildAndDeploy.mjs');
if (isMain) {
  (async () => {
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
      console.error('Build and deploy failed:', error);
      process.exit(1);
    }
  })();
}
