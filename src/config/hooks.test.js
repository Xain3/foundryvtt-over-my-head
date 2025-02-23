import HOOKS, {setUpHooks} from './hooks.js';
import HooksRegistry from '../baseClasses/hooksRegistry.js';

describe('setUpHooks', () => {
    let mockCollection;
    let mockSettings;

    beforeEach(() => {
        mockCollection = {
            OUT: { name: 'OUT' },
            IN: { name: 'IN' },
            BUILT_IN: { name: 'BUILTIN' }
        };
        mockSettings = {
            NO_PREFIX_GROUPS: ["BUILT_IN"], // Groups that do not require a prefix
            ALLOWED_GROUPS: ["OUT", "IN", "BUILT_IN"], // Allowed groups for hooks
            DEFAULT_GROUP: "BUILT_IN", // Default group for hooks
            DEFAULT_PREFIX: 'default_', // Default prefix for hooks
        };
    });

    it('should return an instance of HooksRegistry', () => {
        let hooks = setUpHooks(mockCollection, mockSettings);
        expect(hooks).toBeInstanceOf(HooksRegistry);
    });

    it('should set the hooks collection', () => {
        let hooks = setUpHooks(mockCollection, mockSettings);
        expect(hooks.collection).toEqual(mockCollection);
    });

    it('should set the hooks settings', () => {
        let hooks = setUpHooks(mockCollection, mockSettings);
        expect(hooks.settings).toEqual(mockSettings);
    });

    it('should set the hooks prefix', () => {
        let hooks = setUpHooks(mockCollection, mockSettings);
        expect(hooks.prefix).toEqual(mockSettings.DEFAULT_PREFIX);
    });

    it('should unpack the collection correctly', () => {
        for (let key in mockCollection) {
            let hooks = setUpHooks(mockCollection, mockSettings);
            expect(hooks[key]).toEqual(mockCollection[key]);
        };
    });
});

describe('HOOKS', () => {
    it('Hooks should be an instance of HooksRegistry', () => {
        expect(HOOKS).toBeInstanceOf(HooksRegistry);
    });
});