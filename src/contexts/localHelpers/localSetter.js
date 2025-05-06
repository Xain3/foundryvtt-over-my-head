import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits';
import _ from 'lodash';
import LocalContextManager from '../local';

const defaultBehavior = 'set';

/**
 * Provides a controlled interface for setting values within the local context state managed by a LocalContextManager.
 * This class interacts directly with the underlying ContextContainer holding the state and ensures
 * that modifications are performed according to specified behaviors (set, merge, append, etc.)
 * on the correct target sections (data, flags, settings). It abstracts the complexity of
 * direct state manipulation, value processing (like merging or appending), and timestamp updates.
 * It ensures that values are wrapped in ContextProperty instances before being stored.
 *
 * @param {ContextContainer} contextState - A reference to the main ContextContainer holding the state.
 * @param {LocalContextManager} manager - A reference to the managing LocalContextManager instance.
 * @throws {Error} If contextState is not a valid ContextContainer instance.
 * @throws {Error} If manager is not a valid LocalContextManager instance.
 * @see LocalContextManager
 * @see ContextContainer
 * @see ContextProperty
 */
class LocalContextSetter {
  #contextState; // Reference to the manager's context state container
  #manager;      // Reference to the LocalContextManager instance

  constructor(contextState, manager) {
    if (!(contextState instanceof ContextContainer)) {
      throw new Error("LocalContextSetter requires a valid ContextContainer instance for contextState.");
    }
    if (!manager) {
      throw new Error("LocalContextSetter requires a valid LocalContextManager instance.");
    }
    if (!manager instanceof LocalContextManager) {
      throw new Error("LocalContextSetter requires a valid LocalContextManager instance.");
    }
    this.#contextState = contextState;
    this.#manager = manager;
  }

