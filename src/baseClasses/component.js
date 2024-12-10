// ./src/baseClasses/component.js

import Base from './base.js';

class Component extends Base {
    constructor(config, context, utils) {
        super(config);
        this.context = context;
        this.utils = utils;
        this.logger = utils.logger;
    }
}

export default Component;