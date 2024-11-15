// ./src/handlers/handlers.js

import HooksHandler from "./hooksHandler.js";
import JSONHandler from "./JSONHandler.js";
import OcclusionHandler from "./occlusionHandler.js";
import settingsHandler from "./settingsHandler.js";
import TileHandler from "./tileHandler.js";
import TokenHandler from "./tokenHandler.js";

class Handlers {
    constructor(config, context, utils) {
        this.config = config;
        this.context = context;
        this.utils = utils;
        this.hooks = new HooksHandler(this.config);
        this.JSON = JSONHandler;  // The JSONHandler will need to be instantiated with a URL
        this.occlusion = new OcclusionHandler();
        this.settings = new settingsHandler(this.config, this.context, this.utils);
        this.tile = new TileHandler();
        this.token = new TokenHandler();    
    }
}

export default Handlers;