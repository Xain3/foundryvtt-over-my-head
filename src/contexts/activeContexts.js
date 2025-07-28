/**
 * @file activeContexts.js
 * @description This file contains the ActiveContexts class for managing multiple context instances.
 * @path src/contexts/activeContexts.js
 */

import constants from "@/constants/constants";
import ContextFactory from "./contextFactory.js";

/**
 * @class ActiveContexts
 * @description Manages multiple context instances based on configuration settings.
 * Uses ContextFactory to create different types of context managers in a clean,
 * maintainable way. Automatically initializes enabled contexts based on constants.
 *
 * @property {object} contexts - Map of initialized context managers.
 * @property {object} initializationParams - Parameters used for context initialization.
 */
class ActiveContexts {
  // Private field declarations
  #constants;
  #contextSettings;
  #enabledSettings;
  #inMemoryFlag;
  #moduleFlag;
  #userFlag;
  #worldFlag;
  #localStorageFlag;
  #sessionStorageFlag;

  constructor(initializationParams = {}) {
    this.#constants = constants;
    this.#contextSettings = this.#constants.context;
    this.#enabledSettings = this.#contextSettings.enabledSettings;
    this.#inMemoryFlag = this.#enabledSettings.inMemoryFlag;
    this.#moduleFlag = this.#enabledSettings.moduleFlag;
    this.#userFlag = this.#enabledSettings.userFlag;
    this.#worldFlag = this.#enabledSettings.worldFlag;
    this.#localStorageFlag = this.#enabledSettings.localStorageFlag;
    this.#sessionStorageFlag = this.#enabledSettings.sessionStorageFlag;
    this.initializationParams = initializationParams;
  }

  /**
   * Initialize in-memory context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {InMemoryContextManager|undefined} The in-memory context manager or undefined if disabled
   */
  initializeInMemoryContext(initializationParams = this.initializationParams) {
    if (!this.#inMemoryFlag) return undefined;

    if (initializationParams.inMemory && typeof initializationParams.inMemory === 'object') {
      initializationParams = initializationParams.inMemory;
    }

    return ContextFactory.createInMemoryContext(initializationParams);
  }

  /**
   * Initialize module context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {ExternalContextManager|undefined} The module context manager or undefined if disabled
   */
  initializeModuleContext(initializationParams = this.initializationParams) {
    if (!this.#moduleFlag) return undefined;

    if (initializationParams.module && typeof initializationParams.module === 'object') {
      initializationParams = initializationParams.module;
    }

    const moduleParams = {
      ...initializationParams,
      source: 'module',
    };

    return ContextFactory.createExternalContext(moduleParams);
  }

  /**
   * Initialize user context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {ExternalContextManager|undefined} The user context manager or undefined if disabled
   */
  initializeUserContext(initializationParams = this.initializationParams) {
    if (!this.#userFlag) return undefined;

    if (initializationParams.user && typeof initializationParams.user === 'object') {
      initializationParams = initializationParams.user;
    }

    const userParams = {
      ...initializationParams,
      source: 'user',
    };

    return ContextFactory.createExternalContext(userParams);
  }

  /**
   * Initialize world context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {ExternalContextManager|undefined} The world context manager or undefined if disabled
   */
  initializeWorldContext(initializationParams = this.initializationParams) {
    if (!this.#worldFlag) return undefined;

    if (initializationParams.world && typeof initializationParams.world === 'object') {
      initializationParams = initializationParams.world;
    }

    const worldParams = {
      ...initializationParams,
      source: 'world',
    };

    return ContextFactory.createExternalContext(worldParams);
  }

  /**
   * Initialize localStorage context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {ExternalContextManager|undefined} The localStorage context manager or undefined if disabled
   */
  initializeLocalStorageContext(initializationParams = this.initializationParams) {
    if (!this.#localStorageFlag) return undefined;

    if (initializationParams.localStorage && typeof initializationParams.localStorage === 'object') {
      initializationParams = initializationParams.localStorage;
    }

    const localStorageParams = {
      ...initializationParams,
      source: 'localStorage',
    };

    return ContextFactory.createExternalContext(localStorageParams);
  }

  /**
   * Initialize sessionStorage context using ContextFactory
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {ExternalContextManager|undefined} The sessionStorage context manager or undefined if disabled
   */
  initializeSessionStorageContext(initializationParams = this.initializationParams) {
    if (!this.#sessionStorageFlag) return undefined;

    if (initializationParams.sessionStorage && typeof initializationParams.sessionStorage === 'object') {
      initializationParams = initializationParams.sessionStorage;
    }

    const sessionStorageParams = {
      ...initializationParams,
      source: 'sessionStorage',
    };

    return ContextFactory.createExternalContext(sessionStorageParams);
  }

  /**
   * Initialize all enabled contexts
   * @param {object} initializationParams - Parameters for context initialization
   * @returns {object} Object containing all initialized context managers
   */
  initializeAllContexts(initializationParams = this.initializationParams) {
    return {
      inMemory: this.initializeInMemoryContext(initializationParams),
      module: this.initializeModuleContext(initializationParams),
      user: this.initializeUserContext(initializationParams),
      world: this.initializeWorldContext(initializationParams),
      localStorage: this.initializeLocalStorageContext(initializationParams),
      sessionStorage: this.initializeSessionStorageContext(initializationParams),
    };
  }
}

// Create default contexts instance
const contexts = new ActiveContexts().initializeAllContexts();

export default contexts;
export { ActiveContexts };