// ./src/baseClasses/handler.js

class Handler {
    constructor(config, context, utils) {
        this.config = config;
        this.context = context;
        this.utils = utils;
    }

    getDebugMode() {
        return this.context.getFlag('debugMode');
    }
}

export default Handler;