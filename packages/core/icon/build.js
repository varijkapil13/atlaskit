// @flow
const path = require('path');

const config = {
  // Relative to this directory
  srcDir: path.resolve('../utils/raw_svgs'),
  processedDir: path.resolve('../svgs'),
  destDir: path.resolve('../glyph'),
};

const buildIcons = require('@atlaskit/icon-build-process');

buildIcons(config);
