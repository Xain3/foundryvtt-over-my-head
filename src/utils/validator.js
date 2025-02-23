let errorMessage;
let valid = true;

class Validator {
    constructor(messagePrefix = '') {
        this.messagePrefix = messagePrefix;
    }
    
    isDefined(value, valueName = 'Value') {
        valid = true;
        if (value === undefined || value === null) {
            errorMessage = `${valueName} is not defined`;
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isString(value, valueName = 'Value') {
        valid = true;
        if (typeof value !== 'string') {
            errorMessage = `${valueName} is not a string`;
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isNumber(value) {
        valid = true;
        if (typeof value !== 'number') {
            errorMessage = 'Value is not a number';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isBoolean(value) {
        valid = true;
        if (typeof value !== 'boolean') {
            errorMessage = 'Value is not a boolean';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isArray(value) {
        valid = true;
        if (!Array.isArray(value)) {
            errorMessage = 'Value is not an array';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isObject(value) {
        valid = true;
        if (typeof value !== 'object') {
            errorMessage = 'Value is not an object';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isFunction(value) {
        valid = true;
        if (typeof value !== 'function') {
            errorMessage = 'Value is not a function';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isSymbol(value) {
        valid = true;
        if (typeof value !== 'symbol') {
            errorMessage = 'Value is not a symbol';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isValidType(value, allowedTypes, valueName = 'Value') {
        valid = true;
        const allowedDataTypes = ['string', 'number', 'array', 'object'];
        if (!allowedDataTypes.includes(typeof allowedTypes)) {
            errorMessage = 'Error: validTypes must be a string, number, array, or object';
            valid = false;
            return { valid, errorMessage };
        }
        if (!allowedTypes === 'string') {
            allowedTypes = [allowedTypes];
        }
        if (!allowedTypes || !allowedTypes.length) {
            errorMessage = `No valid types provided for validation of ${valueName}`;
            valid = false;
            return { valid, errorMessage };
        }

        if (!allowedTypes.includes(typeof value)) {
            errorMessage = `${valueName} is not a valid type`;
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }

    isVakidKey(key, allowedTypes = ['string', 'number', 'symbol']) {
        valid = true;
        if (!allowedTypes.includes(typeof key)) {
            errorMessage = 'Key is not a valid type';
            valid = false;
            return { valid, errorMessage };
        }
        return { valid, errorMessage };
    }
}

export default Validator;