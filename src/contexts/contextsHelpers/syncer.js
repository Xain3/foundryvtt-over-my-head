import { context } from "@mocks/mocks";

class ContextSyncer {
    constructor({contexts}) {
        const validateArgs = () => {
            if (!contexts) {
                throw new Error("Contexts object must be provided to ContextSyncer.");
            }

            if (typeof contexts !== "object" && typeof contexts !== "array") {
                throw new Error("Contexts must be a valid object.");
            }
            if (contexts.length < 2) {
                throw new Error("There must be at least two contexts to sync.");
            }
        };

        validateArgs();
        this.contexts = contexts;
    }
    
    sync({ contexts = this.contexts }) {
        // WIP
    }

    syncItem({ contexts = this.contexts, key }) {
        // WIP
    }

    syncProperty({ contexts = this.contexts, path }) {
        // WIP
    }

    syncState({ contexts = this.contexts }) {
        // WIP
    }

    syncData({ contexts = this.contexts, key = null}) {
        // WIP
    }

    syncFlags({ contexts = this.contexts, key = null}) {
        // WIP
    }

    syncSettings({ contexts = this.contexts, key = null}) {
        // WIP
    }

    syncAll(contexts = this.contexts) {
        // WIP
    }
}

export default ContextSyncer;