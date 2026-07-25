const fs = require('fs');
const data = fs.readFileSync('a:/ready/landing page/public/assets/js/app.1746999829739.js', 'utf8');
const idx = data.indexOf('MobileSync');
console.log(data.substring(idx, idx + 400));
