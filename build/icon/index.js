// @flow
const babel = require('babel-core');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

/*::
type Config = {
  // Relative to this directory
  srcDir: string,
  processedDir: string,
  destDir: string,
};
*/

module.exports = function(providedConfig /*: Config */) {
  const config = {
    ...providedConfig,
    maxWidth: 24,
    maxHeight: 24,
  };

  const cleanSVG = require('./svgo/clean')(config);
  const customiseSVG = require('./svgo/customise')();
  const glyphTemplate = require('./glyph.template');
  // const createIconsDocs = require('./createIconsDocs');
  const tsTemplate = require('./typescript.template');

  console.log('Processing icon glyphs.');

  // Ensure the destination directory exists and empty it
  return (
    fs
      .emptyDir(config.processedDir)
      .then(() => fs.emptyDir(config.destDir))
      // Read the contents of the source directory
      .then(() => glob.sync('**/*.svg', { cwd: config.srcDir }))
      // Map over all the files
      .then(files =>
        Promise.all(
          files.map(filepath => {
            const wayHome = filepath
              .split('/')
              .map(a => '..')
              .concat('es5/index')
              .join('/');
            const fileKey = filepath.replace(/\.svg$/, '');
            const displayName = fileKey
              .split(/\W/)
              .map(part => `${part[0].toUpperCase()}${part.slice(1)}`)
              .join('')
              .concat('Icon');

            // Read the contents of the SVG file
            return (
              fs
                .readFile(path.join(config.srcDir, filepath))
                // Optimise the SVG
                .then(rawSVG => cleanSVG(filepath, rawSVG))
                .then(({ data: optimisedSVG }) => {
                  // saved the optimised SVGs to disk for reduced-ui-pack
                  return (
                    fs
                      .outputFile(
                        path.join(config.processedDir, filepath),
                        optimisedSVG,
                      )
                      // customise the SVG to make it JSX ready
                      .then(() => customiseSVG(filepath, optimisedSVG))

                      // wrap the optimised SVGs in the JS module
                      .then(({ data: customisedSVG }) =>
                        glyphTemplate(customisedSVG, displayName, wayHome),
                      )
                  );
                })
                // Transpile the component code
                .then(componentCode =>
                  babel.transform(componentCode, {
                    presets: ['env', 'react'],
                  }),
                )
                // Write the component file
                .then(({ code }) =>
                  fs.outputFile(
                    path.join(config.destDir, `${fileKey}.js`),
                    code,
                  ),
                )
                // Write the TypeScript file
                .then(() =>
                  fs.outputFile(
                    path.join(config.destDir, `${fileKey}.d.ts`),
                    tsTemplate,
                  ),
                )
                // Return the filename and display name
                .then(() => ({ fileKey, displayName }))
                .catch(err => console.error(err))
            );
          }),
        ),
      )
      // Generate icon documentation data
      .then(icons => {
        console.log('\n 📦  Icons sorted.');
        // const iconDocs = createIconsDocs(icons);
        // return fs.outputFile('./utils/icons.js', iconDocs);
        return icons;
      })
      .catch(err => console.error(err))
  );
};
