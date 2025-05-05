import RemoteContextSetter from "./setter";

class RemoteContextInitializer extends RemoteContextSetter {
    constructor({config, contextRootIdentifier = undefined}) {
        super({config, contextRootIdentifier});
    }

    initialize({ source, location, value }) {
        // WIP
    }

    initializeItem({ source, location, key, value }) {
        // WIP
    }

    initializeProperty({ source, location, path, value }) {
        // WIP
    }
}

export default RemoteContextInitializer;