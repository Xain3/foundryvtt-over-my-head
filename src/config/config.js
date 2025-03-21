import CONSTANTS from './constants.js';
import HOOKS from './hooks.js';
import Base from '../baseClasses/base.js';


/**
 * Class representing the configuration settings.
 * 
 * @extends Base
 * @property {Object} CONSTANTS - The constants object.
 * @property {Object} HOOKS - The hooks object.
 */
class Config extends Base {
    /**
     * Creates an instance of the configuration object.
     * 
     * @param {Object} [constants=CONSTANTS] - The constants object.
     * @param {Object} [hooks=HOOKS] - The hooks object.
     */
    constructor(constants = CONSTANTS, hooks = HOOKS) {
    super({ shouldLoadGame: true });
        this.validateConstantsAndHooks(constants, hooks);
        this.CONSTANTS = constants;
        this.HOOKS = hooks;
    }

    validateConstantsAndHooks(constants, hooks) {
        if (!constants) {
            throw new Error('Constants is set up to be loaded, but no constants were provided.');
        }
        if (!hooks) {
            throw new Error('Hooks is set up to be loaded, but no hooks were provided.');
        }
        if (typeof constants !== 'object') {
            throw new Error('Constants must be an object.');
        }
        if (typeof hooks !== 'object') {
            throw new Error('Hooks must be an object.');
        }
    }
}

export default Config;