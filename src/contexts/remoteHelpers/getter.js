import RemoteContextOperator from "./operator";
import GetterValidator from "./validators/getterValidator";
import { get, isEqual } from 'lodash';

/**
 * RemoteContextGetter provides advanced getter utilities for retrieving, validating, and formatting
 * data from a remote context root map. It supports nested object access, timestamp management,
 * flexible retrieval modes (object, data, flags, settings), and customizable state synchronization behaviors.
 * 
 * Inherits from RemoteContextOperator and relies on external Validator and lodash.get utilities.
 * 
 * @class
 * @extends RemoteContextOperator
 * 
 * @param {Object} options - Configuration options.
 * @param {Object} options.config - Configuration object for the context.
 * @param {string} [options.contextRootIdentifier] - Optional identifier for the context root.
 * 
 * @example
 * const getter = new RemoteContextGetter({ config: myConfig });
 * const output = getter.get('object', { timestampModified: true });
 * 
 * @see RemoteContextOperator
 */
class RemoteContextGetter extends RemoteContextOperator {
    constructor({config, contextRootIdentifier = undefined}) {
        super({config, contextRootIdentifier});
    }

    /**
     * Retrieves the modified timestamp value from a nested object structure based on the provided source, location, and timestamp key.
     *
     * @param {Object} options - The options object.
     * @param {Object} [options.source=this.remoteContextRoot] - The source object to retrieve the context from.
     * @param {string|string[]} [options.location=this.contextObjectPath] - The path or array of keys indicating the location within the source.
     * @param {string} [options.timestampKey=this.defaultTimestampKey] - The key used to retrieve the timestamp value.
     * @returns {string|number|null} The timestamp value if found (as a string or number), or null if not found or an error occurs.
     */
    _getTimestampModified({ source = this.remoteContextRoot, location = this.contextObjectPath, timestampKey = this.defaultTimestampKey }) {
        const validate = {
            args: () => {
                GetterValidator.validateSource(source);
                GetterValidator.validateLocation(location);
                GetterValidator.validateTimestampKey(timestampKey);
            },
            object: (object, key) => {
                GetterValidator.validateObject(object);
                GetterValidator.validateKeyInObject(object, key);
            }
        }
        try {
            validate.args();
            // Construct the path string
            const path = this.getContextObjectPath({ source, location });
            // Use lodash.get to retrieve the value at the path
            const object = get(this.contextRootMap.rootMap, path);
            if (typeof object === 'string' || typeof object === 'number') {
                        return object; // Return the value directly if it's a string or number
                    }
            validate.object(object, timestampKey);
            return object[timestampKey]; // Return the timestamp value
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the key is not found or any other error occurs           
        }
    }

    /**
     * Builds and validates an output object containing response data and optional timestamps.
     *
     * @param {Object} params - The parameters for building the output.
     * @param {*} params.response - The response data to include in the output.
     * @param {boolean} params.timestampModified - Whether to include the modified timestamp.
     * @param {boolean} params.timestampRetrieved - Whether to include the retrieved timestamp.
     * @param {string} [params.source=this.remoteContextRoot] - The source context for the output.
     * @param {string} [params.location=this.contextObjectPath] - The location context for the output.
     * @param {string} [params.timestampKey=this.defaultTimestampKey] - The key used for timestamp retrieval.
     * @returns {Object|null} The validated output object with response and optional timestamps, or null if validation fails.
     */
    _buildOutput({
        response, 
        timestampModified, 
        timestampRetrieved, 
        source = this.remoteContextRoot, 
        location = this.contextObjectPath,
        timestampKey = this.defaultTimestampKey
    }) {
        const validate = {
            args: () => {
                GetterValidator.validateResponse(response);
                GetterValidator.validateTimestampFlags(timestampModified, timestampRetrieved);
                GetterValidator.validateSource(source);
                GetterValidator.validateLocation(location);
                GetterValidator.validateTimestampKey(timestampKey);
            },
            output: (output) => {
                GetterValidator.validateOutputExists(output);
                GetterValidator.validateOutputHasMinimumKeys(output, 3);
            }
        }

        try {
            validate.args();
            
            let output = {response, modified: null, retrieved: null};
            if (timestampModified) {
                const timestampModifiedValue = this._getTimestampModified({ source, location, timestampKey });
                output.modified = timestampModifiedValue;
            }
            if (timestampRetrieved) {
                const timestampRetrievedValue = Date.now();
                output.retrieved = timestampRetrievedValue;
            }
            // Validate the output object
            validate.output(output);
            return output;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the output is invalid or any other error occurs
        }
    }

