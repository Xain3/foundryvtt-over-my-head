/**
 * @file manifest.mjs
 * @description This file exports a function that validates and returns the imported manifest object using the ManifestParser helper.
 * @path src/config/manifest.mjs
*/

import importedManifest from "../../module.json" assert { type: "json" };
import ManifestParser from "./helpers/manifestParser.mjs";

/**
 * Validates and returns the manifest object using the ManifestParser helper.
 * Creates a new ManifestParser instance with the imported manifest and
 * returns the validated and frozen manifest object.
 *
 * The manifest is validated once when this module is imported.
 *
 * @export
 * @type {Object} The validated and frozen manifest object.
 * @throws {Error} If validation fails during module initialization.
 */
const parser = new ManifestParser(importedManifest);

/**
 * The validated and frozen manifest object.
 *
 * @type {Object}
 */
const manifest = parser.getValidatedManifest();

export default manifest;
