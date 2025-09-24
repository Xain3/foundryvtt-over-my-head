import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import OverMyHead from './overMyHead.mjs';
import * as mainModule from './main.mjs';

vi.mock('./overMyHead.mjs');

describe('main entrypoint', () => {
  beforeEach(() => {
    OverMyHead.mockClear();
  });

  it('creates OverMyHead and calls enableDevFeatures and init', () => {
    const mockEnable = vi.fn();
    const mockInit = vi.fn();

    OverMyHead.mockImplementation(() => ({ enableDevFeatures: mockEnable, init: mockInit }));

    // Import the actual main module after mocking OverMyHead so its top-level main() runs
    jest.isolateModules(() => {
      require('./main.mjs');
    });

    expect(OverMyHead).toHaveBeenCalledTimes(1);
    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
