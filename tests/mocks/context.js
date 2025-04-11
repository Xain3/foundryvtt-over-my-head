// @mocks/context.js

class MockContext {
  constructor(config, utils) {
    this.config = config;
    this.utils = utils;
    this.state = {
      data: {},
      flags: {},
      dateModified: Date.now(),
    };
    this.remoteLocation = null;
  }

  initializeContext(state = {}) {
    this.state = state;
  }

  initialiseData(data) {
    this.state.data = data;
    this.state.dateModified = Date.now();
  }

  initialiseFlags(flags) {
    this.state.flags = flags;
    this.state.dateModified = Date.now();
  }

  setRemoteLocation(remoteLocation, alsoPush = false) {
    this.remoteLocation = remoteLocation;
    if (alsoPush) {
      this.pushState();
    }
  }

  getRemoteLocation() {
    return this.remoteLocation;
  }

  pushState() {
    // Mock implementation
  }

  pullState() {
    // Mock implementation
  }

  syncState(remoteLocation = null) {
    // Mock implementation
  }

  writeToRemoteContext(key, value) {
    // Mock implementation
  }

  readFromRemoteContext(key) {
    // Mock implementation
    return null;
  }

  clearRemoteContext() {
    // Mock implementation
  }

  get(key) {
    return this.state[key];
  }

  getState() {
    return this.state;
  }

  getConfig(key = null) {
    if (key) {
      return this.config[key];
    }
    return this.config;
  }

  getFlags(key = null) {
    if (key) {
      return this.state.flags[key];
    }
    return this.state.flags;
  }

  getData(key = null) {
    if (key) {
      return this.state.data[key];
    }
    return this.state.data;
  }

  set(key, value) {
    this.state.data[key] = value;
    this.state.dateModified = Date.now();
  }

  setFlags(key, value) {
    this.state.flags[key] = value;
    this.state.dateModified = Date.now();
  }

  getFlag(key) {
    return this.state.flags[key];
  }
}

export default MockContext;