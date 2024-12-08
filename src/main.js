// ./src/main.js

// Import the configuration modules
import Config from './config/config.js';

// Import the utilities
import Utilities from './utils/utils.js';

// Import the context
import Context from './contexts/context.js';

// Import the handlers
import Handlers from './handlers/handlers.js';

// Import the listeners
import Listeners from './listeners/listeners.js';


class Main {
    constructor() {
        this.baseConfig = Config.CONFIG;
        this.config = Config.CONFIG;
        this.game = globalThis.game;
    }
    
    async initializeModule() {
        // Initialise the utilities
        this.utils = new Utilities(this.config);
        // Initialise the full configuration
        let newConfig = new Config(this.utils);
        this.config = newConfig.CONFIG;
        this.utils.updateConfig(this.config);
        // Initialise the context
        this.context = await this.utils.initializer.initializeContext(this.config);
        // Initialise the handlers
        this.handlers = new Handlers(this.config, this.context, this.utils);
        // Register the settings
        this.utils.initializer.registerSettings(this.handlers, this.context);
        // Initialise the listeners
        this.listeners = new Listeners(this.config, this.utils, this.context);
        this.listeners.run();
    }
    
    checkUserPermission(onlyGM) {
        if (onlyGM && !this.game.user.isGM) {
            console.debug(`${this.config.CONST.MODULE.SHORT_NAME} | ${this.config.CONST.MODULE.NAME} not loaded. User is not a GM`);
            return false;
        }
        return true;
    }

    async run(onlyGM = this.config.CONST.MODULE.DEFAULTS.ONLY_GM) {
        // Initialise the module
        await this.initializeModule();
        // Ensure that the user is the GM
        Hooks.on('setup', () => {if (!this.checkUserPermission(onlyGM)) {return;}});
        // Start the UI listeners to render the UI when certain events are triggered
        this.handlers.ui.startUIListener();  
        this.handlers.token.startTokenListener();
    }
}

Hooks.on('init', () => {
    // return  // Uncomment this line to disable the module
    const main = new Main();
    main.run()
});

