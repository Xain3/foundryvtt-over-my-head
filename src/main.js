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
    
    async run() {
        // Initialise the module
        await this.initializeModule();
    }
}

Hooks.on('init', () => {
    const main = new Main();
    main.run()
});

