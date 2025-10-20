**Version**: 0.1.0

# baseClasses Directory

## Purpose

This directory is designed to contain base classes that serve as foundational components for the "Over My Head" Foundry VTT module. These classes provide reusable abstractions and common functionality that can be inherited by other classes throughout the module.

## Structure

Base classes in this directory should follow these conventions:

- **Single Responsibility**: Each base class should have a clear, focused purpose
- **Inheritance Focus**: Base classes are meant to be extended by other classes
- **Reusability**: Common patterns and utilities should be extracted into base classes to reduce duplication
- **Documentation**: Each base class should include JSDoc comments and a clear implementation guide

## Guidelines for Adding Base Classes

1. **Naming Convention**: Use descriptive names that indicate the class is a base (e.g., `BaseHandler`, `BaseManager`)
2. **Export Pattern**: Export base classes from their individual files
3. **Testing**: Create corresponding `.unit.test.mjs` files for each base class
4. **Documentation**: Include JSDoc comments explaining the class purpose, methods, and usage examples

## Currently Available Base Classes

_(None yet - this directory is ready for base class implementations)_

## Related Directories

- `../handlers/` - Handler implementations that may inherit from base classes
- `../utils/` - Utility functions and helpers
- `../contexts/` - Context management for application state

## Contributing

When adding new base classes:

1. Ensure the base class solves a problem with multiple implementations
2. Document the expected interface for subclasses
3. Add unit tests covering the base class functionality
4. Update this README with the new base class information

```

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial base classes directory documentation
```
