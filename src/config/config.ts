/**
 * @file Config Service
 * @description Centralized configuration singleton for the Vision with Fade module
 * @path src/config/config.ts
 */

import {
  loadYamlFiles,
  mergeConstants,
  extractConfigPrefix,
  loadSettings,
  loadModuleManifest,
  loadEnvironmentVariables,
} from './helpers/configHelpers.ts';
import { cloneDeep } from 'lodash';

/**
 * Configuration interface
 * @typedef {Object} Config
 * @property {Record<string, unknown>} constants - Merged YAML constants from all constant files
 * @property {unknown} settings - Settings definitions array
 * @property {Record<string, unknown>} module - Module manifest from module.json
 * @property {Record<string, string>} env - Environment variables matching prefix pattern
 * @property {string} toString - Method to serialize config to string
 */

/**
 * Centralized Configuration Service (Singleton)
 *
 * Loads and aggregates:
 * - YAML constant files from src/config/constants/
 * - Settings definitions from src/config/settings/settings.yaml
 * - Module manifest from module.json
 * - Environment variables matching the module prefix pattern
 *
 * The singleton is frozen after initialization to prevent runtime modifications.
 * Fail-fast error handling ensures configuration issues are caught immediately.
 *
 * @class Config
 * @example
 * import { config } from './config.ts';
 *
 * // All configuration is accessible immediately
 * console.log(config.module.id); // "vision-with-fade"
 * console.log(config.constants.errors.separator); // " || "
 *
 * // Config is immutable
 * config.module.id = 'modified'; // Throws or fails silently
 */
class Config {
  /** @type {Record<string, unknown>} Merged YAML constants */
  #yamlConstants: Record<string, unknown> = {};

  /** @type {unknown[]} Settings definitions array */
  #settings: unknown[] = [];

  /** @type {Record<string, unknown>} Module manifest snapshot */
  #moduleData: Record<string, unknown> = {};

  /** @type {Record<string, unknown>} Module manifest proxy view */
  #moduleView: Record<string, unknown> = {};

  /** @type {Record<string, string>} Environment variables with prefix pattern */
  #env: Record<string, string> = {};

  /** @type {string} Configuration prefix from module shortName */
  #prefix: string = 'OMH';

  /** @type {Config | null} Singleton instance */
  private static instance: Config | null = null;

