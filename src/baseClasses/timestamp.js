class Timestamp {
  constructor() {
    this.created = new Date();
    this.modified = new Date();
    this.accessed = new Date();
  }

  getTimestamp(mode = 'modified') {
    switch (mode) {
      case 'created':
        return this.created;
      case 'modified':
        return this.modified;
      case 'accessed':
        return this.accessed;
      case 'all':
        return {
          created: this.created,
          modified: this.modified,
          accessed: this.accessed,
        };
      default:
        console.error(`Invalid mode "${mode}" specified. Defaulting to "modified".`);
        return this.modified;
    }
  }

  setTimestamp(mode = 'modified', newTimestamp) {
    switch (mode) {
      case 'created':
        this.created = new Date(newTimestamp);
        break;
      case 'modified':
        this.modified = new Date(newTimestamp);
        break;
      case 'accessed':
        this.accessed = new Date(newTimestamp);
      case 'all':
        this.created = new Date(newTimestamp);
        this.modified = new Date(newTimestamp);
        this.accessed = new Date(newTimestamp);
        break;
      default:
        console.error(`Invalid mode "${mode}" specified. Defaulting to "modified".`);
        this.modified = new Date(newTimestamp);
    }
  }

  updateTimestamp(newTimestamp, mode = 'modified') {
    this.setTimestamp(mode, newTimestamp);
  }

  resetTimestamps() {
    this.created = new Date();
    this.modified = new Date();
    this.accessed = new Date();
  }

  getAllTimestamps() {
    return {
      created: this.created,
      modified: this.modified,
      accessed: this.accessed,
    };
  }
}


export default Timestamp;