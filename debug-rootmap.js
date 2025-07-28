import constants from './src/constants/constants.js';
import RootMapParser from './src/helpers/rootMapParser.js';

console.log('External config rootMap:', JSON.stringify(constants.context?.external?.rootMap, null, 2));

try {
  const result = RootMapParser.parse({
    rootMap: constants.context.external.rootMap,
    key: 'local',
  });
  console.log('local parsed successfully:', result);
} catch (error) {
  console.error('local parsing failed:', error.message);
}

try {
  const result = RootMapParser.parse({
    rootMap: constants.context.external.rootMap,
    key: 'session',
  });
  console.log('session parsed successfully:', result);
} catch (error) {
  console.error('session parsing failed:', error.message);
}
