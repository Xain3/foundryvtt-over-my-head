/**
 * @file moduleBuilder.unit.test.js
 * @description Unit tests for ModuleBuilder class
 * @path scripts/dev/moduleBuilder.unit.test.js
 */

import ModuleBuilder from './moduleBuilder.mjs';
import ViteRunner from '../build/runViteWIthAction.mjs';

// Mock dependencies
jest.mock('../build/runViteWIthAction.mjs');

describe('ModuleBuilder', () => {
  let mockViteRunner;
  let mockViteRunnerInstance;

  beforeEach(() => {
    mockViteRunnerInstance = {
      start: jest.fn().mockResolvedValue(undefined)
    };
    
    mockViteRunner = ViteRunner;
    mockViteRunner.mockImplementation(() => mockViteRunnerInstance);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const builder = new ModuleBuilder();
      
      expect(builder).toBeInstanceOf(ModuleBuilder);
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: false,
        preBuildAction: undefined,
        postBuildAction: undefined
      });
    });

    it('should create instance with custom options', () => {
      const preBuildAction = jest.fn();
      const postBuildAction = jest.fn();
      const options = {
        watch: true,
        preBuildAction,
        postBuildAction
      };
      
      const builder = new ModuleBuilder(options);
      
      expect(builder).toBeInstanceOf(ModuleBuilder);
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: true,
        preBuildAction,
        postBuildAction
      });
    });

    it('should handle partial options', () => {
      const options = { watch: true };
      
      const builder = new ModuleBuilder(options);
      
      expect(builder).toBeInstanceOf(ModuleBuilder);
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: true,
        preBuildAction: undefined,
        postBuildAction: undefined
      });
    });

    it('should handle empty options object', () => {
      const builder = new ModuleBuilder({});
      
      expect(builder).toBeInstanceOf(ModuleBuilder);
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: false,
        preBuildAction: undefined,
        postBuildAction: undefined
      });
    });

    it('should handle falsy watch option', () => {
      const options = { watch: null };
      
      const builder = new ModuleBuilder(options);
      
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: false,
        preBuildAction: undefined,
        postBuildAction: undefined
      });
    });
  });

  describe('build', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should start build process successfully', async () => {
      const builder = new ModuleBuilder();
      
      await builder.build();
      
      expect(consoleSpy).toHaveBeenCalledWith('Starting module build...');
      expect(mockViteRunnerInstance.start).toHaveBeenCalledWith({});
    });

    it('should handle build errors', async () => {
      const builder = new ModuleBuilder();
      const buildError = new Error('Build failed');
      
      mockViteRunnerInstance.start.mockRejectedValue(buildError);
      
      await expect(builder.build()).rejects.toThrow('Build failed');
      expect(consoleSpy).toHaveBeenCalledWith('Starting module build...');
    });

    it('should call start with empty object parameter', async () => {
      const builder = new ModuleBuilder();
      
      await builder.build();
      
      expect(mockViteRunnerInstance.start).toHaveBeenCalledWith({});
      expect(mockViteRunnerInstance.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildWithWatch', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should start build with watch mode successfully', async () => {
      const builder = new ModuleBuilder();
      const postBuildAction = jest.fn();
      
      await builder.buildWithWatch(postBuildAction);
      
      expect(consoleSpy).toHaveBeenCalledWith('Starting module build with watch mode...');
      expect(mockViteRunner).toHaveBeenCalledTimes(2); // Once in constructor, once in buildWithWatch
      expect(mockViteRunner).toHaveBeenLastCalledWith({
        watch: true,
        postBuildAction
      });
    });

    it('should handle watch build errors', async () => {
      const builder = new ModuleBuilder();
      const postBuildAction = jest.fn();
      const buildError = new Error('Watch build failed');
      
      // The second ViteRunner instance (created in buildWithWatch) should fail
      const secondMockViteRunnerInstance = {
        start: jest.fn().mockRejectedValue(buildError)
      };
      
      mockViteRunner.mockImplementationOnce(() => mockViteRunnerInstance) // constructor
                   .mockImplementationOnce(() => secondMockViteRunnerInstance); // buildWithWatch
      
      const builder2 = new ModuleBuilder();
      
      await expect(builder2.buildWithWatch(postBuildAction)).rejects.toThrow('Watch build failed');
      expect(consoleSpy).toHaveBeenCalledWith('Starting module build with watch mode...');
    });

    it('should create new ViteRunner instance for watch mode', async () => {
      const builder = new ModuleBuilder({ watch: false });
      const postBuildAction = jest.fn();
      
      await builder.buildWithWatch(postBuildAction);
      
      // Should be called twice: once in constructor, once in buildWithWatch
      expect(mockViteRunner).toHaveBeenCalledTimes(2);
      expect(mockViteRunner).toHaveBeenNthCalledWith(1, {
        watch: false,
        preBuildAction: undefined,
        postBuildAction: undefined
      });
      expect(mockViteRunner).toHaveBeenNthCalledWith(2, {
        watch: true,
        postBuildAction
      });
    });

    it('should handle undefined postBuildAction', async () => {
      const builder = new ModuleBuilder();
      
      await builder.buildWithWatch(undefined);
      
      expect(mockViteRunner).toHaveBeenLastCalledWith({
        watch: true,
        postBuildAction: undefined
      });
    });

    it('should handle null postBuildAction', async () => {
      const builder = new ModuleBuilder();
      
      await builder.buildWithWatch(null);
      
      expect(mockViteRunner).toHaveBeenLastCalledWith({
        watch: true,
        postBuildAction: null
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with both build methods in sequence', async () => {
      const preBuildAction = jest.fn();
      const postBuildAction = jest.fn();
      const builder = new ModuleBuilder({
        watch: false,
        preBuildAction,
        postBuildAction
      });
      
      // First build
      await builder.build();
      expect(mockViteRunnerInstance.start).toHaveBeenCalledWith({});
      
      // Then watch build
      mockViteRunnerInstance.start.mockClear();
      await builder.buildWithWatch(postBuildAction);
      
      expect(mockViteRunner).toHaveBeenCalledTimes(2);
    });

    it('should handle complex build options', async () => {
      const complexPreBuild = async () => {
        console.log('Pre-build setup');
        // Simulate async pre-build work
        await new Promise(resolve => setTimeout(resolve, 10));
      };
      
      const complexPostBuild = async () => {
        console.log('Post-build cleanup');
        // Simulate async post-build work
        await new Promise(resolve => setTimeout(resolve, 10));
      };
      
      const builder = new ModuleBuilder({
        watch: true,
        preBuildAction: complexPreBuild,
        postBuildAction: complexPostBuild
      });
      
      await builder.build();
      
      expect(mockViteRunner).toHaveBeenCalledWith({
        watch: true,
        preBuildAction: complexPreBuild,
        postBuildAction: complexPostBuild
      });
    });
  });

  describe('error handling', () => {
    it('should handle ViteRunner constructor errors', () => {
      mockViteRunner.mockImplementation(() => {
        throw new Error('ViteRunner initialization failed');
      });
      
      expect(() => new ModuleBuilder()).toThrow('ViteRunner initialization failed');
    });

    it('should propagate async errors from build', async () => {
      const builder = new ModuleBuilder();
      const asyncError = new Error('Async build error');
      
      mockViteRunnerInstance.start.mockRejectedValue(asyncError);
      
      await expect(builder.build()).rejects.toThrow('Async build error');
    });

    it('should propagate async errors from buildWithWatch', async () => {
      const builder = new ModuleBuilder();
      const asyncError = new Error('Async watch error');
      
      // Second ViteRunner instance should fail
      const failingInstance = {
        start: jest.fn().mockRejectedValue(asyncError)
      };
      
      mockViteRunner.mockImplementationOnce(() => mockViteRunnerInstance) // constructor
                   .mockImplementationOnce(() => failingInstance); // buildWithWatch
      
      const builder2 = new ModuleBuilder();
      
      await expect(builder2.buildWithWatch(jest.fn())).rejects.toThrow('Async watch error');
    });
  });
});
