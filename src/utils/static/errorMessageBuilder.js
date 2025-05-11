class ErrorMessageBuilder {
  static #buildInitialErrorMessage(valueName, errorMessageCore) {
    let message = valueName ? `'${valueName}' ${errorMessageCore}` : errorMessageCore.charAt(0).toUpperCase() + errorMessageCore.slice(1);
    return message;
  }

  static #truncateString(valueStr) {
    if (valueStr.length > 30) {
      valueStr = valueStr.substring(0, 30) + "...";
    }
    return valueStr;
  }

  static #getTypeAndValue(type, actualValue, receivedInfo, valueStr) {
    if (type === 'object' && actualValue.constructor && actualValue.constructor.name && actualValue.constructor.name !== 'Object') {
      receivedInfo = `(received type: ${actualValue.constructor.name}, value: ${valueStr})`;
    } else {
      receivedInfo = `(received type: ${type}, value: ${valueStr})`;
    }
    return receivedInfo;
  }

static #formatValueInfo(actualValue, type, receivedInfo = '') {
    let valueStr = String(actualValue);
    valueStr = ErrorMessageBuilder.#truncateString(valueStr);
    receivedInfo = ErrorMessageBuilder.#getTypeAndValue(type, actualValue, receivedInfo, valueStr);
    return receivedInfo;
  }

  static #formatReceivedValue(actualValue, receivedInfo = '') {
    if (actualValue === undefined) {
      return "(received: undefined)";
    } else if (actualValue === null) {
      return "(received: null)";
    } else {
      const type = typeof actualValue;
      return ErrorMessageBuilder.#formatValueInfo(actualValue, type, receivedInfo);
    }
  }

  static buildErrorMessage(valueName, errorMessageCore, actualValue) {
    let message = ErrorMessageBuilder.#buildInitialErrorMessage(valueName, errorMessageCore);

    let receivedInfo = ErrorMessageBuilder.#formatReceivedValue(actualValue);
    return message + " " + receivedInfo;
  }
}

export default ErrorMessageBuilder;