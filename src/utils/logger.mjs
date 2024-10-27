import context from '../contexts/context.mjs';

class Logger {
    constructor() {
        this.module = context.get('module');
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
        if (context.get('config').debugMode) {
            console.debug(`${this.module.title} | ${message}`);
        }
    }
}

const logger = new Logger();

export default logger