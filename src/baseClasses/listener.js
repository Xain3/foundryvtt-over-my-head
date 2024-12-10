// ./src/baseClasses/listener.js

import Base from './base.js';

class Listener extends Base {
    constructor(config, context, utils, handlers) {
        super(config);
        this.context = context;
        this.utils = utils;
        this.handlers = handlers;
        this.logger = utils.logger;
    }
}

export default Listener;