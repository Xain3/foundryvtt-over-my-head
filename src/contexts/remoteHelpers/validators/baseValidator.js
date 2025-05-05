/**
 * BaseValidator provides static utility methods for validating configuration objects
 * and override parameters used in remote helper contexts. It ensures the presence
 * and correct structure of required configuration properties and throws custom errors
 * when validation fails.
 *
 * @class
 * @static
 */
export default class BaseValidator {
    static ConfigError = class extends Error {
        constructor(message) {
            super(message);
            this.name = "ConfigError";
        }
    }

    static OverrideGlobalError = class extends Error {
        constructor(message) {
            super(message);
            this.name = "OverrideGlobalError";
        }
    }

    static OverrideModuleError = class extends Error {
        constructor(message) {
            super(message);
            this.name = "OverrideModuleError";
        }
    }

    /**
     * Ensures that the configuration object contains a valid REMOTE.ROOT string property.
     * If the property is missing or not a string, it logs a warning and defaults to a fallback value.
     * If throwError is true, it throws a ConfigError instead of logging a warning.
     * 
     * NOTE: This method behaves differently from the others "ensureIn*" in this class as
     * it does not throw an error by default. It is designed to be used in a way that
     * allows for a fallback value to be used if the ROOT property is not provided.
     *
     * @param {Object} config - The configuration object to validate.
     * @param {boolean} [throwError=false] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If REMOTE.ROOT is missing or not a string.
     */
    static ensureRootInRemoteDefaults(config, throwError = false, consoleLog = true, logLevel = 'warn') {
        if (!config.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT || typeof config.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.ROOT !== "string") {
            if (throwError) {
                throw new this.ConfigError("Config must contain a CONTEXT.DEFAULTS.REMOTE.ROOT string.");
            }
            if (consoleLog) {
                console[logLevel]("Config should contain a CONTEXT.DEFAULTS.REMOTE.ROOT string. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that the provided configuration object contains a valid CONTEXT.DEFAULTS.REMOTE object.
     * Throws a ConfigError if the REMOTE property is missing or not an object.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {Object} config - The configuration object to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If CONTEXT.DEFAULTS.REMOTE is missing or not an object.
     */
    static ensureRemoteDefaults(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!config.CONSTANTS.CONTEXT.DEFAULTS.REMOTE || typeof config.CONSTANTS.CONTEXT.DEFAULTS.REMOTE !== "object") {
            if (throwError) {
                throw new this.ConfigError("Config must contain a CONTEXT.DEFAULTS.REMOTE object.");
            }
            if (consoleLog) {
                console[logLevel]("Config should contain a CONTEXT.DEFAULTS.REMOTE object. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that the provided config object contains a valid CONTEXT.DEFAULTS object.
     * Throws a ConfigError if CONTEXT.DEFAULTS is missing or not an object.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {Object} config - The configuration object to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If CONTEXT.DEFAULTS is missing or not an object.
     */
    static ensureDefaultsInContext(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!config.CONSTANTS.CONTEXT.DEFAULTS || typeof config.CONSTANTS.CONTEXT.DEFAULTS !== "object") {
            if (throwError) {
                throw new this.ConfigError("Config must contain a CONTEXT.DEFAULTS object.");
            }
            if (consoleLog) {
                console[logLevel]("Config should contain a CONTEXT.DEFAULTS object. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that the provided config object contains a valid CONTEXT object within its CONSTANTS property.
     * Throws a ConfigError if the CONTEXT property is missing or not an object.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {Object} config - The configuration object to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If config.CONSTANTS.CONTEXT is missing or not an object.
     */
    static ensureContextInConstants(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!config.CONSTANTS.CONTEXT || typeof config.CONSTANTS.CONTEXT !== "object") {
            if (throwError) {
                throw new this.ConfigError("Config must contain a CONTEXT object.");
            }
            if (consoleLog) {
                console[logLevel]("Config should contain a CONTEXT object. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that the provided configuration object contains a valid CONSTANTS object.
     * Throws a ConfigError if the CONSTANTS property is missing or not an object.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {Object} config - The configuration object to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If the config does not contain a valid CONSTANTS object.
     */
    static ensureConstantsInConfig(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!config.CONSTANTS || typeof config.CONSTANTS !== "object") {
            if (throwError) {
                throw new this.ConfigError("Config must contain a CONSTANTS object.");
            }
            if (consoleLog) {
                console[logLevel]("Config should contain a CONSTANTS object. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that the provided config parameter is a non-null object.
     * Throws a ConfigError if the validation fails.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {*} config - The configuration value to validate.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If config is not a valid object.
     */
    static ensureConfigIsObject(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (typeof config !== "object" || config === null) {
            if (throwError) {
                throw new this.ConfigError("Config must be a valid object.");
            }
            if (consoleLog) {
                console[logLevel]("Config should be a valid object. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Ensures that a configuration object is provided.
     * Throws a ConfigError if the config parameter is missing or falsy.
     * If throwError is false it logs a warning instead of throwing an error.
     *
     * @param {*} config - The configuration object to check.
     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @param {boolean} [consoleLog=true] - Whether to log a warning to the console if validation fails.
     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @returns {boolean} Returns true if the validation passes, otherwise false. This is only if throwError is false.
     * @throws {ConfigError} If the config is not provided.
     */
    static ensureConfigIsProvided(config, throwError = true, consoleLog = true, logLevel = 'warn') {
        if (!config) {
            if (throwError) {
                throw new this.ConfigError("Config is required.");
            }
            if (consoleLog) {
                console[logLevel]("Config should be provided. Defaulting to fallback value.");
            }
            return false;
        }
        return true;
    }

    /**
     * Validates the provided configuration object by performing a series of checks.
     * Ensures the config is provided, is an object, contains required constants,
     * includes context within constants, has defaults in context, includes remote defaults,
     * and has a root property in remote defaults.
     *
     * @param {Object} config - The configuration object to validate.
+     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
     * @throws {Error} If any of the validation checks fail.
     */
-    static validateConfig(config) {
-        BaseValidator.ensureConfigIsProvided(config);
-        BaseValidator.ensureConfigIsObject(config);
-        BaseValidator.ensureConstantsInConfig(config);
-        BaseValidator.ensureContextInConstants(config);
-        BaseValidator.ensureDefaultsInContext(config);
-        BaseValidator.ensureRemoteDefaults(config);
-        BaseValidator.ensureRootInRemoteDefaults(config);
+    static validateConfig(config, throwError = true) {
+        BaseValidator.ensureConfigIsProvided(config, throwError);
+        BaseValidator.ensureConfigIsObject(config, throwError);
+        BaseValidator.ensureConstantsInConfig(config, throwError);
+        BaseValidator.ensureContextInConstants(config, throwError);
+        BaseValidator.ensureDefaultsInContext(config, throwError);
+        BaseValidator.ensureRemoteDefaults(config, throwError);
+        BaseValidator.ensureRootInRemoteDefaults(config, throwError); // Note: ensureRootInRemoteDefaults defaults throwError to false
         return true;
     }
 
    /**
     * Validates that the provided context root identifier is a string.
     *
     * @param {*} contextRootIdentifier - The value to validate as a context root identifier.
     * @param {boolean} [consoleLog=true] - Whether to log warnings to the console if validation fails.
+     * @param {string} [logLevel='warn'] - The console log level ('error' or 'warn').
     * @param {boolean} [throwError=false] - Whether to throw an error if validation fails.
     * @returns {boolean} Returns true if the context root identifier is valid, otherwise false.
     * @throws {ConfigError} Throws an error if validation fails and throwError is true.
     */
-    static validateContextRootIdentifier(contextRootIdentifier, consoleLog = true, throwError = false) {
+    static validateContextRootIdentifier(contextRootIdentifier, consoleLog = true, logLevel = 'warn', throwError = false) {
         if (contextRootIdentifier && typeof contextRootIdentifier !== 'string') {
             if (throwError) {
                 throw new this.ConfigError(`Context root identifier should be a string. Received ${typeof contextRootIdentifier} instead. Falling back to default value.`);
             }
             if (consoleLog) {
-                console.warn(`Context root identifier should be a string. Received ${typeof contextRootIdentifier} instead. Falling back to default value.`);
+                console[logLevel](`Context root identifier should be a string. Received ${typeof contextRootIdentifier} instead. Falling back to default value.`);
             }
             return false
         }
 
         if (!contextRootIdentifier) {
             if (throwError) {
                 throw new this.ConfigError(`Context root identifier is not provided. Falling back to default value.`);
             }
             if (consoleLog) {
-                console.warn(`Context root identifier is not provided. Falling back to default value.`);
+                console[logLevel](`Context root identifier is not provided. Falling back to default value.`);
             }
             return false
         }
         return true
     }
 
    /**
     * Validates that the provided overrideGlobal parameter is either undefined/null or an object.
     * Throws an OverrideGlobalError if the value is not an object.
     *
     * @param {*} overrideGlobal - The value to validate as an override global.
     * @throws {OverrideGlobalError} If overrideGlobal is defined and not an object.
     */
    static validateOverrideGlobal(overrideGlobal) {
        if (overrideGlobal && typeof overrideGlobal !== 'object') {
            throw new this.OverrideGlobalError(`Override global should be an object. Received ${typeof overrideGlobal} instead.`);
        }
    }

    /**
     * Validates that the provided overrideModule is an object.
     * Throws an OverrideModuleError if the validation fails.
     *
     * @param {*} overrideModule - The module to validate as an override.
     * @throws {OverrideModuleError} If overrideModule is not an object.
     */
    static validateOverrideModule(overrideModule) {
        if (overrideModule && typeof overrideModule !== 'object') {
            throw new this.OverrideModuleError(`Override module should be an object. Received ${typeof overrideModule} instead.`);
        }
    }

    /**
     * Validates the provided arguments for configuration and override options.
     *
     * @param {Object} config - The configuration object to validate.
     * 
     * @param {string} [contextRootIdentifier] - Optional identifier for the context root. (not validated as it's optional)
     * 
     * @param {*} overrideGlobal - The global override value to validate.
     * @param {*} overrideModule - The module override value to validate.
+     * @param {boolean} [throwError=true] - Whether to throw an error if validation fails.
      * @throws {Error} If any of the required arguments are invalid.
      */
-    static validateArgs({config, contextRootIdentifier, overrideGlobal, overrideModule}) {
-        BaseValidator.validateConfig(config);
-        // Context root identifier is optional, so we don't validate it here
+    static validateArgs({config, contextRootIdentifier, overrideGlobal, overrideModule}, throwError = true) {
+        BaseValidator.validateConfig(config, throwError);
+        BaseValidator.validateContextRootIdentifier(contextRootIdentifier, true, 'warn', throwError); // Validate if provided, but don't require it
         BaseValidator.validateOverrideGlobal(overrideGlobal);
         BaseValidator.validateOverrideModule(overrideModule);
     }
}