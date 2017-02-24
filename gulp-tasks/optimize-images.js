const path = require('path');
const superagent = require('superagent');
const fs = require('fs-extra');
const glob = require('glob');

const root = path.resolve(process.cwd(), 'images');
const optimizedImagesRoot = path.resolve(process.cwd(), 'images-optimized');
const imageOptions = {
  merchandise: '450,scale-down'
};

const optimizeImages = () =>
  new Promise(resolveTask => {
    glob('images/**/*.{jpg,png,svg}', (err, files) => {
      const promises = [];

      for (const file of files) {
        promises.push(new Promise(resolveFile => {
          const relativeFile = file.substring(file.indexOf('/') + 1);
          fs.ensureDirSync(path.resolve(optimizedImagesRoot, path.dirname(relativeFile)));
          if (path.extname(file) === '.svg') {
            fs.copySync(file, path.resolve(optimizedImagesRoot, relativeFile));
            resolveFile();
          } else {
            const imageCategory = path.relative(root, file).split('/')[0];
            const options = imageOptions[imageCategory] || 'full';
            superagent.post(`https://im2.io/nddfzrzzpk/${options}`)
            .attach('file', file)
            .end((err, res) =>  {
              console.log(`Finished optimizing ${file}`);
              fs.writeFileSync(path.resolve(optimizedImagesRoot, relativeFile), res.body);
              resolveFile();
            });
          }
        }));
      }

      Promise.all(promises).then(resolveTask);
    });
  });

const ensureOptimizeImages = () =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(optimizedImagesRoot)) {
      reject('`images-optimized` does not exist. Make sure to run `yarn run build optimize-images`');
    } else {
      resolve();
    }
  });

module.exports = {
  optimizeImages,
  ensureOptimizeImages
};
