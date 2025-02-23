// ./src/handlers/placeableFunctions/positionChecker.js


/** 
 * Checks the positional relationship between two entities.
 * @class
 * @classdesc Handles position checks between entities.
 * @requires utils
 * 
 * @property {Object} utils - Utility functions.
 * @property {Object} checkMethods - Methods for checking position relationships.
*/
class PositionChecker {
    /**
     * @param {Object} utils - Utility functions.
     */
    constructor(utils) {
        this.utils = utils;
        /**
         * @type {Object}
         * @property {Function} center-rectangle - Checks if the target center is within the reference rectangle.
         * @property {Function} rectangle-center - Checks if the target rectangle is within the reference center.
         * @property {Function} rectangle-rectangle - Checks if the target rectangle is overlapping with the reference rectangle.
         * @property {Function} center-center - Checks if the target center is at the same position as the reference center.
        */
        this.checkMethods = {
            'center-rectangle': this.isCenterRelativeToRect.bind(this),
            'rectangle-center': this.isRectRelativeToCenter.bind(this),
            'rectangle-rectangle': this.isRectRelativeToRect.bind(this),
            'center-center': this.isCenterRelativeToCenter.bind(this)
        };
    }

    /**
     * Checks the position relationship between target and reference.
     * 
     * @param {Object} targetPosition - Position of the target entity.
     * @param {number} targetElevation - Elevation of the target entity.
     * @param {Object} referencePosition - Position of the reference entity.
     * @param {number} referenceElevation - Elevation of the reference entity.
     * @param {string} targetUse - Use case for the target entity.
     * @param {string} referenceUse - Use case for the reference entity.
     * @param {string} [checkType='under'] - Type of check to perform.
     * @returns {boolean} Result of the position check.
     */
    check(targetPosition, targetElevation, referencePosition, referenceElevation, targetUse, referenceUse, checkType = 'under') {
        // Create a key to access the correct check method.
        const methodKey = `${targetUse}-${referenceUse}`;
        // Retrieve the correct check method.
        const checkMethod = this.checkMethods[methodKey];

        // If the check method is valid, call it.
        if (checkMethod) {
            return checkMethod(targetPosition, targetElevation, referencePosition, referenceElevation, checkType);
        } else {
            this.logger.warn(`Invalid combination of targetUse ${targetUse} and referenceUse ${referenceUse}`);
            return false;
        }
    }

    elevationCheck(targetElevation, referenceElevation, checkType) {
        return checkType === 'under' ? targetElevation < referenceElevation : targetElevation > referenceElevation;
    }

    /**
     * Checks if the target center is within the reference rectangle.
     * 
     * @param {Object} targetCenter - Center of the target entity.
     * @param {number} targetElevation - Elevation of the target entity.
     * @param {Object} referencePosition - Position of the reference entity.
     * @param {number} referenceElevation - Elevation of the reference entity.
     * @param {string} checkType - Type of check to perform.
     * @returns {boolean} Result of the position check.
     */
    isCenterRelativeToRect(targetCenter, targetElevation, referencePosition, referenceElevation, checkType) {
        // Check if the target center is within the reference rectangle.
        const isWithinBounds =
            targetCenter.x > referencePosition.BottomLeft.x &&
            targetCenter.x < referencePosition.TopRight.x &&
            targetCenter.y > referencePosition.BottomLeft.y &&
            targetCenter.y < referencePosition.TopRight.y;

        // Check if the target elevation is under or over the reference elevation.
        const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

        return isWithinBounds && elevationCheck;
    }

    /**
     * Checks if the target rectangle is within the reference center.
     * 
     * @param {Object} targetPosition - Position of the target entity.
     * @param {number} targetElevation - Elevation of the target entity.
     * @param {Object} referenceCenter - Center of the reference entity.
     * @param {number} referenceElevation - Elevation of the reference entity.
     * @param {string} checkType - Type of check to perform.
     * @returns {boolean} Result of the position check.
     */
    isRectRelativeToCenter(targetPosition, targetElevation, referenceCenter, referenceElevation, checkType) {
        // Check if the target rectangle is within the reference center.
        const isWithinBounds =
            targetPosition.BottomLeft.x < referenceCenter.x &&
            targetPosition.TopRight.x > referenceCenter.x &&
            targetPosition.BottomLeft.y < referenceCenter.y &&
            targetPosition.TopRight.y > referenceCenter.y;

        // Check if the target elevation is under or over the reference elevation.
        const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

        return isWithinBounds && elevationCheck;
    }

    /**
     * Checks if the target rectangle is overlapping with the reference rectangle.
     * 
     * @param {Object} targetPosition - Position of the target entity.
     * @param {number} targetElevation - Elevation of the target entity.
     * @param {Object} referencePosition - Position of the reference entity.
     * @param {number} referenceElevation - Elevation of the reference entity.
     * @param {string} checkType - Type of check to perform.
     * @returns {boolean} Result of the position check.
     */
    isRectRelativeToRect(targetPosition, targetElevation, referencePosition, referenceElevation, checkType) {
        // Check if the target rectangle is overlapping with the reference rectangle.
        const isOverlapping =
            targetPosition.BottomLeft.x < referencePosition.TopRight.x &&
            targetPosition.TopRight.x > referencePosition.BottomLeft.x &&
            targetPosition.BottomLeft.y < referencePosition.TopRight.y &&
            targetPosition.TopRight.y > referencePosition.BottomLeft.y;

        // Check if the target elevation is under or over the reference elevation.
        const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

        return isOverlapping && elevationCheck;
    }

    /**
     * Checks if the target center is at the same position as the reference center.
     * 
     * @param {Object} targetCenter - Center of the target entity.
     * @param {number} targetElevation - Elevation of the target entity.
     * @param {Object} referenceCenter - Center of the reference entity.
     * @param {number} referenceElevation - Elevation of the reference entity.
     * @param {string} checkType - Type of check to perform.
     * @returns {boolean} Result of the position check.
     */
    isCenterRelativeToCenter(targetCenter, targetElevation, referenceCenter, referenceElevation, checkType) {
        // Check if the target center is at the same position as the reference center.
        const isSamePosition =
            targetCenter.x === referenceCenter.x &&
            targetCenter.y === referenceCenter.y;

        // Check if the target elevation is under or over the reference elevation.
        const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

        return isSamePosition && elevationCheck;
    }
}

export default PositionChecker;