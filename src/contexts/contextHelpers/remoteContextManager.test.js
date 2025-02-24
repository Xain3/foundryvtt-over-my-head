import RemoteContextManager from './remoteContextManager';

describe('RemoteContextManager', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            state: {
                a: 1,
                dateModified: Date.now()
            },
            remoteContext: { b: 2 },
            remoteLocation: { dateModified: Date.now() }
        };
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('pushState', () => {
        it('should assign ctx.state properties to ctx.remoteContext', () => {
            const stateCopy = { ...ctx.state };
            RemoteContextManager.pushState(ctx);
            expect(ctx.remoteContext).toEqual(expect.objectContaining(stateCopy));
        });

        it('should warn and default remoteContext to {} if ctx.state is not defined', () => {
            ctx.state = null;
            RemoteContextManager.pushState(ctx);
            expect(console.warn).toHaveBeenCalledWith('Context state is not defined, defaulting to an empty object');
            expect(ctx.remoteContext).toEqual({});
        });

        it('should warn and default remoteContext to {} if ctx.state is not an object', () => {
            ctx.state = 'not-an-object';
            RemoteContextManager.pushState(ctx);
            expect(console.warn).toHaveBeenCalledWith('Context state is not defined, defaulting to an empty object');
            expect(ctx.remoteContext).toEqual({});
        });
    });

    describe('pullState', () => {
        it('should update ctx.state by merging with remoteState when overwriteLocal is false', () => {
            const remoteState = { c: 3, dateModified: Date.now() + 1000 };
            const originalState = { ...ctx.state };
            RemoteContextManager.pullState(ctx, remoteState, false);
            expect(ctx.state).toEqual(expect.objectContaining({ ...originalState, ...remoteState }));
        });

        it('should update ctx.state to remoteState when overwriteLocal is true', () => {
            const remoteState = { d: 4, dateModified: Date.now() + 1000 };
            RemoteContextManager.pullState(ctx, remoteState, true);
            expect(ctx.state).toEqual(remoteState);
        });

        it('should warn and not update ctx.state if remoteState is not defined', () => {
            ctx.remoteContext = undefined;
            const originalState = { ...ctx.state };
            RemoteContextManager.pullState(ctx, undefined);
            expect(console.warn).toHaveBeenCalledWith('Remote state is not defined, context state not updated');
            expect(ctx.state).toEqual(originalState);
        });

        it('should warn and not update ctx.state if remoteState is not an object', () => {
            const originalState = { ...ctx.state };
            RemoteContextManager.pullState(ctx, 'not-an-object');
            expect(console.warn).toHaveBeenCalledWith('Remote state is not an object, context state not updated');
            expect(ctx.state).toEqual(originalState);
        });
    });

    describe('clearRemoteContext', () => {
        it('should clear the remoteContext object keys', () => {
            ctx.remoteContext = { x: 10, y: 20 };
            RemoteContextManager.clearRemoteContext(ctx);
            expect(ctx.remoteContext).toEqual({});
        });

        it('should log an error if remoteContext is not defined', () => {
            ctx.remoteContext = undefined;
            RemoteContextManager.clearRemoteContext(ctx);
            expect(console.error).toHaveBeenCalledWith('Remote context is not defined. Remote context not cleared');
        });
    });

    describe('syncState', () => {
        it('should pull state if remoteLocation.dateModified is greater than ctx.state.dateModified', () => {
            const newRemoteData = { new: 'data', dateModified: Date.now() + 5000 };
            ctx.state.dateModified = Date.now();
            ctx.remoteLocation = newRemoteData;
            const pullSpy = jest.spyOn(RemoteContextManager, 'pullState');
            RemoteContextManager.syncState(ctx);
            expect(pullSpy).toHaveBeenCalledWith(ctx, newRemoteData);
        });

        it('should push state if remoteLocation.dateModified is less than or equal to ctx.state.dateModified', () => {
            const oldRemoteData = { old: 'data', dateModified: Date.now() - 5000 };
            ctx.state.dateModified = Date.now();
            ctx.remoteLocation = oldRemoteData;
            const pushSpy = jest.spyOn(RemoteContextManager, 'pushState');
            RemoteContextManager.syncState(ctx);
            expect(pushSpy).toHaveBeenCalledWith(ctx);
        });

        it('should log an error if remoteLocation is not defined', () => {
            ctx.remoteLocation = undefined;
            RemoteContextManager.syncState(ctx);
            expect(console.error).toHaveBeenCalledWith('Remote location is not defined, state not synced');
        });
    });

    describe('pushKey', () => {
        it('should push a valid key-value pair into remoteContext and update dateModified', () => {
            const before = Date.now();
            RemoteContextManager.pushKey(ctx, 'newKey', 'newValue', {});

            expect(ctx.remoteContext['newKey']).toEqual('newValue');
            expect(typeof ctx.remoteContext['dateModified']).toBe('number');
            expect(ctx.remoteContext['dateModified']).toBeGreaterThanOrEqual(before);
        });

        it('should push a key to ctx.remoteContext when remoteLocation is undefined but ctx.remoteContext exists', () => {
            delete ctx.remoteLocation;
            const before = Date.now();
            RemoteContextManager.pushKey(ctx, 'newKey', 'newValue');
            expect(ctx.remoteContext['newKey']).toEqual('newValue');
            expect(typeof ctx.remoteContext['dateModified']).toBe('number');
            expect(ctx.remoteContext['dateModified']).toBeGreaterThanOrEqual(before);
        });

        it('should log an error if neither remoteLocation nor ctx.remoteContext is provided', () => {
            ctx.remoteContext = undefined;
            const originalRemoteLocation = ctx.remoteLocation;
            ctx.remoteLocation = undefined;
            RemoteContextManager.pushKey(ctx, 'key', 'value');
            expect(console.error).toHaveBeenCalledWith('Remote location is not defined. Key-value pair not pushed to remote context');
            ctx.remoteLocation = originalRemoteLocation;
        });

        it('should log an error if remoteLocation is provided and it is not an object', () => {
            RemoteContextManager.pushKey(ctx, 'key', 'value', 'not-an-object');
            expect(console.error).toHaveBeenCalledWith('Remote location is not an object. Key-value pair not pushed to remote context');
        });

        it('should log an error if key is null', () => {
            RemoteContextManager.pushKey(ctx, null, 'value');
            expect(console.error).toHaveBeenCalledWith('Key is not defined. Key-value pair not pushed to remote context');
        });

        it('should log an error if value is null', () => {
            RemoteContextManager.pushKey(ctx, 'key', null);
            expect(console.error).toHaveBeenCalledWith('Value is not defined. Key-value pair not pushed to remote context');
        });

        it('should log an error if key is not a valid type', () => {
            RemoteContextManager.pushKey(ctx, {}, 'value');
            expect(console.error).toHaveBeenCalledWith('Key must be a string, a symbol, or a number, received object. Key-value pair not pushed to remote context');
        });
    });
});