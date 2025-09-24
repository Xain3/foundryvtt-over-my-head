/**
 * @file hooksLogger.mjs
 * @description This file contains the HooksLogger class that provides utilities for logging and debugging Foundry VTT hook calls.
 * @path src/utils/static/hooksLogger.mjs
 */

/**
 * Static utility class for logging and debugging Foundry VTT hook calls.
 * Provides proxy methods to intercept hook calls for debugging purposes.
 *
 * @class HooksLogger
 * @export
 *
 * @example
 * // Proxy the Hooks.call function to log all hook calls
 * const originalHooksCall = Hooks.call;
 * Hooks.call = HooksLogger.createHookProxy(originalHooksCall, { logLevel: 'debug' });
 *
 * @example
 * // Proxy a custom hook function
 * const myHookFunction = (hookName, ...args) => console.log(`Custom hook: ${hookName}`);
 * const proxiedFunction = HooksLogger.createHookProxy(myHookFunction);
 *
 * @since 1.0.0
 */
class HooksLogger {
  /**
   * Creates a proxy for a hook function that logs hook calls while preserving the original functionality.
   * This method modifies the hookFunction object in-place by assigning the proxy to it.
   * This method is useful for debugging hook interactions in Foundry VTT modules.
   *
   * @static
   * @param {Object} hookObject - The object containing the hook function to proxy
   * @param {string} functionName - The name of the function property to proxy
   * @param {Object} [options={}] - Configuration options for the proxy
   * @param {string} [options.logLevel='log'] - The console log level to use ('log', 'debug', 'info', 'warn', 'error')
   * @param {boolean} [options.logArgs=true] - Whether to log hook arguments
   * @param {boolean} [options.logResult=false] - Whether to log the hook function result
   * @param {string} [options.prefix='Hook triggered'] - The prefix for log messages
   * @param {Function} [options.filter] - Optional filter function to determine which hooks to log
   * @param {boolean} [options.returnProxy=false] - Whether to return the proxy instead of assigning it
   * @returns {Function|void} Returns the proxy if returnProxy is true, otherwise void
   * @throws {TypeError} If hookObject is not an object or hookObject[functionName] is not a function
   *
   * @example
   * // Basic usage - modifies Hooks.call in-place
   * HooksLogger.createHookProxy(Hooks, 'call');
   *
   * @example
   * // With custom options
   * HooksLogger.createHookProxy(Hooks, 'call', {
   *   logLevel: 'debug',
   *   prefix: 'OMH Hook',
   *   logResult: true,
   *   filter: (hookName) => hookName.startsWith('OMH.')
   * });
   *
   * @example
   * // Get the proxy without modifying the original
   * const proxy = HooksLogger.createHookProxy(Hooks, 'call', { returnProxy: true });
   *
   * @example
   * // Enabling hook logging for debugging
   * if (game?.modules?.get('foundryvtt-over-my-head')?.debugMode) {
   *   HooksLogger.createHookProxy(Hooks, 'call', { logLevel: 'debug' });
   * }
   */
  static createHookProxy(hookObject, functionName, {
    logLevel = 'log',
    logArgs = true,
    logResult = false,
    prefix = 'Hook triggered',
    filter = null,
    returnProxy = false
  } = {}) {
    if (hookObject == null || typeof hookObject[functionName] !== 'function') {
      throw new TypeError(`HooksLogger.createHookProxy: hookObject must have a function property '${functionName}'`);
    }

    const originalFunction = hookObject[functionName];

    const proxy = new Proxy(originalFunction, {
      apply(target, thisArg, args) {
        const hookName = args[0];
        const hookArgs = args.slice(1);

        // Apply filter if provided
        if (filter && typeof filter === 'function' && !filter(hookName)) {
          return Reflect.apply(target, thisArg, args);
        }

        // Log the hook call
        const logMessage = logArgs
          ? `${prefix}: ${hookName}`
          : `${prefix}: ${hookName} (args hidden)`;

        const logData = logArgs ? hookArgs : undefined;

        // Map logLevel to the corresponding console method
        const LOG_METHODS = {
          log: console.log,
          debug: console.debug,
          info: console.info,
          warn: console.warn,
          error: console.error
        };
        const logMethod = LOG_METHODS[logLevel] || console.log;

        if (logArgs && hookArgs.length > 0) {
          logMethod(logMessage, logData);
        } else {
          logMethod(logMessage);
        }

        // Execute the original function and capture result
        const result = Reflect.apply(target, thisArg, args);

        // Log result if requested
        if (logResult) {
          console[logLevel](`${prefix} result for ${hookName}:`, result);
        }

        return result;
      }
    });

    // Assign the proxy to the original function unless returnProxy is true
    if (!returnProxy) {
      hookObject[functionName] = proxy;
    }

    return returnProxy ? proxy : undefined;
  }

