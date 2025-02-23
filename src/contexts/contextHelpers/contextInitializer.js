class ContextInitializer {
    static initializeContext(ctx, state) {
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
