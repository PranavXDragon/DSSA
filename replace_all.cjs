const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      // Don't recurse into node_modules or .git
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  // Only process text files
  if (['.js', '.html', '.json', '.css', '.md', '.tsx', '.ts', '.svg', '.fs', '.vs'].includes(ext) || filePath.endsWith('index.html')) {
    try {
      let data = fs.readFileSync(filePath, 'utf8');
      if (data.includes('Active Theory')) {
        data = data.replace(/Active Theory \· Creative Digital Experiences/g, 'dssa');
        data = data.replace(/Active Theory/g, 'dssa');
        fs.writeFileSync(filePath, data);
        console.log('Replaced in:', filePath);
      }
    } catch (e) {
      // Ignore files that can't be read as utf8 (e.g. binary disguised as .js if any)
    }
  }
}

// Start replacing
console.log('Starting global replace...');
replaceInFile(path.join(__dirname, 'index.html'));
walkDir(path.join(__dirname, 'public'), replaceInFile);
walkDir(path.join(__dirname, 'src'), replaceInFile);
console.log('Done!');
