import manifest from "@manifest";

class OverMyHead {
  constructor() {
    this.manifest = manifest;
    this.#unpackManifest();
  }

  #unpackManifest() {
    try {
      for (const [key, value] of Object.entries(this.manifest)) {
        this[key] = value;
      }
    } catch (error) {
      console.error("Error unpacking Over My Head manifest:", error);
      throw error;
    }
  }

  async init() {
    try {
      // Initialization logic to go here
      console.log(`${this.title} v${this.version} initialized.`);
    } catch (error) {
      console.error(`Error initializing ${this.title} v${this.version}: `, error);
      throw error;
    }
  }
}

function main() {
  const omh = new OverMyHead();
  omh.init();
}

main();