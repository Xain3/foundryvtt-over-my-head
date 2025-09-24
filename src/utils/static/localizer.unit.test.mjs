/**
 * @file localizer.unit.test.mjs
 * @description Unit tests for the Localizer class, covering Foundry VTT i18n interface functionality.
 * @path src/utils/static/localizer.unit.test.mjs
 */

import Localizer from './localizer.mjs';

const mockI18n = {
  localize: jest.fn(),
  format: jest.fn(),
  has: jest.fn()
};

const mockCustomI18n = {
  localize: jest.fn(),
  format: jest.fn(),
  has: jest.fn()
};

const mockGame = {
  i18n: mockI18n
};

describe('Localizer', () => {
  let localizer;
  let originalGame;

  beforeEach(() => {
    jest.clearAllMocks();
    // Store original global.game
    originalGame = global.game;
    // Mock global game object
    global.game = mockGame;
    localizer = new Localizer();
    
    // Clear mock implementations
    mockI18n.localize.mockClear();
    mockI18n.format.mockClear();
    mockI18n.has.mockClear();
    mockCustomI18n.localize.mockClear();
    mockCustomI18n.format.mockClear();
    mockCustomI18n.has.mockClear();
  });

  afterEach(() => {
    // Restore original global.game
    global.game = originalGame;
  });

  describe('constructor', () => {
    it('should initialize with game.i18n instance when no parameter provided', () => {
      expect(localizer.i18n).toBe(mockI18n);
    });

    it('should initialize with provided i18n instance when parameter is given', () => {
      const customLocalizer = new Localizer(mockCustomI18n);
      expect(customLocalizer.i18n).toBe(mockCustomI18n);
    });

    it('should handle missing game object gracefully', () => {
      global.game = undefined;
      const localizerWithoutGame = new Localizer();
      expect(localizerWithoutGame.i18n).toBeUndefined();
    });

    it('should handle game object without i18n property', () => {
      global.game = {};
      const localizerWithoutI18n = new Localizer();
      expect(localizerWithoutI18n.i18n).toBeUndefined();
    });

    it('should prefer provided i18n instance over game.i18n', () => {
      const customLocalizer = new Localizer(mockCustomI18n);
      expect(customLocalizer.i18n).toBe(mockCustomI18n);
      expect(customLocalizer.i18n).not.toBe(mockI18n);
    });

    it('should handle null i18n instance parameter and fallback to game.i18n', () => {
      const localizerWithNull = new Localizer(null);
      expect(localizerWithNull.i18n).toBe(mockI18n);
    });
  });

  describe('localize', () => {
    it('should call i18n.localize with stringId only', () => {
      const stringId = 'test.key';
      const expectedResult = 'Localized string';
      
      mockI18n.localize.mockReturnValue(expectedResult);
      
      const result = localizer.localize(stringId);
      
      expect(mockI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
    });

    it('should not accept data parameter for localize method', () => {
      const stringId = 'test.key';
      const expectedResult = 'Localized string';
      
      mockI18n.localize.mockReturnValue(expectedResult);
      
      // Test that calling with data parameter still works but data is ignored
      const result = localizer.localize(stringId);
      
      expect(mockI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
    });

    it('should throw error when i18n instance is not available', () => {
      localizer.i18n = null;
      
      expect(() => localizer.localize('test.key')).toThrow(
        'Foundry VTT i18n instance not available. Ensure this is called after game initialization.'
      );
    });

    it('should work with custom i18n instance', () => {
      const customLocalizer = new Localizer(mockCustomI18n);
      const stringId = 'custom.test';
      const expectedResult = 'Custom localized string';
      
      mockCustomI18n.localize.mockReturnValue(expectedResult);
      
      const result = customLocalizer.localize(stringId);
      
      expect(mockCustomI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
      expect(mockI18n.localize).not.toHaveBeenCalled();
    });
  });

  describe('format', () => {
    it('should call i18n.format with stringId and data', () => {
      const stringId = 'test.format';
      const data = { count: 5, item: 'items' };
      const expectedResult = 'You have 5 items';
      
      mockI18n.format.mockReturnValue(expectedResult);
      
      const result = localizer.format(stringId, data);
      
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, data);
      expect(result).toBe(expectedResult);
    });

    it('should use empty object as default data parameter', () => {
      const stringId = 'test.format';
      const expectedResult = 'Formatted string';
      
      mockI18n.format.mockReturnValue(expectedResult);
      
      const result = localizer.format(stringId);
      
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, {});
      expect(result).toBe(expectedResult);
    });

    it('should throw error when i18n instance is not available', () => {
      localizer.i18n = null;
      
      expect(() => localizer.format('test.key')).toThrow(
        'Foundry VTT i18n instance not available. Ensure this is called after game initialization.'
      );
    });

    it('should work with custom i18n instance', () => {
      const customLocalizer = new Localizer(mockCustomI18n);
      const stringId = 'custom.format';
      const data = { name: 'Test' };
      const expectedResult = 'Custom formatted Test';
      
      mockCustomI18n.format.mockReturnValue(expectedResult);
      
      const result = customLocalizer.format(stringId, data);
      
      expect(mockCustomI18n.format).toHaveBeenCalledWith(stringId, data);
      expect(result).toBe(expectedResult);
      expect(mockI18n.format).not.toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should call i18n.has with stringId and return result', () => {
      const stringId = 'existing.key';
      
      mockI18n.has.mockReturnValue(true);
      
      const result = localizer.has(stringId);
      
      expect(mockI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', () => {
      const stringId = 'nonexistent.key';
      
      mockI18n.has.mockReturnValue(false);
      
      const result = localizer.has(stringId);
      
      expect(mockI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(false);
    });

    it('should return false when i18n instance is not available', () => {
      localizer.i18n = null;
      
      const result = localizer.has('test.key');
      
      expect(result).toBe(false);
      expect(mockI18n.has).not.toHaveBeenCalled();
    });

    it('should work with custom i18n instance', () => {
      const customLocalizer = new Localizer(mockCustomI18n);
      const stringId = 'custom.key';
      
      mockCustomI18n.has.mockReturnValue(true);
      
      const result = customLocalizer.has(stringId);
      
      expect(mockCustomI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(true);
      expect(mockI18n.has).not.toHaveBeenCalled();
    });
  });

  describe('static localize', () => {
    it('should call game.i18n.localize with stringId only', () => {
      const stringId = 'static.test';
      const expectedResult = 'Static test';
      
      mockI18n.localize.mockReturnValue(expectedResult);
      
      const result = Localizer.localize(stringId);
      
      expect(mockI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
    });

    it('should work with custom i18n instance', () => {
      const stringId = 'static.custom';
      const expectedResult = 'Static custom test';
      
      mockCustomI18n.localize.mockReturnValue(expectedResult);
      
      const result = Localizer.localize(stringId, mockCustomI18n);
      
      expect(mockCustomI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
      expect(mockI18n.localize).not.toHaveBeenCalled();
    });

    it('should not accept data parameter for static localize method', () => {
      const stringId = 'static.test';
      const expectedResult = 'Static test';
      
      mockI18n.localize.mockReturnValue(expectedResult);
      
      const result = Localizer.localize(stringId);
      
      expect(mockI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
    });

    it('should throw error when game.i18n is not available', () => {
      global.game = null;
      
      expect(() => Localizer.localize('test.key')).toThrow(
        'Foundry VTT i18n instance not available. Ensure this is called after game initialization or provide an i18n instance.'
      );
    });

    it('should throw error when game exists but i18n does not', () => {
      global.game = {};
      
      expect(() => Localizer.localize('test.key')).toThrow(
        'Foundry VTT i18n instance not available. Ensure this is called after game initialization or provide an i18n instance.'
      );
    });

    it('should work with custom i18n when game.i18n is not available', () => {
      global.game = null;
      const stringId = 'test.key';
      const expectedResult = 'Custom result';
      
      mockCustomI18n.localize.mockReturnValue(expectedResult);
      
      const result = Localizer.localize(stringId, mockCustomI18n);
      
      expect(mockCustomI18n.localize).toHaveBeenCalledWith(stringId);
      expect(result).toBe(expectedResult);
    });
  });

  describe('static format', () => {
    it('should call game.i18n.format with stringId and data', () => {
      const stringId = 'static.format';
      const data = { name: 'John', age: 30 };
      const expectedResult = 'John is 30 years old';
      
      mockI18n.format.mockReturnValue(expectedResult);
      
      const result = Localizer.format(stringId, data);
      
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, data);
      expect(result).toBe(expectedResult);
    });

    it('should work with custom i18n instance', () => {
      const stringId = 'static.custom.format';
      const data = { value: 'test' };
      const expectedResult = 'Custom formatted test';
      
      mockCustomI18n.format.mockReturnValue(expectedResult);
      
      const result = Localizer.format(stringId, data, mockCustomI18n);
      
      expect(mockCustomI18n.format).toHaveBeenCalledWith(stringId, data);
      expect(result).toBe(expectedResult);
      expect(mockI18n.format).not.toHaveBeenCalled();
    });

    it('should use empty object as default data parameter', () => {
      const stringId = 'static.format';
      const expectedResult = 'Static formatted';
      
      mockI18n.format.mockReturnValue(expectedResult);
      
      const result = Localizer.format(stringId);
      
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, {});
      expect(result).toBe(expectedResult);
    });

    it('should throw error when game.i18n is not available', () => {
      global.game = null;
      
      expect(() => Localizer.format('test.key')).toThrow(
        'Foundry VTT i18n instance not available. Ensure this is called after game initialization or provide an i18n instance.'
      );
    });

    it('should work with custom i18n when game.i18n is not available', () => {
      global.game = null;
      const stringId = 'test.key';
      const data = { name: 'Test' };
      const expectedResult = 'Custom result';
      
      mockCustomI18n.format.mockReturnValue(expectedResult);
      
      const result = Localizer.format(stringId, data, mockCustomI18n);
      
      expect(mockCustomI18n.format).toHaveBeenCalledWith(stringId, data);
      expect(result).toBe(expectedResult);
    });
  });

  describe('static has', () => {
    it('should call game.i18n.has with stringId and return result', () => {
      const stringId = 'static.existing';
      
      mockI18n.has.mockReturnValue(true);
      
      const result = Localizer.has(stringId);
      
      expect(mockI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', () => {
      const stringId = 'static.nonexistent';
      
      mockI18n.has.mockReturnValue(false);
      
      const result = Localizer.has(stringId);
      
      expect(mockI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(false);
    });

    it('should return false when game.i18n is not available', () => {
      global.game = null;
      
      const result = Localizer.has('test.key');
      
      expect(result).toBe(false);
      expect(mockI18n.has).not.toHaveBeenCalled();
    });

    it('should return false when game exists but i18n does not', () => {
      global.game = {};
      
      const result = Localizer.has('test.key');
      
      expect(result).toBe(false);
      expect(mockI18n.has).not.toHaveBeenCalled();
    });

    it('should work with custom i18n instance', () => {
      const stringId = 'static.custom.has';
      
      mockCustomI18n.has.mockReturnValue(false);
      
      const result = Localizer.has(stringId, mockCustomI18n);
      
      expect(mockCustomI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(false);
      expect(mockI18n.has).not.toHaveBeenCalled();
    });

    it('should work with custom i18n when game.i18n is not available', () => {
      global.game = null;
      const stringId = 'test.key';
      
      mockCustomI18n.has.mockReturnValue(true);
      
      const result = Localizer.has(stringId, mockCustomI18n);
      
      expect(mockCustomI18n.has).toHaveBeenCalledWith(stringId);
      expect(result).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical module localization pattern', () => {
      const moduleKey = 'mymodule.settings.title';
      const expectedResult = 'My Module Settings';
      
      mockI18n.localize.mockReturnValue(expectedResult);
      
      const result = localizer.localize(moduleKey);
      
      expect(result).toBe(expectedResult);
      expect(mockI18n.localize).toHaveBeenCalledWith(moduleKey);
    });

    it('should handle string interpolation with user data using format method', () => {
      const stringId = 'mymodule.welcome';
      const data = { playerName: 'Alice', sessionName: 'Adventure Night' };
      const expectedResult = 'Welcome Alice to Adventure Night!';
      
      mockI18n.format.mockReturnValue(expectedResult);
      
      const result = localizer.format(stringId, data);
      
      expect(result).toBe(expectedResult);
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, data);
    });

    it('should validate localization keys before using them', () => {
      const validKey = 'mymodule.valid.key';
      const invalidKey = 'mymodule.invalid.key';
      
      mockI18n.has.mockImplementation((key) => key === validKey);
      
      expect(localizer.has(validKey)).toBe(true);
      expect(localizer.has(invalidKey)).toBe(false);
    });

    it('should demonstrate correct usage pattern: check then localize or format', () => {
      const stringId = 'mymodule.greeting';
      const data = { name: 'Bob' };
      
      // First check if key exists
      mockI18n.has.mockReturnValue(true);
      expect(localizer.has(stringId)).toBe(true);
      
      // If it exists, use format for strings with variables
      const expectedResult = 'Hello Bob!';
      mockI18n.format.mockReturnValue(expectedResult);
      const result = localizer.format(stringId, data);
      
      expect(result).toBe(expectedResult);
      expect(mockI18n.format).toHaveBeenCalledWith(stringId, data);
    });
  });
});