  /**
   * Create and initialize a new Config instance
   * This is called once on first import; subsequent imports return cached instance
   *
   * @constructor
   * @throws {Error} If any configuration file fails to load or parse
   * @private
   */
  constructor() {
    try {
      // Load module manifest first to extract prefix
      this.#moduleData = this._clone(loadModuleManifest());
      this.#prefix = extractConfigPrefix(this.#moduleData);

      console.debug(`[${this.#prefix}] Config initialization started`);

      // Load YAML constants
      console.debug(`[${this.#prefix}] Loading YAML constant files...`);
      const yamlFiles = loadYamlFiles();
      this.#yamlConstants = this._deepFreeze(mergeConstants(yamlFiles));
      console.debug(
        `[${this.#prefix}] Loaded YAML constants with ${Object.keys(this.#yamlConstants).length} namespaces`
      );

      // Load settings
      console.debug(`[${this.#prefix}] Loading settings definitions...`);
      const rawSettings = loadSettings();
      this.#settings = this._prepareSettings(rawSettings);
      const settingsArray = this.#settings;
      console.debug(
        `[${this.#prefix}] Loaded ${settingsArray.length} setting definitions`
      );

      // Load environment variables
      console.debug(
        `[${this.#prefix}] Loading environment variables with prefix "${this.#prefix}_"...`
      );
      this.#env = this._deepFreeze(loadEnvironmentVariables(this.#prefix));
      const envVarCount = Object.keys(this.#env).length;
      if (envVarCount > 0) {
        console.debug(
          `[${this.#prefix}] Loaded ${envVarCount} environment variables`
        );
      } else {
        console.debug(`[${this.#prefix}] No environment variables set`);
      }

      // Freeze the config to prevent modifications
      console.debug(
        `[${this.#prefix}] Applying deep freeze to prevent modifications...`
      );
      this.#moduleData = this._deepFreeze(this.#moduleData);
      this.#moduleView = this._createMutationSafeProxy(
        this._clone(this.#moduleData),
        ['module']
      );

      Object.freeze(this);

      console.info(
        `[${this.#prefix}] Config initialized successfully with immutable singleton`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = `[OMH] CONFIG INITIALIZATION FAILED: ${errorMsg}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Recursively freeze an object and all nested objects to ensure deep immutability
   * Prevents modifications at any depth in the config tree
   *
   * @param {unknown} obj - Object to freeze (typically an object)
   * @param {Set<unknown>} visited - Set of already-visited objects (prevents infinite loops)
   * @returns {unknown} The frozen object
   * @private
   */
  private _deepFreeze<T>(obj: T, visited: WeakSet<object> = new WeakSet()): T {
    if (!this._isObjectLike(obj)) {
      return obj;
    }

    const reference = obj as Record<PropertyKey, unknown>;

    // Prevent infinite loops on circular references
    if (visited.has(reference)) {
      return obj;
    }
    visited.add(reference);

    // Freeze the object itself
    Object.freeze(reference);

    // Recursively freeze all nested objects
    for (const value of Object.values(reference)) {
      this._deepFreeze(value, visited);
    }

    return reference as T;
  }

  private _isObjectLike(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object';
  }

  /**
   * Get the singleton Config instance
   * Creates and caches the instance on first call; returns cached instance thereafter
   *
   * @returns {Config} The singleton Config instance
   * @throws {Error} If initialization fails
   * @example
   * const config = Config.getInstance();
   * // Or use direct import:
   * import { config } from './config.ts';
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Get merged YAML constants from all constant files
   * Each file maintains its own namespace key
   *
   * @returns {Record<string, unknown>} Namespace-keyed constants
   * @example
   * const separator = config.constants.errors.separator;
   * const i18nPath = config.constants.foundry.defaults.i18nLocation;
   */
  get constants(): Record<string, unknown> {
    return this.#yamlConstants;
  }

  /**
   * Get settings definitions array
   * Contains all in-game user-adjustable settings
   *
   * @returns {unknown} Settings definitions (typically an array)
   * @example
   * config.settings.forEach(setting => {
   *   console.log(setting.key);
   * });
   */
  get settings(): unknown[] {
    return this.#settings;
  }

  /**
   * Get module manifest metadata
   * Loaded from module.json at project root
   *
   * @returns {Record<string, unknown>} Module manifest
   * @example
   * console.log(config.module.id); // "vision-with-fade"
   * console.log(config.module.version); // "12.1.0"
   */
  get module(): Record<string, unknown> {
    return this.#moduleView;
  }

  /**
   * Get environment variables matching the module prefix pattern
   * All values are strings; caller is responsible for type coercion
   *
   * @returns {Record<string, string>} Environment variables with prefix (e.g., OMH_DEBUG_MODE)
   * @example
   * const debugMode = config.env.OMH_DEBUG_MODE === 'true';
   * const maxTokens = parseInt(config.env.OMH_MAX_TOKENS || '100', 10);
   */
  get env(): Record<string, string> {
    return this.#env;
  }

  /**
   * Get the configuration prefix used for logging and environment variables
   * @returns {string} The prefix in SCREAMING_SNAKE_CASE (e.g., "OMH")
   * @private
   */
  get prefix(): string {
    return this.#prefix;
  }

  /**
   * Serialize config to a readable string format
   * Useful for logging and debugging
   *
   * @returns {string} String representation of config
   * @example
   * console.log(config.toString());
   * // Output: Config[OMH] { constants: {...}, settings: [...], module: {...}, env: {...} }
   */
  toString(): string {
    return (
      `Config[${this.#prefix}] { ` +
      `constants: [${Object.keys(this.#yamlConstants).join(', ')}], ` +
      `settings: [${Array.isArray(this.#settings) ? this.#settings.length : 0} items], ` +
      `module: ${this.#moduleData.id || 'unknown'}, ` +
      `env: [${Object.keys(this.#env).length} vars] }`
    );
  }

  /**
   * Normalize settings YAML into an array of definitions
   * @param {unknown} rawSettings Parsed YAML
   * @returns {unknown[]} Array of setting definitions
   * @private
   */
  private _prepareSettings(rawSettings: unknown): unknown[] {
    if (Array.isArray(rawSettings)) {
      return this._deepFreeze([...rawSettings]);
    }

    if (rawSettings && typeof rawSettings === 'object') {
      const record = rawSettings as Record<string, unknown>;
      const list = record.settingsList;
      if (Array.isArray(list)) {
        return this._deepFreeze([...list]);
      }
    }

    return this._deepFreeze([]);
  }

  /**
   * Create a defensive Proxy that ignores mutation attempts while keeping values stable
   * @param {Record<string, unknown>} target Target object to protect
   * @param {string[]} path Property access path for logging
   * @returns {Record<string, unknown>} Proxy that blocks mutations without throwing
   * @private
   */
  private _createMutationSafeProxy<T extends Record<string, unknown>>(
    target: T,
    path: string[]
  ): T {
    const visited = new WeakMap<object, any>();
    const wrap = (value: unknown, currentPath: string[]): any => {
      if (value === null || typeof value !== 'object') {
        return value;
      }

      const existingProxy = visited.get(value as object);
      if (existingProxy) {
        return existingProxy;
      }

      const proxy = new Proxy(value as Record<string, unknown>, {
        get: (obj, prop, receiver) => {
          const nextValue = Reflect.get(obj, prop, receiver);
          return wrap(nextValue, [...currentPath, String(prop)]);
        },
        set: (obj, prop, newValue) => {
          this._logIgnoredMutation(
            [...currentPath, String(prop)],
            'set',
            newValue
          );
          return true;
        },
        deleteProperty: (obj, prop) => {
          this._logIgnoredMutation([...currentPath, String(prop)], 'delete');
          return true;
        },
        defineProperty: (obj, prop, descriptor) => {
          this._logIgnoredMutation(
            [...currentPath, String(prop)],
            'defineProperty',
            descriptor?.value
          );
          return true;
        },
      });

      visited.set(value as object, proxy);
      return proxy;
    };

    return wrap(target, path);
  }

  /**
   * Clone object or array defensively using Lodash cloneDeep
   * @param {T} value Value to clone
   * @returns {T} Cloned value
   * @private
   */
  private _clone<T>(value: T): T {
    return cloneDeep(value) as T;
  }

  /**
   * Log a mutation attempt that was ignored to aid debugging
   * @param {string[]} path Property path attempted to mutate
   * @param {string} operation Operation type (set, delete, defineProperty)
   * @param {unknown} details Optional details about attempted value
   * @private
   */
  private _logIgnoredMutation(
    path: string[],
    operation: string,
    details?: unknown
  ): void {
    const joinedPath = path.join('.');
    let detailSuffix = '';
    if (typeof details !== 'undefined') {
      try {
        detailSuffix = ` (ignored value: ${JSON.stringify(details)})`;
      } catch (error) {
        detailSuffix = ' (ignored value: [unserializable])';
      }
    }
    console.warn(
      `[${this.#prefix}] Config is immutable. Ignored ${operation} on "${joinedPath}"${detailSuffix}`
    );
  }
}

/**
 * Wrap config in a Proxy to ignore direct mutation attempts at top-level
 * @param {Config} instance Config singleton instance
 * @returns {Config} Proxy instance presented to consumers
 */
function createConfigProxy(instance: Config): Config {
  Object.freeze(instance);

  const warn = (action: string, prop: string | symbol): void => {
    const prefix = instance.prefix || 'OMH';
    console.warn(
      `[${prefix}] Config is immutable. Ignored ${action} on top-level property "${String(
        prop
      )}"`
    );
  };

  return new Proxy(instance, {
    get: (target, property, receiver) => {
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set: (target, property, value) => {
      warn('set', property);
      return true;
    },
    deleteProperty: (target, property) => {
      warn('delete', property);
      return true;
    },
    defineProperty: (target, property, descriptor) => {
      warn('defineProperty', property);
      return true;
    },
  });
}

/**
 * Singleton config instance exported for application-wide use
 * Automatically initialized on first import
 *
 * @type {Config}
 * @constant
 * @example
 * import { config } from './config.ts';
 *
 * console.log(config.module.title);
 * console.log(config.constants.errors.separator);
 */
const rawConfigInstance = Config.getInstance();
const proxiedConfig = createConfigProxy(rawConfigInstance);

export { proxiedConfig as config };

export type { Config };
export default proxiedConfig;
