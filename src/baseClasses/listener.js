// ./src/listeners/listeners.js

class Listener {
    constructor(config, context, utils) {
        this.config = config;
        this.context = context;
        this.utils = utils;
        this.logger = utils.logger;
        this.gameObject = utils.gameManager.game;
    }
}

export default Listener;