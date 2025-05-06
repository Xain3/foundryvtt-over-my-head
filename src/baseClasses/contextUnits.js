import Timestamp from './timestamp.js';

/**
 * Represents a unit within a context, managing its value, timestamp, options,
 * and optionally enforcing type constraints on its children, particularly when the value
 * acts as a container for other objects.
 *
 * This class encapsulates a piece of data (`value`) along with metadata like
 * a timestamp and configuration options. It provides mechanisms to update the value,
 * control how the timestamp behaves upon updates ('update', 'keep', or a number),
 * and validate the type of the assigned `children` against a list of accepted
 * constructor names (`acceptedChildrenTypes`), especially useful when the `value`
 * is expected to be an object or an array of specific object types.
 *
 * @property {*} value - The core data stored by this unit.
 * @property {Object} options - A free-form object for storing additional configuration or metadata associated with the unit. Defaults to `{}`.
 * @property {Timestamp} timestamp - A Timestamp instance managing created, modified, and accessed times.
 *
 * @private
 * @property {string[]} #acceptedChildrenTypes - An array of constructor names (as strings) that are considered valid types for the children, particularly when `#enforceChildrenType` is enabled. Defaults to `['ContextProperty']`.
 * @property {string|number} #timestampBehavior - Defines how the `timestamp` should be handled during updates via the `set` method. Can be 'update', 'keep', or a number. Defaults to 'update'.
 * @property {boolean} #enforceChildrenType - If true, the `set` method will validate the type of the assigned children against `#acceptedChildrenTypes` using `_ensureChildrenTypeIsAccepted`. Defaults to `false`.
 * @property {boolean} #enforceOnlyForObject - If `#enforceChildrenType` is true, this flag determines if the type check should only be performed when the children are an object type. Defaults to `true`.
 * @property {Timestamp} #timestamp - Internal Timestamp instance.
 */

export class ContextUnit {
  #acceptedChildrenTypes;
  #timestampBehavior;
  #enforceChildrenType;
  #enforceOnlyForObject;
  #timestamp; // Use Timestamp instance

  constructor({
    value,
    acceptedChildrenTypes = ['ContextProperty'],
    options = {},
    timestamp = Date.now(), // Initial timestamp value
    timestampBehavior = 'update',
    enforceChildrenType = false,
    enforceOnlyForObject = true,
  }) {
    this.#acceptedChildrenTypes = acceptedChildrenTypes;
    this.value = value;
    this.options = options;
    this.#timestamp = new Timestamp(); // Initialize Timestamp instance
    // If an initial timestamp was provided, set all times to it
    if (typeof timestamp === 'number') {
        this.#timestamp.setTimestamp('all', timestamp);
    }
    this.#timestampBehavior = timestampBehavior;
    this.#enforceChildrenType = enforceChildrenType;
    this.#enforceOnlyForObject = enforceOnlyForObject;
  }

  


