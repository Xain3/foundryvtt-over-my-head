import Mocks from '@mocks/mocks';
import MockConfig from '@mocks/config';
import MockContext from '@mocks/context';
import MockConstants from '@mocks/constants';
import MockUtilities from '@mocks/utils';
import MockHooks from '@mocks/hooks';
import MockObjects from '@mocks/objects';
import MockGame from '@mocks/game';
import MockGlobals from '@mocks/globals';

// Ensure mocks are initialized before tests run
Mocks.setGlobals(); // Use default settings

describe('Mocks Class', () => {

    it('should initialize static properties correctly', () => {
        expect(Mocks.config).toBeInstanceOf(MockConfig);
        expect(Mocks.context).toBeInstanceOf(MockContext);
        expect(Mocks.constants).toBeInstanceOf(MockConstants);
        expect(Mocks.utils).toBeInstanceOf(MockUtilities);
        expect(Mocks.hooks).toBeInstanceOf(MockHooks);
        expect(Mocks.objects).toBeInstanceOf(MockObjects);
        expect(Mocks.game).toBeInstanceOf(MockGame);
        expect(Mocks.globals).toBeInstanceOf(MockGlobals);
    });

    it('getAllMocks should return an object with all mock instances', () => {
        const allMocks = Mocks.getAllMocks();
        expect(allMocks).toBeDefined();
        expect(allMocks.config).toBe(Mocks.config);
        expect(allMocks.context).toBe(Mocks.context);
        expect(allMocks.constants).toBe(Mocks.constants);
        expect(allMocks.utils).toBe(Mocks.utils);
        expect(allMocks.hooks).toBe(Mocks.hooks);
        expect(allMocks.objects).toBe(Mocks.objects);
        expect(allMocks.game).toBe(Mocks.game);
        expect(allMocks.globals).toBe(Mocks.globals);
    });

    it('getMockConfig should return the MockConfig instance', () => {
        expect(Mocks.getMockConfig()).toBe(Mocks.config);
        expect(Mocks.getMockConfig()).toBeInstanceOf(MockConfig);
    });

    it('getMockContext should return the MockContext instance', () => {
        expect(Mocks.getMockContext()).toBe(Mocks.context);
        expect(Mocks.getMockContext()).toBeInstanceOf(MockContext);
    });

    it('getMockConstants should return the MockConstants instance', () => {
        expect(Mocks.getMockConstants()).toBe(Mocks.constants);
        expect(Mocks.getMockConstants()).toBeInstanceOf(MockConstants);
    });

    it('getMockGame should return the MockGame instance', () => {
        expect(Mocks.getMockGame()).toBe(Mocks.game);
        expect(Mocks.getMockGame()).toBeInstanceOf(MockGame);
    });

    it('getMockUtils should return the MockUtilities instance', () => {
        expect(Mocks.getMockUtils()).toBe(Mocks.utils);
        expect(Mocks.getMockUtils()).toBeInstanceOf(MockUtilities);
    });

    it('getMockHooks should return the MockHooks instance', () => {
        expect(Mocks.getMockHooks()).toBe(Mocks.hooks);
        expect(Mocks.getMockHooks()).toBeInstanceOf(MockHooks);
    });

    it('getMockObjects should return the MockObjects instance', () => {
        expect(Mocks.getMockObjects()).toBe(Mocks.objects);
        expect(Mocks.getMockObjects()).toBeInstanceOf(MockObjects);
    });

    it('setGlobals should call globals.setGlobals with default arguments', () => {
        const spy = jest.spyOn(Mocks.globals, 'setGlobals');
        Mocks.setGlobals();
        // Expect it to be called with undefined for all args, letting the method handle defaults
        expect(spy).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined);
        spy.mockRestore();
    });

    it('setGlobals should call globals.setGlobals with provided options', () => {
        const spy = jest.spyOn(Mocks.globals, 'setGlobals');
        const mockGameInstance = new MockGame();
        const mockHooksInstance = new MockHooks();
        const options = {
            includeBrowserGlobals: true,
            includeFoundryGlobals: false,
            includeLibraryGlobals: false,
            mockGame: mockGameInstance,
            mockHooks: mockHooksInstance
        };
        Mocks.setGlobals(options);
        expect(spy).toHaveBeenCalledWith(
            options.includeBrowserGlobals,
            options.includeFoundryGlobals,
            options.includeLibraryGlobals,
            options.mockGame,
            options.mockHooks
        );
        spy.mockRestore();
    });

});