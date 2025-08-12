/**
 * @file moduleBuilder.js
 * @description Handles the building process using ViteRunner
 * @path scripts/dev/moduleBuilder.js
 */

import ViteRunner from "../build/runViteWIthAction.js";

/**
 * @class ModuleBuilder
 * @description Handles the building process using ViteRunner with configurable options.
 * Supports both one-time builds and watch mode for development.
 * Allows custom pre-build and post-build actions to be executed.
 * 
 * @export ModuleBuilder
 * 
 * Public API:
 * - constructor(options?) - Creates a new builder instance
 * - build() - Performs a one-time build
 * - buildWithWatch(postBuildAction?) - Starts build in watch mode
 * 
 * Options:
 * - watch: boolean - Enable watch mode (default: false)
 * - preBuildAction: function - Action to run before build
 * - postBuildAction: function - Action to run after build
 * 
 * @example
 * ```javascript
 * const builder = new ModuleBuilder({
 *   watch: true,
 *   postBuildAction: () => console.log('Build complete!')
 * });
 * await builder.build();
 * ```
 */
class ModuleBuilder {
  #runner;

  /**
   * @param {Object} [options={}] - Build configuration options
   * @param {boolean} [options.watch=false] - Enable watch mode
   * @param {Function} [options.preBuildAction] - Function to execute before build
   * @param {Function} [options.postBuildAction] - Function to execute after build
   */
  constructor(options = {}) {
    this.#runner = new ViteRunner({
      watch: options.watch || false,
      preBuildAction: options.preBuildAction,
      postBuildAction: options.postBuildAction
    });
  }

  /**
   * Starts the build process using the configured ViteRunner.
   * @async
   * @returns {Promise<void>} Promise that resolves when build is complete
   * @throws {Error} When build process fails
   */
  async build() {
    console.log('Starting module build...');
    await this.#runner.start({});
  }

  /**
   * Starts the build process in watch mode with a custom post-build action.
   * Creates a new ViteRunner instance specifically for watch mode.
   * @async
   * @param {Function} [postBuildAction] - Function to execute after each build
   * @returns {Promise<void>} Promise that resolves when watch mode is started
   * @throws {Error} When watch build process fails
   */
  async buildWithWatch(postBuildAction) {
    console.log('Starting module build with watch mode...');
    const runner = new ViteRunner({
      watch: true,
      postBuildAction
    });
    await runner.start({});
  }
}

export default ModuleBuilder;
