// ./src/handlers/placeableFunctions/placeableChecker.js

import Handler from '../../baseClasses/managers/handler.js';
import PositionChecker from './positionChecker.js';

/**
 * Checks various conditions related to placeable entities.
 */
class PlaceableChecker extends Handler {
    /**
     * @param {Object} config - Configuration settings.
     * @param {Object} context - Execution context.
     * @param {Object} utils - Utility functions.
     * @param {PlaceableGetter} placeableGetter - Instance of PlaceableGetter.
     */
    constructor(config, context, utils, placeableGetter) {
        super(config, context, utils);
        this.positionChecker = new PositionChecker(utils);
        this.getter = placeableGetter;

    }

    /**
     * Checks the positional relationship between target and reference.
     * @param {Object} targetPosition 
     * @param {number} targetElevation 
     * @param {Object} referencePosition 
     * @param {number} referenceElevation 
     * @param {string} targetUse 
     * @param {string} referenceUse 
     * @param {string} [checkType='under'] 
     * @returns {boolean} Result of the position check.
     */
    checkPosition(targetPosition,
        targetElevation,
        referencePosition,
        referenceElevation,
        targetUse,
        referenceUse,
        checkType = 'under') {
        return this.positionChecker.check(
            targetPosition,
            targetElevation,
            referencePosition,
            referenceElevation,
            targetUse,
            referenceUse,
            checkType
        );
    }

    /**
     * Determines if a placeable is selected.
     * @param {Object} placeable 
     * @returns {boolean} True if selected, else false.
     */
    isSelected(placeable) {
        return placeable._controlled;
    }

    /**
     * Determines if a placeable is under another placeable.
     * 
     * @param {Object} target - The target placeable.
     * @param {Object} reference - The reference placeable.
     * @param {Object} targetManager - The manager of the target placeable.
     * @param {Object} referenceManager - The manager of the reference placeable.
     * @param {string} [targetUse='center'] - The use case for the target position.
     * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
     * @param {string} [checkType='under'] - The type of check to perform.
     * @returns {boolean} True if the target is under the reference, else false.
     */
    isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType = 'under') {
        if (this.getDebugMode()) {this.logger.log(`Checking if target ${target} is under reference ${reference}`)} // DEBUG - log the target and reference
        // position of the target
        let targetPosition = this.getter.getPosition(target, targetManager, targetUse);
        let targetElevation = this.getter.getElevation(target, targetManager);
        // position of the reference
        let referencePosition = this.getter.getPosition(reference, referenceManager, referenceUse);
        let referenceElevation = this.getter.getElevation(reference, referenceManager);
        // check if the target is under the reference
        if (!targetPosition || !targetElevation || !referencePosition || !referenceElevation) {
            this.logger.warn('Invalid target or reference');
            return false;
        }
        return this.checkPosition(
            targetPosition,
            targetElevation,
            referencePosition,
            referenceElevation,
            targetUse,
            referenceUse,
            checkType
        );
    }

    /**
     * Determines if a placeable is over another placeable.
     * 
     * @param {Object} target - The target placeable.
     * @param {Object} reference - The reference placeable.
     * @param {Object} targetManager - The manager of the target placeable.
     * @param {Object} referenceManager - The manager of the reference placeable.
     * @param {string} [targetUse='center'] - The use case for the target position.
     * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
     * @param {string} [checkType='above'] - The type of check to perform. 
     */
    isOver(target, reference, targetManager, referenceManager, targetUse, referenceUse,  checkType = 'above') {
        return this.isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType);
    }
    }

export default PlaceableChecker;