    /**
     * Safely retrieves a nested value from an object given an array of keys.
     * @param {string[]} keys - Array of keys representing the path.
     * @param {object} object - The object to traverse.
     * @returns {*} The value at the nested path, or undefined if not found.
     */
    _getNestedValue(keys, object) {
        return keys.reduce((acc, key) => (acc && acc.hasOwnProperty(key)) ? acc[key] : undefined, object);
    }

    _getItemAtPath({ path, item}) {
        const validate = {
            args: () => {
                GetterValidator.validatePath(path);
                GetterValidator.validateItem(item);
            }
        }
        try {
            validate.args();
            const keys = this.parseKeyOrPath(item); // Inherited from RemoteContextOperator
                // Get the base value/object at the given path
                const baseValue = get(this.contextRootMap.rootMap, path); 
                if (baseValue === undefined) { // Use === undefined for clearer check
                    // It might be okay for the base path to not exist yet
                    console.warn(`Base value not found at path: ${path}. Cannot retrieve item [${keys.join('.')}].`);
                    return undefined;
                }
                // If baseValue is not an object, we cannot retrieve nested items
                if (typeof baseValue !== 'object' || baseValue === null) {
                     console.warn(`Value at path ${path} is not an object. Cannot retrieve item [${keys.join('.')}].`);
                     return undefined;
                }
                // Get the nested value using the keys
                const value = this._getNestedValue(keys, baseValue);
                if (value === undefined) {
                    console.warn(`Item [${keys.join('.')}]: not found at path: ${path}`);
                    return undefined; // Return undefined if the item is not found
                }
                return value;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the item is invalid or any other error occurs
        }
    }

    /**
     * Retrieves the value at the specified path from the context root map or from a given item.
     * Validates the provided path and item before attempting to access the value.
     * If the value is not found or an error occurs, logs the error and returns null.
     *
     * @param {Object} params - The parameters object.
     * @param {string|string[]} params.path - The path to the value within the context root map or item.
     * @param {Object} [params.item=null] - Optional item to retrieve the value from instead of the root map.
     * @returns {*} The value found at the specified path, or null if not found or an error occurs.
     */
    _getValueAtPath({ path, item = null}) {
        const validate = {
            args: () => {
                GetterValidator.validatePath(path);
                if (item) {
                    GetterValidator.validateItem(item);
                }
            }
        }
        try {
            validate.args();
            if (item) {
                return this._getItemAtPath({ path, item });
            }
            // If no item (key/path) is specified, just get the value at the main path
            const value = get(this.contextRootMap.rootMap, path); 
            if (value === undefined) {
                 throw new Error(`Value not found at path: ${path}`);
            }
            return value;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the value is invalid or any other error occurs       
        }
    }

    /**
     * Writes the value from the remote state to the pulled object only if the key is missing in the local state.
     *
     * @param {Object} localState - The local state object to check for the key.
     * @param {string} key - The property key to check and potentially write.
     * @param {Object} pulled - The object to which the value will be written if missing in localState.
     * @param {Object} remoteState - The remote state object from which to pull the value.
     */
    _onlyWriteMissing(localState, key, pulled, remoteState) {
        if (!localState.hasOwnProperty(key)) {
            pulled[key] = remoteState[key];
        }
    }

    /**
     * Copies the value of a specified key from the remoteState object to the overwritten object
     * only if the key exists in remoteState.
     *
     * @param {Object} remoteState - The source object to check for the key.
     * @param {string} key - The key to check and potentially copy.
     * @param {Object} overwritten - The target object where the value will be copied if the key exists.
     */
    _overwriteIfExists(remoteState, key, overwritten) {
        if (remoteState.hasOwnProperty(key)) {
            overwritten[key] = remoteState[key];
        }
    }

