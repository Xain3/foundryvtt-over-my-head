class ContextExtractor {
    static extractContextInit(CONFIG, returnMode = 'both') {
        function validateArgs() {
            if (!CONFIG.CONSTANTS.CONTEXT_INIT) {
                throw new Error('CONTEXT_INIT is not defined in the configuration object');
            }
        }
        function handleError(error) {
            if (returnMode === 'config') {
                console.warn(error.message + '. Defaulting to CONFIG');
                return CONFIG;
            }
            error.message += '. Could not initialize context';
            throw error;
        }
        try {
            validateArgs();
            const contextInit = CONFIG.CONSTANTS.CONTEXT_INIT;
            delete CONFIG.CONSTANTS.CONTEXT_INIT;
            if (returnMode === 'config') {
                return CONFIG;
            }
            if (returnMode === 'contextInit') {
                return contextInit;
            }
            return { CONFIG, contextInit };
        } catch (error) {
            return handleError(error);
        }
    }
}

export default ContextExtractor;
