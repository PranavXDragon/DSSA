const fs = require('fs');
const file = 'a:/ready/landing page/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

// The original line starts with: _this.layers.logo.position.y=Math.range(
// We will replace it to also scale the logo before positioning it.
const searchStr = '_this.layers.logo.position.y=Math.range(';
const replacementStr = '(_this.layers.logo.scale.setScalar(window.ACTIVE_THEORY_CONFIG && window.ACTIVE_THEORY_CONFIG.logoScale || 2.1), _this.layers.logo.position.y)=Math.range(';

// If we haven't already patched it:
if (data.includes(searchStr) && !data.includes('setScalar(window.ACTIVE_THEORY_CONFIG')) {
    data = data.replace(searchStr, replacementStr);
    fs.writeFileSync(file, data);
    console.log('Successfully injected scale hook into app.js');
} else {
    console.log('Hook already exists or could not find the target string');
}
