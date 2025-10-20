/**
 * @file MockDialog.unit.test.mjs
 * @description Unit tests for MockDialog class
 * @path tests/mocks/MockDialog.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockDialog from './MockDialog.mjs';
import MockApplication from './MockApplication.mjs';

describe('MockDialog', () => {
  let dialog;

  beforeEach(() => {
    dialog = new MockDialog();
  });

  describe('constructor', () => {
    it('should extend MockApplication', () => {
      expect(dialog).toBeInstanceOf(MockApplication);
      expect(dialog).toBeInstanceOf(MockDialog);
    });

    it('should inherit application properties', () => {
      expect(dialog.options).toEqual({});
      expect(dialog.rendered).toBe(false);
      expect(dialog.element).toBeNull();
    });
  });

  describe('static wait', () => {
    it('should resolve with default value', async () => {
      const config = { default: 'test' };
      const result = await MockDialog.wait(config);
      expect(result).toBe('test');
    });

    it('should resolve with "ok" if no default', async () => {
      const config = {};
      const result = await MockDialog.wait(config);
      expect(result).toBe('ok');
    });

    it('should resolve asynchronously', async () => {
      const start = Date.now();
      await MockDialog.wait({});
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(5);
    });

    it('should handle various default types', async () => {
      expect(await MockDialog.wait({ default: 42 })).toBe(42);
      expect(await MockDialog.wait({ default: true })).toBe(true);
      expect(await MockDialog.wait({ default: null })).toBe(null);
      expect(await MockDialog.wait({ default: { key: 'value' } })).toEqual({ key: 'value' });
    });
  });

  describe('static confirm', () => {
    it('should resolve with true', async () => {
      const config = { title: 'Confirm', content: 'Are you sure?' };
      const result = await MockDialog.confirm(config);
      expect(result).toBe(true);
    });

    it('should handle empty config', async () => {
      const result = await MockDialog.confirm({});
      expect(result).toBe(true);
    });

    it('should be a promise', () => {
      const result = MockDialog.confirm({});
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('static prompt', () => {
    it('should resolve with default value', async () => {
      const config = { default: 'default text' };
      const result = await MockDialog.prompt(config);
      expect(result).toBe('default text');
    });

    it('should resolve with empty string if no default', async () => {
      const config = {};
      const result = await MockDialog.prompt(config);
      expect(result).toBe('');
    });

    it('should handle various default types', async () => {
      expect(await MockDialog.prompt({ default: 'text' })).toBe('text');
      expect(await MockDialog.prompt({ default: 123 })).toBe(123);
      expect(await MockDialog.prompt({ default: null })).toBe(null);
    });

    it('should be a promise', () => {
      const result = MockDialog.prompt({});
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('inheritance from MockApplication', () => {
    it('should inherit render method', async () => {
      const result = await dialog.render();
      expect(dialog.rendered).toBe(true);
      expect(result).toBe(dialog);
    });

    it('should inherit close method', async () => {
      dialog.rendered = true;
      const result = await dialog.close();
      expect(dialog.rendered).toBe(false);
      expect(result).toBe(dialog);
    });
  });

  describe('real-world scenarios', () => {
    it('should simulate confirmation dialog workflow', async () => {
      const config = {
        title: 'Delete Item',
        content: 'Are you sure you want to delete this item?',
        yes: () => console.log('Deleted'),
        no: () => console.log('Cancelled')
      };
      
      const confirmed = await MockDialog.confirm(config);
      expect(confirmed).toBe(true);
    });

    it('should simulate prompt dialog workflow', async () => {
      const config = {
        title: 'Enter Name',
        content: 'What is your character name?',
        default: 'Adventurer'
      };
      
      const name = await MockDialog.prompt(config);
      expect(name).toBe('Adventurer');
    });

    it('should simulate wait dialog workflow', async () => {
      const config = {
        title: 'Choose Option',
        buttons: {
          option1: { label: 'Option 1' },
          option2: { label: 'Option 2' }
        },
        default: 'option1'
      };
      
      const choice = await MockDialog.wait(config);
      expect(choice).toBe('option1');
    });
  });
});
