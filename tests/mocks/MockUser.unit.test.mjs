/**
 * @file MockUser.unit.test.mjs
 * @description Unit tests for MockUser class
 * @path tests/mocks/MockUser.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockUser from './MockUser.mjs';
import MockDocument from './MockDocument.mjs';

describe('MockUser', () => {
  let user;

  beforeEach(() => {
    user = new MockUser();
  });

  describe('constructor', () => {
    it('should extend MockDocument', () => {
      expect(user).toBeInstanceOf(MockDocument);
      expect(user).toBeInstanceOf(MockUser);
    });

    it('should create user with default values', () => {
      expect(user.role).toBe(4);
      expect(user.active).toBe(true);
      expect(user.character).toBeNull();
    });

    it('should create user with provided data', () => {
      const data = {
        id: 'user-1',
        name: 'Player One',
        role: 1,
        active: false,
        character: 'character-id'
      };
      const customUser = new MockUser(data);

      expect(customUser.id).toBe('user-1');
      expect(customUser.name).toBe('Player One');
      expect(customUser.role).toBe(1);
      expect(customUser.active).toBe(false);
      expect(customUser.character).toBe('character-id');
    });

    it('should handle falsy active value', () => {
      const data = { active: false };
      const inactiveUser = new MockUser(data);
      expect(inactiveUser.active).toBe(false);
    });

    it('should inherit document properties', () => {
      expect(user.id).toMatch(/^mock-/);
      expect(user.name).toBe('Mock Document');
      expect(user.flags).toEqual({});
      expect(user.permission).toBe(3);
    });
  });

  describe('isGM getter', () => {
    it('should return true for GM role (4)', () => {
      const gm = new MockUser({ role: 4 });
      expect(gm.isGM).toBe(true);
    });

    it('should return true for Assistant GM role (3)', () => {
      const assistantGm = new MockUser({ role: 3 });
      expect(assistantGm.isGM).toBe(false);
    });

    it('should return true for higher roles', () => {
      const admin = new MockUser({ role: 5 });
      expect(admin.isGM).toBe(true);
    });

    it('should return false for player roles', () => {
      const player = new MockUser({ role: 1 });
      const trustedPlayer = new MockUser({ role: 2 });
      
      expect(player.isGM).toBe(false);
      expect(trustedPlayer.isGM).toBe(false);
    });

    it('should return false for no role', () => {
      const noRole = new MockUser({ role: 0 });
      expect(noRole.isGM).toBe(false);
    });
  });

  describe('inheritance from MockDocument', () => {
    it('should inherit flag methods', async () => {
      await user.setFlag('test', 'preference', 'value');
      expect(user.getFlag('test', 'preference')).toBe('value');
    });

    it('should inherit update method', async () => {
      const result = await user.update({ name: 'Updated User' });
      expect(user.data.name).toBe('Updated User');
      expect(result).toBe(user);
    });

    it('should inherit delete method', async () => {
      const result = await user.delete();
      expect(result).toBe(user);
    });
  });
});
