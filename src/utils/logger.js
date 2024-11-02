import context from '../contexts/context.js';

const MODULE_NAME = context.get('config').MODULE.NAME;

class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName
    }

    log(message) {
        console.log(`${this.moduleName} | ${message}`);
    }

    error(message) {
        console.error(`${this.moduleName} | ${message}`);
    }

    warn(message) {
        console.warn(`${this.moduleName} | ${message}`);
    }

    debug(message) {
        if (context.get('config').DEBUG_MODE) {
            console.debug(`${this.moduleName} | ${message}`);
        }
    }
}

const logger = new Logger(MODULE_NAME);

export default logger