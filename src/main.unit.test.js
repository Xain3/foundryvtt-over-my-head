import OverMyHead from './overMyHead.js';
import * as mainModule from './main.js';

jest.mock('./overMyHead.js');

describe('main entrypoint', () => {
  beforeEach(() => {
    OverMyHead.mockClear();
  });

  it('creates OverMyHead and calls enableDevFeatures and init', () => {
    const mockEnable = jest.fn();
    const mockInit = jest.fn();

    OverMyHead.mockImplementation(() => ({ enableDevFeatures: mockEnable, init: mockInit }));

    // Import the actual main module after mocking OverMyHead so its top-level main() runs
    jest.isolateModules(() => {
      require('./main.js');
    });

    expect(OverMyHead).toHaveBeenCalledTimes(1);
    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
