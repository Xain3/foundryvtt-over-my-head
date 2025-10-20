/**
 * @file MockApplication.unit.test.mjs
 * @description Unit tests for MockApplication class
 * @path tests/mocks/MockApplication.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockApplication from './MockApplication.mjs';

describe('MockApplication', () => {
  let application;

  beforeEach(() => {
    application = new MockApplication();
  });

  describe('constructor', () => {
    it('should create application with default values', () => {
      expect(application.options).toEqual({});
      expect(application.rendered).toBe(false);
      expect(application.element).toBeNull();
    });

    it('should create application with provided options', () => {
      const options = { width: 400, height: 300, title: 'Test App' };
      const customApp = new MockApplication(options);

      expect(customApp.options).toEqual(options);
      expect(customApp.rendered).toBe(false);
      expect(customApp.element).toBeNull();
    });
  });

  describe('render', () => {
    it('should set rendered to true', async () => {
      expect(application.rendered).toBe(false);
      
      const result = await application.render();
      
      expect(application.rendered).toBe(true);
      expect(result).toBe(application);
    });

    it('should handle force parameter', async () => {
      application.rendered = true;
      
      const result = await application.render(true);
      
      expect(application.rendered).toBe(true);
      expect(result).toBe(application);
    });

    it('should return the application instance', async () => {
      const result = await application.render();
      expect(result).toBe(application);
    });
  });

  describe('close', () => {
    it('should set rendered to false', async () => {
      application.rendered = true;
      
      const result = await application.close();
      
      expect(application.rendered).toBe(false);
      expect(result).toBe(application);
    });

    it('should work when already closed', async () => {
      expect(application.rendered).toBe(false);
      
      const result = await application.close();
      
      expect(application.rendered).toBe(false);
      expect(result).toBe(application);
    });

    it('should return the application instance', async () => {
      const result = await application.close();
      expect(result).toBe(application);
    });
  });

  describe('integration', () => {
    it('should handle render and close cycle', async () => {
      expect(application.rendered).toBe(false);
      
      await application.render();
      expect(application.rendered).toBe(true);
      
      await application.close();
      expect(application.rendered).toBe(false);
    });

    it('should maintain options through lifecycle', async () => {
      const options = { title: 'Test' };
      const app = new MockApplication(options);
      
      await app.render();
      await app.close();
      
      expect(app.options).toEqual(options);
    });
  });
});
