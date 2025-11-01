/**
 * @file omh.mjs
 * @description Over My Head module entry point
 * @path src/omh.mjs
 */

import config from '#config';

class OMH {
  constructor() {
    this.config = config;
    console.log('[OMH] Over My Head module initialized.');
  }
}

export default OMH;
