// ./src/utils/utils.js

import GameManager from "./gameManager.js";
import HookFormatter from "./hookFormatter.js";
import Initializer from "./initializer.js";
import Logger from "./logger.js";
import Localizer from "./localizer.js";
import Context from "../contexts/context.js";
import RemoteContextManager from "./remoteContextManager.js";

class Utilities {
    constructor(CONFIG) {
        this.CONFIG = CONFIG;
        this.remoteContextManager = new RemoteContextManager();
        this.gameManager = new GameManager(CONFIG, this.remoteContextManager);
        this.logger = new Logger(CONFIG, this.gameManager);
        this.hookFormatter = new HookFormatter(CONFIG);
        this.localizer = new Localizer(CONFIG, GameManager.getGameObject());
        this.initializer = new Initializer(CONFIG, Context, this.gameManager, this.logger, this.hookFormatter);
        
    }

    updateConfig(CONFIG) {
        this.CONFIG = CONFIG;
        this.gameManager.updateConfig(CONFIG);
        this.hookFormatter.updateConfig(CONFIG);
        this.initializer.updateConfig(CONFIG); // Added missing parentheses
        this.localizer.updateConfig(CONFIG);
        this.logger.updateConfig(CONFIG);
    }
}

export default Utilities;