  /**
   * Ensures that the provided `children` argument is of an accepted type.
   *
   * @param {*} children - The child or children to validate. Can be a single object or an array of objects.
   * @param {boolean} [onlyForObject=this.enforceOnlyForObject] - If true, only checks if the children are objects.
   * @param {string[]} [acceptedChildrenTypes=this.acceptedChildrenTypes] - An array of accepted constructor names for children.
   * @throws {Error} Throws an error if a child's type is not in the list of accepted types.
   * @returns {boolean} Returns true if all children are of accepted types.
   */
  #ensureChildrenTypeIsAccepted(
    children, 
    onlyForObject = this.#enforceOnlyForObject, 
    acceptedChildrenTypes = this.#acceptedChildrenTypes
  ) {
      if (onlyForObject && typeof children !== 'object') {
        return true;
      }
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (!acceptedChildrenTypes.includes(child.constructor.name)) {
            throw new Error(`Invalid child type: ${child.constructor.name}. Expected one of: ${acceptedChildrenTypes.join(', ')}`);
          }
        });
      } else if (!acceptedChildrenTypes.includes(children.constructor.name)) {
        throw new Error(`Invalid child type: ${children.constructor.name}. Expected one of: ${acceptedChildrenTypes.join(', ')}`);
      }
      return true;
  }

  /**
   * Updates the timestamp property of the instance using the internal Timestamp object.
   *
   * @param {number} [timestamp=Date.now()] - The new timestamp value.
   * @param {'created'|'modified'|'accessed'} [target='modified'] - Which timestamp to update.
   * @returns {this} Returns the instance for method chaining.
   */
  updateTimestamp(timestamp = Date.now(), target = 'modified') {
    this.#timestamp.updateTimestamp(timestamp, target);
    return this;
  }

  /**
   * Sets the timestamp behavior based on the provided value, interacting with the Timestamp instance.
   *
   * @private
   * @param {'update'|'keep'| number} timestampBehaviorValue - Determines how the timestamp should be handled.
   */
  #setTimestampBehavior(timestampBehaviorValue) {
    switch (timestampBehaviorValue) {
      case 'update':
        this.#timestamp.updateTimestamp(Date.now(), 'modified'); // Update modified time
        break;
      case 'keep':
        // Do nothing
        break;
      default:
        if (typeof timestampBehaviorValue !== 'number') {
          throw new Error(`Invalid timestamp behavior: ${timestampBehaviorValue}. Expected 'update', 'keep', or a timestamp number.`);
        }
        // If a number is provided, treat it as setting the 'modified' timestamp
        this.#timestamp.updateTimestamp(timestampBehaviorValue, 'modified');
        break;
    }
  }

  /**
   * Sets a value or a key-value pair in the context property.
   *
   * @param {string|null} [key=null] - The key to set the value for. If null, sets the whole property value directly.
   * @param {*} value - The value to set.
   * @param {Object} [options] - Additional options for setting the value.
   * @param {boolean} [options.timestamp=this.timestampBehavior] - THe timestamp or timestamp behavior to use.
   * @param {boolean} [options.enforceChildrenType=this.enforceChildrenType] - Whether to enforce children type.
   * @param {boolean} [options.enforceOnlyForObject=this.enforceOnlyForObject] - Whether to enforce only for objects.
   * @param {Array} [options.acceptedChildrenTypes=this.acceptedChildrenTypes] - Accepted types for children.
   * @returns {this} Returns the current instance for chaining.
   */
  set(key = null, value, options = {
    timestamp: this.#timestampBehavior,
    enforceChildrenType: this.#enforceChildrenType,
    enforceOnlyForObject: this.#enforceOnlyForObject,
    acceptedChildrenTypes: this.#acceptedChildrenTypes,
  }) {
    if (key === null) {
      // When key is null, the 'value' parameter holds the value to set for the entire unit.
      this.setValue({ value, ...options });
    } else {
      // When key is provided, the 'value' parameter holds the value for that specific key.
      this.setKey({ key, value, ...options });
    }
    return this;
  }
  
  /**
   * Sets a value for a given key in the context property, with optional type enforcement and timestamp behavior.
   *
   * @param {Object} options - The options for setting the value.
   * @param {string} options.key - The key to set the value for. Must be a string.
   * @param {*} options.value - The value to set.
   * @param {*} [options.timestamp=this.timestampBehavior] - The timestamp or timestamp behavior to use.
   * @param {boolean} [options.enforceChildrenType=this.enforceChildrenType] - Whether to enforce accepted children types.
   * @param {boolean} [options.enforceOnlyForObject=this.enforceOnlyForObject] - Whether to enforce type only for objects.
   * @param {Array<string>} [options.acceptedChildrenTypes=this.acceptedChildrenTypes] - List of accepted children types.
   * @throws {Error} If the key is not a string.
   * @throws {Error} If the value is undefined.
   * @returns {this} Returns the instance for chaining.
   */
  setKey({
    key,
    value,
    timestamp = this.#timestampBehavior,
    enforceChildrenType = this.#enforceChildrenType,
    enforceOnlyForObject = this.#enforceOnlyForObject,
    acceptedChildrenTypes = this.#acceptedChildrenTypes,
  }) {
    if (typeof this.value !== 'object') {
      throw new Error(`Invalid value in context property: ${this.value}. Expected an object.`);
    }
    if (typeof value === 'undefined') {
      throw new Error(`Invalid value: ${value}. Expected a defined value.`);
    }
    if (typeof key !== 'string') {
      throw new Error(`Invalid key: ${key}. Expected a string.`);
    }
    if (enforceChildrenType) this.#ensureChildrenTypeIsAccepted(value, enforceOnlyForObject, acceptedChildrenTypes);
    this.#setTimestampBehavior(timestamp);
    this.value[key] = value;
    return this;
  }
  
    /**
   * Sets the value of the whole context property, optionally enforcing type constraints and updating timestamp behavior.
   *
   * @param {object} options - An object containing the parameters for setting the value.
   * @param {*} options.value - The new value to assign to the property.
   * @param {string} [options.timestamp=this.timestampBehavior] - Specifies the timestamp behavior ('keep', 'update', 'fixed'). See `_setTimestampBehavior` for details.
   * @param {boolean} [options.enforceChildrenType=this.enforceChildrenType] - Whether to enforce type checking on the provided value using `_ensureChildrenTypeIsAccepted`.
   * @param {boolean} [options.enforceOnlyForObject=this.enforceOnlyForObject] - If `enforceChildrenType` is true, whether to only perform the check if the `value` is an object. Passed to `_ensureChildrenTypeIsAccepted`.
   * @param {Array<Function|string>} [options.acceptedChildrenTypes=this.acceptedChildrenTypes] - An array of accepted constructor functions or type strings used by `_ensureChildrenTypeIsAccepted` if type enforcement is active.
   * @returns {this} The instance of the ContextProperty, allowing for method chaining.
   * @throws {TypeError} If `enforceChildrenType` is true and the provided `value`'s type is not among the `acceptedChildrenTypes`.
   */  
  setValue({
      value, 
      timestamp = this.#timestampBehavior, 
      enforceChildrenType = this.#enforceChildrenType,
      enforceOnlyForObject = this.#enforceOnlyForObject, 
      acceptedChildrenTypes = this.#acceptedChildrenTypes
    }) {
    if (enforceChildrenType) this.#ensureChildrenTypeIsAccepted(value, enforceOnlyForObject, acceptedChildrenTypes);
    this.#setTimestampBehavior(timestamp);
    this.value = value;
    return this;
  }

  /**
   * Sets the types of children that are accepted by this context property.
   * Validates that the input is an array.
   *
   * @param {string[]} acceptedChildrenTypes - An array of strings representing the accepted children types.
   * @returns {this} The instance of the class for method chaining.
   * @throws {Error} If `acceptedChildrenTypes` is not an array.
   */
  setAcceptedChildrenTypes(acceptedChildrenTypes) {
    if (!Array.isArray(acceptedChildrenTypes)) {
      throw new Error(`Invalid acceptedChildrenTypes: ${acceptedChildrenTypes}. Expected an array.`);
    }
    this.#acceptedChildrenTypes = acceptedChildrenTypes;
    return this;
  }

  setEnforceChildrenType(enforceChildrenType) {
    if (typeof enforceChildrenType !== 'boolean') {
      throw new Error(`Invalid enforceChildrenType: ${enforceChildrenType}. Expected a boolean.`);
    }
    this.#enforceChildrenType = enforceChildrenType;
    return this;
  }
  
  setEnforceOnlyForObject(enforceOnlyForObject) {
    if (typeof enforceOnlyForObject !== 'boolean') {
      throw new Error(`Invalid enforceOnlyForObject: ${enforceOnlyForObject}. Expected a boolean.`);
    }
    this.#enforceOnlyForObject = enforceOnlyForObject;
    return this;
  }

  /**
   * Sets the options for this instance.
   * Validates that the provided options is an object before assigning it.
   * @param {object} options - The options object to set.
   * @returns {this} The instance of the class for chaining.
   * @throws {Error} If the provided options is not an object.
   */
  setOptions(options) {
    if (options === null || options === undefined) {
      throw new Error(`Invalid options: ${options}. Expected an object.`);
    }
    if (typeof options !== 'object') {
      throw new Error(`Invalid options: ${options}. Expected an object.`);
    }
    this.options = options;
    return this;
  }

  /**
   * Retrieves a value based on the provided key. Updates accessed timestamp if recordAccess is true.
   *
   * @param {string|null} [key=null] - The key to retrieve the value for. If null, returns the whole context property's value.
   * @param {boolean} [recordAccess=true] - Whether to update the accessed timestamp.
   * @returns {*} The value associated with the key, or the default value if no key is provided.
   */
  get(key = null, recordAccess = true) {
    if (key === null) {
      return this.getValue(recordAccess); // Pass recordAccess down
    }
    return this.getKey(key, recordAccess); // Pass recordAccess down
  }

  /**
   * Retrieves the value associated with the specified key from the context property. Updates accessed timestamp if recordAccess is true.
   *
   * @param {string} key - The key whose value should be retrieved.
   * @param {boolean} [recordAccess=true] - Whether to update the accessed timestamp.
   * @returns {*} The value associated with the given key.
   * @throws {Error} If the key is not a string or does not exist in the context property.
   */
  getKey(key, recordAccess = true) {
    if (typeof key !== 'string') {
      throw new Error(`Invalid key: ${key}. Expected a string.`);
    }
    if (!this.value.hasOwnProperty(key)) {
      throw new Error(`Key "${key}" does not exist in the context property.`);
    }
    if (recordAccess) {
      this.#timestamp.updateTimestamp(Date.now(), 'accessed'); // Update accessed time
    }
    return this.value[key];
  }

  /**
   * Gets the current value of the whole context property. Updates accessed timestamp if recordAccess is true.
   * @param {boolean} [recordAccess=true] - Whether to update the accessed timestamp.
   * @returns {*} The current value.
   */
  getValue(recordAccess = true) {
    if (recordAccess) {
      this.#timestamp.updateTimestamp(Date.now(), 'accessed'); // Update accessed time
    }
    return this.value;
  }

  /**
   * Gets the specified timestamp ('created', 'modified', 'accessed') from the internal Timestamp object.
   * @param {'created'|'modified'|'accessed'} [target='modified'] - Which timestamp to retrieve.
   * @returns {Date} The requested timestamp Date object.
   */
  getTimestamp(target = 'modified') {
    return this.#timestamp.getTimestamp(target); // Delegate to Timestamp instance
  }

  /**
   * Retrieves properties of the context property instance based on the provided flags. Updates accessed timestamp if recordAccess is true.
   *
   * @param {boolean} [returnValue=true] - Whether to include the 'value' property in the returned object.
   * @param {boolean} [returnTimestamp=true] - Whether to include the 'timestamp' property (modified time) in the returned object.
   * @param {boolean} [returnOptions=false] - Whether to include the 'options' property in the returned object.
   * @param {boolean} [recordAccess=true] - Whether to update the accessed timestamp.
   * @returns {object} An object containing the requested properties.
   */
  getProperty(
    returnValue = true,
    returnTimestamp = true,
    returnOptions = false,
    recordAccess = true) {
    if (recordAccess) {
      this.#timestamp.updateTimestamp(Date.now(), 'accessed'); // Update accessed time
    }
    const output = {};
    if (returnValue) output.value = this.value;
    // Return the 'modified' timestamp Date object
    if (returnTimestamp) output.timestamp = this.#timestamp.getTimestamp('modified');
    if (returnOptions) output.options = this.options;
    return output;
  }

  delete(key) {
    try {
      if (typeof key !== 'string') {
        throw new Error(`Invalid key: ${key}. Expected a string.`);
      }
      if (!this.value.hasOwnProperty(key)) {
        throw new Error(`Key "${key}" does not exist in the context property.`);
      }
      delete this.value[key];
      this.#timestamp.updateTimestamp(Date.now(), 'modified'); // Update modified time
      return this;
    } catch (error) {
      console.error(`Error deleting key "${key}":`, error);
      return false;
    }
  }

  clear() {
    this.value = {};
    this.#timestamp.updateTimestamp(Date.now(), 'modified'); // Update modified time
    return this;
  }
}

