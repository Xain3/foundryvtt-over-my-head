import RemoteContextBase from "./base";
import KeyPathParser from "./parser";
import OperatorValidator from "./validators/operatorValidator";
import RootManager from "./rootManager";

const VALID_KEY_TYPES = ['string', 'number', 'symbol'];

/**
 * RemoteContextOperator is a specialized operator for managing and constructing
 * remote context paths and keys within a configurable context system.
 * 
 * This class extends RemoteContextBase and provides utility methods for parsing
 * keys/paths, constructing and updating context object paths, data paths, flags paths,
 * and settings paths. It maintains internal state for these paths and allows for
 * dynamic updates based on provided parameters.
 * 
 * @extends RemoteContextBase
 * 
 * @param {Object} options - The options for the operator.
 * @param {Object} options.config - The configuration object.
 * @param {*} [options.contextRootIdentifier=undefined] - Optional identifier for the context root.
 * @param {Array|*} [options.validKeyTypes=validKeyTypes] - The valid key types for this operator.
 * 
 * @property {Array|*} validKeyTypes - The valid key types for this operator.
 * @property {*} remoteContextRoot - The root context managed by this operator.
 * @property {string} remoteObjectName - The name of the remote object.
 * @property {string} contextObjectPath - The full path to the context object.
 * @property {string} defaultDataPath - The default data path.
 * @property {string} defaultFlagsPath - The default flags path.
 * @property {string} defaultSettingsPath - The default settings path.
 * @property {string} defaultTimestampKey - The default timestamp key.
 * @property {string} dataPath - The constructed data path.
 * @property {string} flagsPath - The constructed flags path.
 * @property {string} settingsPath - The constructed settings path.
 * @property {KeyPathParser} parser - The internal key/path parser.
 * 
 * @class
 */
class RemoteContextOperator extends RemoteContextBase {
    /**
     * Constructs an instance of the operator with the provided configuration and context.
     *
     * @param {Object} options - The options for the operator.
     * @param {Object} options.config - The configuration object.
     * @param {*} [options.contextRootIdentifier=undefined] - Optional identifier for the context root.
     * @param {Array|*} [options.validKeyTypes=VALID_KEY_TYPES] - The valid key types for this operator.
     *
     * @constructor
     */
    constructor({config, contextRootIdentifier = undefined, validKeyTypes = VALID_KEY_TYPES}) {
        OperatorValidator.ensureKeyTipesExist(validKeyTypes);
        super({config, contextRootIdentifier});
        this.validKeyTypes = validKeyTypes;
        this.rootManager = new RootManager({ config, contextRootIdentifier });
        this.remoteContextRoot = this.rootManager.root; // Set the root context
        this.remoteObjectName = this.remoteContextDefaults.PATH; // this.remoteContextDefaults is passed from the base class
        const pathArgs = (this.remoteContextRoot, this.remoteObjectName); // this.remoteContextDefaults is passed from the base class
        this.contextObjectPath = this.getContextObjectPath(pathArgs); // this.remoteContextDefaults is passed from the base class
        this.defaultDataPath = this.remoteContextDefaults.DATA_PATH; // this.remoteContextDefaults is passed from the base class
        this.defaultFlagsPath = this.remoteContextDefaults.FLAGS_PATH; // this.remoteContextDefaults is passed from the base class
        this.defaultSettingsPath = this.remoteContextDefaults.SETTINGS_PATH; // this.remoteContextDefaults is passed from the base class
        this.defaultTimestampKey = this.remoteContextDefaults.TIMESTAMP_KEY; // this.remoteContextDefaults is passed from the base class
        this.dataPath = this.getDataPath(pathArgs);
        this.flagsPath = this.getFlagsPath(pathArgs);
        this.settingsPath = this.getSettingsPath(pathArgs);
        this.flagsPath = this.getFlagsPath(pathArgs);
        this.settingsPath = this.getSettingsPath(pathArgs);
        this.parser = new KeyPathParser();
    }

    /**
     * Parses the provided key or path using the internal parser.
     *
     * @param {string} keyOrPath - The key or path string to be parsed.
     * @returns {*} The result of parsing the key or path.
     */
    parseKeyOrPath(keyOrPath) {
        return this.parser.parse(keyOrPath);
    }

    /**
     * Constructs and returns the full path to a context object by combining the root and object name.
     *
     * @param {Object} params - The parameters for constructing the context object path.
     * @param {string} [params.root=this.remoteContextRoot] - The root of the remote context.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the remote object.
     * @returns {string} The constructed context object path in the format "root.objectName".
     */
    getContextObjectPath({root = this.remoteContextRoot, objectName = this.remoteObjectName}) {
        OperatorValidator.validatePathArguments([root, objectName]);
        return `${root}.${objectName}`;
    }
    
