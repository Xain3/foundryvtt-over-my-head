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
    SOURCE_NEWER: 'sourceNewer',
    TARGET_NEWER: 'targetNewer',
    EQUAL: 'equal',
    SOURCE_MISSING: 'sourceMissing',
    TARGET_MISSING: 'targetMissing',
    BOTH_MISSING: 'bothMissing'
  };

  /**
   * Compares two context objects and determines their temporal relationship.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare.
   * @returns {object} Comparison result with details.
   */
  static compare(source, target, { compareBy = 'modifiedAt' } = {}) {
    if (!source && !target) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.BOTH_MISSING,
        sourceTimestamp: null,
        targetTimestamp: null,
        timeDifference: 0
      };
    }

    if (!source) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.SOURCE_MISSING,
        sourceTimestamp: null,
        targetTimestamp: target[compareBy],
        timeDifference: null
      };
    }

    if (!target) {
      return {
        result: ContextComparison.COMPARISON_RESULTS.TARGET_MISSING,
        sourceTimestamp: source[compareBy],
        targetTimestamp: null,
        timeDifference: null
      };
    }

    return ContextComparison.#compareTimestamps(source, target, compareBy);
  }

  /**
   * @private
   * Compares timestamps between two objects.
   * @param {object} source - Source object with timestamp.
   * @param {object} target - Target object with timestamp.
   * @param {string} compareBy - Timestamp property to compare.
   * @returns {object} Comparison result.
   */
  static #compareTimestamps(source, target, compareBy) {
    const sourceTimestamp = source[compareBy];
    const targetTimestamp = target[compareBy];
    const timeDifference = sourceTimestamp.getTime() - targetTimestamp.getTime();

    let result;
    if (timeDifference > 0) {
      result = ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER;
    } else if (timeDifference < 0) {
      result = ContextComparison.COMPARISON_RESULTS.TARGET_NEWER;
    } else {
      result = ContextComparison.COMPARISON_RESULTS.EQUAL;
    }

    return {
      result,
      sourceTimestamp,
      targetTimestamp,
      timeDifference
    };
  }
}

export { ContextComparison };
export default ContextComparison;
