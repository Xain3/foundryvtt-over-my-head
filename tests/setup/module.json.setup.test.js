/**
 * @file module.json.setup.test.js
 * @description Tests to validate the module manifest structure and required/optional attributes
 * @path /module.json.setup.test.js
 */

import moduleManifest, { id, title, description, version, compatibility, esmodules, scripts, styles, packs, packFolders, relationships, languages, system, authors, socket, url, manifest, download, license, readme, bugs, changelog, library, media as _media, shortName, flags, name } from '../../module.json';

describe('Module Manifest Validation', () => {
  describe('Required Attributes', () => {
    it('should have id as a string with proper format', () => {
      expect(moduleManifest).toHaveProperty('id');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(id.length).toBeGreaterThan(0);
    });

    it('should have title as a string', () => {
      expect(moduleManifest).toHaveProperty('title');
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
    });

    it('should have description as a string', () => {
      expect(moduleManifest).toHaveProperty('description');
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('should have version as a string', () => {
      expect(moduleManifest).toHaveProperty('version');
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });

    it('version should follow semantic versioning format', () => {
      expect(version).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9]+)?$/);
    });
  });

  describe('Optional Attributes', () => {
    it('compatibility should be properly structured if present', () => {
      if (compatibility) {
        expect(typeof compatibility).toBe('object');
        expect(compatibility).not.toBeNull();

        if (compatibility.minimum) {
          expect(typeof compatibility.minimum).toBe('string');
        }

        if (compatibility.verified) {
          expect(typeof compatibility.verified).toBe('string');
        }

        if (compatibility.maximum) {
          expect(typeof compatibility.maximum).toBe('string');
        }
      }
    });

    it('esmodules should be an array of strings if present', () => {
      if (esmodules) {
        expect(Array.isArray(esmodules)).toBe(true);
        esmodules.forEach(module => {
          expect(typeof module).toBe('string');
          expect(module).toMatch(/\.js$/);
        });
      }
    });

    it('scripts should be an array of strings if present', () => {
      if (scripts) {
        expect(Array.isArray(scripts)).toBe(true);
        scripts.forEach(script => {
          expect(typeof script).toBe('string');
          expect(script).toMatch(/\.js$/);
        });
      }
    });

    it('styles should be an array of strings if present', () => {
      if (styles) {
        expect(Array.isArray(styles)).toBe(true);
        styles.forEach(style => {
          expect(typeof style).toBe('string');
          expect(style).toMatch(/\.css$/);
        });
      }
    });

    it('packs should be properly structured if present', () => {
      if (packs) {
        expect(Array.isArray(packs)).toBe(true);
        packs.forEach(pack => {
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
      if (packFolders) {
        expect(Array.isArray(packFolders)).toBe(true);

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

        packFolders.forEach(validatePackFolder);
      }
    });

    it('relationships should be properly structured if present', () => {
      if (relationships) {
        expect(typeof relationships).toBe('object');

        const validRelationshipTypes = ['requires', 'recommends', 'conflicts', 'systems'];
        Object.keys(relationships).forEach(key => {
          expect(validRelationshipTypes).toContain(key);
          expect(Array.isArray(relationships[key])).toBe(true);

          relationships[key].forEach(relationship => {
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
      if (languages) {
        expect(Array.isArray(languages)).toBe(true);
        languages.forEach(language => {
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
      if (system) {
        expect(Array.isArray(system)).toBe(true);
        system.forEach(sys => {
          expect(typeof sys).toBe('string');
        });
      }
    });

    it('authors should be properly structured if present', () => {
      if (authors) {
        expect(Array.isArray(authors)).toBe(true);
        authors.forEach(author => {
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
      if (socket !== undefined) {
        expect(typeof socket).toBe('boolean');
      }
    });

    it('url should be a string if present', () => {
      if (url) {
        expect(typeof url).toBe('string');
        expect(url.length).toBeGreaterThan(0);
      }
    });

    it('manifest should be a string if present', () => {
      if (manifest) {
        expect(typeof manifest).toBe('string');
        expect(manifest.length).toBeGreaterThan(0);
      }
    });

    it('download should be a string if present', () => {
      if (download) {
        expect(typeof download).toBe('string');
        expect(download.length).toBeGreaterThan(0);
      }
    });

    it('license should be a string if present', () => {
      if (license) {
        expect(typeof license).toBe('string');
      }
    });

    it('readme should be a string if present', () => {
      if (readme) {
        expect(typeof readme).toBe('string');
        expect(readme.length).toBeGreaterThan(0);
      }
    });

    it('bugs should be a string if present', () => {
      if (bugs) {
        expect(typeof bugs).toBe('string');
        expect(bugs.length).toBeGreaterThan(0);
      }
    });

    it('changelog should be a string if present', () => {
      if (changelog) {
        expect(typeof changelog).toBe('string');
        expect(changelog.length).toBeGreaterThan(0);
      }
    });

    it('library should be a boolean if present', () => {
      if (library !== undefined) {
        expect(typeof library).toBe('boolean');
      }
    });

    it('media should be properly structured if present', () => {
      if (_media) {
        expect(Array.isArray(_media)).toBe(true);
        _media.forEach(media => {
          expect(typeof media).toBe('object');
          expect(typeof media.type).toBe('string');
          expect(typeof media.url).toBe('string');

          if (media.thumbnail) expect(typeof media.thumbnail).toBe('string');
        });
      }
    });
  });

  describe('Custom Fields', () => {
    it('shortName should be a string if present', () => {
      if (shortName) {
        expect(typeof shortName).toBe('string');
        expect(shortName.length).toBeGreaterThan(0);
      }
    });

    it('flags should be an object if present', () => {
      if (flags) {
        expect(typeof flags).toBe('object');
        expect(flags).not.toBeNull();
      }
    });

    it('name should be a string if present', () => {
      if (name) {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
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
      expect(id).toBe('foundryvtt-over-my-head');
      expect(title).toBe('OverMyHead');
      expect(version).toBe('12.0.1-alpha1');

      // Validate custom fields
      expect(shortName).toBe('OMH');
      expect(flags).toBeDefined();
      expect(flags.debugMode).toBe(false);
      expect(flags.onlyGM).toBe(true);
      expect(flags.settingsReady).toBe(false);
    });

    it('should validate array fields are not empty if defined', () => {
      if (esmodules && esmodules.length > 0) {
        expect(esmodules).toContain('src/main.js');
      }

      if (styles && styles.length > 0) {
        expect(styles).toContain('styles/foundryvtt-over-my-head.css');
      }

      if (languages && languages.length > 0) {
        const englishLang = languages.find(lang => lang.lang === 'en');
        expect(englishLang).toBeDefined();
        expect(englishLang.path).toBe('lang/en.json');
      }
    });
  });
});

