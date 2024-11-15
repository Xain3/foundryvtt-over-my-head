// ./src/listeners/listeners.js

class Listeners {
    constructor(config, context, utils, gameObject) {
        this.config = config;
        this.logger = utils.logger;
        this.context = context;
        this.gameObject = gameObject;
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

export default Listeners;