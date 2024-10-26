// ./src/main.mjs

import visionFadeModule from '../module.json';
import config from '../config/config.json';

import {context} from './contexts/context.mjs';

// Add the module and the configs to the context
context.set('module', visionFadeModule);
context.set('config', config);



