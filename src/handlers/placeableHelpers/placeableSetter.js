// ./src/handlers/placeableFunctions/placeableSetter.js

import Handler from "../../baseClasses/handler.js";

/**
 * Manages setting the current placeable entity.
 */
class PlaceableSetter extends Handler {
    /**
     * @param {Object} config - Configuration settings.
     * @param {Object} context - Execution context.
     * @param {Object} utils - Utility functions.
     */
    constructor(config, context, utils) {
        super(config, context, utils);
        this.current = null;
    }

    /**
     * Sets the current placeable.
     * @param {Object} placeable - The placeable to set.
     * @param {boolean} [returnValue=true] - Whether to return the set placeable.
     * @returns {Object|undefined} The current placeable if returnValue is true.
     */
    setCurrentPlaceable(placeable, returnValue = true) {
        this.current = placeable;
        if (returnValue) {
            return this.current;
        }
    }
}

export default PlaceableSetter;