import manifest from '@manifest';
import constants from '@constants';
import { z } from 'zod';

const moduleIdentifiers = {
  "title": manifest.title,
  "name": manifest.name,
  "id": manifest.id,
  "shortName": manifest.shortName,
};

const referBy = constants.referToModuleBy;

const moduleName = moduleIdentifiers[referBy.toLowerCase()] || moduleIdentifiers.title;

const separator = constants.errors.separator;
const pattern = constants.errors.pattern;

class ErrorFormatter {

  static formatError(
    error, {
      includeStack = false,
      includeCaller = false,
      caller = '',
    }) {
      validateArgs();

      let formattedError = pattern;
      const errorContext = {
        module: moduleName,
        error: error.message,
        stack: includeStack ? error.stack : undefined,
        caller: includeCaller ? caller : undefined,
      };

      Object.entries(errorContext).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'error') {
            formattedError = formattedError.replace(`{{${key}}}`, value);
          } else if (key === 'stack') {
            formattedError = formattedError.replace(`{{${key}}}`, `\nCall Stack:\n${value}` );
          } else {
            // Only add separator for module if caller will be included
            if (key === 'module' && !includeCaller) {
              formattedError = formattedError.replace(`{{${key}}}`, value);
            } else {
              formattedError = formattedError.replace(`{{${key}}}`, value + separator);
            }
          }
        } else {
          formattedError = formattedError.replace(`{{${key}}}`, '');
        }
      });

      return formattedError;

    function validateArgs() {
      if (typeof error !== 'object' || error === null) {
        throw new TypeError('Error must be an object');
      }
      if (typeof error.message !== 'string') {
        throw new TypeError('Error message must be a string');
      }
      if (typeof error.stack !== 'string' && includeStack) {
        throw new TypeError('Error stack must be a string');
      }
    }
    }
}

export function formatError(error, options) {
  return ErrorFormatter.formatError(error, options);
}

export default ErrorFormatter;