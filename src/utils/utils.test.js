import Utilities from './utils';
import GameManager from './gameManager';
import HookFormatter from './hookFormatter';
import Initializer from './initializer';
import Logger from './logger';
import Localizer from './localizer';
import JsonDataManager from './jsonDataManager';
import Validator from './validator';
import Context from '../contexts/context';

// ./src/utils/utils.test.js


jest.mock('./gameManager');
jest.mock('./hookFormatter');
jest.mock('./initializer');
jest.mock('./logger');
jest.mock('./localizer');
jest.mock('./jsonDataManager');
jest.mock('./validator');

describe('Utilities', () => {
    let CONFIG;
    let utilities;

    beforeEach(() => {
        CONFIG = { key: 'value' };
        utilities = new Utilities(CONFIG);
    });

    it('should initialize with the provided configuration', () => {
        expect(utilities.CONFIG).toBe(CONFIG);
        expect(utilities.validator).toBeInstanceOf(Validator);
        expect(utilities.json).toBeInstanceOf(JsonDataManager);
        expect(utilities.gameManager).toBeInstanceOf(GameManager);
        expect(utilities.logger).toBeInstanceOf(Logger);
        expect(utilities.hookFormatter).toBeInstanceOf(HookFormatter);
        expect(utilities.localizer).toBeInstanceOf(Localizer);
        expect(utilities.initializer).toBeInstanceOf(Initializer);
    });

    it('should call updateConfig on all components when updateConfig is called', () => {
        const newConfig = { key: 'newValue' };

        utilities.updateConfig(newConfig);

        expect(utilities.CONFIG).toBe(newConfig);
        expect(utilities.gameManager.updateConfig).toHaveBeenCalledWith(newConfig);
        expect(utilities.hookFormatter.updateConfig).toHaveBeenCalledWith(newConfig);
        expect(utilities.initializer.updateConfig).toHaveBeenCalledWith(newConfig);
        expect(utilities.localizer.updateConfig).toHaveBeenCalledWith(newConfig);
        expect(utilities.logger.updateConfig).toHaveBeenCalledWith(newConfig);
    });

    it('should pass the correct dependencies to Initializer', () => {
        expect(Initializer).toHaveBeenCalledWith(CONFIG, utilities, Context);
    });

    it('should pass the correct dependencies to GameManager', () => {
        expect(GameManager).toHaveBeenCalledWith(CONFIG, utilities.remoteContextManager);
    });

    it('should pass the correct dependencies to Logger', () => {
        expect(Logger).toHaveBeenCalledWith(CONFIG, utilities.gameManager);
    });

    it('should pass the correct dependencies to Localizer', () => {
        expect(Localizer).toHaveBeenCalledWith(CONFIG, utilities.gameManager.game);
    });
});