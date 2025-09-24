/**
 * @file contextComparison.js
 * @description This file contains shared comparison utilities and constants for Context synchronization and merging.
 * @path src/contexts/helpers/contextComparison.js

 */

import dayjs from 'dayjs';
import config from '../../config/config.mjs';


/**
 * @class ContextComparison
 * @classdesc Provides comparison utilities for Context instances, ContextContainers, and ContextItems.
 * @export
 *
 * Public API:
 * - compare(containerA, containerB, options) - Compares two context objects
 * - COMPARISON_RESULTS - Enum of comparison result constants
 *
 * @property {object} COMPARISON_RESULTS - Static enum containing comparison result constants
 * @property {string} COMPARISON_RESULTS.CONTAINER_A_NEWER - Indicates container A is newer
 * @property {string} COMPARISON_RESULTS.CONTAINER_B_NEWER - Indicates container B is newer
 * @property {string} COMPARISON_RESULTS.EQUAL - Indicates containers have equal timestamps
 * @property {string} COMPARISON_RESULTS.CONTAINER_A_MISSING - Indicates container A is missing/null
 * @property {string} COMPARISON_RESULTS.CONTAINER_B_MISSING - Indicates container B is missing/null
 * @property {string} COMPARISON_RESULTS.BOTH_MISSING - Indicates both containers are missing/null
 */
class ContextComparison {
  /**
   * Comparison results for timestamps.
   * @static
   * @readonly
   * @enum {string}
   * @export
   */
  static COMPARISON_RESULTS = config.constants.context.helpers.comparisonResults;

  /**
   * @private
   * Validates timestamp types before processing.
   * @param {*} containerATimestamp - First timestamp to validate.
   * @param {*} containerBTimestamp - Second timestamp to validate.
   * @throws {Error} If timestamps are invalid types.
   */
  static #validateTimestampTypes(containerATimestamp, containerBTimestamp) {
    if (containerATimestamp === undefined || containerATimestamp === null ||
        containerBTimestamp === undefined || containerBTimestamp === null) {
      throw new Error('Invalid timestamp values provided');
    }

    const typeA = typeof containerATimestamp;
    const typeB = typeof containerBTimestamp;

    if ((typeA !== 'string' && typeA !== 'number' && !(containerATimestamp instanceof Date)) ||
        (typeB !== 'string' && typeB !== 'number' && !(containerBTimestamp instanceof Date))) {
      throw new Error('Invalid timestamp types or mixed types provided');
    }
  }

  /**
   * @private
   * Parses timestamps using dayjs and validates the results.
   * @param {number|string|Date} containerATimestamp - First timestamp to parse.
   * @param {number|string|Date} containerBTimestamp - Second timestamp to parse.
   * @returns {object} Object with containerATime and containerBTime as unix timestamps.
   * @throws {Error} If timestamps cannot be parsed or are invalid.
   */
  static #parseTimestamps(containerATimestamp, containerBTimestamp) {
    try {
      const containerADayjs = dayjs(containerATimestamp);
      const containerBDayjs = dayjs(containerBTimestamp);

      if (!containerADayjs.isValid() || !containerBDayjs.isValid()) {
        throw new Error('Invalid timestamp values provided');
      }

      const containerATime = containerADayjs.valueOf();
      const containerBTime = containerBDayjs.valueOf();

      if (isNaN(containerATime) || isNaN(containerBTime)) {
        throw new Error('Invalid timestamp values provided');
      }

      return { containerATime, containerBTime };
    } catch (error) {
      if (error.message === 'Invalid timestamp values provided') {
        throw error;
      }
      throw new Error('Invalid timestamp values provided');
    }
  }

  /**
   * @private
   * Calculates the time difference between two timestamps.
   * @param {number|string|Date} containerATimestamp - The first timestamp.
   * @param {number|string|Date} containerBTimestamp - The second timestamp.
   * @returns {object} Object containing timeDifference and metadata with parsed timestamps.
   * @throws {Error} If timestamps are invalid.
   */
  static #calculateTimeDifference(containerATimestamp, containerBTimestamp) {
    ContextComparison.#validateTimestampTypes(containerATimestamp, containerBTimestamp);

    const { containerATime, containerBTime } = ContextComparison.#parseTimestamps(containerATimestamp, containerBTimestamp);

    const timeDifference = containerATime - containerBTime;
    const metadata = {
      containerATimestamp: new Date(containerATime),
      containerBTimestamp: new Date(containerBTime)
    };

    return { timeDifference, metadata };
  }

  /**
   * @private
   * Compares timestamps between two objects.
   * @param {object} containerA - First object with timestamp.
   * @param {object} containerB - Second object with timestamp.
   * @param {string} compareBy - Timestamp property to compare.
   * @returns {object} Comparison result.
   */
  static #compareTimestamps(containerA, containerB, compareBy) {
    const containerATimestamp = containerA[compareBy];
    const containerBTimestamp = containerB[compareBy];

    const { timeDifference, metadata } = ContextComparison.#calculateTimeDifference(containerATimestamp, containerBTimestamp);

    let result;
    if (timeDifference > 0) {
      result = ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER;
    } else if (timeDifference < 0) {
      result = ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER;
    } else {
      result = ContextComparison.COMPARISON_RESULTS.EQUAL;
    }

    return {
      result,
      containerATimestamp: metadata.containerATimestamp,
      containerBTimestamp: metadata.containerBTimestamp,
      timeDifference
    };
  }

  /**
   * Compares two context objects and determines their temporal relationship.
   * @export
   * @param {Context|ContextContainer|ContextItem} containerA - The first context object.
   * @param {Context|ContextContainer|ContextItem} containerB - The second context object.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare.
   * @returns {object} Comparison result with details.
   */
  static compare(containerA, containerB, { compareBy = 'modifiedAt' } = {}) {
    if (!containerA && !containerB) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        containerATimestamp: null,
        containerBTimestamp: null,
        timeDifference: 0
      };
    }

    if (!containerA) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_A_MISSING,
        containerATimestamp: null,
        containerBTimestamp: containerB[compareBy],
        timeDifference: null
      };
    }

    if (!containerB) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.CONTAINER_B_MISSING,
        containerATimestamp: containerA[compareBy],
        containerBTimestamp: null,
        timeDifference: null
      };
    }

    return ContextComparison.#compareTimestamps(containerA, containerB, compareBy);
  }
}

export { ContextComparison };
export default ContextComparison;
