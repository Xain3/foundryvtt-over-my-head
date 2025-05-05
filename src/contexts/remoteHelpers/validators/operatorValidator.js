export default class OperatorValidator {
    /**
     * Ensures that keyTypes is a valid array.
     * @param {*} keyTypes - The key types to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log an error if validation fails.
     * @param {string} [logLevel='error'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if valid, false otherwise.
     * @throws {Error} If invalid and throwError is true.
     */
    static ensureKeyTipesExist(keyTypes, throwError = true, consoleLog = true, logLevel = 'error') {
        const errorMsg = 'Key types must be an array';
        if (!Array.isArray(keyTypes)) {
            if (throwError) throw new Error(errorMsg);
            if (consoleLog) console[logLevel](errorMsg);
            return false;
        }
        return true;
    }

    /**
     * Validates that all elements in the pathArguments array are strings.
     * @param {Array<*>} pathArguments - The array of path arguments to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log an error if validation fails.
     * @param {string} [logLevel='error'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if valid, false otherwise.
     * @throws {Error} If invalid and throwError is true.
     */
    static validatePathArguments(pathArguments, throwError = true, consoleLog = true, logLevel = 'error') {
        const errorMsg = 'All path arguments must be strings';
        if (!Array.isArray(pathArguments) || !pathArguments.every(arg => typeof arg === 'string')) {
            if (throwError) throw new Error(errorMsg);
            if (consoleLog) console[logLevel](errorMsg);
            return false;
        }
        return true;
    }
}
