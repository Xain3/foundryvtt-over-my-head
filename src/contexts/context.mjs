// ./src/contexts/context.mjs

class Context {
    constructor() {
      this.state = {};
    }

    set(key, value) {
      this.state[key] = value;
    }
    
    get(key) {
      return this.state[key];
    }
  }
  
  export const context = new Context();
  