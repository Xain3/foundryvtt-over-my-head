/**
 * @file placeableChecker.js
 * @description Checks various conditions and positional relationships for placeable entities.
 * @path src/handlers/placeableHelpers/placeableChecker.js
 */

import Handler from '../../baseClasses/handler.js';
import PositionChecker from './positionChecker.js';
import { CHECK_TYPES, POSITION_USES } from './config.js';

/**
 * @class PlaceableChecker
 * @description Checks various conditions related to placeable entities, and delegates
 * position-related checks to `PositionChecker`.
 * @extends Handler
 */
class PlaceableChecker extends Handler {
    /**
     * @param {Object} config - Configuration settings.
     * @param {Object} context - Execution context.
     * @param {Object} utils - Utility functions.
     * @param {PlaceableGetter} placeableGetter - Instance of PlaceableGetter.
     */
    constructor(config, context, utils, placeableGetter) {
        super(config, utils, context);
        this.positionChecker = new PositionChecker(config, context, utils);
        this.getter = placeableGetter;
        this.logger = utils?.logger;
    }

    /**
     * Gets the debug mode setting.
     * @returns {boolean} True if debug mode is enabled, false otherwise.
     */
    getDebugMode() {
        // Access debug mode from config or context, with fallback to false
        return this.config?.constants?.debugMode || 
               this.context?.debugMode || 
               false;
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
     * Uses the public controlled property instead of private _controlled for better Foundry API alignment.
     * @param {Object} placeable
     * @returns {boolean} True if selected, else false.
     */
    isSelected(placeable) {
        return placeable.controlled || placeable._controlled;
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
    isUnder(target, reference, targetManager, referenceManager, targetUse = POSITION_USES.CENTER, referenceUse = POSITION_USES.RECTANGLE, checkType = CHECK_TYPES.UNDER) {
        if (this.getDebugMode()) this.logger.log(`Checking if target ${target} is under reference ${reference}`);
        // position of the target
        let targetPosition = this.getter.getPosition(target, targetManager, targetUse);
        let targetElevation = this.getter.getElevation(target);
        // position of the reference
        let referencePosition = this.getter.getPosition(reference, referenceManager, referenceUse);
        let referenceElevation = this.getter.getElevation(reference);
        // check if the target is under the reference
        if (!targetPosition || targetElevation == null || !referencePosition || referenceElevation == null) {
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
     * This method is a thin alias to isUnder that delegates with CHECK_TYPES.OVER
     * to check if the target placeable has a higher elevation than the reference.
     *
     * @param {Object} target - The target placeable.
     * @param {Object} reference - The reference placeable.
     * @param {Object} targetManager - The manager of the target placeable.
     * @param {Object} referenceManager - The manager of the reference placeable.
     * @param {string} [targetUse='center'] - The use case for the target position.
     * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
     * @returns {boolean} True if the target is over the reference, else false.
     */
    isOver(target, reference, targetManager, referenceManager, targetUse = POSITION_USES.CENTER, referenceUse = POSITION_USES.RECTANGLE) {
        return this.isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, CHECK_TYPES.OVER);
    }
    }

export default PlaceableChecker;