import context from '../contexts/context.mjs';

class Logger {
    constructor() {
        this.module = context.get('module');
        this.debugMode = context.get('config').debugMode;
    }

    log(message) {
        console.log(`${this.module.title} | ${message}`);
    }

    error(message) {
        console.error(`${this.module.title} | ${message}`);
    }

    warn(message) {
        console.warn(`${this.module.title} | ${message}`);
    }

    debug(message
        ) {
        if (this.debugMode) {
            console.debug(`${this.module.title} | ${message}`);
        }
    }
}

export const logger = new Logger();