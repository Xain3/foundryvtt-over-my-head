/**
 * @file userDataDirFinder.unit.test.mjs
 * @description Unit tests for UserDataDirFinder class
 * @path scripts/dev/userDataDirFinder.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import UserDataDirFinder from './userDataDirFinder.mjs';

// Mock dependencies
vi.mock('fs');
vi.mock('os');
vi.mock('path');

describe('UserDataDirFinder', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock fs
    fs.existsSync = vi.fn().mockReturnValue(false);
    fs.statSync = vi.fn().mockReturnValue({ isDirectory: () => true });
    
    // Mock os
    os.platform = vi.fn().mockReturnValue('linux');
    os.userInfo = vi.fn().mockReturnValue({ username: 'testuser' });
    os.homedir = vi.fn().mockReturnValue('/home/testuser');
    
    // Mock path
    path.join = vi.fn().mockImplementation((...args) => args.join('/'));
    
    // Mock process.env
    delete process.env.USER;
    delete process.env.USERNAME;
    delete process.env.LOCALAPPDATA;
  });

  describe('constructor', () => {
    it('should use default platform and user when not provided', () => {
      os.platform.mockReturnValue('linux');
      os.userInfo.mockReturnValue({ username: 'defaultuser' });
      
      const finder = new UserDataDirFinder();
      
      expect(finder).toBeInstanceOf(UserDataDirFinder);
    });

    it('should use provided platform and user', () => {
      const finder = new UserDataDirFinder('win32', 'customuser');
      
      expect(finder).toBeInstanceOf(UserDataDirFinder);
    });

    it('should handle missing os.userInfo function', () => {
      os.userInfo = undefined;
      process.env.USER = 'envuser';
      
      const finder = new UserDataDirFinder();
      
      expect(finder).toBeInstanceOf(UserDataDirFinder);
    });

    it('should fall back to environment variables for username', () => {
      os.userInfo.mockImplementation(() => {
        throw new Error('userInfo not available');
      });
      process.env.USERNAME = 'winuser';
      
      const finder = new UserDataDirFinder();
      
      expect(finder).toBeInstanceOf(UserDataDirFinder);
    });
  });

  describe('find', () => {
    it('should find existing FoundryVTT directory on Linux', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      const expectedPath = '/home/testuser/.local/share/FoundryVTT';
      
      fs.existsSync.mockImplementation(dir => dir === expectedPath);
      
      const result = finder.find();
      
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it('should find alternative FoundryVTT directory on Linux', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      const expectedPath = '/home/testuser/FoundryVTT';
      
      fs.existsSync.mockImplementation(dir => dir === expectedPath);
      
      const result = finder.find();
      
      expect(result).toBe(expectedPath);
    });

    it('should find FoundryVTT directory on macOS', () => {
      const finder = new UserDataDirFinder('darwin', 'testuser');
      const expectedPath = '/home/testuser/Library/Application Support/FoundryVTT';
      
      path.join.mockReturnValue(expectedPath);
      fs.existsSync.mockImplementation(dir => dir === expectedPath);
      
      const result = finder.find();
      
      expect(result).toBe(expectedPath);
      expect(path.join).toHaveBeenCalledWith('/home/testuser', 'Library/Application Support/FoundryVTT');
    });

    it('should find FoundryVTT directory on Windows', () => {
      const finder = new UserDataDirFinder('win32', 'testuser');
      const expectedPath = 'C:/Users/testuser/AppData/Local/FoundryVTT';
      
      process.env.LOCALAPPDATA = 'C:/Users/testuser/AppData/Local';
      path.join.mockReturnValue(expectedPath);
      fs.existsSync.mockImplementation(dir => dir === expectedPath);
      
      const result = finder.find();
      
      expect(result).toBe(expectedPath);
    });

    it('should return empty string when no directory found', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      
      fs.existsSync.mockReturnValue(false);
      
      const result = finder.find();
      
      expect(result).toBe('');
    });

    it('should handle unsupported platform', () => {
      const finder = new UserDataDirFinder('unknown', 'testuser');
      
      const result = finder.find();
      
      expect(result).toBe('');
    });

    it('should handle directory existence check errors', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockImplementation(() => {
        throw new Error('stat failed');
      });
      
      const result = finder.find();
      
      expect(result).toBe('/home/testuser/.local/share/FoundryVTT');
    });

    it('should handle file instead of directory', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      const testPath = '/home/testuser/.local/share/FoundryVTT';
      
      fs.existsSync.mockImplementation(dir => dir === testPath);
      fs.statSync.mockReturnValue({ isDirectory: () => false });
      
      const result = finder.find();
      
      expect(result).toBe('');
    });

    it('should handle missing isDirectory method', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      const testPath = '/home/testuser/.local/share/FoundryVTT';
      
      fs.existsSync.mockImplementation(dir => dir === testPath);
      fs.statSync.mockReturnValue({});
      
      const result = finder.find();
      
      expect(result).toBe(testPath);
    });
  });

  describe('edge cases', () => {
    it('should handle missing environment variables on Windows', () => {
      const finder = new UserDataDirFinder('win32', 'testuser');
      
      delete process.env.LOCALAPPDATA;
      path.join.mockImplementation((localAppData, ...rest) => {
        if (!localAppData) return rest.join('/');
        return [localAppData, ...rest].join('/');
      });
      
      const result = finder.find();
      
      expect(result).toBe('');
    });

    it('should handle multiple directory checks', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      
      // First two don't exist, third one does
      fs.existsSync.mockImplementation(dir => 
        dir === '/local/FoundryVTT'
      );
      
      const result = finder.find();
      
      expect(result).toBe('/local/FoundryVTT');
      expect(fs.existsSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('logging', () => {
    let consoleSpy;
    let consoleWarnSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should log when directory is found', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      const expectedPath = '/home/testuser/.local/share/FoundryVTT';
      
      fs.existsSync.mockImplementation(dir => dir === expectedPath);
      
      finder.find();
      
      expect(consoleSpy).toHaveBeenCalledWith(`Found FoundryVTT user data directory: ${expectedPath}`);
    });

    it('should warn when no directory is found', () => {
      const finder = new UserDataDirFinder('linux', 'testuser');
      
      fs.existsSync.mockReturnValue(false);
      
      finder.find();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('No FoundryVTT user data directory found');
    });
  });
});
