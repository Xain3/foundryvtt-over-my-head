import { Config } from '../../src/config/config';
import { Context } from '../../src/contexts/context';
import { Handlers } from '../../src/handlers/handlers';
import { Utilities } from '../../src/utils/utils';
import { createMockToken, createMockTile } from '../mocks/objects';

describe('Token-Tile Occlusion Integration', () => {
  let handlers, context, config, utils;
  
  beforeEach(() => {
    // Set up a complete system with real components
    config = new Config();
    utils = new Utilities(config);
    context = new Context(config, utils);
    handlers = new Handlers(config, context, utils);
    
    // Mock canvas and necessary Foundry objects
    global.canvas = {
      tokens: { placeables: [] },
      tiles: { placeables: [] }
    };
  });
  
  it('should correctly identify when a token is under a tile', () => {
    // Create mock token and tile with realistic positions
    const mockToken = createMockToken({x: 100, y: 100, elevation: 0});
    const mockTile = createMockTile({x: 95, y: 95, width: 20, height: 20, elevation: 10});
    
    // Test the complete workflow
    const result = handlers.token.isUnderTile(mockToken, mockTile, handlers.tile);
    
    expect(result).toBe(true);
  });
  
  it('should apply correct occlusion effects when token moves under tile', () => {
    // Set up mock objects with appropriate document structure
    const mockToken = createMockToken({x: 50, y: 50, elevation: 0});
    const mockTile = createMockTile({x: 100, y: 100, width: 20, height: 20, elevation: 10});
    mockTile.document = {
      flags: { [config.CONSTANTS.MODULE.ID]: { alsoFade: true } },
      occlusion: { mode: 'vision' }
    };
    
    // Add to canvas
    canvas.tokens.placeables.push(mockToken);
    canvas.tiles.placeables.push(mockTile);
    
    // Move token under tile and trigger handler
    mockToken.x = 105;
    mockToken.y = 105;
    handlers.occlusion.updateTokenVisibility(mockToken);
    
    // Verify token visibility changed
    expect(mockToken.alpha).toBeLessThan(1);
  });
});