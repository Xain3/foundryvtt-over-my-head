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
    this.mockTile = createMockTile({ x: 95, y: 95, width: 20, height: 20, elevation: 10 });
  }
}

export default MockObjects;
export { createMockToken, createMockTile };
