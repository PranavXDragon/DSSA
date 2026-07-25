const fs = require('fs');
const data = fs.readFileSync('a:/ready/activetheory/public/assets/js/app.1746999829739.js', 'utf8');
const idx = data.indexOf('_this.qrcode&&_this.qrcode');
console.log(data.substring(idx, idx + 400));