  /**
   * Creates a simple hook logger that logs hook calls without modifying the original function.
   * This is useful when you want to monitor hooks without replacing the original implementation.
   *
   * @static
   * @param {string} [logLevel='debug'] - The console log level to use
   * @param {string} [prefix='Hook Call'] - The prefix for log messages
   * @param {Function} [filter] - Optional filter function to determine which hooks to log
   * @returns {Function} A function that can be used as a hook listener to log hook calls
   *
   * @example
   * // Log all hooks that start with 'OMH.'
   * const logger = HooksLogger.createHookLogger('debug', 'OMH Hook',
   *   (hookName) => hookName.startsWith('OMH.')
   * );
   *
   * // Use as a hook listener
   * Hooks.on('OMH.ready', logger);
   * Hooks.on('OMH.contextUpdate', logger);
   */
  static createHookLogger(logLevel = 'debug', prefix = 'Hook Call', filter = null) {
    return function hookLogger(hookName, ...args) {
      // Apply filter if provided
      if (filter && typeof filter === 'function' && !filter(hookName)) {
        return;
      }

      const logMessage = `${prefix}: ${hookName}`;

      if (console[logLevel] && typeof console[logLevel] === 'function') {
        if (args.length > 0) {
          console[logLevel](logMessage, args);
        } else {
          console[logLevel](logMessage);
        }
      } else {
        console.log(logMessage, args);
      }
    };
  }

  /**
   * Convenience method for proxying Foundry VTT's Hooks functions with debugging options.
   * Modifies the Hooks object in-place by replacing the specified functions with proxies.
   *
   * @static
   * @param {Object} [options={}] - Configuration options for the proxies
   * @param {boolean} [options.enabled=true] - Whether to enable hook logging
   * @param {string} [options.logLevel='debug'] - The console log level to use
   * @param {string} [options.moduleFilter] - Optional module prefix to filter hooks by
   * @param {Object<string, boolean>} [options.functions={call:true,callAll:true}] - Which Hooks methods to proxy
   * @returns {boolean} True if any functions were successfully proxied, false otherwise
   *
   * @example
   * // Enable hook logging for debugging (modifies Hooks in-place)
   * Hooks.once('init', () => {
   *   if (debugMode) {
   *     HooksLogger.proxyFoundryHooks({ moduleFilter: 'OMH.' });
   *   }
   * });
   *
   * @example
   * // Enable logging for specific functions only
   * Hooks.once('init', () => {
   *   HooksLogger.proxyFoundryHooks({
   *     functions: { call: true, callAll: false },
   *     logLevel: 'warn'
   *   });
   * });
   */
  static proxyFoundryHooks({
    enabled = true,
    logLevel = 'debug',
    moduleFilter = null,
    functions = {"call": true, "callAll": true}
  } = {}) {
    // Early exits - check if Hooks exists and is an object
    if (!HooksLogger.#validateHooksPresence(enabled, functions)) {
      if (typeof Hooks === 'undefined' || Hooks === null) {
        console.warn('HooksLogger: Hooks object is not available. Use Hooks.once("init", () => { ... }) to ensure proper timing.');
      }
      return false;
    }

    const filter = moduleFilter
      ? (hookName) => hookName.startsWith(moduleFilter)
      : null;

    const proxyOptions = {
      logLevel,
      prefix: 'Foundry Hook',
      logArgs: true,
      logResult: false,
      filter
    };

    // Proxy each requested Hooks function that exists
    let proxiedAny = false;
    for (const fnName of Object.keys(functions)) {
      if (functions[fnName] && typeof Hooks[fnName] === 'function') {
        try {
          this.createHookProxy(Hooks, fnName, proxyOptions);
          proxiedAny = true;
        } catch (error) {
          console.warn(`HooksLogger: Failed to proxy Hooks.${fnName}:`, error);
        }
      }
    }

    return proxiedAny;
  }

  static #validateHooksPresence(enabled, functions) {
    let output = true;
    if (!enabled) {
      output = false;
      console.warn('HooksLogger: Hook logging is disabled.');
    }
    if (!functions || Object.keys(functions).length === 0) {
      output = false;
      console.warn('HooksLogger: No functions specified for proxying.');
    }
    if (typeof Hooks === 'undefined' || Hooks == null) {
      output = false;
      console.warn('HooksLogger: Hooks object is not available.');
      return output; // Early return to avoid accessing undefined Hooks
    }
    // Duck type check - ensure Hooks has the core methods we expect
    if (!['on', 'once', 'call'].every(fn => typeof Hooks[fn] === 'function')) {
      output = false;
      console.warn('HooksLogger: Hooks object is missing required methods (on, once, call).');
    }
    return output;
  }

  /**
   * Gets information about the HooksLogger utility.
   *
   * @static
   * @returns {Object} Object containing utility information
   *
   * @example
   * const info = HooksLogger.getUtilityInfo();
   * console.log(info.description); // "Hook logging and debugging utilities for Foundry VTT"
   */
  static getUtilityInfo() {
    return {
      name: 'HooksLogger',
      version: '1.0.0',
      description: 'Hook logging and debugging utilities for Foundry VTT',
      methods: ['createHookProxy', 'createHookLogger', 'proxyFoundryHooks', 'isHooksAvailable', 'getUtilityInfo']
    };
  }

  /**
   * Checks if the Foundry VTT Hooks object is available and ready for proxying.
   *
   * @static
   * @returns {boolean} True if Hooks is available and has the required methods, false otherwise
   *
   * @example
   * if (HooksLogger.isHooksAvailable()) {
   *   HooksLogger.proxyFoundryHooks();
   * } else {
   *   // Use Hooks.once('init') for proper timing
   *   Hooks.once('init', () => HooksLogger.proxyFoundryHooks());
   * }
   */
  static isHooksAvailable() {
    return typeof Hooks !== 'undefined' &&
          Hooks != null &&
          ['on', 'once', 'call'].every(fn => typeof Hooks[fn] === 'function');
  }
}

export default HooksLogger;