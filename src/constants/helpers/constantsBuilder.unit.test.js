import ConstantsBuilder from './constantsBuilder';
import ConstantsGetter from '@/constants/helpers/constantsGetter';
import ConstantsParser from '@/constants/helpers/constantsParser';

jest.mock('@/constants/helpers/constantsGetter');
jest.mock('@/constants/helpers/constantsParser');

describe('ConstantsBuilder', () => {
  const mockYamlString = 'foo: bar\nbaz: 42';
  const mockParsedObject = { foo: 'bar', baz: 42 };

  beforeEach(() => {
    ConstantsGetter.getConstantsYaml.mockReturnValue(mockYamlString);
    ConstantsParser.parseConstants.mockReturnValue(mockParsedObject);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls ConstantsGetter.getConstantsYaml and ConstantsParser.parseConstants in constructor', () => {
    new ConstantsBuilder();
    expect(ConstantsGetter.getConstantsYaml).toHaveBeenCalledTimes(1);
    expect(ConstantsParser.parseConstants).toHaveBeenCalledWith(mockYamlString);
  });

  it('returns the YAML string via asString getter', () => {
    const builder = new ConstantsBuilder();
    expect(builder.asString).toBe(mockYamlString);
  });

  it('returns the parsed object via asObject getter', () => {
    const builder = new ConstantsBuilder();
    expect(builder.asObject).toBe(mockParsedObject);
  });

  it('caches the YAML string and parsed object', () => {
    const builder = new ConstantsBuilder();
    // Access multiple times to ensure no extra calls
    expect(builder.asString).toBe(mockYamlString);
    expect(builder.asObject).toBe(mockParsedObject);
    expect(ConstantsGetter.getConstantsYaml).toHaveBeenCalledTimes(1);
    expect(ConstantsParser.parseConstants).toHaveBeenCalledTimes(1);
  });
});