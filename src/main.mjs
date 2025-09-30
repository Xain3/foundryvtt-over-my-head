import OverMyHead from './overMyHead.mjs';

function main() {
  const omh = new OverMyHead();
  omh.enableDevFeatures(); // If dev flag is enabled in the manifest
  omh.init();
}

main();