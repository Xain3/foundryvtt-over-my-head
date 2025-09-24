/**
 * @file helpers.unit.test.mjs
 * @description Unit tests for the Helpers entry point class
 * @path src/helpers/helpers.unit.test.mjs
 */

// Mock all dependencies that might import manifest BEFORE importing anything
jest.mock('./pathUtils.mjs');
jest.mock('./moduleGetter.mjs');
jest.mock('./errorFormatter.mjs', () => ({
  formatError: jest.fn((error, options = {}) => `Mocked error: ${error.message}`)
}));
jest.mock('./rootMapParser.mjs', () => ({
  default: {
    parse: jest.fn()
  }
}));

import Helpers from './helpers.mjs';
import PathUtils from './pathUtils.mjs';
import { getModule } from './moduleGetter.mjs';
import RootMapParser from './rootMapParser.mjs';
import { formatError } from './errorFormatter.mjs';

describe('Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Ensure RootMapParser.parse is mocked
    if (!RootMapParser.parse) {
      RootMapParser.parse = jest.fn();
    }
  });

  describe('Static Class Properties', () => {
    it('should expose PathUtils as static property', () => {
      expect(Helpers.PathUtils).toBe(PathUtils);
    });

    it('should expose RootMapParser as static property', () => {
      expect(Helpers.RootMapParser).toBe(RootMapParser);
    });
  });

  describe('Convenience Methods', () => {
    describe('resolvePath', () => {
      it('should delegate to PathUtils.resolvePath with correct parameters', () => {
        const mockResult = { test: 'value' };
        PathUtils.resolvePath.mockReturnValue(mockResult);

        const result = Helpers.resolvePath('namespace', 'test.path', false);

        expect(PathUtils.resolvePath).toHaveBeenCalledWith('namespace', 'test.path', false);
        expect(result).toBe(mockResult);
      });

      it('should use default useGetterFallback value', () => {
        PathUtils.resolvePath.mockReturnValue('test');

        Helpers.resolvePath('namespace', 'path');

        expect(PathUtils.resolvePath).toHaveBeenCalledWith('namespace', 'path', true);
      });
    });

    describe('extractKeyComponents', () => {
      it('should delegate to PathUtils.extractKeyComponents', () => {
        const mockResult = { firstKey: 'test', remainingPath: 'path' };
        PathUtils.extractKeyComponents.mockReturnValue(mockResult);

        const options = { returnParts: true };
        const result = Helpers.extractKeyComponents('test.path', options);

        expect(PathUtils.extractKeyComponents).toHaveBeenCalledWith('test.path', options);
        expect(result).toBe(mockResult);
      });

      it('should work with default options', () => {
        const mockResult = { firstKey: 'test', remainingPath: 'path' };
        PathUtils.extractKeyComponents.mockReturnValue(mockResult);

        const result = Helpers.extractKeyComponents('test.path');

        expect(PathUtils.extractKeyComponents).toHaveBeenCalledWith('test.path', {});
        expect(result).toBe(mockResult);
      });
    });

    describe('resolveMixedPath', () => {
      it('should delegate to PathUtils.resolveMixedPath', () => {
        const mockResult = { exists: true, value: 'test' };
        PathUtils.resolveMixedPath.mockReturnValue(mockResult);

        const rootObject = { test: 'object' };
        const strategy = { custom: 'strategy' };
        const result = Helpers.resolveMixedPath(rootObject, 'test.path', strategy);

        expect(PathUtils.resolveMixedPath).toHaveBeenCalledWith(rootObject, 'test.path', strategy);
        expect(result).toBe(mockResult);
      });

      it('should work with default strategy', () => {
        const mockResult = { exists: true, value: 'test' };
        PathUtils.resolveMixedPath.mockReturnValue(mockResult);

        const rootObject = { test: 'object' };
        const result = Helpers.resolveMixedPath(rootObject, 'test.path');

        expect(PathUtils.resolveMixedPath).toHaveBeenCalledWith(rootObject, 'test.path', null);
        expect(result).toBe(mockResult);
      });
    });

    describe('pathExists', () => {
      it('should delegate to PathUtils.pathExistsInMixedStructure', () => {
        PathUtils.pathExistsInMixedStructure.mockReturnValue(true);

        const rootObject = { test: 'object' };
        const result = Helpers.pathExists(rootObject, 'test.path');

        expect(PathUtils.pathExistsInMixedStructure).toHaveBeenCalledWith(rootObject, 'test.path');
        expect(result).toBe(true);
      });
    });

    describe('getValueFromMixedPath', () => {
      it('should delegate to PathUtils.getValueFromMixedPath', () => {
        const mockValue = 'resolved value';
        PathUtils.getValueFromMixedPath.mockReturnValue(mockValue);

        const rootObject = { test: 'object' };
        const result = Helpers.getValueFromMixedPath(rootObject, 'test.path');

        expect(PathUtils.getValueFromMixedPath).toHaveBeenCalledWith(rootObject, 'test.path');
        expect(result).toBe(mockValue);
      });
    });

    describe('getModule', () => {
      it('should delegate to getModule with correct parameters', () => {
        const mockModule = { id: 'test-module', title: 'Test Module' };
        getModule.mockReturnValue(mockModule);

        const namespace = { test: 'namespace' };
        const result = Helpers.getModule('test-module', namespace);

        expect(getModule).toHaveBeenCalledWith('test-module', namespace);
        expect(result).toBe(mockModule);
      });

      it('should use default globalThis namespace', () => {
        const mockModule = { id: 'test-module' };
        getModule.mockReturnValue(mockModule);

        const result = Helpers.getModule('test-module');

        expect(getModule).toHaveBeenCalledWith('test-module', globalThis);
        expect(result).toBe(mockModule);
      });
    });

    describe('parseRootMap', () => {
      it('should delegate to RootMapParser.parse', () => {
        const mockResult = { resolved: 'config' };
        RootMapParser.parse.mockReturnValue(mockResult);

        const options = { rootMap: {}, namespace: globalThis, module: 'test' };
        const result = Helpers.parseRootMap(options);

        expect(RootMapParser.parse).toHaveBeenCalledWith(options);
        expect(result).toBe(mockResult);
      });
    });

    describe('formatError', () => {
      it('should delegate to formatError with correct parameters', () => {
        const mockFormatted = 'Formatted error message';
        formatError.mockReturnValue(mockFormatted);

        const error = new Error('Test error');
        const options = { includeStack: true };
        const result = Helpers.formatError(error, options);

        expect(formatError).toHaveBeenCalledWith(error, options);
        expect(result).toBe(mockFormatted);
      });

      it('should work with default options', () => {
        const mockFormatted = 'Formatted error message';
        formatError.mockReturnValue(mockFormatted);

        const error = new Error('Test error');
        const result = Helpers.formatError(error);

        expect(formatError).toHaveBeenCalledWith(error, {});
        expect(result).toBe(mockFormatted);
      });
    });
  });

  describe('Workflow Methods', () => {
    describe('resolveModuleConfiguration', () => {
      it('should successfully resolve module configuration', () => {
        const mockModule = { id: 'test-module', title: 'Test Module', active: true };
        const mockConfig = { game: 'resolved game object' };

        getModule.mockReturnValue(mockModule);
        RootMapParser.parse.mockReturnValue(mockConfig);

        const options = {
          rootMap: { game: 'game', module: 'module' },
          moduleId: 'test-module',
          namespace: globalThis
        };

        const result = Helpers.resolveModuleConfiguration(options);

        expect(getModule).toHaveBeenCalledWith('test-module', globalThis);
        expect(RootMapParser.parse).toHaveBeenCalledWith({
          rootMap: options.rootMap,
          namespace: globalThis,
          module: 'test-module'
        });

        expect(result).toEqual({
          module: mockModule,
          resolvedConfig: mockConfig,
          success: true,
          error: null
        });
      });

      it('should handle missing module', () => {
        getModule.mockReturnValue(null);

        const options = {
          rootMap: { game: 'game' },
          moduleId: 'missing-module',
          namespace: globalThis
        };

        const result = Helpers.resolveModuleConfiguration(options);

        expect(result).toEqual({
          module: null,
          resolvedConfig: null,
          success: false,
          error: 'Module "missing-module" not found in namespace'
        });
      });

      it('should handle RootMapParser errors', () => {
        const mockModule = { id: 'test-module' };
        const parseError = new Error('Parse failed');

        getModule.mockReturnValue(mockModule);
        RootMapParser.parse.mockImplementation(() => {
          throw parseError;
        });
        formatError.mockReturnValue('Formatted parse error');

        const options = {
          rootMap: { invalid: 'config' },
          moduleId: 'test-module',
          namespace: globalThis
        };

        const result = Helpers.resolveModuleConfiguration(options);

        expect(formatError).toHaveBeenCalledWith(parseError);
        expect(result).toEqual({
          module: null,
          resolvedConfig: null,
          success: false,
          error: 'Formatted parse error'
        });
      });

      it('should use default namespace', () => {
        const mockModule = { id: 'test-module' };
        const mockConfig = { resolved: 'config' };

        getModule.mockReturnValue(mockModule);
        RootMapParser.parse.mockReturnValue(mockConfig);

        const options = {
          rootMap: { game: 'game' },
          moduleId: 'test-module'
          // namespace omitted
        };

        Helpers.resolveModuleConfiguration(options);

        expect(getModule).toHaveBeenCalledWith('test-module', globalThis);
        expect(RootMapParser.parse).toHaveBeenCalledWith({
          rootMap: options.rootMap,
          namespace: globalThis,
          module: 'test-module'
        });
      });
    });

    describe('validateFoundryEnvironment', () => {
      beforeEach(() => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          const validPaths = {
            'game': { test: 'game object' },
            'game.user': { id: 'user123' },
            'ui': { test: 'ui object' },
            'canvas': { ready: true }
          };
          return validPaths[path];
        });
      });

      it('should validate all required paths successfully', () => {
        const result = Helpers.validateFoundryEnvironment(globalThis, ['game', 'ui']);

        expect(result).toEqual({
          isValid: true,
          resolvedPaths: {
            'game': { test: 'game object' },
            'ui': { test: 'ui object' }
          },
          missingPaths: [],
          namespace: globalThis,
          summary: {
            total: 2,
            resolved: 2,
            missing: 0
          }
        });
      });

      it('should handle missing paths', () => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          if (path === 'game') return { test: 'game object' };
          return undefined; // Missing path
        });

        const result = Helpers.validateFoundryEnvironment(globalThis, ['game', 'missing.path']);

        expect(result).toEqual({
          isValid: false,
          resolvedPaths: {
            'game': { test: 'game object' }
          },
          missingPaths: ['missing.path'],
          namespace: globalThis,
          summary: {
            total: 2,
            resolved: 1,
            missing: 1
          }
        });
      });

      it('should handle path resolution errors', () => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          if (path === 'game') return { test: 'game object' };
          if (path === 'error.path') throw new Error('Resolution failed');
          return undefined;
        });

        const result = Helpers.validateFoundryEnvironment(globalThis, ['game', 'error.path']);

        expect(result).toEqual({
          isValid: false,
          resolvedPaths: {
            'game': { test: 'game object' }
          },
          missingPaths: ['error.path'],
          namespace: globalThis,
          summary: {
            total: 2,
            resolved: 1,
            missing: 1
          }
        });
      });

      it('should use default namespace and paths', () => {
        const result = Helpers.validateFoundryEnvironment();

        expect(PathUtils.resolvePath).toHaveBeenCalledWith(globalThis, 'game');
        expect(PathUtils.resolvePath).toHaveBeenCalledWith(globalThis, 'ui');
        expect(result.namespace).toBe(globalThis);
      });
    });

    describe('batchResolvePaths', () => {
      beforeEach(() => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          const validPaths = {
            'game.user': { id: 'user123' },
            'game.settings': { volume: 0.8 },
            'ui.notifications': { info: jest.fn() }
          };
          return validPaths[path];
        });
      });

      it('should resolve array of paths successfully', () => {
        const paths = ['game.user', 'game.settings'];
        const result = Helpers.batchResolvePaths(globalThis, paths);

        expect(result).toEqual({
          resolved: {
            'game.user': { id: 'user123' },
            'game.settings': { volume: 0.8 }
          },
          failed: {},
          errors: [],
          success: true,
          summary: {
            total: 2,
            resolved: 2,
            failed: 0
          }
        });
      });

      it('should resolve object of path aliases', () => {
        const paths = {
          currentUser: 'game.user',
          gameSettings: 'game.settings'
        };
        const result = Helpers.batchResolvePaths(globalThis, paths);

        expect(result).toEqual({
          resolved: {
            currentUser: { id: 'user123' },
            gameSettings: { volume: 0.8 }
          },
          failed: {},
          errors: [],
          success: true,
          summary: {
            total: 2,
            resolved: 2,
            failed: 0
          }
        });
      });

      it('should handle missing paths', () => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          if (path === 'game.user') return { id: 'user123' };
          return undefined; // Missing
        });

        const paths = ['game.user', 'missing.path'];
        const result = Helpers.batchResolvePaths(globalThis, paths);

        expect(result).toEqual({
          resolved: {
            'game.user': { id: 'user123' }
          },
          failed: {
            'missing.path': 'missing.path'
          },
          errors: ['Path "missing.path" could not be resolved'],
          success: false,
          summary: {
            total: 2,
            resolved: 1,
            failed: 1
          }
        });
      });

      it('should handle resolution errors', () => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          if (path === 'game.user') return { id: 'user123' };
          if (path === 'error.path') throw new Error('Resolution failed');
          return undefined;
        });
        formatError.mockReturnValue('Formatted error');

        const paths = ['game.user', 'error.path'];
        const result = Helpers.batchResolvePaths(globalThis, paths, { continueOnError: true });

        expect(formatError).toHaveBeenCalledWith(expect.any(Error));
        expect(result).toEqual({
          resolved: {
            'game.user': { id: 'user123' }
          },
          failed: {
            'error.path': 'error.path'
          },
          errors: ['Error resolving path "error.path": Formatted error'],
          success: false,
          summary: {
            total: 2,
            resolved: 1,
            failed: 1
          }
        });
      });

      it('should stop on first error when continueOnError is false', () => {
        PathUtils.resolvePath.mockImplementation((namespace, path) => {
          if (path === 'error.path') throw new Error('Resolution failed');
          return { resolved: 'value' };
        });
        formatError.mockReturnValue('Formatted error');

        const paths = ['error.path', 'game.user'];
        const result = Helpers.batchResolvePaths(globalThis, paths, { continueOnError: false });

        expect(result.resolved).toEqual({});
        expect(result.failed).toEqual({
          'error.path': 'error.path'
        });
        expect(result.errors).toHaveLength(1);
        expect(PathUtils.resolvePath).toHaveBeenCalledTimes(1); // Should stop after first error
      });

      it('should respect useGetterFallback option', () => {
        PathUtils.resolvePath.mockReturnValue({ test: 'value' });

        const paths = ['test.path'];
        Helpers.batchResolvePaths(globalThis, paths, { useGetterFallback: false });

        expect(PathUtils.resolvePath).toHaveBeenCalledWith(globalThis, 'test.path', false);
      });
    });
  });
});
