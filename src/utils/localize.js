import CONST from '../constants.js';

const MODULE_ID = CONST.MODULE.ID;

export default function localize(stringKey, ...args) {
    if (args.length > 0) {
        return game.i18n.format(`${MODULE_ID}.${stringKey}`, args);
    } else {
        return game.i18n.localize(`${MODULE_ID}.${stringKey}`);
    }    
}