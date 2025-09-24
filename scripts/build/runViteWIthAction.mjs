/**
 * @file runViteWIthAction.mjs
 * @description Runs `vite build --watch` and triggers a custom action after each build.
 * @path scripts/build/runViteWIthAction.mjs
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { extname, resolve } from 'path';


/**
 * @class ViteRunner
 * @description Runs `vite build --watch` and triggers custom actions after each build. Allows quitting with 'q'.
 * @export
 */
class ViteRunner {
  /**
   * @param {Function|string} [preBuildAction=null] - Action to run before starting Vite. Can be a function, .sh script path, or .mjs module path.
   * @param {Function|string} [postBuildAction=null] - Action to run after each build. Can be a function, .sh script path, or .mjs module path.
   */
  constructor({watch = false, preBuildAction = null, postBuildAction = null}) {
    this.watch = watch;
    this.preBuildAction = preBuildAction;
    this.postBuildAction = postBuildAction;
    this.isBuilding = false;
    this.quitRequested = false;
    this.vite = null;
  }

  /**
   * Starts the Vite watcher process and sets up listeners.
   * @export
   */
  async start({
    watch = this.watch,
    preBuildAction = this.preBuildAction,
    postBuildAction = this.postBuildAction}) {
  const args = await this.#generateBuildArgs(watch, preBuildAction);
  // Force cwd and explicit config to avoid accidental root-level outputs
  this.vite = spawn('npx', args, { cwd: process.cwd() });

    this.vite.stdout.setEncoding('utf8');
    this.vite.stderr.setEncoding('utf8');

    this.vite.stdout.on('data', (data) => this.#handleStdout(data, postBuildAction));
    this.vite.stderr.on('data', (data) => process.stderr.write(data));
    this.vite.on('close', (code) => this.#handleClose(code));

    this.#listenForQuit();
  }

  async #generateBuildArgs(watch, preBuildAction) {
  const args = ['vite', 'build'];
    if (watch) {
      args.push('--watch');
    }
  // Always pass the explicit config file to avoid picking up other configs
  const configPath = resolve(process.cwd(), 'vite.config.mjs');
  args.push('--config', configPath);
    if (preBuildAction) {
      try {
        await this.#executeAction(preBuildAction);
      } catch (error) {
        console.error('Pre-build action failed:', error);
        throw error;
      }
    }
    return args;
  }

  /**
   * Executes an action that can be a function, shell script (.sh), or Node.mjs module (.mjs).
   * @param {Function|string} action - The action to execute.
   * @private
   */
  async #executeAction(action) {
    try {
      if (typeof action === 'function') {
        return await action();
      }

      if (typeof action === 'string') {
        const actionPath = resolve(action);
        if (!existsSync(actionPath)) {
          throw new Error(`Action file not found: ${actionPath}`);
        }

        const ext = extname(actionPath);

        if (ext === '.sh') {
          return new Promise((resolve, reject) => {
            const proc = spawn('sh', [actionPath], { stdio: 'inherit' });
            proc.on('close', (code) => {
              if (code === 0) resolve();
              else reject(new Error(`Shell script exited with code ${code}`));
            });
          });
        } else if (ext === '.mjs') {
          const module = await import(actionPath);
          if (typeof module.default === 'function') {
            return await module.default();
          } else if (typeof module.run === 'function') {
            return await module.run();
          } else {
            throw new Error(`No default export or run function found in ${actionPath}`);
          }
        } else {
          throw new Error(`Unsupported action file type: ${ext}. Only .sh and .mjs are supported.`);
        }
      }
    } catch (error) {
      console.error(`Action execution failed:`, error);
      throw error;
    }
  }

  /**
   * Handles stdout from the Vite process.
   * @param {string} data
   * @private
   */
  async #handleStdout(data, postBuildAction) {
    process.stdout.write(data);
    if (data.includes('building') || data.includes('build started')) {
      this.isBuilding = true;
    }
    // More specific Vite completion detection
    if (data.includes('✓ built in') || data.match(/built in \d+ms/) || data.includes('build completed')) {
      if (this.quitRequested) return this.#shutdown();
      this.isBuilding = false;
      if (postBuildAction) {
        try {
          await this.#executeAction(postBuildAction);
        } catch (error) {
          console.error('Post-build action failed:', error);
          // Continue execution despite post-build failure
        }
      }
    }
  }

  #shutdown(message = 'Build finished. Exiting Vite watch...') {
    console.log(message);
    this.vite.kill();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  }

  /**
   * Handles Vite process close event.
   * @param {number} code
   * @private
   */
  #handleClose(code) {
    console.log(`Vite process exited with code ${code}`);
    process.exit(code);
  }

  /**
   * Listens for 'q' on stdin to quit the watcher.
   * @private
   */
  #listenForQuit() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      console.log("Press 'q' to quit Vite watch...");
      process.stdin.on('data', (key) => {
        if (key === 'q') this.#handleQuitRequest();
      });
    }
  }

  #handleQuitRequest() {
    const message = "'q' pressed. Exiting Vite watch...";
    this.isBuilding ? this.#queueExitAfterBuild() : this.#shutdown(message);
  }

  #queueExitAfterBuild() {
    console.log("'q' pressed. Waiting for build to finish before exiting...");
    this.quitRequested = true;
  }
}


export default ViteRunner;

// CLI usage if called as main
const isMain = process.argv[1] && process.argv[1].endsWith('runViteWIthAction.mjs');
if (isMain) {
  // Simple argument parsing
  const args = process.argv.slice(2);
  let showHelp = false;
  let watch = false;
  let preBuildAction = null;
  let postBuildAction = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--watch' || arg === '-w') {
      watch = true;
    } else if (arg === '--pre-action' && i + 1 < args.length) {
      preBuildAction = args[++i];
    } else if (arg === '--post-action' && i + 1 < args.length) {
      postBuildAction = args[++i];
    }
  }

  if (showHelp) {
    console.log(`
Usage: node runViteWIthAction.mjs [options]

Options:
  --help, -h                 Show this help message
  --watch, -w                Run vite in watch mode (default: off)
  --pre-action <path>        Path to script/module to run before build (.sh or .mjs)
  --post-action <path>       Path to script/module to run after each build (.sh or .mjs)

Description:
  Runs vite build (optionally with --watch) and triggers custom actions before/after builds.
  Actions can be shell scripts (.sh) or Node.mjs modules (.mjs).
  Press 'q' to quit the watcher.

Examples:
  node runViteWIthAction.mjs --watch
  node runViteWIthAction.mjs --watch --post-action ./scripts/deploy.sh
  node runViteWIthAction.mjs --pre-action ./setup.mjs --post-action ./cleanup.sh
`);
    process.exit(0);
  }

  const runner = new ViteRunner({ watch, preBuildAction, postBuildAction });
  runner.start({}).catch(error => {
    console.error('Failed to start ViteRunner:', error);
    process.exit(1);
  });
}


