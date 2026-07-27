const fs = require('fs');
const file = 'public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
    'return void window.location.replace(window._UNSUPPORTED_PAGE_);',
    'return console.warn("Bypassed UnsupportedRedirect");'
);

// We should also patch out any other overlay logic for unsupported if it exists
data = data.replace('showUnsupported()', 'console.warn("Bypassed showUnsupported")');

fs.writeFileSync(file, data);
console.log('Successfully patched app.1746999829739.js');
