// ./src/baseClasses/handler.js

import Base from './base.js';

class Handler extends Base{
    constructor(config, context, utils) {
        super(config);
        this.context = context;
        this.utils = utils;
        this.logger = utils.logger;
    }

}

export default Handler;