// This module provides mock objects for testing purposes.

// @mocks/objects.js

function createMockToken(props) {
  return {
    x: props.x || 0,
    y: props.y || 0,
    width: props.width || 100,
    height: props.height || 100,
    document: {
      elevation: props.elevation || 0,
      isOwner: props.isOwner !== undefined ? props.isOwner : true
    },
    _controlled: props.controlled || false,
    isSelected: props.isSelected || false,
    alpha: 1,
    ...props
  };
}

function createMockTile(props) {
  return {
    x: props.x || 0,
    y: props.y || 0,
    width: props.width || 100,
    height: props.height || 100,
    document: {
      elevation: props.elevation || 0,
      occlusion: props.occlusion || { mode: 'none' },
      flags: props.flags || {}
    },
    ...props
  };
}



class MockObjects {
  constructor() {
    this.createMockToken = createMockToken;
    this.createMockTile = createMockTile;
    this.token = createMockToken({ x: 100, y: 100, elevation: 0 });
    this.token2 = createMockToken({ x: 200, y: 200, elevation: 0 });
    this.token3 = createMockToken({ x: 300, y: 300, elevation: 0 });
    this.mockTile = createMockTile({ x: 95, y: 95, width: 20, height: 20, elevation: 10 });
    this.mockTile2 = createMockTile({ x: 200, y: 200, width: 20, height: 20, elevation: 10 });
    this.mockTile3 = createMockTile({ x: 300, y: 300, width: 20, height: 20, elevation: 10 });
  }

  setMockGlobals() {
    // Mock global objects
    global.game = {
      modules: {
          get: jest.fn((id) => {
              if (id === 'test-module') {
                  return { id: 'test-module', /* other module props */ };
              }
              return undefined;
          }),
      },
      settings: {
          get: jest.fn(),
          set: jest.fn(),
      },
      user: {
          // Mock user properties/methods if needed (e.g., flags)
          flags: {},
          setFlag: jest.fn((scope, key, value) => {
              if (!global.game.user.flags[scope]) global.game.user.flags[scope] = {};
              global.game.user.flags[scope][key] = value;
          }),
          getFlag: jest.fn((scope, key) => global.game.user.flags[scope]?.[key]),
      },
      world: {
          // Mock world properties/methods if needed
      },
      // Add other game properties if needed
    };
    global.canvas = { /* Mock canvas */ };
    global.ui = { /* Mock ui */ };
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
      // Mock other global objects as needed
  }
}

export default MockObjects;
export { createMockToken, createMockTile };
