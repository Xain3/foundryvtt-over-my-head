/**
 * @file externalCtxRootMap.js
 * @description This file contains the ExternalContextRootMap class for managing external context root mappings.
 * @path /src/context/helpers/externalCtxRootMap.js
 */

import RootMapValidator from "./validators/rootMapValidator";

/**
 * @class ExternalContextRootMap
 * @description Manages mappings for external context roots, determining which external objects
 * should be used as storage locations for context data.
 */
class ExternalContextRootMap {
    constructor(globalNamespace, module, rootMapBuilder) {
        RootMapValidator.validateArgs(
            globalNamespace,
            { module, remoteContextDefaults: { ROOT_MAP: rootMapBuilder } },
            true, // throwError
            true, // consoleLog
            'error' // logLevel
        );
        this.globalNamespace = globalNamespace;
        this.module = module;
        this.rootMapBuilder = rootMapBuilder;
        this.rootMap = this.getMap(globalNamespace, this.module);
    }

    getMap(globalNamespace = this.globalNamespace, module = this.module) {
        return this.rootMapBuilder(globalNamespace, module);
    }
}

export default ExternalContextRootMap;