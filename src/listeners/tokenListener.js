// ./src/listeners/tokenListener.js

import Listener from "../baseClasses/listener.js";
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Handlers from "../handlers/handlers.js";
import Utilities from "../utils/utils.js";

/**
 * TokenListener class that extends the Listener class.
 * 
 * This class is responsible for handling token-related events and updating occlusion for tiles.
 * 
 * @class TokenListener
 * @extends Listener
 * 
 * @param {Config} config - Configuration object.
 * @param {Context} context - Context object.
 * @param {Utilities} utils - Utility functions.
 * @param {Handlers} handlers - Handlers for various operations.
 * 
 * @property {TokenHandler} handler - The handler for token events.
 * 
 * @method startOcclusionUpdateOnTokenRefresh
 * Registers a hook to update occlusion on token refresh.
 * 
 * This method listens for the 'refreshToken' hook and performs the following actions:
 * - Checks if the token is controlled and selected by the user.
 * - Sets the current token to the token that was refreshed.
 * - Retrieves all tiles with the `AlsoFade` property set to true.
 * - Updates occlusion for all tiles with `AlsoFade` set to true relative to the current token.
 */
class TokenListener extends Listener {
    /**
     * Constructs a new instance of the class.
     *
     * @param {Config} config - Configuration object.
     * @param {Context} context - Context object.
     * @param {Utilities} utils - Utility functions.
     * @param {Handlers} handlers - Handlers for various operations.
     */
    constructor(config, context, utils, handlers) {
        super(config, context, utils, handlers);
        this.handler = handlers.token;
    }

    /**
     * Registers a hook to update occlusion on token refresh.
     * 
     * @method startOcclusionUpdateOnTokenRefresh
     * @memberof TokenListener
     * 
     * This method listens for the 'refreshToken' hook and performs the following actions:
     * - Checks if the token is controlled and selected by the user.
     * - Sets the current token to the token that was refreshed.
     * - Retrieves all tiles with the `AlsoFade` property set to true.
     * - Updates occlusion for all tiles with `AlsoFade` set to true relative to the current token.
     */
    startOcclusionUpdateOnTokenRefresh() {
        // Register a hook to update occlusion on token refresh
        Hooks.on('refreshToken', (token) => {
            // If the token is controlled by the user and is selected
            if (this.handlers.token.isControlledAndSelected(token)) {
                // Set the current token to the token that was refreshed
                let currentToken = this.handlers.token.setCurrentToken(token);
                // Get all tiles with AlsoFade set to true
                let alsoFadeTiles = this.handlers.tile.alsoFadeTiles
                // Update occlusion for all tiles with AlsoFade set to true relative to the current token
                this.handlers.occlusion.updateOcclusionForTiles(alsoFadeTiles, currentToken);
            }
        });
    }

    /**
     * Main method for the token listener.
     * 
     * @method run
     */
    run() {
        this.startOcclusionUpdateOnTokenRefresh();
    }
}

export default TokenListener;