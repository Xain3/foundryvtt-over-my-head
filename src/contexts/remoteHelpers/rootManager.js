import RemoteContextBase from "./base";
import RootManagerValidator from "./validators/rootManagerValidator";

class RootManager extends RemoteContextBase {
    constructor({config, contextRootIdentifier = undefined}) {
        super({config, contextRootIdentifier});
        this.root = this._determineRoot(contextRootIdentifier); 
    }
    
    _determineRoot(sourceString, throwError = true, logError = true) {
        if (!RootManagerValidator.validateSourceString(sourceString, 'determine', throwError, logError)) {
            return null; // Return null if validation fails and throwError is false
        }

        try {
            // Validation passed or threw an error already
            const rootMapEntry = this.contextRootMap?.rootMap?.[sourceString];
            if (rootMapEntry === undefined) { 
                const errorMsg = `Could not determine remote context root. Source string '${sourceString}' is not a valid key in the context root map`;
                if (throwError) {
                    throw new Error(errorMsg);
                }
                if (logError) {
                    console.error(errorMsg);
                }
                return null; // Key not found
            }
            console.debug(`[DEBUG] determineContextRoot called with: ${sourceString}`);
            return rootMapEntry;            
        } catch (error) {
            // Catch errors from validation (if throwError=true) or from map access
            if (logError) { // Only log if logError is true
               console.error(error.message);
            }
            // If throwError is true, the error would have already been thrown by the validator or the new Error above.
            // If throwError is false, we reach here after logging (if logError is true), return null.
            return null; 
        }
    }

    /**
     * Sets the `root` property on the given target object. If the target is the current instance,
     * also updates the instance's own `root` property. Logs a warning if the target is invalid.
     *
     * @param {Object} target - The object on which to set the `root` property.
     * @param {*} root - The value to assign to the `root` property.
     * @param {string} source - A string indicating the source of the operation, used for logging.
     */
    _setRootProperty(target, root, source) {
        if (target && typeof target === 'object') {
            target.root = root;
            // Only update this.root if target is this instance
            if (target === this) {
                this.root = root;
            }
        } else {
            console.warn(`[WARN] _manageRootInternal: Cannot set root property on invalid target for source '${source}'.`);
        }
    }

    // Extracted core logic
    /**
     * Manages the root property for a given target object, optionally returning the determined root.
     *
     * @param {Object} options - The options for managing the root.
     * @param {*} options.source - The source from which to determine the root.
     * @param {Object} [options.target=this] - The target object on which to set the root property. Defaults to the current instance.
     * @param {boolean} [options.returnValue=false] - Whether to return the determined root value.
     * @param {boolean} [options.setProperty=true] - Whether to set the root property on the target.
     * @param {string} [options.operationName='manage'] - The name of the operation for logging and error messages.
     * @param {boolean} [options.throwError=true] - Whether to throw errors during validation.
     * @param {boolean} [options.logError=true] - Whether to log errors if not throwing.
     * @returns {*} The determined root if `returnValue` is true, `null` if an error occurs or validation fails without throwing, or `undefined` otherwise.
     */
    _manageRootInternal({ source, target = this, returnValue = false, setProperty = true, operationName = 'manage', throwError = true, logError = true }) {
        // validate arguments
        const areArgsValid = RootManagerValidator.validateManageRootArgs(
            { source, target, returnValue, setProperty, operationName },
            throwError,
            logError
        );

        if (!areArgsValid) {
            // If validation fails and throwError is false, the validator logs the error (if logError is true).
            // We should return null consistent with other failure paths.
            return null;
        }

        // If throwError was true and validation failed, an error would have been thrown already.
        // Proceed only if validation passed (or didn't throw).
        try {
            // Pass throwError and logError down to _determineRoot
            const root = this._determineRoot(source, throwError, logError);

            // Handle the case where _determineRoot returns null (validation failed without throwing, or key not found)
            if (root === null) { 
                 // Error/warning would have been logged by _determineRoot or validator if logError is true
                 return null; // Explicitly return null if root determination failed
            }

            if (setProperty) {
                // Ensure target is actually an object before assigning (already validated by validateManageRootArgs)
                this._setRootProperty(target, root, source);
            }
            
            if (returnValue) {
                return root;
            }
            // Default return undefined if returnValue is false and no error occurred
            return undefined; 
        } catch (error) {
            // This catch block now primarily catches errors from _determineRoot if throwError=true
            // or potentially unexpected errors within this block.
            // Validation errors (with throwError=true) are caught by the caller or handled by areArgsValid check.
            if (logError) { // Log unexpected errors if logError is true
               console.error(`Error during ${operationName} root: ${error.message}`);
            }
            return null; // Return null on errors
        }
    }

    /**
     * Sets the root object by managing the internal root state.
     *
     * @param {Object} params - The parameters for setting the root.
     * @param {*} params.source - The source object to set as root.
     * @param {*} [params.target=this] - The target object on which to set the root. Defaults to the current instance.
     * @param {boolean} [params.returnValue=false] - Whether to return the value after setting.
     * @param {boolean} [params.setProperty=true] - Whether to set the property on the target.
     * @param {boolean} [params.throwError=true] - Whether validation should throw errors.
     * @param {boolean} [params.logError=true] - Whether validation should log errors if not throwing.
     * @returns {*} The result of the internal root management operation.
     */
    setRoot({ source, target = this, returnValue = false, setProperty = true, throwError = true, logError = true }) {
        return this._manageRootInternal({ 
            source, 
            target, 
            returnValue, 
            setProperty, 
            operationName: 'set',
            throwError,
            logError
        });
    }

    /**
     * Retrieves the root object associated with the given source and target.
     *
     * @param {Object} options - The options for retrieving the root.
     * @param {*} options.source - The source object to retrieve the root from.
     * @param {*} [options.target=this] - The target object to use as context. Defaults to the current instance.
     * @param {boolean} [options.returnValue=true] - Whether to return the root value.
     * @param {boolean} [options.setProperty=false] - Whether to set the root property on the target.
     * @param {boolean} [options.throwError=true] - Whether validation should throw errors.
     * @param {boolean} [options.logError=true] - Whether validation should log errors if not throwing.
     * @returns {*} The root object, depending on the provided options.
     */
    getRoot({ source, target = this, returnValue = true, setProperty = false, throwError = true, logError = true }) {
        return this._manageRootInternal({ 
            source, 
            target, 
            returnValue, 
            setProperty, 
            operationName: 'get',
            throwError,
            logError
        });
    }
}

export default RootManager;