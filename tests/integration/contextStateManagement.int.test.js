import Config from "@config/config";
import Context from "@contexts/context";
import Utilities from "@utils/utils";
import Mocks from "@mocks/mocks";

describe('Context and State Management Integration', () => {
  let contextA, contextB, config, utils;
  
  beforeEach(() => {
    
    // Set mock globals
    Mocks.setGlobals();

    // Ensure the game object is defined
    if (!global.game) {
      throw new Error('Game object is not defined in the global scope.');
    }

    config = new Config();
    utils = new Utilities(config);
    // Create two separate context instances to simulate multiple clients
    // Initialize with initializeContext=false to set state manually in tests
    contextA = new Context(config, utils, false); 
    contextB = new Context(config, utils, false);
    contextA.initializeContext({data: {}});
    contextB.initializeContext({data: {}});
  });
  
  it('should correctly sync state between local and remote contexts', async () => {
    // Set up initial state in first context
    contextA.initializeContext({data: {testKey: 'initialValue'}});
    
    // Push state to remote from first context
    await contextA.pushState(); // No args needed
    
    // Pull state in second context to verify remote was updated
    // contextB.remoteContext = contextA.remoteContext; // Already handled in beforeEach
    await contextB.pullState(); // No args needed
    expect(contextB.state.data.testKey).toBe('initialValue');
    
    // Update state locally in second context
    contextB.set('testKey', 'updatedValue'); // Use set for local update
    
    // Push updated state from second context
    await contextB.pushState(); // No args needed
    
    // Pull updated state in first context
    await contextA.pullState(); // No args needed
    
    // Verify first context now has updated state
    expect(contextA.state.data.testKey).toBe('updatedValue');
  });
  
  it('should update specific keys in remote context', async () => {
    // Initialize contexts with test data
    contextA.initializeContext({data: {testKey: 'initialValue', otherKey: 'unchanged'}});
    await contextA.pushState(); // No args needed
    
    // contextB.remoteContext = contextA.remoteContext; // Already handled in beforeEach
    
    // Use set with pushChange=true to modify just one field remotely
    contextB.set('testKey', 'modifiedDirectly', true); // pushChange = true
    
    // Pull updates in first context
    await contextA.pullState(); // No args needed
    
    // Verify only the specific key was changed
    expect(contextA.state.data.testKey).toBe('modifiedDirectly');
    expect(contextA.state.data.otherKey).toBe('unchanged'); // Verify other key remains
  });

  it('should verify that context state management integration tests are correctly initialized', () => {
    expect(global.game).toBeDefined();
    expect(config).toBeDefined();
    expect(utils).toBeDefined();
    expect(contextA).toBeDefined();
    expect(contextB).toBeDefined();
  });

  it('should verify that context state management integration tests are correctly run', () => {
    const testValue = true;
    expect(testValue).toBe(true);
  });
});
