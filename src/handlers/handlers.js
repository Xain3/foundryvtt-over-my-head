// ./src/handlers/handlers.js

import Handler from "../baseClasses/managers/handler.js";
import HooksHandler from "./hooksHandler.js";
import OcclusionHandler from "./occlusionHandler.js";
import PlaceableHandler from "./placeableHandler.js";
import settingsHandler from "./settingsHandler.js";
import TileHandler from "./tileHandler.js";
import TokenHandler from "./tokenHandler.js";
import UserIntrefaceHandler from "./userInterfaceHandler.js";

class Handlers extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.hooks = new HooksHandler(this.config, this.context, this.utils);
        this.settings = new settingsHandler(this.config, this.context, this.utils);
        this.placeable = new PlaceableHandler(this.config, this.context, this.utils);
        this.token = new TokenHandler(this.config, this.context, this.utils, this.placeable);    
        this.tile = new TileHandler(this.config, this.context, this.utils, this.token, this.placeable);
        this.occlusion = new OcclusionHandler(this.config, this.context, this.utils, this.token, this.tile);
        this.ui = new UserIntrefaceHandler(this.config, this.context, this.utils);
    }
}

export default Handlers;