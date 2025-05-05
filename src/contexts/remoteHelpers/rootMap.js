import RootMapValidator from "./validators/rootMapValidator";

class RemoteContextRootMap {
    constructor(globalNamespace, manager) {
        RootMapValidator.validateArgs();
        this.globalNamespace = globalNamespace;
        this.manager = manager;
        this.module = manager.module;
        this.mapConstructor = this.manager.remoteContextDefaults.ROOT_MAP; // this.manager.remoteContextDefaults is passed from the base class
        this.rootMap = this.getMap(globalNamespace, this.module);
    }

    getMap(globalNamespace = this.globalNamespace, module = this.module) {
        return this.mapConstructor(globalNamespace, module);
    }
}

export default RemoteContextRootMap;