/**
 * @file placeableSetter.mjs
 * @description Manages setting the current placeable entity.
 * @path src/handlers/placeableHelpers/placeableSetter.mjs
 */

import Handler from "../../baseClasses/handler.mjs";

/**
 * Manages setting the current placeable entity.
 */
class PlaceableSetter extends Handler {
    /**
     * @param {Object} args - Arguments object
     * @param {Object} args.config - Configuration settings.
     * @param {Object} args.context - Execution context.
     * @param {Object} args.utils - Utility functions.
     */
    constructor({ config, context, utils }) {
        super({ config, utils, context });
        // Ensure the original context reference is preserved for tests/consumers
        this.context = context;
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