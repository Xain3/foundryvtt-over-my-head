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
 * @property {number} timestamp - A Unix timestamp (milliseconds since epoch) indicating when the unit was last modified or created. Defaults to `Date.now()`.
 *
 * @private
 * @property {string[]} #acceptedChildrenTypes - An array of constructor names (as strings) that are considered valid types for the children, particularly when `#enforceChildrenType` is enabled. Defaults to `['ContextProperty']`.
 * @property {string|number} #timestampBehavior - Defines how the `timestamp` should be handled during updates via the `set` method. Can be 'update', 'keep', or a number. Defaults to 'update'.
 * @property {boolean} #enforceChildrenType - If true, the `set` method will validate the type of the assigned children against `#acceptedChildrenTypes` using `_ensureChildrenTypeIsAccepted`. Defaults to `false`.
 * @property {boolean} #enforceOnlyForObject - If `#enforceChildrenType` is true, this flag determines if the type check should only be performed when the children are an object type. Defaults to `true`.
 */
export class ContextUnit {
  #acceptedChildrenTypes;
  #timestampBehavior;
  #enforceChildrenType;
  #enforceOnlyForObject;
  constructor({
    value, 
    acceptedChildrenTypes = ['ContextProperty'], 
    options = {}, 
    timestamp = Date.now(),
    timestampBehavior = 'update',
    enforceChildrenType = false, 
    enforceOnlyForObject = true,
  }) {
    this.#acceptedChildrenTypes = acceptedChildrenTypes;
    this.value = value;
    this.options = options;
    this.timestampCreated = timestamp;
    this.timestampModified = timestamp;
    this.timestampAccessed = timestamp;
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
   * Updates the timestamp property of the instance.
   *
   * @param {number} [timestamp=Date.now()] - The new timestamp to set. Defaults to the current time if not provided.
   * @throws {Error} Throws an error if the provided timestamp is not a number.
   * @returns {this} Returns the instance for method chaining.
   */
  updateTimestamp(timestamp = Date.now(), target = 'modified') {
    if (typeof timestamp !== 'number') {
      throw new Error(`Invalid timestamp: ${timestamp}. Expected a number.`);
    }
    switch (target) {
      case 'created': this.timestampCreated = timestamp; break;
      case 'accessed': this.timestampAccessed = timestamp; break;
      case 'modified':
      default: this.timestampModified = timestamp; break;
    }
    return this;
  }

  /**
   * Sets the timestamp behavior based on the provided value.
   *
   * @private
   * @param {'update'|'keep'| number} timestamp - Determines how the timestamp should be handled:
   *   - 'update': Updates the timestamp to the current time.
   *   - 'keep': Leaves the timestamp unchanged.
   *   - number: Sets the timestamp to the specified numeric value.
   * @throws {Error} If the provided timestamp is not 'update', 'keep', 'overwrite', or a number.
   */
  
  #setTimestampBehavior(timestamp) {
    switch (timestamp) {
      case 'update':
        this.updateTimestamp();
        break;
      case 'keep':
        // Do nothing
        break;
      default:
        if (typeof timestamp !== 'number') {
          throw new Error(`Invalid timestamp behavior: ${timestamp}. Expected 'update', 'keep', or a timestamp number.`);
        }
        this.updateTimestamp(timestamp);
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
   * Retrieves a value based on the provided key.
   * If no key is provided, returns the default value.
   *
   * @param {string|null} [key=null] - The key to retrieve the value for. If null, returns the whole context property's value.
   * @returns {*} The value associated with the key, or the default value if no key is provided.
   */
  get(key = null, recordAccess = true) {
    if (key === null) {
      return this.getValue();
    }
    return this.getKey(key);
  }

  /**
   * Retrieves the value associated with the specified key from the context property.
   *
   * @param {string} key - The key whose value should be retrieved.
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
      this.updateTimestamp(Date.now(), 'accessed');
    }
    return this.value[key];
  }

  /**
   * Gets the current value of the whole context property.
   * @returns {*} The current value.
   */
  getValue(recordAccess = true) {
    if (recordAccess) {
      this.updateTimestamp(Date.now(), 'accessed');
    }
    return this.value;
  }

  /**
   * Gets the timestamp associated with this context property.
   * @returns {number} The timestamp value.
   */
  getTimestamp(target = 'modified') {
    switch (target) {
      case 'created': return this.timestampCreated;
      case 'accessed': return this.timestampAccessed;
      case 'modified':
      default: break;
    }
    return this.timestampModified;
  }

  /**
   * Retrieves properties of the context property instance based on the provided flags.
   *
   * @param {boolean} [returnValue=true] - Whether to include the 'value' property in the returned object.
   * @param {boolean} [returnTimestamp=true] - Whether to include the 'timestamp' property in the returned object.
   * @param {boolean} [returnOptions=false] - Whether to include the 'options' property in the returned object.
   * @returns {object} An object containing the requested properties. It can include 'value', 'timestamp', and 'options' depending on the input flags.
   */
  getProperty(
    returnValue = true, 
    returnTimestamp = true, 
    returnOptions = false, 
    recordAccess = true) {
    if (recordAccess) {
      this.updateTimestamp(Date.now(), 'accessed');
    }
    const output = {};
    if (returnValue) output.value = this.value;
    if (returnTimestamp) output.timestamp = this.timestampModified;
    if (returnOptions) output.options = this.options;
    return output;
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
    });
  }
}