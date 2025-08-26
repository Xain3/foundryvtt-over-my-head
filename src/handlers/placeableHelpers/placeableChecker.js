/**
 * @file placeableChecker.js
 * @description Checks various conditions and positional relationships for placeable entities.
 * @path src/handlers/placeableHelpers/placeableChecker.js
 */

// ./src/handlers/placeableFunctions/placeableChecker.js

import Handler from '../../baseClasses/handler.js';
import PositionChecker from './positionChecker.js';
import { CHECK_TYPES } from './positionChecker.fallbacks.js';

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
        this.logger = utils.logger;

        this._initializeConstants(config);
    }

    /**
     * Initialize constants and configuration from the provided config.
     * @private
     * @param {Object} config - Configuration settings.
     */
    _initializeConstants(config) {
        // Get constants from config, with fallbacks
        const pcCfg = (config && config.constants && config.constants.positionChecker) || {};
        this.CHECK_TYPES = Object.freeze({ ...CHECK_TYPES, ...(pcCfg.checkTypes || {}) });
        this.POSITION_USES = Object.freeze({ ...POSITION_USES, ...(pcCfg.positionUses || {}) });

        // Set up debug flag from config
        this.debugEnabled = (config && config.constants && config.constants.debug) || false;
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
        return placeable.controlled;
    }

    /**
     * Determines if a placeable is under another placeable.
     *
     * @param {Object} target - The target placeable.
     * @param {Object} reference - The reference placeable.
     * @param {Object} targetManager - The manager of the target placeable.
     * @param {Object} referenceManager - The manager of the reference placeable.
     * @param {string} [targetUse] - The use case for the target position. Defaults to CENTER from config or fallback.
     * @param {string} [referenceUse] - The use case for the reference position. Defaults to RECTANGLE from config or fallback.
     * @param {string} [checkType] - The type of check to perform. Defaults to UNDER from config or fallback.
     * @returns {boolean} True if the target is under the reference, else false.
     */
    isUnder(target, reference, targetManager, referenceManager, targetUse = 'center', referenceUse = 'rectangle', checkType = 'under') {
        if (this.utils?.logger?.isDebugMode?.()) this.utils.logger.log(`Checking if target ${target} is under reference ${reference}`);
        // position of the target
        let targetPosition = this.getter.getPosition(target, targetManager, targetUse);
        let targetElevation = this.getter.getElevation(target, targetManager);
        // position of the reference
        let referencePosition = this.getter.getPosition(reference, referenceManager, referenceUse);
        let referenceElevation = this.getter.getElevation(reference, referenceManager);
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
     * @param {Object} target - The target placeable.
     * @param {Object} reference - The reference placeable.
     * @param {Object} targetManager - The manager of the target placeable.
     * @param {Object} referenceManager - The manager of the reference placeable.
     * @param {string} [targetUse='center'] - The use case for the target position.
     * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
     * @param {string} [checkType='over'] - The type of check to perform.
     */
    isOver(target, reference, targetManager, referenceManager, targetUse = 'center', referenceUse = 'rectangle', checkType = CHECK_TYPES.OVER) {
        return this.isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType);
    }
}

export default PlaceableChecker;