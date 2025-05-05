// @mocks/utils.js

import MockConfig from "./config.js";
import MockGame from "./game.js";

// ./src/mocks/utils.js

const config = new MockConfig()
const game = new MockGame().getGame();

const gameManager = jest.fn().mockImplementation(() => ({
  game: game,
  const: config.CONSTANTS,
  contextInit: {},
  moduleConstants: {},
  contextPath: "",
  moduleObject: {},
  remoteContextManager: {},
  getModuleObject: jest.fn(),
  getModulePath: jest.fn(),
  updateConfig: jest.fn(),
  writeToModuleObject: jest.fn(),
  readFromModuleObject: jest.fn(),
  pushToRemoteContext: jest.fn(),
}));

const hookFormatter = jest.fn().mockImplementation(() => ({
  mappings: {},
  SETTINGS: {},
  prefix: "",
  noPrefixGroups: [],
  allowedGroups: [],
  formatHook: jest.fn(),
}));

const initializer = jest.fn().mockImplementation(() => ({
  config,
  utils: {},
  logger: {},
  gameManager: {},
  hookFormatter: {},
  Context: {},
  initializeContext: jest.fn(),
  initializeRemoteContext: jest.fn(),
  registerSettings: jest.fn(),
  initializeModule: jest.fn(),
}));

const logger = jest.fn().mockImplementation(() => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const localizer = jest.fn().mockImplementation(() => ({
  translate: jest.fn(),
}));

const jsonDataManager = jest.fn().mockImplementation(() => ({
  getJsonData: jest.fn(),
  setJsonData: jest.fn(),
}));

const mockConfig = new MockConfig().getConfig();

class MockUtilities {
    static config = config;
    static context = {};
    static gameManager = gameManager();
    static hookFormatter = hookFormatter();
    static initializer = initializer();
    static logger = logger();
    static localizer = localizer();
    static jsonDataManager = jsonDataManager();
    static updateConfig = jest.fn();
  }


export default MockUtilities;