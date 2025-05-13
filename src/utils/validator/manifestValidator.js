import manifest from '@manifest';
import { z } from 'zod';

const moduleManifest = manifest;

/**
 * A utility class for validating manifest objects against a predefined schema using Zod.
 *
 * The schema enforces the following rules:
 * - The `constants` property must be an object containing:
 *   - `validatorSeparator`: a non-empty string.
 *   - `referToModuleBy`: a non-empty string.
 * - At least one of the following properties must be present: `title`, `name`, `shortName`, or `id`.
 * - The properties `title`, `name`, `shortName`, and `id` are optional strings.
 *
 * Throws a detailed error if validation fails.
 */
class ManifestValidator {
  static #manifestSchema = z.object({
    constants: z.object({
      validatorSeparator: z.string().min(1, { message: 'validatorSeparator cannot be empty' }),
      referToModuleBy: z.string().min(1, { message: 'referToModuleBy cannot be empty' }),
    }),
    title: z.string().optional(),
    name: z.string().optional(),
    shortName: z.string().optional(),
    id: z.string().optional(),
  }).refine(data => data.title || data.name || data.shortName || data.id, {
    message: "Manifest must have at least one of 'title', 'name', 'shortName', or 'id'",
  });

  /**
   * Validates a manifest object by running a series of validation checks using Zod.
   *
   * @param {Object} manifest - The manifest object to validate.
   * @throws {z.ZodError} If any of the validation checks fail.
   */
  static validateManifest(manifest) {
    try {
      this.#manifestSchema.parse(manifest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Construct a more informative error message from Zod's issues
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Invalid manifest: ${messages.join('; ')}`);
      }
      // Re-throw other errors
      throw error;
    }
  }
}

export default ManifestValidator;