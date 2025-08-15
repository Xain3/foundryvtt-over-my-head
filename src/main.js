import OverMyHead from './overMyHead.js';

function main() {
  const omh = new OverMyHead();
  omh.enableDevFeatures(); // If dev flag is enabled in the manifest
  omh.init();
}

main();