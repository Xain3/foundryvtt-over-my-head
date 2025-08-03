/**
 * @file config.js
 * @description Mock configuration class for testing handlers
 * @path /tests/mocks/config.js
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
            }
        };
        
        this.moduleConstants = {
            ID: 'test-module'
        };
    }
}

export default MockConfig;
