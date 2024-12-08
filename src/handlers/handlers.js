// ./src/handlers/handlers.js

import HooksHandler from "./hooksHandler.js";
import OcclusionHandler from "./occlusionHandler.js";
import PlaceableHandler from "./placeableHandler.js";
import settingsHandler from "./settingsHandler.js";
import TileHandler from "./tileHandler.js";
import TokenHandler from "./tokenHandler.js";
import UserIntrefaceHandler from "./UserInterfaceHandler.js";

class Handlers {
    constructor(config, context, utils) {
        this.config = config;
        this.context = context;
        this.utils = utils;
        this.hooks = new HooksHandler(this.config);
        this.settings = new settingsHandler(this.config, this.context, this.utils);
        this.occlusion = new OcclusionHandler(this.config, this.context, this.utils);
        this.placeable = new PlaceableHandler(this.config, this.context, this.utils);
        this.token = new TokenHandler(this.config, this.context, this.utils, this.placeable);    
        this.tile = new TileHandler(this.config, this.context, this.utils, this.token, this.placeable);
        this.ui = new UserIntrefaceHandler(this.config, this.context, this.utils);
    }
}

export default Handlers;