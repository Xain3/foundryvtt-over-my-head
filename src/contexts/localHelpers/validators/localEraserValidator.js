import { ContextContainer } from '@/baseClasses/contextUnits';
import LocalContextManager from '@/contexts/local';

class LocalContextEraserValidator {
  #errors;
  #manager;
  #contextState;

  #validateOwnArgs(manager, callerName) {
    if (!manager || !(manager instanceof LocalContextManager)) {
      throw new Error(`Invalid manager: Must be an instance of LocalContextManager.`);

  constructor(manager, callerName) {
    this.callerName = callerName || 'LocalContextEraserValidator';
    this.#manager = manager || null;
    this.#errors = [];
  }

  #appendError(error) {
    this.#errors.push(error);
  }

  #clearErrors() {
    this.#errors = [];
  }

  getErrors() {
    return this.#errors;
    }


    #validateConstructorArgs(contextState, manager, clear = true) {
      if (clear) this.#clearErrors();
      if (!contextState || !(contextState instanceof ContextContainer)) {
      this.#appendError('Invalid contextState: Must be an instance of ContextContainer.');
      }
      if (!manager || !(manager instanceof LocalContextManager)) {
        this.#appendError('Invalid manager: Must be an instance of LocalContextManager.');
      }
    }

    #validateEraseArgs(key, target, timestamp, clear = true) {
      if (clear) this.#clearErrors();
      if (!key || typeof key !== 'string') {
        this.#appendError('Invalid key: Must be a non-empty string.');
      }
      if (target && !['data', 'flags', 'settings'].includes(target)) {
        this.#appendError('Invalid target: Must be one of "data", "flags", or "settings".');
      }
      if (timestamp !== undefined && typeof timestamp !== 'boolean') {
        this.#appendError('Invalid timestamp: Must be a boolean value.');
      }
      }
    }

    #validateClearArgs(target, clear = true) {
      if (clear) this.#clearErrors();
      if (target && !['data', 'flags', 'settings', 'all'].includes(target)) {
        this.#appendError('Invalid target: Must be one of "data", "flags", "settings", or "all".');
      }
    }

  }