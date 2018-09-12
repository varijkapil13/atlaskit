// @flow
const path = require('path');
const buildIcons = require('@atlaskit/icon-build-process');
const pkgDir = require('pkg-dir');

const root = pkgDir.sync();

const config = {
  // Relative to this directory
  srcDir: path.resolve(root, 'utils/raw_svgs'),
  processedDir: path.resolve(root, 'svgs'),
  destDir: path.resolve(root, 'glyph'),
};

buildIcons(config).then(icons => {
  console.log('implement create icons docs here');
});
