// ./src/main.js

import context from './contexts/context.js';
import logger from './utils/logger.js';
import settings from './handlers/settingsHandler.js';

function logState() {
    logger.log('Logging state');
    context.logState();
}

function registerSettings() {
    logger.log('Registering settings');
    settings.registerSettings();
    logger.log('Settings registered');
}

function registerModuleSettings() {
    logger.log('Initializing module');
    Hooks.once('i18nInit', registerSettings);
}

function setupLogStateListener(config) {
    Hooks.on(config.formatHook(config.HOOKS.in['logState'], 'in'), logState);
}

const main = () => {
    // Get the configs from the context
    const config = context.get('config');
    // Register the settings once localization is ready
    registerModuleSettings();
    // Add a hook to log the context state
    setupLogStateListener(config);
};

main();

