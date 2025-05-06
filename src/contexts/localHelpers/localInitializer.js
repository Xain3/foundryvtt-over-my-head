import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits'; // Added import

class LocalContextInitializer {
  #contextState;
  #manager; // Added manager reference

  // Updated constructor signature
  constructor(contextState, manager) {
    if (!(contextState instanceof ContextContainer)) {
        throw new Error("LocalContextInitializer requires a valid ContextContainer instance for contextState.");
    }
    if (!manager) {
         throw new Error("LocalContextInitializer requires a valid LocalContextManager instance.");
    }
    this.#contextState = contextState;
    this.#manager = manager; // Store manager reference
    // Removed assignments from args
  }

  #initializeContainer(initialValues, containerKey, objectType = ContextProperty) {
      // Access contextState directly
      const container = this.#contextState.getKey(containerKey); // Use getKey for consistency
      if (!container || !(container instanceof ContextContainer)) { // Check type
          console.error(`Container "${containerKey}" not found or invalid in context state.`);
          return;
      }
      // Clear existing content before populating? Or assume it's fresh? Assuming fresh for now.
      // container.clear(); // Optional: If re-initialization should clear first
      for (const key in initialValues) {
          if (Object.hasOwnProperty.call(initialValues, key)) {
              const value = initialValues[key];
              // Wrap value in the specified objectType (ContextProperty by default)
              container.set(key, new objectType({ value }));
          }
      }
  }

  initializeData(initialData = {}) {
      // Access key from manager
      this.#initializeContainer(initialData, this.#manager.initialDataKey, ContextProperty);
  }

  initializeFlags(initialFlags = {} ) {
      // Access key from manager
      this.#initializeContainer(initialFlags, this.#manager.initialFlagsKey, ContextProperty);
  }

  initializeSettings(initialSettings = {} ) {
      // Access key from manager
      this.#initializeContainer(initialSettings, this.#manager.initialSettingsKey, ContextProperty);
  }

  // Updated initialize method
  initialize(initialData = {}, initialFlags = {}, initialSettings = {}, clear = true) {
    if (clear) {
        this.#contextState.clear(); // Clear context state if needed
    }
    console.log("Initializer: Populating context state...");
    this.initializeData(initialData);
    this.initializeFlags(initialFlags);
    this.initializeSettings(initialSettings);
    // Timestamps are handled by ContextContainer/Property and updated in the manager
  }
}

export default LocalContextInitializer; // Added export