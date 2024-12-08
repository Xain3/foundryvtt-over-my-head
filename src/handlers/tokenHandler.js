// ./src/handlers/tokenHandler.js


import PlaceableHandler from './placeableHandler.js';

class TokenHandler extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.config.CONSTANTS.HANDLERS.TOKEN.PLACEABLE_TYPE;
    }

    getTokens(updateProperty = true, returnValue = true) {
        return this.getPlaceables(this.placeableType, updateProperty, returnValue);
    }

    getSelectedTokens() {
        return this.getSelectedPlaceables();
    }
    
    setCurrentToken(token) {
        this.setCurrentPlaceable(token);
    }
    
    isUnderReference(token, reference, referenceManager, targetUse = 'center', referenceUse = 'rectangle') {
        return this.isUnder(token, reference, this, referenceManager, targetUse, referenceUse);
    }
    
    isUnderTile(token, tile, tileManager) {
        return this.isUnder(token, tile, this, tileManager);
    }

    isControlled(token) {
        return token.document.isOwner;
    }

    isSelected(token) { //WIP
        return token.isSelected;
    }
}

export default TokenHandler;