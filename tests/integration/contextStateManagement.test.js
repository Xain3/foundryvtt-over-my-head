import Config from "../../src/config/config";
import Context from "../../src/contexts/context";
import Utilities from "../../src/utils/utils";
import Game from "../mocks/game";

global.game = {
  getGame: Game.getGame,
  l18n: Game.l18n,
};

describe('Context and State Management Integration', () => {
  let contextA, contextB, config, utils;
  
  beforeEach(() => {
    config = new Config();
    utils = new Utilities(config);
    // Create two separate context instances to simulate multiple clients
    contextA = new Context(config, utils);
    contextB = new Context(config, utils);
  });
  
  it('should correctly sync state between local and remote contexts', async () => {
    // Set up initial state in first context
    contextA.initialiseData({testKey: 'initialValue'});
    
    // Push state to remote from first context
    await contextA.pushState();
    
    // Pull state in second context to verify remote was updated
    contextB.remoteContext = contextA.remoteContext;
    await contextB.pullState();
    expect(contextB.state.data.testKey).toBe('initialValue');
    
    // Update state in second context
    contextB.initialiseData({testKey: 'updatedValue'});
    
    // Push updated state from second context
    await contextB.pushState();
    
    // Pull updated state in first context
    await contextA.pullState();
    
    // Verify first context now has updated state
    expect(contextA.state.data.testKey).toBe('updatedValue');
  });
  
  it('should update specific keys in remote context', async () => {
    // Initialize contexts with test data
    contextA.initialiseData({testKey: 'initialValue', otherKey: 'unchanged'});
    await contextA.pushState();
    
    // Use writeToRemoteContext to modify just one field
    contextB.writeToRemoteContext('data.testKey', 'modifiedDirectly');
    
    // Pull updates in first context
    await contextA.pullState();
    
    // Verify only the specific key was changed
    expect(contextA.state.data.testKey).toBe('modifiedDirectly');
    expect(contextA.state.data.otherKey).toBe('unchanged');
  });
});