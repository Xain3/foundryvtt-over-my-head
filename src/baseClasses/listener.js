// ./src/baseClasses/listener.js

import Component from './component.js';

class Listener extends Component {
    constructor(config, context, utils, handlers) {
        super(config, context, utils);
        this.handlers = handlers;
    }
}

export default Listener;