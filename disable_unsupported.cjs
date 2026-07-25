const fs = require('fs');
const file = 'a:/ready/landing page/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

// Bypass the unsupported redirect
data = data.replace(
    'return void window.location.replace(window._UNSUPPORTED_PAGE_);',
    'return console.warn("Bypassed UnsupportedRedirect");'
);

fs.writeFileSync(file, data);
console.log('Disabled unsupported page redirect!');
