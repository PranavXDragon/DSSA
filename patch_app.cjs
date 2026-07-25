const fs = require('fs');
const file = 'public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/2\.1,2\.1,2\.1/g, '(window.ACTIVE_THEORY_CONFIG?.logoScale||2.1),(window.ACTIVE_THEORY_CONFIG?.logoScale||2.1),(window.ACTIVE_THEORY_CONFIG?.logoScale||2.1)');
fs.writeFileSync(file, data);
console.log("Patched app.js successfully!");
