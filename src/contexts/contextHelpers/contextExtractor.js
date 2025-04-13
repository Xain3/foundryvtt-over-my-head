import cloneDeep from 'lodash/cloneDeep';

class ContextExtractor {
    /**
     * Extracts the context initialization configuration from the provided CONFIG object.
     * 
     * This function retrieves the `CONTEXT_INIT` property from the `CONFIG.CONSTANTS` object
     * of a deep copy of the CONFIG, deletes it from the copy, and returns an object 
     * containing the modified CONFIG copy and the extracted context initialization configuration,
     * or just one of them based on returnMode.
     * 
     * @param {Object} CONFIG - The configuration object containing the context initialization settings.
     * @param {string} [returnMode='both'] - Determines what to return ('both', 'config', 'contextInit').
     * @returns {Object|any} Depending on returnMode: 
     *                       - 'both': { CONFIG: Object, contextInit: any }
     *                       - 'config': Object (modified CONFIG copy)
     *                       - 'contextInit': any (extracted contextInit)
     * @throws {Error} If CONFIG, CONFIG.CONSTANTS, or CONFIG.CONSTANTS.CONTEXT_INIT is missing.
     */
    static extractContextInit(CONFIG, returnMode = 'both') {
        function validateArgs() {
            // Added checks for CONFIG and CONFIG.CONSTANTS
            if (!CONFIG || typeof CONFIG !== 'object') {
                throw new Error('CONFIG is not defined or not an object');
            }
            if (!CONFIG.CONSTANTS || typeof CONFIG.CONSTANTS !== 'object') {
                throw new Error('CONFIG.CONSTANTS is not defined or not an object');
            }
            if (!CONFIG.CONSTANTS.CONTEXT_INIT) {
                throw new Error('CONTEXT_INIT is not defined in the configuration object');
            }
            if (typeof returnMode !== 'string') {
                throw new Error('Return Mode is not a string');
            }
        }
        function handleError(error) {
            const baseMessage = error.message || 'An unknown error occurred during context extraction';
            if (returnMode === 'config') {
                console.warn(baseMessage + '. Defaulting to returning the original CONFIG (or a copy if possible).');
                // Attempt to return a copy even in error, but might fail if CONFIG is bad
                try {
                    return cloneDeep(CONFIG); 
                } catch {
                    return CONFIG; // Fallback to original if deep clone fails
                }
            }
            // For 'contextInit' or 'both', rethrow the error as it's critical
            error.message = baseMessage + '. Could not initialize context properly.';
            throw error; 
        }
        try {
            validateArgs();
            // Deep copy CONFIG to avoid mutating the original object
            const copiedConfig = cloneDeep(CONFIG);
            // Extract CONTEXT_INIT from the copy
            const contextInit = copiedConfig.CONSTANTS.CONTEXT_INIT;
            // Delete CONTEXT_INIT from the copy
            delete copiedConfig.CONSTANTS.CONTEXT_INIT;
            
            if (returnMode === 'config') {
                return copiedConfig;
            }
            if (returnMode === 'contextInit') {
                return contextInit;
            }
            // Default 'both'
            return { CONFIG: copiedConfig, contextInit };
        } catch (error) {
            // Pass the error object to handleError
            return handleError(error); 
        }
    }
}

export default ContextExtractor;