/**
 * Represents a property within a context, extending the ContextUnit class.
 * 
 * @class
 * @extends ContextUnit
 * 
 * Public properties:
 * @property {Object} value: The core data stored by this property.
 * @property {object} options: A free-form object for storing additional configuration or metadata associated with the property.
 * @property {number} timestamp: A Unix timestamp (milliseconds since epoch) indicating when the property was last modified or created.
 * 
 * @param {Object} params - The parameters for the context property.
 * @param {*} params.value - The value of the property.
 * @param {Object} [params.options={}] - Additional options for the property.
 * @param {number} [params.timestamp=Date.now()] - The timestamp associated with the property.
 * @param {string} [params.timestampBehavior='update'] - Behavior for handling timestamps ('update', etc.).
 */
export class ContextProperty extends ContextUnit {
  constructor({
    value, 
    options = {}, 
    timestamp = Date.now(),
    timestampBehavior = 'update',
  }) {
    super({
      value, 
      options, 
      timestamp,
      timestampBehavior,
      enforceChildrenType: false, 
    });
  }
}

/**
 * Represents a container within the context system, extending the base ContextUnit.
 * This container is specifically configured to enforce the types of its children,
 * typically holding instances of ContextProperty or similar units.
 *
 * @extends ContextUnit
 * 
 * Public properties:
 * @property {Object} value - The core data stored by this container.
 * @property {object} options - A free-form object for storing additional configuration or metadata associated with the container.
 * @property {number} timestamp - A Unix timestamp (milliseconds since epoch) indicating when the container was last modified or created.
 * 
 * @param {object} config - The configuration object for the ContextContainer.
 * @param {*} [config.value] - The initial value or structure held by the container.
 * @param {string[]} [config.acceptedChildrenTypes=['ContextProperty']] - An array of strings specifying the class names of children types that are allowed within this container.
 * @param {object} [config.options={}] - Additional configuration options for the container.
 * @param {number} [config.timestamp=Date.now()] - The initial timestamp for the container, defaulting to the current time.
 * @param {string} [config.timestampBehavior='update'] - Defines how the timestamp behaves on updates ('update', 'fixed', etc.).
 */
