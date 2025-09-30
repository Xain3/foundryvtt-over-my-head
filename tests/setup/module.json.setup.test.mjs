/**
 * @file module.json.setup.test.mjs
 * @description Tests to validate the module manifest structure and required/optional attributes
 * @path tests/setup/module.json.setup.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import moduleManifest from '../../module.json';

describe('Module Manifest Validation', () => {
  describe('Required Attributes', () => {
    it('should have id as a string with proper format', () => {
      expect(moduleManifest).toHaveProperty('id');
      expect(typeof moduleManifest.id).toBe('string');
      expect(moduleManifest.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(moduleManifest.id.length).toBeGreaterThan(0);
    });

    it('should have title as a string', () => {
      expect(moduleManifest).toHaveProperty('title');
      expect(typeof moduleManifest.title).toBe('string');
      expect(moduleManifest.title.length).toBeGreaterThan(0);
    });

    it('should have description as a string', () => {
      expect(moduleManifest).toHaveProperty('description');
      expect(typeof moduleManifest.description).toBe('string');
      expect(moduleManifest.description.length).toBeGreaterThan(0);
    });

    it('should have version as a string', () => {
      expect(moduleManifest).toHaveProperty('version');
      expect(typeof moduleManifest.version).toBe('string');
      expect(moduleManifest.version.length).toBeGreaterThan(0);
    });

    it('version should follow semantic versioning format', () => {
      expect(moduleManifest.version).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9]+)?$/);
    });
  });

  describe('Optional Attributes', () => {
    it('compatibility should be properly structured if present', () => {
      if (moduleManifest.compatibility) {
        expect(typeof moduleManifest.compatibility).toBe('object');
        expect(moduleManifest.compatibility).not.toBeNull();

        if (moduleManifest.compatibility.minimum) {
          expect(typeof moduleManifest.compatibility.minimum).toBe('string');
        }

        if (moduleManifest.compatibility.verified) {
          expect(typeof moduleManifest.compatibility.verified).toBe('string');
        }

        if (moduleManifest.compatibility.maximum) {
          expect(typeof moduleManifest.compatibility.maximum).toBe('string');
        }
      }
    });

    it('esmodules should be an array of strings if present', () => {
      if (moduleManifest.esmodules) {
        expect(Array.isArray(moduleManifest.esmodules)).toBe(true);
        moduleManifest.esmodules.forEach(module => {
          expect(typeof module).toBe('string');
          expect(module).toMatch(/\.mjs$/);
        });
      }
    });

    it('scripts should be an array of strings if present', () => {
      if (moduleManifest.scripts) {
        expect(Array.isArray(moduleManifest.scripts)).toBe(true);
        moduleManifest.scripts.forEach(script => {
          expect(typeof script).toBe('string');
          expect(script).toMatch(/\.mjs$/);
        });
      }
    });

    it('styles should be an array of strings if present', () => {
      if (moduleManifest.styles) {
        expect(Array.isArray(moduleManifest.styles)).toBe(true);
        moduleManifest.styles.forEach(style => {
          expect(typeof style).toBe('string');
          expect(style).toMatch(/\.css$/);
        });
      }
    });

    it('packs should be properly structured if present', () => {
      if (moduleManifest.packs) {
        expect(Array.isArray(moduleManifest.packs)).toBe(true);
        moduleManifest.packs.forEach(pack => {
          expect(typeof pack).toBe('object');
          expect(typeof pack.name).toBe('string');
          expect(typeof pack.label).toBe('string');
          expect(typeof pack.type).toBe('string');

          if (pack.system) expect(typeof pack.system).toBe('string');
          if (pack.path) expect(typeof pack.path).toBe('string');

          if (pack.ownership) {
            expect(typeof pack.ownership).toBe('object');
            const validOwnershipLevels = ['OWNER', 'OBSERVER', 'NONE'];
            const validRoles = ['PLAYER', 'TRUSTED', 'ASSISTANT'];

            Object.keys(pack.ownership).forEach(role => {
              expect(validRoles).toContain(role);
              expect(validOwnershipLevels).toContain(pack.ownership[role]);
            });
          }
        });
      }
    });

    it('packFolders should be properly structured if present', () => {
      if (moduleManifest.packFolders) {
        expect(Array.isArray(moduleManifest.packFolders)).toBe(true);

        const validatePackFolder = (folder) => {
          expect(typeof folder).toBe('object');
          expect(typeof folder.name).toBe('string');
          expect(typeof folder.sorting).toBe('string');
          expect(['m', 'a']).toContain(folder.sorting);
          expect(Array.isArray(folder.packs)).toBe(true);

          if (folder.color) expect(typeof folder.color).toBe('string');
          if (folder.folders) {
            expect(Array.isArray(folder.folders)).toBe(true);
            folder.folders.forEach(validatePackFolder);
          }
        };

        moduleManifest.packFolders.forEach(validatePackFolder);
      }
    });

    it('relationships should be properly structured if present', () => {
      if (moduleManifest.relationships) {
        expect(typeof moduleManifest.relationships).toBe('object');

        const validRelationshipTypes = ['requires', 'recommends', 'conflicts', 'systems'];
        Object.keys(moduleManifest.relationships).forEach(key => {
          expect(validRelationshipTypes).toContain(key);
          expect(Array.isArray(moduleManifest.relationships[key])).toBe(true);

          moduleManifest.relationships[key].forEach(relationship => {
            expect(typeof relationship).toBe('object');
            expect(typeof relationship.id).toBe('string');

            if (relationship.type) {
              expect(typeof relationship.type).toBe('string');
              expect(['module', 'system', 'world']).toContain(relationship.type);
            }

            if (relationship.manifest) expect(typeof relationship.manifest).toBe('string');

            if (relationship.compatibility) {
              expect(typeof relationship.compatibility).toBe('object');
              if (relationship.compatibility.minimum) {
                expect(typeof relationship.compatibility.minimum).toBe('string');
              }
              if (relationship.compatibility.verified) {
                expect(typeof relationship.compatibility.verified).toBe('string');
              }
              if (relationship.compatibility.maximum) {
                expect(typeof relationship.compatibility.maximum).toBe('string');
              }
            }
          });
        });
      }
    });

    it('languages should be properly structured if present', () => {
      if (moduleManifest.languages) {
        expect(Array.isArray(moduleManifest.languages)).toBe(true);
        moduleManifest.languages.forEach(language => {
          expect(typeof language).toBe('object');
          expect(typeof language.lang).toBe('string');
          expect(language.lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
          expect(typeof language.name).toBe('string');
          expect(typeof language.path).toBe('string');
          expect(language.path).toMatch(/\.json$/);
        });
      }
    });

    it('system should be an array of strings if present', () => {
      if (moduleManifest.system) {
        expect(Array.isArray(moduleManifest.system)).toBe(true);
        moduleManifest.system.forEach(sys => {
          expect(typeof sys).toBe('string');
        });
      }
    });

    it('authors should be properly structured if present', () => {
      if (moduleManifest.authors) {
        expect(Array.isArray(moduleManifest.authors)).toBe(true);
        moduleManifest.authors.forEach(author => {
          expect(typeof author).toBe('object');

          if (author.id) expect(typeof author.id).toBe('string');
          if (author.name) expect(typeof author.name).toBe('string');
          if (author.email) expect(typeof author.email).toBe('string');
          if (author.discord) expect(typeof author.discord).toBe('string');
          if (author.url) expect(typeof author.url).toBe('string');
        });
      }
    });

    it('socket should be a boolean if present', () => {
      if (moduleManifest.socket !== undefined) {
        expect(typeof moduleManifest.socket).toBe('boolean');
      }
    });

    it('url should be a string if present', () => {
      if (moduleManifest.url) {
        expect(typeof moduleManifest.url).toBe('string');
        expect(moduleManifest.url.length).toBeGreaterThan(0);
      }
    });

    it('manifest should be a string if present', () => {
      if (moduleManifest.manifest) {
        expect(typeof moduleManifest.manifest).toBe('string');
        expect(moduleManifest.manifest.length).toBeGreaterThan(0);
      }
    });

    it('download should be a string if present', () => {
      if (moduleManifest.download) {
        expect(typeof moduleManifest.download).toBe('string');
        expect(moduleManifest.download.length).toBeGreaterThan(0);
      }
    });

    it('license should be a string if present', () => {
      if (moduleManifest.license) {
        expect(typeof moduleManifest.license).toBe('string');
      }
    });

    it('readme should be a string if present', () => {
      if (moduleManifest.readme) {
        expect(typeof moduleManifest.readme).toBe('string');
        expect(moduleManifest.readme.length).toBeGreaterThan(0);
      }
    });

    it('bugs should be a string if present', () => {
      if (moduleManifest.bugs) {
        expect(typeof moduleManifest.bugs).toBe('string');
        expect(moduleManifest.bugs.length).toBeGreaterThan(0);
      }
    });

    it('changelog should be a string if present', () => {
      if (moduleManifest.changelog) {
        expect(typeof moduleManifest.changelog).toBe('string');
        expect(moduleManifest.changelog.length).toBeGreaterThan(0);
      }
    });

    it('library should be a boolean if present', () => {
      if (moduleManifest.library !== undefined) {
        expect(typeof moduleManifest.library).toBe('boolean');
      }
    });

    it('media should be properly structured if present', () => {
      if (moduleManifest.media) {
        expect(Array.isArray(moduleManifest.media)).toBe(true);
        moduleManifest.media.forEach(media => {
          expect(typeof media).toBe('object');
          expect(typeof media.type).toBe('string');
          expect(typeof media.url).toBe('string');

          if (media.thumbnail) expect(typeof media.thumbnail).toBe('string');
        });
      }
    });
  });

  describe('Custom Fields', () => {
    it('flags should be an object if present', () => {
      if (moduleManifest.flags) {
        expect(typeof moduleManifest.flags).toBe('object');
        expect(moduleManifest.flags).not.toBeNull();
      }
    });

    it('name should be a string if present', () => {
      if (moduleManifest.name) {
        expect(typeof moduleManifest.name).toBe('string');
        expect(moduleManifest.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Specific Validations for Current Manifest', () => {
    it('should not have deprecated name field as required', () => {
      // The name field is not required in newer versions, only id is required
      expect(moduleManifest).toHaveProperty('id');
    });

    it('should validate actual manifest structure against current file', () => {
      // Validate required fields exist
      expect(moduleManifest.id).toBe('foundryvtt-over-my-head');
      expect(moduleManifest.title).toBe('OverMyHead');
      const versioningPattern = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9-.]+)?(?:\+[A-Za-z0-9-.]+)?$/;
      expect(moduleManifest.version).toMatch(versioningPattern);

      // Validate custom fields
      expect(moduleManifest.flags).toBeDefined();
      expect(moduleManifest.flags.debugMode).toBe(false);
      expect(moduleManifest.flags.onlyGM).toBe(true);
      expect(moduleManifest.flags.settingsReady).toBe(false);
    });

    it('should validate array fields are not empty if defined', () => {
      if (moduleManifest.esmodules && moduleManifest.esmodules.length > 0) {
        expect(moduleManifest.esmodules).toContain('dist/main.mjs');
      }

      if (moduleManifest.styles && moduleManifest.styles.length > 0) {
        expect(moduleManifest.styles).toContain('styles/foundryvtt-over-my-head.css');
      }

      if (moduleManifest.languages && moduleManifest.languages.length > 0) {
        const englishLang = moduleManifest.languages.find(lang => lang.lang === 'en');
        expect(englishLang).toBeDefined();
        expect(englishLang.path).toBe('lang/en.json');
      }
    });
  });
});

