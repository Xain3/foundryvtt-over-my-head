import GameManager from "../../src/utils/gameManager.js";
import HookFormatter from "../../src/utils/hookFormatter.js";
import Initializer from "../../src/utils/initializer.js";
import Logger from "../../src/utils/logger.js";
import Localizer from "../../src/utils/localizer.js";
import RemoteContextManager from "../../src/utils/remoteContextManager.js";
import JsonDataManager from "../../src/utils/jsonDataManager.js";
import MockConfig from "./mockConfig.js";
import Utilities from "../../src/utils/utils.js";

// ./src/mocks/mockUtils.js


jest.mock("../utils/gameManager.js");
jest.mock("../utils/hookFormatter.js");
jest.mock("../utils/initializer.js");
jest.mock("../utils/logger.js");
jest.mock("../utils/localizer.js");
jest.mock("../utils/remoteContextManager.js");
jest.mock("../utils/jsonDataManager.js");

const mockConfig = new MockConfig().getConfig();

const mockUtilities = new Utilities(mockConfig);

export default mockUtilities;