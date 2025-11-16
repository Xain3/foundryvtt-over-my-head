/**
 * @file errorFormatter-sideEffects.unit.test.mjs
 * @description Regression tests ensuring formatError() has no global side effects.
 * @path tests/unit/errorFormatter-sideEffects.unit.test.mjs
 */

import { describe, expect, it } from 'vitest';

import { formatError } from '#/utils/errorFormatter';
import { config } from '#/config/config.ts';
import StaticUtils from '#/utils/static.ts';

describe('formatError – Side Effects', () => {
  it('does not override console methods', () => {
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      log: console.log,
      debug: console.debug,
    };

    expect(() => formatError('Side effect probe')).not.toThrow();

    expect(console.error).toBe(originalConsole.error);
    expect(console.warn).toBe(originalConsole.warn);
    expect(console.info).toBe(originalConsole.info);
    expect(console.log).toBe(originalConsole.log);
    expect(console.debug).toBe(originalConsole.debug);
  });

  it('does not mutate config constants', () => {
    const constantsBefore = JSON.stringify(config.constants);

    formatError('Validate config immutability');

    expect(JSON.stringify(config.constants)).toBe(constantsBefore);
  });

  it('does not mutate StaticUtils export surface', () => {
    const keysBefore = Object.getOwnPropertyNames(StaticUtils);

    formatError('Static utils stability');

    const keysAfter = Object.getOwnPropertyNames(StaticUtils);
    expect(keysAfter).toEqual(keysBefore);
  });
});
