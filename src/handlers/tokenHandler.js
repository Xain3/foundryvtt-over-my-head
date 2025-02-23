// ./src/handlers/tokenHandler.js

import TokenGetter from './tokenFunctions/tokenGetter.js';
import TokenSetter from './tokenFunctions/tokenSetter.js';
import TokenChecker from './tokenFunctions/tokenChecker.js';

/**
 * @class TokenHandler
 * @description High-level handler coordinating token operations.
 */
class TokenHandler {
    constructor(config, context, utils) {
        this.getter = new TokenGetter(config, context, utils);
        this.setter = new TokenSetter(config, context, utils);
        this.checker = new TokenChecker(config, context, utils);
        this.all = this.getter.all;
        this.selected = this.getter.selected;
        this.current = this.setter.current;
    }

    // Delegate getter methods
    getTokens(updateProperty = true, returnValue = true) {
        let tokens = this.getter.getTokens(updateProperty, returnValue);
        updateProperty ? this.all = tokens : this.all;
        return returnValue ? tokens : [];
    }

    getSelectedTokens(tokens = null, updateProperty = true, returnValue = true) {
        let selectedTokens = this.getSelectedTokens(tokens, updateProperty, returnValue);
        updateProperty ? this.selected = selectedTokens : this.selected;
        return returnValue ? selectedTokens : [];
    }

    // Delegate setter methods
    setCurrentToken(token, returnValue = true) {
        this.current = this.setter.setCurrentToken(token, returnValue);
        return this.current;
    }

    // Delegate checker methods
    isControlled(token) {
        return this.checker.isControlled(token);
    }

    isSelected(token) {
        return this.checker.isSelected(token);
    }

    isControlledAndSelected(token) {
        return this.checker.isControlledAndSelected(token);
    }

    isUnderReference(token, reference, referenceManager, targetUse, referenceUse) {
        return this.checker.isUnderReference(token, reference, referenceManager, targetUse, referenceUse);
    }

    isUnderTile(token, tile, tileManager) {
        return this.checker.isUnderTile(token, tile, tileManager);
    }
}

export default TokenHandler;