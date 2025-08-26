/**
 * @file placeableGetter.js
 * @description Retrieves information about placeable entities.
 * @path src/handlers/placeableHelpers/placeableGetter.js
 */

// ./src/handlers/placeableFunctions/placeableGetter.js

import Handler from "../../baseClasses/handler.js";

/**
 * Retrieves information about placeable entities.
 */
class PlaceableGetter extends Handler {
    /**
     * @param {Object} config - Configuration settings.
     * @param {Object} context - Execution context.
     * @param {Object} utils - Utility functions.
     */
    constructor(config, context, utils) {
        super(config, utils, context);
    }

    /**
     * Gets all placeables of a specified type.
     * @param {string} placeableType
     * @param {boolean} [updateProperty=true]
     * @param {boolean} [returnValue=true]
     * @returns {Array|undefined} List of placeables if returnValue is true.
     */
    getAllPlaceables(placeableType, updateProperty = true, returnValue = true) {
        const placeables = canvas[placeableType]?.placeables || [];
        if (updateProperty) {
            this.all = placeables;
        }
        if (returnValue) {
            return placeables;
        }
    }

    /**
     * Retrieves a specific corner of a placeable.
     * @param {string} corner
     * @param {Object} placeable
     * @returns {Object|null} Coordinates of the corner or null if invalid.
     */
    getCorner(corner, placeable) {
        const allowedCorners = this.config.HANDLERS.PLACEABLE.ALLOWED_CORNERS;
        if (allowedCorners.includes(corner)) {
            let anchor = { x: placeable.x, y: placeable.y };

            switch (corner) {
                case 'topLeft':
                    // Default anchor
                    break;
                case 'topRight':
                    anchor.x += placeable.w || placeable.width;
                    break;
                case 'bottomLeft':
                    anchor.y += placeable.h || placeable.height;
                    break;
                case 'bottomRight':
                    anchor.x += placeable.w || placeable.width;
                    anchor.y += placeable.h || placeable.height;
                    break;
                default:
                    this.logger.warn(`Unknown corner ${corner}.`);
                    return null;
            }

            return anchor;
        } else if (corner === 'center') {
            // If 'center' is provided, return the center coordinates
            // This is a fallback to ensure that the function can return the center
            // even if 'corner' is not in the allowed list
            this.logger.warn('getCorner is used to get corners only. Use getCenter for center.');
            return this.getCenter(placeable);
        } else if (!corner) {
            // No corner provided
            this.logger.warn('No corner provided. Returning null.');
            return null;
        } else {
            // Invalid corner provided
            this.logger.warn(`Invalid corner ${corner} provided. Allowed corners are: ${allowedCorners}`);
            return null;
        }
    }

    /**
     * Retrieves the center of a placeable.
     * @param {Object} placeable
     * @returns {Object} Coordinates of the center.
     */
    getCenter(placeable){
        return placeable.center;
    }

    /**
     * Retrieves the elevation of a placeable.
     * @param {Object} placeable
     * @returns {number} Elevation value.
     */
    getElevation(placeable){
        return placeable.document?.elevation ?? placeable.elevation ?? 0;
    }

    /**
     * Retrieves the rectangular bounds of a placeable.
     * @param {Object} placeable
     * @returns {Object} Coordinates of the top-right and bottom-left corners.
     */
    getRectBounds(placeable){
        // Use Foundry's bounds API if available for consistent pixel rectangles
        if (placeable.bounds) {
            const bounds = placeable.bounds;
            return {
                TopRight: { x: bounds.x + bounds.width, y: bounds.y },
                BottomLeft: { x: bounds.x, y: bounds.y + bounds.height }
            };
        }
        
        // Fallback to manual calculation
        let TopRight = this.getCorner('topRight', placeable);
        let BottomLeft = this.getCorner('bottomLeft', placeable);
        return {TopRight, BottomLeft};
    }

    /**
     * Retrieves the position of a placeable based on the specified use.
     * @param {Object} placeable
     * @param {Object} placeableManager
     * @param {string} use
     * @returns {Object} Coordinates of the position.
     */
    getPosition(placeable, placeableManager, use){
        if (use === 'center') {
            return placeableManager.getCenter(placeable);
        }
        if (use === 'rectangle') {
            return placeableManager.getRectBounds(placeable);
        }
    }

    /**
     * Retrieves the selected placeables.
     * @param {Array} placeables
     * @returns {Array} List of selected placeables.
     */
    getSelectedPlaceables(placeables) {
        return placeables.filter(placeable => placeable.controlled);
    }
}

export default PlaceableGetter;