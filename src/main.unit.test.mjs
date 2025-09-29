import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

const { mockEnableDevFeatures, mockInit, OverMyHeadMock } = vi.hoisted(() => {
  const enableSpy = vi.fn();
  const initSpy = vi.fn();
  const ctorSpy = vi.fn(() => ({
    enableDevFeatures: enableSpy,
    init: initSpy
  }));

  return {
    mockEnableDevFeatures: enableSpy,
    mockInit: initSpy,
    OverMyHeadMock: ctorSpy
  };
});

vi.mock('./overMyHead.mjs', () => ({
  default: OverMyHeadMock
}));

import OverMyHead from './overMyHead.mjs';

describe('main entrypoint', () => {
  beforeEach(() => {
    mockEnableDevFeatures.mockReset();
    mockInit.mockReset();
    OverMyHeadMock.mockReset();
    OverMyHeadMock.mockImplementation(() => ({
      enableDevFeatures: mockEnableDevFeatures,
      init: mockInit
    }));
    vi.resetModules();
  });

  it('creates OverMyHead and calls enableDevFeatures and init', async () => {
    // Dynamically import the main module to trigger its top-level execution after mocking
    await import('./main.mjs');

    expect(OverMyHead).toBe(OverMyHeadMock);
    expect(OverMyHeadMock).toHaveBeenCalledTimes(1);
    expect(mockEnableDevFeatures).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
