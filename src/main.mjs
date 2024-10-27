// ./src/main.mjs

import context from './contexts/context.mjs';
import logger from './utils/logger.mjs';
import settings from './handlers/settingsHandler.mjs';

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