export class ContextContainer extends ContextUnit {
  constructor({
    value = {}, 
    acceptedChildrenTypes = ['ContextProperty', 'ContextContainer'], 
    options = {}, 
    timestamp = Date.now(),
    timestampBehavior = 'update',
  }) {
    super({
      value, 
      acceptedChildrenTypes, 
      options, 
      timestamp,
      timestampBehavior,
      enforceChildrenType: true, 
      enforceOnlyForObject: false,
    })
  }

  /**
   * Retrieves properties from the given object that are instances of `ContextProperty`
   * and adds them to the provided result object.
   *
   * @private
   * @param {Object} value - The object to retrieve properties from.
   * @param {Object} resultObj - The object to store the retrieved properties.
   * @returns {Object} The updated result object containing the retrieved properties.
   */
  #retrieveContainerProperties(value, resultObj) {
    for (const key in value) {
      if (value[key] instanceof ContextProperty) {
        resultObj[key] = value[key];
      }
    }
    return resultObj;
  }

  /**
   * Retrieves all properties from the given object that are instances of `ContextContainer`
   * and adds them to the provided result object.
   *
   * @private
   * @param {Object} value - The object to search for `ContextContainer` instances.
   * @param {Object} resultObj - The object to store the found `ContextContainer` instances.
   * @returns {Object} The updated result object containing the found `ContextContainer` instances.
   */
  #retrieveInnerContainers(value, resultObj) {
    for (const key in value) {
      if (value[key] instanceof ContextContainer) {
        resultObj[key] = value[key];
      }
    }
    return resultObj;
  }

  /**
   * Extracts the values of properties from the given object that are instances of `ContextProperty`
   * and assigns them to the corresponding keys in the result object.
   *
   * @private
   * @param {Object} value - The input object containing properties to be evaluated.
   * @param {Object} resultObj - The object where the extracted property values will be stored.
   * @returns {Object} The updated result object with extracted property values.
   */
  #getContentPropertiesValues(value, resultObj) {
      for (const key in value) {
        if (value[key] instanceof ContextProperty) {
          resultObj[key] = value[key].get();
      }
    }
    return resultObj;
  }

  /**
   * Retrieves content from a specified value object based on the given mode.
   *
   * @param {any} value - The source object or container from which to retrieve content.
   * @param {string} [mode='properties'] - Specifies the type of content to retrieve.
   *   Possible values:
   *   - 'properties': Retrieves container properties (default).
   *   - 'containers': Retrieves inner containers.
   *   - 'units': Retrieves both properties and inner containers.
   *   - 'values': Retrieves the values of content properties.
   *   - 'all': Retrieves container properties and their values.
   *   If an invalid mode is provided, it defaults to 'properties'.
   * @returns {object} An object containing the retrieved content based on the specified mode.
   */
  getContent(value, mode = 'properties') {
    const resultObj = {};
    switch (mode) {
      case 'properties':
        this.#retrieveContainerProperties(value, resultObj);
        break;
      case 'containers':
        this.#retrieveInnerContainers(value, resultObj);
        break;
      case 'units':
        this.#retrieveContainerProperties(value, resultObj);
        this.#retrieveInnerContainers(value, resultObj);
        break;
      case 'values':
        this.#getContentPropertiesValues(value, resultObj);
        break;
      case 'all':
        this.#retrieveContainerProperties(value, resultObj);
        this.#getContentPropertiesValues(value, resultObj);
        break;
      default:
        console.error(`Invalid mode "${mode}" specified. Defaulting to 'properties'.`);
        this.#retrieveContainerProperties(value, resultObj);
        break;
    }
    return resultObj;
  }

  clear() {
    this.value = {};
    this.updateTimestamp(Date.now(), 'modified'); // Update modified time
    return this;
  }
}