    /**
     * Determines how to update the local state based on the specified behaviour and the remote state.
     *
     * @param {Object} params - The parameters object.
     * @param {Object} params.localState - The current local state object.
     * @param {Object} params.remoteState - The remote state object to pull from.
     * @param {string} params.behaviour - The behaviour to use for updating the local state.
     *   Possible values:
     *     - 'pull': Replace local state with remote state.
     *     - 'replace': Alias for 'pull'.
     *     - 'merge': Merge remote state into local state, remote values overwrite local ones.
     *     - 'overwriteLocal': Only overwrite keys in localState that also exist in remoteState.
     *     - 'pullMissing': Only add keys from remoteState that are missing in localState.
     *     - 'keep': Keep local state unchanged.
     * @returns {Object} The updated local state according to the specified behaviour.
     * @throws {Error} If an invalid behaviour is specified.
     */
    _determinePullBehaviour({ localState, remoteState, behaviour }) {  
        if (!localState || typeof localState !== 'object') {
            behaviour = 'pull'; // Default to pull if localState is not an object
        }

        switch (behaviour) { 
            case 'pull':
            case 'replace':
                console.warn(`Replacing local state with remote context (behaviour: ${behaviour})`);
                // Pull remote state
                return { ...remoteState }; // Return a copy of remote state                    
            case 'merge':
                console.warn('Merging remote context state into local state.');
                // Merge remote state into local state, remote values overwrite local ones
                return { ...localState, ...remoteState };
            // Case in which only missing values are added
            case 'overwriteLocal':
                console.warn('Overwriting local state with remote context state.');
                // Only overwrite keys in localState that also exist in remoteState
                const overwritten = { ...localState };
                for (const key of Object.keys(localState)) {
                    this._overwriteIfExists(remoteState, key, overwritten);
                }
                return overwritten;
            case 'pullMissing':
                console.warn('Pulling only missing keys from remote context into local state.');
                const pulled = { ...localState };
                for (const key of Object.keys(remoteState)) {
                    this._onlyWriteMissing(localState, key, pulled, remoteState);
                }
                return pulled;
            case 'keep':
                console.warn('Keeping local state unchanged.');
                return localState; // Return local state unmodified
            default:
                throw new Error(`Invalid behaviour: ${behaviour}.`);
        }
    }

    /**
     * Extracts specific data from the output object based on the requested return value.
     *
     * @param {Object} params - The parameters object.
     * @param {Object} params.output - The output object to extract data from. Must have at least 3 keys and pass validation.
     * @param {string} [params.returnValue='context'] - Determines which part of the output to return.
     *        Possible values:
     *        - 'all': Returns the entire output object.
     *        - 'context': Returns the 'response' property from the output.
     *        - 'modified': Returns the 'modified' property from the output.
     *        - 'retrieved': Returns the 'retrieved' property from the output.
     *        - 'only timestamps': Returns an object with only 'modified' and 'retrieved' properties.
     * @returns {any} The extracted value from the output based on the returnValue.
     * @throws {Error} If the output is invalid or if returnValue is not recognized.
     */
    _extractFromOutput({ output, returnValue = 'context' }) {
        const validate = {
            args: () => {
                GetterValidator.validateOutputExists(output);
                GetterValidator.validateOutputHasMinimumKeys(output, 3);
            }
        }
        validate.args();
        
        switch (returnValue) {
            case 'all':
                return output;
            case 'context':
                return output['response'];
            case 'modified':
                return output['modified'];
            case 'retrieved':
                return output['retrieved'];
            case 'only timestamps':
                return {
                    modified: output['modified'],
                    retrieved: output['retrieved']
                };
            default:
                throw new Error(`Invalid return value: ${returnValue}. Expected 'all', 'context', 'modified', 'retrieved', or 'only timestamps'.`);
        }
    }

    /**
     * Extracts and returns all values from the provided output.
     *
     * @param {Object} params - The parameters object.
     * @param {*} params.output - The output to extract values from.
     * @returns {*} The extracted values from the output.
     */
    returnAll({output}) {
        return this._extractFromOutput({ output, returnValue: 'all' });
    }

