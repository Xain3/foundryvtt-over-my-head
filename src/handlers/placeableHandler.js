// ./src/handlers/placeableHandler.js

import Handler from "../classes/handler";

class IsUnderChecker {    
    static checkMethods = {
        'center-rectangle': this.isCenterUnderRect,
        'rectangle-center': this.isRectUnderCenter,
        'rectangle-rectangle': this.isRectUnderRect,
        'center-center': this.isCenterUnderCenter
    };

    static checkIfIsUnder(targetPosition, targetElevation, referencePosition, referenceElevation, targetUse, referenceUse){
        const methodKey = `${targetUse}-${referenceUse}`;
        const checkMethod = IsUnderChecker.checkMethods[methodKey];
        
        // check if the target is under the reference
        if (checkMethod) {
            return checkMethod.call(this, targetPosition, targetElevation, referencePosition, referenceElevation);
        } else {
            this.utils.logger.warn(`Invalid combination of targetUse ${targetUse} and referenceUse ${referenceUse}`);
            return false;
        }
    }

    static isCenterUnderRect(targetCenter, targetElevation, referencePosition, referenceElevation){  
        if (
            targetCenter.x > referencePosition.BottomLeft.x 
            && targetCenter.x < referencePosition.TopRight.x 
            && targetCenter.y > referencePosition.BottomLeft.y 
            && targetCenter.y < referencePosition.TopRight.y 
            && targetElevation < referenceElevation
        ) {
            return true;
        } else {
            return false;
        }
    }

    static isRectUnderCenter(targetPosition, targetElevation, referenceCenter, referenceElevation){
        if (
            targetPosition.BottomLeft.x < referenceCenter.x 
            && targetPosition.TopRight.x > referenceCenter.x 
            && targetPosition.BottomLeft.y < referenceCenter.y 
            && targetPosition.TopRight.y > referenceCenter.y 
            && targetElevation < referenceElevation
        ) {
            return true;
        } else {
            return false;
        }
    }

    static isRectUnderRect(targetPosition, targetElevation, referencePosition, referenceElevation){
        if (
            targetPosition.BottomLeft.x < referencePosition.TopRight.x 
            && targetPosition.TopRight.x > referencePosition.BottomLeft.x 
            && targetPosition.BottomLeft.y < referencePosition.TopRight.y 
            && targetPosition.TopRight.y > referencePosition.BottomLeft.y 
            && targetElevation < referenceElevation
        ) {
            return true;
        } else {
            return false;
        }
    }

    static isCenterUnderCenter(targetCenter, targetElevation, referenceCenter, referenceElevation){
        if (
            targetCenter.x === referenceCenter.x 
            && targetCenter.y === referenceCenter.y 
            && targetElevation < referenceElevation
        ) {
            return true;
        } else {
            return false;
        }
    }
}

class PlaceableHandler extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = null;
        this.placeables = [];
        this.currentPlaceable = null;
        this.isUnderChecker = new IsUnderChecker(config, context, utils);
    }

    getPlaceables(placeableType = this.placeableType, updateProperty = true, returnValue = true) {
        const placeables = canvas[placeableType]?.placeables || [];
        if (updateProperty) {
            this.placeables = placeables;
        }
        if (returnValue) {
            return placeables;
        }
    }

    setCurrentPlaceable(placeable) {
        this.currentPlaceable = placeable;
    }

    getCorner(corner, placeable = this.currentPlaceable) {
        const allowedCorners = this.config.HANDLERS.PLACEABLE.ALLOWED_CORNERS;
        if (!allowedCorners.includes(corner)) {
            let anchor = { x: placeable.x, y: placeable.y };
            
            switch (corner) {
                case 'topLeft':
                    // Default anchor
                    break;
                case 'topRight':
                    anchor.x += placeable.width;
                    break;
                case 'bottomLeft':
                    anchor.y += placeable.height;
                    break;
                case 'bottomRight':
                    anchor.x += placeable.width;
                    anchor.y += placeable.height;
                    break;
                default:
                    this.utils.logger.warn(`Unknown corner ${corner}.`);
                    return null;
            }
            
            return anchor;
        } else {
            this.utils.logger.warn(`Invalid corner ${corner} provided. Allowed corners are: ${allowedCorners}`);
            return null;
        }
    }
    
    getCenter(placeable = this.currentPlaceable){
        return placeable.center;
    }
    
    getElevation(placeable = this.currentPlaceable){
        return placeable.elevation;
    }

    getRectBounds(placeable = this.currentPlaceable){
        let TopRight = this.getCorner('topRight', placeable);
        let BottomLeft = this.getCorner('bottomLeft', placeable);
        return {TopRight, BottomLeft};
    }
    
    getPosition(placeable, placeableManager, use = 'center'){
        if (use === 'center') {
            return placeableManager.getCenter(placeable);
        }
        if (use === 'rectangle') {
            return placeableManager.getRectBounds(placeable);
        }
    }

    getSelectedPlaceables(placeables = this.placeables) {
        return placeables.filter(placeable => placeable._controlled);
    }

    isSelected(placeable) {
        return placeable._controlled;
    }

    
    isUnder(target, reference, targetManager, referenceManager, targetUse = 'center', referenceUse = 'rectangle'){
        if (this.getDebugMode) {console.log(`Checking if target ${target} is under reference ${reference}`)}; // DEBUG - log the target and reference
        // position of the target
        let targetPosition = getPosition(target, targetManager, targetUse);
        let targetElevation = getElevation(target, targetManager);
        // position of the reference
        let referencePosition = getPosition(reference, referenceManager, referenceUse);
        let referenceElevation = getElevation(reference, referenceManager);
        // check if the target is under the reference
        return IsUnderChecker.checkIfIsUnder(
            targetPosition,
            targetElevation,
            referencePosition,
            referenceElevation,
            targetUse,
            referenceUse
        );
    }

    isOver(target, reference, targetManager, referenceManager, targetUse = 'center', referenceUse = 'rectangle') {
        return !this.isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse);
    }
}

export default PlaceableHandler;