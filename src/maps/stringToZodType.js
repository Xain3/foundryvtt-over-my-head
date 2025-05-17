import { z } from 'zod';

export const typeMap = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  object: z.object({}),
  array: z.array(z.any()),
  datetime: z.number()        // Timestamp is a Unix timestamp in milliseconds
    .int()                    // Ensure it's an integer as timestamps are whole numbers
    .positive(),              // Ensure it's positive as 1971-01-01 is in the past
};

/**
 * Converts a string representing a type to its corresponding Zod schema type.
 *
 * @param {string} typeStr - The string representation of the type (e.g., "string", "number").
 * @param {Object} [map=typeMap] - An optional mapping object from type strings to Zod schema types.
 * @returns {import('zod').ZodTypeAny} The corresponding Zod schema type, or `z.any()` if not found.
 */
export function stringToZodType(typeStr, map = typeMap) {
    return map[typeStr.toLowerCase()] || z.any();
  }