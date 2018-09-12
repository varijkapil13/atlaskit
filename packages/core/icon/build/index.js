// @flow
const path = require('path');
const buildIcons = require('@atlaskit/icon-build-process');

const config = {
  // Relative to this directory
  srcDir: path.resolve('../utils/raw_svgs'),
  processedDir: path.resolve('../svgs'),
  destDir: path.resolve('../glyph'),
};

buildIcons(config).then(icons => {
  console.log('implement create icons docs here');
});
