import UserInterfaceHandler from './userInterfaceHandler';
import Handler from '../baseClasses/managers/handler.js';

// Mocks
jest.mock('../baseClasses/managers/handler.js');

describe('UserInterfaceHandler', () => {
    let mockConfig;
    let mockContext;
    let mockUtils;
    let handler;
    let mockApp;
    let mockHtml;
    let mockData;
    let mockSelect;
    let mockCheckbox;
    let mockSection;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mocks
        mockConfig = { moduleConstants: { ID: 'test-module' } };
        mockContext = {};
        mockUtils = {};

        // Mock Foundry globals
        global.Hooks = {
            on: jest.fn()
        };
        global.CONSTANTS = {
            TILE_OCCLUSION_MODES: {
                VISION: 'vision'
            }
        };
        global.game = {
            i18n: {
                localize: jest.fn((key) => key)
            }
        };

        // Create HTML mocks
        mockSelect = {
            closest: jest.fn().mockReturnThis(),
            after: jest.fn(),
            on: jest.fn(),
            0: { value: 'vision' }, // Fix: Changed from 'value' property to array-like structure
            length: 1 // Add length for array-like behavior
        };
        mockCheckbox = {
            0: { checked: true }
        };
        mockSection = {
            addClass: jest.fn(),
            removeClass: jest.fn()
        };
        mockHtml = {
            find: jest.fn((selector) => {
                if (selector === '[name="occlusion.mode"]') return mockSelect;
                if (selector.includes('alsoFade')) return mockCheckbox;
                if (selector.includes('also-fade')) return mockSection;
                return { closest: jest.fn() };
            })
        };

        // Mock app
        mockApp = {
            object: {
                getFlag: jest.fn().mockResolvedValue(true)
            },
            setPosition: jest.fn()
        };
        mockData = {};

        // Create handler instance
        Handler.mockImplementation(function(config, context, utils) {
            this.moduleConstants = config.moduleConstants;
            this.config = config;
            this.context = context;
            this.utils = utils;
        });
        
        handler = new UserInterfaceHandler(mockConfig, mockContext, mockUtils);
    });

    describe('constructor', () => {
        it('should extend Handler', () => {
            expect(Handler).toHaveBeenCalledWith(mockConfig, mockContext, mockUtils);
        });

        it('should set moduleID correctly', () => {
            expect(handler.moduleID).toBe('test-module');
        });

        it('should initialize flags', () => {
            expect(handler.flags).toEqual({
                alsoFade: 'alsoFade',
                showFadeToggle: 'showFadeToggle'
            });
        });
    });

    describe('addRoofVisionFadeUI', () => {
        beforeEach(async () => {
            await handler.addRoofVisionFadeUI(mockApp, mockHtml, mockData);
        });

        it('should get the flag value from the app object', () => {
            expect(mockApp.object.getFlag).toHaveBeenCalledWith('test-module', 'alsoFade');
        });

        it('should find the occlusion mode select element', () => {
            expect(mockHtml.find).toHaveBeenCalledWith('[name="occlusion.mode"]');
        });

        it('should add the UI element after the occlusion mode field', () => {
            expect(mockSelect.closest).toHaveBeenCalledWith('.form-group');
            expect(mockSelect.after).toHaveBeenCalled();
            expect(mockSelect.after.mock.calls[0][0]).toContain('test-module-also-fade');
        });

        it('should set the position of the app to auto height', () => {
            expect(mockApp.setPosition).toHaveBeenCalledWith({ height: 'auto' });
        });

        it('should register a change event listener for occlusion mode select', () => {
            expect(mockSelect.on).toHaveBeenCalledWith('change', expect.any(Function));
        });
    });

    describe('changeOcclusionMode', () => {
        let event;

        beforeEach(() => {
            event = { target: { value: 'vision' } };
        });

        it('should show the UI section when occlusion mode is "vision"', async () => {
            await handler.changeOcclusionMode(event, mockApp, mockHtml);
            expect(mockSection.addClass).toHaveBeenCalledWith('active');
        });

        it('should hide the UI section when occlusion mode is not "vision"', async () => {
            event.target.value = 'notVision';
            await handler.changeOcclusionMode(event, mockApp, mockHtml);
            expect(mockSection.removeClass).toHaveBeenCalledWith('active');
        });

        it('should clear the checkbox when occlusion mode is not "vision"', async () => {
            event.target.value = 'notVision';
            await handler.changeOcclusionMode(event, mockApp, mockHtml);
            expect(mockCheckbox[0].checked).toBe(false);
        });

        it('should resize the app', async () => {
            await handler.changeOcclusionMode(event, mockApp, mockHtml);
            expect(mockApp.setPosition).toHaveBeenCalledWith({ height: 'auto' });
        });
    });

    describe('startUIListener', () => {
        it('should register a hook for renderTileConfig', () => {
            handler.startUIListener();
            expect(Hooks.on).toHaveBeenCalledWith('renderTileConfig', expect.any(Function));
        });

        it('should call addRoofVisionFadeUI when the hook is triggered', async () => {
            handler.addRoofVisionFadeUI = jest.fn();
            handler.startUIListener();
            
            // Get the callback function registered with the hook
            const callback = Hooks.on.mock.calls[0][1];
            
            // Call the callback
            await callback(mockApp, mockHtml, mockData);
            
            expect(handler.addRoofVisionFadeUI).toHaveBeenCalledWith(mockApp, mockHtml, mockData);
        });
    });
});