export const VALID_BEHAVIOURS = ['pull', 'merge',  'overwriteLocal', 'pullMissing', 'replace', 'keep'];

/**
 * Validator class for validating various inputs and outputs.
 * Provides static methods to validate different types of data.
 *  
 * @class Validator
 * @static
*/
export default class GetterValidator {
    /**
     * Validates that the timestamp flags are booleans.
     * Throws an error if either flag is not a boolean.
     * @static
     * @param {boolean} timestampModified - Flag indicating if the timestamp was modified.
     * @param {boolean} timestampRetrieved - Flag indicating if the timestamp was retrieved.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if valid, false otherwise.
     * @throws {Error} If invalid and throwError is true.
     */
    static validateTimestampFlags(timestampModified, timestampRetrieved, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (typeof timestampModified !== 'boolean') {
            if (throwError) throw new Error(`Invalid timestampModified: ${timestampModified}. Expected a boolean.`);
            if (consoleLog) console[logLevel](`Invalid timestampModified: ${timestampModified}. Expected a boolean.`);
            return false;
        }
        if (typeof timestampRetrieved !== 'boolean') {
            if (throwError) throw new Error(`Invalid timestampRetrieved: ${timestampRetrieved}. Expected a boolean.`);
            if (consoleLog) console[logLevel](`Invalid timestampRetrieved: ${timestampRetrieved}. Expected a boolean.`);
            return false;
        }
        return true;
    }

