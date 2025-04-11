// ./src/handlers/handlers.js

import Handler from "../baseClasses/managers/handler.js";
import HooksHandler from "./hooksHandler.js";
import OcclusionHandler from "./occlusionHandler.js";
import PlaceableHandler from "./placeableHandler.js";
import settingsHandler from "./settingsHandler.js";
import TileHandler from "./tileHandler.js";
import TokenHandler from "./tokenHandler.js";
import UserInterfaceHandler from "./userInterfaceHandler.js";

class Handlers extends Handler {
    constructor(config, context, utils) {
        validateHandlerParameters();
        
        super(config, context, utils);
        this.hooks = new HooksHandler(this.config, this.context, this.utils);
        this.settings = new settingsHandler(this.config, this.context, this.utils);
        this.placeable = new PlaceableHandler(this.config, this.context, this.utils);
        this.token = new TokenHandler(this.config, this.context, this.utils, this.placeable);    
        this.tile = new TileHandler(this.config, this.context, this.utils, this.token, this.placeable);
        this.occlusion = new OcclusionHandler(this.config, this.context, this.utils, this.token, this.tile);
        this.ui = new UserInterfaceHandler(this.config, this.context, this.utils);

        function validateHandlerParameters() {
            if (!config) throw new Error("Config is required for Handlers");
            if (!context) throw new Error("Context is required for Handlers");
            if (!utils) throw new Error("Utils is required for Handlers");
            if (typeof config !== 'object') throw new Error("Config must be an object");
            if (typeof context !== 'object') throw new Error("Context must be an object");
            if (typeof utils !== 'object') throw new Error("Utils must be an object");
        }
    }
}

export default Handlers;