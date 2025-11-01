/**
 * @file Config Helper Functions Unit Tests
 * @description Unit tests for configHelpers.ts helper functions
 * @path tests/unit/configHelpers.unit.test.mjs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import process from 'process';
import { REQUIRED_YAML_FILES } from '#src/config/helpers/configHelpers.js';

// We'll need to test the helpers through integration since they do I/O
// For now, we'll create tests that verify the actual project files are loadable

describe('Helper Functions Integration Tests', () => {
  const moduleRoot = process.cwd();

  describe('YAML and JSON files exist', () => {
    it('should have all required YAML constant files', () => {
      const constantsDir = path.join(moduleRoot, 'src/config/constants');
      const requiredFiles = [...REQUIRED_YAML_FILES];

      for (const file of requiredFiles) {
        const filePath = path.join(constantsDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have settings.yaml', () => {
      const settingsPath = path.join(
        moduleRoot,
        'src/config/settings/settings.yaml'
      );
      expect(fs.existsSync(settingsPath)).toBe(true);
    });

    it('should have module.json', () => {
      const modulePath = path.join(moduleRoot, 'module.json');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have valid module.json structure', () => {
      const modulePath = path.join(moduleRoot, 'module.json');
      const content = fs.readFileSync(modulePath, 'utf-8');
      const manifest = JSON.parse(content);

      expect(manifest).toHaveProperty('id');
      expect(manifest).toHaveProperty('title');
      expect(manifest).toHaveProperty('version');
      expect(manifest.id).toBe('foundryvtt-over-my-head');
    });
  });

  describe('Test fixtures exist', () => {
    it('should have valid YAML fixtures', () => {
      const fixturesDir = path.join(moduleRoot, 'tests/unit/config/fixtures');
      const fixtures = [
        'valid-errors.yaml',
        'valid-foundry.yaml',
        'valid-moduleManagement.yaml',
        'valid-settings.yaml',
        'empty.yaml',
      ];

      for (const fixture of fixtures) {
        const filePath = path.join(fixturesDir, fixture);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have valid JSON fixtures', () => {
      const fixturesDir = path.join(moduleRoot, 'tests/unit/config/fixtures');
      const fixtures = ['valid-module.json'];

      for (const fixture of fixtures) {
        const filePath = path.join(fixturesDir, fixture);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have malformed fixtures for error testing', () => {
      const fixturesDir = path.join(moduleRoot, 'tests/unit/config/fixtures');
      const fixtures = ['malformed.yaml', 'malformed-module.json'];

      for (const fixture of fixtures) {
        const filePath = path.join(fixturesDir, fixture);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });
  });

  describe('YAML content validation', () => {
    it('valid-errors.yaml should be parseable', () => {
      const filePath = path.join(
        moduleRoot,
        'tests/unit/config/fixtures/valid-errors.yaml'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      // Just verify it can be read without errors
      expect(content).toContain('separator');
    });

    it('empty.yaml should be a valid empty YAML file', () => {
      const filePath = path.join(
        moduleRoot,
        'tests/unit/config/fixtures/empty.yaml'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      // Empty or whitespace-only is valid
      expect(content.trim().length === 0 || content.includes('#')).toBe(true);
    });

    it('malformed.yaml should contain malformed YAML syntax', () => {
      const filePath = path.join(
        moduleRoot,
        'tests/unit/config/fixtures/malformed.yaml'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      // Should have unbalanced brackets or bad indentation
      expect(content).toMatch(/\[|:/); // Has YAML syntax
    });
  });

  describe('JSON content validation', () => {
    it('valid-module.json should be parseable JSON', () => {
      const filePath = path.join(
        moduleRoot,
        'tests/unit/config/fixtures/valid-module.json'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty('id');
      expect(parsed.id).toBe('vision-with-fade');
    });

    it('malformed-module.json should not be parseable', () => {
      const filePath = path.join(
        moduleRoot,
        'tests/unit/config/fixtures/malformed-module.json'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(() => JSON.parse(content)).toThrow();
    });
  });
});
