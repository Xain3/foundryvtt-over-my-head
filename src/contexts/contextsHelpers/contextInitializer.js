class ContextInitializer {
    /**
     * Initializes the context's state object.
     *
     * @param {Object} ctx - The context instance to initialize. It must have an `initialState` property.
     * @param {Object|null} [initialData=null] - Optional initial data to merge into the state. If not provided, `ctx.initialState` is used.
     */
    static initializeContext(ctx, initialData = null) {
        // Use provided initialData or fall back to ctx.initialState
        const stateToUse = (typeof initialData === 'object' && initialData !== null) ? initialData : ctx.initialState;

        // Validate the state to use
        const validatedState = this.validateInitialState(stateToUse);

        // Ensure ctx.state is an object before assigning properties
        ctx.state = typeof ctx.state === 'object' && ctx.state !== null ? ctx.state : {}; 

        // Merge the validated initial state into the context's state
        Object.assign(ctx.state, validatedState); 

        // Initialize data and flags using helper methods, ensuring they exist
        this.initializeData(ctx, ctx.state.data); 
        this.initializeFlags(ctx, ctx.state.flags); 

        // Ensure dateModified is set
        if (!ctx.state.dateModified) {
            ctx.state.dateModified = Date.now();
        }
    }

    /**
     * Validates the initial state object.
     * @param {any} state - The state to validate.
     * @returns {Object} A valid state object (potentially empty).
     * @private
     */
    static validateInitialState(state) {
        if (!state) {
            console.warn('Initial state is not defined, defaulting to an empty object');
            return {};
        }
        if (typeof state !== 'object' || state === null) { 
            console.warn('Initial state is not an object, defaulting to an empty object');
            return {};
        }   
        return state;
    }
  
    /**
     * Initializes the `data` property within the context's state.
     * 
     * @param {Object} ctx - The context instance.
     * @param {Object|undefined} data - The data to initialize with. Defaults to an empty object if invalid.
     */
    static initializeData(ctx, data) {
        // Ensure ctx.state exists
        ctx.state = typeof ctx.state === 'object' && ctx.state !== null ? ctx.state : {};
        // Set data, defaulting to {} if data is not a valid object
        ctx.state.data = (typeof data === 'object' && data !== null) ? data : {};
        ctx.state.dateModified = Date.now();
    }
  
    /**
     * Initializes the `flags` property within the context's state.
     *
     * @param {Object} ctx - The context instance.
     * @param {Object|undefined} flags - The flags to initialize with. Defaults to an empty object if invalid.
     */
    static initializeFlags(ctx, flags) {
        // Ensure ctx.state exists
        ctx.state = typeof ctx.state === 'object' && ctx.state !== null ? ctx.state : {};
        // Set flags, defaulting to {} if flags is not a valid object
        ctx.state.flags = (typeof flags === 'object' && flags !== null) ? flags : {};
        ctx.state.dateModified = Date.now();
    }
}
  
export default ContextInitializer;
