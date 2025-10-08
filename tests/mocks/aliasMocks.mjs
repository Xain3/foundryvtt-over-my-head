/**
 * @file aliasMocks.mjs
 * @description Shared Vitest alias mocks to support modules relying on Vite-specific path aliases.
 * @path tests/mocks/aliasMocks.mjs
 */

import { vi } from 'vitest';

function loadModule(relativePath) {
	const moduleUrl = new URL(relativePath, import.meta.url);
	return async () => await import(moduleUrl.href);
}

vi.mock('#utils/static/validator.mjs', loadModule('../../src/utils/static/validator.mjs'));
vi.mock('#helpers/pathUtils.mjs', loadModule('../../src/helpers/pathUtils.mjs'));
vi.mock('#config', loadModule('../../src/config/config.mjs'));
vi.mock('#constants', loadModule('../../src/config/constants.mjs'));
vi.mock('#manifest', loadModule('../../src/config/manifest.mjs'));