    /**
     * Extracts and returns the 'context' value from the provided output object.
     *
     * @param {Object} params - The parameters object.
     * @param {*} params.output - The output object to extract the context from.
     * @returns {*} The extracted context value.
     */
    returnContext({output}) {
        return this._extractFromOutput({ output, returnValue: 'context' });
    }

    /**
     * Extracts and returns the 'modified' value from the provided output object.
     *
     * @param {Object} params - The parameters object.
     * @param {any} params.output - The output object to extract the value from.
     * @returns {any} The extracted 'modified' value from the output.
     */
    returnModified({output}) {
        return this._extractFromOutput({ output, returnValue: 'modified' });
    }

    /**
     * Extracts and returns the 'retrieved' value from the provided output object.
     *
     * @param {Object} params - The parameters object.
     * @param {*} params.output - The output object to extract the value from.
     * @returns {*} The value associated with 'retrieved' in the output.
     */
    returnRetrieved({output}) {
        return this._extractFromOutput({ output, returnValue: 'retrieved' });
    }

    /**
     * Extracts and returns only the timestamps from the provided output.
     *
     * @param {Object} params - The parameters object.
     * @param {*} params.output - The output data to extract timestamps from.
     * @returns {*} The extracted timestamps from the output.
     */
    returnOnlyTimestamps({output}) {
        return this._extractFromOutput({ output, returnValue: 'only timestamps' });
    }
    
    /**
     * Generic getter method that retrieves data based on the specified mode.
     * Delegates to specific getter methods (getObject, getData, getFlags, getSettings)
     * based on the provided mode.
     *
     * @param {string} [mode='object'] - The mode determining the type of data to retrieve.
     *   Possible values: 'object', 'data', 'flags', 'settings'.
     * @param {object} [args={}] - An object containing arguments for the getter.
     * @param {object} [args.source=this.remoteContextRoot] - The source object from which to retrieve data. Defaults to the instance's remoteContextRoot.
     * @param {string} [args.location=this.contextObjectPath] - The path within the source object to target. Defaults to the instance's contextObjectPath.
     * @param {string|null} [args.keyOrPath=null] - A specific key or path within the location to retrieve. Defaults to null.
     * @param {boolean} [args.timestampModified=false] - Whether to include a timestamp for the modified time.
     * @param {boolean} [args.timestampRetrieved=false] - Whether to include a timestamp for the retrieved time.
     * @returns {object | null} The retrieved data, including the response and optional timestamps. 
     * @returns {object} [response.response] - The retrieved data object.
     * @returns {number|null} [response.modified] - The modified timestamp, if requested.
     * @returns {number|null} [response.retrieved] - The retrieved timestamp, if requested.
     * @throws {Error} If an unsupported mode is provided.
     */
    get(mode = 'object', args = {}) {
        const validate = {
            args: () => {
                if (!mode) {
                    throw new Error(`Mode must be provided`);
                }
                if (typeof mode !== 'string') {
                    throw new Error(`Mode must be a valid string, received ${typeof mode} instead`);
                }
                if (args === null) {
                    throw new Error(`Arguments object must be provided`);
                }
                if (typeof args !== 'object') {
                    throw new Error(`Arguments object must be a valid object, received ${typeof args} instead`);
                }
            },
        }

        validate.args();    

        switch (mode) {
            case 'object':
                return this.getObject(args);
            case 'data':
                return this.getData(args);
            case 'flags':
                return this.getFlags(args);
            case 'settings':
                return this.getSettings(args);
            default:
                throw new Error(`Unsupported mode: ${mode}`);
        }
    }
    
