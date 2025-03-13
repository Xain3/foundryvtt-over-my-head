class ContextInitializer {
    /**
     * Initializes the context with the provided state or a default state.
     *
     * @param {Object} ctx - The context object to initialize.
     * @param {Object|null} [state=null] - The initial state to set. 
     * 
     * If the state is not an object or null, defaults to the default state
     * defined in the context, or to an empty object if no default state is 
     * defined.
     */
    static initializeContext(ctx, state=null) {
        if (typeof state !== 'object' || state === null) {
            if (state === null || state === undefined) {
                state = ctx.initialState || {};
            } else {
                console.warn('State is not an object, defaulting to an empty object');
                state = {};
            }
        }
        ctx.state = {
            data: state,
            flags: {},
            dateModified: Date.now()
        };
    }
  
    /**
     * Initializes the context state with the provided data.
     * 
     * @param {Object} ctx - The context object that will have its state initialized.
     * @param {Object} data - The data to initialize the context state with. If not an object or null, an empty object will be used.
     */
    static initialiseData(ctx, data) {
        if (typeof data !== 'object' || data === null) {
            data = {};
        }
        if (!ctx.state) {
            ctx.state = {};
        }
        ctx.state.data = data;
        ctx.state.dateModified = Date.now();
    }
  
    /**
     * Initializes the flags in the given context.
     *
     * @param {Object} ctx - The context object that will be modified.
     * @param {Object} flags - The flags to initialize in the context. If not an object or null, it will be set to an empty object.
     */
    static initialiseFlags(ctx, flags) {
        if (typeof flags !== 'object' || flags === null) {
            flags = {};
        }
        if (!ctx.state) {
            ctx.state = {};
        }
        ctx.state.flags = flags;
        ctx.state.dateModified = Date.now();
    }
}
  
export default ContextInitializer;