    /**
     * Validates the provided key.
     * Ensures the key is a non-null, non-empty string.
     *
     * @static
     * @param {string} key - The key to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateKey(key, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (key === null) {
            if (throwError) throw new Error(`Key must be provided`);
            if (consoleLog) console[logLevel](`Key must be provided`);
            return false;
        }
        if (typeof key !== 'string') {
            if (throwError) throw new Error(`Key must be a valid string, received ${typeof key} instead`);
            if (consoleLog) console[logLevel](`Key must be a valid string, received ${typeof key} instead`);
            return false;
        }
        if (key.length === 0) {
            if (throwError) throw new Error(`Key must not be an empty string`);
            if (consoleLog) console[logLevel](`Key must not be an empty string`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided location is a non-empty string.
     * Throws an error if the location is not provided or not a string.
     *
     * @param {string} location - The location string to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateLocation(location, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!location) {
            if (throwError) throw new Error(`Location string must be provided`);
            if (consoleLog) console[logLevel](`Location string must be provided`);
            return false;
        }
        if (typeof location !== 'string') {
            if (throwError) throw new Error(`Location string must be a valid string, received ${typeof location} instead`);
            if (consoleLog) console[logLevel](`Location string must be a valid string, received ${typeof location} instead`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided source is a non-empty string.
     * Throws an error if the source is missing or not a string.
     *
     * @param {string} source - The source string to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateSource(source, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!source) {
            if (throwError) throw new Error(`Source string must be provided`);
            if (consoleLog) console[logLevel](`Source string must be provided`);
            return false;
        }
        if (typeof source !== 'string') {
            if (throwError) throw new Error(`Source string must be a valid string, received ${typeof source} instead`);
            if (consoleLog) console[logLevel](`Source string must be a valid string, received ${typeof source} instead`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided item is a non-empty string.
     * Throws an error if the item is null, not a string, or an empty string.
     *
     * @param {string} item - The item to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateItem(item, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (item === null) {
            if (throwError) throw new Error(`Item must be provided`);
            if (consoleLog) console[logLevel](`Item must be provided`);
            return false;
        }
        if (typeof item !== 'string') {
            if (throwError) throw new Error(`Item must be a valid string, received ${typeof item} instead`);
            if (consoleLog) console[logLevel](`Item must be a valid string, received ${typeof item} instead`);
            return false;
        }
        if (item.length === 0) {
            if (throwError) throw new Error(`Item must not be an empty string`);
            if (consoleLog) console[logLevel](`Item must not be an empty string`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided path is a non-empty string.
     * Throws an error if the path is not provided or is not a string.
     *
     * @param {string} path - The path to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validatePath(path, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!path) {
            if (throwError) throw new Error(`Path must be provided`);
            if (consoleLog) console[logLevel](`Path must be provided`);
            return false;
        }
        if (typeof path !== 'string') {
            if (throwError) throw new Error(`Path must be a valid string, received ${typeof path} instead`);
            if (consoleLog) console[logLevel](`Path must be a valid string, received ${typeof path} instead`);
            return false;
        }
        return true;
    } 

    /**
     * Validates that the provided timestamp key is a non-empty string.
     *
     * @param {string|null} timestampKey - The key to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateTimestampKey(timestampKey, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (timestampKey === null) {
            if (throwError) throw new Error(`Key must be provided`);
            if (consoleLog) console[logLevel](`Key must be provided`);
            return false;
        }
        if (typeof timestampKey !== 'string') {
            if (throwError) throw new Error(`Key must be a valid string, received ${typeof timestampKey} instead`);
            if (consoleLog) console[logLevel](`Key must be a valid string, received ${typeof timestampKey} instead`);
            return false;
        }
        if (timestampKey.length === 0) {
            if (throwError) throw new Error(`Key must not be an empty string`);
            if (consoleLog) console[logLevel](`Key must not be an empty string`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided argument is a non-empty object.
     * Throws an error if the object is undefined, null, not an object, or empty.
     *
     * @param {object} object - The object to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateObject(object, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (object === undefined || object === null) {
            if (throwError) throw new Error(`Object is invalid`);
            if (consoleLog) console[logLevel](`Object is invalid`);
            return false;
        }
        if (typeof object !== 'object') {
            if (throwError) throw new Error(`Object is not a valid object`);
            if (consoleLog) console[logLevel](`Object is not a valid object`);
            return false;
        }
        if (Object.keys(object).length === 0) {
            if (throwError) throw new Error(`Object is empty`);
            if (consoleLog) console[logLevel](`Object is empty`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the specified key exists in the given object.
     * Throws an error if the key is not found.
     *
     * @param {Object} object - The object to check for the key.
     * @param {string} key - The key to validate in the object.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateKeyInObject(object, key, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!object.hasOwnProperty(key)) {
            if (throwError) throw new Error(`Key '${key}' not found in object`);
            if (consoleLog) console[logLevel](`Key '${key}' not found in object`);
            return false;
        }
        return true;
    }

    /**
     * Validates the given response object to ensure it is a non-empty object.
     *
     * @param {*} response - The response to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateResponse(response, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (response === null) {
            if (throwError) throw new Error(`Response must be provided`);
            if (consoleLog) console[logLevel](`Response must be provided`);
            return false;
        }
        if (response === undefined) {
            if (throwError) throw new Error(`Response must be defined`);
            if (consoleLog) console[logLevel](`Response must be defined`);
            return false;
        }
        if (typeof response !== 'object') {
            if (throwError) throw new Error(`Response must be a valid object, received ${typeof response} instead`);
            if (consoleLog) console[logLevel](`Response must be a valid object, received ${typeof response} instead`);
            return false;
        }
        if (Object.keys(response).length === 0) {
            if (throwError) throw new Error(`Response must not be an empty object`);
            if (consoleLog) console[logLevel](`Response must not be an empty object`);
            return false;
        }
        return true;
    }

    /**
     * Validates that the provided output is neither undefined nor null.
     * Throws an error if the output is invalid.
     *
     * @param {*} output - The value to validate.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateOutputExists(output, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (output === undefined || output === null) {
            if (throwError) throw new Error(`Output is invalid. Returning null.`);
            if (consoleLog) console[logLevel](`Output is invalid. Returning null.`);
            return false;
        }
        return true;
    }
    
    /**
     * Validates that the provided output object contains at least a minimum number of keys.
     * Throws an error if the output does not meet the minimum key requirement.
     *
     * @param {Object} output - The object to validate.
     * @param {number} [min=1] - The minimum number of keys required in the output object.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validateOutputHasMinimumKeys(output, min = 1, throwError = true, consoleLog = true, logLevel = 'warn') {
        let message = `Output is empty. Returning null.`;
        if (min > 1) {
            message = `Output is invalid. Expected at least ${min} keys, but got ${Object.keys(output).length}. Returning null.`;
        }
        if (Object.keys(output).length < min) {
            if (throwError) throw new Error(message);
            if (consoleLog) console[logLevel](message);
            return false;
        }
        return true;
    }

    /**
     * Validates the provided `behaviour` and `localState` parameters for pull operations.
     * Throws an error if the parameters are invalid, and logs warnings for certain edge cases.
     *
     * @param {string} [behaviour] - The behaviour mode to validate. Must be a string and one of the valid behaviours.
     * @param {Object} [localState] - The local state object to validate. Must be an object if provided.
     * @param {boolean} [throwError=true]
     * @param {boolean} [consoleLog=true]
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean}
     * @throws {Error}
     */
    static validatePullBehaviour(behaviour, localState, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (behaviour && typeof behaviour !== 'string') {
            if (throwError) throw new Error(`Invalid behaviour: ${behaviour}. Expected a string.`);
            if (consoleLog) console[logLevel](`Invalid behaviour: ${behaviour}. Expected a string.`);
            return false;
        }
        if (localState && typeof localState !== 'object') {
            if (throwError) throw new Error(`Invalid localState: ${localState}. Expected an object.`);
            if (consoleLog) console[logLevel](`Invalid localState: ${localState}. Expected an object.`);
            return false;
        }
        if (behaviour && !VALID_BEHAVIOURS.includes(behaviour)) {
            if (throwError) throw new Error(`Invalid behaviour: ${behaviour}. Valid options are: ${VALID_BEHAVIOURS.join(', ')}`);
            if (consoleLog) console[logLevel](`Invalid behaviour: ${behaviour}. Valid options are: ${VALID_BEHAVIOURS.join(', ')}`);
            return false;
        }
        if (behaviour === 'pull' && localState) {
            if (consoleLog) console[logLevel](`Behaviour 'pull' is set, but localState is provided. This will be ignored.`);
        }
        if (behaviour === 'pull' && localState === null) {
            if (consoleLog) console[logLevel](`Behaviour 'pull' is set, but no localState is provided. This will be ignored.`);
        }
        if (behaviour === 'pull' && localState === undefined) {
            if (consoleLog) console[logLevel](`Behaviour 'pull' is set, but no localState is provided. This will be ignored.`);
        }
        return true;
    }
}