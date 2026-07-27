const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public/assets/js/app.1746999829739.js');
let data = fs.readFileSync(file, 'utf8');

const targetRedirect = 'return void window.location.replace(window._UNSUPPORTED_PAGE_);';
const patchedRedirect = 'return console.warn("Bypassed UnsupportedRedirect");';
if (!data.includes(targetRedirect) && !data.includes(patchedRedirect)) {
    throw new Error(`Expected pattern not found in asset: ${targetRedirect}`);
}
if (data.includes(targetRedirect)) {
    data = data.replace(
        targetRedirect,
        patchedRedirect
    );
}

const targetShow = 'showUnsupported()';
if (data.includes(targetShow)) {
    data = data.replace(targetShow, 'console.warn("Bypassed showUnsupported")');
}

fs.writeFileSync(file, data);
console.log('Successfully patched app.1746999829739.js');
