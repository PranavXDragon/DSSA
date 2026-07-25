const fs = require('fs');
const file = 'a:/ready/landing page/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

const badStr = '(_this.layers.logo.scale.setScalar(window.ACTIVE_THEORY_CONFIG && window.ACTIVE_THEORY_CONFIG.logoScale || 2.1), _this.layers.logo.position.y)=Math.range(';
const goodStr = '_this.layers.logo.position.y=(_this.layers.logo.scale.set(window.ACTIVE_THEORY_CONFIG?.logoScale||2.1,window.ACTIVE_THEORY_CONFIG?.logoScale||2.1,window.ACTIVE_THEORY_CONFIG?.logoScale||2.1), Math.range(';

if (data.includes(badStr)) {
    data = data.replace(badStr, goodStr);
    fs.writeFileSync(file, data);
    console.log('Fixed syntax error!');
} else {
    console.log('Bad string not found!');
}
