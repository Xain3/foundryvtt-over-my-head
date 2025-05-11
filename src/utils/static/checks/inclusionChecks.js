import ErrorMessageBuilder from '../errorMessageBuilder.js';

class InclusionChecks {
  /**
   * Checks if an array contains all specified values.
   * @param {Array} arr - The array to check.
   * @param {Array} valuesToCheck - An array of values to check for inclusion.
   * @returns {{allFound: boolean, missing: Array<string>}} - Result of the check.
   */
  static checkArrayContents(arr, valuesToCheck) {
    // Assumes arr is a valid array and valuesToCheck is a valid array,
    // as these should be validated by the calling public method.
    let allFound = true;
    const missing = [];
    for (const val of valuesToCheck) {
      if (!arr.includes(val)) {
        allFound = false;
        missing.push(String(val));
      }
    }
    return { allFound, missing };
  }

  /**
   * Checks if an object contains all specified keys.
   * @param {object} obj - The object to check.
   * @param {Array<string>} keysToCheck - An array of keys to check for.
   * @returns {{allFound: boolean, missing: Array<string>}} - Result of the check.
   */
  static checkObjectKeyContents(obj, keysToCheck) {
    // Assumes obj is a valid object and keysToCheck is a valid array.
    let allFound = true;
    const missing = [];
    for (const key of keysToCheck) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        allFound = false;
        missing.push(String(key));
      }
    }
    return { allFound, missing };
  }

  /**
   * Checks if an object contains all specified values among its own property values.
   * @param {object} obj - The object to check.
   * @param {Array} valuesToCheck - An array of values to check for.
   * @returns {{allFound: boolean, missing: Array<string>}} - Result of the check.
   */
  static checkObjectValueContents(obj, valuesToCheck) {
    // Assumes obj is a valid object and valuesToCheck is a valid array.
    let allFound = true;
    const missing = [];
    const objectValues = Object.values(obj);
    for (const item of valuesToCheck) {
      if (!objectValues.includes(item)) {
        allFound = false;
        missing.push(String(item));
      }
    }
    return { allFound, missing };
  }

  static objectIncludes(obj, items, {
    checkType = 'keys',
    valueName
  } = {}) {
    const result = {
      value: obj,
      items: items,
      outcome: false,
      checkErrors: [],
      configurationErrors: [],
      missingItems: []
    };

    // Parameter validation for obj
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      const message = ErrorMessageBuilder.buildErrorMessage(valueName || "Target object", "must be a valid object to check for inclusions", obj);
      result.configurationErrors.push(message.trim());
      return result;
    }
    // Parameter validation for items
    if (!Array.isArray(items)) {
      const message = ErrorMessageBuilder.buildErrorMessage("Items to check (for objectIncludes)", "must be an array", items);
      result.configurationErrors.push(message.trim());
      return result;
    }

    let checkResult;
    let errorMessageCore;

    switch (checkType) {
      case 'keys':
        checkResult = InclusionChecks.checkObjectKeyContents(obj, items);
        if (!checkResult.allFound) {
          errorMessageCore = `must include key(s): ${checkResult.missing.join(', ')}`;
          result.checkErrors.push(ErrorMessageBuilder.buildErrorMessage(valueName || "Target object", errorMessageCore, obj).trim());
          result.missingItems = checkResult.missing;
        } else {
          result.outcome = true;
        }
        break;
      case 'values':
        checkResult = InclusionChecks.checkObjectValueContents(obj, items);
        if (!checkResult.allFound) {
          errorMessageCore = `must include value(s): ${checkResult.missing.join(', ')}`;
          result.checkErrors.push(ErrorMessageBuilder.buildErrorMessage(valueName || "Target object", errorMessageCore, obj).trim());
          result.missingItems = checkResult.missing;
        } else {
          result.outcome = true;
        }
        break;
      default:
        const message = `Invalid checkType '${checkType}'. Must be 'keys' or 'values'.`;
        result.configurationErrors.push(message.trim());
        return result; // Return early as this is a configuration error
    }

    return result;
  }

  static arrayIncludes(arr, valuesToCheck, {
    valueName
  } = {}) {
    const result = {
      value: arr,
      items: valuesToCheck,
      outcome: false,
      checkErrors: [],
      configurationErrors: [],
      missingItems: []
    };

    // Parameter validation for arr
    if (!Array.isArray(arr)) {
      const message = ErrorMessageBuilder.buildErrorMessage(valueName || "Target array", "must be a valid array to check for inclusions", arr);
      result.configurationErrors.push(message.trim());
      return result;
    }
    // Parameter validation for valuesToCheck
    if (!Array.isArray(valuesToCheck)) {
      const message = ErrorMessageBuilder.buildErrorMessage("Values to check (for arrayIncludes)", "must be an array", valuesToCheck);
      result.configurationErrors.push(message.trim());
      return result;
    }

    const { allFound, missing } = InclusionChecks.checkArrayContents(arr, valuesToCheck);
    if (allFound) {
      result.outcome = true;
    } else {
      const errorMessageCore = `must include value(s): ${missing.join(', ')}`;
      result.checkErrors.push(ErrorMessageBuilder.buildErrorMessage(valueName || "Target array", errorMessageCore, arr).trim());
      result.missingItems = missing;
    }
    return result;
  }
}

export default InclusionChecks;