    /**
     * Constructs a data path string using the provided or default root, object name, and path.
     *
     * @param {Object} params - The parameters for constructing the data path.
     * @param {string} [params.root=this.remoteContextRoot] - The root context for the data path.
     * @param {string} [params.objectName=this.remoteObjectName] - The object name to include in the path.
     * @param {string} [params.path=this.defaultDataPath] - The default data path to append.
     * @returns {string} The constructed data path string in the format `${root}.${objectName}${path}`.
     */
    getDataPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultDataPath}) {
        OperatorValidator.validatePathArguments([root, objectName, path]);
        return `${root}.${objectName}${path}`;
    }

    /**
     * Constructs a flags path string using the provided or default root, object name, and path.
     *
     * @param {Object} params - The parameters for constructing the flags path.
     * @param {string} [params.root=this.remoteContextRoot] - The root context for the path.
     * @param {string} [params.objectName=this.remoteObjectName] - The object name to include in the path.
     * @param {string} [params.path=this.defaultFlagsPath] - The default flags path to append.
     * @returns {string} The constructed flags path string.
     */
    getFlagsPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultFlagsPath}) {
        OperatorValidator.validatePathArguments([root, objectName, path]);
        return `${root}.${objectName}${path}`;
    }

    /**
     * Constructs a settings path string using the provided or default root, object name, and path.
     *
     * @param {Object} params - The parameters for constructing the settings path.
     * @param {string} [params.root=this.remoteContextRoot] - The root context for the settings path.
     * @param {string} [params.objectName=this.remoteObjectName] - The object name to include in the path.
     * @param {string} [params.path=this.defaultSettingsPath] - The default settings path to append.
     * @returns {string} The constructed settings path string.
     */
    getSettingsPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultSettingsPath}) {
        OperatorValidator.validatePathArguments([root, objectName, path]);
        return `${root}.${objectName}${path}`;
    }

    /**
     * Updates the `contextObjectPath` property by generating a new path using the provided
     * root and objectName, or defaults to the instance's `remoteContextRoot` and `remoteObjectName`.
     *
     * @param {Object} params - Parameters for updating the context object path.
     * @param {*} [params.root=this.remoteContextRoot] - The root context to use for the path.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the object to include in the path.
     */
    updateContextObjectPath({root = this.remoteContextRoot, objectName = this.remoteObjectName}) {
        this.contextObjectPath = this.getContextObjectPath({root, objectName});
    }

    /**
     * Updates the `dataPath` property by generating a new path using the provided or default parameters.
     *
     * @param {Object} params - Parameters for updating the data path.
     * @param {*} [params.root=this.remoteContextRoot] - The root context to use for the data path.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the object for the data path.
     * @param {string} [params.path=this.defaultDataPath] - The default path to use if none is provided.
     */
    updateDataPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultDataPath}) {
        this.dataPath = this.getDataPath({root, objectName, path});
    }

    /**
     * Updates the internal `flagsPath` property using the provided or default parameters.
     *
     * @param {Object} [options={}] - Options for updating the flags path.
     * @param {string} [options.root=this.remoteContextRoot] - The root context for the flags path.
     * @param {string} [options.objectName=this.remoteObjectName] - The object name to use in the flags path.
     * @param {string} [options.path=this.defaultFlagsPath] - The default path for the flags.
     */
    updateFlagsPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultFlagsPath}) {
        this.flagsPath = this.getFlagsPath({root, objectName, path});
    }

    /**
     * Updates the settings path for the remote context.
     *
     * @param {Object} params - The parameters for updating the settings path.
     * @param {string} [params.root=this.remoteContextRoot] - The root path for the remote context.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the remote object.
     * @param {string} [params.path=this.defaultSettingsPath] - The default settings path.
     */
    updateSettingsPath({root = this.remoteContextRoot, objectName = this.remoteObjectName, path = this.defaultSettingsPath}) {
        this.settingsPath = this.getSettingsPath({root, objectName, path});
    }

    /**
     * Updates all relevant context paths (object, data, flags, settings) using the provided or default parameters.
     *
     * @param {Object} params - The parameters for updating paths.
     * @param {*} [params.root=this.remoteContextRoot] - The root context to use for path updates.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the context object.
     * @param {string} [params.dataPath=this.defaultDataPath] - The path to the data property.
     * @param {string} [params.flagsPath=this.defaultFlagsPath] - The path to the flags property.
     * @param {string} [params.settingsPath=this.defaultSettingsPath] - The path to the settings property.
     */
    updateAllPaths({root = this.remoteContextRoot, objectName = this.remoteObjectName, dataPath = this.defaultDataPath, flagsPath = this.defaultFlagsPath, settingsPath = this.defaultSettingsPath}) {
        this.updateContextObjectPath({root, objectName});
        this.updateDataPath({root, objectName, path: dataPath});
        this.updateFlagsPath({root, objectName, path: flagsPath});
        this.updateSettingsPath({root, objectName, path: settingsPath});
    }

    /**
     * Updates the context object and all relevant paths using the provided parameters.
     *
     * @param {Object} params - The parameters for updating.
     * @param {*} [params.root=this.remoteContextRoot] - The root context to use.
     * @param {string} [params.objectName=this.remoteObjectName] - The name of the object to update.
     * @param {string} [params.dataPath=this.defaultDataPath] - The data path to use.
     * @param {string} [params.flagsPath=this.defaultFlagsPath] - The flags path to use.
     * @param {string} [params.settingsPath=this.defaultSettingsPath] - The settings path to use.
     */
    update({root = this.remoteContextRoot, objectName = this.remoteObjectName, dataPath = this.defaultDataPath, flagsPath = this.defaultFlagsPath, settingsPath = this.defaultSettingsPath}) {
        this.updateContextObjectPath({root, objectName});
        this.updateAllPaths({root, objectName, dataPath, flagsPath, settingsPath});
    }
}

export default RemoteContextOperator;