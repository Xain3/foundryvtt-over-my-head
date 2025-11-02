/**
 * @file moduleNameResolver.unit.test.mjs
 * @description Unit tests for the module name resolver utility.
 * @path tests/unit/moduleNameResolver.unit.test.mjs
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';

describe('moduleNameResolver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns module id by default', () => {
    const result = resolveModuleName({
      module: {
        id: 'omh-module',
        title: 'Over My Head',
      },
    });

    expect(result).toBe('omh-module');
  });

  it('returns module title when referToModuleBy is title', () => {
    const result = resolveModuleName({
      moduleManagement: {
        referToModuleBy: 'title',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
      },
    });

    expect(result).toBe('Over My Head');
  });

  it('falls back to module id and warns when shortName is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = resolveModuleName({
      moduleManagement: {
        referToModuleBy: 'shortName',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
      },
    });

    expect(result).toBe('omh-module');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("referToModuleBy='shortName'");
  });

  it('warns and falls back to id when strategy is unknown', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = resolveModuleName({
      moduleManagement: {
        referToModuleBy: 'customStrategy',
      },
      module: {
        id: 'omh-module',
        title: 'Over My Head',
      },
    });

    expect(result).toBe('omh-module');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain(
      'Unknown referToModuleBy strategy'
    );
  });

  it('returns generic placeholder when module data is missing', () => {
    const result = resolveModuleName();

    expect(result).toBe('Unknown Module');
  });
});
