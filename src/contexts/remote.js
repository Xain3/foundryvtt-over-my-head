import RemoteContextGetter from "./remoteHelpers/getter";
import RemoteContextSetter from "./remoteHelpers/setter";
import RemoteContextEraser from "./remoteHelpers/eraser";
import RemoteContextInitializer from "./remoteHelpers/initializer";
import ContextUnit from "@/baseClasses/contextUnits";

class RemoteContextManager {
    constructor({config, contextRootIdentifier = undefined, enforceChildrenTypes = true} ) {
        this.config = config;
        this.contextRootIdentifier = contextRootIdentifier;
        this.helperArgs = { config, contextRootIdentifier };
        this.enforceChildrenTypes = enforceChildrenTypes;
        this.initializer = new RemoteContextInitializer(this.helperArgs); // WIP - Initializer is not implemented yet
        this.getter = new RemoteContextGetter(this.helperArgs);
        this.setter = new RemoteContextSetter(this.helperArgs);
        this.eraser = new RemoteContextEraser(this.helperArgs);
        this.context = new ContextUnit(
            {
            value: this.getter.get('object', { action: 'get' }),
            enforceChildrenTypes: this.enforceChildrenTypes,
        });
    }

    initialize({ mode, args, initialData = {} }) {
    // WIP - Initializer is not implemented yet
    // Shoufd be used to initialize the context with initial data
        // return this.initializer.initialize({ mode, args, initialData });
        console.warn("Initializer is not implemented yet.");
    }

    get(mode = 'object', args = {}) {
        return this.getter.get(mode, args);
    }

    getContext() {
        return this.getter.get('object', { action: 'get' });
    }

    set({ mode, behavior, args }) {
        return this.setter.set({ mode, behavior, args });
    }

    erase({ action = 'clear', args = {} }) {
        return this.eraser.erase({ action, args });
    }
}
export default RemoteContextManager;
