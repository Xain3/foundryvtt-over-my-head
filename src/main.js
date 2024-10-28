// ./src/main.js

import context from './contexts/context.js';
import logger from './utils/logger.js';
import settings from './handlers/settingsHandler.js';

function registerSettings() {
    logger.log('Registering settings');
    settings.registerSettings();
    logger.log('Settings registered');
}

const main = () => {
    // Register the settings once localization is ready
    logger.log('Initializing module');
    Hooks.once('i18nInit', registerSettings);
};

main();



