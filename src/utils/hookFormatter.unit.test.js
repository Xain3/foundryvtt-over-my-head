// ./src/utils/hookFormatter.test.js

import HookFormatter from './hookFormatter.js';
import Utility from '../baseClasses/utility.js';

describe('HookFormatter', () => {
  let CONFIG;
  let hookFormatter;

  beforeEach(() => {
    CONFIG = {
      HOOKS: {
        getMappings: jest.fn().mockReturnValue({
          groupWithPrefix: {
            hookA: 'HookA',
          },
          groupWithoutPrefix: {
            hookB: 'HookB',
          },
        }),
        getSettings: jest.fn().mockReturnValue({
          NO_PREFIX_GROUPS: ['groupWithoutPrefix'],
          ALLOWED_GROUPS: ['groupWithPrefix', 'groupWithoutPrefix'],
        }),
      },
      CONSTANTS: {
        MODULE: {
          SHORT_NAME: 'Mod_', // This mock value is used by hookFormatter instance
          DEFAULTS : {
            DEBUG_MODE: false,
          }
        },
      },
    };
    hookFormatter = new HookFormatter(CONFIG);
  });

  test('should format hook with prefix when required', () => {
    const formattedHook = hookFormatter.formatHook('hookA', 'groupWithPrefix');
    expect(formattedHook).toBe('Mod_HookA');
  });

  test('should format hook without prefix when not required', () => {
    const formattedHook = hookFormatter.formatHook('hookB', 'groupWithoutPrefix');
    expect(formattedHook).toBe('HookB');
  });

  test('should throw error for invalid hook group', () => {
    expect(() => {
      hookFormatter.formatHook('hookC', 'invalidGroup');
    }).toThrow('Hook group invalidGroup is not allowed.');
  });

  test('should throw error when hook group is missing', () => {
    expect(() => {
      hookFormatter.formatHook('hookA', '');
    }).toThrow('Hook group is required.');
  });

  test('should throw error when hook name is missing', () => {
    expect(() => {
      hookFormatter.formatHook('', 'groupWithPrefix');
    }).toThrow('Hook name is required.');
  });

  test('should throw error if hook location is not found', () => {
    let group = 'allowedGroupThatIsNotThere';
    hookFormatter.allowedGroups += group;;
    expect(() => {
      hookFormatter.formatHook('hookC', group);
    }).toThrow(`Hook location for group ${group} not found.`);
  });

  test('should throw error if hook location is not an object', () => {
    let group = 'groupWithPrefix';
    hookFormatter.mappings[group] = 'notAnObject';
    let wrongType = typeof hookFormatter.mappings[group];
    expect(() => {
      hookFormatter.formatHook('hookC', group);
    }).toThrow(`Hook location for group ${group} is not an object but a ${wrongType}.`);
  });

  test('should update properties based on the new config', () => {
    let mockConfig = {
        HOOKS: {
          getMappings: jest.fn().mockReturnValue({
            groupWithPrefix: {
              hookA: 'HookC',
            },
            groupWithoutPrefix: {
              hookB: 'HookD',
            },
          }),
          SETTINGS: {
            NO_PREFIX_GROUPS: ['groupWithoutPrefix'],
            ALLOWED_GROUPS: ['groupWithPrefix', 'groupWithoutPrefix'],
          },
          getSettings: jest.fn().mockReturnValue({
            NO_PREFIX_GROUPS: ['groupWithoutPrefix'],
            ALLOWED_GROUPS: ['groupWithPrefix', 'groupWithoutPrefix'],
          }),
        },
        CONSTANTS: {
          MODULE: {
            SHORT_NAME: 'Mod_',
            DEFAULTS : {
              DEBUG_MODE: false,
            }
          },
        },
      };
    hookFormatter.updateConfig(mockConfig);

    expect(hookFormatter.mappings).toEqual(mockConfig.HOOKS.getMappings());
    expect(hookFormatter.SETTINGS).toEqual(mockConfig.HOOKS.getSettings());
    expect(hookFormatter.prefix).toBe(mockConfig.CONSTANTS.MODULE.SHORT_NAME);
    expect(hookFormatter.noPrefixGroups).toEqual(mockConfig.HOOKS.SETTINGS.NO_PREFIX_GROUPS);
    expect(hookFormatter.allowedGroups).toEqual(mockConfig.HOOKS.SETTINGS.ALLOWED_GROUPS);
  });
});
