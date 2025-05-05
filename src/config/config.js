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
        const validateArgs = () => {
            if (!constants) {
                throw new Error('Error initializing Config. Constants must be provided.');
            }
            if (!hooks) {
                throw new Error('Error initializing Config. Hooks must be provided.');
            }
            if (typeof constants !== 'object') {
                throw new Error('Error initializing Config. Constants must be an object.');
            }
            if (typeof hooks !== 'object') {
                throw new Error('Error initializing Config. Hooks must be an object.');
            }
        };
        
        validateArgs();

        super({ shouldLoadGame: true, shouldLoadConfig: false });
        
        this.CONSTANTS = constants;
        this.HOOKS = hooks;
    }
}

export default Config;