  /**
   * Appends a value or values to the current value if it is an array.
   * If the value to append is an array, its elements are spread into the result.
   * Throws an error if the current value is not an array.
   *
   * @private
   * @param {*} value - The value or array of values to append.
   * @param {*} currentValue - The current value, expected to be an array.
   * @returns {Array} A new array with the value(s) appended.
   * @throws {Error} If currentValue is not an array.
   */
  #appendValue(value, currentValue) {
    if (Array.isArray(currentValue)) {
          // Ensure the value being appended is treated correctly (e.g., single item vs array spread)
          return Array.isArray(value) ? [...currentValue, ...value] : [...currentValue, value];
        } else {
          // Use the passed key in the error message
          throw new Error(`Cannot append to non-array value at ${keyForErrorMessage}. Current type: ${typeof currentValue}`);
        }
  }

  /**
   * Merges two values if both are non-null objects. 
   * Performs either a shallow or deep merge based on the `shallow` parameter.
   *
   * @param {Object} value - The new value to merge.
   * @param {Object} currentValue - The current value to merge into.
   * @param {string} keyForErrorMessage - The key or path used for error messages.
   * @param {boolean} [shallow=true] - If true, performs a shallow merge; otherwise, performs a deep merge using _.merge.
   * @returns {Object} The merged object.
   * @throws {Error} If either value is not a non-null object.
   */
  #mergeValue(value, currentValue, keyForErrorMessage, shallow = true) {
    // Ensure both are objects and not null
        if (typeof currentValue === 'object' && currentValue !== null && typeof value === 'object' && value !== null) {
        return shallow ? { ...currentValue, ...value } : _.merge(currentValue, value); 
        } else {
          throw new Error(`Cannot merge non-object values at ${keyForErrorMessage}.`);
        }
  }

  /**
   * Merges two objects, preserving existing keys from the current object and adding new keys from the provided value.
   * Existing keys in `currentValue` take precedence over those in `value`.
   *
   * @private
   * @param {Object} value - The object containing new key-value pairs to add.
   * @param {Object} currentValue - The current object whose existing keys should be preserved.
   * @param {string} keyForErrorMessage - The key or path used for error messaging if non-object values are provided.
   * @returns {Object} A new object with keys from both `currentValue` and `value`, where `currentValue` keys take precedence.
   * @throws {Error} Throws if either `value` or `currentValue` is not a non-null object.
   */
  #keepExistingKeysAndAddNew(value, currentValue, keyForErrorMessage) {
     // Ensure both are objects and not null
        if (typeof currentValue === 'object' && currentValue !== null && typeof value === 'object' && value !== null) {
          return { ...value, ...currentValue }; // Shallow merge, existing keys take precedence
        } else {
          throw new Error(`Cannot keep existing value for non-object values at ${keyForErrorMessage}.`);
        }
  }

  /**
   * Processes a value based on the specified behavior.
   *
   * @private
   * @param {*} value - The new value to process.
   * @param {'set'|'append'|'merge'|'deep merge'|'keep existing'} behavior - The behavior to apply when processing the value.
   * The possible behaviors are:
   * - 'set': Sets the value directly.
   * - 'append': Appends the value to the current value if it is an array.
   * - 'merge': Merges the value with the current value if both are objects.
   * - 'deep merge': Deep merges the value with the current value if both are objects.
   * - 'keep existing': Merges the value with the current value, preserving existing keys in the current value.
   * @param {*} currentValue - The current value to be updated.
   * @param {string} keyForErrorMessage - The key used for error messages.
   * @returns {*} The processed value according to the specified behavior.
   * @throws {Error} If an invalid behavior is provided.
   */
  #processValue(value, behavior, currentValue, keyForErrorMessage) {
    switch (behavior) {
      case 'set':
        return value;
      case 'append':
        return this.#appendValue(value, currentValue);
      case 'merge':
        return this.#mergeValue(value, currentValue, keyForErrorMessage);
      case 'deep merge':
        return this.#mergeValue(value, currentValue, keyForErrorMessage, false);
      case 'keep existing':
        return this.#keepExistingKeysAndAddNew(value, currentValue, keyForErrorMessage);
      default:
        throw new Error(`Invalid behavior: ${behavior}`);
    }
  }

  /**
   * Retrieves a container object from the context state based on the provided target key.
   *
   * @private
   * @param {string} targetKey - The key identifying the desired container (e.g., 'data', 'flags', 'settings').
   * @returns {ContextContainer} The container object associated with the target key.
   * @throws {Error} If the target container is not found, invalid, or the key does not correspond to a known container.
   */
  #getObject(targetKey) {
    // If targetKey refers to one of the main containers ('data', 'flags', 'settings')
    if (targetKey === this.#manager.initialDataKey || targetKey === this.#manager.initialFlagsKey || targetKey === this.#manager.initialSettingsKey) {
        const object = this.#contextState.getKey(targetKey);
        if (!object || !(object instanceof ContextContainer)) {
          throw new Error(`Target container "${targetKey}" not found or invalid in context state.`);
        }
        return object;
    }
    // Add handling for other potential targets if needed, otherwise throw error
    else {
        // If targetKey is intended to be the root state itself (e.g., for #setState if redesigned)
        // if (targetKey === this.#contextState) return this.#contextState;
        throw new Error(`Target key "${targetKey}" does not correspond to a known container.`);
    }
  }

  /**
   * Sets a property on a specified target container (such as data, flags, or settings) with the given key and value.
   * Handles merging or appending based on the specified behavior, wraps the value in a ContextProperty,
   * and updates timestamps as needed.
   *
   * @private
   * @param {string} targetContainerKey - The key identifying the target container to modify.
   * @param {string} key - The property key to set within the container.
   * @param {*} value - The new value to set for the property.
   * @param {Object} args - Additional arguments for property setting.
   * @param {string} [args.behavior] - The behavior for setting the value (e.g., merge, append, overwrite).
   * @param {boolean} [args.timestamp] - Whether to update the manager's modified timestamp.
   */
  #setProperty(targetContainerKey, key, value, args) {
    const { behavior, timestamp } = args;
    // Get the specific container (data, flags, settings)
    const targetContainer = this.#getObject(targetContainerKey);

    // Get current value *if it exists* and is a ContextProperty
    let currentValue = null;
    if (targetContainer.value.hasOwnProperty(key) && targetContainer.value[key] instanceof ContextProperty) {
        currentValue = targetContainer.value[key].getValue(false); // Get raw value without updating access time
    } else if (targetContainer.value.hasOwnProperty(key)) {
        // Handle cases where the key exists but isn't a ContextProperty (potentially indicates state corruption)
        console.warn(`Key "${key}" in target "${targetContainerKey}" exists but is not a ContextProperty.`);
        // Decide how to handle this: overwrite, throw error, etc. Overwriting for now.
        currentValue = targetContainer.value[key]; // Use the raw value if merging/appending is still desired
    }

    // Calculate the new raw value based on behavior
    const newValueRaw = this.#processValue(value, behavior, currentValue, `${targetContainerKey}.${key}`);

    // Wrap the new raw value in a ContextProperty
    const newValueProperty = new ContextProperty({ value: newValueRaw });

    // Set the ContextProperty into the target container
    targetContainer.set(key, newValueProperty); // ContextContainer.set handles its own timestamp via behavior

    // Optionally update the manager's timestamp if the container's timestamp was updated
    // Note: ContextContainer's timestamp behavior might be 'keep', check if an update actually happened if needed.
    // A simpler approach is to always update the manager timestamp on any set operation via the setter.
    if (timestamp) { // Assuming the 'timestamp' arg controls manager update here
        this.#manager.updateModifiedTimestamp(); // Use manager's method
    }
  }

  /**
   * Sets a property value in the target container using the provided key and value.
   *
   * @private
   * @param {string} key - The key of the property to set.
   * @param {*} value - The value to assign to the property.
   * @param {...any} args - Additional arguments to pass to the setter.
   */
  #setData(key, value, args) {
    const targetContainerKey = this.#manager.initialDataKey;
    this.#setProperty(targetContainerKey, key, value, args);
  }

  /**
   * Sets a flag value for a given key within the initial flags container.
   *
   * @private
   * @param {string} key - The key for the flag to set.
   * @param {*} value - The value to assign to the flag.
   * @param {...any} args - Additional arguments to pass to the property setter.
   */
  #setFlags(key, value, args) {
    const targetContainerKey = this.#manager.initialFlagsKey;
    this.#setProperty(targetContainerKey, key, value, args);
  }

  /**
   * Sets a setting value for a given key within the initial settings container.
   *
   * @private
   * @param {string} key - The key of the setting to update.
   * @param {*} value - The value to assign to the setting.
   * @param {...any} args - Additional arguments to pass to the property setter.
   */
  #setSettings(key, value, args) {
    const targetContainerKey = this.#manager.initialSettingsKey;
    this.#setProperty(targetContainerKey, key, value, args);
  }

  /**
   * Sets a value in the local context state.
   * @param {string} key - The key to set within the target container.
   * @param {*} value - The value to set.
   * @param {object} [args={}] - Optional arguments.
   * @param {'data'|'flags'|'settings'} [args.target='data'] - The state section to target.
   * @param {'set'|'append'|'merge'|'keep existing'} [args.behavior='set'] - How to handle existing values.
   * Possible values:
   * - 'set': Overwrites the value.
   * - 'append': Appends the value to the current value if it's an array.
   * - 'merge': Merges the value with the current value if both are objects.
   * - 'deep merge': Deep merges the value with the current value if both are objects.
   * - 'keep existing': Merges the value with the current value, preserving existing keys in the current value.
   * @param {boolean} [args.timestamp=true] - Whether to update the manager's modified timestamp.
   */
  set(
    key,
    value,
    { 
      target = 'data',
      behavior = defaultBehavior,
      timestamp = true
    } = {} 
  ) {
    // Pass the full args object down
    const operationArgs = { behavior, timestamp };

    switch (target) {
      case 'data':
        this.#setData(key, value, operationArgs);
        break;
      case 'flags':
        this.#setFlags(key, value, operationArgs);
        break;
      case 'settings':
        this.#setSettings(key, value, operationArgs);
        break;
      default:
        throw new Error(`Invalid target: ${target}`);
    }
  }
}

export default LocalContextSetter;