// ./src/listeners/listeners.js

import Listener from "../baseClasses/listener.js";

class StateListener extends Listener {
    constructor(config, context, utils, handlers) {
        super(config, context, utils, handlers);
    }

    setupLogState() {
        Hooks.on(this.config.formatHook(this.config.HOOKS.IN['logState'], 'IN'), () =>{ 
            this.logger.log('Logging state');
            this.context.logState()
        });
    }

    setupLogRemoteState() {
        Hooks.on(this.config.formatHook(this.config.HOOKS.IN['logRemoteState'], 'IN'), () =>{ 
            this.logger.log('Logging remote state');
            this.context.getRemoteLocation()
        });
    }

    setupGetRemoteState() {
        Hooks.on(this.config.formatHook(this.config.HOOKS.IN['getRemoteState'], 'IN'), () =>{ 
            this.logger.log('Getting remote state');
            let state = this.context.getState()
            
        });
    }

    run() {
        this.setupLogState();
    }
}

export default StateListener;