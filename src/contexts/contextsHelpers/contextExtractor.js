import cloneDeep from 'lodash/cloneDeep';

const validReturnModes = ['both', 'config', 'contextInit'];

class ContextExtractor {
    /**
     * Extracts the context initialization configuration from the provided CONFIG object.
     * 
     * This function retrieves the `CONTEXT.INIT` property from the `CONFIG.CONSTANTS` object
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
     * @throws {Error} If CONFIG, CONFIG.CONSTANTS, or CONFIG.CONSTANTS.CONTEXT.INIT is missing.
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

            if (!CONFIG.CONSTANTS.CONTEXT || typeof CONFIG.CONSTANTS.CONTEXT !== 'object') {
                throw new Error('CONFIG.CONSTANTS.CONTEXT is not defined or not an object');
            }

            if (!CONFIG.CONSTANTS.CONTEXT.INIT || typeof CONFIG.CONSTANTS.CONTEXT.INIT !== 'object') {
                throw new Error('CONFIG.CONSTANTS.CONTEXT.INIT is not defined or not an object');
            }

            if (typeof returnMode !== 'string') {
                throw new Error('Return Mode is not a string');
            }

            if (!validReturnModes.includes(returnMode)) {
                throw new Error(`Return Mode "${returnMode}" is not valid. Must be one of ${validReturnModes.join(', ')}`);
            }
        }
        function handleError(error) {
            const baseMessage = error.message || 'An unknown error occurred during context extraction';
            if (returnMode === 'config' && CONFIG) {
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
            // Extract CONTEXT.INIT from the copy
            const contextInit = copiedConfig.CONSTANTS.CONTEXT.INIT;
            // Delete CONTEXT.INIT from the copy
            delete copiedConfig.CONSTANTS.CONTEXT.INIT;
            
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
