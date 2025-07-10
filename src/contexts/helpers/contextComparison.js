/**
 * @file contextComparison.js
 * @description This file contains shared comparison utilities and constants for Context synchronization and merging.
 * @path /src/contexts/helpers/contextComparison.js
 * @date 2025-06-18
 */

/**
 * @class ContextComparison
 * @description Provides comparison utilities for Context instances, ContextContainers, and ContextItems.
 */
class ContextComparison {
  /**
   * @enum {string}
   * @description Comparison results for timestamps.
   */
  static COMPARISON_RESULTS = {
    CONTAINER_A_NEWER: 'containerANewer',
    CONTAINER_B_NEWER: 'containerBNewer',
    EQUAL: 'equal',
    CONTAINER_A_MISSING: 'containerAMissing',
    CONTAINER_B_MISSING: 'containerBMissing',
    BOTH_MISSING: 'bothMissing'
  };

  /**
   * Compares two context objects and determines their temporal relationship.
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
    let timeDifference;
    let metadata;
    ({ timeDifference, metadata } = ContextComparison.#calculateTimeDifference(containerATimestamp, containerBTimestamp));

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
   * @private
   * Calculates the time difference between two timestamps.
   * @param {number|string|Date} containerATimestamp - The first timestamp.
   * @param {number|string|Date} containerBTimestamp - The second timestamp.
   * @returns {object} Object containing timeDifference and metadata with parsed timestamps.
   */
  static #calculateTimeDifference(containerATimestamp, containerBTimestamp) {
    let containerATime, containerBTime;

    if (containerATimestamp?.getTime && containerBTimestamp?.getTime) {
      // If both timestamps are Date objects, use their getTime method
      containerATime = containerATimestamp.getTime();
      containerBTime = containerBTimestamp.getTime();
    } else if (typeof containerATimestamp === 'string' && typeof containerBTimestamp === 'string') {
      // If both timestamps are strings, parse them as Date objects
      containerATime = new Date(containerATimestamp).getTime();
      containerBTime = new Date(containerBTimestamp).getTime();
    } else if (typeof containerATimestamp === 'number' && typeof containerBTimestamp === 'number') {
      // If both timestamps are numbers, use them directly
      containerATime = containerATimestamp;
      containerBTime = containerBTimestamp;
    } else {
      throw new Error('Invalid timestamp types or mixed types provided');
    }

    // Check for invalid dates (NaN)
    if (isNaN(containerATime) || isNaN(containerBTime)) {
      throw new Error('Invalid timestamp values provided');
    }

    const timeDifference = containerATime - containerBTime;
    const metadata = {
      containerATimestamp: new Date(containerATime),
      containerBTimestamp: new Date(containerBTime)
    };

    return { timeDifference, metadata };
  }
}

export { ContextComparison };
export default ContextComparison;