    /**
     * Retrieves an object from the context root map based on the provided source and location.
     * Validates input arguments and the retrieved object. Optionally includes timestamp information.
     *
     * @param {Object} params - The parameters for retrieving the object.
     * @param {*} [params.source=this.remoteContextRoot] - The source context root to retrieve from.
     * @param {string} [params.location=this.contextObjectPath] - The path location within the context root.
     * @param {boolean} [params.timestampModified=false] - Whether to include the modified timestamp in the output.
     * @param {boolean} [params.timestampRetrieved=false] - Whether to include the retrieved timestamp in the output.
     * @returns {Object|null} The built output object if retrieval and validation succeed, or null if an error occurs.
     */
    getObject({ 
        source = this.remoteContextRoot, 
        location = this.contextObjectPath, 
        timestampModified = false, 
        timestampRetrieved = false 
    }) {
        const validate = {
            args: () => {
                GetterValidator.validateSource(source);
                GetterValidator.validateLocation(location);
                GetterValidator.validateTimestampFlags(timestampModified, timestampRetrieved);
            },
            
            object: (obj) => {
                GetterValidator.validateObject(obj);
                GetterValidator.validateOutputExists(obj);
                GetterValidator.validateOutputHasMinimumKeys(obj, 1);
            },
        }

        try {
            validate.args();
            // Get the path string
            const objectPath = this.getContextObjectPath({ source, location });
            // Use lodash.get to retrieve the actual object from the rootMap using the path
            let object = get(this.contextRootMap.rootMap, objectPath);
            validate.object(object);
            const builtOutput = this._buildOutput({ response: object, timestampModified, timestampRetrieved, source, location });
            return builtOutput;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the object is invalid or any other error occurs
        }
    }
    
   /**
     * Retrieves a specific item (key or nested path) from within an object at a given source and location.
     * 
     * @param {object} args - Arguments object.
     * @param {object} [args.source=this.remoteContextRoot] - The source object.
     * @param {string} [args.location=this.contextObjectPath] - The path within the source object.
     * @param {string} args.key - The key or nested path (e.g., 'a.b.c') of the item to retrieve.
     * @param {boolean} [args.timestampModified=false] - Include modified timestamp.
     * @param {boolean} [args.timestampRetrieved=false] - Include retrieved timestamp.
     * @returns {object|null} The built output containing the item value and optional timestamps, or null on error.
     */
    getItem({ 
        source = this.remoteContextRoot, 
        location = this.contextObjectPath, 
        key, // Renamed from keyOrPath for clarity if it's always treated as an item key/path within the object
        timestampModified = false,
        timestampRetrieved = false
     }) {

        const validate = {
            args: () => {
                GetterValidator.validateSource(source);
                GetterValidator.validateLocation(location);
                GetterValidator.validateKey(key);
                GetterValidator.validateTimestampFlags(timestampModified, timestampRetrieved);
            },
            value: (value, path, itemPath) => {
                 if (value === undefined) { // Check if _getValueAtPath returned undefined (meaning not found)
                    // Error already logged by _getValueAtPath or _getItemAtPath
                    throw new Error(`Item [${itemPath}] not found at path: ${path}`); 
                 }
                 // Add any other necessary value validation here if needed
            }
        }
        try {
            // Validate the arguments
            validate.args();
            // Get the base object path
            const objectPath = this.getContextObjectPath({ source, location });
            // Directly use _getValueAtPath to get the specific item
            // _getValueAtPath internally handles parsing 'key' and getting the nested value
            const value = this._getValueAtPath({ path: objectPath, item: key }); 
            
            // Validate the retrieved value
            validate.value(value, objectPath, key); 

            // Build the standard output structure
            const builtOutput = this._buildOutput({ 
                response: value, 
                timestampModified, 
                timestampRetrieved, 
                source, 
                location 
                // Potentially pass timestampKey if needed by _buildOutput's _getTimestampModified call
                // timestampKey: this.defaultTimestampKey 
            });
            return builtOutput;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if validation fails or item retrieval fails
        }
    }

    /**
     * Retrieves data from a specified path, optionally including modification and retrieval timestamps.
     *
     * @param {Object} options - Options for data retrieval.
     * @param {string|null} [options.key=null] - The key or item to retrieve from the data path.
     * @param {boolean} [options.timestampModified=false] - Whether to include the modification timestamp in the output.
     * @param {boolean} [options.timestampRetrieved=false] - Whether to include the retrieval timestamp in the output.
     * @returns {*} The processed output, potentially including timestamps, based on the provided options.
     */
    getData({ key = null, timestampModified = false, timestampRetrieved = false }) {
        const path = this.getDataPath(); // Assumes this returns the correct string path
        const output = this._getValueAtPath({ path, item: key });
        const builtOutput = this._buildOutput({ response: output, timestampModified, timestampRetrieved });
        return builtOutput;
    }

