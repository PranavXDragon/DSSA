const fs = require('fs');
const file = 'a:/ready/activetheory/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

// 1. Remove Email string (globally)
data = data.replace(/"HELLO@ACTIVETHEORY\.NET"/g, '" "');

// 2. Remove QR Text string
data = data.replace('"[ MOBILE SYNC ]"', '" "');

// 3. Hide QR Code Image
data = data.replace('_this.qrcode.glui.alpha=1', '_this.qrcode.glui.alpha=0');

// 4. Disable Social Media Links (keep placeholder)
data = data.replace('_this.ig.interact(hover,(_=>window.open("https://www.instagram.com/activetheory","_blank")),"#","Instagram")', '/*ig*/');
data = data.replace('_this.in.interact(hover,(_=>window.open("https://www.linkedin.com/company/active-theory/","_blank")),"#","LinkedIn")', '/*in*/');
data = data.replace('_this.tw.interact(hover,(_=>window.open("https://twitter.com/active_theory","_blank")),"#","Twitter")', '/*tw*/');

// 5. Check if it actually worked
if (!data.includes('HELLO@ACTIVETHEORY.NET') && !data.includes('[ MOBILE SYNC ]')) {
    fs.writeFileSync(file, data);
    console.log('Successfully updated contact info!');
} else {
    console.error('Failed to replace contact info');
}
