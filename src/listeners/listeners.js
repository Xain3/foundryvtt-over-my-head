// ./src/listeners/listeners.js

import StateListener from "./stateListener";

class Listeners {
    constructor(config, context, utils){
        this.config = config;
        this.context = context;
        this.utils = utils;
        this.stateListener = new StateListener(this.config, this.context, this.utils);
    }

    run(){
        this.stateListener.run();        let stateListener = new StateListener(this.config, this.context, this.utils);

    }
}