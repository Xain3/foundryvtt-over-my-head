// ./src/listeners/listeners.js

import Listener from "../baseClasses/listener";
import StateListener from "./stateListener";
import TokenListener from "./tokenListener";
import TileListener from "./tileListener";

class Listeners extends Listener {
    constructor(config, context, utils, handlers){
        super(config, context, utils, handlers);
        this.state = new StateListener(this.config, this.context, this.utils, this.handlers);
        this.token = new TokenListener(this.config, this.context, this.utils, this.handlers);
        this.tile = new TileListener(this.config, this.context, this.utils, this.handlers);
    }

    run(){
        this.state.run();
        this.token.run();
        this.tile.run();
    }
}

export default Listeners;