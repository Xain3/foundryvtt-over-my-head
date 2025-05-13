import { z } from 'zod';

/**
 * Utility class for validating parent objects using a Zod schema.
 * Ensures that the parent object is a non-null object containing a 'prototype'
 * property, which itself must be an object with a non-empty string 'name' property.
 * Throws informative errors if validation fails.
 *
 * @class
 */
class ParentObjectValidator {
  static #parentSchema = z.object({
    prototype: z.object({
      name: z.string().min(1, { message: 'Parent prototype name cannot be empty' }),
    }).refine(proto => typeof proto.name === 'string', {
      message: 'Parent prototype must have a name property of type string.',
      path: ['prototype', 'name'],
    }),
  }).refine(parent => parent !== null && typeof parent === 'object', {
    message: 'Invalid parent: Must be a non-null object.',
    path: [], // Path to the parent object itself
  });

  /**
   * Validates the given parent object using a Zod schema.
   * Throws a ZodError if validation fails.
   *
   * @param {Object} parent - The parent object to validate.
   * @throws {z.ZodError} If the parent object does not conform to the schema.
   */
  static validateParentObject(parent) {
    try {
      this.#parentSchema.parse(parent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Construct a more informative error message from Zod's issues
        const messages = error.errors.map(err => `${err.path.join('.') || 'parent'}: ${err.message}`);
        throw new Error(`Invalid parent object: ${messages.join('; ')}`);
      }
      // Re-throw other errors
      throw error;
    }
  }
}

export default ParentObjectValidator;
