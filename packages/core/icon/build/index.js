// @flow
const path = require('path');
const buildIcons = require('@atlaskit/icon-build-process');
const pkgDir = require('pkg-dir');
const fs = require('fs-extra');
const createIconsDocs = require('./createIconsDocs');

const root = pkgDir.sync();

const config = {
  // Relative to this directory
  srcDir: path.resolve(root, 'svgs_raw'),
  processedDir: path.resolve(root, 'svgs'),
  destDir: path.resolve(root, 'glyph'),
};

buildIcons(config).then(icons => {
  const iconDocs = createIconsDocs(icons);
  return fs.outputFile(path.resolve(root, 'utils/icons.js'), iconDocs);
});
