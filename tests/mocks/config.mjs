/**
 * @file config.mjs
 * @description Mock configuration class for testing handlers
 * @path /tests/mocks/config.mjs
 */

class MockConfig {
    constructor() {
        this.constants = {
            moduleManagement: {
                referToModuleBy: 'title',
                defaults: {
                    modulesLocation: 'game.modules'
                }
            },
            settings: {
                /* mock settings config */
            },
            context: {
                sync: {
                    defaults: {
                        autoSync: true
                    }
                }
            },
            errors: {
                pattern: '{{module}}{{caller}}{{error}}{{stack}}'
            },
            positionChecker: {
                checkTypes: {
                    UNDER: 'under',
                    OVER: 'above' // Override default 'over' for elevation checks
                }
            }
        };

        this.moduleConstants = {
            ID: 'test-module'
        };
    }
}

export default MockConfig;
