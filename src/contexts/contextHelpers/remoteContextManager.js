const validKeyTypes = ['string', 'symbol', 'number'];

class RemoteContextManager {
    static pushState(ctx) {
        try {
            if (!ctx.state || typeof ctx.state !== 'object') {
                throw new Error('State is not defined or not an object');
            }
            ctx.remoteContext && Object.assign(ctx.remoteContext, ctx.state);
        } catch (error) {
            if (error.message.includes('State is not defined')) {
                console.warn('Context state is not defined, defaulting to an empty object');
                ctx.remoteContext = {};
            } else {                
                throw error;
            }
        }
    }
    
    static pullState(ctx, remoteState = ctx.remoteContext, overwriteLocal = false) {
        try {
            if (!remoteState) {
                throw new Error('Remote state is not defined');
            }
            if (typeof remoteState !== 'object') {
                throw new Error('Remote state is not an object');
            }
            ctx.state = overwriteLocal ? { ...remoteState } : { ...ctx.state, ...remoteState };
        } catch (error) {
            if (error.message.includes('Remote state is not defined') || error.message.includes('Remote state is not an object')) {
                console.warn(error.message + ', context state not updated');
            } else {
                throw error;
            }
        }
    }
    
    static clearRemoteContext(ctx) {
        try {
            if (!ctx.remoteContext) {
                throw new Error('Remote context is not defined');
            }
            // Clear all keys in the remoteContext object
            Object.keys(ctx.remoteContext).forEach(key => delete ctx.remoteContext[key]);
        } catch (error) {
            console.error(error.message + '. Remote context not cleared');
        }
    }
    
    static syncState(ctx, remoteLocation = ctx.remoteLocation) {
        try {
            if (!remoteLocation) {
                throw new Error('Remote location is not defined, state not synced');
            }
            // Assume remoteLocation contains a dateModified property
            if (remoteLocation.dateModified > ctx.state.dateModified) {
                this.pullState(ctx, remoteLocation);
            } else {
                this.pushState(ctx);
            }
        } catch (error) {
            console.error(error.message);
        }
    }
    
    static pushKey(ctx, key, value, remoteLocation = ctx.remoteLocation) {
        const validateArgs = () => {
            if (!remoteLocation && !ctx.remoteContext) {
                throw new Error('Remote location is not defined');
            }
            if (remoteLocation && typeof remoteLocation !== 'object') {
                throw new Error('Remote location is not an object');
            }
            if (key == null || value == null) {
                let missing = key == null ? 'Key' : 'Value';
                throw new Error(`${missing} is not defined`);
            }
            if (!validKeyTypes.includes(typeof key)) {
                throw new Error('Key must be a string, a symbol, or a number, received ' + typeof key);
            }
        }
        
        try {
            validateArgs();
            ctx.remoteContext[key] = value;
            ctx.remoteContext['dateModified'] = Date.now();
        } catch (error) {
            console.error(error.message + '. Key-value pair not pushed to remote context');
        }
    }
}

export default RemoteContextManager;
