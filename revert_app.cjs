const fs = require('fs');
const file = 'a:/ready/landing page/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

const str1 = '(_this.layers.logo.scale.setScalar(window.ACTIVE_THEORY_CONFIG && window.ACTIVE_THEORY_CONFIG.logoScale || 2.1), _this.layers.logo.position.y)=Math.range(';
const str2 = '_this.layers.logo.position.y=(_this.layers.logo.scale.set(window.ACTIVE_THEORY_CONFIG?.logoScale||2.1,window.ACTIVE_THEORY_CONFIG?.logoScale||2.1,window.ACTIVE_THEORY_CONFIG?.logoScale||2.1), Math.range(';

if (data.includes(str1)) {
    data = data.replace(str1, '_this.layers.logo.position.y=Math.range(');
    fs.writeFileSync(file, data);
    console.log('Restored from syntax error version');
} else if (data.includes(str2)) {
    data = data.replace(str2, '_this.layers.logo.position.y=Math.range(');
    fs.writeFileSync(file, data);
    console.log('Restored from supposedly fixed version');
} else {
    console.log('Could not find either string in app.js');
}