    /**
     * Retrieves flag data from a specified path and formats the output.
     *
     * @param {Object} options - Options for retrieving flags.
     * @param {*} [options.flag=null] - The specific flag or item to retrieve.
     * @param {boolean} [options.timestampModified=false] - Whether to include the modification timestamp in the output.
     * @param {boolean} [options.timestampRetrieved=false] - Whether to include the retrieval timestamp in the output.
     * @returns {*} The formatted output containing the requested flag data, possibly with timestamps.
     */
    getFlags({ flag = null, timestampModified = false, timestampRetrieved = false }) {
        const path = this.getFlagsPath(); // Assumes this returns the correct string path
        const output = this._getValueAtPath({ path, item: flag });
        const builtOutput = this._buildOutput({ response: output, timestampModified, timestampRetrieved });
        return builtOutput;
    }

    /**
     * Retrieves settings from a specified path, optionally for a specific setting, and includes timestamps if requested.
     *
     * @param {Object} options - Options for retrieving settings.
     * @param {string|null} [options.setting=null] - The specific setting to retrieve. If null, retrieves all settings.
     * @param {boolean} [options.timestampModified=false] - Whether to include the last modified timestamp in the output.
     * @param {boolean} [options.timestampRetrieved=false] - Whether to include the retrieval timestamp in the output.
     * @returns {*} The requested setting(s), possibly including timestamp information.
     */
    getSettings({ setting = null, timestampModified = false, timestampRetrieved = false }) {
        const path = this.getSettingsPath(); // Assumes this returns the correct string path
        const output = this._getValueAtPath({ path, item: setting });
        const builtOutput = this._buildOutput({ response: output, timestampModified, timestampRetrieved });
        return builtOutput;
    }

    /**
     * Synchronizes and retrieves the remote state, applying validation and behaviour rules.
     *
     * @param {Object} params - The parameters for pulling state.
     * @param {Object|null} [params.localState=null] - The current local state to compare with the remote state.
     * @param {string} [params.behaviour='pull'] - Determines how to resolve differences between local and remote state. Must be validated by Validator.validatePullBehaviour.
     * @param {boolean} [params.timestampModified=false] - Whether to include a modified timestamp in the output.
     * @param {boolean} [params.timestampRetrieved=false] - Whether to include a retrieved timestamp in the output.
     * @returns {Object|null} The resulting state after applying the pull behaviour and validation, or null if an error occurs.
     */
    pullState({ localState = null, behaviour = 'pull', timestampModified = false, timestampRetrieved = false }) {
        const validate = {
            args: () => {
                GetterValidator.validatePullBehaviour(behaviour, localState);
                GetterValidator.validateTimestampFlags(timestampModified, timestampRetrieved);
            },
            remoteState: (remoteState) => {
                GetterValidator.validateObject(remoteState);
            },
            output: (output) => {
                // Ensure it returns the validated output or localState
                if (output === undefined || output === null || typeof output !== 'object') {
                    console.warn(`Output is invalid after pull operation. Returning localState.`);
                    return localState;
                }
                return output; // Return the valid output
            }
        }

        try {
            validate.args();
            // Get the remote state
            const remoteState = this.getObject({ source: this.remoteContextRoot, location: this.contextObjectPath });
            validate.remoteState(remoteState);
            if (isEqual(localState, remoteState)) {
                console.warn('Local state is the same as remote state. No changes made.');
                return localState; // Return local state if it's the same as remote
            }
    
            // Determine the new state based on behaviour
            const output = this._determinePullBehaviour({ localState, remoteState, behaviour });
    
            // Validate and return the final output
            validate.output(output);
            const builtOutput = this._buildOutput({ response: output, timestampModified, timestampRetrieved });
            return builtOutput;
        } catch (error) {
            console.error(error.message + ". Returning null.");
            return null; // Return null if the pull operation fails or any other error occurs
            
        }
    }
}

export default RemoteContextGetter;