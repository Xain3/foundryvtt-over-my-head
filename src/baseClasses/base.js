// ./src/baseClasses/handler.js

class Base {
    constructor(config) {
        this.config = config;
        this.const = config.CONST;
        this.moduleConstants = config.CONST.MODULE;
        this.game = this.getGameObject();
        this.context = null
    }

    getDebugMode() {
        if (this.context){
        return this.context.getFlag('debugMode');
        }
        return this.moduleConstants.DEFAULTS.DEBUG_MODE;
    }

    /**
     * Retrieves the global game object.
     *
     * @method getGameObject
     * @returns {Object} The global game object.
     */
    getGameObject() {
        return globalThis.game;
    }

}