const fs = require('fs');
const file = 'a:/ready/landing page/public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');

const regex = /let url=location\.href;.*?let qrCode=await QRGen\.create\(url,_params\.size\);/;
const newCode = 'let url = window.CMS_MOBILE_URL ? window.CMS_MOBILE_URL : location.href; if(!window.CMS_MOBILE_URL) { url=url.split("#")[0],url+=url.includes("?")?"&":"?",url+=`roomqr=${encodeURIComponent(_params.key)}`;const items=await _this.get("WorkItems/items"),ids=[];items.toJSON().forEach((item=>ids.push(item.index))),url+=`&workids=${encodeURIComponent(ids.join(","))}` } let qrCode=await QRGen.create(url,_params.size);';

if (regex.test(data)) {
    data = data.replace(regex, newCode);
    fs.writeFileSync(file, data);
    console.log('Successfully made Mobile Sync URL editable! Set window.CMS_MOBILE_URL to override the QR code destination.');
} else {
    console.log('Regex did not match or already replaced.');
}
