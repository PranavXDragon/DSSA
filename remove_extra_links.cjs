const fs = require('fs');
const file = 'a:/ready/activetheory/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

// Remove "Privacy Notice" and "Newsletter Signup" text
data = data.replace(/"Privacy Notice"/g, '" "');
data = data.replace(/"Newsletter Signup"/g, '" "');

fs.writeFileSync(file, data);
console.log('Successfully removed Privacy Notice and Newsletter Signup!');
