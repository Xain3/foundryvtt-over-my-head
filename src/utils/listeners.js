// ./src/utils/listeners.js - WIP

import hooksHandler from '../handlers/hooksHandler.js';
import context from '../contexts/context.js';


class Listener{
    constructor({hookName, hookGroup, fn, mode}) {
        this.mode = mode;
        this.hookName = hookName;
        this.hookGroup = hookGroup;
        this.fn = fn;
    }

    listen() {
        if (this.mode === 'once') {
            hooksHandler.once(this.hookName, this.fn, this.hookGroup);
        }
        else {
            hooksHandler.on(this.hookName, this.fn, this.hookGroup);
        }
    }
}

class Listeners {
    static LISTENER_FUNCTIONS = {...context.get('config').LISTENER_FUNCTIONS};
    constructor({...activeListeners}) {
        this.listeners = activeListeners;
    }

    startListening() {
        for (let listener in this.listeners) {
            ;
        }
    }
}