import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import OverMyHead from './overMyHead.mjs';

vi.mock('./overMyHead.mjs');

describe('main entrypoint', () => {
  beforeEach(() => {
    OverMyHead.mockClear();
  });

  it('creates OverMyHead and calls enableDevFeatures and init', async () => {
    const mockEnable = vi.fn();
    const mockInit = vi.fn();

    OverMyHead.mockImplementation(() => ({ enableDevFeatures: mockEnable, init: mockInit }));

    // Dynamically import the main module to trigger its top-level execution after mocking
    await import('./main.mjs');

    expect(OverMyHead).toHaveBeenCalledTimes(1);
    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
